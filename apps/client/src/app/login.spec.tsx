import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import { useFetch, useStorage } from '../hooks';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import Login from './login';
import { vi } from 'vitest';
import type { Mock } from 'vitest';
import '@testing-library/jest-dom';

const mockStorage = {
  get: vi.fn(),
  set: vi.fn(),
};

vi.mock('../hooks/use-fetch.ts', () => ({
  useFetch: vi.fn(() => ({
    fetch: vi.fn(),
    isLoading: false,
    error: null,
  })),
  useStorage: () => mockStorage,
}));

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = (await importOriginal()) as { [key: string]: any };
  return {
    ...actual,
    Link: actual.Link,
    useNavigate: vi.fn(),
  };
});

describe('Login Component', () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useNavigate as Mock).mockReturnValue(mockNavigate);
  });

  it('should render the login form correctly', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByText((content) => content.includes('Sign in'))).toBeInTheDocument();
  });

  it('should handle successful login and redirect to /posts', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      token: 'test-token',
      userId: '123',
    });
    (useFetch as Mock).mockReturnValue({ fetch: mockFetch, isLoading: false });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByText((content) => content.includes('Sign in')));

    await waitFor(() => {
      expect(mockStorage.set).toHaveBeenCalledWith('session', JSON.stringify({ token: 'test-token', userId: '123' }));
      expect(mockNavigate).toHaveBeenCalledWith('/posts');
    });
  });

  it('should display error message on failed login attempt', async () => {
    const mockFetch = vi.fn().mockRejectedValue({ message: 'Invalid credentials' });
    (useFetch as Mock).mockReturnValue({ fetch: mockFetch, isLoading: false });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: 'wronguser' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'wrongpassword' } });
    fireEvent.click(screen.getByText((content) => content.includes('Sign in')));

    await waitFor(() => {
      expect(screen.getByText((text) => text.includes('Invalid credentials'))).toBeInTheDocument();
    });
  });

  it('should show loading text on sign in button while logging in', async () => {
    const mockFetch = vi.fn();
    (useFetch as Mock).mockReturnValue({ fetch: mockFetch, isLoading: true });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByText((content) => content.includes('Sign in')));

    expect(screen.getByText((text) => text.includes('Signing in'))).toBeInTheDocument();
  });
});
