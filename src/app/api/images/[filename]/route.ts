import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const { filename } = params;
    
    console.log('Image API: Requested filename:', filename);
    
    // For now, return a placeholder image since we're not storing images persistently
    // In production, this would serve the actual image from cloud storage
    
    // Return a simple placeholder response
    return new NextResponse(
      `<svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f0f0f0"/>
        <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#666" font-family="Arial" font-size="14">
          Image: ${filename}
        </text>
        <text x="50%" y="70%" text-anchor="middle" dy=".3em" fill="#999" font-family="Arial" font-size="12">
          (Temporary storage)
        </text>
      </svg>`,
      {
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      }
    );
  } catch (error) {
    console.error('Image API: Error serving image:', error);
    return NextResponse.json({ error: 'Failed to serve image' }, { status: 500 });
  }
} 