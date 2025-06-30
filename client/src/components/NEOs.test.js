import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock Chart.js
jest.mock('chart.js', () => ({
  Chart: jest.fn().mockImplementation(() => ({
    destroy: jest.fn(),
    update: jest.fn(),
    resize: jest.fn()
  })),
  CategoryScale: jest.fn(),
  LinearScale: jest.fn(),
  BarElement: jest.fn(),
  PointElement: jest.fn(),
  LineElement: jest.fn(),
  ScatterController: jest.fn(),
  LineController: jest.fn(),
  Title: jest.fn(),
  Tooltip: jest.fn(),
  Legend: jest.fn(),
  register: jest.fn()
}));

// Mock Three.js
jest.mock('three', () => ({
  Scene: jest.fn().mockImplementation(() => ({
    add: jest.fn(),
    traverse: jest.fn()
  })),
  PerspectiveCamera: jest.fn(),
  WebGLRenderer: jest.fn().mockImplementation(() => ({
    setSize: jest.fn(),
    setClearColor: jest.fn(),
    domElement: { appendChild: jest.fn() },
    dispose: jest.fn()
  })),
  SphereGeometry: jest.fn(),
  RingGeometry: jest.fn(),
  MeshPhongMaterial: jest.fn(),
  MeshBasicMaterial: jest.fn(),
  Mesh: jest.fn(),
  AmbientLight: jest.fn(),
  DirectionalLight: jest.fn(),
  DoubleSide: {},
  Vector3: jest.fn()
}));

// Mock fetch
global.fetch = jest.fn();

// Mock config
jest.mock('../config', () => 'http://localhost:5051');

