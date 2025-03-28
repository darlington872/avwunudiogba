import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage.js";
import { User as SelectUser } from "@shared/schema.js";
import { log } from "./vite.js";
import connectPgSimple from "connect-pg-simple";
import { neon } from "@neondatabase/serverless";
import createMemoryStore from "memorystore";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// Create a database connection for sessions
const dbUrl = process.env.DATABASE_URL;
// Make sure DATABASE_URL is set in the environment variables

export function setupAuth(app: Express) {
  let sessionStore;
  
  // Use the session store from storage
  sessionStore = storage.sessionStore;
  
  log(dbUrl 
    ? "Using session store from storage with Neon.tech connection" 
    : "Using session store from storage");

  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "ETHERDOXSHEFZYSMSSecret2024!",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
    store: sessionStore,
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        log(`Attempting login for username: ${username}`);
        const user = await storage.getUserByUsername(username);
        
        if (!user) {
          log(`Login failed: User not found - ${username}`);
          return done(null, false, { message: "Invalid username or password" });
        }
        
        if (!(await comparePasswords(password, user.password))) {
          log(`Login failed: Invalid password for ${username}`);
          return done(null, false, { message: "Invalid username or password" });
        }
        
        log(`Login successful for ${username}`);
        return done(null, user);
      } catch (error) {
        log(`Login error: ${error}`);
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => {
    log(`Serializing user: ${user.id}`);
    done(null, user.id);
  });
  
  passport.deserializeUser(async (id: number, done) => {
    try {
      log(`Deserializing user: ${id}`);
      const user = await storage.getUser(id);
      if (!user) {
        log(`Deserialization failed: User not found - ${id}`);
        return done(null, false);
      }
      done(null, user);
    } catch (error) {
      log(`Deserialization error: ${error}`);
      done(error);
    }
  });

  // Authentication routes
  app.post("/api/auth/register", async (req, res, next) => {
    try {
      log(`Registration attempt: ${req.body.username}`);
      
      // Check if username exists
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        log(`Registration failed: Username already taken - ${req.body.username}`);
        return res.status(400).json({ message: "Username already taken" });
      }

      // Check if email exists
      if (req.body.email) {
        const existingEmail = await storage.getUserByEmail(req.body.email);
        if (existingEmail) {
          log(`Registration failed: Email already taken - ${req.body.email}`);
          return res.status(400).json({ message: "Email already taken" });
        }
      }

      // Create new user with hashed password
      const hashedPassword = await hashPassword(req.body.password);
      const user = await storage.createUser({
        ...req.body,
        password: hashedPassword,
        walletBalance: 0,
        referralWalletBalance: 0, // Adding referral wallet balance
        referralCode: `REF${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        isAdmin: false, // Default to regular user
        kycStatus: "pending",
      });

      log(`User registered: ${user.username} (ID: ${user.id})`);
      
      // Login the user
      req.login(user, (err) => {
        if (err) {
          log(`Auto-login failed after registration: ${err}`);
          return next(err);
        }
        
        // Return success with user data (excluding password)
        const { password, ...userWithoutPassword } = user;
        res.status(201).json({ 
          message: "User registered successfully", 
          user: userWithoutPassword 
        });
      });
    } catch (error: any) {
      log(`Registration error: ${error.message}`);
      res.status(500).json({ message: "Registration failed", error: error.message });
    }
  });

  app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate("local", (err: Error, user: Express.User, info: any) => {
      if (err) {
        log(`Login error: ${err.message}`);
        return next(err);
      }
      
      if (!user) {
        log(`Login failed: ${info?.message || "Unknown reason"}`);
        return res.status(401).json({ message: info?.message || "Authentication failed" });
      }
      
      req.login(user, (loginErr) => {
        if (loginErr) {
          log(`Login session error: ${loginErr.message}`);
          return next(loginErr);
        }
        
        log(`User logged in: ${user.username} (ID: ${user.id})`);
        
        // Return success with user data (excluding password)
        const { password, ...userWithoutPassword } = user;
        return res.status(200).json({ 
          message: "Login successful", 
          user: userWithoutPassword 
        });
      });
    })(req, res, next);
  });

  app.post("/api/auth/logout", (req, res) => {
    const username = (req.user as any)?.username || "Unknown";
    req.logout((err) => {
      if (err) {
        log(`Logout error for ${username}: ${err.message}`);
        return res.status(500).json({ message: "Logout failed", error: err.message });
      }
      
      log(`User logged out: ${username}`);
      req.session.destroy((sessionErr) => {
        if (sessionErr) {
          log(`Session destruction error for ${username}: ${sessionErr.message}`);
        }
        res.status(200).json({ message: "Logged out successfully" });
      });
    });
  });

  app.get("/api/auth/session", (req, res) => {
    if (req.isAuthenticated()) {
      const { password, ...userWithoutPassword } = req.user as Express.User;
      log(`Session check: User is authenticated (ID: ${req.user.id})`);
      return res.status(200).json({ 
        authenticated: true, 
        user: userWithoutPassword 
      });
    }
    
    log("Session check: User is not authenticated");
    return res.status(401).json({ 
      authenticated: false, 
      message: "Not authenticated" 
    });
  });
}