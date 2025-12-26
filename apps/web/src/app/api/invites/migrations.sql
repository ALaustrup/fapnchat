-- ============================================================================
-- WYA!? — Invite Codes Table (Alpha)
-- ============================================================================
-- 
-- Purpose: Simple invite-only access for Alpha deployment
-- 
-- Alpha Notes:
-- - Single-use invite codes
-- - No expiration (manual cleanup for Alpha)
-- - Simple code format (8-char alphanumeric)
-- - Tracks who used which code
-- 
-- ============================================================================

CREATE TABLE IF NOT EXISTS invite_codes (
  id SERIAL PRIMARY KEY,
  code VARCHAR(20) NOT NULL UNIQUE,
  created_by VARCHAR(255), -- Optional: admin user ID
  used_by VARCHAR(255) REFERENCES auth_users(id) ON DELETE SET NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexes
  CONSTRAINT idx_invite_codes_code UNIQUE (code)
);

CREATE INDEX IF NOT EXISTS idx_invite_codes_used_by ON invite_codes(used_by);
CREATE INDEX IF NOT EXISTS idx_invite_codes_used_at ON invite_codes(used_at);

-- ============================================================================
-- Alpha: Insert initial invite codes
-- ============================================================================
-- Run this manually to create initial invite codes:
-- INSERT INTO invite_codes (code) VALUES ('ALPHA001'), ('ALPHA002'), ('ALPHA003');

