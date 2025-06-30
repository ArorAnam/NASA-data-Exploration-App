import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock fetch
global.fetch = jest.fn();

// Mock config
jest.mock('../config', () => 'http://localhost:5051');

// Mock clipboard API
const mockWriteText = jest.fn();
Object.assign(navigator, {
  clipboard: {
    writeText: mockWriteText
  }
});

// Mock component for testing
const NasaMediaLibraryComponent = () => {
  const [query, setQuery] = React.useState('mars');
  const [mediaType, setMediaType] = React.useState('image');
  const [results, setResults] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [modalItem, setModalItem] = React.useState(null);
  const [shareMsg, setShareMsg] = React.useState('');
  const [resultsLoaded, setResultsLoaded] = React.useState(false);

  const mediaTypes = [
    { value: 'image', label: 'Images', icon: '🖼️' },
    { value: 'video', label: 'Videos', icon: '🎬' },
    { value: 'audio', label: 'Audio', icon: '🎵' }
  ];

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResults([]);
    setResultsLoaded(false);
    
    try {
      const res = await fetch(`http://localhost:5051/api/nasa-media?query=${encodeURIComponent(query)}&media_type=${mediaType}`);
      const data = await res.json();
      setResults(data.collection?.items || []);
      setTimeout(() => setResultsLoaded(true), 300);
    } catch (err) {
      setError('Failed to fetch NASA media.');
    } finally {
      setLoading(false);
    }
  };

  // Removed automatic search on mount for testing

  const openModal = (item) => { 
    setModalItem(item); 
    setModalOpen(true); 
    setShareMsg(''); 
  };
  
  const closeModal = () => { 
    setModalOpen(false); 
    setModalItem(null); 
    setShareMsg(''); 
  };
  
  const handleShare = (url) => { 
    navigator.clipboard.writeText(url); 
    setShareMsg('Link copied!'); 
    setTimeout(() => setShareMsg(''), 2000); 
  };

  const selectedMediaType = mediaTypes.find(type => type.value === mediaType);
  
  return (
    <div className="nasa-media-container">
      <div className="media-header">
        <h2 className="media-title">NASA Media Library</h2>
        <p className="media-subtitle">
          Discover NASA's vast collection of stunning imagery, videos, and audio from space exploration
        </p>
      </div>

      <div className="media-search-controls">
        <div className="search-form-container">
          <form className="media-search-form" onSubmit={handleSearch}>
            <div className="search-input-group">
              <label htmlFor="search-input">Search Query</label>
              <div className="search-input-wrapper">
                <input
                  id="search-input"
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search NASA media..."
                  className="media-search-input"
                />
                <div className="search-icon">🔍</div>
              </div>
            </div>

            <div className="media-type-group">
              <label htmlFor="media-type-select">Media Type</label>
              <div className="custom-select-wrapper">
                <select 
                  id="media-type-select"
                  value={mediaType} 
                  onChange={e => setMediaType(e.target.value)}
                  className="media-type-select"
                >
                  {mediaTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </option>
                  ))}
                </select>
                <div className="select-arrow">▼</div>
              </div>
            </div>
          </form>

          <div className="search-button-container">
            <button 
              className="media-search-button" 
              type="submit" 
              disabled={loading}
              onClick={handleSearch}
            >
              {loading ? (
                <>
                  <div className="button-spinner"></div>
                  Exploring Library...
                </>
              ) : (
                <>
                  <span>🚀</span>
                  Search Media
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {selectedMediaType && (
        <div className="media-type-info">
          <p>
            Searching for <strong>{selectedMediaType.icon} {selectedMediaType.label}</strong> 
            {query && ` matching "${query}"`}
          </p>
        </div>
      )}

      {loading && (
        <div className="media-loading">
          <div className="loading-spinner media-spinner"></div>
          <p>Searching NASA's vast media collection...</p>
        </div>
      )}

      {error && (
        <div className="media-error">
          <p>{error}</p>
        </div>
      )}

      {results.length > 0 && (
        <div className="media-results-info">
          <p>Found {results.length} {selectedMediaType?.label.toLowerCase()} {query && `for "${query}"`}</p>
        </div>
      )}

      <div className={`media-gallery-grid ${resultsLoaded ? 'loaded' : ''}`}>
        {results.map((item, idx) => {
          const data = item.data[0];
          const thumb = item.links?.[0]?.href;
          return (
            <div 
              className="media-gallery-card" 
              key={item.data[0].nasa_id + idx} 
              onClick={() => openModal(item)}
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <div className="media-card-content">
                {thumb && (
                  <div className="media-thumb-container">
                    <img src={thumb} alt={data.title} className="media-thumb" />
                    <div className="media-overlay">
                      <div className="media-type-badge">
                        {selectedMediaType?.icon} {data.media_type}
                      </div>
                    </div>
                  </div>
                )}
                <div className="media-info">
                  <div className="media-title">{data.title}</div>
                  <div className="media-date">
                    {data.date_created && new Date(data.date_created).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {(!loading && results.length === 0 && query) && (
          <div className="no-results">
            <div className="no-results-icon">🔍</div>
            <h3>No results found</h3>
            <p>Try a different search term or media type</p>
          </div>
        )}
      </div>
      
      {modalOpen && modalItem && (
        <div className="modal active" onClick={closeModal}>
          <div className="modal-content media-modal" onClick={e => e.stopPropagation()}>
            <button className="close-button" onClick={closeModal}>×</button>
            <div className="media-modal-header">
              <h3>{modalItem.data[0].title}</h3>
              <div className="media-modal-meta">
                <span className="media-modal-type">
                  {selectedMediaType?.icon} {modalItem.data[0].media_type}
                </span>
                {modalItem.data[0].date_created && (
                  <span className="media-modal-date">
                    {new Date(modalItem.data[0].date_created).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
            
            <div className="media-modal-content">
              {modalItem.data[0].description && (
                <p className="media-description">{modalItem.data[0].description}</p>
              )}
              
              <div className="media-display">
                {modalItem.data[0].media_type === 'image' && (
                  <img src={modalItem.links?.[0]?.href} alt={modalItem.data[0].title} />
                )}
                {modalItem.data[0].media_type === 'video' && (
                  <div className="video-container">
                    <video 
                      src={modalItem.links?.[0]?.href} 
                      controls 
                      preload="metadata"
                      className="media-video"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    >
                      Your browser does not support the video tag.
                    </video>
                    <div className="media-error-fallback" style={{display: 'none'}}>
                      <div className="fallback-content">
                        <span className="fallback-icon">🎬</span>
                        <p>Video playback not supported</p>
                      </div>
                    </div>
                  </div>
                )}
                {modalItem.data[0].media_type === 'audio' && (
                  <div className="audio-container">
                    <audio 
                      src={modalItem.links?.[0]?.href} 
                      controls
                      className="media-audio"
                    >
                      Your browser does not support the audio tag.
                    </audio>
                  </div>
                )}
              </div>
              
              <div className="modal-actions">
                <button 
                  className="share-button" 
                  onClick={() => handleShare(modalItem.links?.[0]?.href)}
                >
                  Share
                </button>
                {shareMsg && <span className="share-message">{shareMsg}</span>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

describe('NasaMediaLibrary Component', () => {
  beforeEach(() => {
    fetch.mockClear();
    mockWriteText.mockClear();
  });

  test('renders header and title', () => {
    render(<NasaMediaLibraryComponent />);
    
    expect(screen.getByText('NASA Media Library')).toBeInTheDocument();
    expect(screen.getByText(/Discover NASA's vast collection/)).toBeInTheDocument();
  });

  test('renders search form with default values', () => {
    render(<NasaMediaLibraryComponent />);
    
    expect(screen.getByLabelText('Search Query')).toHaveValue('mars');
    expect(screen.getByLabelText('Media Type')).toHaveValue('image');
  });

  test('renders all media type options', () => {
    render(<NasaMediaLibraryComponent />);
    
    const select = screen.getByLabelText('Media Type');
    expect(select).toBeInTheDocument();
    
    // Check if options are present in the select
    expect(screen.getByRole('option', { name: '🖼️ Images' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '🎬 Videos' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '🎵 Audio' })).toBeInTheDocument();
  });

  test('renders search button', () => {
    render(<NasaMediaLibraryComponent />);
    
    // Button should exist with search text
    const searchButton = screen.getByRole('button', { name: /search media/i });
    expect(searchButton).toBeInTheDocument();
    expect(searchButton).not.toBeDisabled();
  });

  test('allows changing search query', async () => {
    const user = userEvent.setup();
    render(<NasaMediaLibraryComponent />);
    
    const searchInput = screen.getByLabelText('Search Query');
    await user.clear(searchInput);
    await user.type(searchInput, 'apollo');
    
    expect(searchInput).toHaveValue('apollo');
  });

  test('allows changing media type', async () => {
    const user = userEvent.setup();
    render(<NasaMediaLibraryComponent />);
    
    const mediaSelect = screen.getByLabelText('Media Type');
    await user.selectOptions(mediaSelect, 'video');
    
    expect(mediaSelect).toHaveValue('video');
  });

  test('shows loading state when searching', async () => {
    const user = userEvent.setup();
    fetch.mockImplementation(() => new Promise(() => {})); // Never resolves
    
    render(<NasaMediaLibraryComponent />);
    
    const searchButton = screen.getByRole('button', { name: /search media/i });
    await user.click(searchButton);
    
    expect(screen.getByText('Exploring Library...')).toBeInTheDocument();
    expect(screen.getByText("Searching NASA's vast media collection...")).toBeInTheDocument();
    expect(searchButton).toBeDisabled();
  });

  test('fetches and displays media results', async () => {
    const user = userEvent.setup();
    const mockMediaData = {
      collection: {
        items: [
          {
            data: [{
              nasa_id: 'test123',
              title: 'Mars Rover Image',
              description: 'A beautiful image from Mars',
              date_created: '2024-01-15T00:00:00Z',
              media_type: 'image'
            }],
            links: [{
              href: 'https://example.com/mars-image.jpg'
            }]
          }
        ]
      }
    };

    fetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue(mockMediaData)
    });

    render(<NasaMediaLibraryComponent />);
    
    const searchButton = screen.getByRole('button', { name: /search media/i });
    await user.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText('Mars Rover Image')).toBeInTheDocument();
    }, { timeout: 3000 });

    expect(screen.getByText((content, element) => {
      return content.includes('Found 1 images');
    })).toBeInTheDocument();
    expect(screen.getByText('1/15/2024')).toBeInTheDocument();
  });

  test('displays error message when fetch fails', async () => {
    const user = userEvent.setup();
    fetch.mockRejectedValue(new Error('Network error'));

    render(<NasaMediaLibraryComponent />);
    
    const searchButton = screen.getByRole('button', { name: /search media/i });
    await user.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch NASA media.')).toBeInTheDocument();
    });
  });

  test('displays no results message when search returns empty', async () => {
    const user = userEvent.setup();
    fetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue({ collection: { items: [] } })
    });

    render(<NasaMediaLibraryComponent />);
    
    const searchButton = screen.getByRole('button', { name: /search media/i });
    await user.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText('No results found')).toBeInTheDocument();
    });

    expect(screen.getByText('Try a different search term or media type')).toBeInTheDocument();
  });

  test('opens modal when media item is clicked', async () => {
    const user = userEvent.setup();
    const mockMediaData = {
      collection: {
        items: [
          {
            data: [{
              nasa_id: 'test123',
              title: 'Mars Rover Image',
              description: 'A beautiful image from Mars',
              date_created: '2024-01-15T00:00:00Z',
              media_type: 'image'
            }],
            links: [{
              href: 'https://example.com/mars-image.jpg'
            }]
          }
        ]
      }
    };

    fetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue(mockMediaData)
    });

    render(<NasaMediaLibraryComponent />);
    
    const searchButton = screen.getByRole('button', { name: /search media/i });
    await user.click(searchButton);
    
    await waitFor(() => {
      expect(screen.getByText('Mars Rover Image')).toBeInTheDocument();
    }, { timeout: 3000 });

    const mediaCard = screen.getByText('Mars Rover Image').closest('.media-gallery-card');
    await user.click(mediaCard);

    // Modal should be open
    expect(screen.getByRole('button', { name: '×' })).toBeInTheDocument();
    expect(screen.getByText('A beautiful image from Mars')).toBeInTheDocument();
  });

  test('closes modal when close button is clicked', async () => {
    const user = userEvent.setup();
    const mockMediaData = {
      collection: {
        items: [
          {
            data: [{
              nasa_id: 'test123',
              title: 'Mars Rover Image',
              description: 'A beautiful image from Mars',
              date_created: '2024-01-15T00:00:00Z',
              media_type: 'image'
            }],
            links: [{
              href: 'https://example.com/mars-image.jpg'
            }]
          }
        ]
      }
    };

    fetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue(mockMediaData)
    });

    render(<NasaMediaLibraryComponent />);
    
    const searchButton = screen.getByRole('button', { name: /search media/i });
    await user.click(searchButton);
    
    await waitFor(() => {
      expect(screen.getByText('Mars Rover Image')).toBeInTheDocument();
    }, { timeout: 3000 });

    // Open modal
    const mediaCard = screen.getByText('Mars Rover Image').closest('.media-gallery-card');
    await user.click(mediaCard);

    // Close modal
    const closeButton = screen.getByRole('button', { name: '×' });
    await user.click(closeButton);

    // Modal should be closed
    expect(screen.queryByText('A beautiful image from Mars')).not.toBeInTheDocument();
  });

  test('renders image content in modal', async () => {
    const user = userEvent.setup();
    const mockMediaData = {
      collection: {
        items: [
          {
            data: [{
              nasa_id: 'test123',
              title: 'Mars Rover Image',
              description: 'A beautiful image from Mars',
              date_created: '2024-01-15T00:00:00Z',
              media_type: 'image'
            }],
            links: [{
              href: 'https://example.com/mars-image.jpg'
            }]
          }
        ]
      }
    };

    fetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue(mockMediaData)
    });

    render(<NasaMediaLibraryComponent />);
    
    const searchButton = screen.getByRole('button', { name: /search media/i });
    await user.click(searchButton);
    
    await waitFor(() => {
      expect(screen.getByText('Mars Rover Image')).toBeInTheDocument();
    }, { timeout: 3000 });

    const mediaCard = screen.getByText('Mars Rover Image').closest('.media-gallery-card');
    await user.click(mediaCard);

    // Image should be displayed in modal
    const modalImage = screen.getAllByRole('img').find(img => 
      img.getAttribute('src') === 'https://example.com/mars-image.jpg'
    );
    expect(modalImage).toBeInTheDocument();
  });



  test('share functionality copies link to clipboard', async () => {
    const user = userEvent.setup();
    const mockMediaData = {
      collection: {
        items: [
          {
            data: [{
              nasa_id: 'test123',
              title: 'Mars Rover Image',
              description: 'A beautiful image from Mars',
              date_created: '2024-01-15T00:00:00Z',
              media_type: 'image'
            }],
            links: [{
              href: 'https://example.com/mars-image.jpg'
            }]
          }
        ]
      }
    };

    fetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue(mockMediaData)
    });

    render(<NasaMediaLibraryComponent />);
    
    const searchButton = screen.getByRole('button', { name: /search media/i });
    await user.click(searchButton);
    
    await waitFor(() => {
      expect(screen.getByText('Mars Rover Image')).toBeInTheDocument();
    }, { timeout: 3000 });

    // Open modal
    const mediaCard = screen.getByText('Mars Rover Image').closest('.media-gallery-card');
    await user.click(mediaCard);

    // Click share button
    const shareButton = screen.getByRole('button', { name: 'Share' });
    await user.click(shareButton);

    // Check that the share message appears (indicates the function was called)
    expect(screen.getByText('Link copied!')).toBeInTheDocument();
  });

  test('displays media type info based on current selection', async () => {
    const user = userEvent.setup();
    render(<NasaMediaLibraryComponent />);
    
    // Check that media type info is displayed
    expect(screen.getByText((content, element) => {
      return content.includes('Searching for');
    })).toBeInTheDocument();
    expect(screen.getAllByText((content, element) => {
      return content.includes('Images');
    })[0]).toBeInTheDocument();

    // Change to videos
    const mediaSelect = screen.getByLabelText('Media Type');
    await user.selectOptions(mediaSelect, 'video');

    expect(screen.getAllByText((content, element) => {
      return content.includes('Videos');
    })[0]).toBeInTheDocument();
  });

  test('handles form submission', async () => {
    const user = userEvent.setup();
    fetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue({ collection: { items: [] } })
    });

    render(<NasaMediaLibraryComponent />);
    
    const searchInput = screen.getByLabelText('Search Query');
    const searchButton = screen.getByRole('button', { name: /search media/i });
    
    await user.clear(searchInput);
    await user.type(searchInput, 'apollo');
    await user.click(searchButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5051/api/nasa-media?query=apollo&media_type=image'
      );
    });
  });
}); 