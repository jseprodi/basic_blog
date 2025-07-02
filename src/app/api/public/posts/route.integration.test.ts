import { validateQueryParams, searchSchema } from '@/lib/validation';

// Mock Prisma client
jest.mock('@/generated/prisma', () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      post: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 1,
            title: 'Test Post',
            content: 'Test content',
            excerpt: 'Test excerpt',
            featuredImage: null,
            published: true,
            createdAt: new Date().toISOString(),
            author: { name: 'Alice' },
            category: { id: 1, name: 'Tech' },
            tags: [{ id: 1, name: 'Next.js' }],
          },
        ]),
      },
    })),
  };
});

describe('Public Posts API Validation', () => {
  it('validates search parameters correctly', () => {
    const searchParams = new URLSearchParams('?search=test');
    const validation = validateQueryParams(searchParams, searchSchema);
    expect(validation.success).toBe(true);
    if (validation.success) {
      expect(validation.data.search).toBe('test');
    }
  });

  it('rejects invalid search parameters', () => {
    const searchParams = new URLSearchParams('?search=');
    const validation = validateQueryParams(searchParams, searchSchema);
    expect(validation.success).toBe(false);
  });

  it('handles missing search parameter gracefully', () => {
    const searchParams = new URLSearchParams();
    // Should not throw when search parameter is missing
    expect(() => {
      validateQueryParams(searchParams, searchSchema);
    }).not.toThrow();
  });
}); 