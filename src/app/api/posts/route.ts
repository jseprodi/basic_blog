import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@/generated/prisma';
import { validateRequestBody, createPostSchema, sanitizeHtml } from '@/lib/validation';
import { reportError, addBreadcrumb } from '@/lib/error-reporting';

const prisma = new PrismaClient();

export async function GET() {
  let session;
  try {
    addBreadcrumb('API Request', 'posts.get', { endpoint: '/api/posts' });
    
    session = await getServerSession();
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const posts = await prisma.post.findMany({
      where: {
        author: {
          email: session.user.email,
        },
      },
      include: {
        category: true,
        tags: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(posts);
  } catch (error) {
    reportError(error as Error, {
      endpoint: '/api/posts',
      method: 'GET',
      userId: session?.user?.email,
    });
    console.error('Error fetching posts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate request body
    const validation = await validateRequestBody(request, createPostSchema);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { title, content, excerpt, featuredImage, published, categoryId, tagIds = [] } = validation.data;

    // Sanitize HTML content
    const sanitizedContent = sanitizeHtml(content);
    const sanitizedExcerpt = excerpt ? sanitizeHtml(excerpt) : undefined;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Validate category exists if provided
    if (categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: categoryId },
      });
      if (!category) {
        return NextResponse.json({ error: 'Category not found' }, { status: 400 });
      }
    }

    // Validate tags exist if provided
    if (tagIds && tagIds.length > 0) {
      const tags = await prisma.tag.findMany({
        where: { id: { in: tagIds } },
      });
      if (tags.length !== tagIds.length) {
        return NextResponse.json({ error: 'One or more tags not found' }, { status: 400 });
      }
    }

    const post = await prisma.post.create({
      data: {
        title,
        content: sanitizedContent,
        excerpt: sanitizedExcerpt,
        featuredImage,
        published,
        authorId: user.id,
        categoryId: categoryId || null,
        tags: {
          connect: tagIds.map((id: number) => ({ id })),
        },
      },
      include: {
        category: true,
        tags: true,
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 