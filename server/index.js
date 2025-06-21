require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5051;
const axios = require('axios');

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the NASA Explorer API!' });
});

app.get('/api/apod', async (req, res) => {
  try {
    const response = await axios.get(`https://api.nasa.gov/planetary/apod?api_key=${process.env.NASA_API_KEY}`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch APOD data' });
  }
});

app.get('/api/mars-photos', async (req, res) => {
  try {
    const { rover, date } = req.query;
    const response = await axios.get(
      `https://api.nasa.gov/mars-photos/api/v1/rovers/${rover}/photos?earth_date=${date}&api_key=${process.env.NASA_API_KEY}`
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch Mars Rover photos' });
  }
});

app.get('/api/neo-feed', async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    const response = await axios.get(
      `https://api.nasa.gov/neo/rest/v1/feed`, {
        params: {
          start_date,
          end_date,
          api_key: process.env.NASA_API_KEY
        }
      }
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch Near Earth Object data' });
  }
});

app.get('/api/neo-lookup', async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'Missing id parameter' });
    const response = await axios.get(
      `https://api.nasa.gov/neo/rest/v1/neo/${id}?api_key=${process.env.NASA_API_KEY}`
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch NEO details' });
  }
});

app.get('/api/nasa-media', async (req, res) => {
  try {
    const { query, media_type } = req.query;
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (media_type) params.append('media_type', media_type);
    const url = `https://images-api.nasa.gov/search?${params.toString()}`;
    const response = await axios.get(url);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch NASA media library data' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 