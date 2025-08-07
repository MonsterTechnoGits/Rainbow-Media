import { NextRequest, NextResponse } from 'next/server';

import { mockMusicTracks } from '@/data/musicData';

// GET /api/tracks/[id] - Get track by ID
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const track = mockMusicTracks.find((t) => t.id === id);

    if (!track) {
      return NextResponse.json({ error: 'Track not found' }, { status: 404 });
    }

    // Add additional metadata for individual track requests
    const trackWithMetadata = {
      ...track,
      metadata: {
        totalTracks: mockMusicTracks.length,
        trackIndex: mockMusicTracks.findIndex((t) => t.id === id),
        nextTrack:
          mockMusicTracks.find(
            (_, index) => index === mockMusicTracks.findIndex((t) => t.id === id) + 1
          )?.id || null,
        previousTrack:
          mockMusicTracks.find(
            (_, index) => index === mockMusicTracks.findIndex((t) => t.id === id) - 1
          )?.id || null,
        relatedTracks: mockMusicTracks
          .filter((t) => t.id !== id && (t.artist === track.artist || t.genre === track.genre))
          .slice(0, 5)
          .map((t) => ({ id: t.id, title: t.title, artist: t.artist })),
      },
    };

    return NextResponse.json(trackWithMetadata);
  } catch (error) {
    console.error('Error fetching track:', error);
    return NextResponse.json({ error: 'Failed to fetch track' }, { status: 500 });
  }
}
