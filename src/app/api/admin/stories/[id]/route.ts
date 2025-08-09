import { NextRequest, NextResponse } from 'next/server';

import { verifyToken } from '@/lib/verifyToken';
import { FirestoreStoryService } from '@/services/firestore-stories';

// GET /api/admin/stories/[id] - Get single story with full admin details
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { decodedToken, authUser, error } = await verifyToken(request);
    console.log('Decoded Token:', decodedToken);
    if (error || !decodedToken || !authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin (assuming admin field in custom claims)
    if (!authUser.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { id } = await params;
    const story = await FirestoreStoryService.getStoryById(id);

    if (!story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }

    return NextResponse.json({ story });
  } catch (error) {
    console.error('Error fetching story:', error);
    return NextResponse.json({ error: 'Failed to fetch story' }, { status: 500 });
  }
}

// PUT method removed - use /api/story endpoint with edit=true instead

// DELETE /api/admin/stories/[id] - Delete story with cascade deletion
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { decodedToken, authUser, error } = await verifyToken(request);

    if (error || !decodedToken || !authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!authUser?.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { id } = await params;
    await FirestoreStoryService.deleteStory(id);

    return NextResponse.json({
      message: 'Story and all related data deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting story:', error);
    return NextResponse.json({ error: 'Failed to delete story' }, { status: 500 });
  }
}
