import { NextRequest, NextResponse } from 'next/server';

import { FirestoreCommentService } from '@/services/firestore-stories';

// GET /api/stories/[id]/comments - Get comments for a story
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit');

    const limitNum = limit ? parseInt(limit) : 20;

    const result = await FirestoreCommentService.getStoryComments(id, {
      limit: limitNum,
    });

    return NextResponse.json({
      storyId: id,
      comments: result.comments,
      total: result.comments.length, // This would need a separate count query for exact total
      pagination: {
        offset: 0, // Using cursor-based pagination
        limit: limitNum,
        hasMore: result.hasMore,
      },
    });
  } catch (error) {
    console.error('Error fetching story comments:', error);
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }
}

// POST /api/stories/[id]/comments - Add a comment to a story
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: storyId } = await params;
    const { userId, userName, userAvatar, content } = await request.json();

    if (!userId || !userName || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const result = await FirestoreCommentService.addComment(
      storyId,
      userId,
      userName,
      userAvatar || `https://i.pravatar.cc/150?u=${userId}`,
      content
    );

    return NextResponse.json({
      success: true,
      comment: result,
      totalComments: 0, // Would need a count query for exact total
    });
  } catch (error) {
    console.error('Error adding story comment:', error);
    return NextResponse.json({ error: 'Failed to add comment' }, { status: 500 });
  }
}
