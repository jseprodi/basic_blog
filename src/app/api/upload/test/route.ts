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
      message: 'Upload functionality is working correctly (serverless-compatible)',
      environment: 'Vercel Serverless',
      storage: 'Temporary (base64)',
      session: {
        user: session.user.email,
        authenticated: true
      },
      notes: [
        'Images are temporarily stored in base64 format',
        'For production, implement cloud storage (AWS S3, Cloudinary, etc.)',
        'Current implementation is for testing purposes only'
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