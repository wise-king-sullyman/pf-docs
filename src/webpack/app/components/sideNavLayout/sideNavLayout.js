import React, { useEffect, useState } from 'react';
import staticVersions from 'theme-patternfly-org/versions.json';
import { Page, PageHeader, PageSidebar, Brand, SkipToContent } from '@patternfly/react-core';
import { SideNav } from '../sideNav/sideNav';
import { HeaderTools } from '../headerTools/headerTools';
import { TopNav } from '../topNav/topNav';
import { GdprBanner } from '../gdprBanner/gdprBanner';
import { attachDocSearch } from '../../helpers';
import logo from '../../assets/images/logo.svg';
import { sideNavRoutes } from '../../routes';

// FixMe: confusing syntax where "staticVersions" is pulled in as a compiled resource but also as a dynamic pull w/ fetch...
// ... like it would be updated on-the-fly?
export const SideNavLayout = ({
  children,
  groupedRoutes,
  navOpen,
  pathPrefix = process.env.pathPrefix,
  algolia = process.env.algolia,
  hasGdprBanner = process.env.hasGdprBanner,
  hasVersionSwitcher = process.env.hasVersionSwitcher,
  // sideNavItems = process.env.sideNavItems,
  // topNavItems = process.env.topNavItems,
  sideNavItems = sideNavRoutes,
  topNavItems = [],
  prnum = process.env.prnum,
  prurl = process.env.prurl,
  staticversions = staticVersions
}) => {
  // const [versions, setVersions] = useState({ ...staticversions });
  const versions = staticVersions;

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    if (algolia) {
      attachDocSearch({ algolia, inputSelector: '#ws-global-search', timeout: 1000 });
    }
    /*
    if (hasVersionSwitcher && window.fetch) {
      fetch('/versions.json').then(res => {
        if (res.ok) {
          res.json().then(json => setVersions(json));
        }
      });
    }
    */
  });

  const SideBar = (
    <PageSidebar
      className="ws-page-sidebar"
      theme="light"
      nav={<SideNav navItems={sideNavItems} groupedRoutes={groupedRoutes} />}
    />
  );

  const Header = (
    <PageHeader
      className="ws-page-header"
      headerTools={
        (algolia || hasVersionSwitcher) && (
          <HeaderTools versions={versions} hasSearch={algolia} hasVersionSwitcher={hasVersionSwitcher} />
        )
      }
      logo={prnum ? `PR #${prnum}` : <Brand src={logo} alt="Patternfly Logo" />}
      logoProps={{ href: prurl || pathPrefix || '/' }}
      showNavToggle
      topNav={topNavItems.length > 0 && <TopNav navItems={topNavItems} />}
    />
  );

  return (
    <React.Fragment>
      <div id="ws-page-banners">{hasGdprBanner && <GdprBanner />}</div>
      <Page
        id="ws-page"
        mainContainerId="ws-page-main"
        header={Header}
        sidebar={SideBar}
        skipToContent={<SkipToContent href="#ws-page-main">Skip to content</SkipToContent>}
        isManagedSidebar
        defaultManagedSidebarIsOpen={navOpen}
      >
        {children}
      </Page>
    </React.Fragment>
  );
};
