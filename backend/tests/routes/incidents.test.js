const request = require('supertest');
const app = require('../../src/app');
const { validNewIncident, updateData } = require('../fixtures/incidents');

describe('Incidents API', () => {
  
  // ==================== GET /api/incidents ====================
  describe('GET /api/incidents', () => {
    it('should return all incidents', async () => {
      const response = await request(app)
        .get('/api/incidents')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBe(4); // 4 fixtures
    });

    it('should return incidents with all required fields', async () => {
      const response = await request(app)
        .get('/api/incidents')
        .expect(200);

      const incident = response.body[0];
      expect(incident).toHaveProperty('id');
      expect(incident).toHaveProperty('timestamp');
      expect(incident).toHaveProperty('source_ip');
      expect(incident).toHaveProperty('severity');
      expect(incident).toHaveProperty('type');
      expect(incident).toHaveProperty('status');
      expect(incident).toHaveProperty('description');
    });

    it('should return incidents ordered by timestamp descending', async () => {
      const response = await request(app)
        .get('/api/incidents')
        .expect(200);

      const timestamps = response.body.map(i => new Date(i.timestamp).getTime());
      const sortedTimestamps = [...timestamps].sort((a, b) => b - a);
      expect(timestamps).toEqual(sortedTimestamps);
    });
  });

  // ==================== GET /api/incidents/:id ====================
  describe('GET /api/incidents/:id', () => {
    it('should return a single incident by ID', async () => {
      // First get all to find a valid ID
      const allResponse = await request(app).get('/api/incidents');
      const existingId = allResponse.body[0].id;

      const response = await request(app)
        .get(`/api/incidents/${existingId}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('id', existingId);
      expect(response.body).toHaveProperty('source_ip');
    });

    it('should return 404 for non-existent incident', async () => {
      const response = await request(app)
        .get('/api/incidents/99999')
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Incident not found');
    });
  });

  // ==================== POST /api/incidents ====================
  describe('POST /api/incidents', () => {
    it('should create a new incident with valid data', async () => {
      const response = await request(app)
        .post('/api/incidents')
        .send(validNewIncident)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.source_ip).toBe(validNewIncident.source_ip);
      expect(response.body.severity).toBe(validNewIncident.severity);
      expect(response.body.type).toBe(validNewIncident.type);
      expect(response.body.status).toBe(validNewIncident.status);
    });

    it('should return 400 when required fields are missing', async () => {
      const incompleteIncident = {
        description: 'Missing required fields'
      };

      const response = await request(app)
        .post('/api/incidents')
        .send(incompleteIncident)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Missing required fields');
    });

    it('should return 400 when timestamp is missing', async () => {
      const noTimestamp = { ...validNewIncident };
      delete noTimestamp.timestamp;

      const response = await request(app)
        .post('/api/incidents')
        .send(noTimestamp)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Missing required fields');
    });

    it('should default status to "open" if not provided', async () => {
      const noStatus = { ...validNewIncident };
      delete noStatus.status;

      const response = await request(app)
        .post('/api/incidents')
        .send(noStatus)
        .expect(201);

      expect(response.body.status).toBe('open');
    });

    it('should increase incident count after creation', async () => {
      const beforeResponse = await request(app).get('/api/incidents');
      const countBefore = beforeResponse.body.length;

      await request(app)
        .post('/api/incidents')
        .send(validNewIncident)
        .expect(201);

      const afterResponse = await request(app).get('/api/incidents');
      expect(afterResponse.body.length).toBe(countBefore + 1);
    });
  });

  // ==================== PUT /api/incidents/:id ====================
  describe('PUT /api/incidents/:id', () => {
    it('should update an existing incident', async () => {
      // Get an existing incident
      const allResponse = await request(app).get('/api/incidents');
      const existingId = allResponse.body[0].id;

      const response = await request(app)
        .put(`/api/incidents/${existingId}`)
        .send(updateData)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.id).toBe(existingId);
      expect(response.body.status).toBe(updateData.status);
      expect(response.body.description).toBe(updateData.description);
    });

    it('should return 404 when updating non-existent incident', async () => {
      const response = await request(app)
        .put('/api/incidents/99999')
        .send(updateData)
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Incident not found');
    });

    it('should persist changes after update', async () => {
      // Get an existing incident
      const allResponse = await request(app).get('/api/incidents');
      const existingId = allResponse.body[0].id;

      // Update it
      await request(app)
        .put(`/api/incidents/${existingId}`)
        .send(updateData)
        .expect(200);

      // Fetch it again and verify
      const getResponse = await request(app)
        .get(`/api/incidents/${existingId}`)
        .expect(200);

      expect(getResponse.body.status).toBe(updateData.status);
      expect(getResponse.body.description).toBe(updateData.description);
    });
  });

  // ==================== DELETE /api/incidents/:id ====================
  describe('DELETE /api/incidents/:id', () => {
    it('should delete an existing incident', async () => {
      // Get an existing incident
      const allResponse = await request(app).get('/api/incidents');
      const existingId = allResponse.body[0].id;

      const response = await request(app)
        .delete(`/api/incidents/${existingId}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Incident deleted successfully');
    });

    it('should return 404 when deleting non-existent incident', async () => {
      const response = await request(app)
        .delete('/api/incidents/99999')
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Incident not found');
    });

    it('should reduce incident count after deletion', async () => {
      const beforeResponse = await request(app).get('/api/incidents');
      const countBefore = beforeResponse.body.length;
      const idToDelete = beforeResponse.body[0].id;

      await request(app)
        .delete(`/api/incidents/${idToDelete}`)
        .expect(200);

      const afterResponse = await request(app).get('/api/incidents');
      expect(afterResponse.body.length).toBe(countBefore - 1);
    });

    it('should return 404 when fetching deleted incident', async () => {
      // Get an existing incident
      const allResponse = await request(app).get('/api/incidents');
      const existingId = allResponse.body[0].id;

      // Delete it
      await request(app)
        .delete(`/api/incidents/${existingId}`)
        .expect(200);

      // Try to fetch it
      await request(app)
        .get(`/api/incidents/${existingId}`)
        .expect(404);
    });
  });

  // ==================== Health Check ====================
  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
    });
  });
});

