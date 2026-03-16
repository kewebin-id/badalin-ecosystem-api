import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { globalLogger as Logger } from './logger';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
  // eslint-disable-next-line no-var
  var dbPool: Pool | undefined;
}

const pool =
  global.dbPool ||
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 20,
    min: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    statement_timeout: 30000,
    query_timeout: 30000,
    allowExitOnIdle: false,
  });

let poolEnded = false;

pool.on('error', (err) => {
  if (!poolEnded) {
    Logger.error(`Unexpected error on idle database client: ${err.message}`, err.stack, 'DatabasePool');
  }
});

pool.on('connect', () => {
  Logger.debug('New database client connected', 'DatabasePool');
});

pool.on('remove', () => {
  Logger.debug('Database client removed from pool', 'DatabasePool');
});

if (process.env.NODE_ENV !== 'production') {
  global.dbPool = pool;
}

const adapter = new PrismaPg(pool);

const transactionTimeout = parseInt(process.env.PRISMA_TRANSACTION_TIMEOUT || '5000', 10);

export const clientDb =
  global.prisma ||
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['warn', 'error'],
    transactionOptions: {
      timeout: transactionTimeout,
    },
  });

clientDb.$on('error' as never, (e: Error) => {
  Logger.error(`Prisma Client Error: ${e.message}`, e.stack, 'PrismaClient');
});

if (process.env.NODE_ENV !== 'production') {
  global.prisma = clientDb;
}

if (typeof process !== 'undefined') {
  let isShuttingDown = false;

  const gracefulShutdown = async () => {
    if (isShuttingDown) {
      return;
    }
    isShuttingDown = true;
    poolEnded = true;

    Logger.info('Shutting down database connections...', 'DatabaseShutdown');
    try {
      await clientDb.$disconnect();
      Logger.info('Database connections closed successfully', 'DatabaseShutdown');
    } catch (error) {
      Logger.error(
        `Error during database shutdown: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
        'DatabaseShutdown',
      );
    }
  };

  process.on('SIGINT', gracefulShutdown);
  process.on('SIGTERM', gracefulShutdown);
}

export { pool as dbPool };
