-- ============================================================================
-- WYA!? — Age Segmentation Schema (Alpha)
-- ============================================================================
-- 
-- Purpose: Store age layer for users (immutable after creation)
-- Alpha: Self-declared age (soft verification)
-- Beta+: External verification required
--
-- ============================================================================

-- Add age_layer column to auth_users (via user_profiles extension)
-- Note: auth_users is a view, so we store age_layer in user_profiles
-- This ensures age is immutable and tied to user identity

-- Age layer storage (if not exists in user_profiles)
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS age_layer VARCHAR(20) CHECK (age_layer IN ('minor', 'transitional', 'adult'));

ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS birth_date DATE; -- Stored for verification (Beta+)

ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS age_verified_at TIMESTAMP WITH TIME ZONE; -- NULL for Alpha (self-declared)

-- Index for age layer queries (discovery, filtering)
CREATE INDEX IF NOT EXISTS idx_user_profiles_age_layer ON user_profiles(age_layer);

-- ============================================================================
-- Alpha Notes:
-- - age_layer is set at signup and IMMUTABLE
-- - birth_date stored but not verified in Alpha
-- - age_verified_at is NULL for Alpha (self-declared)
-- - Beta+ will require external verification and set age_verified_at
-- ============================================================================

