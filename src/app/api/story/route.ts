import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

import { saveFile } from '@/lib/cloudflareS3';
import { getDbInstance } from '@/lib/firebase';
import { verifyToken } from '@/lib/verifyToken';
import { FirestoreStoryService } from '@/services/firestore-stories';

// Configure API route
export const maxDuration = 60; // 1 minute timeout
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const { decodedToken, authUser, error } = await verifyToken(request);

    if (error || !decodedToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();

    // Extract form fields
    const edit = formData.get('edit') === 'true'; // Flag to determine create vs update
    const storyId = edit ? (formData.get('storyId') as string) : uuidv4();
    const title = formData.get('title') as string;
    const series = formData.get('series') as string;
    const description = formData.get('description') as string;
    const audioFile = formData.get('audioFile') as File | null;
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
    const creator = formData.get('creator') as string;

    // Validate required fields
    if (!title || !series) {
      return NextResponse.json(
        { error: 'Missing required fields: title and series' },
        { status: 400 }
      );
    }

    // For edit mode, validate storyId
    if (edit && !storyId) {
      return NextResponse.json({ error: 'Story ID is required for updates' }, { status: 400 });
    }

    // For create mode, require audio file
    if (!edit && !audioFile) {
      return NextResponse.json(
        { error: 'Audio file is required for new stories' },
        { status: 400 }
      );
    }

    // Check if user has permission to edit (admin or story owner)
    if (edit) {
      const existingStory = await FirestoreStoryService.getStoryById(storyId);
      if (!existingStory) {
        return NextResponse.json({ error: 'Story not found' }, { status: 404 });
      }

      // Check permissions - only admin or story creator can edit
      if (!authUser?.isAdmin && existingStory.creator !== decodedToken.email) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
      }
    }

    let audioUrl: string | undefined;
    let coverUrl: string | null = null;

    // Handle audio file upload (for new stories or when audio is being updated)
    if (audioFile) {
      const audioBytes = await audioFile.arrayBuffer();
      const audioExtension = audioFile.name.split('.').pop() || 'mp3';
      const audioKey = `audio/${storyId}.${audioExtension}`;

      await saveFile(audioKey, Buffer.from(audioBytes), {
        contentType: audioFile.type || 'audio/mpeg',
        metadata: { type: 'audio', storyId },
      });

      audioUrl = `/api/stream/${encodeURIComponent(audioKey)}`;
    }

    // Handle cover image upload (optional)
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

    // Prepare story data
    const storyData = {
      title,
      series,
      creator: creator || decodedToken.email || 'Anonymous',
      description: description || null,
      ...(audioUrl && { audioUrl }), // Only include audioUrl if it's being updated
      ...(coverUrl && { coverUrl }), // Only include coverUrl if it's being updated
      genre: genres.length > 0 ? genres[0] : 'General',

      // Payment fields
      paid: isPaid,
      amount: isPaid && price ? price : null,
      currency: isPaid ? currency : null,

      // Metadata fields
      license: license || null,
      rightsOwner: rightsOwner || null,
      isExplicit,
      episodeNumber: episodeNumber || null,
      storyType: storyType || null,
      genres,
      duration: duration || null,

      // Timestamps
      ...(edit ? { updatedAt: new Date() } : { createdAt: new Date(), updatedAt: new Date() }),

      // Status fields (only for new stories)
      ...(!edit && {
        isActive: true,
        playCount: 0,
        likeCount: 0,
        commentCount: 0,
      }),
    };

    let finalStoryData;

    try {
      if (!getDbInstance()) {
        throw new Error('Firebase is not initialized');
      }

      if (edit) {
        // Update existing story - direct update for now
        const storyRef = doc(getDbInstance(), 'stories', storyId);
        await updateDoc(storyRef, storyData);
        finalStoryData = { id: storyId, ...storyData };
        console.log('Story updated successfully:', storyId);
      } else {
        // Create new story
        const storyRef = doc(getDbInstance(), 'stories', storyId);
        await setDoc(storyRef, storyData);
        finalStoryData = { id: storyId, ...storyData };
        console.log('Story created successfully:', storyId);
      }
    } catch (firestoreError) {
      console.error('Firestore operation error:', firestoreError);
      return NextResponse.json(
        {
          error: edit ? 'Failed to update story' : 'Failed to create story',
          details: firestoreError instanceof Error ? firestoreError.message : 'Unknown error',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: finalStoryData,
      message: edit ? 'Story updated successfully' : 'Story created successfully',
    });
  } catch (error) {
    console.error('Story API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to process story request',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Unified Story API endpoint is ready',
    usage: {
      create: 'POST with edit=false (default) and required files',
      update: 'POST with edit=true and storyId',
    },
  });
}
