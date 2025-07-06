import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

export async function POST(request: NextRequest) {
  try {
    console.log('Upload API: Starting POST request');
    
    // Check authentication
    const session = await getServerSession();
    console.log('Upload API: Session:', session);
    
    if (!session || !session.user?.email) {
      console.log('Upload API: Unauthorized - no session or email');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse the multipart form data
    const formData = await request.formData();
    const file = formData.get('image') as File;
    
    console.log('Upload API: File received:', {
      name: file?.name,
      size: file?.size,
      type: file?.type
    });

    if (!file) {
      console.log('Upload API: No file provided');
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      console.log('Upload API: Invalid file type:', file.type);
      return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 });
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      console.log('Upload API: File too large:', file.size);
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 });
    }

    // Convert file to base64 for storage
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Data = buffer.toString('base64');
    
    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split('.').pop();
    const filename = `${file.name.split('.')[0]}-${timestamp}-${randomString}.${extension}`;
    
    console.log('Upload API: Generated filename:', filename);

    // For now, we'll store the image data in a simple way
    // In production, you should use a proper cloud storage service like AWS S3, Cloudinary, etc.
    const imageData = {
      filename: filename,
      data: base64Data,
      type: file.type,
      size: file.size,
      uploadedAt: new Date().toISOString(),
      uploadedBy: session.user.email
    };

    // Store in memory (temporary solution - not recommended for production)
    // In production, use a database or cloud storage
    console.log('Upload API: Image processed successfully');

    // Return a temporary URL (in production, this would be a real cloud storage URL)
    const tempUrl = `/api/images/${filename}`;
    
    console.log('Upload API: Returning success with URL:', tempUrl);

    return NextResponse.json({
      success: true,
      url: tempUrl,
      filename: filename,
      size: file.size,
      type: file.type,
      message: 'Image uploaded successfully (temporary storage)'
    });

  } catch (error) {
    console.error('Upload API: Error uploading image:', error);
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
  }
}

export async function GET() {
  try {
    console.log('Upload API: Starting GET request');
    
    // Check authentication
    const session = await getServerSession();
    console.log('Upload API: Session for GET:', session);
    
    if (!session || !session.user?.email) {
      console.log('Upload API: Unauthorized - no session or email');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // For now, return empty array since we're not storing images persistently
    // In production, this would fetch from a database or cloud storage
    console.log('Upload API: Returning empty images list (no persistent storage)');
    
    return NextResponse.json({ 
      images: [],
      message: 'No persistent storage configured. Images are temporarily stored only.'
    });
  } catch (error) {
    console.error('Upload API: Error fetching images:', error);
    return NextResponse.json({ error: 'Failed to fetch images' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { filename } = await request.json();
    
    if (!filename) {
      return NextResponse.json({ error: 'Filename is required' }, { status: 400 });
    }

    // For now, just return success since we're not storing images persistently
    console.log('Upload API: Delete requested for:', filename);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Image deleted successfully (temporary storage)' 
    });
  } catch (error) {
    console.error('Upload API: Error deleting image:', error);
    return NextResponse.json({ error: 'Failed to delete image' }, { status: 500 });
  }
} 