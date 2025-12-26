// Quick database connection test
import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_a5R9CDbJedkp@ep-sparkling-cell-aecjn7xp.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const sql = neon(DATABASE_URL);

try {
  const result = await sql`SELECT version()`;
  console.log('PostgreSQL Version:');
  console.log(result[0].version);
  
  const dbInfo = await sql`SELECT current_database(), current_user, version()`;
  console.log('\nDatabase Info:');
  console.log('Database:', dbInfo[0].current_database);
  console.log('User:', dbInfo[0].current_user);
  
  const tables = await sql`
    SELECT table_schema, table_name 
    FROM information_schema.tables 
    WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
    ORDER BY table_schema, table_name
  `;
  console.log('\nTables:', tables.length);
  if (tables.length > 0) {
    tables.forEach(t => console.log('  -', t.table_schema + '.' + t.table_name));
  } else {
    console.log('  No tables found. Migrations may need to be run.');
  }
  
  // Check for public schema tables (application tables)
  const publicTables = await sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
    ORDER BY table_name
  `;
  console.log('\nPublic schema tables:', publicTables.length);
  if (publicTables.length > 0) {
    publicTables.forEach(t => console.log('  -', t.table_name));
  } else {
    console.log('  ⚠️  No tables in public schema. Migrations may need to be run.');
  }
  
  // List all schemas
  const schemas = await sql`
    SELECT schema_name 
    FROM information_schema.schemata 
    WHERE schema_name NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
    ORDER BY schema_name
  `;
  console.log('\nAvailable schemas:', schemas.map(s => s.schema_name).join(', '));
} catch (error) {
  console.error('Database connection error:', error.message);
  process.exit(1);
}

