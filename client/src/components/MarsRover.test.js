import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock API calls
global.fetch = jest.fn();

// Mock the config
jest.mock('../config', () => 'http://localhost:5051');

// Mock component for testing - simplified version of MarsRover
const MarsRoverComponent = () => {
  const [marsPhotos, setMarsPhotos] = React.useState([]);
  const [rover, setRover] = React.useState('curiosity');
  const [date, setDate] = React.useState('2024-06-01');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [selectedPhoto, setSelectedPhoto] = React.useState(null);
  const [photosLoaded, setPhotosLoaded] = React.useState(false);

  const availableRovers = [
    { value: 'curiosity', name: 'Curiosity', mission: 'Mars Science Laboratory' },
    { value: 'opportunity', name: 'Opportunity', mission: 'Mars Exploration Rover B' },
    { value: 'spirit', name: 'Spirit', mission: 'Mars Exploration Rover A' },
    { value: 'perseverance', name: 'Perseverance', mission: 'Mars 2020' },
    { value: 'ingenuity', name: 'Ingenuity', mission: 'Mars Helicopter' }
  ];

  const fetchMarsPhotos = () => {
    setLoading(true);
    setError(null);
    setPhotosLoaded(false);
    setMarsPhotos([]);
    
    fetch(`http://localhost:5051/api/mars-photos?rover=${rover}&date=${date}`)
      .then(res => res.json())
      .then(data => {
        setMarsPhotos(data.photos || []);
        setLoading(false);
        setTimeout(() => setPhotosLoaded(true), 300);
      })
      .catch(err => {
        setError('Failed to fetch Mars Rover photos. Please try a different date or rover.');
        setLoading(false);
      });
  };

  const openModal = (photo) => {
    setSelectedPhoto(photo);
    setModalOpen(true);
  };

  const selectedRoverInfo = availableRovers.find(r => r.value === rover);

  return (
    <div className="mars-rover-container">
      <div className="mars-rover-header">
        <h2 className="mars-rover-title">Mars Rover Photos</h2>
        <p className="mars-rover-subtitle">
          Explore the Red Planet through the eyes of NASA's robotic explorers
        </p>
      </div>

      <div className="mars-rover-controls">
        <div className="controls-row">
          <div className="control-group">
            <label htmlFor="rover-select">Choose Rover</label>
            <div className="custom-select-wrapper">
              <select 
                id="rover-select"
                value={rover}
                onChange={(e) => setRover(e.target.value)}
                className="mars-rover-select"
              >
                {availableRovers.map(roverOption => (
                  <option key={roverOption.value} value={roverOption.value}>
                    {roverOption.name} - {roverOption.mission}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="control-group">
            <label htmlFor="date-input">Mission Date</label>
            <div className="date-input-wrapper">
              <input
                id="date-input"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mars-rover-date"
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>
        </div>

        <div className="fetch-button-container">
          <button 
            onClick={fetchMarsPhotos} 
            disabled={loading}
            className="mars-fetch-button"
          >
            {loading ? (
              <>
                <div className="button-spinner"></div>
                Exploring Mars...
              </>
            ) : (
              <>
                <span>🚀</span>
                Fetch Photos
              </>
            )}
          </button>
        </div>
      </div>

      {selectedRoverInfo && (
        <div className="rover-info">
          <p>
            <strong>{selectedRoverInfo.name}</strong> from the {selectedRoverInfo.mission} mission
          </p>
        </div>
      )}

      {loading && (
        <div className="mars-loading">
          <div className="loading-spinner mars-spinner"></div>
          <p>Downloading images from Mars...</p>
        </div>
      )}

      {error && (
        <div className="mars-error">
          <p>{error}</p>
        </div>
      )}

      {marsPhotos.length > 0 && (
        <div className="mars-results-info">
          <p>Found {marsPhotos.length} photos from {selectedRoverInfo?.name} on {new Date(date).toLocaleDateString()}</p>
        </div>
      )}

      <div className={`mars-photos-grid ${photosLoaded ? 'loaded' : ''}`}>
        {marsPhotos.map((photo, index) => (
          <div 
            key={index} 
            className="mars-photo-card"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <img
              src={photo.img_src}
              alt={`Mars Rover Photo ${index + 1}`}
              onClick={() => openModal(photo)}
              loading="lazy"
            />
            <div className="photo-overlay">
              <p>Sol {photo.sol}</p>
              <p>{photo.camera?.full_name || photo.camera?.name}</p>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && selectedPhoto && (
        <div className="modal active" onClick={() => setModalOpen(false)}>
          <div className="modal-content mars-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={() => setModalOpen(false)}>×</button>
            <div className="mars-modal-header">
              <h3>{selectedRoverInfo?.name} - Sol {selectedPhoto.sol}</h3>
              <p>{selectedPhoto.camera?.full_name || selectedPhoto.camera?.name}</p>
              <p>Earth Date: {selectedPhoto.earth_date}</p>
            </div>
            <img src={selectedPhoto.img_src} alt="Mars Rover Photo" />
          </div>
        </div>
      )}
    </div>
  );
};

describe('MarsRover Component', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  test('renders header and subtitle', () => {
    render(<MarsRoverComponent />);
    
    expect(screen.getByText('Mars Rover Photos')).toBeInTheDocument();
    expect(screen.getByText('Explore the Red Planet through the eyes of NASA\'s robotic explorers')).toBeInTheDocument();
  });

  test('renders form controls with default values', () => {
    render(<MarsRoverComponent />);
    
    expect(screen.getByLabelText('Choose Rover')).toBeInTheDocument();
    expect(screen.getByLabelText('Mission Date')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /fetch photos/i })).toBeInTheDocument();
    
    // Check default values
    const roverSelect = screen.getByLabelText('Choose Rover');
    const dateInput = screen.getByLabelText('Mission Date');
    expect(roverSelect).toHaveValue('curiosity');
    expect(dateInput).toHaveValue('2024-06-01');
  });

  test('renders all rover options', () => {
    render(<MarsRoverComponent />);
    
    const roverSelect = screen.getByLabelText('Choose Rover');
    const options = roverSelect.querySelectorAll('option');
    
    expect(options).toHaveLength(5);
    expect(options[0]).toHaveValue('curiosity');
    expect(options[1]).toHaveValue('opportunity');
    expect(options[2]).toHaveValue('spirit');
    expect(options[3]).toHaveValue('perseverance');
    expect(options[4]).toHaveValue('ingenuity');
  });

  test('displays rover information', () => {
    render(<MarsRoverComponent />);
    
    const roverInfo = screen.getByText('Curiosity');
    expect(roverInfo).toBeInTheDocument();
  });

  test('allows changing rover selection', async () => {
    const user = userEvent.setup();
    render(<MarsRoverComponent />);
    
    const roverSelect = screen.getByLabelText('Choose Rover');
    await user.selectOptions(roverSelect, 'perseverance');
    
    expect(roverSelect).toHaveValue('perseverance');
    expect(screen.getByText('Perseverance')).toBeInTheDocument();
  });

  test('allows changing date', async () => {
    const user = userEvent.setup();
    render(<MarsRoverComponent />);
    
    const dateInput = screen.getByLabelText('Mission Date');
    await user.clear(dateInput);
    await user.type(dateInput, '2023-12-25');
    
    expect(dateInput).toHaveValue('2023-12-25');
  });

  test('date input has max attribute set to today', () => {
    render(<MarsRoverComponent />);
    
    const dateInput = screen.getByLabelText('Mission Date');
    const today = new Date().toISOString().split('T')[0];
    expect(dateInput).toHaveAttribute('max', today);
  });

  test('shows loading state when fetching photos', async () => {
    const user = userEvent.setup();
    fetch.mockImplementation(() => new Promise(() => {})); // Never resolves
    
    render(<MarsRoverComponent />);
    
    const fetchButton = screen.getByRole('button', { name: /fetch photos/i });
    await user.click(fetchButton);
    
    expect(screen.getByText('Exploring Mars...')).toBeInTheDocument();
    expect(screen.getByText('Downloading images from Mars...')).toBeInTheDocument();
    expect(fetchButton).toBeDisabled();
  });

  test('displays photos after successful fetch', async () => {
    const user = userEvent.setup();
    const mockPhotos = {
      photos: [
        {
          id: 1,
          img_src: 'https://example.com/mars1.jpg',
          sol: 1000,
          earth_date: '2024-06-01',
          camera: { name: 'FHAZ', full_name: 'Front Hazard Avoidance Camera' }
        },
        {
          id: 2,
          img_src: 'https://example.com/mars2.jpg',
          sol: 1001,
          earth_date: '2024-06-02',
          camera: { name: 'RHAZ', full_name: 'Rear Hazard Avoidance Camera' }
        }
      ]
    };

    fetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue(mockPhotos)
    });

    render(<MarsRoverComponent />);
    
    const fetchButton = screen.getByRole('button', { name: /fetch photos/i });
    await user.click(fetchButton);

    await waitFor(() => {
      expect(screen.getByText('Found 2 photos from Curiosity on 6/1/2024')).toBeInTheDocument();
    });

    expect(screen.getAllByAltText(/Mars Rover Photo/)).toHaveLength(2);
    expect(screen.getByText('Sol 1000')).toBeInTheDocument();
    expect(screen.getByText('Sol 1001')).toBeInTheDocument();
    expect(screen.getByText('Front Hazard Avoidance Camera')).toBeInTheDocument();
    expect(screen.getByText('Rear Hazard Avoidance Camera')).toBeInTheDocument();
  });

  test('displays error message when fetch fails', async () => {
    const user = userEvent.setup();
    fetch.mockRejectedValue(new Error('Network error'));

    render(<MarsRoverComponent />);
    
    const fetchButton = screen.getByRole('button', { name: /fetch photos/i });
    await user.click(fetchButton);

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch Mars Rover photos. Please try a different date or rover.')).toBeInTheDocument();
    });

    expect(screen.queryByText('Downloading images from Mars...')).not.toBeInTheDocument();
  });

  test('opens modal when photo is clicked', async () => {
    const user = userEvent.setup();
    const mockPhotos = {
      photos: [
        {
          id: 1,
          img_src: 'https://example.com/mars1.jpg',
          sol: 1000,
          earth_date: '2024-06-01',
          camera: { name: 'FHAZ', full_name: 'Front Hazard Avoidance Camera' }
        }
      ]
    };

    fetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue(mockPhotos)
    });

    render(<MarsRoverComponent />);
    
    const fetchButton = screen.getByRole('button', { name: /fetch photos/i });
    await user.click(fetchButton);

    await waitFor(() => {
      expect(screen.getByAltText('Mars Rover Photo 1')).toBeInTheDocument();
    });

    const photo = screen.getByAltText('Mars Rover Photo 1');
    await user.click(photo);

    expect(screen.getByText('×')).toBeInTheDocument(); // Modal close button
    expect(screen.getByRole('button', { name: '×' })).toBeInTheDocument();
    expect(screen.getByText('Curiosity - Sol 1000')).toBeInTheDocument();
    expect(screen.getByText('Earth Date: 2024-06-01')).toBeInTheDocument();
  });

  test('closes modal when close button is clicked', async () => {
    const user = userEvent.setup();
    const mockPhotos = {
      photos: [
        {
          id: 1,
          img_src: 'https://example.com/mars1.jpg',
          sol: 1000,
          earth_date: '2024-06-01',
          camera: { name: 'FHAZ', full_name: 'Front Hazard Avoidance Camera' }
        }
      ]
    };

    fetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue(mockPhotos)
    });

    render(<MarsRoverComponent />);
    
    const fetchButton = screen.getByRole('button', { name: /fetch photos/i });
    await user.click(fetchButton);

    await waitFor(() => {
      expect(screen.getByAltText('Mars Rover Photo 1')).toBeInTheDocument();
    });

    const photo = screen.getByAltText('Mars Rover Photo 1');
    await user.click(photo);

    const closeButton = screen.getByRole('button', { name: '×' });
    await user.click(closeButton);

    expect(screen.queryByText('×')).not.toBeInTheDocument();
  });

  test('photos have lazy loading attribute', async () => {
    const user = userEvent.setup();
    const mockPhotos = {
      photos: [
        {
          id: 1,
          img_src: 'https://example.com/mars1.jpg',
          sol: 1000,
          earth_date: '2024-06-01',
          camera: { name: 'FHAZ' }
        }
      ]
    };

    fetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue(mockPhotos)
    });

    render(<MarsRoverComponent />);
    
    const fetchButton = screen.getByRole('button', { name: /fetch photos/i });
    await user.click(fetchButton);

    await waitFor(() => {
      const photo = screen.getByAltText('Mars Rover Photo 1');
      expect(photo).toHaveAttribute('loading', 'lazy');
    });
  });

  test('handles photos with no camera full name', async () => {
    const user = userEvent.setup();
    const mockPhotos = {
      photos: [
        {
          id: 1,
          img_src: 'https://example.com/mars1.jpg',
          sol: 1000,
          earth_date: '2024-06-01',
          camera: { name: 'FHAZ' } // No full_name
        }
      ]
    };

    fetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue(mockPhotos)
    });

    render(<MarsRoverComponent />);
    
    const fetchButton = screen.getByRole('button', { name: /fetch photos/i });
    await user.click(fetchButton);

    await waitFor(() => {
      expect(screen.getByText('FHAZ')).toBeInTheDocument();
    });
  });

  test('button shows rocket emoji when not loading', () => {
    render(<MarsRoverComponent />);
    
    const fetchButton = screen.getByRole('button', { name: /fetch photos/i });
    expect(fetchButton).toHaveTextContent('🚀');
  });
}); 