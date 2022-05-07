import React from 'react';
import { ExampleError } from './exampleError';

/**
 * Error boundary
 */
export class ExampleErrorBoundary extends React.Component {
  state = { error: null, errorInfo: null };

  componentDidUpdate(prevProps) {
    if (prevProps.children !== this.props.children) {
      this.setState({ error: null, errorInfo: null });
    }
  }

  componentDidCatch(error, errorInfo) {
    errorInfo._suppressLogging = true;
    this.setState({
      error,
      errorInfo
    });
  }

  render() {
    if (this.state.errorInfo) {
      return <ExampleError err={error} />;
    }
    return this.props.children;
  }
}
