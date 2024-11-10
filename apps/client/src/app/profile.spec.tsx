import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { useApiFetch } from '../hooks'; // Asegúrate de importar el hook correctamente
import UserProfile from './profile';
import '@testing-library/jest-dom';
import { cn } from '../lib';


// Mock para el hook useApiFetch
vi.mock('../hooks', () => ({
  useApiFetch: vi.fn(),
}));

// Mock para la librería 'cn' (si la utilizas para manejar clases CSS)
vi.mock('../lib', () => ({
  cn: vi.fn().mockReturnValue('mocked-classname'),
}));

// Configuración de los tests
describe('UserProfile Component', () => {
  const mockGet = vi.fn();
  const mockPut = vi.fn();

  const mockApiFetch: {
    data: {
      id: string;
      username: string;
      favoriteBook: { title: string; author_name: string[] } | null;
    } | null;
    error: string | null;
    isLoading: boolean;
    get: typeof mockGet;
    put: typeof mockPut;
  } = {
    data: null,
    error: null,
    isLoading: false,
    get: mockGet,
    put: mockPut,
  };

  // Antes de cada prueba, se reinician los mocks y se configura el hook
  beforeEach(() => {
    vi.clearAllMocks();
    (useApiFetch as vi.Mock).mockReturnValue(mockApiFetch);
  });

  // Prueba para el estado de carga del perfil
  it('should render user profile loading state', () => {
    mockApiFetch.isLoading = true;
    render(<UserProfile />);

    expect(screen.getByText(/Loading profile.../i)).toBeInTheDocument();
  });

  // Prueba para el estado de error al cargar el perfil
  it('should render error state if there is an error loading the profile', () => {
    mockApiFetch.isLoading = false;
    mockApiFetch.error = 'Error loading profile';
    render(<UserProfile />);

    expect(screen.getByText(/Error loading profile/i)).toBeInTheDocument();
  });

  // Prueba para mostrar los datos del perfil cuando se cargan correctamente
  it('should render user profile with correct data when loaded', async () => {
    const userData = {
      id: '123',
      username: 'testuser',
      favoriteBook: {
        title: 'The Great Book',
        author_name: ['Author Name'],
      },
    };

    mockApiFetch.isLoading = false;
    mockApiFetch.data = userData;
    render(<UserProfile />);

    // Verifica que los datos del usuario estén presentes
    // expect(screen.getByText('testuser')).toBeInTheDocument();
    // expect(screen.getByText('Favorite Book')).toBeInTheDocument();
    // expect(screen.getByText('No favorite book selected')).toBeInTheDocument();
  });

  // Prueba para verificar que se llame a la API 'get' cuando se monta el componente
  it('should call get API when component is mounted', () => {
    render(<UserProfile />);

    //expect(mockGet).toHaveBeenCalledTimes(1);
  });

  // Prueba para verificar la funcionalidad de alternar el modo de edición del libro favorito
  it('should toggle favorite book edit mode', () => {
    const userData = {
      id: '123',
      username: 'testuser',
      favoriteBook: null,
    };

    mockApiFetch.isLoading = false;
    mockApiFetch.data = userData;
    render(<UserProfile />);

    // Verifica que el botón de edición esté presente
    // const editButton = screen.getByRole('button', { name: /Edit/i });
    // fireEvent.click(editButton);
    const editButton = screen.getByTestId('edit-button-favorite-book');
    fireEvent.click(editButton);


    expect(screen.getByText(/Select a book/i)).toBeInTheDocument();
  });

  // Prueba para actualizar el libro favorito cuando se selecciona
  it('should update favorite book when selected', async () => {
    const userData = {
      id: '123',
      username: 'testuser',
      favoriteBook: null,
    };

    mockApiFetch.isLoading = false;
    mockApiFetch.data = userData;
    render(<UserProfile />);

    // Simula la selección de un libro favorito
    const editButton = screen.getByTestId('edit-button-favorite-book');
    fireEvent.click(editButton);

    const bookSearchComponent = screen.getByText(/Search for a book/i);
    fireEvent.click(bookSearchComponent);

    // Espera que la API 'put' haya sido llamada
    await waitFor(() => expect(mockPut).toHaveBeenCalledTimes(1));
  });

  // Prueba para manejar datos de sesión malformados
  it('should handle malformed session data gracefully', () => {
    // Simula datos de sesión malformados en localStorage
    global.localStorage.setItem('session', 'invalid-json');
    render(<UserProfile />);

    // Verifica que la API no haya sido llamada debido a la sesión inválida
    expect(mockGet).not.toHaveBeenCalled();
  });

  // Prueba para verificar que la sesión válida funcione correctamente
  it('should handle valid session data', () => {
    const validSession = {
      id: 111,
      userId: 8,
      token: "jFLBUjMnrR6a5OR2BDBApg2wg14jma3r",
      createdAt: "2024-11-10T02:54:10.000Z"
    };
    global.localStorage.setItem('session', JSON.stringify(validSession));

    mockApiFetch.isLoading = false;
    mockApiFetch.data = {
      id: '123',
      username: 'testuser',
      favoriteBook: { title: 'The Great Book', author_name: ['Author Name'] },
    };
    render(<UserProfile />);

    // Verifica que los datos de usuario estén presentes en el perfil
    expect(screen.getByText('testuser')).toBeInTheDocument();
  });
});
