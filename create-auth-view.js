// Create auth_users view for compatibility with migrations
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL environment variable is required');
  process.exit(1);
}

const pool = new Pool({ connectionString: DATABASE_URL });

async function createView() {
  try {
    // Check neon_auth.user structure first
    const userColumns = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'neon_auth' AND table_name = 'user'
      ORDER BY ordinal_position
    `);
    
    console.log('neon_auth.user columns:', userColumns.rows.map(c => c.column_name).join(', '));
    
    // Create view mapping auth_users to neon_auth.user
    // Note: neon_auth.user uses camelCase columns
    await pool.query(`
      CREATE OR REPLACE VIEW auth_users AS 
      SELECT 
        id,
        email,
        name,
        image as picture,
        "emailVerified" as email_verified,
        "createdAt" as created_at,
        "updatedAt" as updated_at
      FROM neon_auth.user
    `);
    
    console.log('✅ Created auth_users view');
    
    // Verify view exists
    const viewCheck = await pool.query(`
      SELECT table_name 
      FROM information_schema.views 
      WHERE table_schema = 'public' AND table_name = 'auth_users'
    `);
    
    if (viewCheck.rows.length > 0) {
      console.log('✅ View verified');
    }
  } catch (error) {
    console.error('Error creating view:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

createView();

