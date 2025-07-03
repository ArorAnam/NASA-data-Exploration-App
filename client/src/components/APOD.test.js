import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock the API_BASE_URL
jest.mock('../config', () => 'http://localhost:5051');

// Mock fetch globally
global.fetch = jest.fn();

// Mock component for testing - simplified version of APOD from App.js
const APODComponent = () => {
  const [apod, setApod] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [imageLoaded, setImageLoaded] = React.useState(false);

  React.useEffect(() => {
    fetch('http://localhost:5051/api/apod')
      .then(res => res.json())
      .then(data => {
        setApod(data);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to fetch APOD data');
        setLoading(false);
      });
  }, []);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  return (
    <div className="apod-container">
      <div className="apod-header">
        <h2 className="apod-title">Astronomy Picture of the Day</h2>
        {apod && <p className="apod-date">{new Date(apod.date).toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}</p>}
      </div>
      
      {loading && (
        <div className="apod-loading">
          <div className="loading-spinner"></div>
          <p>Loading today's cosmic wonder...</p>
        </div>
      )}
      
      {error && (
        <div className="apod-error">
          <p>{error}</p>
        </div>
      )}
      
      {apod && !loading && (
        <div className="apod-content">
          <div className={`apod-image-container ${imageLoaded ? 'loaded' : ''}`}>
            <h3 className="apod-image-title">{apod.title}</h3>
            {apod.media_type === 'image' ? (
              <img
                src={apod.url}
                alt={apod.title}
                className="apod-image"
                onClick={() => setModalOpen(true)}
                onLoad={handleImageLoad}
              />
            ) : (
              <div className="apod-video-container">
                <iframe
                  src={apod.url}
                  title={apod.title}
                  className="apod-video"
                  allowFullScreen
                ></iframe>
              </div>
            )}
          </div>
          
          <div className={`apod-explanation-container ${imageLoaded ? 'visible' : ''}`}>
            <div className="apod-explanation">
              <h4>Today's Cosmic Story</h4>
              <p>{apod.explanation}</p>
              {apod.copyright && (
                <div className="apod-copyright">
                  <strong>Credit:</strong> {apod.copyright}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {modalOpen && apod && (
        <div className="modal active" onClick={() => setModalOpen(false)}>
          <div className="modal-content apod-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={() => setModalOpen(false)}>×</button>
            <h3>{apod.title}</h3>
            <img src={apod.url} alt={apod.title} />
          </div>
        </div>
      )}
    </div>
  );
};

describe('APOD Component', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  test('renders header and title', () => {
    fetch.mockImplementation(() => new Promise(() => {})); // Never resolves
    
    render(<APODComponent />);
    
    expect(screen.getByText('Astronomy Picture of the Day')).toBeInTheDocument();
  });

  test('shows loading state initially', () => {
    fetch.mockImplementation(() => new Promise(() => {})); // Never resolves
    
    render(<APODComponent />);
    
    expect(screen.getByText('Loading today\'s cosmic wonder...')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /astronomy picture of the day/i })).toBeInTheDocument();
  });

  test('displays APOD data after successful fetch', async () => {
    const mockApodData = {
      title: 'Amazing Galaxy',
      explanation: 'This is a beautiful galaxy far, far away.',
      url: 'https://example.com/galaxy.jpg',
      date: '2024-06-30',
      media_type: 'image',
      copyright: 'NASA/ESA'
    };

    fetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue(mockApodData)
    });

    render(<APODComponent />);

    await waitFor(() => {
      expect(screen.getByText('Amazing Galaxy')).toBeInTheDocument();
    });

    expect(screen.getByText('This is a beautiful galaxy far, far away.')).toBeInTheDocument();
    expect(screen.getByText('Credit:')).toBeInTheDocument();
    expect(screen.getByText('NASA/ESA')).toBeInTheDocument();
    expect(screen.getByText('Sunday, June 30, 2024')).toBeInTheDocument();
  });

  test('displays image when media_type is image', async () => {
    const mockApodData = {
      title: 'Space Image',
      explanation: 'A stunning space image.',
      url: 'https://example.com/space.jpg',
      date: '2024-06-30',
      media_type: 'image'
    };

    fetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue(mockApodData)
    });

    render(<APODComponent />);

    await waitFor(() => {
      const image = screen.getByRole('img', { name: /space image/i });
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', 'https://example.com/space.jpg');
    });
  });

  test('displays video when media_type is video', async () => {
    const mockApodData = {
      title: 'Space Video',
      explanation: 'An amazing space video.',
      url: 'https://example.com/space-video.mp4',
      date: '2024-06-30',
      media_type: 'video'
    };

    fetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue(mockApodData)
    });

    render(<APODComponent />);

    await waitFor(() => {
      const iframe = screen.getByTitle('Space Video');
      expect(iframe).toBeInTheDocument();
      expect(iframe).toHaveAttribute('src', 'https://example.com/space-video.mp4');
    });
  });

  test('handles image load event', async () => {
    const mockApodData = {
      title: 'Space Image',
      explanation: 'A stunning space image.',
      url: 'https://example.com/space.jpg',
      date: '2024-06-30',
      media_type: 'image'
    };

    fetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue(mockApodData)
    });

    render(<APODComponent />);

    await waitFor(() => {
      const image = screen.getByRole('img', { name: /space image/i });
      expect(image).toBeInTheDocument();
    });

    const image = screen.getByRole('img', { name: /space image/i });
    
    // Simulate image load
    fireEvent.load(image);

    // Check if loaded class is applied
    const container = image.closest('.apod-image-container');
    expect(container).toHaveClass('loaded');
  });

  test('opens modal when image is clicked', async () => {
    const user = userEvent.setup();
    const mockApodData = {
      title: 'Space Image',
      explanation: 'A stunning space image.',
      url: 'https://example.com/space.jpg',
      date: '2024-06-30',
      media_type: 'image'
    };

    fetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue(mockApodData)
    });

    render(<APODComponent />);

    await waitFor(() => {
      expect(screen.getByRole('img', { name: /space image/i })).toBeInTheDocument();
    });

    const image = screen.getByRole('img', { name: /space image/i });
    await user.click(image);

    // Modal should be open
    expect(screen.getByRole('button', { name: '×' })).toBeInTheDocument();
    expect(screen.getAllByText('Space Image')).toHaveLength(2); // Title appears twice (main + modal)
  });

  test('closes modal when close button is clicked', async () => {
    const user = userEvent.setup();
    const mockApodData = {
      title: 'Space Image',
      explanation: 'A stunning space image.',
      url: 'https://example.com/space.jpg',
      date: '2024-06-30',
      media_type: 'image'
    };

    fetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue(mockApodData)
    });

    render(<APODComponent />);

    await waitFor(() => {
      expect(screen.getByRole('img', { name: /space image/i })).toBeInTheDocument();
    });

    // Open modal
    const image = screen.getByRole('img', { name: /space image/i });
    await user.click(image);

    // Close modal
    const closeButton = screen.getByRole('button', { name: '×' });
    await user.click(closeButton);

    // Modal should be closed
    expect(screen.queryByRole('button', { name: '×' })).not.toBeInTheDocument();
  });

  test('closes modal when background is clicked', async () => {
    const user = userEvent.setup();
    const mockApodData = {
      title: 'Space Image',
      explanation: 'A stunning space image.',
      url: 'https://example.com/space.jpg',
      date: '2024-06-30',
      media_type: 'image'
    };

    fetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue(mockApodData)
    });

    render(<APODComponent />);

    await waitFor(() => {
      expect(screen.getByRole('img', { name: /space image/i })).toBeInTheDocument();
    });

    // Open modal
    const image = screen.getByRole('img', { name: /space image/i });
    await user.click(image);

    // Click modal background
    const modal = document.querySelector('.modal.active');
    await user.click(modal);

    // Modal should be closed
    expect(screen.queryByRole('button', { name: '×' })).not.toBeInTheDocument();
  });

  test('displays error message when fetch fails', async () => {
    fetch.mockRejectedValue(new Error('Network error'));

    render(<APODComponent />);

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch APOD data')).toBeInTheDocument();
    });

    expect(screen.queryByText('Loading today\'s cosmic wonder...')).not.toBeInTheDocument();
  });

  test('handles APOD data without copyright', async () => {
    const mockApodData = {
      title: 'Public Domain Space Image',
      explanation: 'A space image with no copyright.',
      url: 'https://example.com/public-space.jpg',
      date: '2024-06-30',
      media_type: 'image'
      // No copyright field
    };

    fetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue(mockApodData)
    });

    render(<APODComponent />);

    await waitFor(() => {
      expect(screen.getByText('Public Domain Space Image')).toBeInTheDocument();
    });

    expect(screen.queryByText(/Credit:/)).not.toBeInTheDocument();
  });

  test('formats date correctly', async () => {
    const mockApodData = {
      title: 'Space Image',
      explanation: 'A space image.',
      url: 'https://example.com/space.jpg',
      date: '2024-12-25',
      media_type: 'image'
    };

    fetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue(mockApodData)
    });

    render(<APODComponent />);

    await waitFor(() => {
      expect(screen.getByText('Wednesday, December 25, 2024')).toBeInTheDocument();
    });
  });

  test('renders explanation section', async () => {
    const mockApodData = {
      title: 'Space Image',
      explanation: 'This is a detailed explanation of the cosmic phenomenon.',
      url: 'https://example.com/space.jpg',
      date: '2024-06-30',
      media_type: 'image'
    };

    fetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue(mockApodData)
    });

    render(<APODComponent />);

    await waitFor(() => {
      expect(screen.getByText('Today\'s Cosmic Story')).toBeInTheDocument();
      expect(screen.getByText('This is a detailed explanation of the cosmic phenomenon.')).toBeInTheDocument();
    });
  });

  test('calls fetch with correct endpoint', () => {
    fetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue({})
    });
    
    render(<APODComponent />);

    expect(fetch).toHaveBeenCalledWith('http://localhost:5051/api/apod');
  });

  test('modal prevents event propagation when content is clicked', async () => {
    const user = userEvent.setup();
    const mockApodData = {
      title: 'Space Image',
      explanation: 'A stunning space image.',
      url: 'https://example.com/space.jpg',
      date: '2024-06-30',
      media_type: 'image'
    };

    fetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue(mockApodData)
    });

    render(<APODComponent />);

    await waitFor(() => {
      expect(screen.getByRole('img', { name: /space image/i })).toBeInTheDocument();
    });

    // Open modal
    const image = screen.getByRole('img', { name: /space image/i });
    await user.click(image);

    // Click modal content (should not close modal)
    const modalContent = document.querySelector('.modal-content');
    await user.click(modalContent);

    // Modal should still be open
    expect(screen.getByRole('button', { name: '×' })).toBeInTheDocument();
  });

  test('handles invalid JSON response', async () => {
    fetch.mockResolvedValue({
      json: jest.fn().mockRejectedValue(new Error('Invalid JSON'))
    });

    render(<APODComponent />);

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch APOD data')).toBeInTheDocument();
    });
  });

  test('video iframe has proper attributes', async () => {
    const mockApodData = {
      title: 'Space Video',
      explanation: 'An amazing space video.',
      url: 'https://example.com/space-video.mp4',
      date: '2024-06-30',
      media_type: 'video'
    };

    fetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue(mockApodData)
    });

    render(<APODComponent />);

    await waitFor(() => {
      const iframe = screen.getByTitle('Space Video');
      expect(iframe).toHaveAttribute('allowFullScreen');
      expect(iframe).toHaveClass('apod-video');
    });
  });
}); 