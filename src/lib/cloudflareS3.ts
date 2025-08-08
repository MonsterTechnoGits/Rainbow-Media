import { Readable } from 'stream';

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  GetObjectCommandOutput,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import type { Response as ExpressResponse } from 'express';

// Type definitions
interface R2Config {
  accessKeyId: string;
  secretAccessKey: string;
  accountId: string;
  bucketName: string;
}

interface FileUploadOptions {
  contentType?: string;
  metadata?: Record<string, string>;
}

interface FileUploadResult {
  success: boolean;
  key: string;
  etag?: string;
  location: string;
}

interface FileStreamResult {
  stream: Readable;
  contentType?: string;
  contentLength?: number;
  lastModified?: Date;
  metadata?: Record<string, string>;
}

type FileBody = Buffer | Uint8Array | string | Readable;

// Configuration
const config: R2Config = {
  accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID!,
  secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY!,
  accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
  bucketName: process.env.CLOUDFLARE_R2_BUCKET_NAME!,
};

// Validate configuration
const validateConfig = (config: R2Config): void => {
  const { accessKeyId, secretAccessKey, accountId, bucketName } = config;

  if (!accessKeyId || !secretAccessKey || !accountId || !bucketName) {
    throw new Error('Cloudflare R2 credentials are not set in environment variables.');
  }
};

validateConfig(config);

// Initialize S3 client
const S3 = new S3Client({
  region: 'auto',
  endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
  },
});

/**
 * Save a file to Cloudflare R2
 */
export const saveFile = async (
  key: string,
  body: FileBody,
  options: FileUploadOptions = {}
): Promise<FileUploadResult> => {
  try {
    const { contentType = 'application/octet-stream', metadata = {} } = options;

    const command = new PutObjectCommand({
      Bucket: config.bucketName,
      Key: key,
      Body: body,
      ContentType: contentType,
      Metadata: metadata,
    });

    const result = await S3.send(command);

    return {
      success: true,
      key,
      etag: result.ETag,
      location: `https://${config.accountId}.r2.cloudflarestorage.com/${config.bucketName}/${key}`,
    };
  } catch (error) {
    console.error('Error saving file to R2:', error);
    throw new Error(`Failed to save file: ${(error as Error).message}`);
  }
};

/**
 * Get a file from Cloudflare R2 as a readable stream
 */
export const getFileStream = async (key: string): Promise<FileStreamResult> => {
  try {
    const command = new GetObjectCommand({
      Bucket: config.bucketName,
      Key: key,
    });

    const result: GetObjectCommandOutput = await S3.send(command);

    if (!result.Body) {
      throw new Error('File not found or empty');
    }

    // Convert the response body to a readable stream
    const stream =
      result.Body instanceof Readable
        ? result.Body
        : Readable.from(result.Body as unknown as Buffer);

    return {
      stream,
      contentType: result.ContentType,
      contentLength: result.ContentLength,
      lastModified: result.LastModified,
      metadata: result.Metadata,
    };
  } catch (error) {
    console.error('Error getting file stream from R2:', error);
    throw new Error(`Failed to get file stream: ${(error as Error).message}`);
  }
};

/**
 * Get a file from Cloudflare R2 as a buffer
 */
export const getFileBuffer = async (key: string): Promise<Buffer> => {
  try {
    const { stream } = await getFileStream(key);

    // Convert stream to buffer
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk instanceof Buffer ? chunk : Buffer.from(chunk));
    }

    return Buffer.concat(chunks);
  } catch (error) {
    console.error('Error getting file buffer from R2:', error);
    throw new Error(`Failed to get file buffer: ${(error as Error).message}`);
  }
};

/**
 * Generate a presigned URL for direct file access (useful for frontend streaming)
 */
export const getPresignedUrl = async (key: string, expiresIn: number = 3600): Promise<string> => {
  try {
    const command = new GetObjectCommand({
      Bucket: config.bucketName,
      Key: key,
    });

    const signedUrl = await getSignedUrl(S3, command, { expiresIn });
    return signedUrl;
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    throw new Error(`Failed to generate presigned URL: ${(error as Error).message}`);
  }
};

/**
 * Check if a file exists in R2
 */
