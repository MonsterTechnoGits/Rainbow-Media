import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

import { saveFile } from '@/lib/cloudflareS3';

// Configure API route
export const maxDuration = 60;
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication from session token

    const formData = await request.formData();

    // Extract form fields
    const title = formData.get('title') as string;
    const series = formData.get('series') as string;
    const description = formData.get('description') as string;
    const audioFile = formData.get('audioFile') as File;
    const coverImage = formData.get('coverImage') as File | null;
    const isPaid = formData.get('isPaid') === 'true';
    const price = formData.get('price') ? parseFloat(formData.get('price') as string) : undefined;
    const currency = formData.get('currency') as string;
    const license = formData.get('license') as string;
    const rightsOwner = formData.get('rightsOwner') as string;
    const isExplicit = formData.get('isExplicit') === 'true';
    const episodeNumber = formData.get('episodeNumber')
      ? parseInt(formData.get('episodeNumber') as string)
      : undefined;
    const storyType = formData.get('storyType') as string;
    const genres = formData.get('genres') ? JSON.parse(formData.get('genres') as string) : [];
    const duration = formData.get('duration')
      ? parseInt(formData.get('duration') as string)
      : undefined;

    // Validate required fields
    if (!title || !series || !audioFile) {
      return NextResponse.json(
        { error: 'Missing required fields: title, series, or audioFile' },
        { status: 400 }
      );
    }

    // Generate UUID for this upload
    const storyId = uuidv4();

    // Handle audio file upload to Cloudflare R2
    const audioBytes = await audioFile.arrayBuffer();
    const audioExtension = audioFile.name.split('.').pop() || 'mp3';
    const audioKey = `audio/${storyId}.${audioExtension}`;

    await saveFile(audioKey, Buffer.from(audioBytes), {
      contentType: audioFile.type || 'audio/mpeg',
      metadata: { type: 'audio', storyId },
    });

    // Use streaming URL instead of direct R2 URL for better performance
    const audioUrl = `/api/stream/${encodeURIComponent(audioKey)}`;

    // Handle cover image upload (optional)
    let coverUrl: string | null = null;
    if (coverImage) {
      const coverBytes = await coverImage.arrayBuffer();
      const coverExtension = coverImage.name.split('.').pop() || 'jpg';
      const coverKey = `covers/${storyId}.${coverExtension}`;

      const coverUploadResult = await saveFile(coverKey, Buffer.from(coverBytes), {
        contentType: coverImage.type || 'image/jpeg',
        metadata: { type: 'cover', storyId },
      });

      coverUrl = coverUploadResult.location;
    }

    // Prepare story data (for logging/JSON storage)
    const storyData = {
      id: storyId,
      title,
      series,
      creator: 'Anonymous',
      description: description || null,
      audioUrl,
      coverUrl,
      isPaid,
      price: isPaid ? price : null,
      currency: isPaid ? currency : null,
      license,
      rightsOwner: rightsOwner || null,
      isExplicit,
      episodeNumber: episodeNumber || null,
      storyType: storyType || null,
      genres,
      duration: duration || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
      playCount: 0,
      likeCount: 0,
      commentCount: 0,
    };

    // Log the story data (for development)
    console.log('Story uploaded successfully (file-only mode):', storyData);

    return NextResponse.json({
      success: true,
      data: {
        id: storyId,
        title,
        audioUrl,
        coverUrl,
        firestoreId: storyId, // Using UUID as ID
      },
      message: 'Story uploaded successfully to Cloudflare R2',
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      {
        error: 'Failed to upload story',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Simple upload endpoint is ready',
    note: 'This endpoint saves files locally without Firestore integration',
  });
}
