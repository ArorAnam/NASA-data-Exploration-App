require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 