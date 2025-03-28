CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  full_name TEXT NOT NULL,
  balance DOUBLE PRECISION DEFAULT 0 NOT NULL,
  referral_wallet_balance DOUBLE PRECISION DEFAULT 0 NOT NULL,
  referral_code TEXT NOT NULL UNIQUE,
  referred_by TEXT,
  referral_count INTEGER DEFAULT 0 NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE NOT NULL,
  is_banned BOOLEAN DEFAULT FALSE NOT NULL,
  kyc_status TEXT DEFAULT 'pending' NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS phone_numbers (
  id SERIAL PRIMARY KEY,
  number TEXT NOT NULL UNIQUE,
  country TEXT NOT NULL,
  service TEXT NOT NULL DEFAULT 'WhatsApp',
  price DOUBLE PRECISION NOT NULL,
  is_available BOOLEAN DEFAULT TRUE NOT NULL,
  stock_count INTEGER DEFAULT 1 NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  phone_number_id INTEGER NOT NULL,
  status TEXT DEFAULT 'pending' NOT NULL,
  payment_method TEXT NOT NULL,
  total_amount DOUBLE PRECISION NOT NULL,
  is_referral_reward BOOLEAN DEFAULT FALSE NOT NULL,
  code TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  order_id INTEGER,
  amount DOUBLE PRECISION NOT NULL,
  method TEXT NOT NULL,
  status TEXT DEFAULT 'pending' NOT NULL,
  reference TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS kyc (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country TEXT NOT NULL,
  id_type TEXT NOT NULL,
  id_front TEXT NOT NULL,
  id_back TEXT NOT NULL,
  selfie TEXT NOT NULL,
  status TEXT DEFAULT 'pending' NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS settings (
  id SERIAL PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS activities (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  action TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price DOUBLE PRECISION NOT NULL,
  category TEXT NOT NULL,
  images TEXT[] NOT NULL,
  status TEXT DEFAULT 'active' NOT NULL,
  is_admin_approved BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS services (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS countries (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  flag TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_chats (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  message TEXT NOT NULL,
  response TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create the sessions table required by express-session with connect-pg-simple
CREATE TABLE IF NOT EXISTS "session" (
  "sid" varchar NOT NULL COLLATE "default",
  "sess" json NOT NULL,
  "expire" timestamp(6) NOT NULL,
  CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
);