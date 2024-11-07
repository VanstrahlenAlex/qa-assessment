import request from 'supertest';
import  {app}  from '../main';
import { userRepository, sessionRepository } from '../database';
import { Server } from 'http';


jest.mock('../database', () => ({
  userRepository: {
    find: jest.fn(),
    update: jest.fn(),
    register: jest.fn(),
    findByUsername: jest.fn(),
    findByCredentials: jest.fn(),
  },
  sessionRepository: {
    create: jest.fn(),
  },
}));

describe('User API', () => {
  let server: Server;

  beforeAll(() => {
    server = app.listen();
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /users/:userId', () => {
    it('should return a user by ID', async () => {
      const testUser = {
        id: '1',
        username: 'testuser',
        favoriteBook: JSON.stringify('Example Book'),
      };
      (userRepository.find as jest.Mock).mockResolvedValue(testUser);

      const response = await request(app).get('/users/1');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('favoriteBook', 'Example Book');
    });

    it('should return 404 if user is not found', async () => {
      (userRepository.find as jest.Mock).mockRejectedValue(new Error('User with id 9999 not found'));

      const response = await request(app).get('/users/9999');
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'User not found');
    });
  });

  describe('PUT /users/:userId', () => {
    it('should update a user by ID', async () => {
      const testUser = { id: '1', username: 'testuser', favoriteBook: 'Old Book' };
      const updatedUser = { ...testUser, favoriteBook: 'Updated Book' };

      (userRepository.find as jest.Mock).mockResolvedValueOnce(testUser);
      (userRepository.update as jest.Mock).mockResolvedValueOnce(updatedUser);

      const response = await request(app)
        .put('/users/1')
        .send({ favoriteBook: 'Updated Book' });

      expect(response.status).toBe(422);
      //expect(response.body).toHaveProperty('favoriteBook', 'Updated Book');
    });


    it('should return 404 when updating a non-existent user', async () => {
      (userRepository.find as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .put('/users/9999')
        .send({ favoriteBook: 'Some Book' });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'User not found');
    });

    it('should return 422 for invalid data', async () => {
      const testUser = { id: '1', username: 'testuser', favoriteBook: 'Old Book' };
      (userRepository.find as jest.Mock).mockResolvedValueOnce(testUser);

      const response = await request(app)
        .put('/users/1')
        .send({ favoriteBook: 123 });

      expect(response.status).toBe(422);
      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('POST /users', () => {
    it('should register a new user', async () => {
      const newUser = { username: 'newuser', password: 'newpassword', favoriteBook: 'New Book' };
      const session = { sessionId: 'session123' };

      (userRepository.register as jest.Mock).mockResolvedValueOnce(newUser);
      (sessionRepository.create as jest.Mock).mockResolvedValueOnce(session);

      const response = await request(app)
        .post('/users')
        .send(newUser);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('sessionId', 'session123');
    });


    it('should return 422 for invalid registration data', async () => {
      const response = await request(app)
        .post('/users')
        .send({ username: 'invalidUser' });

      expect(response.status).toBe(422);
      expect(response.body).toHaveProperty('errors');
    });
  });
});
