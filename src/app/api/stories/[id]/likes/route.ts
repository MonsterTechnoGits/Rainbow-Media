import { NextRequest, NextResponse } from 'next/server';

import { ClientFirestoreService } from '@/services/client-firestore';

// GET /api/stories/[id]/likes - Get likes for a story
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId'); // Get userId from query params

    const result = await ClientFirestoreService.getStoryLikes(id, userId || undefined);

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

    if (!userId || !userName) {
      return NextResponse.json({ error: 'Missing userId or userName' }, { status: 400 });
    }

    const storyTitle = 'Story'; // Simplified

    const result = await ClientFirestoreService.toggleStoryLike(
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
