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

// Create database storage instance
let storage: DatabaseStorage;

try {
  storage = new DatabaseStorage();
  
  // Initialize session
  app.use(session({
    secret: process.env.SESSION_SECRET || 'ethervox-sms-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    },
    store: storage.sessionStore
  }));
  
  // Initialize Passport
  app.use(passport.initialize());
  app.use(passport.session());
  
  // Set up authentication
  setupAuth(app);
  
  console.log('Database connection successful');
} catch (error) {
  console.error('Database connection error:', error);
}

// Set up routes with our storage instance
registerRoutes(app, storage);

// Add error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ message: 'Internal Server Error' });
});

// Export the serverless handler
export const handler = serverless(app);