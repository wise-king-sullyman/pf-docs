import React from 'react';
// import ReactDOM from 'react-dom';
// import { Router, useLocation } from '@reach/router';
import { Router } from '@reach/router';
// import { SideNavLayout } from 'theme-patternfly-org/layouts';
// import { Footer } from 'theme-patternfly-org/components';
// import { MDXTemplate } from './components/mdx/mdx';
import { FullscreenComponent } from './components/fullscreenComponent/fullscreenComponent';
import { SideNavRouter } from './components/sideNavRouter/sideNavRouter';
import { fullscreenRoutes } from './routes';
import '@patternfly/react-styles/src/css/components/Table/inline-edit.css';
import '@patternfly/react-styles/src/css/components/Topology/topology-controlbar.css';
import '@patternfly/react-styles/src/css/components/Topology/topology-side-bar.css';
import '@patternfly/react-styles/src/css/components/Topology/topology-view.css';
import '@patternfly/react-styles/src/css/layouts/Toolbar/toolbar.css';
import '@patternfly/patternfly/patternfly.css';
import '@patternfly/patternfly/patternfly-addons.css';
import './global.css';
import 'client-styles'; //eslint-disable-line

export const App = ({ pathPrefix = process.env.pathPrefix } = {}) => (
  <Router basepath={pathPrefix} id="ws-router">
    <SideNavRouter path="/*" />
    {Object.entries(fullscreenRoutes).map(([path, { title, Component }]) => (
      <FullscreenComponent key={path} path={path} Component={Component} title={title} />
    ))}
  </Router>
);
