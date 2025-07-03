import { prisma } from '@/lib/database';

interface ScheduledPost {
  id: number;
  title: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  categoryId?: number;
  tagIds: number[];
  scheduledFor: Date;
  authorId: number;
  status: 'draft' | 'scheduled' | 'published';
}

class PostSchedulerService {
  // Schedule a post for future publication
  async schedulePost(postData: Omit<ScheduledPost, 'id' | 'status'>): Promise<ScheduledPost> {
    const post = await prisma.post.create({
      data: {
        title: postData.title,
        content: postData.content,
        excerpt: postData.excerpt,
        featuredImage: postData.featuredImage,
        categoryId: postData.categoryId,
        published: false,
        scheduledFor: postData.scheduledFor,
        authorId: postData.authorId,
        status: 'scheduled',
        tags: {
          connect: postData.tagIds.map(id => ({ id })),
        },
      },
      include: {
        category: true,
        tags: true,
        author: true,
      },
    });

    return {
      id: post.id,
      title: post.title,
      content: post.content,
      excerpt: post.excerpt || undefined,
      featuredImage: post.featuredImage || undefined,
      categoryId: post.categoryId || undefined,
      tagIds: post.tags.map(tag => tag.id),
      scheduledFor: post.scheduledFor!,
      authorId: post.authorId,
      status: post.status as 'draft' | 'scheduled' | 'published',
    };
  }

  // Get all scheduled posts
  async getScheduledPosts(): Promise<ScheduledPost[]> {
    const posts = await prisma.post.findMany({
      where: {
        status: 'scheduled',
        scheduledFor: {
          gte: new Date(),
        },
      },
      include: {
        category: true,
        tags: true,
        author: true,
      },
      orderBy: {
        scheduledFor: 'asc',
      },
    });

    return posts.map(post => ({
      id: post.id,
      title: post.title,
      content: post.content,
      excerpt: post.excerpt || undefined,
      featuredImage: post.featuredImage || undefined,
      categoryId: post.categoryId || undefined,
      tagIds: post.tags.map(tag => tag.id),
      scheduledFor: post.scheduledFor!,
      authorId: post.authorId,
      status: post.status as 'draft' | 'scheduled' | 'published',
    }));
  }

  // Get posts that should be published now
  async getPostsToPublish(): Promise<ScheduledPost[]> {
    const now = new Date();
    const posts = await prisma.post.findMany({
      where: {
        status: 'scheduled',
        scheduledFor: {
          lte: now,
        },
      },
      include: {
        category: true,
        tags: true,
        author: true,
      },
    });

    return posts.map(post => ({
      id: post.id,
      title: post.title,
      content: post.content,
      excerpt: post.excerpt || undefined,
      featuredImage: post.featuredImage || undefined,
      categoryId: post.categoryId || undefined,
      tagIds: post.tags.map(tag => tag.id),
      scheduledFor: post.scheduledFor!,
      authorId: post.authorId,
      status: post.status as 'draft' | 'scheduled' | 'published',
    }));
  }

  // Publish scheduled posts
  async publishScheduledPosts(): Promise<number> {
    const postsToPublish = await this.getPostsToPublish();
    let publishedCount = 0;

    for (const post of postsToPublish) {
      try {
        await prisma.post.update({
          where: { id: post.id },
          data: {
            published: true,
            status: 'published',
            publishedAt: new Date(),
          },
        });

        publishedCount++;
        console.log(`Published scheduled post: ${post.title}`);
      } catch (error) {
        console.error(`Failed to publish post ${post.id}:`, error);
      }
    }

    return publishedCount;
  }

  // Update scheduled post
  async updateScheduledPost(
    postId: number,
    updates: Partial<Omit<ScheduledPost, 'id' | 'authorId' | 'status'>>
  ): Promise<ScheduledPost> {
    const updateData: any = { ...updates };

    // Handle tag updates
    if (updates.tagIds) {
      updateData.tags = {
        set: updates.tagIds.map(id => ({ id })),
      };
      delete updateData.tagIds;
    }

    const post = await prisma.post.update({
      where: { id: postId },
      data: updateData,
      include: {
        category: true,
        tags: true,
        author: true,
      },
    });

    return {
      id: post.id,
      title: post.title,
      content: post.content,
      excerpt: post.excerpt || undefined,
      featuredImage: post.featuredImage || undefined,
      categoryId: post.categoryId || undefined,
      tagIds: post.tags.map(tag => tag.id),
      scheduledFor: post.scheduledFor!,
      authorId: post.authorId,
      status: post.status as 'draft' | 'scheduled' | 'published',
    };
  }

  // Cancel scheduled post
  async cancelScheduledPost(postId: number): Promise<void> {
    await prisma.post.update({
      where: { id: postId },
      data: {
        status: 'draft',
        scheduledFor: null,
      },
    });
  }

  // Get next scheduled post time
  async getNextScheduledTime(): Promise<Date | null> {
    const nextPost = await prisma.post.findFirst({
      where: {
        status: 'scheduled',
        scheduledFor: {
          gte: new Date(),
        },
      },
      orderBy: {
        scheduledFor: 'asc',
      },
      select: {
        scheduledFor: true,
      },
    });

    return nextPost?.scheduledFor || null;
  }

  // Check if a post can be scheduled
  canSchedulePost(scheduledFor: Date): boolean {
    const now = new Date();
    const minScheduledTime = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes from now

    return scheduledFor >= minScheduledTime;
  }

  // Get scheduling statistics
  async getSchedulingStats(): Promise<{
    totalScheduled: number;
    nextScheduled: Date | null;
    publishedToday: number;
  }> {
    const [totalScheduled, nextScheduled, publishedToday] = await Promise.all([
      prisma.post.count({
        where: {
          status: 'scheduled',
        },
      }),
      this.getNextScheduledTime(),
      prisma.post.count({
        where: {
          status: 'published',
          publishedAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
    ]);

    return {
      totalScheduled,
      nextScheduled,
      publishedToday,
    };
  }
}

export const postScheduler = new PostSchedulerService(); 