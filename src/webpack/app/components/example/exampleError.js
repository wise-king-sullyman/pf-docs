import React from 'react';

/**
 * Return an error
 *
 * @param {object} props
 * @param {string} props.err
 * @return {React.ReactNode}
 */
export const ExampleError = ({ err }) => <pre>{err.toString()}</pre>;
