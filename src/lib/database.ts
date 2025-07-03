import { PrismaClient } from '@/generated/prisma';

// Global prisma instance with connection pooling
declare global {
  var __prisma: PrismaClient | undefined;
}

export const prisma = globalThis.__prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma;
}

// Optimized query functions
export const database = {
  // Get posts with optimized includes
  async getPosts(options: {
    published?: boolean;
    authorId?: number;
    categoryId?: number;
    limit?: number;
    offset?: number;
    includeAuthor?: boolean;
    includeCategory?: boolean;
    includeTags?: boolean;
  } = {}) {
    const {
      published,
      authorId,
      categoryId,
      limit = 10,
      offset = 0,
      includeAuthor = true,
      includeCategory = true,
      includeTags = true,
    } = options;

    const where: any = {};
    if (published !== undefined) where.published = published;
    if (authorId) where.authorId = authorId;
    if (categoryId) where.categoryId = categoryId;

    const include: any = {};
    if (includeAuthor) include.author = { select: { name: true, email: true } };
    if (includeCategory) include.category = { select: { id: true, name: true, slug: true } };
    if (includeTags) include.tags = { select: { id: true, name: true, slug: true } };

    return prisma.post.findMany({
      where,
      include,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
  },

  // Get posts with search optimization
  async searchPosts(search: string, options: {
    published?: boolean;
    limit?: number;
    offset?: number;
  } = {}) {
    const { published = true, limit = 10, offset = 0 } = options;

    return prisma.post.findMany({
      where: {
        published,
        OR: [
          { title: { contains: search } },
          { content: { contains: search } },
          { excerpt: { contains: search } },
          { tags: { some: { name: { contains: search } } } },
          { category: { name: { contains: search } } },
        ],
      },
      include: {
        author: { select: { name: true } },
        category: { select: { name: true } },
        tags: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
  },

  // Get comments with optimization
  async getComments(postId: number, options: {
    approved?: boolean;
    limit?: number;
    offset?: number;
  } = {}) {
    const { approved = true, limit = 50, offset = 0 } = options;

    return prisma.comment.findMany({
      where: {
        postId,
        approved,
      },
      include: {
        user: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
  },

  // Get post count for pagination
  async getPostCount(options: {
    published?: boolean;
    authorId?: number;
    categoryId?: number;
  } = {}) {
    const { published, authorId, categoryId } = options;

    const where: any = {};
    if (published !== undefined) where.published = published;
    if (authorId) where.authorId = authorId;
    if (categoryId) where.categoryId = categoryId;

    return prisma.post.count({ where });
  },

  // Get user with posts count
  async getUserWithStats(userId: number) {
    const [user, postsCount, publishedPostsCount] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true },
      }),
      prisma.post.count({ where: { authorId: userId } }),
      prisma.post.count({ where: { authorId: userId, published: true } }),
    ]);

    return {
      ...user,
      stats: {
        totalPosts: postsCount,
        publishedPosts: publishedPostsCount,
        draftPosts: postsCount - publishedPostsCount,
      },
    };
  },

  // Batch operations for better performance
  async batchCreatePosts(posts: Array<{
    title: string;
    content: string;
    excerpt?: string;
    featuredImage?: string;
    published: boolean;
    authorId: number;
    categoryId?: number;
    tagIds?: number[];
  }>) {
    return prisma.$transaction(async (tx) => {
      const createdPosts = [];
      
      for (const post of posts) {
        const { tagIds, ...postData } = post;
        const createdPost = await tx.post.create({
          data: {
            ...postData,
            tags: tagIds ? { connect: tagIds.map(id => ({ id })) } : undefined,
          },
          include: {
            category: true,
            tags: true,
          },
        });
        createdPosts.push(createdPost);
      }
      
      return createdPosts;
    });
  },

  // Cleanup old data
  async cleanupOldData(options: {
    deleteOldDrafts?: boolean;
    deleteOldComments?: boolean;
    daysThreshold?: number;
  } = {}) {
    const { deleteOldDrafts = false, deleteOldComments = false, daysThreshold = 30 } = options;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysThreshold);

    const results: any = {};

    if (deleteOldDrafts) {
      results.deletedDrafts = await prisma.post.deleteMany({
        where: {
          published: false,
          updatedAt: { lt: cutoffDate },
        },
      });
    }

    if (deleteOldComments) {
      results.deletedComments = await prisma.comment.deleteMany({
        where: {
          approved: false,
          createdAt: { lt: cutoffDate },
        },
      });
    }

    return results;
  },
};

// Connection management
export async function disconnect() {
  await prisma.$disconnect();
}

// Graceful shutdown
process.on('beforeExit', async () => {
  await disconnect();
}); 