export const fileExists = async (key: string): Promise<boolean> => {
  try {
    const command = new HeadObjectCommand({
      Bucket: config.bucketName,
      Key: key,
    });

    await S3.send(command);
    return true;
  } catch (error: unknown) {
    if (
      (error as { name?: string; $metadata?: { httpStatusCode?: number } }).name === 'NotFound' ||
      (error as { name?: string; $metadata?: { httpStatusCode?: number } }).$metadata
        ?.httpStatusCode === 404
    ) {
      return false;
    }
    throw error;
  }
};

/**
 * Delete a file from R2
 */
export const deleteFile = async (key: string): Promise<boolean> => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: config.bucketName,
      Key: key,
    });

    await S3.send(command);
    return true;
  } catch (error) {
    console.error('Error deleting file from R2:', error);
    throw new Error(`Failed to delete file: ${(error as Error).message}`);
  }
};

/**
 * Upload a file with streaming support (for large files)
 */
export const uploadStream = async (
  key: string,
  stream: Readable,
  options: FileUploadOptions = {}
): Promise<FileUploadResult> => {
  try {
    const { contentType = 'application/octet-stream', metadata = {} } = options;

    const command = new PutObjectCommand({
      Bucket: config.bucketName,
      Key: key,
      Body: stream,
      ContentType: contentType,
      Metadata: metadata,
    });

    const result = await S3.send(command);

    return {
      success: true,
      key,
      etag: result.ETag,
      location: `https://${config.accountId}.r2.cloudflarestorage.com/${config.bucketName}/${key}`,
    };
  } catch (error) {
    console.error('Error uploading stream to R2:', error);
    throw new Error(`Failed to upload stream: ${(error as Error).message}`);
  }
};

// Utility functions with proper typing

/**
 * Save a text file
 */
export const saveTextFile = async (key: string, text: string): Promise<FileUploadResult> => {
  return await saveFile(key, text, {
    contentType: 'text/plain',
    metadata: { type: 'text' },
  });
};

/**
 * Save an image file
 */
export const saveImageFile = async (
  key: string,
  imageBuffer: Buffer,
  mimeType: string = 'image/jpeg'
): Promise<FileUploadResult> => {
  return await saveFile(key, imageBuffer, {
    contentType: mimeType,
    metadata: { type: 'image' },
  });
};

/**
 * Stream a video file for progressive download with proper Express response typing
 */
export const streamVideoFile = async (key: string, res: ExpressResponse): Promise<void> => {
  try {
    const { stream, contentType, contentLength } = await getFileStream(key);

    // Set appropriate headers for streaming
    res.set({
      'Content-Type': contentType || 'video/mp4',
      'Content-Length': contentLength?.toString(),
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'public, max-age=3600',
    });

    // Pipe the stream to response
    stream.pipe(res);
  } catch {
    res.status(404).json({ error: 'Video not found' });
  }
};

/**
 * Stream any file with range support for seeking (useful for media files)
 */
