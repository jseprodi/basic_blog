import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { put, list } from '@vercel/blob';

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

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split('.').pop();
    const filename = `uploads/${file.name.split('.')[0]}-${timestamp}-${randomString}.${extension}`;
    
    console.log('Upload API: Generated filename:', filename);

    try {
      // Convert file to buffer
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      // Upload to Vercel Blob Storage
      console.log('Upload API: Uploading to Vercel Blob Storage...');
      const { url } = await put(filename, buffer, { 
        access: 'public',
        contentType: file.type
      });
      
      console.log('Upload API: Upload successful, blob URL:', url);

      return NextResponse.json({
        success: true,
        url: url,
        filename: filename,
        size: file.size,
        type: file.type,
        message: 'Image uploaded successfully to Vercel Blob Storage'
      });

    } catch (blobError) {
      console.error('Upload API: Blob storage error:', blobError);
      return NextResponse.json({ 
        error: 'Failed to upload image to storage',
        details: blobError instanceof Error ? blobError.message : 'Unknown error'
      }, { status: 500 });
    }

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

    try {
      // List images from Vercel Blob Storage
      console.log('Upload API: Listing images from Blob Storage...');
      const { blobs } = await list({ 
        prefix: 'uploads/',
        limit: 100 
      });
      
      console.log('Upload API: Found blobs:', blobs.length);
      
      const images = blobs
        .filter(blob => /\.(jpg|jpeg|png|gif|webp)$/i.test(blob.pathname))
        .map(blob => ({
          filename: blob.pathname.split('/').pop() || blob.pathname,
          url: blob.url,
          uploadedAt: blob.uploadedAt,
          size: blob.size
        }));

      console.log('Upload API: Returning images:', images.length);
      return NextResponse.json({ 
        images,
        message: `Found ${images.length} images in Vercel Blob Storage`
      });
      
    } catch (listError) {
      console.error('Upload API: Error listing images:', listError);
      return NextResponse.json({ 
        images: [],
        message: 'Failed to list images from Blob Storage',
        error: listError instanceof Error ? listError.message : 'Unknown error'
      });
    }
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

    // For now, just return success since we need to implement deletion from Blob Storage
    console.log('Upload API: Delete requested for:', filename);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Image deletion from Blob Storage not yet implemented'
    });
  } catch (error) {
    console.error('Upload API: Error deleting image:', error);
    return NextResponse.json({ error: 'Failed to delete image' }, { status: 500 });
  }
} 