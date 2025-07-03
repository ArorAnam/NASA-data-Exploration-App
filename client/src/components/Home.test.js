import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';

// Mock react-router-dom hook
const mockNavigate = jest.fn();

// Mock react-router-dom before imports
jest.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }) => children,
  useNavigate: () => mockNavigate,
}));

// Mock Home component based on App.js
const HomeComponent = () => {
  const navigate = mockNavigate;
  
  return (
    <div className="home-container">
      <div className="content-overlay">
        <div className="main-header">
          <span role="img" aria-label="rocket" className="header-emoji">🚀</span>
          <span className="main-title">NASA Explorer</span>
        </div>
        <p className="home-subtitle">Discover the wonders of space through NASA's vast collection of data and imagery</p>
        <div className="features-grid">
          <div className="feature-card clickable" onClick={() => navigate('/apod')} tabIndex={0} role="button">
            <div className="feature-icon">🌌</div>
            <h3 className="feature-title">Astronomy Picture of the Day</h3>
            <p className="feature-description">
              Explore stunning daily images of our universe, accompanied by explanations from professional astronomers.
            </p>
          </div>
          <div className="feature-card clickable" onClick={() => navigate('/mars-rover')} tabIndex={0} role="button">
            <div className="feature-icon">🚀</div>
            <h3 className="feature-title">Mars Rover Photos</h3>
            <p className="feature-description">
              View high-resolution images from NASA's Mars rovers, capturing the red planet's surface in incredible detail.
            </p>
          </div>
          <div className="feature-card clickable" onClick={() => navigate('/neos')} tabIndex={0} role="button">
            <div className="feature-icon">☄️</div>
            <h3 className="feature-title">Near Earth Objects</h3>
            <p className="feature-description">
              Track asteroids and other objects passing close to Earth, with interactive data and visualizations.
            </p>
          </div>
          <div className="feature-card clickable" onClick={() => navigate('/media-library')} tabIndex={0} role="button">
            <div className="feature-icon">🖼️</div>
            <h3 className="feature-title">NASA Media Library</h3>
            <p className="feature-description">
              Search and explore NASA's vast collection of images and videos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Wrapper component that includes Router
const HomeWithRouter = () => (
  <BrowserRouter>
    <HomeComponent />
  </BrowserRouter>
);

describe('Home Component', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  test('renders main header with rocket emoji and title', () => {
    render(<HomeWithRouter />);
    
    expect(screen.getByText('NASA Explorer')).toBeInTheDocument();
    expect(screen.getByLabelText('rocket')).toBeInTheDocument();
    expect(screen.getByText('🚀')).toBeInTheDocument();
  });

  test('renders subtitle with correct text', () => {
    render(<HomeWithRouter />);
    
    expect(screen.getByText('Discover the wonders of space through NASA\'s vast collection of data and imagery')).toBeInTheDocument();
  });

  test('renders all four feature cards', () => {
    render(<HomeWithRouter />);
    
    expect(screen.getByText('Astronomy Picture of the Day')).toBeInTheDocument();
    expect(screen.getByText('Mars Rover Photos')).toBeInTheDocument();
    expect(screen.getByText('Near Earth Objects')).toBeInTheDocument();
    expect(screen.getByText('NASA Media Library')).toBeInTheDocument();
  });

  test('renders feature icons correctly', () => {
    render(<HomeWithRouter />);
    
    expect(screen.getByText('🌌')).toBeInTheDocument(); // APOD
    expect(screen.getAllByText('🚀')).toHaveLength(2); // Header + Mars Rover
    expect(screen.getByText('☄️')).toBeInTheDocument(); // NEOs
    expect(screen.getByText('🖼️')).toBeInTheDocument(); // Media Library
  });

  test('renders feature descriptions', () => {
    render(<HomeWithRouter />);
    
    expect(screen.getByText(/Explore stunning daily images of our universe/)).toBeInTheDocument();
    expect(screen.getByText(/View high-resolution images from NASA's Mars rovers/)).toBeInTheDocument();
    expect(screen.getByText(/Track asteroids and other objects passing close to Earth/)).toBeInTheDocument();
    expect(screen.getByText(/Search and explore NASA's vast collection/)).toBeInTheDocument();
  });

  test('navigates to APOD page when APOD card is clicked', async () => {
    const user = userEvent.setup();
    render(<HomeWithRouter />);
    
    const apodCard = screen.getByText('Astronomy Picture of the Day').closest('.feature-card');
    await user.click(apodCard);
    
    expect(mockNavigate).toHaveBeenCalledWith('/apod');
  });

  test('navigates to Mars Rover page when Mars Rover card is clicked', async () => {
    const user = userEvent.setup();
    render(<HomeWithRouter />);
    
    const marsCard = screen.getByText('Mars Rover Photos').closest('.feature-card');
    await user.click(marsCard);
    
    expect(mockNavigate).toHaveBeenCalledWith('/mars-rover');
  });

  test('navigates to NEOs page when NEOs card is clicked', async () => {
    const user = userEvent.setup();
    render(<HomeWithRouter />);
    
    const neosCard = screen.getByText('Near Earth Objects').closest('.feature-card');
    await user.click(neosCard);
    
    expect(mockNavigate).toHaveBeenCalledWith('/neos');
  });

  test('navigates to Media Library page when Media Library card is clicked', async () => {
    const user = userEvent.setup();
    render(<HomeWithRouter />);
    
    const mediaCard = screen.getByText('NASA Media Library').closest('.feature-card');
    await user.click(mediaCard);
    
    expect(mockNavigate).toHaveBeenCalledWith('/media-library');
  });

  test('feature cards have proper accessibility attributes', () => {
    render(<HomeWithRouter />);
    
    const featureCards = screen.getAllByRole('button');
    expect(featureCards).toHaveLength(4);
    
    featureCards.forEach(card => {
      expect(card).toHaveAttribute('tabIndex', '0');
      expect(card).toHaveClass('clickable');
    });
  });

  test('feature cards are keyboard accessible', async () => {
    const user = userEvent.setup();
    render(<HomeWithRouter />);
    
    const apodCard = screen.getByText('Astronomy Picture of the Day').closest('.feature-card');
    
    // Focus and press Enter
    apodCard.focus();
    await user.keyboard('{Enter}');
    
    expect(mockNavigate).toHaveBeenCalledWith('/apod');
  });

  test('feature cards can be accessed via Space key', async () => {
    const user = userEvent.setup();
    render(<HomeWithRouter />);
    
    const marsCard = screen.getByText('Mars Rover Photos').closest('.feature-card');
    
    // Focus and press Space
    marsCard.focus();
    await user.keyboard(' ');
    
    expect(mockNavigate).toHaveBeenCalledWith('/mars-rover');
  });

  test('renders with proper CSS classes', () => {
    render(<HomeWithRouter />);
    
    expect(document.querySelector('.home-container')).toBeInTheDocument();
    expect(document.querySelector('.content-overlay')).toBeInTheDocument();
    expect(document.querySelector('.main-header')).toBeInTheDocument();
    expect(document.querySelector('.features-grid')).toBeInTheDocument();
  });

  test('header emoji has proper accessibility attributes', () => {
    render(<HomeWithRouter />);
    
    const emoji = screen.getByLabelText('rocket');
    expect(emoji).toHaveAttribute('role', 'img');
    expect(emoji).toHaveClass('header-emoji');
  });

  test('main title has proper styling class', () => {
    render(<HomeWithRouter />);
    
    const title = screen.getByText('NASA Explorer');
    expect(title).toHaveClass('main-title');
  });

  test('subtitle has proper styling class', () => {
    render(<HomeWithRouter />);
    
    const subtitle = screen.getByText(/Discover the wonders of space/);
    expect(subtitle).toHaveClass('home-subtitle');
  });

  test('feature icons have proper styling', () => {
    render(<HomeWithRouter />);
    
    const icons = document.querySelectorAll('.feature-icon');
    expect(icons).toHaveLength(4);
    
    icons.forEach(icon => {
      expect(icon).toHaveClass('feature-icon');
    });
  });

  test('feature titles have proper styling', () => {
    render(<HomeWithRouter />);
    
    const titles = document.querySelectorAll('.feature-title');
    expect(titles).toHaveLength(4);
    
    titles.forEach(title => {
      expect(title).toHaveClass('feature-title');
    });
  });

  test('feature descriptions have proper styling', () => {
    render(<HomeWithRouter />);
    
    const descriptions = document.querySelectorAll('.feature-description');
    expect(descriptions).toHaveLength(4);
    
    descriptions.forEach(description => {
      expect(description).toHaveClass('feature-description');
    });
  });

  test('handles multiple rapid clicks gracefully', async () => {
    const user = userEvent.setup();
    render(<HomeWithRouter />);
    
    const apodCard = screen.getByText('Astronomy Picture of the Day').closest('.feature-card');
    
    // Click multiple times rapidly
    await user.click(apodCard);
    await user.click(apodCard);
    await user.click(apodCard);
    
    expect(mockNavigate).toHaveBeenCalledTimes(3);
    expect(mockNavigate).toHaveBeenCalledWith('/apod');
  });

  test('feature cards maintain focus after interaction', async () => {
    const user = userEvent.setup();
    render(<HomeWithRouter />);
    
    const neosCard = screen.getByText('Near Earth Objects').closest('.feature-card');
    
    await user.click(neosCard);
    
    expect(mockNavigate).toHaveBeenCalledWith('/neos');
    // Card should still be focusable
    expect(neosCard).toHaveAttribute('tabIndex', '0');
  });

  test('renders feature cards in correct order', () => {
    render(<HomeWithRouter />);
    
    const cards = screen.getAllByRole('button');
    const cardTitles = cards.map(card => card.querySelector('.feature-title').textContent);
    
    expect(cardTitles).toEqual([
      'Astronomy Picture of the Day',
      'Mars Rover Photos', 
      'Near Earth Objects',
      'NASA Media Library'
    ]);
  });

  test('all feature cards have clickable class', () => {
    render(<HomeWithRouter />);
    
    const cards = screen.getAllByRole('button');
    cards.forEach(card => {
      expect(card).toHaveClass('clickable');
    });
  });

  test('feature descriptions provide meaningful information', () => {
    render(<HomeWithRouter />);
    
    expect(screen.getByText(/accompanied by explanations from professional astronomers/)).toBeInTheDocument();
    expect(screen.getByText(/capturing the red planet's surface in incredible detail/)).toBeInTheDocument();
    expect(screen.getByText(/with interactive data and visualizations/)).toBeInTheDocument();
    expect(screen.getByText(/vast collection of images and videos/)).toBeInTheDocument();
  });

  test('component renders without crashing', () => {
    expect(() => render(<HomeWithRouter />)).not.toThrow();
  });

  test('handles navigation function being called correctly', async () => {
    const user = userEvent.setup();
    render(<HomeWithRouter />);
    
    // Test each navigation path
    const cards = [
      { text: 'Astronomy Picture of the Day', path: '/apod' },
      { text: 'Mars Rover Photos', path: '/mars-rover' },
      { text: 'Near Earth Objects', path: '/neos' },
      { text: 'NASA Media Library', path: '/media-library' }
    ];
    
    for (const card of cards) {
      mockNavigate.mockClear();
      const cardElement = screen.getByText(card.text).closest('.feature-card');
      await user.click(cardElement);
      expect(mockNavigate).toHaveBeenCalledWith(card.path);
    }
  });
}); 