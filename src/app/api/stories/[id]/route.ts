import { NextRequest, NextResponse } from 'next/server';

import { FirestoreStoryService } from '@/services/firestore-stories';

// GET /api/stories/[id] - Get story by ID
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const story = await FirestoreStoryService.getStoryById(id);

    if (!story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }

    // For now, return simplified response without complex metadata
    // TODO: Add related stories and navigation metadata if needed
    const storyWithMetadata = {
      ...story,
      metadata: {
        totalStories: 0, // Would need a count query
        storyIndex: 0,
        nextStory: null,
        previousStory: null,
        relatedStories: [], // Would need a related stories query
      },
    };

    return NextResponse.json(storyWithMetadata);
  } catch (error) {
    console.error('Error fetching story:', error);
    return NextResponse.json({ error: 'Failed to fetch story' }, { status: 500 });
  }
}