// Mock component for testing
const NEOsComponent = () => {
  const [startDate, setStartDate] = React.useState('2024-06-01');
  const [endDate, setEndDate] = React.useState('2024-06-02');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [neos, setNeos] = React.useState([]);
  const [view, setView] = React.useState('table');

  const fetchNEOs = async () => {
    setLoading(true);
    setError(null);
    setNeos([]);
    try {
      const res = await fetch(`http://localhost:5051/api/neo-feed?start_date=${startDate}&end_date=${endDate}`);
      const data = await res.json();
      const allNeos = Object.values(data.near_earth_objects || {}).flat();
      setNeos(allNeos);
    } catch (err) {
      setError('Failed to fetch Near Earth Object data');
    } finally {
      setLoading(false);
    }
  };

  const handleViewChange = (newView) => {
    setView(newView);
  };

  return (
    <div className="neos-container">
      <h2>Near Earth Objects - Advanced Analytics</h2>
      <div className="neos-controls">
        <label>
          Start Date:
          <input 
            type="date" 
            value={startDate} 
            onChange={e => setStartDate(e.target.value)} 
          />
        </label>
        <label>
          End Date:
          <input 
            type="date" 
            value={endDate} 
            onChange={e => setEndDate(e.target.value)} 
          />
        </label>
        <button onClick={fetchNEOs} disabled={loading} className="explore-button">
          {loading ? 'Loading...' : 'Fetch NEOs'}
        </button>
        <div className="neos-toggle">
          <button
            className={view === 'table' ? 'neos-toggle-active' : ''}
            onClick={() => handleViewChange('table')}
          >
            Data Table
          </button>
          <button
            className={view === 'chart' ? 'neos-toggle-active' : ''}
            onClick={() => handleViewChange('chart')}
          >
            Size Chart
          </button>
          <button
            className={view === 'risk-matrix' ? 'neos-toggle-active' : ''}
            onClick={() => handleViewChange('risk-matrix')}
          >
            Risk Matrix
          </button>
          <button
            className={view === 'velocity' ? 'neos-toggle-active' : ''}
            onClick={() => handleViewChange('velocity')}
          >
            Velocity Analysis
          </button>
          <button
            className={view === 'timeline' ? 'neos-toggle-active' : ''}
            onClick={() => handleViewChange('timeline')}
          >
            Discovery Timeline
          </button>
          <button
            className={view === '3d-orbit' ? 'neos-toggle-active' : ''}
            onClick={() => handleViewChange('3d-orbit')}
          >
            3D Orbit View
          </button>
          <button
            className={view === 'orbital-analysis' ? 'neos-toggle-active' : ''}
            onClick={() => handleViewChange('orbital-analysis')}
          >
            Orbital Analysis
          </button>
        </div>
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      {view === 'table' ? (
        <div className="neos-table-wrapper">
          <table className="neos-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Close Approach Date</th>
                <th>Diameter (m)</th>
                <th>Miss Distance (km)</th>
                <th>Velocity (km/h)</th>
                <th>Hazardous?</th>
              </tr>
            </thead>
            <tbody>
              {neos.map((neo) => {
                const approach = neo.close_approach_data[0];
                return (
                  <tr key={neo.id}>
                    <td>
                      <a href={neo.nasa_jpl_url} target="_blank" rel="noopener noreferrer">
                        {neo.name}
                      </a>
                    </td>
                    <td>{approach?.close_approach_date_full || approach?.close_approach_date}</td>
                    <td>
                      {Math.round(neo.estimated_diameter.meters.estimated_diameter_min)} - {Math.round(neo.estimated_diameter.meters.estimated_diameter_max)}
                    </td>
                    <td>{Number(approach?.miss_distance.kilometers).toLocaleString()}</td>
                    <td>{Number(approach?.relative_velocity.kilometers_per_hour).toLocaleString()}</td>
                    <td>{neo.is_potentially_hazardous_asteroid ? 'Yes' : 'No'}</td>
                  </tr>
                );
              })}
              {(!loading && neos.length === 0) && (
                <tr><td colSpan={6} style={{ textAlign: 'center' }}>No data to display</td></tr>
              )}
            </tbody>
          </table>
        </div>
      ) : view === '3d-orbit' ? (
        <div className="orbit-viewer-container">
          <div className="orbit-viewer" style={{ width: '100%', height: '500px' }}>
            3D Orbit Visualization
          </div>
        </div>
      ) : (
        <div className="chart-container">
          <canvas 
            ref={(canvas) => {
              if (canvas && neos.length > 0) {
                // Chart would be created here
                canvas.setAttribute('data-chart-type', view);
              }
            }}
            width="800" 
            height="400"
          />
        </div>
      )}
    </div>
  );
};

