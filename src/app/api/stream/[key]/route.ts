import { NextRequest, NextResponse } from 'next/server';

import { createStreamingResponse, getFileMetadata, fileExists } from '@/lib/cloudflareS3';

export const maxDuration = 60;
export const runtime = 'nodejs';

/**
 * Handles file streaming from Cloudflare R2 with support for:
 * - Any file type (images, audio, video, PDFs, etc.)
 * - Range requests for partial content
 * - Automatic MIME type detection
 * - Long-term caching
 */

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ key: string }> }
): Promise<NextResponse | Response> {
  try {
    const params = await context.params;
    const { key } = params;

    if (!key) {
      return NextResponse.json({ error: 'File key is required' }, { status: 400 });
    }

    const decodedKey = decodeURIComponent(key);

    // Check if file exists
    const exists = await fileExists(decodedKey);
    if (!exists) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Detect Range request for partial content
    const rangeHeader = request.headers.get('range') || undefined;

    // Stream file with range support
    return await createStreamingResponse(decodedKey, rangeHeader);
  } catch (error) {
    console.error('Error streaming file:', error);
    return NextResponse.json({ error: 'Failed to stream file' }, { status: 500 });
  }
}

export async function HEAD(
  request: NextRequest,
  context: { params: Promise<{ key: string }> }
): Promise<NextResponse> {
  try {
    const params = await context.params;
    const { key } = params;

    if (!key) {
      return NextResponse.json({ error: 'File key is required' }, { status: 400 });
    }

    const decodedKey = decodeURIComponent(key);

    // Check if file exists
    const exists = await fileExists(decodedKey);
    if (!exists) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Get file metadata (size, MIME type, etc.)
    const metadata = await getFileMetadata(decodedKey);

    // Prepare HEAD response
    const response = NextResponse.json(null);

    // Set headers dynamically
    response.headers.set('Content-Type', metadata.contentType || 'application/octet-stream');
    response.headers.set('Content-Length', metadata.contentLength?.toString() || '0');
    response.headers.set('Accept-Ranges', 'bytes');
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable'); // 1 year cache
    response.headers.set('Content-Disposition', 'inline'); // Show in browser if possible

    return response;
  } catch (error) {
    console.error('Error getting file metadata:', error);
    return NextResponse.json({ error: 'Failed to get file metadata' }, { status: 500 });
  }
}
