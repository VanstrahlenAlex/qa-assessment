import { vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PostsPage from './posts';
import '@testing-library/jest-dom';
import { useApiFetch } from '../hooks';

vi.mock('../hooks', () => ({
  useApiFetch: vi.fn(() => ({
    get: vi.fn(() => Promise.resolve({})),
    delete: vi.fn(() => Promise.resolve()),
    data: [{ id: '1', title: 'Post Title', content: 'Content', authorId: 'author1', createdAt: '2023-01-01T00:00:00Z', updatedAt: '2023-01-01T00:00:00Z' }],
    isLoading: false,
    error: null,
  })),
}));


const mockedNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

describe('PostsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debería mostrar "Loading posts..." mientras se cargan las publicaciones', () => {
    (useApiFetch as jest.Mock).mockReturnValueOnce({
      get: vi.fn(() => Promise.resolve()),
      data: null,
      isLoading: true,
      error: null,
    });

    render(
      <MemoryRouter>
        <PostsPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Loading posts.../i)).toBeInTheDocument();
  });

  it('debería mostrar un mensaje de error si ocurre un error en la carga', () => {
    (useApiFetch as jest.Mock).mockReturnValueOnce({
      get: vi.fn(() => Promise.resolve()),
      data: null,
      isLoading: false,
      error: new Error('Error al cargar los posts'),
    });

    render(
      <MemoryRouter>
        <PostsPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Error al cargar los posts/i)).toBeInTheDocument();
  });

  it('debería mostrar la lista de publicaciones si los datos están disponibles', async () => {
    (useApiFetch as jest.Mock).mockReturnValueOnce({
      get: vi.fn(() => Promise.resolve()),
      data: [
        {
          id: '1',
          title: 'Test Post Title',
          content: 'This is a test post content.',
          authorId: 'author1',
          createdAt: '2023-01-01T00:00:00Z',
          updatedAt: '2023-01-01T00:00:00Z',
        },
      ],
      isLoading: false,
      error: null,
    });

    render(
      <MemoryRouter>
        <PostsPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Test Post Title/i)).toBeInTheDocument();
    expect(screen.getByText(/This is a test post content./i)).toBeInTheDocument();
  });

  it('debería navegar a la página de creación de publicaciones al hacer clic en "Create Post"', () => {
    render(
      <MemoryRouter>
        <PostsPage />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText(/Create Post/i));
    expect(mockedNavigate).toHaveBeenCalledWith('/posts/new');
  });

  it('debería llamar a la función deletePost al hacer clic en el botón de eliminar', async () => {
  const mockDelete = vi.fn(() => Promise.resolve());
  (useApiFetch as jest.Mock).mockReturnValueOnce({
    get: vi.fn(() => Promise.resolve()),
    delete: mockDelete,
    data: [
      {
        id: '1',
        title: 'Test Post Title',
        content: 'This is a test post content.',
        authorId: 'author1',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
      },
    ],
    isLoading: false,
    error: null,
  });

  render(
    <MemoryRouter>
      <PostsPage />
    </MemoryRouter>
  );

  const buttonDelete = screen.getByTestId('delete-button');

  fireEvent.click(buttonDelete);


});

});
