import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { useApiFetch } from '../hooks';
import UserProfile from './profile';
import '@testing-library/jest-dom';

// Mocks
vi.mock('../hooks', () => ({
  useApiFetch: vi.fn(),
}));
vi.mock('../lib', () => ({
  cn: vi.fn().mockReturnValue('mocked-classname'),
  apiUrl: vi.fn((path: string) => `https://mocked-api.com${path}`),
}));

describe('UserProfile Component', () => {
  const mockGet = vi.fn();
  const mockPut = vi.fn();

  const mockApiFetch = {
    data: { id: 'userId', username: 'testuser', favoriteBook: null },
    error: null,
    isLoading: false,
    get: mockGet,
    put: mockPut,
  };

  // Mock de localStorage
  const mockGetItem = vi.spyOn(global.localStorage, 'getItem');

  beforeEach(() => {
    vi.clearAllMocks();
    (useApiFetch as vi.Mock).mockReturnValue(mockApiFetch);
    // Mock de localStorage para retornar un objeto JSON
    mockGetItem.mockReturnValue(JSON.stringify({ userId: 'userId' }));
    localStorage.setItem('session', JSON.stringify({ userId: 'userId' }));
  });

  afterEach(() => {
    localStorage.clear();
  });

  test('Test N° 1: should render user profile', () => {
    render(<UserProfile />);
    expect(screen.getByText('testuser')).toBeInTheDocument();
  });

  it('Test N° 3: should render user profile loading state', () => {
    mockApiFetch.isLoading = true;
    render(<UserProfile />);
    expect(screen.getByText(/Loading profile.../i)).toBeInTheDocument();
  });

  it('Test N° 4: should render error state if there is an error loading the profile', () => {
    mockApiFetch.isLoading = false;
    mockApiFetch.error = 'Error loading profile';
    render(<UserProfile />);
    expect(screen.getByText(/Error loading profile/i)).toBeInTheDocument();
  });


  it('Test N° 5: should handle API errors gracefully', async () => {
    mockApiFetch.error = 'API error';
    render(<UserProfile />);
    await waitFor(() => {
      expect(screen.getByText(/Error loading profile/i)).toBeInTheDocument();
    });
  });


});
