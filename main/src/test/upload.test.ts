import request from 'supertest';
import { app } from '../app';
import path from 'path';

describe('POST /upload', () => {
  let server: any;

  // Start the server before all tests
  beforeAll((done) => {
    server = app.listen(3001, () => {
      done();
    });
  });

  afterAll((done) => {
    server.close(done);
  });

  it('should upload an image and return a response', async () => {
    const filePath = path.join(__dirname, 'data', 'drawio.png');

    const response = await request(server)
        .post('/upload')
        .attach('file', filePath)
        .expect(200);

    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('path');
    expect(response.body.path).toMatch(/uploads\/[a-f0-9]+\.png/);
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
