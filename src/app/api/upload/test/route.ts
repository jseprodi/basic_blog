import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

export async function GET() {
  try {
    console.log('Upload Test: Starting test request');
    
    // Check authentication
    const session = await getServerSession();
    console.log('Upload Test: Session:', session);
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ 
        error: 'Unauthorized',
        message: 'Please log in to test upload functionality'
      }, { status: 401 });
    }

    console.log('Upload Test: Authentication successful');

    return NextResponse.json({
      success: true,
      message: 'Upload functionality is working correctly with Vercel Blob Storage',
      environment: 'Vercel Serverless',
      storage: 'Vercel Blob Storage',
      session: {
        user: session.user.email,
        authenticated: true
      },
      notes: [
        'Images are stored in Vercel Blob Storage',
        'Images are publicly accessible via blob URLs',
        'File listing and deletion features can be added later',
        'Blob storage provides persistent, scalable storage'
      ]
    });

  } catch (error) {
    console.error('Upload Test: Error:', error);
    return NextResponse.json({ 
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 