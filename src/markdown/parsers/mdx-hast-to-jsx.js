const path = require('path');
const fs = require('fs');

const { serializeTags } = require('remark-mdx/lib/serialize/mdx-element');
const serializeMdxExpression = require('remark-mdx/lib/serialize/mdx-expression');
const toH = require('hast-to-hyperscript');
const { toTemplateLiteral } = require('@mdx-js/util');
const { parse } = require('@patternfly/ast-helpers');

const { capitalize } = require('../helpers/capitalize');
const { slugger } = require('../helpers/slugger');
const { liveCodeTypes } = require('../helpers/liveCodeTypes');

const { _PF_DOCS_WEBPACK_DIR } = global;

// Adapted from https://github.com/mdx-js/mdx/blob/next/packages/mdx/mdx-hast-to-jsx.js
function toJSX(node, parentNode = {}, options = {}) {
  options.examples = options.examples || {};
  options.indent = options.indent || 2;

  switch (node.type) {
    case 'root':
      return serializeRoot(node, options);
    case 'element':
      return serializeElement(node, options, parentNode);
    case 'text':
      return serializeText(node, options, parentNode);
    case 'mdxBlockExpression':
    case 'mdxSpanExpression':
      return serializeMdxExpression(node);
    case 'mdxBlockElement':
    case 'mdxSpanElement':
      return serializeComponent(node, options, parentNode);
  }
}

function compile(options = {}) {
  this.Compiler = function (tree) {
    return toJSX(tree, {}, options);
  };
}

