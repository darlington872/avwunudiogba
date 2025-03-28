import express, { Request, Response, NextFunction } from 'express';
import serverless from 'serverless-http';
import cors from 'cors';
import { setupAuth } from '../../server/auth';
import { registerRoutes } from '../../server/routes';
import { DatabaseStorage } from '../../server/databaseStorage';
import session from 'express-session';
import passport from 'passport';
import 'dotenv/config';

// Initialize the app
const app = express();

// Configure middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
app.use(express.json());

// Create a memory store for sessions if database connection fails
import createMemoryStore from 'memorystore';
const MemoryStore = createMemoryStore(session);
let memorySessionStore = new MemoryStore({
  checkPeriod: 86400000 // prune expired entries every 24h
});

// Create database storage instance
let dbStorage: DatabaseStorage | null = null;

try {
  // Initialize database storage
  dbStorage = new DatabaseStorage();
  console.log('Database connection successful');
} catch (error) {
  console.error('Database connection error:', error);
  // Continue without database in case of error
}

// Initialize session with either database store or memory store
app.use(session({
  secret: process.env.SESSION_SECRET || 'ethervox-sms-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  },
  store: dbStorage ? dbStorage.sessionStore : memorySessionStore
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Set up authentication
setupAuth(app);

// Set up routes with our storage instance (or without if it failed)
registerRoutes(app, dbStorage);

// Add error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ message: 'Internal Server Error' });
});

// Export the serverless handler
export const handler = serverless(app);