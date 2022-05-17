import React from 'react';

const cache = {};

/**
 * Async component
 *
 * @param {string} route
 * @param {*} pageData
 * @return {AsyncComponent}
 */
export const asyncComponentFactory = (route, pageData) => {
  const { Component } = pageData;

  class AsyncComponent extends React.Component {
    static preload() {
      return Component().then(res => {
        cache[route] = res.default;
        return res.default;
      });
    }

    state = {
      isLoaded: false
    };

    static getPageData() {
      return cache[route] ? cache[route].pageData : {};
    }

    render() {
      if (cache[route]) {
        return React.createElement(cache[route]);
      }
      AsyncComponent.preload().then(() => this.setState({ isLoaded: true }));

      // Simple loading state
      return React.createElement('div', { style: { height: '100vh' } }, 'Loading...');
    }
  }
  AsyncComponent.displayName = route.replace(/\//g, '.');

  return AsyncComponent;
};