export const streamFileWithRangeSupport = async (
  key: string,
  res: ExpressResponse,
  range?: string
): Promise<void> => {
  try {
    const { stream, contentType, contentLength } = await getFileStream(key);

    if (!contentLength) {
      throw new Error('Content length not available');
    }

    if (range) {
      // Parse range header
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : contentLength - 1;
      const chunksize = end - start + 1;

      res.status(206).set({
        'Content-Range': `bytes ${start}-${end}/${contentLength}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize.toString(),
        'Content-Type': contentType || 'application/octet-stream',
      });
    } else {
      res.set({
        'Content-Type': contentType || 'application/octet-stream',
        'Content-Length': contentLength.toString(),
        'Accept-Ranges': 'bytes',
      });
    }

    stream.pipe(res);
  } catch {
    res.status(404).json({ error: 'File not found' });
  }
};

/**
 * Create a streaming Response for Next.js API routes with proper range support
 */
export const createStreamingResponse = async (key: string, range?: string): Promise<Response> => {
  try {
    // First get file metadata to know the total size
    const metadata = await getFileMetadata(key);
    const contentLength = metadata.contentLength;
    const contentType = metadata.contentType || 'audio/mpeg';

    if (!contentLength) {
      throw new Error('Content length not available');
    }

    let status = 200;
    const headers = new Headers();
    let start = 0;
    let end = contentLength - 1;

    if (range) {
      // Parse range header: bytes=start-end
      const parts = range.replace(/bytes=/, '').split('-');
      start = parseInt(parts[0], 10) || 0;
      end = parts[1] ? parseInt(parts[1], 10) : contentLength - 1;

      // Ensure valid range
      if (start >= contentLength || end >= contentLength || start > end) {
        return new Response('Range Not Satisfiable', {
          status: 416,
          headers: {
            'Content-Range': `bytes */${contentLength}`,
            'Content-Type': 'text/plain',
          },
        });
      }

      const chunksize = end - start + 1;
      status = 206;
      headers.set('Content-Range', `bytes ${start}-${end}/${contentLength}`);
      headers.set('Content-Length', chunksize.toString());
    } else {
      headers.set('Content-Length', contentLength.toString());
    }

    // Set common headers
    headers.set('Content-Type', contentType);
    headers.set('Accept-Ranges', 'bytes');
    headers.set('Cache-Control', 'public, max-age=3600');
    headers.set('ETag', `"${key}"`);

    // For range requests, we need to get a partial stream
    if (range && status === 206) {
      // Use S3 GetObject with Range parameter for efficient partial content
      const command = new GetObjectCommand({
        Bucket: config.bucketName,
        Key: key,
        Range: `bytes=${start}-${end}`,
      });

      const result = await S3.send(command);

      if (!result.Body) {
        throw new Error('Failed to get partial content');
      }

      // Convert the partial response body to a readable stream
      const stream =
        result.Body instanceof Readable
          ? result.Body
          : Readable.from(result.Body as unknown as Buffer);

      // Convert Node.js Readable stream to Web ReadableStream
      const webStream = new ReadableStream({
        start(controller) {
          stream.on('data', (chunk) => {
            controller.enqueue(new Uint8Array(chunk));
          });

          stream.on('end', () => {
            controller.close();
          });

          stream.on('error', (error) => {
            controller.error(error);
          });
        },
      });

      return new Response(webStream, {
        status,
        headers,
      });
    } else {
      // Full file stream
      const { stream } = await getFileStream(key);

      // Convert Node.js Readable stream to Web ReadableStream
      const webStream = new ReadableStream({
        start(controller) {
          stream.on('data', (chunk) => {
            controller.enqueue(new Uint8Array(chunk));
          });

          stream.on('end', () => {
            controller.close();
          });

          stream.on('error', (error) => {
            controller.error(error);
          });
        },
      });

      return new Response(webStream, {
        status,
        headers,
      });
    }
  } catch (error) {
    console.error('Error creating streaming response:', error);
    return new Response(JSON.stringify({ error: 'File not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

/**
 * Get file metadata without downloading the file
 */
export const getFileMetadata = async (
  key: string
): Promise<{
  contentType?: string;
  contentLength?: number;
  lastModified?: Date;
  metadata?: Record<string, string>;
}> => {
  try {
    const command = new HeadObjectCommand({
      Bucket: config.bucketName,
      Key: key,
    });

    const result = await S3.send(command);

    return {
      contentType: result.ContentType,
      contentLength: result.ContentLength,
      lastModified: result.LastModified,
      metadata: result.Metadata,
    };
  } catch (error) {
    console.error('Error getting file metadata from R2:', error);
    throw new Error(`Failed to get file metadata: ${(error as Error).message}`);
  }
};

// Export the S3 client and config for advanced usage
export { S3, config };

/**
 * Helper function to extract R2 key from Cloudflare R2 URL
 */
export const extractKeyFromUrl = (url: string): string | null => {
  try {
    // Handle both direct R2 URLs and streaming API URLs
    if (url.startsWith('/api/stream/')) {
      // Extract key from streaming API URL: /api/stream/audio%2Fstory-id.mp3
      return decodeURIComponent(url.replace('/api/stream/', ''));
    }

    // Handle direct R2 URLs: https://account-id.r2.cloudflarestorage.com/bucket-name/key
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/').filter(Boolean);

    if (pathParts.length >= 2) {
      // Remove bucket name (first part) and return the rest as key
      return pathParts.slice(1).join('/');
    }

    return null;
  } catch {
    return null;
  }
};

/**
 * Helper function to convert R2 storage URL to streaming URL
 */
export const getStreamingUrl = (audioUrl: string): string => {
  // If it's already a streaming URL, return as is
  if (audioUrl.startsWith('/api/stream/')) {
    return audioUrl;
  }

  // Extract key from R2 URL and create streaming URL
  const key = extractKeyFromUrl(audioUrl);
  if (key) {
    return `/api/stream/${encodeURIComponent(key)}`;
  }

  // Fallback to original URL if we can't extract key
  return audioUrl;
};

// Export types for external usage
export type { R2Config, FileUploadOptions, FileUploadResult, FileStreamResult, FileBody };
