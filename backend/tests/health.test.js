const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');

describe('Health Check API', () => {
  it('GET /api/test should return 200 and success message', async () => {
    const res = await request(app).get('/api/test');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'API is working!');
  });
});
