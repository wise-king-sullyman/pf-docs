/**
 * Capitalize a string.
 *
 * @param {string} input
 * @returns {string}
 */
const capitalize = input => `${input}`?.[0]?.toUpperCase() + `${input}`?.substring(1);

module.exports = {
  capitalize
};
