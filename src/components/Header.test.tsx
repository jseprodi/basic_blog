import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Header from './Header';
import { ThemeProvider } from './ThemeProvider';

jest.mock('next-auth/react', () => ({
  useSession: () => ({ data: null, status: 'unauthenticated' }),
  signOut: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

describe('Header', () => {
  it('renders Blog title, Home link, and Sign In button when not authenticated', () => {
    render(
      <ThemeProvider>
        <Header />
      </ThemeProvider>
    );
    expect(screen.getByText('Blog')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Sign In')).toBeInTheDocument();
  });
}); 