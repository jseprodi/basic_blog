import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, value, rating, delta, id } = body;

    // Validate the data
    if (!name || typeof value !== 'number' || !rating || !id) {
      return NextResponse.json({ error: 'Invalid web vitals data' }, { status: 400 });
    }

    // Store web vitals data
    await prisma.webVitals.create({
      data: {
        name,
        value,
        rating,
        delta: delta || 0,
        eventId: id,
        sessionId: body.sessionId || 'unknown',
        userAgent: request.headers.get('user-agent') || null,
        url: request.headers.get('referer') || null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing web vitals:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 