import React from 'react';
import { Link as ReachLink, navigate } from '@reach/router';
import { getAsyncComponent } from '../../helpers';

const Promiseany = (
  Promise.any ||
  function ($) {
    return new Promise((D, E, A, L) => {
      A = [];
      L = $.map(($, i) => Promise.resolve($).then(D, O => ((A[i] = O), --L) || E({ errors: A }))).length;
    });
  }
).bind(Promise);

/**
 * Link
 *
 * @param {object} props
 * @param {string} props.href
 * @param {*} props.to
 * @param {Function} props.onMouseOver
 * @param {Function} props.onClick
 * @param {string} props.pathPrefix
 * @param {boolean} props.PRERENDER
 * @return {React.ReactNode}
 */

export const Link = ({
  href,
  to,
  onMouseOver = () => {},
  onClick,
  pathPrefix = process.env.pathPrefix,
  PRERENDER = process.env.PRERENDER,
  ...props
}) => {
  let preloadPromise;
  let url = href || to || '';
  if (url.startsWith('#') && !onClick) {
    onClick = ev => {
      ev.preventDefault(); // Don't use client-side routing
      // Chrome does not jump until ALL network requests finish.
      // We have to force it to...
      const referencedElement = document.getElementById(url.replace('#', ''));
      if (referencedElement) {
        referencedElement.scrollIntoView();
      }
      // update URL without triggering route change
      history.pushState({}, '', url);
    };
  }
  if (url.includes('//') || url.startsWith('#')) {
    return <a href={url} onClick={onClick} {...props} />;
  }
  if (url.startsWith('/')) {
    url = `${pathPrefix}/${url.substr(1)}`;

    if (!PRERENDER) {
      const Component = getAsyncComponent(url);
      if (Component) {
        // Preload on hover
        props.onMouseOver = () => {
          preloadPromise = Component.preload();
          onMouseOver();
        };
        // Wait up to an extra 500ms on click before showing 'Loading...'
        props.onClick = ev => {
          if (!(ev.ctrlKey || ev.metaKey)) {
            // avoid disallowing cmnd/ctrl+click opening in new tab
            ev.preventDefault();
            if (typeof window !== 'undefined' && url !== location.pathname) {
              Promiseany([preloadPromise, new Promise(res => setTimeout(res, 500))]).then(() => navigate(url));
            }
          }
        };
      }
    }
  }
  return <ReachLink to={url} {...props} />;
};
