/**
 * WYA!? — Feature Flags (Alpha)
 * 
 * Purpose: Control feature rollout and kill switches
 * 
 * Feel: Explicit, safe, reversible
 * - Feature flags via environment variables
 * - Kill switches for risky features
 * - No magic, all explicit
 * - Easy to disable everything
 * 
 * Usage:
 * if (isFeatureEnabled('group_rooms')) {
 *   // Feature code
 * }
 */

/**
 * Feature flag configuration
 * Maps feature names to environment variable names
 */
const FEATURE_FLAGS = {
  // Core features
  group_rooms: 'ENABLE_GROUP_ROOMS',
  profile_rooms: 'ENABLE_PROFILE_ROOMS',
  guestbook: 'ENABLE_GUESTBOOK',
  
  // Risky features (kill switches)
  realtime_chat: 'ENABLE_REALTIME_CHAT',
  file_uploads: 'ENABLE_FILE_UPLOADS',
  music_player: 'ENABLE_MUSIC_PLAYER',
  
  // Experimental features
  drag_drop_modules: 'ENABLE_DRAG_DROP_MODULES',
  reactions: 'ENABLE_REACTIONS',
  
  // Safety features
  content_moderation: 'ENABLE_CONTENT_MODERATION',
  auto_moderation: 'ENABLE_AUTO_MODERATION', // Kill switch for auto-mod
};

/**
 * Check if feature is enabled
 * @param {string} featureName - Feature name
 * @param {boolean} defaultValue - Default value if env var not set
 * @returns {boolean} True if feature is enabled
 */
export function isFeatureEnabled(featureName, defaultValue = true) {
  const envVarName = FEATURE_FLAGS[featureName];
  
  if (!envVarName) {
    // Feature not in config - default to false for safety
    console.warn(`Feature flag "${featureName}" not found in config. Defaulting to disabled.`);
    return false;
  }

  const envValue = process.env[envVarName];
  
  // If env var is explicitly set, use it
  if (envValue !== undefined) {
    return envValue === 'true' || envValue === '1';
  }

  // Otherwise use default
  return defaultValue;
}

/**
 * Check if feature is disabled (kill switch)
 * @param {string} featureName - Feature name
 * @returns {boolean} True if feature is disabled
 */
export function isFeatureDisabled(featureName) {
  return !isFeatureEnabled(featureName, false);
}

/**
 * Get all feature flags status
 * @returns {object} Map of feature names to enabled status
 */
export function getAllFeatureFlags() {
  const flags = {};
  for (const [featureName, envVarName] of Object.entries(FEATURE_FLAGS)) {
    flags[featureName] = isFeatureEnabled(featureName, false);
  }
  return flags;
}

/**
 * Require feature (throws if disabled)
 * @param {string} featureName - Feature name
 * @throws {Error} If feature is disabled
 */
export function requireFeature(featureName) {
  if (!isFeatureEnabled(featureName)) {
    throw new Error(`Feature "${featureName}" is disabled`);
  }
}

/**
 * Kill switch: Disable all risky features
 * @returns {boolean} True if kill switch is active
 */
export function isKillSwitchActive() {
  return process.env.KILL_SWITCH === 'true' || process.env.KILL_SWITCH === '1';
}

/**
 * Check if feature should be disabled due to kill switch
 * @param {string} featureName - Feature name
 * @returns {boolean} True if feature should be disabled
 */
export function isKilled(featureName) {
  // Kill switch disables all risky features
  const riskyFeatures = [
    'realtime_chat',
    'file_uploads',
    'auto_moderation',
  ];

  if (isKillSwitchActive() && riskyFeatures.includes(featureName)) {
    return true;
  }

  return false;
}

/**
 * Safe feature check (respects kill switch)
 * @param {string} featureName - Feature name
 * @param {boolean} defaultValue - Default value
 * @returns {boolean} True if feature is enabled and not killed
 */
export function isFeatureSafe(featureName, defaultValue = true) {
  if (isKilled(featureName)) {
    return false;
  }
  return isFeatureEnabled(featureName, defaultValue);
}

