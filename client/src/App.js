import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, Outlet } from 'react-router-dom';
import backgroundImage1 from './assets/background1.webp';
import backgroundImage2 from './assets/NASA_SC21_ISS_zoom.jpg';
import backgroundImage3 from './assets/background_3.avif';
import backgroundImage4 from './assets/background_4.jpg';
import backgroundImage5 from './assets/background_5.jpg';
import backgroundImage6 from './assets/background_6.jpg';
import './App.css';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  ScatterController,
  LineController
} from 'chart.js';
import API_BASE_URL from './config';
import ReactDOM from 'react-dom';
import * as THREE from 'three';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, LineController, ScatterController, Title, Tooltip, Legend);

// Precompute backgrounds array once outside component
const BACKGROUND_IMAGES = [
  backgroundImage1,
  backgroundImage2,
  backgroundImage3,
  backgroundImage4,
  backgroundImage5,
  backgroundImage6
];

function BackgroundRotator() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActive((prev) => (prev + 1) % BACKGROUND_IMAGES.length);
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {BACKGROUND_IMAGES.map((bg, index) => (
        <div key={index} className={`bg-image${active === index ? ' visible' : ''}`} style={{ backgroundImage: `url(${bg})` }} />
      ))}
    </>
  );
}

function NEOs() {
  const [startDate, setStartDate] = useState('2024-06-01');
  const [endDate, setEndDate] = useState('2024-06-02');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [neos, setNeos] = useState([]);
  const [view, setView] = useState('table'); // 'table', 'chart', 'risk-matrix', 'velocity', 'timeline', '3d-orbit'
  const [orbitViewerRef, setOrbitViewerRef] = useState(null);
  
  // Store chart instances in refs to avoid state update issues
  const chartInstancesRef = useRef({});

  // Add refs for proper 3D cleanup
  const animationFrameRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);

  // Effect to clean up 3D viewer when switching away from it
  React.useEffect(() => {
    if (view !== '3d-orbit' && orbitViewerRef) {
      // Clear the 3D orbit viewer when switching to other views
      while (orbitViewerRef.firstChild) {
        orbitViewerRef.removeChild(orbitViewerRef.firstChild);
      }
    }
  }, [view, orbitViewerRef]);

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

  // Cleanup function for 3D orbit viewer
  const cleanup3DViewer = React.useCallback(() => {
    // Stop animation loop
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    // Dispose of renderer and scene
    if (rendererRef.current) {
      rendererRef.current.dispose();
      rendererRef.current = null;
    }
    
    if (sceneRef.current) {
      // Dispose of all geometries and materials in the scene
      sceneRef.current.traverse((child) => {
        if (child.geometry) {
          child.geometry.dispose();
        }
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(material => material.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
      sceneRef.current = null;
    }
    
    // Clear the DOM element
    if (orbitViewerRef && orbitViewerRef.firstChild) {
      while (orbitViewerRef.firstChild) {
        orbitViewerRef.removeChild(orbitViewerRef.firstChild);
      }
    }
  }, [orbitViewerRef]);

  // Enhanced view setter that cleans up 3D viewer when switching away
  const handleViewChange = (newView) => {
    if (view === '3d-orbit' && newView !== '3d-orbit') {
      cleanup3DViewer();
    }
    setView(newView);
  };

  // Cleanup function to destroy all charts
  const cleanupAllCharts = React.useCallback(() => {
    Object.keys(chartInstancesRef.current).forEach(key => {
      const chart = chartInstancesRef.current[key];
      if (chart && typeof chart.destroy === 'function') {
        try {
          chart.destroy();
        } catch (e) {
          console.warn('Chart cleanup warning:', e);
        }
      }
    });
    chartInstancesRef.current = {};
  }, []);

  // Cleanup charts when view changes
  React.useEffect(() => {
    cleanupAllCharts();
  }, [view, cleanupAllCharts]);

  // Cleanup on unmount
  React.useEffect(() => {
    return cleanupAllCharts;
  }, [cleanupAllCharts]);

  // Initialize 3D Orbit Viewer
  React.useEffect(() => {
    if (view === '3d-orbit' && orbitViewerRef && neos.length > 0) {
      initOrbitViewer();
    } else if (view !== '3d-orbit' && orbitViewerRef) {
      // Clean up 3D viewer when switching to other views
      while (orbitViewerRef.firstChild) {
        orbitViewerRef.removeChild(orbitViewerRef.firstChild);
      }
    }
  }, [view, orbitViewerRef, neos]);

  const initOrbitViewer = () => {
    if (!orbitViewerRef) return;
    
    // Clear previous content and ensure proper cleanup
    while (orbitViewerRef.firstChild) {
      orbitViewerRef.removeChild(orbitViewerRef.firstChild);
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, orbitViewerRef.clientWidth / orbitViewerRef.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(orbitViewerRef.clientWidth, orbitViewerRef.clientHeight);
    renderer.setClearColor(0x000011, 0.8);
    orbitViewerRef.appendChild(renderer.domElement);

    // Store renderer reference for cleanup
    rendererRef.current = renderer;
    sceneRef.current = scene;

    // Add ambient light for better visibility
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    scene.add(directionalLight);

    // Add Earth
    const earthGeometry = new THREE.SphereGeometry(0.8, 32, 32);
    const earthMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x4A90E2,
      shininess: 30,
      transparent: true,
      opacity: 0.9
    });
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earth);

    // Add Earth label
    const earthLabelGeometry = new THREE.RingGeometry(1.2, 1.4, 32);
    const earthLabelMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x4A90E2, 
      transparent: true, 
      opacity: 0.3,
      side: THREE.DoubleSide
    });
    const earthRing = new THREE.Mesh(earthLabelGeometry, earthLabelMaterial);
    earthRing.rotation.x = Math.PI / 2;
    scene.add(earthRing);

    // Add asteroids
    console.log(`Creating 3D visualization with ${neos.length} NEOs`);
    neos.slice(0, 10).forEach((neo, index) => {
      const approach = neo.close_approach_data[0];
      if (approach) {
        // Position asteroid in a visible ring around Earth
        const angle = (index / 10) * Math.PI * 2; // Full circle distribution
        const distance = parseFloat(approach.miss_distance.kilometers);
        const scaledDistance = 2.5 + (index * 0.4); // Fixed spacing from 2.5 to 6.1 units
        
        // Larger asteroids for better visibility
        const asteroidGeometry = new THREE.SphereGeometry(0.12, 12, 12);
        const asteroidMaterial = new THREE.MeshBasicMaterial({ 
          color: neo.is_potentially_hazardous_asteroid ? 0xff4444 : 0x44ff44,
          transparent: true,
          opacity: 0.9
        });
        const asteroid = new THREE.Mesh(asteroidGeometry, asteroidMaterial);
        
        // Add slight vertical variation for 3D effect
        const elevation = Math.sin(index * 0.8) * 0.3;
        
        asteroid.position.x = Math.cos(angle) * scaledDistance;
        asteroid.position.z = Math.sin(angle) * scaledDistance;
        asteroid.position.y = elevation;
        
        scene.add(asteroid);
        
        console.log(`NEO ${index + 1}: ${neo.name.substring(0, 15)}... Distance ${distance.toLocaleString()} km -> Scaled ${scaledDistance.toFixed(1)}, Position: (${asteroid.position.x.toFixed(1)}, ${asteroid.position.y.toFixed(1)}, ${asteroid.position.z.toFixed(1)}), Hazardous: ${neo.is_potentially_hazardous_asteroid}`);
      }
    });

    // Position camera for better view
    camera.position.set(8, 5, 8);
    camera.lookAt(0, 0, 0);

    // Add mouse controls for better interaction
    let mouseX = 0, mouseY = 0;
    const onMouseMove = (event) => {
      mouseX = (event.clientX / orbitViewerRef.clientWidth) * 2 - 1;
      mouseY = -(event.clientY / orbitViewerRef.clientHeight) * 2 + 1;
    };
    orbitViewerRef.addEventListener('mousemove', onMouseMove);

    const animate = () => {
      requestAnimationFrame(animate);
      
      // Rotate Earth
      earth.rotation.y += 0.005;
      earthRing.rotation.z += 0.003;
      
      // Gentle camera movement based on mouse
      camera.position.x += (mouseX * 2 - camera.position.x) * 0.01;
      camera.position.y += (-mouseY * 2 - camera.position.y) * 0.01;
      camera.lookAt(0, 0, 0);
      
      renderer.render(scene, camera);
    };
    animate();

    // Store refs for cleanup
    animationFrameRef.current = animate;
  };

  // Prepare chart data for different visualizations
  const riskMatrixData = {
    datasets: [{
      label: 'NEO Risk Assessment',
      data: neos.map(neo => {
        const approach = neo.close_approach_data[0];
        const avgDiameter = (neo.estimated_diameter.meters.estimated_diameter_min + 
                           neo.estimated_diameter.meters.estimated_diameter_max) / 2;
        return {
          x: parseFloat(approach?.miss_distance.kilometers || 0) / 1000000, // Convert to million km
          y: avgDiameter,
          backgroundColor: neo.is_potentially_hazardous_asteroid ? 'rgba(255, 68, 68, 0.7)' : 'rgba(68, 255, 68, 0.7)',
          borderColor: neo.is_potentially_hazardous_asteroid ? 'rgba(255, 68, 68, 1)' : 'rgba(68, 255, 68, 1)',
          pointRadius: Math.log(avgDiameter + 1) * 2
        };
      }),
      backgroundColor: neos.map(neo => 
        neo.is_potentially_hazardous_asteroid ? 'rgba(255, 68, 68, 0.7)' : 'rgba(68, 255, 68, 0.7)'
      ),
      borderColor: neos.map(neo => 
        neo.is_potentially_hazardous_asteroid ? 'rgba(255, 68, 68, 1)' : 'rgba(68, 255, 68, 1)'
      ),
    }]
  };

  const velocityData = {
    labels: neos.map((neo, index) => `NEO ${index + 1}`),
    datasets: [{
      label: 'Velocity (km/h)',
      backgroundColor: 'rgba(33, 150, 243, 0.7)',
      borderColor: 'rgba(33, 150, 243, 1)',
      borderWidth: 1,
      data: neos.map(neo => {
        const approach = neo.close_approach_data[0];
        return parseFloat(approach?.relative_velocity.kilometers_per_hour || 0);
      }),
    }]
  };

  // Discovery Timeline Data
  const timelineData = {
    labels: neos.map((neo, index) => index + 1),
    datasets: [{
      label: 'Discovery Timeline',
      backgroundColor: 'rgba(156, 39, 176, 0.7)',
      borderColor: 'rgba(156, 39, 176, 1)',
      borderWidth: 2,
      fill: false,
      data: neos.map((neo, index) => {
        const avgDiameter = (neo.estimated_diameter.meters.estimated_diameter_min + 
                           neo.estimated_diameter.meters.estimated_diameter_max) / 2;
        return {
          x: index + 1,
          y: avgDiameter
        };
      }),
    }]
  };

  // Orbital Analysis Data - Period vs Distance correlation
  const orbitalAnalysisData = {
    datasets: [{
      label: 'Orbital Period vs Distance',
      data: neos.map(neo => {
        const approach = neo.close_approach_data[0];
        const distance = parseFloat(approach?.miss_distance.astronomical || 0);
        // Estimate orbital period using simplified Kepler's 3rd law approximation
        const estimatedPeriod = Math.pow(distance, 1.5) * 365; // rough approximation in days
        const avgDiameter = (neo.estimated_diameter.meters.estimated_diameter_min + 
                           neo.estimated_diameter.meters.estimated_diameter_max) / 2;
        return {
          x: distance, // AU
          y: estimatedPeriod, // days
          backgroundColor: neo.is_potentially_hazardous_asteroid ? 'rgba(255, 68, 68, 0.7)' : 'rgba(76, 175, 80, 0.7)',
          borderColor: neo.is_potentially_hazardous_asteroid ? 'rgba(255, 68, 68, 1)' : 'rgba(76, 175, 80, 1)',
          pointRadius: Math.log(avgDiameter + 1) * 1.5
        };
      }).filter(point => point.x > 0 && point.y > 0), // Filter out invalid data
      backgroundColor: neos.map(neo => 
        neo.is_potentially_hazardous_asteroid ? 'rgba(255, 68, 68, 0.7)' : 'rgba(76, 175, 80, 0.7)'
      ),
      borderColor: neos.map(neo => 
        neo.is_potentially_hazardous_asteroid ? 'rgba(255, 68, 68, 1)' : 'rgba(76, 175, 80, 1)'
      ),
    }]
  };

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
        text: view === 'risk-matrix' ? 'Risk Assessment: Size vs Distance' : 
              view === 'velocity' ? 'Asteroid Velocities' : 
              view === 'timeline' ? 'Discovery Timeline: Asteroid Sizes' :
              view === 'orbital-analysis' ? 'Orbital Period vs Distance Correlation' :
              'Estimated Diameter of Near Earth Objects (meters)',
        color: '#fff',
        font: { size: 18 }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            if (view === 'risk-matrix') {
              return `Distance: ${context.parsed.x.toFixed(2)} million km, Diameter: ${context.parsed.y.toFixed(2)} m`;
            } else if (view === 'velocity') {
              return `${context.dataset.label}: ${context.parsed.y.toLocaleString()} km/h`;
            } else if (view === 'timeline') {
              return `NEO #${context.parsed.x}: ${context.parsed.y.toFixed(2)} m diameter`;
            } else if (view === 'orbital-analysis') {
              return `Distance: ${context.parsed.x.toFixed(3)} AU, Period: ${context.parsed.y.toFixed(0)} days`;
            }
            return `${context.dataset.label}: ${context.parsed.y.toLocaleString()} m`;
          }
        }
      }
    },
    scales: (view === 'risk-matrix' || view === 'orbital-analysis') ? {
      x: {
        type: 'linear',
        position: 'bottom',
        title: { 
          display: true, 
          text: view === 'orbital-analysis' ? 'Distance (AU)' : 'Miss Distance (million km)', 
          color: '#fff' 
        },
        ticks: { color: '#fff' },
        grid: { color: 'rgba(255,255,255,0.1)' }
      },
      y: {
        title: { 
          display: true, 
          text: view === 'orbital-analysis' ? 'Orbital Period (days)' : 'Diameter (meters)', 
          color: '#fff' 
        },
        ticks: { color: '#fff' },
        grid: { color: 'rgba(255,255,255,0.1)' }
      }
    } : {
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

  const createChart = (canvas, chartType, chartConfig) => {
    if (!canvas || !neos.length) return;
    
    const ctx = canvas.getContext('2d');
    
    // Destroy existing chart if it exists
    if (chartInstancesRef.current[chartType]) {
      try {
        chartInstancesRef.current[chartType].destroy();
      } catch (e) {
        console.warn('Chart destruction warning:', e);
      }
    }
    
    // Create new chart
    try {
      const newChart = new ChartJS(ctx, chartConfig);
      chartInstancesRef.current[chartType] = newChart;
    } catch (e) {
      console.error('Chart creation error:', e);
      // Clear the canvas and try again
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const newChart = new ChartJS(ctx, chartConfig);
      chartInstancesRef.current[chartType] = newChart;
    }
  };

  return (
    <div className="neos-container">
      <h2>Near Earth Objects - Advanced Analytics</h2>
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
        <div className="orbit-viewer-container" key="3d-orbit-container">
          <div 
            ref={(ref) => {
              if (ref && ref !== orbitViewerRef) {
                setOrbitViewerRef(ref);
              }
            }}
            className="orbit-viewer"
            style={{ 
              width: '100%', 
              height: '500px', 
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '8px',
              background: 'rgba(0,0,0,0.3)',
              position: 'relative',
              zIndex: 10
            }}
          />
          <div className="orbit-legend" style={{ marginTop: '1rem', color: '#fff' }}>
            <span style={{ color: '#4A90E2' }}>● Earth</span>
            <span style={{ color: '#44ff44', marginLeft: '1rem' }}>● Safe Asteroids</span>
            <span style={{ color: '#ff4444', marginLeft: '1rem' }}>● Potentially Hazardous</span>
          </div>
        </div>
      ) : (
        <div className="neos-chart-wrapper">
          {view === 'risk-matrix' ? (
            <div style={{ position: 'relative', height: '400px', width: '100%' }}>
              <canvas 
                key={`risk-matrix-${view}-${neos.length}`}
                ref={(canvas) => {
                  if (canvas && neos.length > 0) {
                    // Add a small delay to ensure previous chart is fully destroyed
                    setTimeout(() => {
                      const ctx = canvas.getContext('2d');
                      // Clear any existing chart on this canvas
                      if (chartInstancesRef.current.risk) {
                        chartInstancesRef.current.risk.destroy();
                      }
                      // Clear the canvas completely
                      ctx.clearRect(0, 0, canvas.width, canvas.height);
                      
                      try {
                        const newChart = new ChartJS(ctx, {
                          type: 'scatter',
                          data: riskMatrixData,
                          options: chartOptions
                        });
                        chartInstancesRef.current.risk = newChart;
                      } catch (error) {
                        console.warn('Chart creation failed, retrying...', error);
                        // Force canvas recreation by clearing and retrying
                        setTimeout(() => {
                          ctx.clearRect(0, 0, canvas.width, canvas.height);
                          const retryChart = new ChartJS(ctx, {
                            type: 'scatter',
                            data: riskMatrixData,
                            options: chartOptions
                          });
                          chartInstancesRef.current.risk = retryChart;
                        }, 200);
                      }
                    }, 50);
                  }
                }}
              />
            </div>
          ) : view === 'timeline' ? (
            <div style={{ position: 'relative', height: '400px', width: '100%' }}>
              <canvas 
                key={`timeline-${view}-${neos.length}`}
                ref={(canvas) => {
                  if (canvas && neos.length > 0) {
                    // Add delay to ensure previous chart is fully destroyed
                    setTimeout(() => {
                      const ctx = canvas.getContext('2d');
                      if (chartInstancesRef.current.timeline) {
                        chartInstancesRef.current.timeline.destroy();
                      }
                      // Clear the canvas completely
                      ctx.clearRect(0, 0, canvas.width, canvas.height);
                      
                      try {
                        const newChart = new ChartJS(ctx, {
                          type: 'line',
                          data: timelineData,
                          options: {
                            responsive: true,
                            plugins: {
                              legend: { display: false },
                              title: {
                                display: true,
                                text: 'Discovery Timeline',
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
                                type: 'linear',
                                position: 'bottom',
                                title: { display: true, text: 'Discovery Timeline', color: '#fff' },
                                ticks: { color: '#fff' },
                                grid: { color: 'rgba(255,255,255,0.1)' }
                              },
                              y: {
                                title: { display: true, text: 'Diameter (meters)', color: '#fff' },
                                ticks: { color: '#fff' },
                                grid: { color: 'rgba(255,255,255,0.1)' }
                              }
                            }
                          }
                        });
                        chartInstancesRef.current.timeline = newChart;
                      } catch (error) {
                        console.warn('Timeline chart creation failed, retrying...', error);
                      }
                    }, 50);
                  }
                }}
              />
            </div>
          ) : view === 'orbital-analysis' ? (
            <div style={{ position: 'relative', height: '400px', width: '100%' }}>
              <canvas 
                key={`orbital-${view}-${neos.length}`}
                ref={(canvas) => {
                  if (canvas && neos.length > 0) {
                    // Add delay to ensure previous chart is fully destroyed
                    setTimeout(() => {
                      const ctx = canvas.getContext('2d');
                      if (chartInstancesRef.current.orbital) {
                        chartInstancesRef.current.orbital.destroy();
                      }
                      // Clear the canvas completely
                      ctx.clearRect(0, 0, canvas.width, canvas.height);
                      
                      try {
                        const newChart = new ChartJS(ctx, {
                          type: 'scatter',
                          data: orbitalAnalysisData,
                          options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: { display: false },
                              title: {
                                display: true,
                                text: 'Orbital Period vs Distance Correlation',
                                color: '#fff',
                                font: { size: 18 }
                              },
                              tooltip: {
                                callbacks: {
                                  label: function(context) {
                                    return `Distance: ${context.parsed.x.toFixed(3)} AU, Period: ${context.parsed.y.toFixed(0)} days`;
                                  }
                                }
                              }
                            },
                            scales: {
                              x: {
                                type: 'linear',
                                position: 'bottom',
                                title: { 
                                  display: true, 
                                  text: 'Distance (AU)', 
                                  color: '#fff' 
                                },
                                ticks: { color: '#fff' },
                                grid: { color: 'rgba(255,255,255,0.1)' }
                              },
                              y: {
                                title: { 
                                  display: true, 
                                  text: 'Orbital Period (days)', 
                                  color: '#fff' 
                                },
                                ticks: { color: '#fff' },
                                grid: { color: 'rgba(255,255,255,0.1)' }
                              }
                            }
                          }
                        });
                        chartInstancesRef.current.orbital = newChart;
                      } catch (error) {
                        console.warn('Orbital chart creation failed, retrying...', error);
                      }
                    }, 50);
                  }
                }}
              />
            </div>
          ) : (
            <Bar 
              key={`bar-${view}-${neos.length}`}
              data={view === 'velocity' ? velocityData : chartData} 
              options={chartOptions} 
              height={400} 
            />
          )}
        </div>
      )}
      
      {neos.length > 0 && (
        <div className="neos-stats" style={{ marginTop: '2rem', color: '#fff' }}>
          <h3>Quick Statistics</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div className="stat-card">
              <strong>Total NEOs:</strong> {neos.length}
            </div>
            <div className="stat-card">
              <strong>Potentially Hazardous:</strong> {neos.filter(neo => neo.is_potentially_hazardous_asteroid).length}
            </div>
            <div className="stat-card">
              <strong>Average Diameter:</strong> {
                (neos.reduce((sum, neo) => sum + (neo.estimated_diameter.meters.estimated_diameter_min + neo.estimated_diameter.meters.estimated_diameter_max) / 2, 0) / neos.length).toFixed(2)
              } m
            </div>
            <div className="stat-card">
              <strong>Closest Approach:</strong> {
                Math.min(...neos.map(neo => parseFloat(neo.close_approach_data[0]?.miss_distance.kilometers || Infinity))).toLocaleString()
              } km
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const Portal = ({ children }) => {
    const modalRoot = document.getElementById('modal-root');
    const el = useRef(document.createElement('div'));

    useEffect(() => {
        const currentEl = el.current;
        modalRoot.appendChild(currentEl);
        return () => modalRoot.removeChild(currentEl);
    }, [modalRoot]);

    return ReactDOM.createPortal(children, el.current);
};

function NasaMediaLibrary() {
  const [query, setQuery] = useState('mars');
  const [mediaType, setMediaType] = useState('image');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalItem, setModalItem] = useState(null);
  const [shareMsg, setShareMsg] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResults([]);
    try {
      const res = await fetch(`${API_BASE_URL}/api/nasa-media?query=${encodeURIComponent(query)}&media_type=${mediaType}`);
      const data = await res.json();
      setResults(data.collection?.items || []);
    } catch (err) {
      setError('Failed to fetch NASA media.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch({ preventDefault: () => {} }); // Load default on mount
    // eslint-disable-next-line
  }, []);

  const openModal = (item) => { setModalItem(item); setModalOpen(true); setShareMsg(''); };
  const closeModal = () => { setModalOpen(false); setModalItem(null); setShareMsg(''); };
  const handleShare = (url) => { navigator.clipboard.writeText(url); setShareMsg('Link copied!'); setTimeout(() => setShareMsg(''), 2000); };
  
  return (
    <div className="nasa-media-container">
      <h2>NASA Media Library</h2>
      <form className="media-search-form" onSubmit={handleSearch}>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search NASA media..."
        />
        <select value={mediaType} onChange={e => setMediaType(e.target.value)}>
          <option value="image">Images</option>
          <option value="video">Videos</option>
          <option value="audio">Audio</option>
        </select>
        <button className="explore-button" type="submit" disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div className="media-gallery-grid">
        {results.map((item, idx) => {
          const data = item.data[0];
          const thumb = item.links?.[0]?.href;
          return (
            <div className="media-gallery-card" key={item.data[0].nasa_id + idx} onClick={() => openModal(item)}>
              {thumb && <img src={thumb} alt={data.title} className="media-thumb" />}
              <div className="media-title">{data.title}</div>
              <div className="media-type">{data.media_type}</div>
            </div>
          );
        })}
        {(!loading && results.length === 0) && <div style={{color:'#fff',textAlign:'center',width:'100%'}}>No results found.</div>}
      </div>
      
      {modalOpen && modalItem && (
        <div className="modal active" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{maxWidth:'700px'}}>
            <button className="close-button" onClick={closeModal}>×</button>
            <h3>{modalItem.data[0].title}</h3>
            <p style={{fontSize:'1rem',color:'#bbb'}}>{modalItem.data[0].description}</p>
            {modalItem.data[0].media_type === 'image' && (
              <img src={modalItem.links?.[0]?.href} alt={modalItem.data[0].title} />
            )}
            {modalItem.data[0].media_type === 'video' && (
              <video src={modalItem.links?.[0]?.href} controls />
            )}
            {modalItem.data[0].media_type === 'audio' && (
              <audio src={modalItem.links?.[0]?.href} controls />
            )}
            <div style={{display:'flex',gap:'1rem',marginTop:'1rem',alignItems:'center'}}>
              <a href={modalItem.links?.[0]?.href} download target="_blank" rel="noopener noreferrer" className="explore-button">Download</a>
              <button className="explore-button" onClick={() => handleShare(modalItem.links?.[0]?.href)} type="button">Share</button>
              {shareMsg && <span style={{color:'#90caf9',fontWeight:600}}>{shareMsg}</span>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Home() {
  const navigate = useNavigate();
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
    <>
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
    </>
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
    <>
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
    </>
  );
}

function PageLayout() {
  return (
    <div className="page-container">
      <div className="page-header">
        <Link to="/" className="back-home-button">
          <span>&larr;</span> Back to Home
        </Link>
      </div>
      <div className="page-content-wrapper">
        <Outlet />
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <BackgroundRotator />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route element={<PageLayout />}>
          <Route path="/apod" element={<APOD />} />
          <Route path="/mars-rover" element={<MarsRover />} />
          <Route path="/neos" element={<NEOs />} />
          <Route path="/media-library" element={<NasaMediaLibrary />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
