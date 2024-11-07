import request from 'supertest';
import { postsRoutes } from './posts';
import { postRepository } from '../database';
import { authMiddleware, getSession } from '../lib/express';
import express from 'express';
import { createPostSchema, updatePostSchema } from '@qa-assessment/shared';

jest.mock('../database/posts');
jest.mock('../lib/express', () => ({
  ...jest.requireActual('../lib/express'),
  authMiddleware: jest.fn(() => (req: any, res: any, next: any) => next()),
  getSession: jest.fn(),
}));

jest.mock('@qa-assessment/shared', () => ({
  createPostSchema: { safeParse: jest.fn() },
  updatePostSchema: { safeParse: jest.fn() },
}));

(postRepository.find as jest.Mock).mockResolvedValue(null);

const mockPost = {
  id: '1',
  title: 'Test Post',
  content: 'This is a test post',
  authorId: '123',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('Posts Routes', () => {
  const app = express();
  app.use(express.json());
  app.use('/posts', postsRoutes);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /posts', () => {
    it('should return a list of posts', async () => {
      (postRepository.all as jest.Mock).mockResolvedValue([mockPost]);
      const res = await request(app).get('/posts');

      expect(res.status).toBe(200);
      expect(res.body).toEqual([mockPost]);
    });
  });

  describe('GET /posts/:postId', () => {
    it('should return a post by id', async () => {
      (postRepository.find as jest.Mock).mockResolvedValue(mockPost);
      const res = await request(app).get('/posts/1');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockPost);
    });

    it('should return 404 if post is not found', async () => {
      (postRepository.find as jest.Mock).mockResolvedValue(null);
      const res = await request(app).get('/posts/999');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(null);
    });
  });

  describe('POST /posts', () => {
    it('should create a new post', async () => {
      (createPostSchema.safeParse as jest.Mock).mockReturnValue({
        success: true,
        data: { title: 'Test', content: 'This is content' },
      });
      (getSession as jest.Mock).mockResolvedValue({ userId: '123' });
      (postRepository.create as jest.Mock).mockResolvedValue(mockPost);

      const res = await request(app).post('/posts').send({
        title: 'Test',
        content: 'This is content',
      });

      expect(res.status).toBe(201);
      expect(res.body).toEqual(mockPost);
    });
  });

  describe('PUT /posts/:postId', () => {
    it('should update an existing post', async () => {
      const updatedPost = { title: 'Updated Title', content: 'Updated Content' };
      (updatePostSchema.safeParse as jest.Mock).mockReturnValue({
        success: true,
        data: updatedPost,
      });
      (postRepository.find as jest.Mock).mockResolvedValue(mockPost);
      (postRepository.update as jest.Mock).mockResolvedValue({
        ...mockPost,
        ...updatedPost,
      });

      const res = await request(app).put('/posts/1').send(updatedPost);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ ...mockPost, ...updatedPost });
    });
  });

  describe('DELETE /posts/:postId', () => {
    it('should delete a post', async () => {
      (postRepository.delete as jest.Mock).mockResolvedValue(undefined);

      const res = await request(app).delete('/posts/1');

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ message: 'Post deleted' });
    });

    it('should return 404 if post to delete is not found', async () => {
      (postRepository.delete as jest.Mock).mockRejectedValue(new Error('Post not found'));

      const res = await request(app).delete('/posts/999');

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ message: 'Post not found' });
    });
  });
});
