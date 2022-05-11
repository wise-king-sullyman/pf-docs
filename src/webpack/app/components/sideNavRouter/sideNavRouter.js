import React from 'react';
import { Router, useLocation } from '@reach/router';
import { AppRoute } from '../appRoute/appRoute';
import { MDXTemplate } from '../mdx/mdx';
import { routes, groupedRoutes } from '../../routes';
import { SideNavLayout } from '../sideNavLayout/sideNavLayout';

export const SideNavRouter = (pathPrefix = process.env.pathPrefix) => {
  const pathname = useLocation().pathname.replace(pathPrefix, '');
  const navOpen = !routes[pathname] || !routes[pathname].katacodaLayout;

  return (
    <SideNavLayout groupedRoutes={groupedRoutes} navOpen={navOpen}>
      <Router id="ws-page-content-router">
        {Object.entries(routes).map(([path, { Component, title, sources, katacodaLayout }]) =>
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
