export interface UploadResponse {
  success: boolean;
  data?: {
    id: string;
    title: string;
    audioUrl: string;
    coverUrl?: string;
    firestoreId: string;
  };
  error?: string;
  details?: string;
  message?: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export class UploadError extends Error {
  constructor(
    message: string,
    public details?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'UploadError';
  }
}

export const handleUploadError = (error: unknown): UploadError => {
  if (error instanceof UploadError) {
    return error;
  }

  if (error instanceof Error) {
    return new UploadError(error.message);
  }

  return new UploadError('An unknown error occurred during upload');
};

export const validateAudioFile = (file: File): boolean => {
  const maxSize = 50 * 1024 * 1024; // 50MB
  const allowedTypes = ['audio/mpeg', 'audio/mp3'];

  if (file.size > maxSize) {
    throw new UploadError('Audio file must be less than 50MB');
  }

  if (!allowedTypes.includes(file.type)) {
    throw new UploadError('Only MP3 audio files are supported');
  }

  return true;
};

export const validateImageFile = (file: File): boolean => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  if (file.size > maxSize) {
    throw new UploadError('Cover image must be less than 10MB');
  }

  if (!allowedTypes.includes(file.type)) {
    throw new UploadError('Only JPEG, PNG, and WebP images are supported');
  }

  return true;
};

export const getFileExtension = (filename: string): string => {
  return filename.split('.').pop() || '';
};

export const formatFileSize = (bytes: number): string => {
  const sizes = ['B', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 B';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
};

export const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};
