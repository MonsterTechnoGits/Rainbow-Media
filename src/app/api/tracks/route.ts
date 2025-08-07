import { NextRequest, NextResponse } from 'next/server';

import { FirestoreTrackService } from '@/services/firestore-tracks';

// GET /api/tracks - Get all tracks with optional search and user likes
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const limit = searchParams.get('limit');
    const userId = searchParams.get('userId'); // For authenticated requests

    const limitNum = limit ? parseInt(limit) : 20;

    let result;

    if (userId) {
      // Get tracks with user's like status (2 reads: tracks + user-likes)
      result = await FirestoreTrackService.getTracksWithLikes(userId, {
        limit: limitNum,
        search: query || undefined,
      });
    } else {
      // Get tracks without like status (1 read: tracks only)
      result = await FirestoreTrackService.getTracks({
        limit: limitNum,
        search: query || undefined,
      });
    }

    const response = {
      tracks: result.tracks,
      total: result.tracks.length, // This would need a separate count query for exact total
      filtered: result.tracks.length,
      pagination: {
        offset: 0, // Using cursor-based pagination instead
        limit: limitNum,
        hasMore: result.hasMore,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching tracks:', error);
    return NextResponse.json({ error: 'Failed to fetch tracks' }, { status: 500 });
  }
}
