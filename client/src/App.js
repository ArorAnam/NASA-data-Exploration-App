import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import backgroundImage from './assets/background1.webp';
import './App.css';

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
    fetch('/api/apod')
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
    fetch(`/api/mars-photos?rover=${rover}&date=${date}`)
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
      </Routes>
    </Router>
  );
}

export default App;
