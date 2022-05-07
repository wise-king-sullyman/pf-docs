import React from 'react';

export const FullscreenComponent = ({ Component, title }) => {
  const [isLoaded, setIsLoaded] = React.useState(false);
  React.useEffect(() => {
    Component?.preload().then(() => setIsLoaded(true));
  });

  const { examples = {} } = Component?.getPageData();
  const Example = examples[title];
  return isLoaded ? <Example isFullscreen={false} isFullscreenPreview /> : <Component />;
};
