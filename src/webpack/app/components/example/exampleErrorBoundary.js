import React from 'react';
import { ExampleError } from './exampleError';

/**
 * Error boundary
 */
export class ExampleErrorBoundary extends React.Component {
  state = { error: null, errorInfo: null };

  componentDidUpdate(prevProps) {
    const { children } = this.props;
    if (prevProps.children !== children) {
      this.setState({ error: null, errorInfo: null });
    }
  }

  componentDidCatch(error, errorInfo) {
    errorInfo._suppressLogging = true; // FixMe: no-param-reassign
    this.setState({
      error,
      errorInfo
    });
  }

  render() {
    const { error, errorInfo } = this.state;
    const { children } = this.props;
    if (errorInfo) {
      return <ExampleError err={error} />;
    }
    return children;
  }
}
