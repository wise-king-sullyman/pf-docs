/**
 * Return a formatted title.
 *
 * @param {string} title
 * @param {string} prefix
 * @returns {`PatternFly${string|string}`}
 */
export const getTitle = (title, prefix = 'PatternFly') => `${prefix}${title ? ` • ${title}` : ''}`;
