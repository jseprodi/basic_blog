import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

// Helper function to ensure uploads directory exists
async function ensureUploadsDir() {
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  console.log('Uploads directory path:', uploadsDir);
  
  try {
    if (!existsSync(uploadsDir)) {
      console.log('Creating uploads directory...');
      await mkdir(uploadsDir, { recursive: true });
    }
    
    // Verify the directory is writable
    const testFile = path.join(uploadsDir, '.test');
    await writeFile(testFile, 'test');
    await import('fs/promises').then(fs => fs.unlink(testFile));
    console.log('Uploads directory is writable');
    
    return uploadsDir;
  } catch (error) {
    console.error('Error ensuring uploads directory:', error);
    throw new Error('Failed to create or access uploads directory');
  }
}

// Helper function to generate unique filename
function generateUniqueFilename(originalname: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = path.extname(originalname);
  const nameWithoutExt = path.basename(originalname, extension);
  return `${nameWithoutExt}-${timestamp}-${randomString}${extension}`;
}

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

    // Ensure uploads directory exists
    const uploadsDir = await ensureUploadsDir();

    // Generate unique filename
    const filename = generateUniqueFilename(file.name);
    const filepath = path.join(uploadsDir, filename);
    
    console.log('Upload API: Saving file to:', filepath);

    try {
      // Convert file to buffer and save
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filepath, buffer);
      
      console.log('Upload API: File saved successfully');

      // Return the public URL
      const publicUrl = `/uploads/${filename}`;
      
      console.log('Upload API: Returning success with URL:', publicUrl);

      return NextResponse.json({
        success: true,
        url: publicUrl,
        filename: filename,
        size: file.size,
        type: file.type,
      });
    } catch (writeError) {
      console.error('Upload API: Error writing file:', writeError);
      return NextResponse.json({ error: 'Failed to save image file' }, { status: 500 });
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

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    console.log('Upload API: Checking uploads directory:', uploadsDir);
    
    if (!existsSync(uploadsDir)) {
      console.log('Upload API: Uploads directory does not exist');
      return NextResponse.json({ images: [] });
    }

    // For now, return a simple list
    // In a production app, you might want to store image metadata in the database
    const { readdir } = await import('fs/promises');
    const files = await readdir(uploadsDir);
    console.log('Upload API: Found files:', files);
    
    const images = files
      .filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))
      .map(file => ({
        filename: file,
        url: `/uploads/${file}`,
        uploadedAt: new Date().toISOString(), // In production, get this from database
      }));

    console.log('Upload API: Returning images:', images);
    return NextResponse.json({ images });
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

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    const filepath = path.join(uploadsDir, filename);

    // Validate filename to prevent directory traversal
    if (!/^[a-zA-Z0-9._-]+$/.test(filename)) {
      return NextResponse.json({ error: 'Invalid filename' }, { status: 400 });
    }

    if (!existsSync(filepath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Delete the file
    const { unlink } = await import('fs/promises');
    await unlink(filepath);

    return NextResponse.json({ success: true, message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Error deleting image:', error);
    return NextResponse.json({ error: 'Failed to delete image' }, { status: 500 });
  }
} 