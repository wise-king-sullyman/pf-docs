import { allRoutes, routes } from '../routes';

/**
 * Get async component
 *
 * @param {string} url
 * @param {object} allRts
 * @param {object} rts
 * @param {string} pathPrefix
 * @return {null|{preload}|*}
 */
export const getAsyncComponent = (url, allRts = allRoutes, rts = routes, pathPrefix = process.env.pathPrefix) => {
  let updatedUrl = url;

  if (!updatedUrl && typeof window !== 'undefined') {
    updatedUrl = window.location.pathname.replace(/\/$/, '') || '/';
  }
  // Normalize path for matching
  updatedUrl = updatedUrl.replace(pathPrefix, '');
  const response = allRts[updatedUrl]?.Component || rts[updatedUrl]?.sources?.[0]?.Component || null;

  if (response?.preload) {
    return response;
  }

  return null;
};
