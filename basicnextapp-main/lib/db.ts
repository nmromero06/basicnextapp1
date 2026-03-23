import { Pool, PoolClient, QueryResultRow, QueryResult } from 'pg';

const globalForPool = global as unknown as { pool: Pool };

// Determine if we are in a serverless environment (Vercel)
const isServerless = process.env.VERCEL === '1';

// ----------------------------
// Hardcoded defaults using ||
// ----------------------------
const connectionConfig = {
  host: process.env.DB_HOST || 'aws-1-ap-southeast-1.pooler.supabase.com',
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || 'postgres.mtlrbheejsanyyvxqpfx',
  password: process.env.DB_PASSWORD || '%e100CDA1205',
  database: process.env.DB_NAME || 'postgres',
  ssl: process.env.DB_HOST && process.env.DB_HOST.includes('localhost') ? false : {
    rejectUnauthorized: false, 
  },
  max: isServerless ? 1 : 10,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: isServerless ? 10000 : 5000,
  keepAlive: true,
};

// Fallback to DATABASE_URL if individual variables are missing
const useExplicitConfig = connectionConfig.host && connectionConfig.user && connectionConfig.password;

const finalConfig = useExplicitConfig
  ? connectionConfig 
  : { 
      connectionString: process.env.DATABASE_URL || 'postgresql://postgres.mtlrbheejsanyyvxqpfx:%e100CDA1205@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres',
      ssl: { rejectUnauthorized: false },
      max: isServerless ? 1 : 10,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: isServerless ? 10000 : 5000,
      keepAlive: true,
    };

console.log(`[DB Config] Host=${connectionConfig.host}, User=${connectionConfig.user}, SSL=${!!finalConfig.ssl}, Max=${finalConfig.max}, Timeout=${finalConfig.connectionTimeoutMillis}`);

export const pool = globalForPool.pool || new Pool(finalConfig);

if (process.env.NODE_ENV !== 'production') globalForPool.pool = pool;

// Debug: Log connection events
pool.on('error', (err) => {
  console.error('[DB Error] Unexpected error on idle client', err);
});

pool.on('connect', () => {
    console.log('[DB] New client connected to pool');
});

pool.on('remove', () => {
    console.log('[DB] Client removed from pool');
});

// Verify connection on startup (only in development)
if (process.env.NODE_ENV !== 'production') {
    (async () => {
      try {
        console.log("ℹ️ Attempting to connect to database...");
        const client = await pool.connect();
        console.log('✅ Database connected successfully');
        client.release();
      } catch (err) {
        console.error('❌ Database connection failed:', err);
      }
    })();
}

// ----------------------------
// Reusable query function
// ----------------------------
export const query = async <T extends QueryResultRow = QueryResultRow>(
  text: string, 
  params?: unknown[]
): Promise<QueryResult<T>> => {
  try {
    return await pool.query<T>(text, params);
  } catch (error: any) {
    if (error.message?.includes('Connection terminated') || error.code === '57P01') {
      console.warn('⚠️ DB Connection terminated, retrying query...');
      return await pool.query<T>(text, params);
    }
    throw error;
  }
};