// function serializeRoot(node, options, contextPath = path.join(_PF_DOCS_WEBPACK_DIR, 'app')) {
function serializeRoot(node, options, contextPath = 'generated-pf-docs') {
  const { getOutPath, getRelPath, getPageData, examples } = options;
  const pageData = { ...getPageData() };
  // Save some kb
  // delete pageData.toc;
  const exportName = pageData.slug.replace(/[/-](.)?/g, (_, match) => capitalize(match)) + 'Docs';
  const groups = {
    import: [],
    rest: []
  };

  for (const child of node.children) {
    let kind = 'rest';

    if (child.type === 'import') {
      kind = child.type;
    }

    groups[kind].push(child);
  }

  const thumbnailFolder = path.join(path.dirname(getOutPath()), pageData.source);
  const thumbnails = fs.existsSync(thumbnailFolder) ? fs.readdirSync(thumbnailFolder) : [];
  const thumbnailImports = thumbnails.map(
    img =>
      `import srcImport${path.basename(img, '.png').replace(/-/g, '')} from './${
        pageData.source
      }/${img}';`
  );

  const importStatements = groups.import
    .map(node => node.value)
    .map(imp => imp.replace(/(['"])\./g, (_, match) => `${match}${getRelPath()}${path.posix.sep}.`))
    .concat(thumbnailImports)
    .join('\n');

  // https://astexplorer.net/#/gist/9c531dd372dfc57e194c13c2889d31c3/03f2d6e889db1a733c6a079554e8af7784863739
  options.importSpecifiers = parse(importStatements)
    .body.map(node => node.specifiers)
    .flat(1)
    .map(spec => (spec.local ? spec.local.name : null))
    .filter(Boolean);

  const liveContext = options.importSpecifiers
    .filter(localName => !/srcImport.*/.test(localName)) // Images in MD like [!img](./src)
    .join(',\n  ');

  const childNodes = groups.rest.map(childNode => toJSX(childNode, node, options)).join('');

  let res = `import React from 'react';
import { AutoLinkHeader } from '${contextPath}/components/autoLinkHeader/autoLinkHeader';
import { Example } from '${contextPath}/components/example/example';
import { Link as PatternflyThemeLink } from '${contextPath}/components/link/link';
${importStatements}
const pageData = ${JSON.stringify(pageData, null, 2)};
`;

  if (liveContext) {
    res += `pageData.liveContext = {\n${'  ' + liveContext}\n};\n`;
  }

  if (examples) {
    res += `pageData.examples = {\n${
      '  ' +
      Object.entries(examples)
        .map(([key, val]) => `'${key}': ${val}`)
        .join(',\n  ')
    }\n};\n`;
  }

  res += `\nexport const Component = () => (
  <React.Fragment>${childNodes.replace(/\n\s*\n/g, '\n')}
  </React.Fragment>
);
Component.displayName = '${exportName}';
Component.pageData = pageData;

export default Component;\n`;

  return res;
}

function serializeElement(node, options) {
  const { indent, examples } = options;
  const { type, props } = toH(fakeReactCreateElement, Object.assign({}, node, { children: [] }), {
    prefix: false
  });
  const content = serializeChildren(node, { ...options });

  delete props.key;

  const srcImport = node.properties.src;
  if (type === 'img') {
    delete props.src;
    delete props.isResponsive;
  }
  const spread = Object.keys(props).length === 0 ? null : JSON.stringify(props);

  const indentText = '  '.repeat(indent);
  let res = '\n';
  const isFullscreenExample =
    type === 'Example' && liveCodeTypes.includes(props.lang) && !props.noLive;
  res += `${indentText}<${type}`;
  if (isFullscreenExample) {
    res += ' {...pageData} {...props}';
    const thumbnailImport = `srcImport${slugger(props.title).replace(/-/g, '')}`;
    if (options.importSpecifiers.includes(thumbnailImport)) {
      res += ` thumbnail={${thumbnailImport}}`;
    }
  } else if (type === 'img') {
    res += ` src={${srcImport}}`;
    if (node.properties.isResponsive) {
      if (!props.width) {
        res += ` width={${srcImport}.width}`;
        res += ` height={${srcImport}.height}`;
      } else {
        props.width = props.width.replace('px', '');
        res += ` height={${srcImport}.height * ${props.width} / ${srcImport}.width}`;
      }
    }
  }
  if (spread) {
    res += ` {...${spread}}`;
  }
  res += `>\n${indentText}  ${content}`;
  res += `\n${indentText}</${type}>`;
  if (isFullscreenExample) {
    // Props lets us pass `isFullscreenPreview` to <Example> so it knows to take 100% height
    examples[props.title] = `props => ${res}`;
    res = `\n${indentText}{React.createElement(pageData.examples[${JSON.stringify(props.title)}])}`;
  }

  return res;
}

function serializeComponent(node, options) {
  let content = serializeChildren(node, options);
  const tags = serializeTags(Object.assign({}, node, { children: content ? ['!'] : [] }));

  if (node.type === 'mdxBlockElement' && content) {
    content = '\n' + content + '\n';
  }

  const indentText = '  '.repeat(options.indent);
  return `${indentText}${tags.open}${content}${tags.close || ''}`;
}

function serializeText(node, options, parentNode) {
  // Don't wrap newlines unless specifically instructed to by the flag,
  // to avoid issues like React warnings caused by text nodes in tables.
  const shouldPreserveNewlines = options.preserveNewlines || parentNode.tagName === 'p';

  if (node.value === '\n' && !shouldPreserveNewlines) {
    return node.value;
  }

  return toTemplateLiteral(node.value);
}

function serializeChildren(node, options) {
  const children = node.children || [];
  const childOptions = Object.assign({}, options, {
    // Tell all children inside <pre> tags to preserve newlines as text nodes
    preserveNewlines: options.preserveNewlines || node.tagName === 'pre',
    indent: options.indent + 1
  });

  const indentText = '  '.repeat(options.indent + 1);

  return children.map(childNode => toJSX(childNode, node, childOptions)).join(`\n${indentText}`);
}

// We only do this for the props, so we’re ignoring children.
function fakeReactCreateElement(name, props) {
  return {
    type: name,
    props: props,
    // Needed for `toH` to think this is React.
    key: null,
    _owner: null
  };
}

module.exports = compile;
