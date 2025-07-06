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
    console.log('POST /api/posts called');
    
    const session = await getServerSession();
    console.log('Session:', session ? { email: session.user?.email } : 'No session');
    
    if (!session || !session.user?.email) {
      console.log('Unauthorized access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate request body
    console.log('Validating request body...');
    const validation = await validateRequestBody(request, createPostSchema);
    if (!validation.success) {
      console.log('Validation failed:', validation.error);
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }
    console.log('Validation passed');

    const { title, content, excerpt, featuredImage, published, categoryId, tagIds = [] } = validation.data;
    console.log('Request data:', { title, content: content.substring(0, 100) + '...', excerpt, featuredImage, published, categoryId, tagIds });

    // Sanitize HTML content
    const sanitizedContent = sanitizeHtml(content);
    const sanitizedExcerpt = excerpt ? sanitizeHtml(excerpt) : undefined;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    console.log('User found:', user ? { id: user.id, email: user.email } : 'User not found');

    if (!user) {
      console.log('User not found in database');
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Validate category exists if provided
    if (categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: categoryId },
      });
      console.log('Category validation:', category ? 'Found' : 'Not found');
      if (!category) {
        return NextResponse.json({ error: 'Category not found' }, { status: 400 });
      }
    }

    // Validate tags exist if provided
    if (tagIds && tagIds.length > 0) {
      const tags = await prisma.tag.findMany({
        where: { id: { in: tagIds } },
      });
      console.log('Tags validation:', { requested: tagIds, found: tags.length });
      if (tags.length !== tagIds.length) {
        return NextResponse.json({ error: 'One or more tags not found' }, { status: 400 });
      }
    }

    console.log('Creating post in database...');
    const post = await prisma.post.create({
      data: {
        title,
        content: sanitizedContent,
        excerpt: sanitizedExcerpt,
        featuredImage: featuredImage && featuredImage.trim() ? featuredImage : null,
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

    console.log('Post created successfully:', { id: post.id, title: post.title });
    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 