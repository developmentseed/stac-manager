/* global process */
import log from 'fancy-log';
import dotenv from 'dotenv';

/**
 * Check if required environment variables are set
 * @param {string[]} requiredVars - Array of required environment variable names
 * @throws {Error} - If any required variables are missing
 */
export function checkRequiredEnvVars(requiredVars) {
  const missingVars = requiredVars.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0) {
    log.error('ERROR: Missing required environment variables:');
    missingVars.forEach((v) => log.error(`  - ${v}`));
    console.log(); // eslint-disable-line no-console
    log.info('Make sure to:');
    log.info('1. Copy .env.example to .env');
    log.info('2. Fill in all required values in .env');
    console.log(); // eslint-disable-line no-console
    process.exit(1);
  }
}

/**
 * Loads environment variables from `.env` files based on the current
 * `NODE_ENV`.
 *
 * The function determines the appropriate `.env` files to load in the following
 * order:
 * 1. `.env` - Always included.
 * 2. `.env.local` - Included unless the `NODE_ENV` is `test`.
 * 3. `.env.<NODE_ENV>` - Included based on the current `NODE_ENV`.
 * 4. `.env.<NODE_ENV>.local` - Included based on the current `NODE_ENV`.
 *
 * Files are loaded in the order specified above, and later files override
 * variables from earlier ones. The `.env.local` file is skipped for the `test`
 * environment to ensure consistent test results across different environments.
 */
export function loadEnvironmentVariables() {
  const dotenvFiles = [
    '.env',
    // Don't include `.env.local` for `test` environment
    // since normally you expect tests to produce the same
    // results for everyone
    process.env.NODE_ENV === 'test' ? null : '.env.local',
    `.env.${process.env.NODE_ENV}`,
    `.env.${process.env.NODE_ENV}.local`
  ].filter(Boolean);

  dotenvFiles.forEach((dotenvFile) => {
    dotenv.config({ path: dotenvFile });
  });
}
