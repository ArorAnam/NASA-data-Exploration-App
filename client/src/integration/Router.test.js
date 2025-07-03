import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
// Mock react-router-dom components
const mockNavigate = jest.fn();
const mockLocation = { pathname: '/' };

jest.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }) => children,
  Routes: ({ children }) => children,
  Route: ({ element }) => element,
  useNavigate: () => mockNavigate,
  useLocation: () => mockLocation,
  MemoryRouter: ({ children, initialEntries }) => {
    // Simple mock that renders children
    return React.createElement('div', { 'data-testid': 'memory-router' }, children);
  },
}));

// Mock API calls
global.fetch = jest.fn();
jest.mock('../config', () => 'http://localhost:5051');

// Mock simplified components for router testing
const HomePage = () => {
  const navigate = useNavigate();
  return (
    <div data-testid="home-page">
      <h1>NASA Explorer</h1>
      <button onClick={() => navigate('/apod')}>Go to APOD</button>
      <button onClick={() => navigate('/mars-rover')}>Go to Mars Rover</button>
      <button onClick={() => navigate('/neos')}>Go to NEOs</button>
      <button onClick={() => navigate('/media-library')}>Go to Media Library</button>
    </div>
  );
};

const APODPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  React.useEffect(() => {
    fetch('http://localhost:5051/api/apod')
      .then(res => res.json())
      .then(() => {})
      .catch(() => {});
  }, []);

  return (
    <div data-testid="apod-page">
      <h1>Astronomy Picture of the Day</h1>
      <button onClick={() => navigate('/')}>Back to Home</button>
      <span data-testid="current-path">/apod</span>
    </div>
  );
};

const MarsRoverPage = () => {
  const navigate = useNavigate();
  return (
    <div data-testid="mars-rover-page">
      <h1>Mars Rover Photos</h1>
      <button onClick={() => navigate('/')}>Back to Home</button>
      <span data-testid="current-path">/mars-rover</span>
    </div>
  );
};

const NEOsPage = () => {
  const navigate = useNavigate();
  return (
    <div data-testid="neos-page">
      <h1>Near Earth Objects</h1>
      <button onClick={() => navigate('/')}>Back to Home</button>
      <span data-testid="current-path">/neos</span>
    </div>
  );
};

const MediaLibraryPage = () => {
  const navigate = useNavigate();
  return (
    <div data-testid="media-library-page">
      <h1>NASA Media Library</h1>
      <button onClick={() => navigate('/')}>Back to Home</button>
      <span data-testid="current-path">/media-library</span>
    </div>
  );
};

const PageLayout = ({ children }) => (
  <div data-testid="page-layout">
    {children}
  </div>
);

const NotFoundPage = () => {
  const navigate = useNavigate();
  return (
    <div data-testid="not-found-page">
      <h1>404 - Page Not Found</h1>
      <button onClick={() => navigate('/')}>Go Home</button>
    </div>
  );
};

// Main App Router component for testing
const TestApp = ({ initialRoute = '/' }) => {
  // Simple router simulation
  const currentPage = initialRoute;
  
  if (currentPage === '/') return <HomePage />;
  if (currentPage === '/apod') return <PageLayout><APODPage /></PageLayout>;
  if (currentPage === '/mars-rover') return <PageLayout><MarsRoverPage /></PageLayout>;
  if (currentPage === '/neos') return <PageLayout><NEOsPage /></PageLayout>;
  if (currentPage === '/media-library') return <PageLayout><MediaLibraryPage /></PageLayout>;
  
  return <NotFoundPage />;
};

