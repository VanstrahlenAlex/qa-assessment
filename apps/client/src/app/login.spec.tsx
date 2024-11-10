import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import Login from './login';
import '@testing-library/jest-dom';

const mockSet = vi.fn();
const mockNavigate = vi.fn();

vi.mock('../hooks/use-storage', () => ({
  useStorage: () => ({
    set: mockSet,
    get: vi.fn(),
    remove: vi.fn(),
  }),
}));

vi.mock('react-router-dom', () => ({
  Link: ({ children, to }: { children: React.ReactNode, to: string }) => <a href={to}>{children}</a>,
  useNavigate: () => mockNavigate,
}));

describe('Login component', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render login form with username and password fields', () => {
    render(<Login />);
    expect(screen.getByPlaceholderText('Username')).toBeDefined();
    expect(screen.getByPlaceholderText('Password')).toBeDefined();
  });

  it('should allow user to type username and password', () => {
    render(<Login />);
    fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password123' } });
    expect(screen.getByPlaceholderText('Username')).toHaveValue('testuser');
    expect(screen.getByPlaceholderText('Password')).toHaveValue('password123');
  });

  it('should display sign-up prompt with correct link', () => {
    render(<Login />);

    const signUpPrompt = screen.queryByText(/Don't have an account\? Create one/i);


    const createOneLink = screen.queryByText('Create one') as HTMLAnchorElement;
    expect(createOneLink).toBeDefined();
    expect(createOneLink).toBeInTheDocument();
    if (createOneLink) {
      expect(createOneLink.href).toContain('/signup');
    }
  });

  it('should display error message on failed login attempt', async () => {
    render(<Login />);
    fireEvent.click(screen.getByText('Sign in'));
    
  });
});
