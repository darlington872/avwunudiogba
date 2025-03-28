import { 
  User, InsertUser, 
  PhoneNumber, InsertPhoneNumber, 
  Order, InsertOrder,
  Payment, InsertPayment,
  Kyc, InsertKyc,
  Activity, InsertActivity,
  Setting,
  Product, InsertProduct,
  Service, InsertService,
  Country, InsertCountry,
  AiChat, InsertAiChat,
  users,
  phoneNumbers,
  orders,
  payments,
  kyc,
  activities,
  settings,
  products,
  services,
  countries,
  aiChats
} from "../shared/schema.js";
import { nanoid } from "nanoid";
import session from "express-session";
import createMemoryStore from "memorystore";
import connectPg from "connect-pg-simple";
import { db, pool } from "./db";
import { eq, desc, and, asc } from "drizzle-orm";

export interface IStorage {
  // Session store for authentication
  sessionStore: session.Store;
  
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByReferralCode(referralCode: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  getReferredUsers(referralCode: string): Promise<User[]>;
  
  // Phone number methods
  createPhoneNumber(phoneNumber: InsertPhoneNumber): Promise<PhoneNumber>;
  getPhoneNumber(id: number): Promise<PhoneNumber | undefined>;
  getAllPhoneNumbers(): Promise<PhoneNumber[]>;
  getAvailablePhoneNumbers(): Promise<PhoneNumber[]>;
  updatePhoneNumber(id: number, data: Partial<PhoneNumber>): Promise<PhoneNumber | undefined>;
  deletePhoneNumber(id: number): Promise<boolean>;
  
  // Order methods
  createOrder(order: InsertOrder): Promise<Order>;
  getOrder(id: number): Promise<Order | undefined>;
  getUserOrders(userId: number): Promise<Order[]>;
  updateOrder(id: number, data: Partial<Order>): Promise<Order | undefined>;
  
  // Payment methods
  createPayment(payment: InsertPayment): Promise<Payment>;
  getPayment(id: number): Promise<Payment | undefined>;
  getUserPayments(userId: number): Promise<Payment[]>;
  updatePayment(id: number, data: Partial<Payment>): Promise<Payment | undefined>;
  getPendingPayments(): Promise<Payment[]>;
  
  // KYC methods
  createKyc(kyc: InsertKyc): Promise<Kyc>;
  getKyc(id: number): Promise<Kyc | undefined>;
  getUserKyc(userId: number): Promise<Kyc | undefined>;
  updateKyc(id: number, data: Partial<Kyc>): Promise<Kyc | undefined>;
  getPendingKyc(): Promise<Kyc[]>;
  
  // Activity methods
  createActivity(activity: InsertActivity): Promise<Activity>;
  getUserActivities(userId: number): Promise<Activity[]>;
  
  // Settings methods
  getSetting(key: string): Promise<string | undefined>;
  setSetting(key: string, value: string): Promise<boolean>;
  getAllSettings(): Promise<Setting[]>;
  
  // Product methods
  createProduct(product: InsertProduct): Promise<Product>;
  getProduct(id: number): Promise<Product | undefined>;
  getUserProducts(userId: number): Promise<Product[]>;
  updateProduct(id: number, data: Partial<Product>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  getApprovedProducts(): Promise<Product[]>;
  getPendingProducts(): Promise<Product[]>;
  
  // Service methods
  createService(service: InsertService): Promise<Service>;
  getService(id: number): Promise<Service | undefined>;
  getServiceBySlug(slug: string): Promise<Service | undefined>;
  getAllServices(): Promise<Service[]>;
  getActiveServices(): Promise<Service[]>;
  updateService(id: number, data: Partial<Service>): Promise<Service | undefined>;
  
  // Country methods
  createCountry(country: InsertCountry): Promise<Country>;
  getCountry(id: number): Promise<Country | undefined>;
  getCountryByCode(code: string): Promise<Country | undefined>;
  getAllCountries(): Promise<Country[]>;
  getActiveCountries(): Promise<Country[]>;
  updateCountry(id: number, data: Partial<Country>): Promise<Country | undefined>;
  
  // AI Chat methods
  createAiChat(chat: InsertAiChat): Promise<AiChat>;
  getUserChats(userId: number): Promise<AiChat[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private phoneNumbers: Map<number, PhoneNumber>;
  private orders: Map<number, Order>;
  private payments: Map<number, Payment>;
  private kycRecords: Map<number, Kyc>;
  private activities: Map<number, Activity>;
  private settings: Map<string, string>;
  private products: Map<number, Product>;
  private services: Map<number, Service>;
  private countries: Map<number, Country>;
  private aiChats: Map<number, AiChat>;
  
  // Session store for authentication
  sessionStore: session.Store;
  
  currentUserId: number;
  currentPhoneNumberId: number;
  currentOrderId: number;
  currentPaymentId: number;
  currentKycId: number;
  currentActivityId: number;
  currentProductId: number;
  currentServiceId: number;
  currentCountryId: number;
  currentAiChatId: number;

  constructor() {
    // Initialize memory store for session
    const MemoryStore = createMemoryStore(session);
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
    this.users = new Map();
    this.phoneNumbers = new Map();
    this.orders = new Map();
    this.payments = new Map();
    this.kycRecords = new Map();
    this.activities = new Map();
    this.settings = new Map();
    this.products = new Map();
    this.services = new Map();
    this.countries = new Map();
    this.aiChats = new Map();
    
    this.currentUserId = 1;
    this.currentPhoneNumberId = 1;
    this.currentOrderId = 1;
    this.currentPaymentId = 1;
    this.currentKycId = 1;
    this.currentActivityId = 1;
    this.currentProductId = 1;
    this.currentServiceId = 1;
    this.currentCountryId = 1;
    this.currentAiChatId = 1;
    
    // Initialize default settings
    this.initializeDefaultSettings();
    this.initializeDefaultServices();
    this.initializeDefaultCountries();
  }

  private initializeDefaultSettings(): void {
    this.settings.set("REFERRALS_NEEDED", "20");
    this.settings.set("ADMIN_CODE", "vesta1212");
    this.settings.set("KYC_REQUIRED_FOR_REFERRAL", "true");
    this.settings.set("LOCAL_PAYMENT_ACCOUNT", "8121320468");
    this.settings.set("OPAY_ENABLED", "true");
    this.settings.set("KENO_ENABLED", "true");
    this.settings.set("SITE_NAME", "EtherDoxShefZySMS");
    this.settings.set("SITE_DESCRIPTION", "WhatsApp Number Service");
    this.settings.set("CONTACT_EMAIL", "support@etherdoxshefzysms.com");
    this.settings.set("MAINTENANCE_MODE", "false");
    this.settings.set("REFERRAL_REWARD", "100");
    this.settings.set("CURRENCY", "₦"); // Naira symbol
  }
  
  private initializeDefaultServices(): void {
    // WhatsApp
    this.services.set(this.currentServiceId++, {
      id: 1,
      name: "WhatsApp",
      slug: "whatsapp",
      description: "Get virtual WhatsApp numbers for messaging",
      icon: "whatsapp",
      isActive: true,
      createdAt: new Date()
    });
    
    // Telegram
    this.services.set(this.currentServiceId++, {
      id: 2,
      name: "Telegram",
      slug: "telegram",
      description: "Create Telegram accounts with virtual numbers",
      icon: "telegram",
      isActive: true,
      createdAt: new Date()
    });
    
    // Signal
    this.services.set(this.currentServiceId++, {
      id: 3,
      name: "Signal",
      slug: "signal",
      description: "Register on Signal with our virtual numbers",
      icon: "message-circle",
      isActive: true,
      createdAt: new Date()
    });
    
    // WeChat
    this.services.set(this.currentServiceId++, {
      id: 4,
      name: "WeChat",
      slug: "wechat",
      description: "Create WeChat accounts with our numbers",
      icon: "wechat",
      isActive: true,
      createdAt: new Date()
    });
  }
  
  private initializeDefaultCountries(): void {
    // Nigeria
    this.countries.set(this.currentCountryId++, {
      id: 1,
      name: "Nigeria",
      code: "NG",
      flag: "🇳🇬",
      isActive: true,
      createdAt: new Date()
    });
    
    // Indonesia (Added as requested)
    this.countries.set(this.currentCountryId++, {
      id: 2,
      name: "Indonesia",
      code: "ID",
      flag: "🇮🇩",
      isActive: true,
      createdAt: new Date()
    });
    
    // United States
    this.countries.set(this.currentCountryId++, {
      id: 3,
      name: "United States",
      code: "US",
      flag: "🇺🇸",
      isActive: true,
      createdAt: new Date()
    });
    
    // United Kingdom
    this.countries.set(this.currentCountryId++, {
      id: 4,
      name: "United Kingdom",
      code: "GB",
      flag: "🇬🇧",
      isActive: true,
      createdAt: new Date()
    });
    
    // Canada
    this.countries.set(this.currentCountryId++, {
      id: 5,
      name: "Canada",
      code: "CA",
      flag: "🇨🇦",
      isActive: true,
      createdAt: new Date()
    });
    
    // Australia
    this.countries.set(this.currentCountryId++, {
      id: 6,
      name: "Australia",
      code: "AU",
      flag: "🇦🇺",
      isActive: true,
      createdAt: new Date()
    });
    
    // Germany
    this.countries.set(this.currentCountryId++, {
      id: 7,
      name: "Germany",
      code: "DE",
      flag: "🇩🇪",
      isActive: true,
      createdAt: new Date()
    });
    
    // France
    this.countries.set(this.currentCountryId++, {
      id: 7,
      name: "France",
      code: "FR",
      flag: "🇫🇷",
      isActive: true,
      createdAt: new Date()
    });
    
    // Brazil
    this.countries.set(this.currentCountryId++, {
      id: 8,
      name: "Brazil",
      code: "BR",
      flag: "🇧🇷",
      isActive: true,
      createdAt: new Date()
    });
    
    // India
    this.countries.set(this.currentCountryId++, {
      id: 9,
      name: "India",
      code: "IN",
      flag: "🇮🇳",
      isActive: true,
      createdAt: new Date()
    });
    
    // China
    this.countries.set(this.currentCountryId++, {
      id: 10,
      name: "China",
      code: "CN",
      flag: "🇨🇳",
      isActive: true,
      createdAt: new Date()
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }

  async getUserByReferralCode(referralCode: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.referralCode === referralCode
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    
    // Check if user was referred by someone
    let isAdmin = false;
    
    if (insertUser.referredBy === await this.getSetting("ADMIN_CODE")) {
      isAdmin = true;
      insertUser.referredBy = undefined; // Clear the admin code as referral
    } else if (insertUser.referredBy) {
      const referrer = await this.getUserByReferralCode(insertUser.referredBy);
      
      if (referrer) {
        // Increment referrer's count
        const updatedReferrer = {
          ...referrer,
          referralCount: referrer.referralCount + 1
        };
        this.users.set(referrer.id, updatedReferrer);
      }
    }
    
    // Generate a unique referral code
    const referralCode = nanoid(8);
    
    const user: User = {
      id,
      ...insertUser,
      referralCode,
      referralCount: 0,
      isAdmin,
      isVerified: false,
      isBanned: false,
      kycStatus: "pending",
      balance: 0,
      referralWalletBalance: 0, // Adding referral wallet balance
      createdAt: new Date(),
      referredBy: insertUser.referredBy || null
    };
    
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, data: Partial<User>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) {
      return undefined;
    }
    
    const updatedUser = { ...user, ...data };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getReferredUsers(referralCode: string): Promise<User[]> {
    return Array.from(this.users.values()).filter(
      (user) => user.referredBy === referralCode
    );
  }

  // Phone number methods
  async createPhoneNumber(phoneNumber: InsertPhoneNumber): Promise<PhoneNumber> {
    const id = this.currentPhoneNumberId++;
    const newPhoneNumber: PhoneNumber = {
      id,
      number: phoneNumber.number,
      country: phoneNumber.country,
      service: phoneNumber.service,
      price: phoneNumber.price,
      stockCount: phoneNumber.stockCount || 1,
      isAvailable: true,
      createdAt: new Date()
    };
    
    this.phoneNumbers.set(id, newPhoneNumber);
    return newPhoneNumber;
  }

  async getPhoneNumber(id: number): Promise<PhoneNumber | undefined> {
    return this.phoneNumbers.get(id);
  }

  async getAllPhoneNumbers(): Promise<PhoneNumber[]> {
    return Array.from(this.phoneNumbers.values());
  }

  async getAvailablePhoneNumbers(): Promise<PhoneNumber[]> {
    return Array.from(this.phoneNumbers.values()).filter(
      (phoneNumber) => phoneNumber.isAvailable
    );
  }

  async updatePhoneNumber(id: number, data: Partial<PhoneNumber>): Promise<PhoneNumber | undefined> {
    const phoneNumber = await this.getPhoneNumber(id);
    if (!phoneNumber) {
      return undefined;
    }
    
    const updatedPhoneNumber = { ...phoneNumber, ...data };
    this.phoneNumbers.set(id, updatedPhoneNumber);
    return updatedPhoneNumber;
  }

  async deletePhoneNumber(id: number): Promise<boolean> {
    return this.phoneNumbers.delete(id);
  }

  // Order methods
  async createOrder(order: InsertOrder): Promise<Order> {
    const id = this.currentOrderId++;
    const newOrder: Order = {
      id,
      userId: order.userId,
      phoneNumberId: order.phoneNumberId,
      paymentMethod: order.paymentMethod,
      totalAmount: order.totalAmount,
      status: "pending",
      code: null,
      isReferralReward: order.isReferralReward || false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.orders.set(id, newOrder);
    
    // Mark phone number as unavailable if not a referral reward
    if (!order.isReferralReward) {
      const phoneNumber = await this.getPhoneNumber(order.phoneNumberId);
      if (phoneNumber) {
        await this.updatePhoneNumber(phoneNumber.id, { isAvailable: false });
      }
    }
    
    return newOrder;
  }

  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async getUserOrders(userId: number): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(
      (order) => order.userId === userId
    );
  }

  async updateOrder(id: number, data: Partial<Order>): Promise<Order | undefined> {
    const order = await this.getOrder(id);
    if (!order) {
      return undefined;
    }
    
    const updatedOrder = { ...order, ...data, updatedAt: new Date() };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }

  // Payment methods
  async createPayment(payment: InsertPayment): Promise<Payment> {
    const id = this.currentPaymentId++;
    const newPayment: Payment = {
      id,
      userId: payment.userId,
      amount: payment.amount,
      method: payment.method,
      status: "pending",
      orderId: payment.orderId || null,
      reference: payment.reference || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.payments.set(id, newPayment);
    return newPayment;
  }

  async getPayment(id: number): Promise<Payment | undefined> {
    return this.payments.get(id);
  }

  async getUserPayments(userId: number): Promise<Payment[]> {
    return Array.from(this.payments.values()).filter(
      (payment) => payment.userId === userId
    );
  }

  async updatePayment(id: number, data: Partial<Payment>): Promise<Payment | undefined> {
    const payment = await this.getPayment(id);
    if (!payment) {
      return undefined;
    }
    
    const updatedPayment = { ...payment, ...data, updatedAt: new Date() };
    this.payments.set(id, updatedPayment);
    
    // If payment status changed to "completed" and has an order, update order status
    if (data.status === "completed" && payment.orderId) {
      const order = await this.getOrder(payment.orderId);
      if (order) {
        await this.updateOrder(order.id, { status: "completed" });
      }
    }
    
    return updatedPayment;
  }

  async getPendingPayments(): Promise<Payment[]> {
    return Array.from(this.payments.values()).filter(
      (payment) => payment.status === "pending"
    );
  }

  // KYC methods
  async createKyc(kyc: InsertKyc): Promise<Kyc> {
    const id = this.currentKycId++;
    const newKyc: Kyc = {
      id,
      userId: kyc.userId,
      fullName: kyc.fullName,
      address: kyc.address,
      city: kyc.city,
      postalCode: kyc.postalCode,
      country: kyc.country,
      idType: kyc.idType,
      idFront: kyc.idFront,
      idBack: kyc.idBack,
      selfie: kyc.selfie,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.kycRecords.set(id, newKyc);
    return newKyc;
  }

  async getKyc(id: number): Promise<Kyc | undefined> {
    return this.kycRecords.get(id);
  }

  async getUserKyc(userId: number): Promise<Kyc | undefined> {
    return Array.from(this.kycRecords.values()).find(
      (kyc) => kyc.userId === userId
    );
  }

  async updateKyc(id: number, data: Partial<Kyc>): Promise<Kyc | undefined> {
    const kyc = await this.getKyc(id);
    if (!kyc) {
      return undefined;
    }
    
    const updatedKyc = { ...kyc, ...data, updatedAt: new Date() };
    this.kycRecords.set(id, updatedKyc);
    
    // If KYC status is updated to approved, update user's KYC status
    if (data.status === "approved") {
      const user = await this.getUser(kyc.userId);
      if (user) {
        await this.updateUser(user.id, { kycStatus: "approved", isVerified: true });
      }
    } else if (data.status === "rejected") {
      const user = await this.getUser(kyc.userId);
      if (user) {
        await this.updateUser(user.id, { kycStatus: "rejected" });
      }
    }
    
    return updatedKyc;
  }

  async getPendingKyc(): Promise<Kyc[]> {
    return Array.from(this.kycRecords.values()).filter(
      (kyc) => kyc.status === "pending"
    );
  }

  // Activity methods
  async createActivity(activity: InsertActivity): Promise<Activity> {
    const id = this.currentActivityId++;
    const newActivity: Activity = {
      id,
      userId: activity.userId,
      action: activity.action,
      status: activity.status,
      createdAt: new Date()
    };
    
    this.activities.set(id, newActivity);
    return newActivity;
  }

  async getUserActivities(userId: number): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .filter(activity => activity.userId === userId)
      .sort((a, b) => {
        // Sort by created date, newest first
        const aTime = a.createdAt ? a.createdAt.getTime() : 0;
        const bTime = b.createdAt ? b.createdAt.getTime() : 0;
        return bTime - aTime;
      });
  }

  // Settings methods
  async getSetting(key: string): Promise<string | undefined> {
    return this.settings.get(key);
  }

  async setSetting(key: string, value: string): Promise<boolean> {
    this.settings.set(key, value);
    return true;
  }

  async getAllSettings(): Promise<Setting[]> {
    return Array.from(this.settings.entries()).map(([key, value]) => ({
      id: 0, // Not relevant for in-memory storage
      key,
      value
    }));
  }
  
  // Product methods
  async createProduct(product: InsertProduct): Promise<Product> {
    const id = this.currentProductId++;
    
    // Check if user is admin
    const user = await this.getUser(product.userId);
    const isAdmin = user?.isAdmin || false;
    
    const newProduct: Product = {
      id,
      userId: product.userId,
      title: product.title,
      description: product.description,
      price: product.price,
      category: product.category,
      images: product.images,
      isAdminApproved: isAdmin, // Auto-approve if admin
      status: isAdmin ? "active" : "pending",
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.products.set(id, newProduct);
    return newProduct;
  }
  
  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }
  
  async getUserProducts(userId: number): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      (product) => product.userId === userId
    );
  }
  
  async updateProduct(id: number, data: Partial<Product>): Promise<Product | undefined> {
    const product = await this.getProduct(id);
    if (!product) {
      return undefined;
    }
    
    const updatedProduct = { ...product, ...data, updatedAt: new Date() };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }
  
  async deleteProduct(id: number): Promise<boolean> {
    return this.products.delete(id);
  }
  
  async getApprovedProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      (product) => product.isAdminApproved && product.status === "active"
    );
  }
  
  async getPendingProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      (product) => !product.isAdminApproved || product.status === "pending"
    );
  }
  
