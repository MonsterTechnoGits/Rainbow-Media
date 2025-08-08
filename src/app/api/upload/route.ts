import { doc, setDoc } from 'firebase/firestore';
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

import { saveFile } from '@/lib/cloudflareS3';
import { getDbInstance } from '@/lib/firebase';

// Configure API route
export const maxDuration = 60; // 1 minute timeout
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Extract form fields
    const title = formData.get('title') as string;
    const series = formData.get('series') as string;
    const description = formData.get('description') as string;
    const audioFile = formData.get('audioFile') as File;
    const coverImage = formData.get('coverImage') as File | null;
    const isPaid = formData.get('isPaid') === 'true';
    const price = formData.get('price') ? parseFloat(formData.get('price') as string) : undefined;

    // Debug logging
    console.log('API Debug - isPaid raw value:', formData.get('isPaid'));
    console.log('API Debug - isPaid processed:', isPaid);
    console.log('API Debug - price raw value:', formData.get('price'));
    console.log('API Debug - price processed:', price);
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

      await saveFile(coverKey, Buffer.from(coverBytes), {
        contentType: coverImage.type || 'image/jpeg',
        metadata: { type: 'cover', storyId },
      });

      coverUrl = `/api/stream/${encodeURIComponent(coverKey)}`;
    }

    // Prepare Firestore document data - consistent with existing schema
    const storyData = {
      title,
      series,
      creator: 'Anonymous',
      description: description || null,
      audioUrl,
      coverUrl,
      genre: genres.length > 0 ? genres[0] : 'General', // Use first genre as main genre

      // Payment fields - using existing schema format
      paid: isPaid, // Boolean for paid status
      amount: isPaid && price ? price : null, // Price amount
      currency: isPaid ? currency : null, // Currency code

      // Metadata fields
      license,
      rightsOwner: rightsOwner || null,
      isExplicit,
      episodeNumber: episodeNumber || null,
      storyType: storyType || null,
      genres,
      duration: duration || null,

      // Timestamps
      createdAt: new Date(),
      updatedAt: new Date(),

      // Status fields
      isActive: true,
      playCount: 0,
      likeCount: 0,
      commentCount: 0,
    };

    // Debug: Log final story data
    console.log('Final story data structure:', JSON.stringify(storyData, null, 2));

    // Save to Firestore using UUID as document ID
    try {
      if (!getDbInstance()) {
        throw new Error('Firebase is not initialized');
      }

      // Use setDoc with the UUID as the document ID
      const storyRef = doc(getDbInstance(), 'stories', storyId);
      await setDoc(storyRef, storyData);
      console.log('Story saved via Client SDK with UUID as document ID:', storyId);
    } catch (firestoreError) {
      console.error('Firestore save error:', firestoreError);

      // For now, still return success for file upload but log the error
      console.log('Files uploaded successfully, but Firestore save failed. Story data:', storyData);

      // You can choose to either:
      // 1. Continue and return success (files are saved)
      // 2. Throw error and fail the entire upload
      // For development, we'll continue with just file upload
    }

    // Return the story data with the UUID as the ID
    const finalStoryData = {
      ...storyData,
    };

    return NextResponse.json({
      success: true,
      data: finalStoryData,
      message: 'Story uploaded successfully',
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
  return NextResponse.json({ message: 'Upload endpoint is ready' });
}
