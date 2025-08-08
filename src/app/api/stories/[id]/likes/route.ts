import { NextRequest, NextResponse } from 'next/server';

import { FirestoreLikeService } from '@/services/firestore-stories';

// GET /api/stories/[id]/likes - Get likes for a story
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    const result = await FirestoreLikeService.getStoryLikes(id, userId || undefined);

    return NextResponse.json({
      storyId: id,
      likeCount: result.likeCount,
      isLiked: result.isLiked,
    });
  } catch (error) {
    console.error('Error fetching story likes:', error);
    return NextResponse.json({ error: 'Failed to fetch likes' }, { status: 500 });
  }
}

// POST /api/stories/[id]/likes - Toggle like for a story
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: storyId } = await params;
    const { userId, userName } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    if (!userName) {
      return NextResponse.json({ error: 'User name is required' }, { status: 400 });
    }

    // Get story title for the user likes document
    // In a real app, you might want to get this from the story document
    const storyTitle = 'Unknown Story'; // Could fetch from Firestore if needed

    const result = await FirestoreLikeService.toggleStoryLike(
      storyId,
      userId,
      userName,
      storyTitle
    );

    return NextResponse.json({
      storyId,
      likeCount: result.likeCount,
      isLiked: result.isLiked,
    });
  } catch (error) {
    console.error('Error toggling story like:', error);
    return NextResponse.json({ error: 'Failed to toggle like' }, { status: 500 });
  }
}
