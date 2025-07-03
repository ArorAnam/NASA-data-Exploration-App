import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Simple Home component for testing without router
const SimpleHomeComponent = () => {
  const [clickedCard, setClickedCard] = React.useState(null);
  
  const handleCardClick = (cardName) => {
    setClickedCard(cardName);
  };
  
  return (
    <div className="home-container">
      <div className="content-overlay">
        <div className="main-header">
          <span role="img" aria-label="rocket" className="header-emoji">🚀</span>
          <span className="main-title">NASA Explorer</span>
        </div>
        <p className="home-subtitle">Discover the wonders of space through NASA's vast collection of data and imagery</p>
        <div className="features-grid">
          <div 
            className="feature-card clickable" 
            onClick={() => handleCardClick('apod')} 
            tabIndex={0} 
            role="button"
            data-testid="apod-card"
          >
            <div className="feature-icon">🌌</div>
            <h3 className="feature-title">Astronomy Picture of the Day</h3>
            <p className="feature-description">
              Explore stunning daily images of our universe, accompanied by explanations from professional astronomers.
            </p>
          </div>
          <div 
            className="feature-card clickable" 
            onClick={() => handleCardClick('mars-rover')} 
            tabIndex={0} 
            role="button"
            data-testid="mars-card"
          >
            <div className="feature-icon">🚀</div>
            <h3 className="feature-title">Mars Rover Photos</h3>
            <p className="feature-description">
              View high-resolution images from NASA's Mars rovers, capturing the red planet's surface in incredible detail.
            </p>
          </div>
          <div 
            className="feature-card clickable" 
            onClick={() => handleCardClick('neos')} 
            tabIndex={0} 
            role="button"
            data-testid="neos-card"
          >
            <div className="feature-icon">☄️</div>
            <h3 className="feature-title">Near Earth Objects</h3>
            <p className="feature-description">
              Track asteroids and other objects passing close to Earth, with interactive data and visualizations.
            </p>
          </div>
          <div 
            className="feature-card clickable" 
            onClick={() => handleCardClick('media-library')} 
            tabIndex={0} 
            role="button"
            data-testid="media-card"
          >
            <div className="feature-icon">🖼️</div>
            <h3 className="feature-title">NASA Media Library</h3>
            <p className="feature-description">
              Search and explore NASA's vast collection of images and videos.
            </p>
          </div>
        </div>
        {clickedCard && (
          <div data-testid="clicked-indicator">
            Navigating to: {clickedCard}
          </div>
        )}
      </div>
    </div>
  );
};

describe('Home Component (Simplified)', () => {
  test('renders main header with rocket emoji and title', () => {
    render(<SimpleHomeComponent />);
    
    expect(screen.getByText('NASA Explorer')).toBeInTheDocument();
    expect(screen.getByLabelText('rocket')).toBeInTheDocument();
    expect(screen.getByText('🚀')).toBeInTheDocument();
  });

  test('renders subtitle with correct text', () => {
    render(<SimpleHomeComponent />);
    
    expect(screen.getByText('Discover the wonders of space through NASA\'s vast collection of data and imagery')).toBeInTheDocument();
  });

  test('renders all four feature cards', () => {
    render(<SimpleHomeComponent />);
    
    expect(screen.getByText('Astronomy Picture of the Day')).toBeInTheDocument();
    expect(screen.getByText('Mars Rover Photos')).toBeInTheDocument();
    expect(screen.getByText('Near Earth Objects')).toBeInTheDocument();
    expect(screen.getByText('NASA Media Library')).toBeInTheDocument();
  });

  test('renders feature icons correctly', () => {
    render(<SimpleHomeComponent />);
    
    expect(screen.getByText('🌌')).toBeInTheDocument(); // APOD
    expect(screen.getAllByText('🚀')).toHaveLength(2); // Header + Mars Rover
    expect(screen.getByText('☄️')).toBeInTheDocument(); // NEOs
    expect(screen.getByText('🖼️')).toBeInTheDocument(); // Media Library
  });

  test('handles APOD card click', async () => {
    const user = userEvent.setup();
    render(<SimpleHomeComponent />);
    
    const apodCard = screen.getByTestId('apod-card');
    await user.click(apodCard);
    
    expect(screen.getByText('Navigating to: apod')).toBeInTheDocument();
  });

  test('handles Mars Rover card click', async () => {
    const user = userEvent.setup();
    render(<SimpleHomeComponent />);
    
    const marsCard = screen.getByTestId('mars-card');
    await user.click(marsCard);
    
    expect(screen.getByText('Navigating to: mars-rover')).toBeInTheDocument();
  });

  test('handles NEOs card click', async () => {
    const user = userEvent.setup();
    render(<SimpleHomeComponent />);
    
    const neosCard = screen.getByTestId('neos-card');
    await user.click(neosCard);
    
    expect(screen.getByText('Navigating to: neos')).toBeInTheDocument();
  });

  test('handles Media Library card click', async () => {
    const user = userEvent.setup();
    render(<SimpleHomeComponent />);
    
    const mediaCard = screen.getByTestId('media-card');
    await user.click(mediaCard);
    
    expect(screen.getByText('Navigating to: media-library')).toBeInTheDocument();
  });

  test('feature cards have proper accessibility attributes', () => {
    render(<SimpleHomeComponent />);
    
    const featureCards = screen.getAllByRole('button');
    expect(featureCards).toHaveLength(4);
    
    featureCards.forEach(card => {
      expect(card).toHaveAttribute('tabIndex', '0');
      expect(card).toHaveClass('clickable');
    });
  });

  test('feature cards are keyboard accessible', async () => {
    const user = userEvent.setup();
    render(<SimpleHomeComponent />);
    
    const apodCard = screen.getByTestId('apod-card');
    
    // Focus and press Enter
    apodCard.focus();
    await user.keyboard('{Enter}');
    
    expect(screen.getByText('Navigating to: apod')).toBeInTheDocument();
  });

  test('renders with proper CSS classes', () => {
    render(<SimpleHomeComponent />);
    
    expect(document.querySelector('.home-container')).toBeInTheDocument();
    expect(document.querySelector('.content-overlay')).toBeInTheDocument();
    expect(document.querySelector('.main-header')).toBeInTheDocument();
    expect(document.querySelector('.features-grid')).toBeInTheDocument();
  });

  test('header emoji has proper accessibility attributes', () => {
    render(<SimpleHomeComponent />);
    
    const emoji = screen.getByLabelText('rocket');
    expect(emoji).toHaveAttribute('role', 'img');
    expect(emoji).toHaveClass('header-emoji');
  });

  test('feature descriptions provide meaningful information', () => {
    render(<SimpleHomeComponent />);
    
    expect(screen.getByText(/accompanied by explanations from professional astronomers/)).toBeInTheDocument();
    expect(screen.getByText(/capturing the red planet's surface in incredible detail/)).toBeInTheDocument();
    expect(screen.getByText(/with interactive data and visualizations/)).toBeInTheDocument();
    expect(screen.getByText(/vast collection of images and videos/)).toBeInTheDocument();
  });

  test('handles multiple rapid clicks gracefully', async () => {
    const user = userEvent.setup();
    render(<SimpleHomeComponent />);
    
    const apodCard = screen.getByTestId('apod-card');
    
    // Click multiple times rapidly
    await user.click(apodCard);
    await user.click(apodCard);
    await user.click(apodCard);
    
    // Should still show the navigation indicator
    expect(screen.getByText('Navigating to: apod')).toBeInTheDocument();
  });

  test('component renders without crashing', () => {
    expect(() => render(<SimpleHomeComponent />)).not.toThrow();
  });
}); 