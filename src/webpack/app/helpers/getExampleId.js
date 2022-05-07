import { slugger } from './slugger';

/**
 * Get example ID
 *
 * @param {string} source
 * @param {string} componentType
 * @param {string} componentName
 * @param {string} exampleTitle
 * @return {string}
 */
export const getExampleId = (source, componentType, componentName, exampleTitle) => {
  // Compatibility with old gatsby workspace
  const updatedSource = source === 'html' ? 'core' : source;
  return slugger(`ws-${updatedSource}-${componentType}-${componentName}-${exampleTitle}`);
};