  // Service methods
  async createService(service: InsertService): Promise<Service> {
    const id = this.currentServiceId++;
    const newService: Service = {
      id,
      name: service.name,
      slug: service.slug,
      description: service.description,
      icon: service.icon,
      isActive: true,
      createdAt: new Date()
    };
    
    this.services.set(id, newService);
    return newService;
  }
  
  async getService(id: number): Promise<Service | undefined> {
    return this.services.get(id);
  }
  
  async getServiceBySlug(slug: string): Promise<Service | undefined> {
    return Array.from(this.services.values()).find(
      (service) => service.slug === slug
    );
  }
  
  async getAllServices(): Promise<Service[]> {
    return Array.from(this.services.values());
  }
  
  async getActiveServices(): Promise<Service[]> {
    return Array.from(this.services.values()).filter(
      (service) => service.isActive
    );
  }
  
  async updateService(id: number, data: Partial<Service>): Promise<Service | undefined> {
    const service = await this.getService(id);
    if (!service) {
      return undefined;
    }
    
    const updatedService = { ...service, ...data };
    this.services.set(id, updatedService);
    return updatedService;
  }
  
  // Country methods
  async createCountry(country: InsertCountry): Promise<Country> {
    const id = this.currentCountryId++;
    const newCountry: Country = {
      id,
      name: country.name,
      code: country.code,
      flag: country.flag,
      isActive: true,
      createdAt: new Date()
    };
    
    this.countries.set(id, newCountry);
    return newCountry;
  }
  