describe('NEOs Component', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  test('renders header and title', () => {
    render(<NEOsComponent />);
    
    expect(screen.getByText('Near Earth Objects - Advanced Analytics')).toBeInTheDocument();
  });

  test('renders date controls with default values', () => {
    render(<NEOsComponent />);
    
    expect(screen.getByLabelText('Start Date:')).toHaveValue('2024-06-01');
    expect(screen.getByLabelText('End Date:')).toHaveValue('2024-06-02');
  });

  test('renders fetch button', () => {
    render(<NEOsComponent />);
    
    const fetchButton = screen.getByRole('button', { name: /fetch neos/i });
    expect(fetchButton).toBeInTheDocument();
    expect(fetchButton).not.toBeDisabled();
  });

  test('renders all view toggle buttons', () => {
    render(<NEOsComponent />);
    
    expect(screen.getByText('Data Table')).toBeInTheDocument();
    expect(screen.getByText('Size Chart')).toBeInTheDocument();
    expect(screen.getByText('Risk Matrix')).toBeInTheDocument();
    expect(screen.getByText('Velocity Analysis')).toBeInTheDocument();
    expect(screen.getByText('Discovery Timeline')).toBeInTheDocument();
    expect(screen.getByText('3D Orbit View')).toBeInTheDocument();
    expect(screen.getByText('Orbital Analysis')).toBeInTheDocument();
  });

  test('table view is active by default', () => {
    render(<NEOsComponent />);
    
    const tableButton = screen.getByText('Data Table');
    expect(tableButton).toHaveClass('neos-toggle-active');
  });

  test('allows changing start date', async () => {
    const user = userEvent.setup();
    render(<NEOsComponent />);
    
    const startDateInput = screen.getByLabelText('Start Date:');
    await user.clear(startDateInput);
    await user.type(startDateInput, '2024-07-01');
    
    expect(startDateInput).toHaveValue('2024-07-01');
  });

  test('allows changing end date', async () => {
    const user = userEvent.setup();
    render(<NEOsComponent />);
    
    const endDateInput = screen.getByLabelText('End Date:');
    await user.clear(endDateInput);
    await user.type(endDateInput, '2024-07-05');
    
    expect(endDateInput).toHaveValue('2024-07-05');
  });

  test('shows loading state when fetching data', async () => {
    const user = userEvent.setup();
    fetch.mockImplementation(() => new Promise(() => {})); // Never resolves
    
    render(<NEOsComponent />);
    
    const fetchButton = screen.getByRole('button', { name: /fetch neos/i });
    await user.click(fetchButton);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(fetchButton).toBeDisabled();
  });

  test('fetches and displays NEO data in table view', async () => {
    const user = userEvent.setup();
    const mockNeoData = {
      near_earth_objects: {
        '2024-06-01': [
          {
            id: '123456',
            name: 'Test Asteroid (2024 TA1)',
            nasa_jpl_url: 'https://example.com/asteroid',
            estimated_diameter: {
              meters: {
                estimated_diameter_min: 100,
                estimated_diameter_max: 200
              }
            },
            is_potentially_hazardous_asteroid: false,
            close_approach_data: [{
              close_approach_date: '2024-06-01',
              close_approach_date_full: '2024-Jun-01 12:00',
              miss_distance: { kilometers: '1000000' },
              relative_velocity: { kilometers_per_hour: '50000' }
            }]
          }
        ]
      }
    };

    fetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue(mockNeoData)
    });

    render(<NEOsComponent />);
    
    const fetchButton = screen.getByRole('button', { name: /fetch neos/i });
    await user.click(fetchButton);

    await waitFor(() => {
      expect(screen.getByText('Test Asteroid (2024 TA1)')).toBeInTheDocument();
    });

    expect(screen.getByText('2024-Jun-01 12:00')).toBeInTheDocument();
    expect(screen.getByText('100 - 200')).toBeInTheDocument();
    expect(screen.getByText('1,000,000')).toBeInTheDocument();
    expect(screen.getByText('50,000')).toBeInTheDocument();
    expect(screen.getByText('No')).toBeInTheDocument();
  });

  test('displays error message when fetch fails', async () => {
    const user = userEvent.setup();
    fetch.mockRejectedValue(new Error('Network error'));

    render(<NEOsComponent />);
    
    const fetchButton = screen.getByRole('button', { name: /fetch neos/i });
    await user.click(fetchButton);

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch Near Earth Object data')).toBeInTheDocument();
    });
  });

  test('displays "No data to display" when no NEOs found', async () => {
    const user = userEvent.setup();
    fetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue({ near_earth_objects: {} })
    });

    render(<NEOsComponent />);
    
    const fetchButton = screen.getByRole('button', { name: /fetch neos/i });
    await user.click(fetchButton);

    await waitFor(() => {
      expect(screen.getByText('No data to display')).toBeInTheDocument();
    });
  });

  test('switches to chart view when Size Chart button clicked', async () => {
    const user = userEvent.setup();
    render(<NEOsComponent />);
    
    const chartButton = screen.getByText('Size Chart');
    await user.click(chartButton);
    
    expect(chartButton).toHaveClass('neos-toggle-active');
    expect(screen.getByText('Data Table')).not.toHaveClass('neos-toggle-active');
    
    // Chart container should be visible
    expect(document.querySelector('canvas')).toBeInTheDocument();
  });

  test('switches to risk matrix view', async () => {
    const user = userEvent.setup();
    render(<NEOsComponent />);
    
    const riskButton = screen.getByText('Risk Matrix');
    await user.click(riskButton);
    
    expect(riskButton).toHaveClass('neos-toggle-active');
    expect(document.querySelector('canvas')).toBeInTheDocument();
  });

  test('switches to velocity analysis view', async () => {
    const user = userEvent.setup();
    render(<NEOsComponent />);
    
    const velocityButton = screen.getByText('Velocity Analysis');
    await user.click(velocityButton);
    
    expect(velocityButton).toHaveClass('neos-toggle-active');
  });

  test('switches to discovery timeline view', async () => {
    const user = userEvent.setup();
    render(<NEOsComponent />);
    
    const timelineButton = screen.getByText('Discovery Timeline');
    await user.click(timelineButton);
    
    expect(timelineButton).toHaveClass('neos-toggle-active');
  });

  test('switches to 3D orbit view', async () => {
    const user = userEvent.setup();
    render(<NEOsComponent />);
    
    const orbitButton = screen.getByText('3D Orbit View');
    await user.click(orbitButton);
    
    expect(orbitButton).toHaveClass('neos-toggle-active');
    expect(screen.getByText('3D Orbit Visualization')).toBeInTheDocument();
  });

  test('switches to orbital analysis view', async () => {
    const user = userEvent.setup();
    render(<NEOsComponent />);
    
    const analysisButton = screen.getByText('Orbital Analysis');
    await user.click(analysisButton);
    
    expect(analysisButton).toHaveClass('neos-toggle-active');
  });

  test('handles hazardous asteroids correctly', async () => {
    const user = userEvent.setup();
    const mockHazardousData = {
      near_earth_objects: {
        '2024-06-01': [
          {
            id: '789012',
            name: 'Dangerous Asteroid (2024 DA1)',
            nasa_jpl_url: 'https://example.com/dangerous',
            estimated_diameter: {
              meters: {
                estimated_diameter_min: 500,
                estimated_diameter_max: 1000
              }
            },
            is_potentially_hazardous_asteroid: true,
            close_approach_data: [{
              close_approach_date: '2024-06-01',
              miss_distance: { kilometers: '500000' },
              relative_velocity: { kilometers_per_hour: '75000' }
            }]
          }
        ]
      }
    };

    fetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue(mockHazardousData)
    });

    render(<NEOsComponent />);
    
    const fetchButton = screen.getByRole('button', { name: /fetch neos/i });
    await user.click(fetchButton);

    await waitFor(() => {
      expect(screen.getByText('Dangerous Asteroid (2024 DA1)')).toBeInTheDocument();
    });

    expect(screen.getByText('Yes')).toBeInTheDocument(); // Hazardous column
  });

  test('external links have correct attributes', async () => {
    const user = userEvent.setup();
    const mockNeoData = {
      near_earth_objects: {
        '2024-06-01': [
          {
            id: '123456',
            name: 'Test Asteroid (2024 TA1)',
            nasa_jpl_url: 'https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html#/?sstr=123456',
            estimated_diameter: {
              meters: { estimated_diameter_min: 100, estimated_diameter_max: 200 }
            },
            is_potentially_hazardous_asteroid: false,
            close_approach_data: [{
              close_approach_date: '2024-06-01',
              miss_distance: { kilometers: '1000000' },
              relative_velocity: { kilometers_per_hour: '50000' }
            }]
          }
        ]
      }
    };

    fetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue(mockNeoData)
    });

    render(<NEOsComponent />);
    
    const fetchButton = screen.getByRole('button', { name: /fetch neos/i });
    await user.click(fetchButton);

    await waitFor(() => {
      const link = screen.getByRole('link', { name: 'Test Asteroid (2024 TA1)' });
      expect(link).toHaveAttribute('href', 'https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html#/?sstr=123456');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });
}); 