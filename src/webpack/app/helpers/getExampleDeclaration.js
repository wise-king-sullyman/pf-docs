import { parse } from '@patternfly/ast-helpers';

/**
 * Get example declaration
 *
 * @param {*} code
 * @param {Array} allowedIdentifiers
 * @param {Function} parser
 * @returns {*}
 */
export const getExampleDeclaration = (
  code,
  allowedIdentifiers = ['ClassDeclaration', 'FunctionDeclaration', 'ExpressionStatement', 'VariableDeclaration'],
  parser = parse
) => {
  const updatedCode = code.replace(/export\s+default\s+/g, '').replace(/export\s+/g, '');
  const { body } = parser(updatedCode);
  const lastParsed = body?.[body.length - 1];

  if (lastParsed && allowedIdentifiers.includes(lastParsed.type)) {
    return lastParsed;
  }

  return undefined;
};