  async getCountry(id: number): Promise<Country | undefined> {
    return this.countries.get(id);
  }
  
  async getCountryByCode(code: string): Promise<Country | undefined> {
    return Array.from(this.countries.values()).find(
      (country) => country.code === code
    );
  }
  
  async getAllCountries(): Promise<Country[]> {
    return Array.from(this.countries.values());
  }
  
  async getActiveCountries(): Promise<Country[]> {
    return Array.from(this.countries.values()).filter(
      (country) => country.isActive
    );
  }
  
  async updateCountry(id: number, data: Partial<Country>): Promise<Country | undefined> {
    const country = await this.getCountry(id);
    if (!country) {
      return undefined;
    }
    
    const updatedCountry = { ...country, ...data };
    this.countries.set(id, updatedCountry);
    return updatedCountry;
  }
  
  // AI Chat methods
  async createAiChat(chat: InsertAiChat): Promise<AiChat> {
    const id = this.currentAiChatId++;
    const newChat: AiChat = {
      id,
      userId: chat.userId,
      message: chat.message,
      response: chat.response,
      createdAt: new Date()
    };
    
    this.aiChats.set(id, newChat);
    return newChat;
  }
  
  async getUserChats(userId: number): Promise<AiChat[]> {
    return Array.from(this.aiChats.values())
      .filter(chat => chat.userId === userId)
      .sort((a, b) => {
        // Sort by created date, newest first
        const aTime = a.createdAt ? a.createdAt.getTime() : 0;
        const bTime = b.createdAt ? b.createdAt.getTime() : 0;
        return bTime - aTime;
      });
  }
}

import { DatabaseStorage } from "./databaseStorage";

// Use DatabaseStorage implementation with CockroachDB
export const storage = new DatabaseStorage();
