/**
 * WYA!? — Environment Variable Validation (Alpha)
 * 
 * Purpose: Fail fast on missing/invalid env vars
 * 
 * Alpha Notes:
 * - Strict validation for production
 * - Clear error messages
 * - No defaults for critical vars (fail loudly)
 * - Validates only Alpha-required vars
 */

/**
 * Required environment variables for Alpha deployment
 * 
 * Critical (will crash if missing):
 * - DATABASE_URL: Database connection string
 * - AUTH_SECRET: Session encryption secret
 * - NEXT_PUBLIC_APP_URL: Public app URL
 * 
 * Optional (with defaults):
 * - PORT: Server port (default: 4000)
 * - HOST: Server host (default: 0.0.0.0)
 * - LOG_LEVEL: Logging level (default: info)
 * - CORS_ORIGINS: CORS allowed origins (default: none)
 */
const REQUIRED_ENV_VARS = [
  'DATABASE_URL',
  'AUTH_SECRET',
  'NEXT_PUBLIC_APP_URL',
];

const OPTIONAL_ENV_VARS = {
  PORT: '4000',
  HOST: '0.0.0.0',
  LOG_LEVEL: 'info',
  CORS_ORIGINS: undefined,
};

/**
 * Validate environment variables
 * @throws {Error} If required vars are missing or invalid
 */
export function validateEnv() {
  const errors = [];
  const warnings = [];

  // Check required vars
  for (const varName of REQUIRED_ENV_VARS) {
    const value = process.env[varName];
    
    if (!value || value.trim() === '') {
      errors.push(`Missing required environment variable: ${varName}`);
      continue;
    }

    // Specific validations
    if (varName === 'DATABASE_URL') {
      if (!value.startsWith('postgresql://') && !value.startsWith('postgres://')) {
        errors.push(`Invalid DATABASE_URL: must start with postgresql:// or postgres://`);
      }
    }

    if (varName === 'AUTH_SECRET') {
      if (value.length < 32) {
        errors.push(`AUTH_SECRET must be at least 32 characters long`);
      }
      // Warn if using default/example value
      if (value.includes('your-auth-secret') || value.includes('example')) {
        warnings.push(`AUTH_SECRET appears to be a placeholder value`);
      }
    }

    if (varName === 'NEXT_PUBLIC_APP_URL') {
      try {
        new URL(value);
      } catch {
        errors.push(`Invalid NEXT_PUBLIC_APP_URL: must be a valid URL`);
      }
    }
  }

  // Set defaults for optional vars
  for (const [varName, defaultValue] of Object.entries(OPTIONAL_ENV_VARS)) {
    if (!process.env[varName] && defaultValue !== undefined) {
      process.env[varName] = defaultValue;
    }
  }

  // Validate optional vars if set
  if (process.env.LOG_LEVEL) {
    const validLevels = ['error', 'warn', 'info', 'debug'];
    if (!validLevels.includes(process.env.LOG_LEVEL)) {
      warnings.push(`Invalid LOG_LEVEL: ${process.env.LOG_LEVEL}. Valid: ${validLevels.join(', ')}`);
      process.env.LOG_LEVEL = 'info'; // Fallback
    }
  }

  // Production-specific checks
  if (process.env.NODE_ENV === 'production') {
    if (process.env.DATABASE_URL?.includes('localhost') || 
        process.env.DATABASE_URL?.includes('127.0.0.1')) {
      warnings.push('DATABASE_URL appears to point to localhost in production');
    }

    if (process.env.NEXT_PUBLIC_APP_URL?.includes('localhost') ||
        process.env.NEXT_PUBLIC_APP_URL?.includes('127.0.0.1')) {
      warnings.push('NEXT_PUBLIC_APP_URL appears to point to localhost in production');
    }
  }

  // Log warnings
  if (warnings.length > 0) {
    console.warn('⚠️  Environment variable warnings:');
    warnings.forEach(warning => console.warn(`   - ${warning}`));
  }

  // Throw on errors
  if (errors.length > 0) {
    console.error('❌ Environment variable validation failed:');
    errors.forEach(error => console.error(`   - ${error}`));
    throw new Error(`Environment validation failed: ${errors.join('; ')}`);
  }

  console.log('✅ Environment variables validated');
}

/**
 * Get validated environment variable
 * @param {string} varName - Variable name
 * @param {string} defaultValue - Default value if not set
 * @returns {string}
 */
export function getEnv(varName, defaultValue = undefined) {
  const value = process.env[varName];
  if (!value && defaultValue === undefined) {
    throw new Error(`Environment variable ${varName} is required but not set`);
  }
  return value || defaultValue;
}

