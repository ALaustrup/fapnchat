-- Enhanced Profile System Database Schema
-- Run these migrations in your Neon database

-- Add new columns to user_profiles (if table exists, use ALTER TABLE)
-- If creating fresh, use this CREATE TABLE:

CREATE TABLE IF NOT EXISTS user_profiles (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL UNIQUE REFERENCES auth_users(id) ON DELETE CASCADE,
  
  -- Basic Info
  display_name VARCHAR(50),
  bio TEXT,
  interests TEXT[] DEFAULT '{}',
  
  -- Media
  avatar_url TEXT,
  banner_url TEXT,
  
  -- Customization
  theme_color VARCHAR(20) DEFAULT '#7A5AF8',
  profile_music_url TEXT,
  profile_music_provider VARCHAR(20), -- 'spotify', 'soundcloud'
  
  -- Additional Info
  location VARCHAR(100),
  website VARCHAR(255),
  social_links JSONB DEFAULT '{}', -- { twitter: "", instagram: "", etc }
  
  -- Privacy Settings
  is_private BOOLEAN DEFAULT false,
  show_online_status BOOLEAN DEFAULT true,
  show_now_playing BOOLEAN DEFAULT true,
  
  -- Stats
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  posts_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- If table already exists, run these ALTER statements:
-- ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS banner_url TEXT;
-- ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS theme_color VARCHAR(20) DEFAULT '#7A5AF8';
-- ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS profile_music_url TEXT;
-- ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS profile_music_provider VARCHAR(20);
-- ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS location VARCHAR(100);
-- ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS website VARCHAR(255);
-- ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}';
-- ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS is_private BOOLEAN DEFAULT false;
-- ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS show_online_status BOOLEAN DEFAULT true;
-- ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS show_now_playing BOOLEAN DEFAULT true;
-- ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS followers_count INTEGER DEFAULT 0;
-- ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS following_count INTEGER DEFAULT 0;
-- ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS posts_count INTEGER DEFAULT 0;

-- User follows/followers
CREATE TABLE IF NOT EXISTS user_follows (
  id SERIAL PRIMARY KEY,
  follower_id VARCHAR(255) NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  following_id VARCHAR(255) NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

-- Online status tracking
CREATE TABLE IF NOT EXISTS user_online_status (
  user_id VARCHAR(255) PRIMARY KEY REFERENCES auth_users(id) ON DELETE CASCADE,
  is_online BOOLEAN DEFAULT false,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_user ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_follower ON user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following ON user_follows(following_id);
CREATE INDEX IF NOT EXISTS idx_user_online_status ON user_online_status(is_online);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

