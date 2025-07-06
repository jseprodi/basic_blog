import { NextRequest, NextResponse } from 'next/server';
import { validateQueryParams, searchSchema } from '@/lib/validation';
import { database } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    console.log('GET /api/public/posts called');
    
    const { searchParams } = new URL(request.url);
    
    // Validate search parameter if provided
    if (searchParams.has('search')) {
      const validation = validateQueryParams(searchParams, searchSchema);
      if (!validation.success) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }
    }
    
    const search = searchParams.get('search');
    console.log('Search query:', search);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const whereClause: any = {
      published: true,
    };

    if (search) {
      whereClause.OR = [
        {
          title: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          content: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          excerpt: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          tags: {
            some: {
              name: {
                contains: search,
                mode: 'insensitive',
              },
            },
          },
        },
        {
          category: {
            name: {
              contains: search,
              mode: 'insensitive',
            },
          },
        },
      ];
    }

    console.log('Fetching posts with whereClause:', whereClause);
    const posts = await database.searchPosts(search || '', {
      published: true,
      limit: 50,
    });

    console.log('Found posts:', posts.length);
    console.log('Posts:', posts.map(p => ({ id: p.id, title: p.title, published: p.published })));

    return NextResponse.json(posts);
  } catch (error) {
    console.error('Error fetching public posts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 