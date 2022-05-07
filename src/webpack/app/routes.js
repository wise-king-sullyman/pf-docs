import _cloneDeep from 'lodash/cloneDeep';
import { asyncComponentFactory } from './helpers/asyncComponentFactory';
import { makeSlug, slugger } from './helpers/slugger';
import { routes as clientRoutes } from 'client-routes'; //eslint-disable-line

/**
 * Sort route sources.
 *
 * @param {object} sortValueOne
 * @param {*} sortValueOne.source
 * @param {object} sortValueTwo
 * @param {*} sortValueTwo.source
 * @returns {number}
 */
export const sortSources = ({ source: s1 }, { source: s2 }) => {
  const defaultOrder = 50;
  const sourceOrder = {
    react: 1,
    'react-composable': 1.1,
    'react-legacy': 1.2,
    'react-demos': 2,
    html: 3,
    'html-demos': 4,
    'design-guidelines': 99,
    accessibility: 100
  };

  const s1Index = sourceOrder[s1] || defaultOrder;
  const s2Index = sourceOrder[s2] || defaultOrder;

  if (s1Index === defaultOrder && s2Index === defaultOrder) {
    return s1.localeCompare(s2);
  }

  return s1Index > s2Index ? 1 : -1;
};

/**
 * Update routes with component prop.
 *
 * @param {object} routes
 * @returns {*}
 */
export const setRouteComponents = (routes = clientRoutes) => {
  const updatedRoutes = _cloneDeep(routes || {});

  Object.entries(updatedRoutes).forEach(([key, value]) => {
    if (value.SyncComponent) {
      updatedRoutes[key].Component = value.SyncComponent;
    } else if (value.Component) {
      updatedRoutes[key].Component = asyncComponentFactory(key, value);
    }
  });

  return updatedRoutes;
};

/**
 * Set grouped routes.
 *
 * @param {object} routes
 * @returns {*}
 */
export const setGroupedRoutes = (routes = clientRoutes) => {
  const updatedRoutes = _cloneDeep(routes || {});
  const isNull = value => value === null || value === undefined;

  return Object.entries(updatedRoutes)
    .filter(([, { id, section }]) => !isNull(id) && !isNull(section))
    .reduce((accum, [slug, pageData]) => {
      const updatedAccum = { ...accum };
      const { section, id, title, source, katacodaLayout, hideNavItem } = pageData;

      if (section) {
        updatedAccum[section] = accum[section] || {};
        updatedAccum[section][id] = accum[section][id] || {
          id,
          section,
          title,
          slug: makeSlug(source, section, id, true),
          sources: [],
          katacodaLayout,
          hideNavItem
        };

        updatedAccum[section][id].sources.push({ ...pageData, slug });
      }

      return updatedAccum;
    }, {});
};

/**
 * Set fullscreen routes
 *
 * @param {object} routes
 * @returns {{}}
 */
export const setFullscreenRoutes = (routes = clientRoutes) => {
  const updatedRoutes = _cloneDeep(routes || {});

  return Object.entries(updatedRoutes)
    .filter(([, { examples, fullscreenExamples }]) => examples || fullscreenExamples)
    .reduce((acc, val) => {
      const [path, { Component, examples = [], fullscreenExamples = [] }] = val;
      examples.concat(fullscreenExamples).forEach(title => {
        const slug = `${path}/${slugger(title)}`;
        acc[slug] = {
          title,
          Component,
          isFullscreen: true,
          isFullscreenOnly: fullscreenExamples.includes(title)
        };
      });
      return acc;
    }, {});
};

/**
 * Generate a side nav from routes.
 *
 * @param {object} routes
 * @return {*[]}
 */
export const setSideNavRoutes = (routes = clientRoutes) => {
  const updatedRoutes = _cloneDeep(routes || {});
  const sideNavRoutes = [];

  Object.entries(updatedRoutes).forEach(([key, { section }]) => {
    const nav = {};
    const text = key.split('/')[1];

    if (section && section !== '') {
      if (sideNavRoutes.find(({ section: cur }) => cur === section)) {
        return;
      }
      nav.section = section;
    } else {
      nav.text = text.charAt(0).toUpperCase() + text.slice(1);
      nav.href = key;
    }

    sideNavRoutes.push(nav);
  });

  return sideNavRoutes;
};

/**
 * Set routes, grouped routes
 *
 * @param {object} params
 * @param {object} params.fullscreenRoutes
 * @param {*} params.groupedRoutes
 * @param {object} params.routes
 * @param {Array} params.sideNavRoutes
 * @param {Function} params.sortBy
 * @returns {{fullscreenRoutes: {}, routes, groupedRoutes: *, sideNavRoutes: []}}
 */
export const setRoutes = ({
  fullscreenRoutes = setFullscreenRoutes(),
  groupedRoutes = setGroupedRoutes(),
  routes = setRouteComponents(),
  sideNavRoutes = setSideNavRoutes(),
  sortBy = sortSources
} = {}) => {
  const updatedRoutes = _cloneDeep(routes);

  /**
   * Adjust route sources
   */
  Object.entries(groupedRoutes).forEach(([, ids]) => {
    Object.values(ids).forEach(({ slug, section, ...pageData }) => {
      const updatedPageData = { slug, section };
      // Remove source routes for `app.js`
      pageData.sources.forEach(({ slug: sourceSlug }) => {
        delete updatedRoutes[sourceSlug];
      });

      // Add design guidelines if doesn't exist
      /*
      if (
        ['components', 'charts', 'layouts', 'demos'].includes(section) &&
        !pageData.sources.map(({ source }) => source).includes('design-guidelines')
        // process.env.hasDesignGuidelines //FixMe: this is always true, ignore it for now, remove later
      ) {
        updatedPageData.sources.push(getDefaultDesignGuidelines(pageData));
      }
       */

      // Sort sources for tabs
      updatedPageData.sources = pageData.sources.sort(sortBy);
      // Add grouped route
      updatedRoutes[slug] = { ...pageData, ...updatedPageData };
    });
  });

  return { allRoutes: routes, fullscreenRoutes, groupedRoutes, routes: updatedRoutes, sideNavRoutes };
};

export const { allRoutes, fullscreenRoutes, groupedRoutes, routes, sideNavRoutes } = setRoutes();

// export { fullscreenRoutes, groupedRoutes, routes };
// export const routes = getUpdatedRoutes();
// export const fullscreenRoutes = {};
// export const groupedRoutes = getGroupedRoutes();
// export const getAsyncComponent = () => {};
