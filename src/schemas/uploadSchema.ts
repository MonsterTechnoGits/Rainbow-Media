import { z } from 'zod';

// File validation helpers
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_AUDIO_TYPES = ['audio/mpeg', 'audio/mp3'];
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

// Custom file validation for audio
const audioFileSchema = z
  .instanceof(File)
  .refine((file) => file.size <= MAX_FILE_SIZE, 'Audio file must be less than 50MB')
  .refine((file) => ACCEPTED_AUDIO_TYPES.includes(file.type), 'Only MP3 audio files are supported');

// Custom file validation for image
const imageFileSchema = z
  .instanceof(File)
  .refine((file) => file.size <= MAX_IMAGE_SIZE, 'Cover image must be less than 10MB')
  .refine(
    (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
    'Only JPEG, PNG, and WebP images are supported'
  );

// Optional image file schema
const optionalImageFileSchema = z.union([imageFileSchema, z.undefined()]);

// Main upload form schema
export const uploadStorySchema = z
  .object({
    // Required fields
    title: z
      .string()
      .min(1, 'Story title is required')
      .min(2, 'Title must be at least 2 characters')
      .max(100, 'Title must be less than 100 characters')
      .trim(),

    series: z
      .string()
      .min(1, 'Series name is required')
      .min(2, 'Series name must be at least 2 characters')
      .max(100, 'Series name must be less than 100 characters')
      .trim(),

    audioFile: audioFileSchema,

    // Optional fields
    description: z
      .string()
      .max(1000, 'Description must be less than 1000 characters')
      .optional()
      .or(z.literal('')),

    coverImage: optionalImageFileSchema,

    // Pricing fields
    isPaid: z.boolean().default(false),

    price: z
      .number()
      .min(0, 'Price must be 0 or greater')
      .max(10000, 'Price must be less than ₹10,000')
      .optional(),

    currency: z.enum(['INR', 'USD', 'EUR']).default('INR'),

    // Metadata

    episodeNumber: z
      .number()
      .int()
      .min(1, 'Episode number must be at least 1')
      .max(999, 'Episode number must be less than 1000')
      .optional(),

    duration: z
      .number()
      .min(1, 'Story duration must be at least 1 second')
      .max(7200, 'Story duration must be less than 2 hours')
      .optional(), // Will be auto-detected from audio file

    // Story genres and tags
    genres: z
      .array(z.string().min(1).max(30))
      .max(5, 'Maximum 5 genres allowed')
      .optional()
      .default([]),

    isExplicit: z.boolean().default(false),

    // Story specific fields
    storyType: z
      .enum([
        'suspense',
        'thriller',
        'mystery',
        'horror',
        'drama',
        'comedy',
        'romance',
        'adventure',
        'fantasy',
        'sci-fi',
      ])
      .optional(),

    // Rights and licensing
    rightsOwner: z
      .string()
      .max(100, 'Rights owner must be less than 100 characters')
      .optional()
      .or(z.literal('')),

    license: z
      .enum(['all_rights_reserved', 'creative_commons', 'public_domain'])
      .default('all_rights_reserved'),
  })
  .refine(
    (data) => {
      // If story is paid, price must be provided
      if (data.isPaid && (!data.price || data.price <= 0)) {
        return false;
      }
      return true;
    },
    {
      message: 'Price is required for paid stories',
      path: ['price'],
    }
  );

// TypeScript type inference
export type UploadStoryFormData = z.infer<typeof uploadStorySchema>;
export type UploadTrackFormData = UploadStoryFormData; // Backward compatibility
export const uploadTrackSchema = uploadStorySchema; // Backward compatibility

// License options
export const LICENSE_OPTIONS = [
  { value: 'all_rights_reserved', label: 'All Rights Reserved' },
  { value: 'creative_commons', label: 'Creative Commons' },
  { value: 'public_domain', label: 'Public Domain' },
] as const;

// Currency options
export const CURRENCY_OPTIONS = [
  { value: 'INR', label: '₹ (INR)' },
  { value: 'USD', label: '$ (USD)' },
  { value: 'EUR', label: '€ (EUR)' },
] as const;

// Story type options
export const STORY_TYPE_OPTIONS = [
  { value: 'suspense', label: 'Suspense' },
  { value: 'thriller', label: 'Thriller' },
  { value: 'mystery', label: 'Mystery' },
  { value: 'horror', label: 'Horror' },
  { value: 'drama', label: 'Drama' },
  { value: 'comedy', label: 'Comedy' },
  { value: 'romance', label: 'Romance' },
  { value: 'adventure', label: 'Adventure' },
  { value: 'fantasy', label: 'Fantasy' },
  { value: 'sci-fi', label: 'Science Fiction' },
] as const;

// Story genre options for tagging
export const GENRE_OPTIONS = [
  'Suspense',
  'Thriller',
  'Mystery',
  'Horror',
  'Drama',
  'Comedy',
  'Romance',
  'Adventure',
  'Fantasy',
  'Science Fiction',
  'Historical Fiction',
  'Crime',
  'Supernatural',
  'Psychological',
  'Action',
] as const;
