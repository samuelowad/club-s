import request from 'supertest';
import { app } from '../app';
import path from 'path';
import { initializeDatabase } from '../database';

describe('POST /upload', () => {
  let server: any;

  beforeAll(async () => {
    await initializeDatabase()
    server = app.listen(3001);
  });

  afterAll((done) => {
    server.close(done);
  });

  it('should upload an image and return a response', async () => {
    const filePath = path.join(__dirname, 'data', 'drawio.png');

    const response = await request(server)
        .post('/upload')
        .attach('file', filePath)
        .expect(201);

    expect(response.body.data).toHaveProperty('id');
  });

  it('should return 400 for invalid file type', async () => {
    const filePath = path.join(__dirname, 'data', '240513.pdf');
    const response = await request(server)
        .post('/upload')
        .attach('file', filePath)
        .expect(400);

    expect(response).toHaveProperty('error');
  });
});
