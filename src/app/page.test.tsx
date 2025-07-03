import { render, screen, waitFor } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';
import Home from './page';

// Mock Next.js modules
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('next/link', () => {
  return ({ children, href, ...props }: any) => {
    return <a href={href} {...props}>{children}</a>;
  };
});

// Mock fetch
global.fetch = jest.fn();

const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;
const mockUseSearchParams = useSearchParams as jest.MockedFunction<typeof useSearchParams>;

describe('Home Page Accessibility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: jest.fn(),
    });
    mockUseSearchParams.mockReturnValue({
      get: jest.fn().mockReturnValue(null),
      has: jest.fn(),
      forEach: jest.fn(),
      entries: jest.fn(),
      keys: jest.fn(),
      values: jest.fn(),
      toString: jest.fn(),
    } as any);
  });

  it('has proper semantic structure with main landmark', () => {
    render(<Home />);
    
    const mainElement = screen.getByRole('main');
    expect(mainElement).toBeInTheDocument();
    expect(mainElement).toHaveAttribute('id', 'main-content');
  });

  it('has proper heading hierarchy', () => {
    render(<Home />);
    
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1).toHaveTextContent('Welcome to My Blog');
    
    const h2 = screen.getByRole('heading', { level: 2 });
    expect(h2).toHaveTextContent('Latest Posts');
  });

  it('has accessible search form', () => {
    render(<Home />);
    
    const searchForm = screen.getByRole('search');
    expect(searchForm).toBeInTheDocument();
    expect(searchForm).toHaveAttribute('aria-label', 'Search blog posts');
    
    const searchInput = screen.getByLabelText('Search posts');
    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toHaveAttribute('type', 'text');
    
    const searchButton = screen.getByRole('button', { name: /submit search/i });
    expect(searchButton).toBeInTheDocument();
  });

  it('has accessible navigation links with proper focus styles', () => {
    render(<Home />);
    
    const signInLink = screen.getByRole('link', { name: /sign in to access dashboard/i });
    expect(signInLink).toBeInTheDocument();
    expect(signInLink).toHaveAttribute('href', '/login');
    expect(signInLink.className).toContain('focus:outline-none');
    expect(signInLink.className).toContain('focus:ring-2');
  });

  it('has accessible post cards with proper ARIA roles', async () => {
    const mockPosts = [
      {
        id: 1,
        title: 'Test Post 1',
        content: 'This is a test post content',
        excerpt: 'Test excerpt',
        featuredImage: '/test-image.jpg',
        createdAt: '2024-01-01T00:00:00Z',
        author: { name: 'Test Author' },
        category: { id: 1, name: 'Technology' },
        tags: [{ id: 1, name: 'React' }, { id: 2, name: 'Next.js' }],
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockPosts,
    });

    render(<Home />);

    await waitFor(() => {
      const postFeed = screen.getByRole('feed', { name: /blog posts/i });
      expect(postFeed).toBeInTheDocument();
    });

    const article = screen.getByRole('article');
    expect(article).toBeInTheDocument();

    const postLink = screen.getByRole('link', { name: /read full article: test post 1/i });
    expect(postLink).toBeInTheDocument();
    expect(postLink).toHaveAttribute('href', '/post/1');
    expect(postLink.className).toContain('focus:outline-none');
    expect(postLink.className).toContain('focus:ring-2');

    const categoryTag = screen.getByText('Technology');
    expect(categoryTag).toHaveAttribute('role', 'tag');

    const tags = screen.getAllByRole('tag');
    expect(tags).toHaveLength(3); // 1 category + 2 tags

    // Find the <time> element and check its datetime attribute
    const timeElement = article.querySelector('time');
    expect(timeElement).toBeInTheDocument();
    expect(timeElement).toHaveAttribute('datetime', '2024-01-01T00:00:00Z');
    expect(timeElement?.textContent).toBeTruthy();
  });

  it('has accessible loading states', async () => {
    (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<Home />);

    // Wait for the loading status to appear
    const loadingStatus = await screen.findByRole('status');
    expect(loadingStatus).toBeInTheDocument();
    expect(loadingStatus).toHaveAttribute('aria-live', 'polite');
  });

  it('has accessible empty state', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    render(<Home />);

    // Wait for the empty state message to appear
    const emptyStatus = await screen.findByText(/no published posts yet|no posts found/i);
    expect(emptyStatus).toBeInTheDocument();
    expect(emptyStatus).toHaveAttribute('role', 'status');
  });

  it('has accessible search results with clear search link', async () => {
    mockUseSearchParams.mockReturnValue({
      get: jest.fn().mockReturnValue('test query'),
      has: jest.fn(),
      forEach: jest.fn(),
      entries: jest.fn(),
      keys: jest.fn(),
      values: jest.fn(),
      toString: jest.fn(),
    } as any);

    const mockPosts = [
      {
        id: 1,
        title: 'Search Result Post',
        content: 'This is a search result',
        createdAt: '2024-01-01T00:00:00Z',
        author: { name: 'Test Author' },
        tags: [],
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockPosts,
    });

    render(<Home />);

    await waitFor(() => {
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveTextContent('Search Results for "test query"');
    });

    const clearSearchLink = screen.getByRole('link', { name: /clear search results/i });
    expect(clearSearchLink).toBeInTheDocument();
    expect(clearSearchLink).toHaveAttribute('href', '/');
    expect(clearSearchLink.className).toContain('focus:outline-none');
    expect(clearSearchLink.className).toContain('focus:ring-2');
  });

  it('has accessible images with proper alt text', async () => {
    const mockPosts = [
      {
        id: 1,
        title: 'Test Post with Image',
        content: 'This is a test post with an image',
        featuredImage: '/test-image.jpg',
        createdAt: '2024-01-01T00:00:00Z',
        author: { name: 'Test Author' },
        tags: [],
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockPosts,
    });

    render(<Home />);

    await waitFor(() => {
      const image = screen.getByAltText(/featured image for test post with image/i);
      expect(image).toBeInTheDocument();
    });
  });

  it('has accessible authenticated user experience', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: { name: 'Test User', email: 'test@example.com' },
        expires: '2024-12-31',
      },
      status: 'authenticated',
      update: jest.fn(),
    });

    render(<Home />);

    const welcomeMessage = screen.getByText(/welcome back, test user!/i);
    expect(welcomeMessage).toBeInTheDocument();

    const dashboardLink = screen.getByRole('link', { name: /go to dashboard/i });
    expect(dashboardLink).toBeInTheDocument();
    expect(dashboardLink).toHaveAttribute('href', '/dashboard');
  });
}); 