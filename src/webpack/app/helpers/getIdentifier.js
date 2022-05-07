import { capitalize } from './capitalize';

/**
 * Get a consistent ID
 *
 * @param {string} title
 * @return {string}
 */
export const getIdentifier = title =>
  capitalize(
    title
      .replace(/^[^A-Za-z]/, '')
      .replace(/\s+([a-z])?/g, (_, match) => (match ? capitalize(match) : ''))
      .replace(/[^A-Za-z0-9_]/g, '')
  );
