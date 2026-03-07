import app from './app.ts';
import pool from './db/pool.ts';

const PORT = process.env.PORT ?? '3000';
const SHUTDOWN_TIMEOUT_MS = 10_000;

const server = app
  .listen(PORT, () => console.info(`FeetBack API listening on port ${PORT}`))
  .on('error', (err: Error) => {
    console.error('Server error:', err);
    process.exit(1);
  });

let shuttingDown = false;

const shutdown = (signal: NodeJS.Signals) => {
  if (shuttingDown) return;
  shuttingDown = true;

  console.info(`${signal} received, starting graceful shutdown...`);

  const timeout = setTimeout(() => {
    console.error('Graceful shutdown timed out. Exiting forcefully.');
    process.exit(1);
  }, SHUTDOWN_TIMEOUT_MS);

  server.close(async (serverCloseErr) => {
    if (serverCloseErr) {
      clearTimeout(timeout);
      console.error('Error closing HTTP server:', serverCloseErr);
      process.exit(1);
      return;
    }

    try {
      await pool.end();
      clearTimeout(timeout);
      console.info('HTTP server and PostgreSQL pool closed. Shutdown complete.');
      process.exit(0);
    } catch (poolCloseErr) {
      clearTimeout(timeout);
      console.error('Error closing PostgreSQL pool:', poolCloseErr);
      process.exit(1);
    }
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
