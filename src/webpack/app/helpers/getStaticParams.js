import { overpass } from './fonts';

/**
 * Get static parameters
 *
 * @param {string} title
 * @param {*} html
 * @returns {{template: string, files: {"sandbox.config.json": {content: {template: string}}, "index.html":
 *     {content: string}, "package.json": {content: {}}, "fonts.css": {content: string},
 *     "style.css": {content: string}}}}
 */
export const getStaticParams = (title, html) => {
  const imgAssetRegex = /['"](\/assets\/images\/.*)['"]/g;
  let imgAsset;
  let updatedHtml = html;

  // eslint-disable-next-line no-cond-assign
  while ((imgAsset = imgAssetRegex.exec(updatedHtml))) {
    const imgName = imgAsset[1];
    updatedHtml = updatedHtml.replace(imgName, `https://www.patternfly.org/v4${imgName}`);
  }

  return {
    files: {
      'index.html': {
        content: `
          <!DOCTYPE html>
          <html lang="en" class="pf-m-redhat-font">
            <head>
              <meta charset="utf-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1" />
              <link rel="stylesheet" href="fonts.css" />
              <!-- Include latest PatternFly CSS via CDN -->
              <link
                rel="stylesheet"
                href="https://unpkg.com/@patternfly/patternfly/patternfly.css"
                crossorigin="anonymous"
              >
              <link rel="stylesheet" href="style.css" />
              <title>PatternFly ${title} CodeSandbox Example</title>
            </head>
            <body>
              ${updatedHtml}
            </body>
          </html>
        `
      },
      'package.json': {
        content: {}
      },
      'style.css': {
        content: ''
      },
      'fonts.css': {
        content: overpass
      },
      'sandbox.config.json': {
        content: { template: 'static' }
      }
    },
    template: 'static'
  };
};
