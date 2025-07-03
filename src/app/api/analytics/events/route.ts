import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data, timestamp, session_id } = body;

    // Validate the data
    if (!type || !data || !timestamp || !session_id) {
      return NextResponse.json({ error: 'Invalid analytics data' }, { status: 400 });
    }

    // Get user ID if authenticated
    let userId: number | null = null;
    try {
      const session = await getServerSession(authOptions);
      if (session?.user?.email) {
        const user = await prisma.user.findUnique({
          where: { email: session.user.email },
          select: { id: true },
        });
        userId = user?.id || null;
      }
    } catch (error) {
      // Continue without user ID if session check fails
    }

    // Store analytics data
    await prisma.analyticsEvent.create({
      data: {
        type,
        data: JSON.stringify(data),
        timestamp: new Date(timestamp),
        sessionId: session_id,
        userAgent: request.headers.get('user-agent') || null,
        ip: request.headers.get('x-forwarded-for') || null,
        userId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing analytics event:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 