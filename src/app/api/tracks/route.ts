import { NextRequest, NextResponse } from 'next/server';

import { mockMusicTracks } from '@/data/musicData';

// GET /api/tracks - Get all tracks with optional search
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');

    let tracks = mockMusicTracks;

    // Filter by search query if provided
    if (query) {
      const lowercaseQuery = query.toLowerCase();
      tracks = tracks.filter(
        (track) =>
          track.title.toLowerCase().includes(lowercaseQuery) ||
          track.artist.toLowerCase().includes(lowercaseQuery) ||
          track.album.toLowerCase().includes(lowercaseQuery) ||
          track.genre.toLowerCase().includes(lowercaseQuery)
      );
    }

    // Apply pagination if provided
    const limitNum = limit ? parseInt(limit) : undefined;
    const offsetNum = offset ? parseInt(offset) : 0;

    if (limitNum) {
      tracks = tracks.slice(offsetNum, offsetNum + limitNum);
    }

    const response = {
      tracks,
      total: mockMusicTracks.length,
      filtered: query ? tracks.length : mockMusicTracks.length,
      pagination: {
        offset: offsetNum,
        limit: limitNum || tracks.length,
        hasMore: limitNum ? offsetNum + limitNum < mockMusicTracks.length : false,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching tracks:', error);
    return NextResponse.json({ error: 'Failed to fetch tracks' }, { status: 500 });
  }
}
