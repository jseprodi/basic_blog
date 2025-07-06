import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

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

    // Test uploads directory
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    console.log('Upload Test: Checking uploads directory:', uploadsDir);
    
    const dirExists = existsSync(uploadsDir);
    console.log('Upload Test: Directory exists:', dirExists);
    
    if (!dirExists) {
      try {
        await mkdir(uploadsDir, { recursive: true });
        console.log('Upload Test: Created uploads directory');
      } catch (error) {
        console.error('Upload Test: Failed to create directory:', error);
        return NextResponse.json({ 
          error: 'Failed to create uploads directory',
          details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
      }
    }

    // Test write permissions
    try {
      const testFile = path.join(uploadsDir, 'test.txt');
      await writeFile(testFile, 'test');
      await import('fs/promises').then(fs => fs.unlink(testFile));
      console.log('Upload Test: Write permissions OK');
    } catch (error) {
      console.error('Upload Test: Write permission test failed:', error);
      return NextResponse.json({ 
        error: 'No write permissions to uploads directory',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 });
    }

    // List existing files
    const { readdir } = await import('fs/promises');
    const files = await readdir(uploadsDir);
    const imageFiles = files.filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file));
    
    console.log('Upload Test: Found image files:', imageFiles);

    return NextResponse.json({
      success: true,
      message: 'Upload functionality is working correctly',
      uploadsDir,
      dirExists,
      writePermissions: true,
      existingImages: imageFiles.length,
      session: {
        user: session.user.email,
        authenticated: true
      }
    });

  } catch (error) {
    console.error('Upload Test: Error:', error);
    return NextResponse.json({ 
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 