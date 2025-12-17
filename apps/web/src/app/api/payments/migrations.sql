-- Payments Database Schema
-- Run these migrations in your Neon database

-- Crypto payments tracking
CREATE TABLE IF NOT EXISTS crypto_payments (
  id SERIAL PRIMARY KEY,
  payment_id VARCHAR(100) NOT NULL UNIQUE,
  user_id VARCHAR(255) NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  package_id VARCHAR(50) NOT NULL,
  bits_amount INTEGER NOT NULL,
  price_usd DECIMAL(10, 2) NOT NULL,
  wallet_type VARCHAR(20) NOT NULL, -- 'metamask', 'coinbase', 'phantom'
  chain VARCHAR(20), -- 'ethereum', 'solana', 'polygon'
  tx_hash VARCHAR(100),
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'expired'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '30 minutes'
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_crypto_payments_user ON crypto_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_crypto_payments_status ON crypto_payments(status);
CREATE INDEX IF NOT EXISTS idx_crypto_payments_tx ON crypto_payments(tx_hash);

-- Function to expire old pending payments
CREATE OR REPLACE FUNCTION expire_pending_payments() RETURNS void AS $$
BEGIN
  UPDATE crypto_payments 
  SET status = 'expired' 
  WHERE status = 'pending' AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

