const path = require('path');
const { removeSync } = require('fs-extra');
const toVfile = require('to-vfile');
const unified = require('unified');
const yaml = require('js-yaml');
const visit = require('unist-util-visit');
// const chokidar = require('chokidar');
const remove = require('unist-util-remove');
// const vfile = require('vfile');
const vfileReport = require('vfile-reporter');
const { makeSlug } = require('../helpers/slugger');
const { liveCodeTypes } = require('../helpers/liveCodeTypes');
const { typecheck } = require('./typecheck');
// const { sourceMarkdownFile } = require('./sourceMarkdownFile');
// const { writeIndexFile } = require('./writeIndexFile');

const cachedPaths = {};

/**
 * ToDo: this could be expanded in the future to clean up empty/orphaned directories
 */
/**
 * Clean up previous output paths before generating updated component.
 *
 * @param {string} vfileId
 * @param {string} newPath
 */
const cleanPaths = (vfileId, newPath) => {
  if (!cachedPaths[vfileId]) {
    cachedPaths[vfileId] = [];
  }

  if (!cachedPaths[vfileId].includes(newPath)) {
    cachedPaths[vfileId].push(newPath);
  }

  cachedPaths[vfileId].forEach(path => removeSync(path));
};

/**
 * Convert markdown towards React.
 *
 * @param {string} file
 * @param {string} source
 * @param {string} buildMode
 * @param {object} tsDocs
 * @param {string} outputDir
 * @param {object} routes
 * @returns {{outPath, pageData: {}, jsx}}
 */
