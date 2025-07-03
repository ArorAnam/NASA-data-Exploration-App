import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock console methods to avoid test output noise
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  console.error = jest.fn();
  console.warn = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo
    });
    
    // Log error to console (in real app, this would be sent to error reporting service)
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.state.errorInfo, this.handleRetry);
      }

      return (
        <div className="error-boundary" data-testid="error-boundary">
          <div className="error-boundary-content">
            <h2>🚀 Houston, we have a problem!</h2>
            <p>Something went wrong while exploring the cosmos.</p>
            <div className="error-details">
              <details>
                <summary>Error Details</summary>
                <pre>{this.state.error && this.state.error.toString()}</pre>
                <pre>{this.state.errorInfo && this.state.errorInfo.componentStack}</pre>
              </details>
            </div>
            <div className="error-actions">
              <button onClick={this.handleRetry} className="retry-button">
                Try Again
              </button>
              <button onClick={() => window.location.href = '/'} className="home-button">
                Go to Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Component that throws errors for testing
const ProblematicComponent = ({ shouldThrow, errorMessage, errorType = 'render' }) => {
  if (shouldThrow) {
    if (errorType === 'async') {
      React.useEffect(() => {
        setTimeout(() => {
          throw new Error(errorMessage || 'Async error');
        }, 0);
      }, [errorMessage]);
    } else {
      // Default to render error which is caught by error boundaries
      throw new Error(errorMessage || 'Render error');
    }
  }
  
  return <div data-testid="working-component">Component is working fine!</div>;
};

// Hook-based component that can throw errors
const HookProblematicComponent = ({ shouldThrow, errorMessage }) => {
  const [count, setCount] = React.useState(0);
  
  React.useEffect(() => {
    if (shouldThrow && count === 0) {
      throw new Error(errorMessage || 'Hook error');
    }
  }, [shouldThrow, errorMessage, count]);
  
  return (
    <div data-testid="hook-component">
      <p>Count: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>Increment</button>
    </div>
  );
};

// Component with network error simulation
const NetworkComponent = ({ shouldFailFetch }) => {
  const [data, setData] = React.useState(null);
  const [error, setError] = React.useState(null);
  
  React.useEffect(() => {
    if (shouldFailFetch) {
      // Simulate network error that should be caught by error boundary
      throw new Error('Network request failed');
    }
  }, [shouldFailFetch]);
  
  return (
    <div data-testid="network-component">
      {error ? <p>Network Error: {error.message}</p> : <p>Data loaded successfully</p>}
    </div>
  );
};

describe('ErrorBoundary Component', () => {
  let mockOnError;

  beforeEach(() => {
    mockOnError = jest.fn();
    jest.clearAllMocks();
  });

  test('renders children when there is no error', () => {
    render(
      <ErrorBoundary onError={mockOnError}>
        <ProblematicComponent shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByTestId('working-component')).toBeInTheDocument();
    expect(screen.getByText('Component is working fine!')).toBeInTheDocument();
  });

  test('renders error UI when child component throws error', () => {
    render(
      <ErrorBoundary onError={mockOnError}>
        <ProblematicComponent shouldThrow={true} errorMessage="Test error" />
      </ErrorBoundary>
    );

    expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
    expect(screen.getByText('🚀 Houston, we have a problem!')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong while exploring the cosmos.')).toBeInTheDocument();
  });

  test('calls onError callback when error occurs', () => {
    render(
      <ErrorBoundary onError={mockOnError}>
        <ProblematicComponent shouldThrow={true} errorMessage="Callback test error" />
      </ErrorBoundary>
    );

    expect(mockOnError).toHaveBeenCalledTimes(1);
    expect(mockOnError).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Callback test error'
      }),
      expect.objectContaining({
        componentStack: expect.any(String)
      })
    );
  });

  test('displays error details in expandable section', () => {
    render(
      <ErrorBoundary onError={mockOnError}>
        <ProblematicComponent shouldThrow={true} errorMessage="Detail error" />
      </ErrorBoundary>
    );

    const detailsButton = screen.getByText('Error Details');
    expect(detailsButton).toBeInTheDocument();
    
    // Check that error message is present (might be in collapsed state initially)
    expect(screen.getByText(/Detail error/)).toBeInTheDocument();
  });

  test('provides retry functionality', async () => {
    const user = userEvent.setup();
    
    const TestComponent = () => {
      const [shouldThrow, setShouldThrow] = React.useState(true);
      const [renderCount, setRenderCount] = React.useState(0);
      
      React.useEffect(() => {
        setRenderCount(c => c + 1);
        // Auto-fix after first error boundary reset
        if (renderCount > 0) {
          setShouldThrow(false);
        }
      }, [renderCount]);
      
      return <ProblematicComponent shouldThrow={shouldThrow} errorMessage="Retry test error" />;
    };

    render(
      <ErrorBoundary onError={mockOnError}>
        <TestComponent />
      </ErrorBoundary>
    );

    // Error boundary should be shown initially
    expect(screen.getByTestId('error-boundary')).toBeInTheDocument();

    // Click retry button
    const retryButton = screen.getByText('Try Again');
    await user.click(retryButton);

    // Component should recover
    await waitFor(() => {
      expect(screen.getByTestId('working-component')).toBeInTheDocument();
    });
  });

  test('provides home navigation button', async () => {
    const user = userEvent.setup();
    
    // Mock window.location
    delete window.location;
    window.location = { href: '' };

    render(
      <ErrorBoundary onError={mockOnError}>
        <ProblematicComponent shouldThrow={true} errorMessage="Home nav test" />
      </ErrorBoundary>
    );

    const homeButton = screen.getByText('Go to Home');
    await user.click(homeButton);

    expect(window.location.href).toBe('/');
  });

  test('handles multiple error types', () => {
    const errorTypes = ['render', 'hook', 'network'];
    
    errorTypes.forEach(errorType => {
      const { unmount } = render(
        <ErrorBoundary onError={mockOnError}>
          <ProblematicComponent shouldThrow={true} errorType={errorType} errorMessage={`${errorType} error`} />
        </ErrorBoundary>
      );

      if (errorType === 'render') {
        expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
      }
      
      unmount();
    });
  });

  test('works with custom fallback component', () => {
    const CustomFallback = (error, errorInfo, retry) => (
      <div data-testid="custom-fallback">
        <h1>Custom Error Page</h1>
        <p>Error: {error && error.message}</p>
        <button onClick={retry}>Custom Retry</button>
      </div>
    );

    render(
      <ErrorBoundary fallback={CustomFallback} onError={mockOnError}>
        <ProblematicComponent shouldThrow={true} errorMessage="Custom fallback test" />
      </ErrorBoundary>
    );

    expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
    expect(screen.getByText('Custom Error Page')).toBeInTheDocument();
    expect(screen.getByText('Error: Custom fallback test')).toBeInTheDocument();
  });

  test('handles hook-based component errors', () => {
    render(
      <ErrorBoundary onError={mockOnError}>
        <HookProblematicComponent shouldThrow={true} errorMessage="Hook component error" />
      </ErrorBoundary>
    );

    expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
    expect(mockOnError).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Hook component error'
      }),
      expect.any(Object)
    );
  });

  test('recovers from errors after retry', async () => {
    const user = userEvent.setup();
    
    const RecoveryComponent = () => {
      const [hasThrown, setHasThrown] = React.useState(false);
      
      React.useEffect(() => {
        // Mark that we've attempted to render (for retry logic)
        if (!hasThrown) {
          setHasThrown(true);
        }
      }, [hasThrown]);
      
      if (!hasThrown) {
        throw new Error('Recovery test error');
      }
      
      return <div data-testid="recovered-component">Recovered successfully!</div>;
    };

    render(
      <ErrorBoundary onError={mockOnError}>
        <RecoveryComponent />
      </ErrorBoundary>
    );

    // Should show error initially
    expect(screen.getByTestId('error-boundary')).toBeInTheDocument();

    // Retry should work
    const retryButton = screen.getByText('Try Again');
    await user.click(retryButton);

    await waitFor(() => {
      expect(screen.getByTestId('recovered-component')).toBeInTheDocument();
    });
  });

  test('handles network component errors', () => {
    render(
      <ErrorBoundary onError={mockOnError}>
        <NetworkComponent shouldFailFetch={true} />
      </ErrorBoundary>
    );

    expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
    expect(mockOnError).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Network request failed'
      }),
      expect.any(Object)
    );
  });

  test('preserves error boundary state across re-renders', async () => {
    const user = userEvent.setup();
    
    const ParentComponent = () => {
      const [key, setKey] = React.useState(0);
      
      return (
        <div>
          <button onClick={() => setKey(k => k + 1)}>Re-render Parent</button>
          <ErrorBoundary key={key} onError={mockOnError}>
            <ProblematicComponent shouldThrow={true} errorMessage="State preservation test" />
          </ErrorBoundary>
        </div>
      );
    };

    render(<ParentComponent />);

    expect(screen.getByTestId('error-boundary')).toBeInTheDocument();

    // Re-render parent (this creates a new ErrorBoundary instance due to key change)
    const reRenderButton = screen.getByText('Re-render Parent');
    await user.click(reRenderButton);

    expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
  });

  test('handles errors in event handlers gracefully', async () => {
    const user = userEvent.setup();
    
    const EventHandlerComponent = () => {
      const handleClick = () => {
        throw new Error('Event handler error');
      };
      
      return (
        <div data-testid="event-component">
          <button onClick={handleClick}>Trigger Error</button>
        </div>
      );
    };

    render(
      <ErrorBoundary onError={mockOnError}>
        <EventHandlerComponent />
      </ErrorBoundary>
    );

    const triggerButton = screen.getByText('Trigger Error');
    
    // Event handler errors are not caught by error boundaries
    // This should not trigger the error boundary
    await user.click(triggerButton);
    
    expect(screen.getByTestId('event-component')).toBeInTheDocument();
    expect(mockOnError).not.toHaveBeenCalled();
  });

  test('provides accessible error boundary UI', () => {
    render(
      <ErrorBoundary onError={mockOnError}>
        <ProblematicComponent shouldThrow={true} errorMessage="Accessibility test" />
      </ErrorBoundary>
    );

    const errorBoundary = screen.getByTestId('error-boundary');
    expect(errorBoundary).toBeInTheDocument();

    // Check for proper heading structure
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
    
    // Check for actionable buttons
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /go to home/i })).toBeInTheDocument();
  });

  test('handles rapid error and recovery cycles', async () => {
    const user = userEvent.setup();
    
    const CyclingComponent = () => {
      const [shouldError, setShouldError] = React.useState(true);
      
      React.useEffect(() => {
        if (shouldError) {
          throw new Error('Cycling error');
        }
      }, [shouldError]);
      
      return (
        <div data-testid="cycling-component">
          <button onClick={() => setShouldError(!shouldError)}>Toggle Error</button>
        </div>
      );
    };

    render(
      <ErrorBoundary onError={mockOnError}>
        <CyclingComponent />
      </ErrorBoundary>
    );

    // Should show error initially
    expect(screen.getByTestId('error-boundary')).toBeInTheDocument();

    // Retry multiple times rapidly
    for (let i = 0; i < 3; i++) {
      const retryButton = screen.getByText('Try Again');
      await user.click(retryButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
      });
    }

    expect(mockOnError).toHaveBeenCalledTimes(4); // Initial + 3 retries
  });

  test('error boundary CSS classes are applied correctly', () => {
    render(
      <ErrorBoundary onError={mockOnError}>
        <ProblematicComponent shouldThrow={true} errorMessage="CSS test" />
      </ErrorBoundary>
    );

    expect(document.querySelector('.error-boundary')).toBeInTheDocument();
    expect(document.querySelector('.error-boundary-content')).toBeInTheDocument();
    expect(document.querySelector('.error-details')).toBeInTheDocument();
    expect(document.querySelector('.error-actions')).toBeInTheDocument();
    expect(document.querySelector('.retry-button')).toBeInTheDocument();
    expect(document.querySelector('.home-button')).toBeInTheDocument();
  });
}); 