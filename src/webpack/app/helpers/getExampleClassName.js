import { slugger } from './slugger';

/**
 * Get example class name
 *
 * @param {string} source
 * @param {string} componentType
 * @param {string} componentName
 * @return {string}
 */
export const getExampleClassName = (source, componentType, componentName) => {
  // Compatibility with old gatsby workspace
  const updatedSource = source === 'html' ? 'core' : source;
  return slugger(`ws-${updatedSource}-${componentType}-${componentName}`);
};
