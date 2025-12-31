import { NextRequest, NextResponse } from 'next/server';
import { analyzeFile } from '@/lib/dataAnalyzer';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    console.log('File received:', {
      name: file.name,
      type: file.type,
      size: file.size
    });

    // Analyze the file directly - the analyzeFile function will handle the conversion
    const analysisResult = await analyzeFile(file);

    // Add file info to prove it's analyzing the actual uploaded file
    const resultWithFileInfo = {
      ...analysisResult,
      fileInfo: {
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: file.lastModified
      }
    };

    return NextResponse.json(resultWithFileInfo);
  } catch (error: any) {
    console.error('Error analyzing file:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to analyze file',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

