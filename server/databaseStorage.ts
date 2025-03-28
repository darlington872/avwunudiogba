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
} from "../shared/schema";
import { nanoid } from "nanoid";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { db, pool } from "./db";
import { eq, desc, and, asc, isNull, not, gt, lt, like, sql, gte, lte } from "drizzle-orm";
import { IStorage } from "./storage";
import MemoryStore from "memorystore";

const PostgresSessionStore = connectPg(session);
const MemoryStoreFactory = MemoryStore(session);

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    try {
      // Custom table creation for CockroachDB compatibility
      pool.query(`
        CREATE TABLE IF NOT EXISTS "session" (
          "sid" VARCHAR NOT NULL PRIMARY KEY,
          "sess" JSON NOT NULL,
          "expire" TIMESTAMP(6) NOT NULL
        )
      `).catch(err => {
        console.warn("Error creating session table:", err.message);
      });
      
      // Initialize PostgreSQL session store with CockroachDB compatibility
      this.sessionStore = new PostgresSessionStore({ 
        pool,
        tableName: 'session',
        createTableIfMissing: false,  // We create it manually above
        schemaName: 'public'
      });
      
      console.log("Using PostgreSQL session store with CockroachDB connection");
    } catch (error) {
      console.warn("Failed to initialize PostgreSQL session store, falling back to memory store:", error);
      // Fallback to memory store if there's an issue with PostgreSQL
      this.sessionStore = new MemoryStoreFactory({
        checkPeriod: 86400000 // prune expired entries every 24h
      });
      console.log("Using memory session store as fallback");
    }
    
    // Initialize default data asynchronously to prevent startup failure
    this.initializeDefaultData().catch(err => {
      console.error("Error initializing default data:", err.message);
      console.error("The application will continue to run, but database initialization failed.");
      console.error("Please ensure the database is properly migrated with 'npm run db:push'");
    });
  }

  private async initializeDefaultData() {
    try {
      await this.initializeDefaultSettings();
      await this.initializeDefaultServices();
      await this.initializeDefaultCountries();
      console.log("Database initialization completed successfully");
    } catch (error) {
      console.error("Database initialization error:", error);
      throw error;
    }
  }

  private async initializeDefaultSettings() {
    // Check if settings already exist
    const existingSettings = await db.select().from(settings);
    if (existingSettings.length > 0) {
      return; // Settings already exist, no need to initialize
    }

    const defaultSettings = [
      { key: "REFERRALS_NEEDED", value: "20" },
      { key: "ADMIN_CODE", value: "vesta1212" },
      { key: "KYC_REQUIRED_FOR_REFERRAL", value: "true" },
      { key: "LOCAL_PAYMENT_ACCOUNT", value: "8121320468" },
      { key: "OPAY_ENABLED", value: "true" },
      { key: "KENO_ENABLED", value: "true" },
      { key: "SITE_NAME", value: "EtherDoxShefZySMS" },
      { key: "SITE_DESCRIPTION", value: "WhatsApp Number Service" },
      { key: "CONTACT_EMAIL", value: "support@etherdoxshefzysms.com" },
      { key: "MAINTENANCE_MODE", value: "false" },
      { key: "REFERRAL_REWARD", value: "100" },
      { key: "CURRENCY", value: "₦" } // Naira symbol
    ];

    for (const setting of defaultSettings) {
      await db.insert(settings).values(setting);
    }
  }

  private async initializeDefaultServices() {
    // Check if services already exist
    const existingServices = await db.select().from(services);
    if (existingServices.length > 0) {
      return; // Services already exist, no need to initialize
    }

    const defaultServices = [
      {
        name: "WhatsApp",
        slug: "whatsapp",
        description: "Get virtual WhatsApp numbers for messaging",
        icon: "whatsapp",
        isActive: true,
        createdAt: new Date()
      },
      {
        name: "Telegram",
        slug: "telegram",
        description: "Create Telegram accounts with virtual numbers",
        icon: "telegram",
        isActive: true,
        createdAt: new Date()
      },
      {
        name: "Signal",
        slug: "signal",
        description: "Register on Signal with our virtual numbers",
        icon: "message-circle",
        isActive: true,
        createdAt: new Date()
      },
      {
        name: "WeChat",
        slug: "wechat",
        description: "Create WeChat accounts with our numbers",
        icon: "wechat",
        isActive: true,
        createdAt: new Date()
      }
    ];

    for (const service of defaultServices) {
      await db.insert(services).values(service);
    }
  }

  private async initializeDefaultCountries() {
    // Check if countries already exist
    const existingCountries = await db.select().from(countries);
    if (existingCountries.length > 0) {
      return; // Countries already exist, no need to initialize
    }

    const defaultCountries = [
      {
        name: "Nigeria",
        code: "NG",
        flag: "🇳🇬",
        isActive: true,
        createdAt: new Date()
      },
      {
        name: "Indonesia",
        code: "ID",
        flag: "🇮🇩",
        isActive: true,
        createdAt: new Date()
      },
      {
        name: "United States",
        code: "US",
        flag: "🇺🇸",
        isActive: true,
        createdAt: new Date()
      },
      {
        name: "United Kingdom",
        code: "GB",
        flag: "🇬🇧",
        isActive: true,
        createdAt: new Date()
      },
      {
        name: "Canada",
        code: "CA",
        flag: "🇨🇦",
        isActive: true,
        createdAt: new Date()
      },
      {
        name: "Australia",
        code: "AU",
        flag: "🇦🇺",
        isActive: true,
        createdAt: new Date()
      },
      {
        name: "Germany",
        code: "DE",
        flag: "🇩🇪",
        isActive: true,
        createdAt: new Date()
      },
      {
        name: "France",
        code: "FR",
        flag: "🇫🇷",
        isActive: true,
        createdAt: new Date()
      },
      {
        name: "Brazil",
        code: "BR",
        flag: "🇧🇷",
        isActive: true,
        createdAt: new Date()
      },
      {
        name: "India",
        code: "IN",
        flag: "🇮🇳",
        isActive: true,
        createdAt: new Date()
      },
      {
        name: "China",
        code: "CN",
        flag: "🇨🇳",
        isActive: true,
        createdAt: new Date()
      }
    ];

    for (const country of defaultCountries) {
      await db.insert(countries).values(country);
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase()));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username.toLowerCase()));
    return user;
  }

  async getUserByReferralCode(referralCode: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.referralCode, referralCode));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Check if user was referred by someone
    let isAdmin = false;
    
    const adminCode = await this.getSetting("ADMIN_CODE");
    
    if (insertUser.referredBy === adminCode) {
      isAdmin = true;
      insertUser.referredBy = null; // Clear the admin code as referral
    } else if (insertUser.referredBy) {
      const referrer = await this.getUserByReferralCode(insertUser.referredBy);
      
      if (referrer) {
        // Increment referrer's count
        await this.updateUser(referrer.id, {
          referralCount: (referrer.referralCount || 0) + 1
        });
      }
    }
    
    // Generate a unique referral code
    const referralCode = nanoid(8);
    
    const userData = {
      ...insertUser,
      referralCode,
      referralCount: 0,
      isAdmin,
      isVerified: false,
      isBanned: false,
      kycStatus: "pending",
      balance: 0,
      referralWalletBalance: 0,
      createdAt: new Date(),
    };
    
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async updateUser(id: number, data: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    
    return updatedUser;
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users).orderBy(desc(users.createdAt));
  }

  async getReferredUsers(referralCode: string): Promise<User[]> {
    return db
      .select()
      .from(users)
      .where(eq(users.referredBy, referralCode))
      .orderBy(desc(users.createdAt));
  }

  // Phone number methods
  async createPhoneNumber(phoneNumber: InsertPhoneNumber): Promise<PhoneNumber> {
    const [newPhoneNumber] = await db
      .insert(phoneNumbers)
      .values({
        ...phoneNumber,
        isAvailable: true,
        createdAt: new Date()
      })
      .returning();
    
    return newPhoneNumber;
  }

  async getPhoneNumber(id: number): Promise<PhoneNumber | undefined> {
    const [phoneNumber] = await db
      .select()
      .from(phoneNumbers)
      .where(eq(phoneNumbers.id, id));
    
    return phoneNumber;
  }

  async getAllPhoneNumbers(): Promise<PhoneNumber[]> {
    return db
      .select()
      .from(phoneNumbers)
      .orderBy(desc(phoneNumbers.createdAt));
  }

  async getAvailablePhoneNumbers(): Promise<PhoneNumber[]> {
    return db
      .select()
      .from(phoneNumbers)
      .where(eq(phoneNumbers.isAvailable, true))
      .orderBy(desc(phoneNumbers.createdAt));
  }

  async updatePhoneNumber(id: number, data: Partial<PhoneNumber>): Promise<PhoneNumber | undefined> {
    const [updatedPhoneNumber] = await db
      .update(phoneNumbers)
      .set(data)
      .where(eq(phoneNumbers.id, id))
      .returning();
    
    return updatedPhoneNumber;
  }

  async deletePhoneNumber(id: number): Promise<boolean> {
    const result = await db
      .delete(phoneNumbers)
      .where(eq(phoneNumbers.id, id));
    
    return result.count > 0;
  }

  // Order methods
  async createOrder(order: InsertOrder): Promise<Order> {
    const [newOrder] = await db
      .insert(orders)
      .values({
        ...order,
        status: "pending",
        code: null,
        isReferralReward: order.isReferralReward || false,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    
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
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, id));
    
    return order;
  }

  async getUserOrders(userId: number): Promise<Order[]> {
    return db
      .select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt));
  }

  async updateOrder(id: number, data: Partial<Order>): Promise<Order | undefined> {
    const [updatedOrder] = await db
      .update(orders)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    
    return updatedOrder;
  }

  // Payment methods
  async createPayment(payment: InsertPayment): Promise<Payment> {
    const [newPayment] = await db
      .insert(payments)
      .values({
        ...payment,
        status: "pending",
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    
    return newPayment;
  }

  async getPayment(id: number): Promise<Payment | undefined> {
    const [payment] = await db
      .select()
      .from(payments)
      .where(eq(payments.id, id));
    
    return payment;
  }

  async getUserPayments(userId: number): Promise<Payment[]> {
    return db
      .select()
      .from(payments)
      .where(eq(payments.userId, userId))
      .orderBy(desc(payments.createdAt));
  }

  async updatePayment(id: number, data: Partial<Payment>): Promise<Payment | undefined> {
    const [updatedPayment] = await db
      .update(payments)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(payments.id, id))
      .returning();
    
    return updatedPayment;
  }

  async getPendingPayments(): Promise<Payment[]> {
    return db
      .select()
      .from(payments)
      .where(eq(payments.status, "pending"))
      .orderBy(desc(payments.createdAt));
  }

  // KYC methods
  async createKyc(kycData: InsertKyc): Promise<Kyc> {
    const [newKyc] = await db
      .insert(kyc)
      .values({
        ...kycData,
        status: "pending",
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    
    return newKyc;
  }

  async getKyc(id: number): Promise<Kyc | undefined> {
    const [kycRecord] = await db
      .select()
      .from(kyc)
      .where(eq(kyc.id, id));
    
    return kycRecord;
  }

  async getUserKyc(userId: number): Promise<Kyc | undefined> {
    const [kycRecord] = await db
      .select()
      .from(kyc)
      .where(eq(kyc.userId, userId))
      .orderBy(desc(kyc.createdAt))
      .limit(1);
    
    return kycRecord;
  }

  async updateKyc(id: number, data: Partial<Kyc>): Promise<Kyc | undefined> {
    const [updatedKyc] = await db
      .update(kyc)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(kyc.id, id))
      .returning();
    
    // If a KYC is approved or rejected, also update the user's KYC status
    if (data.status && ["approved", "rejected"].includes(data.status)) {
      const kycRecord = await this.getKyc(id);
      if (kycRecord) {
        await db
          .update(users)
          .set({ kycStatus: data.status })
          .where(eq(users.id, kycRecord.userId));
      }
    }
    
    return updatedKyc;
  }

  async getPendingKyc(): Promise<Kyc[]> {
    return db
      .select()
      .from(kyc)
      .where(eq(kyc.status, "pending"))
      .orderBy(desc(kyc.createdAt));
  }

  // Activity methods
  async createActivity(activity: InsertActivity): Promise<Activity> {
    const [newActivity] = await db
      .insert(activities)
      .values({
        ...activity,
        createdAt: new Date()
      })
      .returning();
    
    return newActivity;
  }

  async getUserActivities(userId: number): Promise<Activity[]> {
    return db
      .select()
      .from(activities)
      .where(eq(activities.userId, userId))
      .orderBy(desc(activities.createdAt));
  }

  // Settings methods
  async getSetting(key: string): Promise<string | undefined> {
    const [setting] = await db
      .select()
      .from(settings)
      .where(eq(settings.key, key));
    
    return setting?.value;
  }

  async setSetting(key: string, value: string): Promise<boolean> {
    const [existingSetting] = await db
      .select()
      .from(settings)
      .where(eq(settings.key, key));
    
    if (existingSetting) {
      await db
        .update(settings)
        .set({ value })
        .where(eq(settings.key, key));
    } else {
      await db
        .insert(settings)
        .values({ key, value });
    }
    
    return true;
  }

  async getAllSettings(): Promise<Setting[]> {
    return db
      .select()
      .from(settings)
      .orderBy(asc(settings.key));
  }

  // Product methods
  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db
      .insert(products)
      .values({
        ...product,
        isApproved: product.isApproved || false,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    
    return newProduct;
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, id));
    
    return product;
  }

  async getUserProducts(userId: number): Promise<Product[]> {
    return db
      .select()
      .from(products)
      .where(eq(products.userId, userId))
      .orderBy(desc(products.createdAt));
  }

  async updateProduct(id: number, data: Partial<Product>): Promise<Product | undefined> {
    const [updatedProduct] = await db
      .update(products)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<boolean> {
    const result = await db
      .delete(products)
      .where(eq(products.id, id));
    
    return result.count > 0;
  }

  async getApprovedProducts(): Promise<Product[]> {
    return db
      .select()
      .from(products)
      .where(eq(products.isApproved, true))
      .orderBy(desc(products.createdAt));
  }

  async getPendingProducts(): Promise<Product[]> {
    return db
      .select()
      .from(products)
      .where(eq(products.isApproved, false))
      .orderBy(desc(products.createdAt));
  }

  // Service methods
  async createService(service: InsertService): Promise<Service> {
    const [newService] = await db
      .insert(services)
      .values({
        ...service,
        isActive: service.isActive || true,
        createdAt: new Date()
      })
      .returning();
    
    return newService;
  }

  async getService(id: number): Promise<Service | undefined> {
    const [service] = await db
      .select()
      .from(services)
      .where(eq(services.id, id));
    
    return service;
  }

  async getServiceBySlug(slug: string): Promise<Service | undefined> {
    const [service] = await db
      .select()
      .from(services)
      .where(eq(services.slug, slug));
    
    return service;
  }

  async getAllServices(): Promise<Service[]> {
    return db
      .select()
      .from(services)
      .orderBy(asc(services.name));
  }

  async getActiveServices(): Promise<Service[]> {
    return db
      .select()
      .from(services)
      .where(eq(services.isActive, true))
      .orderBy(asc(services.name));
  }

  async updateService(id: number, data: Partial<Service>): Promise<Service | undefined> {
    const [updatedService] = await db
      .update(services)
      .set(data)
      .where(eq(services.id, id))
      .returning();
    
    return updatedService;
  }

  // Country methods
  async createCountry(country: InsertCountry): Promise<Country> {
    const [newCountry] = await db
      .insert(countries)
      .values({
        ...country,
        isActive: country.isActive || true,
        createdAt: new Date()
      })
      .returning();
    
    return newCountry;
  }

  async getCountry(id: number): Promise<Country | undefined> {
    const [country] = await db
      .select()
      .from(countries)
      .where(eq(countries.id, id));
    
    return country;
  }

  async getCountryByCode(code: string): Promise<Country | undefined> {
    const [country] = await db
      .select()
      .from(countries)
      .where(eq(countries.code, code));
    
    return country;
  }

  async getAllCountries(): Promise<Country[]> {
    return db
      .select()
      .from(countries)
      .orderBy(asc(countries.name));
  }

  async getActiveCountries(): Promise<Country[]> {
    return db
      .select()
      .from(countries)
      .where(eq(countries.isActive, true))
      .orderBy(asc(countries.name));
  }

  async updateCountry(id: number, data: Partial<Country>): Promise<Country | undefined> {
    const [updatedCountry] = await db
      .update(countries)
      .set(data)
      .where(eq(countries.id, id))
      .returning();
    
    return updatedCountry;
  }

  // AI Chat methods
  async createAiChat(chat: InsertAiChat): Promise<AiChat> {
    const [newChat] = await db
      .insert(aiChats)
      .values({
        ...chat,
        createdAt: new Date()
      })
      .returning();
    
    return newChat;
  }

  async getUserChats(userId: number): Promise<AiChat[]> {
    return db
      .select()
      .from(aiChats)
      .where(eq(aiChats.userId, userId))
      .orderBy(desc(aiChats.createdAt));
  }
}