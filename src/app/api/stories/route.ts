import { NextRequest, NextResponse } from 'next/server';

import { FirestoreStoryService } from '@/services/firestore-stories';

// GET /api/stories - Get all stories with optional search and user likes
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const limit = searchParams.get('limit');
    const userId = searchParams.get('userId'); // For authenticated requests

    const limitNum = limit ? parseInt(limit) : 20;

    let result;

    if (userId) {
      // Get stories with user's like status (2 reads: stories + user-likes)
      result = await FirestoreStoryService.getStoriesWithLikes(userId, {
        limit: limitNum,
        search: query || undefined,
      });
    } else {
      // Get stories without like status (1 read: stories only)
      result = await FirestoreStoryService.getStories({
        limit: limitNum,
        search: query || undefined,
      });
    }

    const response = {
      stories: result.stories,
      total: result.stories.length, // This would need a separate count query for exact total
      filtered: result.stories.length,
      pagination: {
        offset: 0, // Using cursor-based pagination instead
        limit: limitNum,
        hasMore: result.hasMore,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching stories:', error);
    return NextResponse.json({ error: 'Failed to fetch stories' }, { status: 500 });
  }
}
