import pg from 'pg';
import { neon, neonConfig } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

// Polyfill fetch for Node.js 16 (required for Neon serverless)
if (!globalThis.fetch) {
  const fetch = (await import('node-fetch')).default;
  globalThis.fetch = fetch;
}

const { Pool } = pg;

// Auto-detect Neon and use serverless mode (HTTPS instead of TCP port 5432)
// This is needed for hosts like cPanel that block outbound port 5432
const isNeonUrl = process.env.DATABASE_URL && process.env.DATABASE_URL.includes('neon.tech');
const useNeonServerless = isNeonUrl && process.env.NODE_ENV === 'production';

console.log(`🔧 Database mode: ${useNeonServerless ? 'Neon Serverless (HTTPS)' : 'Standard PostgreSQL (TCP)'}`);

// Neon serverless SQL function (uses HTTPS, no port 5432 needed)
const neonSql = useNeonServerless ? neon(process.env.DATABASE_URL) : null;

// PostgreSQL connection pool configuration (for local dev or unrestricted hosts)
const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
      max: 5,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 10000,
    }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'MailPal',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD,
      max: 5,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 2000,
    };

// Only create pool if not using serverless
const pool = useNeonServerless ? null : new Pool(poolConfig);

// Test database connection
if (pool) {
  pool.on('connect', () => {
    console.log('✅ Connected to PostgreSQL database');
  });

  pool.on('error', (err) => {
    console.error('❌ Unexpected error on idle client', err);
    process.exit(-1);
  });
}

// Query helper - uses serverless or pool based on config
export const query = async (text, params) => {
  const start = Date.now();
  try {
    let res;
    if (useNeonServerless) {
      // Neon serverless mode (HTTPS)
      const rows = await neonSql(text, params || []);
      res = { rows, rowCount: rows.length };
    } else {
      // Traditional pool mode (TCP)
      res = await pool.query(text, params);
    }
    const duration = Date.now() - start;
    console.log('Executed query', { text: text.substring(0, 50), duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

// Transaction helper (only works with pool, not serverless)
export const transaction = async (callback) => {
  if (useNeonServerless) {
    // For serverless, we can't use traditional transactions
    // Just execute the callback directly
    console.warn('Transactions not fully supported in serverless mode');
    return await callback({ query: async (text, params) => {
      const rows = await neonSql(text, params || []);
      return { rows, rowCount: rows.length };
    }});
  }
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// Test connection function
export const testConnection = async () => {
  try {
    const result = await query('SELECT NOW()');
    console.log('✅ Database connection test successful:', result.rows[0]);
    return true;
  } catch (error) {
    console.error('❌ Database connection test failed:', error);
    return false;
  }
};

export default pool;
