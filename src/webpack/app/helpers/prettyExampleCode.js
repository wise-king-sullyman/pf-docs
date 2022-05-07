import { getIdentifier } from './getIdentifier';

/**
 * Pretty example code
 *
 * @param {string} title
 * @param {*} code
 * @param {*} declaration
 * @param {string} identifier
 * @returns {*}
 */
export const prettyExampleCode = (title, code, declaration, identifier) => {
  // Create identifier from title
  const ident = identifier || getIdentifier(title);
  const jsxBlock = code.substring(declaration.start, declaration.end);

  if (identifier) {
    return code.replace(jsxBlock, `const ${jsxBlock}`);
  }

  if (jsxBlock.includes('\n')) {
    // Make pretty
    return code.replace(
      jsxBlock,
      `const ${ident} = () => (\n  ${jsxBlock.replace(/\n/g, '\n  ').replace(/;[ \t]*$/, '')}\n)`
    );
  }

  return code.replace(jsxBlock, `const ${ident} = () => ${jsxBlock}`);
};
