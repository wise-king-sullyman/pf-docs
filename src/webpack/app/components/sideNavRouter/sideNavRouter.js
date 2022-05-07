import React from 'react';
import { Router, useLocation } from '@reach/router';
import { AppRoute } from '../appRoute/appRoute';
import { MDXTemplate } from '../mdx/mdx';
import { routes, groupedRoutes } from '../../routes';
import { SideNavLayout } from '../sideNavLayout/sideNavLayout';

/**
 * Side navigation, routing.
 *
 * @param {object} props
 * @param {string} props.pathPrefix
 * @param {object} props.routes
 * @param {object} props.groupedRoutes
 * @returns {React.ReactNode}
 * @constructor
 */
export const SideNavRouter = ({
  pathPrefix = process.env.pathPrefix,
  routes: aliasedRoutes = routes,
  groupedRoutes: aliasedGroupedRoutes = groupedRoutes
}) => {
  const pathname = useLocation().pathname.replace(pathPrefix, '');
  const navOpen = !aliasedRoutes[pathname] || !aliasedRoutes[pathname].katacodaLayout;

  return (
    <SideNavLayout groupedRoutes={aliasedGroupedRoutes} navOpen={navOpen}>
      <Router id="ws-page-content-router">
        {Object.entries(aliasedRoutes).map(([path, { Component, title, sources, katacodaLayout }]) =>
          Component ? (
            <AppRoute
              key={path}
              path={path}
              default={path === '/404'}
              child={<Component />}
              katacodaLayout={katacodaLayout}
              title={title}
            />
          ) : (
            <AppRoute
              key={path}
              path={`${path}/*`}
              child={<MDXTemplate path={path} title={title} sources={sources} />}
              katacodaLayout={katacodaLayout}
              title={title}
            />
          )
        )}
      </Router>
    </SideNavLayout>
  );
};
