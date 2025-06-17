import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [apod, setApod] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    <div className="App">
      <header className="App-header">
        <h1>🚀 NASA Explorer</h1>
        <p>Explore NASA's open data and discover the wonders of space!</p>
        <nav>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li><a href="#apod">Astronomy Picture of the Day</a></li>
            <li><a href="#mars">Mars Rover Photos</a></li>
            <li><a href="#neo">Near Earth Objects</a></li>
          </ul>
        </nav>
        <p style={{ marginTop: '2rem', fontSize: '0.9rem', color: '#ccc' }}>
          (UI and features coming soon!)
        </p>
      </header>

      <section id="apod" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
        <h2>Astronomy Picture of the Day</h2>
        {loading && <p>Loading...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {apod && (
          <div>
            <h3>{apod.title}</h3>
            <img src={apod.url} alt={apod.title} style={{ maxWidth: '100%', height: 'auto' }} />
            <p>{apod.explanation}</p>
          </div>
        )}
      </section>
    </div>
  );
}

export default App;
