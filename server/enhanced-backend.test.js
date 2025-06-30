const request = require('supertest');
const app = require('./index');
const axios = require('axios');

jest.mock('axios');

describe('Enhanced Backend API Tests', () => {
  beforeEach(() => {
    axios.get.mockClear();
  });

  describe('Error Handling Tests', () => {
    test('should handle NASA API timeout for APOD', async () => {
      axios.get.mockRejectedValue(new Error('timeout'));

      const res = await request(app).get('/api/apod');
      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('error', 'Failed to fetch APOD data');
    });

    test('should handle NASA API 429 rate limit for APOD', async () => {
      const rateLimitError = new Error('Request failed with status code 429');
      rateLimitError.response = { status: 429 };
      axios.get.mockRejectedValue(rateLimitError);

      const res = await request(app).get('/api/apod');
      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('error', 'Failed to fetch APOD data');
    });

    test('should handle malformed NASA API response for APOD', async () => {
      axios.get.mockResolvedValue({ data: null });

      const res = await request(app).get('/api/apod');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toBeNull();
    });

    test('should handle Mars Rover API errors', async () => {
      axios.get.mockRejectedValue(new Error('Mars API error'));

      const res = await request(app).get('/api/mars-photos?rover=curiosity&date=2024-01-01');
      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('error', 'Failed to fetch Mars Rover photos');
    });

    test('should handle NEO feed API errors', async () => {
      axios.get.mockRejectedValue(new Error('NEO API error'));

      const res = await request(app).get('/api/neo-feed?start_date=2024-01-01&end_date=2024-01-02');
      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('error', 'Failed to fetch Near Earth Object data');
    });

    test('should handle NEO lookup API errors', async () => {
      axios.get.mockRejectedValue(new Error('NEO lookup error'));

      const res = await request(app).get('/api/neo-lookup?id=12345');
      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('error', 'Failed to fetch NEO details');
    });

    test('should handle NASA media API errors', async () => {
      axios.get.mockRejectedValue(new Error('Media API error'));

      const res = await request(app).get('/api/nasa-media?query=galaxy');
      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('error', 'Failed to fetch NASA media library data');
    });
  });

  describe('Input Validation Tests', () => {
    test('should handle missing rover parameter for Mars photos', async () => {
      const res = await request(app).get('/api/mars-photos?date=2024-01-01');
      // Should still make the request with undefined rover
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('rovers/undefined/photos')
      );
    });

    test('should handle missing date parameter for Mars photos', async () => {
      const res = await request(app).get('/api/mars-photos?rover=curiosity');
      // Should still make the request with undefined date
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('earth_date=undefined')
      );
    });

    test('should handle invalid date format for Mars photos', async () => {
      axios.get.mockRejectedValue(new Error('Invalid date format'));

      const res = await request(app).get('/api/mars-photos?rover=curiosity&date=invalid-date');
      expect(res.statusCode).toEqual(500);
    });

    test('should handle missing start_date for NEO feed', async () => {
      const res = await request(app).get('/api/neo-feed?end_date=2024-01-02');
      expect(axios.get).toHaveBeenCalledWith(
        'https://api.nasa.gov/neo/rest/v1/feed',
        expect.objectContaining({
          params: expect.objectContaining({
            start_date: undefined,
            end_date: '2024-01-02'
          })
        })
      );
    });

    test('should handle missing end_date for NEO feed', async () => {
      const res = await request(app).get('/api/neo-feed?start_date=2024-01-01');
      expect(axios.get).toHaveBeenCalledWith(
        'https://api.nasa.gov/neo/rest/v1/feed',
        expect.objectContaining({
          params: expect.objectContaining({
            start_date: '2024-01-01',
            end_date: undefined
          })
        })
      );
    });

    test('should handle empty query for NASA media', async () => {
      const mockMediaData = { collection: { items: [] } };
      axios.get.mockResolvedValue({ data: mockMediaData });

      const res = await request(app).get('/api/nasa-media');
      expect(res.statusCode).toEqual(200);
      expect(axios.get).toHaveBeenCalledWith(
        'https://images-api.nasa.gov/search?'
      );
    });

    test('should handle special characters in media query', async () => {
      const mockMediaData = { collection: { items: [] } };
      axios.get.mockResolvedValue({ data: mockMediaData });

      const res = await request(app).get('/api/nasa-media?query=mars%20&%20earth');
      expect(res.statusCode).toEqual(200);
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty Mars photos response', async () => {
      axios.get.mockResolvedValue({ data: { photos: [] } });

      const res = await request(app).get('/api/mars-photos?rover=curiosity&date=2024-01-01');
      expect(res.statusCode).toEqual(200);
      expect(res.body.photos).toHaveLength(0);
    });

    test('should handle Mars photos response without photos field', async () => {
      axios.get.mockResolvedValue({ data: {} });

      const res = await request(app).get('/api/mars-photos?rover=curiosity&date=2024-01-01');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual({});
    });

    test('should handle NEO feed with no objects', async () => {
      axios.get.mockResolvedValue({ data: { near_earth_objects: {} } });

      const res = await request(app).get('/api/neo-feed?start_date=2024-01-01&end_date=2024-01-02');
      expect(res.statusCode).toEqual(200);
      expect(res.body.near_earth_objects).toEqual({});
    });

    test('should handle large NEO feed response', async () => {
      const largeResponse = {
        near_earth_objects: {
          '2024-01-01': Array(50).fill({
            id: '123',
            name: 'Test Asteroid',
            estimated_diameter: { meters: { estimated_diameter_min: 100 } }
          })
        }
      };
      axios.get.mockResolvedValue({ data: largeResponse });

      const res = await request(app).get('/api/neo-feed?start_date=2024-01-01&end_date=2024-01-02');
      expect(res.statusCode).toEqual(200);
      expect(res.body.near_earth_objects['2024-01-01']).toHaveLength(50);
    });

    test('should handle media search with no results', async () => {
      axios.get.mockResolvedValue({ data: { collection: { items: [] } } });

      const res = await request(app).get('/api/nasa-media?query=nonexistentterm');
      expect(res.statusCode).toEqual(200);
      expect(res.body.collection.items).toHaveLength(0);
    });
  });

  describe('Performance Tests', () => {
    test('should handle concurrent APOD requests', async () => {
      const mockApodData = { title: 'Test APOD', explanation: 'Test explanation' };
      axios.get.mockResolvedValue({ data: mockApodData });

      const requests = Array(5).fill().map(() => request(app).get('/api/apod'));
      const responses = await Promise.all(requests);

      responses.forEach(res => {
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual(mockApodData);
      });
      expect(axios.get).toHaveBeenCalledTimes(5);
    });

    test('should handle concurrent Mars photos requests', async () => {
      const mockPhotos = { photos: [{ id: 1, img_src: 'test.jpg' }] };
      axios.get.mockResolvedValue({ data: mockPhotos });

      const requests = Array(3).fill().map(() => 
        request(app).get('/api/mars-photos?rover=curiosity&date=2024-01-01')
      );
      const responses = await Promise.all(requests);

      responses.forEach(res => {
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual(mockPhotos);
      });
      expect(axios.get).toHaveBeenCalledTimes(3);
    });
  });

  describe('API Key Security', () => {
    test('should not expose API key in error messages', async () => {
      const errorWithApiKey = new Error('Invalid API key: DEMO_KEY');
      axios.get.mockRejectedValue(errorWithApiKey);

      const res = await request(app).get('/api/apod');
      expect(res.statusCode).toEqual(500);
      expect(res.body.error).not.toContain('DEMO_KEY');
      expect(res.body.error).toEqual('Failed to fetch APOD data');
    });

    test('should handle missing API key gracefully', async () => {
      // Temporarily remove API key
      const originalApiKey = process.env.NASA_API_KEY;
      delete process.env.NASA_API_KEY;

      const res = await request(app).get('/api/apod');
      
      // The request should still be made (NASA API uses DEMO_KEY as fallback)
      expect(axios.get).toHaveBeenCalled();

      // Restore API key
      process.env.NASA_API_KEY = originalApiKey;
    });
  });

  describe('Response Format Validation', () => {
    test('should handle APOD response with missing fields', async () => {
      const incompleteApodData = { title: 'Test' }; // Missing explanation, url, etc.
      axios.get.mockResolvedValue({ data: incompleteApodData });

      const res = await request(app).get('/api/apod');
      expect(res.statusCode).toEqual(200);
      expect(res.body.title).toEqual('Test');
    });

    test('should handle Mars photos with missing camera info', async () => {
      const photosWithMissingCamera = {
        photos: [{ id: 1, img_src: 'test.jpg', sol: 100 }] // Missing camera
      };
      axios.get.mockResolvedValue({ data: photosWithMissingCamera });

      const res = await request(app).get('/api/mars-photos?rover=curiosity&date=2024-01-01');
      expect(res.statusCode).toEqual(200);
      expect(res.body.photos[0]).not.toHaveProperty('camera');
    });

    test('should handle NEO data with missing diameter info', async () => {
      const neoWithMissingData = {
        near_earth_objects: {
          '2024-01-01': [{ id: '123', name: 'Test Asteroid' }] // Missing diameter
        }
      };
      axios.get.mockResolvedValue({ data: neoWithMissingData });

      const res = await request(app).get('/api/neo-feed?start_date=2024-01-01&end_date=2024-01-02');
      expect(res.statusCode).toEqual(200);
      expect(res.body.near_earth_objects['2024-01-01'][0]).not.toHaveProperty('estimated_diameter');
    });
  });

  describe('Content Type Handling', () => {
    test('should handle NASA API returning different content types', async () => {
      // Simulate NASA API returning HTML instead of JSON
      const htmlError = new Error('Unexpected token < in JSON');
      axios.get.mockRejectedValue(htmlError);

      const res = await request(app).get('/api/apod');
      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('error');
    });
  });
}); 