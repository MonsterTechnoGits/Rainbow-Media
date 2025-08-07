import { NextRequest, NextResponse } from 'next/server';

import { FirestoreTrackService } from '@/services/firestore-tracks';

// GET /api/tracks/[id] - Get track by ID
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const track = await FirestoreTrackService.getTrackById(id);

    if (!track) {
      return NextResponse.json({ error: 'Track not found' }, { status: 404 });
    }

    // For now, return simplified response without complex metadata
    // TODO: Add related tracks and navigation metadata if needed
    const trackWithMetadata = {
      ...track,
      metadata: {
        totalTracks: 0, // Would need a count query
        trackIndex: 0,
        nextTrack: null,
        previousTrack: null,
        relatedTracks: [], // Would need a related tracks query
      },
    };

    return NextResponse.json(trackWithMetadata);
  } catch (error) {
    console.error('Error fetching track:', error);
    return NextResponse.json({ error: 'Failed to fetch track' }, { status: 500 });
  }
}
