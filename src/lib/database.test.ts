import { database } from './database';

// Mock Prisma client
jest.mock('@/generated/prisma', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    post: {
      findMany: jest.fn().mockResolvedValue([
        {
          id: 1,
          title: 'Test Post',
          content: 'Test content',
          published: true,
          createdAt: new Date(),
          author: { name: 'Test Author' },
          category: { name: 'Test Category' },
          tags: [{ name: 'Test Tag' }],
        },
      ]),
      count: jest.fn().mockResolvedValue(1),
      deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
    },
    comment: {
      findMany: jest.fn().mockResolvedValue([
        {
          id: 1,
          content: 'Test comment',
          approved: true,
          createdAt: new Date(),
        },
      ]),
      deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
    },
    user: {
      findUnique: jest.fn().mockResolvedValue({
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
      }),
    },
    $transaction: jest.fn().mockImplementation((callback) => callback({
      post: {
        create: jest.fn().mockResolvedValue({
          id: 1,
          title: 'Test Post',
        }),
      },
    })),
  })),
}));

describe('Database Optimization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getPosts', () => {
    it('should get posts with default options', async () => {
      const posts = await database.getPosts();
      expect(posts).toHaveLength(1);
      expect(posts[0].title).toBe('Test Post');
    });

    it('should get posts with custom options', async () => {
      const posts = await database.getPosts({
        published: true,
        limit: 5,
        offset: 0,
        includeAuthor: true,
        includeCategory: false,
        includeTags: false,
      });
      expect(posts).toHaveLength(1);
    });
  });

  describe('searchPosts', () => {
    it('should search posts with query', async () => {
      const posts = await database.searchPosts('test', {
        published: true,
        limit: 10,
      });
      expect(posts).toHaveLength(1);
    });
  });

  describe('getComments', () => {
    it('should get comments for a post', async () => {
      const comments = await database.getComments(1, {
        approved: true,
        limit: 20,
      });
      expect(comments).toHaveLength(1);
    });
  });

  describe('getPostCount', () => {
    it('should get post count', async () => {
      const count = await database.getPostCount({ published: true });
      expect(count).toBe(1);
    });
  });

  describe('getUserWithStats', () => {
    it('should get user with statistics', async () => {
      const user = await database.getUserWithStats(1);
      expect(user).toHaveProperty('stats');
      expect(user.stats).toHaveProperty('totalPosts');
      expect(user.stats).toHaveProperty('publishedPosts');
      expect(user.stats).toHaveProperty('draftPosts');
    });
  });

  describe('batchCreatePosts', () => {
    it('should create multiple posts in batch', async () => {
      const posts = [
        {
          title: 'Post 1',
          content: 'Content 1',
          published: true,
          authorId: 1,
        },
        {
          title: 'Post 2',
          content: 'Content 2',
          published: false,
          authorId: 1,
        },
      ];

      const createdPosts = await database.batchCreatePosts(posts);
      expect(createdPosts).toHaveLength(2);
    });
  });

  describe('cleanupOldData', () => {
    it('should cleanup old data', async () => {
      const result = await database.cleanupOldData({
        deleteOldDrafts: true,
        deleteOldComments: true,
        daysThreshold: 30,
      });
      expect(result).toHaveProperty('deletedDrafts');
      expect(result).toHaveProperty('deletedComments');
    });
  });
}); 