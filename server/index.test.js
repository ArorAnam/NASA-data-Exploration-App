const request = require('supertest');
const app = require('./index'); // Assuming your express app is exported from index.js
const axios = require('axios');

jest.mock('axios');

describe('API Endpoints', () => {
  it('should return a welcome message from the root endpoint', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'Welcome to the NASA Explorer API!');
  });

  it('should fetch APOD data successfully', async () => {
    const mockApodData = {
      title: 'Mock APOD Title',
      explanation: 'This is a mock explanation.',
      url: 'https://example.com/mock-image.jpg'
    };
    axios.get.mockResolvedValue({ data: mockApodData });

    const res = await request(app).get('/api/apod');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(mockApodData);
  });

  it('should fetch Mars Rover photos successfully', async () => {
    const mockMarsPhotos = { photos: [{ id: 1, img_src: 'https://example.com/mars.jpg' }] };
    axios.get.mockResolvedValue({ data: mockMarsPhotos });

    const res = await request(app).get('/api/mars-photos?rover=curiosity&date=2024-01-01');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(mockMarsPhotos);
  });

  it('should fetch Near Earth Object feed successfully', async () => {
    const mockNeoFeed = { near_earth_objects: { '2024-01-01': [] } };
    axios.get.mockResolvedValue({ data: mockNeoFeed });

    const res = await request(app).get('/api/neo-feed?start_date=2024-01-01&end_date=2024-01-02');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(mockNeoFeed);
  });

  it('should fetch NEO details successfully', async () => {
    const mockNeoDetails = { id: '12345', name: 'Mock Asteroid' };
    axios.get.mockResolvedValue({ data: mockNeoDetails });

    const res = await request(app).get('/api/neo-lookup?id=12345');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(mockNeoDetails);
  });

  it('should return 400 if NEO lookup ID is missing', async () => {
    const res = await request(app).get('/api/neo-lookup');
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('error', 'Missing id parameter');
  });

  it('should fetch NASA media library data successfully', async () => {
    const mockMediaData = { collection: { items: [] } };
    axios.get.mockResolvedValue({ data: mockMediaData });

    const res = await request(app).get('/api/nasa-media?query=galaxy&media_type=image');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(mockMediaData);
  });
}); 