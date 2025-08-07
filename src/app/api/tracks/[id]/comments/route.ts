import { NextRequest, NextResponse } from 'next/server';

// Mock data for comments - in production this would come from database
const trackComments: Record<
  string,
  Array<{
    id: string;
    userId: string;
    userName: string;
    userAvatar: string;
    content: string;
    timestamp: number;
    likes: number;
    replies: Array<{
      id: string;
      userId: string;
      userName: string;
      userAvatar: string;
      content: string;
      timestamp: number;
    }>;
  }>
> = {
  '1': [
    {
      id: 'c1',
      userId: 'user1',
      userName: 'Alex Johnson',
      userAvatar: 'https://i.pravatar.cc/150?u=user1',
      content: 'This track is absolutely amazing! The beat drops are incredible.',
      timestamp: Date.now() - 3600000,
      likes: 12,
      replies: [],
    },
  ],
  '2': [
    {
      id: 'c2',
      userId: 'user2',
      userName: 'Sarah Chen',
      userAvatar: 'https://i.pravatar.cc/150?u=user2',
      content: "Love the melody! Can't stop listening to this.",
      timestamp: Date.now() - 7200000,
      likes: 8,
      replies: [],
    },
  ],
  '3': [
    {
      id: 'c3',
      userId: 'user3',
      userName: 'Mike Wilson',
      userAvatar: 'https://i.pravatar.cc/150?u=user3',
      content: 'Pure gold! This deserves to be on the top charts.',
      timestamp: Date.now() - 1800000,
      likes: 15,
      replies: [
        {
          id: 'r1',
          userId: 'user4',
          userName: 'Emma Davis',
          userAvatar: 'https://i.pravatar.cc/150?u=user4',
          content: 'Absolutely agree! 🔥',
          timestamp: Date.now() - 1200000,
        },
      ],
    },
  ],
};

// GET /api/tracks/[id]/comments - Get comments for a track
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');

    let comments = trackComments[id] || [];

    // Apply pagination if provided
    const limitNum = limit ? parseInt(limit) : undefined;
    const offsetNum = offset ? parseInt(offset) : 0;

    if (limitNum) {
      comments = comments.slice(offsetNum, offsetNum + limitNum);
    }

    // Sort by timestamp (newest first)
    comments.sort((a, b) => b.timestamp - a.timestamp);

    return NextResponse.json({
      trackId: id,
      comments,
      total: trackComments[id]?.length || 0,
      pagination: {
        offset: offsetNum,
        limit: limitNum || comments.length,
        hasMore: limitNum ? offsetNum + limitNum < (trackComments[id]?.length || 0) : false,
      },
    });
  } catch (error) {
    console.error('Error fetching track comments:', error);
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }
}

// POST /api/tracks/[id]/comments - Add a comment to a track
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { userId, userName, userAvatar, content } = await request.json();

    if (!userId || !userName || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!trackComments[id]) {
      trackComments[id] = [];
    }

    const newComment = {
      id: `c_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      userId,
      userName,
      userAvatar: userAvatar || `https://i.pravatar.cc/150?u=${userId}`,
      content,
      timestamp: Date.now(),
      likes: 0,
      replies: [],
    };

    trackComments[id].push(newComment);

    return NextResponse.json({
      success: true,
      comment: newComment,
      totalComments: trackComments[id].length,
    });
  } catch (error) {
    console.error('Error adding track comment:', error);
    return NextResponse.json({ error: 'Failed to add comment' }, { status: 500 });
  }
}