const toReactComponent = ({
  file: mdFilePath,
  source,
  buildMode,
  tsDocs,
  outputDir,
  routes
} = {}) => {
  // vfiles allow for nicer error messages and have native `unified` support
  const vfile = toVfile.readSync(mdFilePath);
  const vfileId = vfile.path;

  // FixMe: this will cause issues.
  const relPath = path
    .relative(path.join(process.cwd(), '../..'), vfile.path)
    .split(path.sep)
    .join(path.posix.sep);

  let jsx;
  let outPath;
  let pageData = {};
  let frontmatter = {};

  unified()
    .use(require('remark-parse'))
    .use(require('remark-frontmatter'), ['yaml'])
    // Extract frontmatter
    .use(() => (tree, file) => {
      const yamlNode = tree.children.shift();
      if (!yamlNode) {
        return file.info('no frontmatter, skipping');
      }
      frontmatter = yaml.load(yamlNode.value);

      // Fail early
      if (!frontmatter.id) {
        file.fail('id attribute is required in frontmatter for PatternFly docs');
      }
      source = frontmatter.source || source;
      const slug = makeSlug(source, frontmatter.section, frontmatter.id);
      outPath = path.join(outputDir, `${slug}.js`);

      cleanPaths(vfileId, outPath);

      let sourceRepo = 'patternfly-org';
      if (source.includes('html')) {
        sourceRepo = 'patternfly';
      } else if (source.includes('react')) {
        sourceRepo = 'patternfly-react';
      }

      const propComponents = [...new Set(frontmatter.propComponents || [])]
        .filter(propComponent => {
          if (tsDocs[propComponent]) {
            return true;
          }
          file.message(`Prop component ${propComponent} missing from tsDocgen`);
          return false;
        })
        .map(propComponent => tsDocs[propComponent]);

      const normalizedPath = relPath
        .replace('node_modules/@patternfly/patternfly/docs', 'src/patternfly')
        .replace(
          /node_modules\/@patternfly\/react-([\w-])/,
          (_, match) => `packages/react-${match}`
        )
        .replace(/\.\.\//g, '');

      pageData = {
        id: frontmatter.id,
        section: frontmatter.section || '',
        source,
        slug,
        sourceLink: `https://github.com/patternfly/${sourceRepo}/blob/main/${normalizedPath}`,
        hideTOC: frontmatter.hideTOC || false
      };
      // Temporarily override section for Demo tabs until we port this upstream
      if (frontmatter.section === 'demos' && routes[slug.replace('demos', 'components')]) {
        // Temporarily override section until https://github.com/patternfly/patternfly-react/pull/4862 is in react-docs
        pageData.section = 'components';
        pageData.source = `${source}-demos`;
        pageData.slug = makeSlug(pageData.source, pageData.section, pageData.id);
        outPath = path.join(outputDir, `${pageData.slug}.js`);

        cleanPaths(vfileId, outPath);
      }
      if (frontmatter.title) {
        pageData.title = frontmatter.title;
      }
      if (propComponents.length > 0) {
        pageData.propComponents = propComponents;
      }
      if (frontmatter.optIn) {
        pageData.optIn = frontmatter.optIn;
      }
      if (frontmatter.beta) {
        pageData.beta = frontmatter.beta;
      }
      if (frontmatter.cssPrefix) {
        pageData.cssPrefix = Array.isArray(frontmatter.cssPrefix)
          ? frontmatter.cssPrefix
          : [frontmatter.cssPrefix];
      }
      if (frontmatter.katacodaBroken) {
        pageData.katacodaBroken = frontmatter.katacodaBroken;
      }
      if (frontmatter.katacodaLayout) {
        pageData.katacodaLayout = frontmatter.katacodaLayout;
      }
      if (frontmatter.hideNavItem) {
        pageData.hideNavItem = frontmatter.hideNavItem;
      }
    })
    // Delete HTML comments
    .use(require('./remove-comments'))
    // remark-mdx removes auto-link support
    // this adds it back ONLY for links which are easily differentiable from JSX
    .use(require('./auto-link-url'))
    // Support for JSX in MD
    .use(require('remark-mdx'))
    // remark-mdx leaves paragraphs as normal MD, but inside MDX we expect it not to.
    .use(() => tree => {
      visit(tree, 'mdxBlockElement', node => {
        if (node.children[0] && node.children[0].type === 'paragraph') {
          const newChildren = node.children[0].children;
          node.children.shift();
          node.children = newChildren.concat(node.children);
        }
      });
    })
    // Support for import/exports in MD
    .use(require('remark-mdxjs'))
    // Insert footnotes
    .use(require('remark-footnotes'))
    // Remove whitespace
    .use(require('remark-squeeze-paragraphs'))
    // Support example captions
    .use(require('./example-captions'))
    // .use(require('remark-rehype'))
    // .use(require('rehype-react'), { createElement: require('react').createElement })
    // Transform AST to JSX elements. Includes special code block parsing
    .use(require('./mdx-ast-to-mdx-hast'), {
      watchExternal(file) {
        if (buildMode === 'start') {
          // ToDo: clean up/remove this questionable watch within a watch. We're using webpack config to observe output now. Commented in case something pops up.
          /*
          const watcher = chokidar.watch(file, { ignoreInitial: true });
          watcher.on('change', () => {
            // const updated = sourceMarkdownFile(mdFilePath, source, buildMode);
            const updated = sourceMarkdownFile({
              buildMode,
              file: mdFilePath,
              routes,
              source,
              tsDocs,
              outputDir
            });
            writeIndexFile({ routes: updated, outputDir });
          });
           */
        }
      }
    })
    // Don't allow exports
    .use(() => tree => remove(tree, 'export'))
    // Comments aren't very useful in generated files no one wants to look at
    .use(() => tree => remove(tree, 'comment'))
    // Extract examples to create fullscreen page routes
    // Needs to be run after mdx-ast-to-mdx-hast which parses meta properties
    .use(() => (tree, file) => {
      const isExample = node =>
        node.type === 'element' &&
        node.tagName === 'Example' &&
        liveCodeTypes.includes(node.properties.lang) &&
        !node.properties.noLive;
      visit(tree, isExample, node => {
        if (node.properties.isFullscreen) {
          pageData.fullscreenExamples = pageData.fullscreenExamples || [];
          pageData.fullscreenExamples.push(node.title);
        } else {
          pageData.examples = pageData.examples || [];
          pageData.examples.push(node.title);
        }
        // Typecheck TS examples
        if (node.properties.lang === 'ts') {
          const typerrors = typecheck(
            path.join(pageData.id, node.title + '.tsx'), // Needs to be unique per-example
            node.properties.code
          );
          typerrors.forEach(({ line, character, message }) => {
            line = node.position.start.line + line + 1;
            const column = character;
            if (buildMode === 'start') {
              // Don't fail to start over types
              file.message(`\u001b[31m THIS WILL FAIL THE BUILD\u001b[0m\n  ${message}`, {
                line,
                column
              });
            } else {
              console.log('\u001b[31m');
              file.fail(`\n  ${message}\n`, { line, column });
              console.log('\u001b[0m');
            }
          });
        }
      });
    })
    // Add custom PatternFly doc design things
    .use(require('./anchor-header'), toc => {
      if (!pageData.hideTOC && toc.length > 0) {
        pageData.toc = toc;
      }
      delete pageData.hideTOC;
    })
    .use(require('./styled-tags'))
    // Transform HAST object to JSX string
    .use(require('./mdx-hast-to-jsx'), {
      getOutPath: () => outPath,
      getRelPath: () =>
        path.relative(path.dirname(outPath), vfile.dirname).split(path.sep).join(path.posix.sep), // for imports
      getPageData: () => pageData // For @reach/router routing
    })
    .process(vfile, (err, file) => {
      jsx = file?.contents;
      console.info(vfileReport(vfile));
    });

  return {
    jsx,
    pageData,
    outPath
  };
};

module.exports = {
  cleanPaths,
  toReactComponent
};
