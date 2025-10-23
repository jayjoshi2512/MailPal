import pg from 'pg';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Pool } = pg;

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'mailkar',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '123',
});

async function initializeDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Initializing database...\n');

    // Read and execute schema file
    const schemaPath = path.join(__dirname, 'database-schema.sql');
    const schema = await fs.readFile(schemaPath, 'utf-8');
    
    await client.query(schema);
    console.log('✅ Database schema created successfully!\n');

    // Check tables
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);

    console.log('📋 Created tables:');
    result.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });

    // Count existing data
    console.log('\n📊 Current data:');
    const counts = await Promise.all([
      client.query('SELECT COUNT(*) FROM users'),
      client.query('SELECT COUNT(*) FROM campaigns'),
      client.query('SELECT COUNT(*) FROM contacts'),
      client.query('SELECT COUNT(*) FROM sent_emails'),
    ]);

    console.log(`   - Users: ${counts[0].rows[0].count}`);
    console.log(`   - Campaigns: ${counts[1].rows[0].count}`);
    console.log(`   - Contacts: ${counts[2].rows[0].count}`);
    console.log(`   - Sent Emails: ${counts[3].rows[0].count}`);

    console.log('\n✅ Database initialization complete!');
    console.log('👉 You can now start sending emails and they will be tracked.\n');

  } catch (error) {
    console.error('❌ Error initializing database:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run initialization
initializeDatabase()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
