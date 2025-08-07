import { NextRequest, NextResponse } from 'next/server';

// Mock data for likes - in production this would come from database
const trackLikes: Record<string, { count: number; likedBy: string[] }> = {
  '1': { count: 127, likedBy: [] },
  '2': { count: 89, likedBy: [] },
  '3': { count: 203, likedBy: [] },
  '4': { count: 156, likedBy: [] },
  '5': { count: 234, likedBy: [] },
  '6': { count: 98, likedBy: [] },
  '7': { count: 177, likedBy: [] },
  '8': { count: 145, likedBy: [] },
};

// GET /api/tracks/[id]/likes - Get likes for a track
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    const likes = trackLikes[id] || { count: 0, likedBy: [] };

    return NextResponse.json({
      trackId: id,
      likeCount: likes.count,
      isLiked: userId ? likes.likedBy.includes(userId) : false,
    });
  } catch (error) {
    console.error('Error fetching track likes:', error);
    return NextResponse.json({ error: 'Failed to fetch likes' }, { status: 500 });
  }
}

// POST /api/tracks/[id]/likes - Toggle like for a track
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    if (!trackLikes[id]) {
      trackLikes[id] = { count: 0, likedBy: [] };
    }

    const likes = trackLikes[id];
    const isCurrentlyLiked = likes.likedBy.includes(userId);

    if (isCurrentlyLiked) {
      // Unlike
      likes.likedBy = likes.likedBy.filter((uid) => uid !== userId);
      likes.count = Math.max(0, likes.count - 1);
    } else {
      // Like
      likes.likedBy.push(userId);
      likes.count += 1;
    }

    return NextResponse.json({
      trackId: id,
      likeCount: likes.count,
      isLiked: !isCurrentlyLiked,
    });
  } catch (error) {
    console.error('Error toggling track like:', error);
    return NextResponse.json({ error: 'Failed to toggle like' }, { status: 500 });
  }
}
