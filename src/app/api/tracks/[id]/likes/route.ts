import { NextRequest, NextResponse } from 'next/server';

import { FirestoreLikeService } from '@/services/firestore-tracks';

// GET /api/tracks/[id]/likes - Get likes for a track
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    const result = await FirestoreLikeService.getTrackLikes(id, userId || undefined);

    return NextResponse.json({
      trackId: id,
      likeCount: result.likeCount,
      isLiked: result.isLiked,
    });
  } catch (error) {
    console.error('Error fetching track likes:', error);
    return NextResponse.json({ error: 'Failed to fetch likes' }, { status: 500 });
  }
}

// POST /api/tracks/[id]/likes - Toggle like for a track
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: trackId } = await params;
    const { userId, userName } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    if (!userName) {
      return NextResponse.json({ error: 'User name is required' }, { status: 400 });
    }

    // Get track title for the user likes document
    // In a real app, you might want to get this from the track document
    const trackTitle = 'Unknown Track'; // Could fetch from Firestore if needed

    const result = await FirestoreLikeService.toggleTrackLike(
      trackId,
      userId,
      userName,
      trackTitle
    );

    return NextResponse.json({
      trackId,
      likeCount: result.likeCount,
      isLiked: result.isLiked,
    });
  } catch (error) {
    console.error('Error toggling track like:', error);
    return NextResponse.json({ error: 'Failed to toggle like' }, { status: 500 });
  }
}
