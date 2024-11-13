import axios from 'axios';
import { Post, Session } from '@qa-assessment/shared';

describe('Posts API', () => {
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    
    const username = `testuser_${Math.random().toString(36).substring(7)}`;
    const password = 'password123';

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

  describe('POST /posts', () => {
    it('should create a new post successfully', async () => {
      // Prepare test data
      const postData = {
        title: 'Test Post Title',
        content: 'This is a test post content.',
      };


      const createResponse = await axios.post<Post>('/posts', postData);

      // Verify response status
      expect(createResponse.status).toBe(201);


      const createdPost = createResponse.data;
      expect(createdPost).toMatchObject({
        title: postData.title,
        content: postData.content,
        authorId: userId,
      });


      expect(createdPost.id).toBeDefined();
      expect(createdPost.createdAt).toBeDefined();
      expect(createdPost.updatedAt).toBeDefined();


      const getResponse = await axios.get<Post>(`/posts/${createdPost.id}`);
      expect(getResponse.status).toBe(200);
      expect(getResponse.data).toEqual(createdPost);
    });

    it('should reject post creation with invalid data', async () => {

      const invalidPost = {
        title: '',
        content: 'Test content',
      };

      try {
        await axios.post('/posts', invalidPost);
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.response.status).toBe(422);
        expect(error.response.data.errors).toBeDefined();
      }
    });

    it('should reject unauthorized post creation', async () => {

      delete axios.defaults.headers.common['Authorization'];

      try {
        await axios.post('/posts', {
          title: 'Unauthorized Post',
          content: 'This should fail',
        });
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.response.status).toBe(401);
      }

      // Restore auth token for subsequent tests
      axios.defaults.headers.common['Authorization'] = authToken;
    });
  });
});
