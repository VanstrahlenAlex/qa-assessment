import axios from 'axios';
import { Session, User } from '@qa-assessment/shared';

axios.defaults.baseURL = 'http://localhost:3000/';

describe('Users API', () => {
  let authToken: string;
  let userId: string;
  let username: string;
  const password = 'password123';

  beforeAll(async () => {
    username = `testuser_${Math.random().toString(36).substring(7)}`;

    const registerResponse = await axios.post<Session>('/users', {
      username,
      password,
    });

    expect(registerResponse.status).toBe(200);
    authToken = registerResponse.data.token;
    userId = registerResponse.data.userId;

    axios.defaults.headers.common['Authorization'] = authToken;
  });

  afterAll(() => {

    delete axios.defaults.headers.common['Authorization'];
  });

  describe('GET /users/:userId', () => {
    it('debería obtener la información del usuario registrado', async () => {
      try {
        const response = await axios.get<User>(`/users/${userId}`);
        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty('id', userId);
        expect(response.data).toHaveProperty('username', username);
      } catch (error: any) {
        console.error('Error en GET /users/:userId:', error.response?.data || error.message);
        throw error;
      }
    });

    it('debería devolver 404 si el usuario no existe', async () => {
      try {
        await axios.get('/users/nonexistentUserId');
        fail('Debería haber lanzado un error');
      } catch (error: any) {
        expect(error.response.status).toBe(404);
        expect(error.response.data.message).toBe('User not found');
      }
    });
  });

  describe('PUT /users/:userId', () => {
      it('debería actualizar la información del usuario', async () => {
    const updatedData = {
      username: `${username}_updated`,
      favoriteBook: {
        key: '1984-key',
        title: '1984',
        author_name: ['George Orwell'],
        first_publish_year: 1949,
        },
      };


      try {
        const response = await axios.put(`/users/${userId}`, updatedData);
        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty('username', updatedData.username);


        const favoriteBook = typeof response.data.favoriteBook === 'string'
          ? JSON.parse(response.data.favoriteBook)
          : response.data.favoriteBook;

        expect(favoriteBook).toEqual(updatedData.favoriteBook);
      } catch (error: any) {
        console.error('Error en PUT /users/:userId:', JSON.stringify(error.response?.data, null, 2) || error.message);
        throw error;
      }
    });

    it('debería devolver 404 si se intenta actualizar un usuario que no existe', async () => {
      const updatedData = {
        username: 'nonexistent_user',
        favoriteBook: { title: 'Brave New World', author: 'Aldous Huxley' },
      };

      try {
        await axios.put('/users/nonexistentUserId', updatedData);
        fail('Debería haber lanzado un error');
      } catch (error: any) {
        expect(error.response.status).toBe(500);
        expect(error.response.data.message).toBe('Internal server error');
      }
    });

    it('debería devolver 422 si los datos de actualización son inválidos', async () => {
      const invalidData = { favoriteBook: 123 };

      try {
        await axios.put(`/users/${userId}`, invalidData);
        fail('Debería haber lanzado un error');
      } catch (error: any) {
        expect(error.response.status).toBe(422);
        expect(error.response.data.errors).toBeDefined();
      }
    });
  });

  describe('POST /users', () => {
    it('debería registrar un nuevo usuario', async () => {
      const newUser = {
        username: `newuser_${Math.random().toString(36).substring(7)}`,
        password: 'newpassword123',
      };

      try {
        const response = await axios.post<Session>('/users', newUser);
        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty('token');
        expect(response.data).toHaveProperty('userId');
      } catch (error: any) {
        console.error('Error en POST /users:', error.response?.data || error.message);
        throw error;
      }
    });

    it('debería devolver 422 si los datos de registro son inválidos', async () => {
      const invalidUser = { username: '' };

      try {
        await axios.post('/users', invalidUser);
        fail('Debería haber lanzado un error');
      } catch (error: any) {
        expect(error.response.status).toBe(422);
        expect(error.response.data.errors).toBeDefined();
      }
    });
  });
});
