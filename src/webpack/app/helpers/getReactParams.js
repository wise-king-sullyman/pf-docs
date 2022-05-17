import staticVersions from 'theme-patternfly-org/versions.json';
import { overpass } from './fonts';
import { getExampleDeclaration } from './getExampleDeclaration';
import { prettyExampleCode } from './prettyExampleCode';
import { getIdentifier } from './getIdentifier';

// TODO: Make React examples work and use a template that has our assets.
/**
 * Get React parameters
 *
 * @param {string} title
 * @param {*} code
 * @param {*} scope
 * @param {string} lang
 * @param {object} versions
 * @returns {{files: {"sandbox.config.json": {content: {template: (string)}}, "index.html": {content: string},
 *     "fonts.css": {content: *}, "package.json": {content: {dependencies: {"react-dom": string,
 *     "@patternfly/react-core": *, react: string}}}}}}
 */
export const getReactParams = (title, code, scope, lang, versions = staticVersions) => {
  let toRender = null;
  let updatedCode = code;

  try {
    const declaration = getExampleDeclaration(updatedCode);
    if (declaration.type === 'ExpressionStatement') {
      if (!declaration.expression.left) {
        // () => <jsx />
        updatedCode = prettyExampleCode(title, updatedCode, declaration);
        toRender = getIdentifier(title);
      } else if (declaration.expression.type === 'AssignmentExpression') {
        // Basic = () => <jsx />
        updatedCode = prettyExampleCode(title, updatedCode, declaration, declaration.expression.left.name);
        toRender = declaration.expression.left.name;
      }
    } else if (declaration.type === 'VariableDeclaration') {
      toRender = declaration.declarations[0].id.name;
    } else if (declaration.id) {
      toRender = declaration.id.name;
    }
  } catch (err) {
    // Ignore
  }

  const imgImportRegex = /import\s*(\w*).*['"](.*)(\.(png|jpe?g|webp|gif|svg))['"]/g;
  let imgImportMatch;

  // eslint-disable-next-line no-cond-assign
  while ((imgImportMatch = imgImportRegex.exec(updatedCode))) {
    const imgName = imgImportMatch[1];
    updatedCode = updatedCode.replace(
      imgImportMatch[0],
      `const ${imgName} = "https://www.patternfly.org/v4${scope[imgName]}"`
    );
  }

  const dependencies = {
    '@patternfly/react-core': versions.Releases[0].versions['@patternfly/react-core']
  };

  if (lang === 'ts') {
    dependencies['@babel/runtime'] = 'latest';
  }

  Object.entries(versions.Releases[0].versions)
    .filter(([pkg]) => updatedCode.includes(pkg))
    .forEach(([pkg, version]) => {
      dependencies[pkg] = version;
    });

  return {
    files: {
      'index.html': {
        content: `<!DOCTYPE html>
<html lang="en" class="pf-m-redhat-font">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>PatternFly-React ${title} CodeSandbox Example</title>
  </head>
<body>
  <noscript>
    You need to enable JavaScript to run this app.
  </noscript>
  <div id="root" style="height:100%"></div>
</body>
</html>`
      },
      [lang === 'ts' ? 'index.tsx' : 'index.js']: {
        content: `import ReactDOM from 'react-dom';
import "@patternfly/react-core/dist/styles/base.css";
import './fonts.css';

${updatedCode}

const rootElement = document.getElementById("root");
ReactDOM.render(<${toRender} />, rootElement);`
      },
      'fonts.css': {
        content: overpass
      },
      'package.json': {
        content: {
          dependencies: {
            ...dependencies,
            react: '^16.8.0',
            'react-dom': '^16.8.0'
          }
        }
      },
      'sandbox.config.json': {
        content: { template: lang === 'ts' ? 'create-react-app-typescript' : 'create-react-app' }
      }
    }
  };
};