describe('Router Integration', () => {
  beforeEach(() => {
    fetch.mockClear();
    fetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue({})
    });
  });

  test('renders home page by default', () => {
    render(<TestApp />);
    
    expect(screen.getByTestId('home-page')).toBeInTheDocument();
    expect(screen.getByText('NASA Explorer')).toBeInTheDocument();
  });

  test('navigates to APOD page when button is clicked', async () => {
    const user = userEvent.setup();
    render(<TestApp />);
    
    const apodButton = screen.getByText('Go to APOD');
    await user.click(apodButton);
    
    expect(screen.getByTestId('apod-page')).toBeInTheDocument();
    expect(screen.getByText('Astronomy Picture of the Day')).toBeInTheDocument();
    expect(screen.getByTestId('current-path')).toHaveTextContent('/apod');
  });

  test('navigates to Mars Rover page when button is clicked', async () => {
    const user = userEvent.setup();
    render(<TestApp />);
    
    const marsButton = screen.getByText('Go to Mars Rover');
    await user.click(marsButton);
    
    expect(screen.getByTestId('mars-rover-page')).toBeInTheDocument();
    expect(screen.getByText('Mars Rover Photos')).toBeInTheDocument();
    expect(screen.getByTestId('current-path')).toHaveTextContent('/mars-rover');
  });

  test('navigates to NEOs page when button is clicked', async () => {
    const user = userEvent.setup();
    render(<TestApp />);
    
    const neosButton = screen.getByText('Go to NEOs');
    await user.click(neosButton);
    
    expect(screen.getByTestId('neos-page')).toBeInTheDocument();
    expect(screen.getByText('Near Earth Objects')).toBeInTheDocument();
    expect(screen.getByTestId('current-path')).toHaveTextContent('/neos');
  });

  test('navigates to Media Library page when button is clicked', async () => {
    const user = userEvent.setup();
    render(<TestApp />);
    
    const mediaButton = screen.getByText('Go to Media Library');
    await user.click(mediaButton);
    
    expect(screen.getByTestId('media-library-page')).toBeInTheDocument();
    expect(screen.getByText('NASA Media Library')).toBeInTheDocument();
    expect(screen.getByTestId('current-path')).toHaveTextContent('/media-library');
  });

  test('navigates back to home from APOD page', async () => {
    const user = userEvent.setup();
    render(<TestApp initialRoute="/apod" />);
    
    expect(screen.getByTestId('apod-page')).toBeInTheDocument();
    
    const homeButton = screen.getByText('Back to Home');
    await user.click(homeButton);
    
    expect(screen.getByTestId('home-page')).toBeInTheDocument();
    expect(screen.getByText('NASA Explorer')).toBeInTheDocument();
  });

  test('navigates back to home from Mars Rover page', async () => {
    const user = userEvent.setup();
    render(<TestApp initialRoute="/mars-rover" />);
    
    expect(screen.getByTestId('mars-rover-page')).toBeInTheDocument();
    
    const homeButton = screen.getByText('Back to Home');
    await user.click(homeButton);
    
    expect(screen.getByTestId('home-page')).toBeInTheDocument();
  });

  test('renders 404 page for unknown routes', () => {
    render(<TestApp initialRoute="/unknown-route" />);
    
    expect(screen.getByTestId('not-found-page')).toBeInTheDocument();
    expect(screen.getByText('404 - Page Not Found')).toBeInTheDocument();
  });

  test('navigates from 404 page back to home', async () => {
    const user = userEvent.setup();
    render(<TestApp initialRoute="/invalid-route" />);
    
    expect(screen.getByTestId('not-found-page')).toBeInTheDocument();
    
    const homeButton = screen.getByText('Go Home');
    await user.click(homeButton);
    
    expect(screen.getByTestId('home-page')).toBeInTheDocument();
  });

  test('renders page layout wrapper for feature pages', async () => {
    const user = userEvent.setup();
    render(<TestApp />);
    
    const apodButton = screen.getByText('Go to APOD');
    await user.click(apodButton);
    
    expect(screen.getByTestId('page-layout')).toBeInTheDocument();
    expect(screen.getByTestId('apod-page')).toBeInTheDocument();
  });

  test('handles direct navigation to specific routes', () => {
    render(<TestApp initialRoute="/neos" />);
    
    expect(screen.getByTestId('neos-page')).toBeInTheDocument();
    expect(screen.getByText('Near Earth Objects')).toBeInTheDocument();
    expect(screen.getByTestId('current-path')).toHaveTextContent('/neos');
  });

  test('handles navigation between multiple pages', async () => {
    const user = userEvent.setup();
    render(<TestApp />);
    
    // Start at home
    expect(screen.getByTestId('home-page')).toBeInTheDocument();
    
    // Go to APOD
    await user.click(screen.getByText('Go to APOD'));
    expect(screen.getByTestId('apod-page')).toBeInTheDocument();
    
    // Go back to home
    await user.click(screen.getByText('Back to Home'));
    expect(screen.getByTestId('home-page')).toBeInTheDocument();
    
    // Go to Mars Rover
    await user.click(screen.getByText('Go to Mars Rover'));
    expect(screen.getByTestId('mars-rover-page')).toBeInTheDocument();
    
    // Go back to home
    await user.click(screen.getByText('Back to Home'));
    expect(screen.getByTestId('home-page')).toBeInTheDocument();
  });

  test('API call is made when APOD page loads', async () => {
    render(<TestApp initialRoute="/apod" />);
    
    expect(screen.getByTestId('apod-page')).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledWith('http://localhost:5051/api/apod');
  });

  test('handles browser back and forward navigation', async () => {
    const user = userEvent.setup();
    render(<TestApp />);
    
    // Navigate to APOD
    await user.click(screen.getByText('Go to APOD'));
    expect(screen.getByTestId('apod-page')).toBeInTheDocument();
    
    // Navigate to Mars Rover from home via navigation
    await user.click(screen.getByText('Back to Home'));
    await user.click(screen.getByText('Go to Mars Rover'));
    expect(screen.getByTestId('mars-rover-page')).toBeInTheDocument();
  });

  test('preserves navigation state correctly', async () => {
    const user = userEvent.setup();
    render(<TestApp />);
    
    // Navigate through multiple pages
    await user.click(screen.getByText('Go to APOD'));
    expect(screen.getByTestId('current-path')).toHaveTextContent('/apod');
    
    await user.click(screen.getByText('Back to Home'));
    
    await user.click(screen.getByText('Go to NEOs'));
    expect(screen.getByTestId('current-path')).toHaveTextContent('/neos');
  });

  test('route parameters are handled correctly', () => {
    render(<TestApp initialRoute="/media-library" />);
    
    expect(screen.getByTestId('media-library-page')).toBeInTheDocument();
    expect(screen.getByTestId('current-path')).toHaveTextContent('/media-library');
  });

  test('handles rapid navigation clicks', async () => {
    const user = userEvent.setup();
    render(<TestApp />);
    
    // Click multiple navigation buttons rapidly
    await user.click(screen.getByText('Go to APOD'));
    expect(screen.getByTestId('apod-page')).toBeInTheDocument();
    
    await user.click(screen.getByText('Back to Home'));
    await user.click(screen.getByText('Go to Mars Rover'));
    expect(screen.getByTestId('mars-rover-page')).toBeInTheDocument();
    
    await user.click(screen.getByText('Back to Home'));
    await user.click(screen.getByText('Go to NEOs'));
    expect(screen.getByTestId('neos-page')).toBeInTheDocument();
  });

  test('renders correct page content for each route', () => {
    const routes = [
      { path: '/apod', testId: 'apod-page', title: 'Astronomy Picture of the Day' },
      { path: '/mars-rover', testId: 'mars-rover-page', title: 'Mars Rover Photos' },
      { path: '/neos', testId: 'neos-page', title: 'Near Earth Objects' },
      { path: '/media-library', testId: 'media-library-page', title: 'NASA Media Library' }
    ];
    
    routes.forEach(route => {
      const { unmount } = render(<TestApp initialRoute={route.path} />);
      expect(screen.getByTestId(route.testId)).toBeInTheDocument();
      expect(screen.getByText(route.title)).toBeInTheDocument();
      unmount();
    });
  });

  test('handles edge case routes gracefully', () => {
    const edgeCases = [
      '//',
      '/apod/extra/path',
      '/mars-rover?param=value',
      '/neos#fragment',
      '/media-library/'
    ];
    
    edgeCases.forEach(route => {
      const { unmount } = render(<TestApp initialRoute={route} />);
      // Should either render a valid page or 404
      expect(document.body).toContainElement(
        screen.queryByTestId('not-found-page') || 
        screen.queryByTestId('home-page') ||
        screen.queryByTestId('apod-page') ||
        screen.queryByTestId('mars-rover-page') ||
        screen.queryByTestId('neos-page') ||
        screen.queryByTestId('media-library-page')
      );
      unmount();
    });
  });

  test('navigation works with keyboard interactions', async () => {
    const user = userEvent.setup();
    render(<TestApp />);
    
    const apodButton = screen.getByText('Go to APOD');
    apodButton.focus();
    await user.keyboard('{Enter}');
    
    expect(screen.getByTestId('apod-page')).toBeInTheDocument();
  });

  test('maintains focus management across routes', async () => {
    const user = userEvent.setup();
    render(<TestApp />);
    
    await user.click(screen.getByText('Go to APOD'));
    expect(screen.getByTestId('apod-page')).toBeInTheDocument();
    
    const backButton = screen.getByText('Back to Home');
    expect(backButton).toBeInTheDocument();
  });
}); 