import axios from 'axios';
import { Session } from '@qa-assessment/shared';

axios.defaults.baseURL = 'http://localhost:3000/';

describe('Auth API', () => {
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

  describe('POST auth/login', () => {
    it('should log in successfully with valid credentials', async () => {
      try {
        const response = await axios.post<Session>('auth/login', {
          username,
          password,
        });
        expect(response.status).toBe(200);
        expect(response.data.token).toBeDefined();
      } catch (error: any) {
        console.error('Error en POST /login:', error.response?.data || error.message);


        throw error;
      }
    });

    it('should reject login with invalid credentials', async () => {
      try {
        await axios.post('auth/login', {
          username: 'invaliduser',
          password: 'wrongpassword',
        });
        fail('Debería haber lanzado un error');
      } catch (error: any) {
        expect(error.response.status).toBe(422);
        expect(error.response.data.message).toBe("Invalid credentials");
      }
    });

    it('should reject login with incomplete data', async () => {
      try {
        await axios.post('auth/login', {
          username: 'testuser',
        });
        fail('Debería haber lanzado un error');
      } catch (error: any) {
        expect(error.response.status).toBe(422);
        expect(error.response.data.errors).toEqual([
              {
                code: "invalid_type",
                expected: "string",
                message: "Required",
                path: ["password"],
                received: "undefined",
              },
            ]);
      }
    });
  });

  describe('POST auth/logout', () => {
    it('should log out successfully', async () => {
      try {
        const logoutResponse = await axios.post('auth/logout');
        expect(logoutResponse.status).toBe(200);
        expect(logoutResponse.data.message).toBe('Logged out');
      } catch (error: any) {
        console.error('Error en POST /logout:', error.response?.data || error.message);
        throw error;
      }


      try {
        await axios.post('/posts', {
          title: 'Post después del cierre de sesión',
          content: 'Este post no debería ser creado',
        });
        fail('Debería haber lanzado un error de autenticación');
      } catch (error: any) {
        expect(error.response.status).toBe(401);
      }
    });
  });
});
