import express, { type Request, Response } from "express";
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage.js";
import { 
  insertUserSchema, 
  insertPhoneNumberSchema, 
  insertOrderSchema, 
  insertPaymentSchema,
  insertKycSchema,
  insertActivitySchema,
  insertProductSchema,
  insertServiceSchema,
  insertCountrySchema,
  insertAiChatSchema
} from "../shared/schema.js";
import { setupAuth } from "./auth.js";
import { ZodError } from "zod";
import crypto from "crypto";
import { nanoid } from "nanoid";

declare global {
  namespace Express {
    interface Request {
      userId?: number;
      isAdmin?: boolean;
    }
  }
}

export async function registerRoutes(app: Express, customStorage: any = null): Promise<Server | Express> {
  const router = express.Router();
  const httpServer = createServer(app);
  
  // Use provided storage if available (for Netlify Functions)
  const storageToUse = customStorage !== null ? customStorage : storage;
  
  // Set up authentication with Passport
  setupAuth(app);
  
  // Health check endpoint for Koyeb
  router.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Authentication middleware using Passport.js
  const authenticate = (req: Request, res: Response, next: Function) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    // Add user info to request object for compatibility with existing code
    req.userId = req.user.id;
    req.isAdmin = req.user.isAdmin;
    
    next();
  };

  // Admin middleware
  const requireAdmin = (req: Request, res: Response, next: Function) => {
    if (!req.isAdmin) {
      return res.status(403).json({ message: "Admin privileges required" });
    }
    next();
  };

  // Error handling middleware
  const handleErrors = (fn: Function) => {
    return async (req: Request, res: Response, next: Function) => {
      try {
        await fn(req, res, next);
      } catch (error) {
        console.error("Error:", error);
        
        if (error instanceof ZodError) {
          return res.status(400).json({ 
            message: "Validation error", 
            errors: error.errors 
          });
        }
        
        res.status(500).json({ message: "Internal server error" });
      }
    };
  };

  // Authentication Routes
  router.post('/auth/register', handleErrors(async (req: Request, res: Response) => {
    const userData = insertUserSchema.parse(req.body);
    
    // Check if user with email already exists
    const existingEmail = await storageToUse.getUserByEmail(userData.email);
    if (existingEmail) {
      return res.status(400).json({ message: "Email already in use" });
    }
    
    // Check if username is taken
    const existingUsername = await storageToUse.getUserByUsername(userData.username);
    if (existingUsername) {
      return res.status(400).json({ message: "Username already taken" });
    }
    
    // Check if referral code is valid when provided
    if (userData.referredBy) {
      // Check if it's the admin code
      const adminCode = await storageToUse.getSetting("ADMIN_CODE");
      
      if (userData.referredBy !== adminCode) {
        const referrer = await storageToUse.getUserByReferralCode(userData.referredBy);
        if (!referrer) {
          return res.status(400).json({ message: "Invalid referral code" });
        }
      }
    }
    
    // Hash password in a real app
    // For demo, we'll just prefix it to simulate hashing
    userData.password = `hashed_${userData.password}`;
    
    const newUser = await storageToUse.createUser(userData);
    
    // Create a simple auth token
    const hash = crypto
      .createHash('sha256')
      .update(`${newUser.id}:${newUser.email}:${newUser.password.substring(0, 10)}`)
      .digest('hex')
      .substring(0, 10);
      
    const token = `${newUser.id}:${hash}`;
    
    // Create activity record
    await storageToUse.createActivity({
      userId: newUser.id,
      action: "User registration",
      status: "Completed"
    });
    
    // Don't return password in response
    const { password, ...userWithoutPassword } = newUser;
    
    res.status(201).json({ 
      message: "User registered successfully",
      user: userWithoutPassword,
      token
    });
  }));

  router.post('/auth/login', handleErrors(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    
    const user = await storageToUse.getUserByEmail(email);
    
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    // In a real app, use bcrypt to compare passwords
    // Here we'll just check our simulated hash
    if (user.password !== `hashed_${password}`) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    if (user.isBanned) {
      return res.status(403).json({ message: "Account has been banned" });
    }
    
    // Create a simple auth token
    const hash = crypto
      .createHash('sha256')
      .update(`${user.id}:${user.email}:${user.password.substring(0, 10)}`)
      .digest('hex')
      .substring(0, 10);
      
    const token = `${user.id}:${hash}`;
    
    // Create activity record
    await storageToUse.createActivity({
      userId: user.id,
      action: "User login",
      status: "Completed"
    });
    
    // Don't return password in response
    const { password: pwd, ...userWithoutPassword } = user;
    
    res.json({ 
      message: "Login successful",
      user: userWithoutPassword,
      token
    });
  }));

  // User Routes
  router.get('/user/profile', authenticate, handleErrors(async (req: Request, res: Response) => {
    const user = await storageToUse.getUser(req.userId!);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Don't return password in response
    const { password, ...userWithoutPassword } = user;
    
    res.json(userWithoutPassword);
  }));

  router.get('/user/activities', authenticate, handleErrors(async (req: Request, res: Response) => {
    const activities = await storageToUse.getUserActivities(req.userId!);
    res.json(activities);
  }));

  router.get('/user/referrals', authenticate, handleErrors(async (req: Request, res: Response) => {
    const user = await storageToUse.getUser(req.userId!);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const referrals = await storageToUse.getReferredUsers(user.referralCode);
    
    // Map referrals to remove sensitive information
    const sanitizedReferrals = referrals.map(referral => {
      const { password, ...userWithoutPassword } = referral;
      return userWithoutPassword;
    });
    
    res.json(sanitizedReferrals);
  }));

  // Phone Number Routes
  router.get('/phone-numbers', authenticate, handleErrors(async (req: Request, res: Response) => {
    const phoneNumbers = await storageToUse.getAvailablePhoneNumbers();
    res.json(phoneNumbers);
  }));

  // Order Routes
  router.post('/orders', authenticate, handleErrors(async (req: Request, res: Response) => {
    const orderData = insertOrderSchema.parse({
      ...req.body,
      userId: req.userId
    });
    
    const user = await storageToUse.getUser(req.userId!);
    const phoneNumber = await storageToUse.getPhoneNumber(orderData.phoneNumberId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    if (!phoneNumber) {
      return res.status(404).json({ message: "Phone number not found" });
    }
    
    if (!phoneNumber.isAvailable) {
      return res.status(400).json({ message: "Phone number is not available" });
    }
    
    // Check if it's a referral reward
    if (orderData.isReferralReward) {
      // Get referrals needed from settings
      const referralsNeededStr = await storageToUse.getSetting("REFERRALS_NEEDED") || "20";
      const referralsNeeded = parseInt(referralsNeededStr);
      
      if (user.referralCount < referralsNeeded) {
        return res.status(400).json({ 
          message: `Not enough referrals. Need ${referralsNeeded} referrals to claim a free number.`,
          current: user.referralCount,
          needed: referralsNeeded
        });
      }
      
      // Check if KYC is required for referral rewards
      const kycRequired = (await storageToUse.getSetting("KYC_REQUIRED_FOR_REFERRAL") || "true") === "true";
      
      if (kycRequired && user.kycStatus !== "approved") {
        return res.status(400).json({ message: "KYC verification required to claim referral rewards" });
      }
      
      // Deduct from referral count
      await storageToUse.updateUser(user.id, {
        referralCount: user.referralCount - referralsNeeded
      });
      
      // Create the order with 0 amount
      orderData.totalAmount = 0;
    } else {
      // Not a referral reward, check balance
      if (user.balance < phoneNumber.price) {
        return res.status(400).json({ 
          message: "Insufficient balance", 
          balance: user.balance,
          required: phoneNumber.price
        });
      }
      
      // Deduct from balance
      await storageToUse.updateUser(user.id, {
        balance: user.balance - phoneNumber.price
      });
      
      // Set the price from the phone number
      orderData.totalAmount = phoneNumber.price;
    }
    
    // Create the order
    const newOrder = await storageToUse.createOrder(orderData);
    
    // Create activity record
    await storageToUse.createActivity({
      userId: user.id,
      action: orderData.isReferralReward 
        ? "Claimed free number with referrals" 
        : "Purchased WhatsApp number",
      status: "Completed"
    });
    
    // Generate WhatsApp redirect URL with the number and a preformatted message
    const whatsappNumber = "+2347088501777"; // User requested WhatsApp number (formatted for URL)
    const message = `Hello, I just purchased a virtual number ${phoneNumber.number} from ETHERDOXSHEFZYSMS. Please process my order. My order ID is ${newOrder.id}.`;
    const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/\+/g, '').replace(/\s+/g, '')}?text=${encodeURIComponent(message)}`;
    
    // Return the order with WhatsApp redirect info
    res.status(201).json({
      ...newOrder,
      whatsappRedirect: {
        url: whatsappUrl,
        number: whatsappNumber,
        message: message
      }
    });
  }));

  router.get('/orders', authenticate, handleErrors(async (req: Request, res: Response) => {
    const orders = await storageToUse.getUserOrders(req.userId!);
    res.json(orders);
  }));

  router.get('/orders/:id', authenticate, handleErrors(async (req: Request, res: Response) => {
    const orderId = parseInt(req.params.id);
    const order = await storageToUse.getOrder(orderId);
    
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    
    // Only allow users to view their own orders unless admin
    if (order.userId !== req.userId && !req.isAdmin) {
      return res.status(403).json({ message: "Access denied" });
    }
    
    res.json(order);
  }));

  // Payment Routes
  router.post('/payments', authenticate, handleErrors(async (req: Request, res: Response) => {
    const paymentData = insertPaymentSchema.parse({
      ...req.body,
      userId: req.userId
    });
    
    const user = await storageToUse.getUser(req.userId!);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // For order payments, verify the order
    if (paymentData.orderId) {
      const order = await storageToUse.getOrder(paymentData.orderId);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      if (order.userId !== user.id) {
        return res.status(403).json({ message: "Order doesn't belong to user" });
      }
      
      if (order.status !== "pending") {
        return res.status(400).json({ message: "Order is not pending payment" });
      }
    }
    
    // Generate a reference for the payment
    paymentData.reference = `PAY-${nanoid(8)}`;
    
    // Create the payment
    const newPayment = await storageToUse.createPayment(paymentData);
    
    // Create activity record
    await storageToUse.createActivity({
      userId: user.id,
      action: paymentData.orderId 
        ? "Payment submitted for order" 
        : "Added funds to account",
      status: "Pending"
    });
    
    res.status(201).json(newPayment);
  }));

  router.get('/payments', authenticate, handleErrors(async (req: Request, res: Response) => {
    const payments = await storageToUse.getUserPayments(req.userId!);
    res.json(payments);
  }));

  // KYC Routes
  router.post('/kyc', authenticate, handleErrors(async (req: Request, res: Response) => {
    const kycData = insertKycSchema.parse({
      ...req.body,
      userId: req.userId
    });
    
    const user = await storageToUse.getUser(req.userId!);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Check if user already has submitted KYC
    const existingKyc = await storageToUse.getUserKyc(user.id);
    
    if (existingKyc) {
      return res.status(400).json({ 
        message: "KYC already submitted", 
        status: existingKyc.status 
      });
    }
    
    // Create the KYC record
    const newKyc = await storageToUse.createKyc(kycData);
    
    // Update user KYC status
    await storageToUse.updateUser(user.id, { kycStatus: "pending" });
    
    // Create activity record
    await storageToUse.createActivity({
      userId: user.id,
      action: "Submitted KYC documents",
      status: "Pending"
    });
    
    res.status(201).json(newKyc);
  }));

  router.get('/kyc', authenticate, handleErrors(async (req: Request, res: Response) => {
    const kyc = await storageToUse.getUserKyc(req.userId!);
    
    if (!kyc) {
      return res.status(404).json({ message: "KYC not found" });
    }
    
    res.json(kyc);
  }));

  // Admin Routes
  router.get('/admin/users', authenticate, requireAdmin, handleErrors(async (req: Request, res: Response) => {
    const users = await storageToUse.getAllUsers();
    
    // Remove passwords from response
    const sanitizedUsers = users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
    
    res.json(sanitizedUsers);
  }));

  router.patch('/admin/users/:id', authenticate, requireAdmin, handleErrors(async (req: Request, res: Response) => {
    const userId = parseInt(req.params.id);
    const user = await storageToUse.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Don't allow modifying self through this endpoint
    if (userId === req.userId) {
      return res.status(400).json({ message: "Cannot modify own account through this endpoint" });
    }
    
    // Only allow specific fields to be updated
    const allowedFields = ["balance", "isAdmin", "isBanned", "referralCount"];
    const updates: Partial<typeof user> = {};
    
    for (const field of allowedFields) {
      if (field in req.body) {
        updates[field as keyof typeof user] = req.body[field];
      }
    }
    
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No valid fields to update" });
    }
    
    const updatedUser = await storageToUse.updateUser(userId, updates);
    
    if (!updatedUser) {
      return res.status(500).json({ message: "Failed to update user" });
    }
    
    // Create activity record
    await storageToUse.createActivity({
      userId: req.userId!,
      action: `Admin updated user ${userId}`,
      status: "Completed"
    });
    
    // Remove password from response
    const { password, ...userWithoutPassword } = updatedUser;
    
    res.json(userWithoutPassword);
  }));

  router.post('/admin/phone-numbers', authenticate, requireAdmin, handleErrors(async (req: Request, res: Response) => {
    const phoneNumberData = insertPhoneNumberSchema.parse(req.body);
    
    const newPhoneNumber = await storageToUse.createPhoneNumber(phoneNumberData);
    
    // Create activity record
    await storageToUse.createActivity({
      userId: req.userId!,
      action: `Added new phone number: ${newPhoneNumber.number}`,
      status: "Completed"
    });
    
    res.status(201).json(newPhoneNumber);
  }));

  router.get('/admin/phone-numbers', authenticate, requireAdmin, handleErrors(async (req: Request, res: Response) => {
    const phoneNumbers = await storageToUse.getAllPhoneNumbers();
    res.json(phoneNumbers);
  }));

  router.patch('/admin/phone-numbers/:id', authenticate, requireAdmin, handleErrors(async (req: Request, res: Response) => {
    const phoneNumberId = parseInt(req.params.id);
    const phoneNumber = await storageToUse.getPhoneNumber(phoneNumberId);
    
    if (!phoneNumber) {
      return res.status(404).json({ message: "Phone number not found" });
    }
    
    // Only allow specific fields to be updated
    const allowedFields = ["price", "isAvailable", "country"];
    const updates: Partial<typeof phoneNumber> = {};
    
    for (const field of allowedFields) {
      if (field in req.body) {
        updates[field as keyof typeof phoneNumber] = req.body[field];
      }
    }
    
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No valid fields to update" });
    }
    
    const updatedPhoneNumber = await storageToUse.updatePhoneNumber(phoneNumberId, updates);
    
    if (!updatedPhoneNumber) {
      return res.status(500).json({ message: "Failed to update phone number" });
    }
    
    // Create activity record
    await storageToUse.createActivity({
      userId: req.userId!,
      action: `Updated phone number: ${updatedPhoneNumber.number}`,
      status: "Completed"
    });
    
    res.json(updatedPhoneNumber);
  }));

  router.delete('/admin/phone-numbers/:id', authenticate, requireAdmin, handleErrors(async (req: Request, res: Response) => {
    const phoneNumberId = parseInt(req.params.id);
    const phoneNumber = await storageToUse.getPhoneNumber(phoneNumberId);
    
    if (!phoneNumber) {
      return res.status(404).json({ message: "Phone number not found" });
    }
    
    const success = await storageToUse.deletePhoneNumber(phoneNumberId);
    
    if (!success) {
      return res.status(500).json({ message: "Failed to delete phone number" });
    }
    
    // Create activity record
    await storageToUse.createActivity({
      userId: req.userId!,
      action: `Deleted phone number: ${phoneNumber.number}`,
      status: "Completed"
    });
    
    res.json({ message: "Phone number deleted successfully" });
  }));

  router.get('/admin/orders', authenticate, requireAdmin, handleErrors(async (req: Request, res: Response) => {
    // In a real app, you'd implement pagination and filtering
    const allOrders = [];
    
    // Iterate through all users and get their orders
    const users = await storageToUse.getAllUsers();
    
    for (const user of users) {
      const userOrders = await storageToUse.getUserOrders(user.id);
      allOrders.push(...userOrders);
    }
    
    // Sort by creation date, newest first
    allOrders.sort((a, b) => {
      const aTime = a.createdAt ? a.createdAt.getTime() : 0;
      const bTime = b.createdAt ? b.createdAt.getTime() : 0;
      return bTime - aTime;
    });
    
    res.json(allOrders);
  }));

  router.patch('/admin/orders/:id', authenticate, requireAdmin, handleErrors(async (req: Request, res: Response) => {
    const orderId = parseInt(req.params.id);
    const order = await storageToUse.getOrder(orderId);
    
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    
    // Only allow specific fields to be updated
    const allowedFields = ["status", "code"];
    const updates: Partial<typeof order> = {};
    
    for (const field of allowedFields) {
      if (field in req.body) {
        updates[field as keyof typeof order] = req.body[field];
      }
    }
    
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No valid fields to update" });
    }
    
    const updatedOrder = await storageToUse.updateOrder(orderId, updates);
    
    if (!updatedOrder) {
      return res.status(500).json({ message: "Failed to update order" });
    }
    
    // If order was completed, update the user's activity
    if (updates.status === "completed") {
      const user = await storageToUse.getUser(order.userId);
      
      if (user) {
        await storageToUse.createActivity({
          userId: user.id,
          action: order.isReferralReward 
            ? "Claimed free number with referrals" 
            : "Purchased WhatsApp number",
          status: "Completed"
        });
      }
    }
    
    // Create admin activity record
    await storageToUse.createActivity({
      userId: req.userId!,
      action: `Updated order ${orderId} status to ${updates.status}`,
      status: "Completed"
    });
    
    res.json(updatedOrder);
  }));

  router.get('/admin/payments', authenticate, requireAdmin, handleErrors(async (req: Request, res: Response) => {
    const pendingOnly = req.query.pending === "true";
    let allPayments = [];
    
    if (pendingOnly) {
      allPayments = await storageToUse.getPendingPayments();
    } else {
      // In a real app, you'd implement pagination and filtering
      
      // Iterate through all users and get their payments
      const users = await storageToUse.getAllUsers();
      
      for (const user of users) {
        const userPayments = await storageToUse.getUserPayments(user.id);
        allPayments.push(...userPayments);
      }
    }
    
    // Sort by creation date, newest first
    allPayments.sort((a, b) => {
      const aTime = a.createdAt ? a.createdAt.getTime() : 0;
      const bTime = b.createdAt ? b.createdAt.getTime() : 0;
      return bTime - aTime;
    });
    
    res.json(allPayments);
  }));

  router.patch('/admin/payments/:id', authenticate, requireAdmin, handleErrors(async (req: Request, res: Response) => {
    const paymentId = parseInt(req.params.id);
    const payment = await storageToUse.getPayment(paymentId);
    
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }
    
    // Only allow status to be updated
    if (!("status" in req.body)) {
      return res.status(400).json({ message: "Status field is required" });
    }
    
    const updates: Partial<typeof payment> = {
      status: req.body.status
    };
    
    const updatedPayment = await storageToUse.updatePayment(paymentId, updates);
    
    if (!updatedPayment) {
      return res.status(500).json({ message: "Failed to update payment" });
    }
    
    // If payment was completed and NOT attached to an order, add the amount to the user's balance
    if (updates.status === "completed" && !payment.orderId) {
      const user = await storageToUse.getUser(payment.userId);
      
      if (user) {
        await storageToUse.updateUser(user.id, {
          balance: user.balance + payment.amount
        });
        
        // Create user activity record
        await storageToUse.createActivity({
          userId: user.id,
          action: "Added funds to account",
          status: "Completed"
        });
      }
    }
    
    // Create admin activity record
    await storageToUse.createActivity({
      userId: req.userId!,
      action: `Updated payment ${paymentId} status to ${updates.status}`,
      status: "Completed"
    });
    
    res.json(updatedPayment);
  }));

  router.get('/admin/kyc', authenticate, requireAdmin, handleErrors(async (req: Request, res: Response) => {
    const pendingOnly = req.query.pending === "true";
    let kycRecords = [];
    
    if (pendingOnly) {
      kycRecords = await storageToUse.getPendingKyc();
    } else {
      // In a real app, you'd implement pagination and filtering
      const users = await storageToUse.getAllUsers();
      
      for (const user of users) {
        const userKyc = await storageToUse.getUserKyc(user.id);
        if (userKyc) {
          kycRecords.push(userKyc);
        }
      }
    }
    
    // Sort by creation date, newest first
    kycRecords.sort((a, b) => {
      const aTime = a.createdAt ? a.createdAt.getTime() : 0;
      const bTime = b.createdAt ? b.createdAt.getTime() : 0;
      return bTime - aTime;
    });
    
    res.json(kycRecords);
  }));

  router.patch('/admin/kyc/:id', authenticate, requireAdmin, handleErrors(async (req: Request, res: Response) => {
    const kycId = parseInt(req.params.id);
    const kyc = await storageToUse.getKyc(kycId);
    
    if (!kyc) {
      return res.status(404).json({ message: "KYC record not found" });
    }
    
    // Only allow status to be updated
    if (!("status" in req.body)) {
      return res.status(400).json({ message: "Status field is required" });
    }
    
    const updates: Partial<typeof kyc> = {
      status: req.body.status
    };
    
    const updatedKyc = await storageToUse.updateKyc(kycId, updates);
    
    if (!updatedKyc) {
      return res.status(500).json({ message: "Failed to update KYC record" });
    }
    
    // Create admin activity record
    await storageToUse.createActivity({
      userId: req.userId!,
      action: `Updated KYC ${kycId} status to ${updates.status}`,
      status: "Completed"
    });
    
    // Create user activity record
    await storageToUse.createActivity({
      userId: kyc.userId,
      action: "KYC verification",
      status: updates.status === "approved" ? "Approved" : "Rejected"
    });
    
    res.json(updatedKyc);
  }));

  router.get('/admin/settings', authenticate, requireAdmin, handleErrors(async (req: Request, res: Response) => {
    const settings = await storageToUse.getAllSettings();
    res.json(settings);
  }));

  router.patch('/admin/settings', authenticate, requireAdmin, handleErrors(async (req: Request, res: Response) => {
    const updates = req.body;
    
    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No settings to update" });
    }
    
    const updated = [];
    
    for (const [key, value] of Object.entries(updates)) {
      if (typeof value === "string") {
        await storageToUse.setSetting(key, value);
        updated.push(key);
      }
    }
    
    if (updated.length === 0) {
      return res.status(400).json({ message: "No valid settings to update" });
    }
    
    // Create admin activity record
    await storageToUse.createActivity({
      userId: req.userId!,
      action: `Updated system settings: ${updated.join(", ")}`,
      status: "Completed"
    });
    
    const settings = await storageToUse.getAllSettings();
    res.json(settings);
  }));

  router.post('/admin/broadcast', authenticate, requireAdmin, handleErrors(async (req: Request, res: Response) => {
    const { message, title } = req.body;
    
    if (!message || !title) {
      return res.status(400).json({ message: "Message and title are required" });
    }
    
    // In a real app, you would send notifications to all users
    // For this demo, we'll just create an activity record
    
    await storageToUse.createActivity({
      userId: req.userId!,
      action: `Broadcast message: ${title}`,
      status: "Completed"
    });
    
    res.json({ message: "Broadcast sent successfully" });
  }));

  // Service Routes
  router.get('/services', handleErrors(async (req: Request, res: Response) => {
    const services = await storageToUse.getActiveServices();
    res.json(services);
  }));
  
  router.get('/services/:id', handleErrors(async (req: Request, res: Response) => {
    const serviceId = parseInt(req.params.id);
    const service = await storageToUse.getService(serviceId);
    
    if (!service || !service.isActive) {
      return res.status(404).json({ message: "Service not found" });
    }
    
    res.json(service);
  }));
  
  // Country Routes
  router.get('/countries', handleErrors(async (req: Request, res: Response) => {
    const countries = await storageToUse.getActiveCountries();
    res.json(countries);
  }));
  
  router.get('/countries/:id', handleErrors(async (req: Request, res: Response) => {
    const countryId = parseInt(req.params.id);
    const country = await storageToUse.getCountry(countryId);
    
    if (!country || !country.isActive) {
      return res.status(404).json({ message: "Country not found" });
    }
    
    res.json(country);
  }));
  
  // Product Routes (Marketplace)
  router.get('/products', handleErrors(async (req: Request, res: Response) => {
    const products = await storageToUse.getApprovedProducts();
    res.json(products);
  }));
  
  router.get('/products/:id', handleErrors(async (req: Request, res: Response) => {
    const productId = parseInt(req.params.id);
    const product = await storageToUse.getProduct(productId);
    
    if (!product || !product.isAdminApproved || product.status !== "active") {
      return res.status(404).json({ message: "Product not found" });
    }
    
    res.json(product);
  }));
  
  router.post('/products', authenticate, handleErrors(async (req: Request, res: Response) => {
    const productData = insertProductSchema.parse({
      ...req.body,
      userId: req.userId
    });
    
    const user = await storageToUse.getUser(req.userId!);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // If not admin, need KYC verification to upload products
    if (!user.isAdmin && user.kycStatus !== "approved") {
      return res.status(403).json({ message: "KYC verification required to upload products" });
    }
    
    // Admin-specific properties will be set in the storage method
    const isAdmin = user.isAdmin;
    
    const newProduct = await storageToUse.createProduct(productData);
    
    // Create activity record
    await storageToUse.createActivity({
      userId: user.id,
      action: "Uploaded new product to marketplace",
      status: user.isAdmin ? "Completed" : "Pending approval"
    });
    
    res.status(201).json(newProduct);
  }));
  
  router.get('/user/products', authenticate, handleErrors(async (req: Request, res: Response) => {
    const products = await storageToUse.getUserProducts(req.userId!);
    res.json(products);
  }));
  
  // Admin Product Management
  router.get('/admin/products', authenticate, requireAdmin, handleErrors(async (req: Request, res: Response) => {
    const pendingProducts = await storageToUse.getPendingProducts();
    res.json(pendingProducts);
  }));
  
  router.patch('/admin/products/:id', authenticate, requireAdmin, handleErrors(async (req: Request, res: Response) => {
    const productId = parseInt(req.params.id);
    const product = await storageToUse.getProduct(productId);
    
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    // Only allow specific fields to be updated
    const allowedFields = ["isAdminApproved", "status", "price", "name", "description"];
    const updates: Partial<typeof product> = {};
    
    for (const field of allowedFields) {
      if (field in req.body) {
        updates[field as keyof typeof product] = req.body[field];
      }
    }
    
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No valid fields to update" });
    }
    
    const updatedProduct = await storageToUse.updateProduct(productId, updates);
    
    if (!updatedProduct) {
      return res.status(500).json({ message: "Failed to update product" });
    }
    
    // Create activity for the product owner
    await storageToUse.createActivity({
      userId: product.userId,
      action: `Admin ${req.body.isAdminApproved ? "approved" : "updated"} your marketplace product`,
      status: "Completed"
    });
    
    res.json(updatedProduct);
  }));
  
  // Admin Service Management
  router.post('/admin/services', authenticate, requireAdmin, handleErrors(async (req: Request, res: Response) => {
    const serviceData = insertServiceSchema.parse(req.body);
    const newService = await storageToUse.createService(serviceData);
    res.status(201).json(newService);
  }));
  
  router.get('/admin/services', authenticate, requireAdmin, handleErrors(async (req: Request, res: Response) => {
    const services = await storageToUse.getAllServices();
    res.json(services);
  }));
  
  router.patch('/admin/services/:id', authenticate, requireAdmin, handleErrors(async (req: Request, res: Response) => {
    const serviceId = parseInt(req.params.id);
    const service = await storageToUse.getService(serviceId);
    
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }
    
    const allowedFields = ["name", "slug", "description", "icon", "isActive"];
    const updates: Partial<typeof service> = {};
    
    for (const field of allowedFields) {
      if (field in req.body) {
        updates[field as keyof typeof service] = req.body[field];
      }
    }
    
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No valid fields to update" });
    }
    
    const updatedService = await storageToUse.updateService(serviceId, updates);
    
    if (!updatedService) {
      return res.status(500).json({ message: "Failed to update service" });
    }
    
    res.json(updatedService);
  }));
  
  // Admin Country Management
  router.post('/admin/countries', authenticate, requireAdmin, handleErrors(async (req: Request, res: Response) => {
    const countryData = insertCountrySchema.parse(req.body);
    const newCountry = await storageToUse.createCountry(countryData);
    res.status(201).json(newCountry);
  }));
  
  router.get('/admin/countries', authenticate, requireAdmin, handleErrors(async (req: Request, res: Response) => {
    const countries = await storageToUse.getAllCountries();
    res.json(countries);
  }));
  
  router.patch('/admin/countries/:id', authenticate, requireAdmin, handleErrors(async (req: Request, res: Response) => {
    const countryId = parseInt(req.params.id);
    const country = await storageToUse.getCountry(countryId);
    
    if (!country) {
      return res.status(404).json({ message: "Country not found" });
    }
    
    const allowedFields = ["name", "code", "flag", "isActive"];
    const updates: Partial<typeof country> = {};
    
    for (const field of allowedFields) {
      if (field in req.body) {
        updates[field as keyof typeof country] = req.body[field];
      }
    }
    
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No valid fields to update" });
    }
    
    const updatedCountry = await storageToUse.updateCountry(countryId, updates);
    
    if (!updatedCountry) {
      return res.status(500).json({ message: "Failed to update country" });
    }
    
    res.json(updatedCountry);
  }));
  
  // AI Chat Routes
  router.post('/ai-chat', authenticate, handleErrors(async (req: Request, res: Response) => {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    const user = await storageToUse.getUser(req.userId!);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Generate AI response based on keywords in the message
    let response = "I'm ETHERVOX AI, your virtual assistant. How can I help you today?";
    const lowerMessage = message.toLowerCase();
    
    // Match keywords to provide relevant responses
    if (lowerMessage.includes('referral') || lowerMessage.includes('refer')) {
      response = "Our referral program is simple! You earn ₦100 for each new user you refer. Just share your unique referral link from your dashboard. The earnings go directly to your referral wallet which you can withdraw at any time!";
    } 
    else if (lowerMessage.includes('payment') || lowerMessage.includes('pay') || lowerMessage.includes('transfer')) {
      response = "We accept multiple payment methods: Bank transfer to account 8121320468 (Opay, Keno Darlington Avwunudiogba), wallet balance, and direct Opay transfers. After payment, your order will be processed immediately!";
    } 
    else if (lowerMessage.includes('whatsapp') || lowerMessage.includes('number')) {
      response = "Our WhatsApp numbers are sourced from trusted providers and delivered instantly after payment confirmation. After purchase, you'll receive the number and activation code. Numbers can be used for WhatsApp, Telegram, Signal, WeChat and other messaging apps!";
    } 
    else if (lowerMessage.includes('kyc') || lowerMessage.includes('verify') || lowerMessage.includes('verification')) {
      response = "KYC verification is required to unlock all platform features. Go to the KYC page from your dashboard, upload your ID (front and back) and a selfie. Our team reviews submissions within 24 hours. Approved users can access referral rewards and higher purchasing limits!";
    } 
    else if (lowerMessage.includes('problem') || lowerMessage.includes('issue') || lowerMessage.includes('help')) {
      response = "I'm sorry you're experiencing issues! For technical support, please describe your problem in detail. For payment issues, contact us at support@etherdoxshefzysms.com or message our admin on WhatsApp at +234 708 850 1777.";
    } 
    else if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('expensive')) {
      response = "Our number prices vary based on country and service type. Nigerian numbers start at ₦1,500, while US and UK numbers start at ₦3,500. Bulk discounts are available for purchases of 5 or more numbers. Check our store for current pricing and special offers!";
    } 
    else if (lowerMessage.includes('wallet') || lowerMessage.includes('balance') || lowerMessage.includes('withdraw')) {
      response = "You have two wallet types: your main balance for purchases and your referral wallet for referral earnings. You can withdraw from your referral wallet once you reach ₦1,000. Withdrawals are processed within 24 hours to your specified bank account.";
    } 
    else if (lowerMessage.includes('country') || lowerMessage.includes('nigeria') || lowerMessage.includes('international')) {
      response = "We offer numbers from multiple countries including Nigeria, Indonesia, United States, United Kingdom, Canada, Australia, Germany, France, Brazil, India, and China. Each country has different pricing and availability. Check our store for current inventory!";
    } 
    else if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      response = "Hello! Welcome to ETHERDOXSHEFZYSMS. I'm ETHERVOX AI, your personal assistant. How may I help you today? Feel free to ask about our services, payment methods, or referral program!";
    } 
    else if (lowerMessage.includes('thank')) {
      response = "You're welcome! I'm glad I could help. If you have any other questions, feel free to ask. We appreciate your business and trust in ETHERDOXSHEFZYSMS!";
    }
    
    // Create the chat record with the response
    const newChat = await storageToUse.createAiChat({
      userId: req.userId!,
      message,
      response
    });
    
    // Send response
    res.status(201).json(newChat);
  }));
  
  router.get('/ai-chat', authenticate, handleErrors(async (req: Request, res: Response) => {
    const chats = await storageToUse.getUserChats(req.userId!);
    res.json(chats);
  }));
  
  // Helper function to fix null createdAt values in sort functions
  router.get('/utils/date-sort-helper', handleErrors(async (req: Request, res: Response) => {
    const sortExample = (items: any[]) => {
      return items.sort((a, b) => {
        const aTime = a.createdAt ? a.createdAt.getTime() : 0;
        const bTime = b.createdAt ? b.createdAt.getTime() : 0;
        return bTime - aTime;
      });
    };
    
    res.json({
      message: "Date sorting utility function example. Use this pattern to safely sort items with potentially null dates.",
      code: sortExample.toString()
    });
  }));

  // Register the API routes under /api
  app.use('/api', router);
  
  // Create a root router for the health check and other essential endpoints
  const rootRouter = express.Router();
  
  // Health check at root path for Koyeb deployments
  rootRouter.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });
  
  // Root path catch-all to redirect to the frontend
  rootRouter.get('/', (req: Request, res: Response) => {
    res.redirect('/login');
  });
  
  // Register root endpoints
  app.use(rootRouter);

  // For Netlify Functions, we need to return the Express app, not the HTTP server
  // Check if we're in a serverless environment (Netlify Functions)
  const isServerless = process.env.NETLIFY === 'true';
  
  return isServerless ? app : httpServer;
}
