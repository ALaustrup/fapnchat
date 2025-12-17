-- Bits Currency System Database Schema
-- Run these migrations in your Neon database

-- User bits balance table
CREATE TABLE IF NOT EXISTS user_bits (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL UNIQUE REFERENCES auth_users(id) ON DELETE CASCADE,
  balance INTEGER NOT NULL DEFAULT 0 CHECK (balance >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bits purchase history
CREATE TABLE IF NOT EXISTS bits_purchases (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  package_id VARCHAR(50) NOT NULL,
  bits_amount INTEGER NOT NULL,
  price_usd DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  payment_token TEXT,
  payment_id TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bits transactions (tips between users)
CREATE TABLE IF NOT EXISTS bits_transactions (
  id SERIAL PRIMARY KEY,
  sender_id VARCHAR(255) NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  recipient_id VARCHAR(255) NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL CHECK (amount > 0),
  message TEXT,
  context VARCHAR(50) DEFAULT 'direct', -- 'direct', 'chatroom', 'videochat', 'post', 'message'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_bits_user_id ON user_bits(user_id);
CREATE INDEX IF NOT EXISTS idx_bits_purchases_user_id ON bits_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_bits_transactions_sender ON bits_transactions(sender_id);
CREATE INDEX IF NOT EXISTS idx_bits_transactions_recipient ON bits_transactions(recipient_id);
CREATE INDEX IF NOT EXISTS idx_bits_transactions_created ON bits_transactions(created_at DESC);

-- Trigger to update updated_at on user_bits
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_user_bits_updated_at ON user_bits;
CREATE TRIGGER update_user_bits_updated_at
  BEFORE UPDATE ON user_bits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

