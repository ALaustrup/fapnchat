// Run migrations using Node.js and Neon
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Configure WebSocket for Node.js environment
neonConfig.webSocketConstructor = ws;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL environment variable is required');
  process.exit(1);
}

const pool = new Pool({ connectionString: DATABASE_URL });

// Run bits migration first as it creates the update_updated_at_column function
const migrations = [
  'src/app/api/bits/migrations.sql', // First - creates update_updated_at_column function
  'src/app/api/profile/migrations.sql',
  'src/app/api/payments/migrations.sql',
  'src/app/api/music/migrations.sql',
  'src/app/api/chatrooms/migrations.sql',
  'src/app/api/webrtc/migrations.sql',
];

async function runMigrations() {
  console.log('🚀 Running FapNChat database migrations...\n');
  
  for (const migrationPath of migrations) {
    try {
      const fullPath = join(__dirname, migrationPath);
      console.log(`📝 Running: ${migrationPath}`);
      
      const migrationSQL = readFileSync(fullPath, 'utf-8');
      
      // Execute the entire migration file as-is
      // PostgreSQL can handle multiple statements separated by semicolons
      // We'll execute it in one go, but Neon's Pool.query might need it split
      // For now, let's try executing the whole file
      const cleanSQL = migrationSQL
        .split('\n')
        .filter(line => !line.trim().startsWith('--')) // Remove comment lines
        .join('\n');
      
      // Split by semicolon but preserve dollar-quoted strings
      const statements = [];
      let currentStatement = '';
      let inDollarQuote = false;
      let dollarTag = '';
      
      for (let i = 0; i < cleanSQL.length; i++) {
        const char = cleanSQL[i];
        const nextChar = cleanSQL[i + 1];
        
        // Check for dollar quote start/end
        if (char === '$' && !inDollarQuote) {
          // Find the tag
          let tagEnd = cleanSQL.indexOf('$', i + 1);
          if (tagEnd > i) {
            dollarTag = cleanSQL.substring(i, tagEnd + 1);
            inDollarQuote = true;
            currentStatement += dollarTag;
            i = tagEnd;
            continue;
          }
        } else if (inDollarQuote && cleanSQL.substring(i).startsWith(dollarTag)) {
          currentStatement += dollarTag;
          i += dollarTag.length - 1;
          inDollarQuote = false;
          dollarTag = '';
          continue;
        }
        
        currentStatement += char;
        
        // If we hit a semicolon and we're not in a dollar quote, it's a statement end
        if (char === ';' && !inDollarQuote) {
          const trimmed = currentStatement.trim();
          if (trimmed.length > 0) {
            statements.push(trimmed);
          }
          currentStatement = '';
        }
      }
      
      // Add any remaining statement
      if (currentStatement.trim().length > 0) {
        statements.push(currentStatement.trim());
      }
      
      // Execute each statement separately using Pool
      for (const statement of statements) {
        if (statement.trim().length > 0) {
          try {
            // Replace REFERENCES auth_users with just the column (no FK constraint)
            // since auth_users is a view, not a table
            let modifiedStatement = statement;
            modifiedStatement = modifiedStatement.replace(
              /REFERENCES auth_users\(id\) ON DELETE CASCADE/gi,
              ''
            );
            modifiedStatement = modifiedStatement.replace(
              /REFERENCES auth_users\(id\)/gi,
              ''
            );
            
            await pool.query(modifiedStatement + ';');
          } catch (error) {
            // Ignore "already exists" errors for idempotency
            if (error.message && (
              error.message.includes('already exists') ||
              error.message.includes('does not exist') && error.message.includes('DROP') ||
              error.message.includes('is not a table') ||
              error.message.includes('referenced relation') && error.message.includes('not a table')
            )) {
              // Skip - already exists or safe to ignore
              console.log(`⚠️  Skipped statement due to: ${error.message.split('\n')[0]}`);
              continue;
            }
            throw error;
          }
        }
      }
      
      console.log(`✅ Completed: ${migrationPath}\n`);
    } catch (error) {
      // Ignore "already exists" errors
      if (error.message && error.message.includes('already exists')) {
        console.log(`⚠️  Skipped (already exists): ${migrationPath}\n`);
      } else {
        console.error(`❌ Error running ${migrationPath}:`, error.message);
        throw error;
      }
    }
  }
  
  console.log('🎉 All migrations completed successfully!\n');
  
  // Verify tables
  const tablesResult = await pool.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
    ORDER BY table_name
  `);
  const tables = tablesResult.rows;
  
  console.log(`📋 Verifying tables (${tables.length} found):`);
  tables.forEach(t => console.log(`  - ${t.table_name}`));
}

runMigrations().catch(error => {
  console.error('Migration failed:', error);
  process.exit(1);
}).finally(() => {
  pool.end();
});

