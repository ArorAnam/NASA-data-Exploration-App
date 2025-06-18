import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import backgroundImage from './assets/background1.webp';
import './App.css';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import API_BASE_URL from './config';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function NEOs() {
  const [startDate, setStartDate] = useState('2024-06-01');
  const [endDate, setEndDate] = useState('2024-06-02');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [neos, setNeos] = useState([]);
  const [view, setView] = useState('table'); // 'table' or 'chart'

  const fetchNEOs = async () => {
    setLoading(true);
    setError(null);
    setNeos([]);
    try {
      const res = await fetch(`${API_BASE_URL}/api/neo-feed?start_date=${startDate}&end_date=${endDate}`);
      const data = await res.json();
      const allNeos = Object.values(data.near_earth_objects || {}).flat();
      setNeos(allNeos);
    } catch (err) {
      setError('Failed to fetch Near Earth Object data');
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data
  const chartData = {
    labels: neos.map(neo => neo.name),
    datasets: [
      {
        label: 'Estimated Diameter (meters)',
        backgroundColor: 'rgba(33, 150, 243, 0.7)',
        borderColor: 'rgba(33, 150, 243, 1)',
        borderWidth: 1,
        data: neos.map(neo => ((neo.estimated_diameter.meters.estimated_diameter_min + neo.estimated_diameter.meters.estimated_diameter_max) / 2)),
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: 'Estimated Diameter of Near Earth Objects (meters)',
        color: '#fff',
        font: { size: 18 }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.y.toLocaleString()} m`;
          }
        }
      }
    },
    scales: {
      x: {
        ticks: { color: '#fff', maxRotation: 90, minRotation: 45 },
        grid: { color: 'rgba(255,255,255,0.1)' }
      },
      y: {
        beginAtZero: true,
        ticks: { color: '#fff' },
        grid: { color: 'rgba(255,255,255,0.1)' }
      }
    }
  };

  return (
    <div className="neos-container">
      <h2>Near Earth Objects</h2>
      <div className="neos-controls">
        <label>
          Start Date:
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
        </label>
        <label>
          End Date:
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
        </label>
        <button onClick={fetchNEOs} disabled={loading} className="explore-button">
          {loading ? 'Loading...' : 'Fetch NEOs'}
        </button>
        <div className="neos-toggle">
          <button
            className={view === 'table' ? 'neos-toggle-active' : ''}
            onClick={() => setView('table')}
          >
            Data Table
          </button>
          <button
            className={view === 'chart' ? 'neos-toggle-active' : ''}
            onClick={() => setView('chart')}
          >
            Visualization
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
      ) : (
        <div className="neos-chart-wrapper">
          <Bar data={chartData} options={chartOptions} height={400} />
        </div>
      )}
    </div>
  );
}

function Home() {
  const navigate = useNavigate();
  return (
    <div className="home-container" style={{ backgroundImage: `url(${backgroundImage})` }}>
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
          <div className="feature-card">
            <div className="feature-icon">🔭</div>
            <h3 className="feature-title">Interactive Exploration</h3>
            <p className="feature-description">
              Dive into space exploration with our interactive features and real-time data visualization.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function APOD() {
  const [apod, setApod] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/apod`)
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

  return (
    <div>
      <h2>Astronomy Picture of the Day</h2>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {apod && (
        <div>
          <h3>{apod.title}</h3>
          <img
            src={apod.url}
            alt={apod.title}
            style={{ maxWidth: '100%', height: 'auto', cursor: 'pointer' }}
            onClick={() => setModalOpen(true)}
          />
          <p>{apod.explanation}</p>
        </div>
      )}

      {modalOpen && (
        <div className="modal active" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={() => setModalOpen(false)}>×</button>
            <img src={apod?.url} alt={apod?.title} />
          </div>
        </div>
      )}
    </div>
  );
}

function MarsRover() {
  const [marsPhotos, setMarsPhotos] = useState([]);
  const [rover, setRover] = useState('curiosity');
  const [date, setDate] = useState('2024-06-01');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const fetchMarsPhotos = () => {
    setLoading(true);
    fetch(`${API_BASE_URL}/api/mars-photos?rover=${rover}&date=${date}`)
      .then(res => res.json())
      .then(data => {
        setMarsPhotos(data.photos || []);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to fetch Mars Rover photos');
        setLoading(false);
      });
  };

  const openModal = (photo) => {
    setSelectedPhoto(photo);
    setModalOpen(true);
  };

  return (
    <div>
      <h2>Mars Rover Photos</h2>
      <div>
        <input
          type="text"
          value={rover}
          onChange={(e) => setRover(e.target.value)}
          placeholder="Rover name (e.g., curiosity)"
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <button onClick={fetchMarsPhotos}>Fetch Photos</button>
      </div>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div className="mars-photos-grid">
        {marsPhotos.map((photo, index) => (
          <img
            key={index}
            src={photo.img_src}
            alt={`Mars Rover Photo ${index}`}
            onClick={() => openModal(photo)}
          />
        ))}
      </div>

      {modalOpen && selectedPhoto && (
        <div className="modal active" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={() => setModalOpen(false)}>×</button>
            <img src={selectedPhoto.img_src} alt="Mars Rover Photo" />
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/apod" element={<APOD />} />
        <Route path="/mars-rover" element={<MarsRover />} />
        <Route path="/neos" element={<NEOs />} />
      </Routes>
    </Router>
  );
}

export default App;
