'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  CloudUpload,
  MusicNote,
  Image as ImageIcon,
  Info,
  MonetizationOn,
  Copyright,
  Speed,
  Save,
} from '@mui/icons-material';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Chip,
  LinearProgress,
  Alert,
  InputAdornment,
  Stack,
  Card,
  CardContent,
  useTheme,
  alpha,
  Stepper,
  Step,
  StepLabel,
  Switch,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
} from '@mui/material';
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useForm, Controller, Control, FieldErrors, UseFormWatch } from 'react-hook-form';

import Iconify from '@/components/iconify';
import { useToast } from '@/contexts/ToastContext';
import { useApi } from '@/hooks/use-api-query-hook';
import { handleUploadError } from '@/lib/upload-utils';
import {
  uploadStorySchema,
  type UploadStoryFormData,
  LICENSE_OPTIONS,
  CURRENCY_OPTIONS,
} from '@/schemas/uploadSchema';
import { adminApi, uploadApi } from '@/services/api';
import { AudioStory } from '@/types/audio-story';

export interface StoryFormProps {
  mode: 'create' | 'edit';
  story?: AudioStory | null;
  storyId?: string;
  onSuccess?: (message: string) => void;
  onCancel?: () => void;
}

export default function StoryForm({ mode, story, storyId, onSuccess, onCancel }: StoryFormProps) {
  const theme = useTheme();
  const { showToast } = useToast();
  const { useApiMutation } = useApi();

  const [activeStep, setActiveStep] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);
  const [genres, setGenres] = useState<string[]>([]);
  const [genreInput, setGenreInput] = useState('');

  const audioFileRef = useRef<HTMLInputElement | null>(null);
  const coverFileRef = useRef<HTMLInputElement | null>(null);

  const isEditMode = mode === 'edit';
  const steps = isEditMode
    ? ['Story & Media', 'Pricing & Rights', 'Review & Save']
    : ['Story & Media', 'Pricing & Rights', 'Review & Submit'];

  // Create schema based on mode
  const formSchema = isEditMode ? uploadStorySchema.omit({ audioFile: true }) : uploadStorySchema;

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid, isDirty },
    trigger,
    reset,
  } = useForm<UploadStoryFormData>({
    resolver: zodResolver(formSchema) as any, // eslint-disable-line @typescript-eslint/no-explicit-any
    defaultValues: {
      isPaid: false,
      currency: 'INR',
      license: 'all_rights_reserved',
      isExplicit: false,
      genres: [],
    },
    mode: 'onChange',
  });

  const watchedIsPaid = watch('isPaid');

  // Load story data for edit mode
  useEffect(() => {
    if (isEditMode && story) {
      setValue('title', story.title);
      setValue('series', story.series);
      setValue('description', (story as any).description || ''); // eslint-disable-line @typescript-eslint/no-explicit-any
      setValue('isPaid', story.paid || false);
      setValue('price', story.amount || undefined);
      setValue('currency', (story.currency as 'INR' | 'USD' | 'EUR') || 'INR');
      setValue('license', (story as any).license || 'all_rights_reserved'); // eslint-disable-line @typescript-eslint/no-explicit-any
      setValue('rightsOwner', (story as any).rightsOwner || ''); // eslint-disable-line @typescript-eslint/no-explicit-any
      setValue('isExplicit', (story as any).isExplicit || false); // eslint-disable-line @typescript-eslint/no-explicit-any
      setValue('episodeNumber', (story as any).episodeNumber || undefined); // eslint-disable-line @typescript-eslint/no-explicit-any
      setValue('storyType', (story as any).storyType || ''); // eslint-disable-line @typescript-eslint/no-explicit-any
      setValue('duration', story.duration || 0);

      // Set genres
      const storyGenres = Array.isArray((story as any).genres) // eslint-disable-line @typescript-eslint/no-explicit-any
        ? (story as any).genres // eslint-disable-line @typescript-eslint/no-explicit-any
        : story.genre
          ? [story.genre]
          : [];
      setGenres(storyGenres);
      setValue('genres', storyGenres);

      // Set cover preview if exists
      if (story.coverUrl) {
        setCoverPreviewUrl(story.coverUrl);
      }

      // Set audio preview if exists
      if (story.audioUrl) {
        setAudioPreviewUrl(story.audioUrl);
      }
    }
  }, [isEditMode, story, setValue]);

  // Handle audio file selection (create mode only)
  const handleAudioFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (isEditMode) return; // Audio files cannot be changed in edit mode

      const file = event.target.files?.[0];
      if (file) {
        setValue('audioFile', file, { shouldValidate: true });

        // Create preview URL
        const url = URL.createObjectURL(file);
        setAudioPreviewUrl(url);

        // Auto-detect duration
        const audio = new Audio(url);
        audio.addEventListener('loadedmetadata', () => {
          setValue('duration', Math.round(audio.duration));
        });
      }
    },
    [setValue, isEditMode]
  );

  // Handle cover image selection
  const handleCoverImageSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        setValue('coverImage', file, { shouldValidate: true });

        // Create preview URL
        const url = URL.createObjectURL(file);
        setCoverPreviewUrl(url);
      }
    },
    [setValue]
  );

  // Handle genre management
  const handleAddGenre = useCallback(() => {
    if (genreInput.trim() && genres.length < 5 && !genres.includes(genreInput.trim())) {
      const newGenres = [...genres, genreInput.trim()];
      setGenres(newGenres);
      setValue('genres', newGenres, { shouldDirty: true });
      setGenreInput('');
    }
  }, [genreInput, genres, setValue]);

  const handleRemoveGenre = useCallback(
    (genreToRemove: string) => {
      const newGenres = genres.filter((genre) => genre !== genreToRemove);
      setGenres(newGenres);
      setValue('genres', newGenres, { shouldDirty: true });
    },
    [genres, setValue]
  );

  // API mutations
  const uploadStoryMutation = useApiMutation({
    mutationFn: (variables: unknown) => uploadApi.uploadStory(variables as FormData),
    onSuccess: (response) => {
      const data = response.data as { success: boolean; message: string; story?: AudioStory };
      setUploadProgress(100);
      onSuccess?.(data.message || 'Story uploaded successfully!');
    },
    onError: (error) => {
      console.error('Upload failed:', error);
      const uploadError = handleUploadError(error);
      showToast(uploadError.message, 'error');
      setUploadProgress(0);
    },
  });

  const uploadCoverMutation = useApiMutation({
    mutationFn: (variables: unknown) => uploadApi.uploadCoverImage(variables as FormData),
  });

  const updateStoryMutation = useApiMutation({
    mutationFn: (variables: unknown) => {
      const { storyId, data } = variables as {
        storyId: string;
        data: Parameters<typeof adminApi.updateStory>[1];
      };
      return adminApi.updateStory(storyId, data);
    },
    onSuccess: (response) => {
      const data = response.data as { success: boolean; message?: string };
      console.log('Update successful:', data);
      onSuccess?.('Story updated successfully!');
    },
    onError: (error) => {
      console.error('Update failed:', error);
      const uploadError = handleUploadError(error);
      showToast(uploadError.message, 'error');
    },
  });

  // Determine if any API call is in progress
  const isApiProcessing =
    uploadStoryMutation.isPending || updateStoryMutation.isPending || uploadCoverMutation.isPending;

  // Handle form submission
  const onSubmit = async (data: UploadStoryFormData) => {
    try {
      setIsProcessing(true);

      if (isEditMode) {
        // Edit mode logic
        await handleEditSubmit(data);
      } else {
        // Create mode logic
        await handleCreateSubmit(data);
      }
    } catch (error) {
      console.error(`${isEditMode ? 'Update' : 'Upload'} failed:`, error);
      const uploadError = handleUploadError(error);
      showToast(uploadError.message, 'error');
    } finally {
      setIsProcessing(false);
      setUploadProgress(0);
    }
  };

  const handleCreateSubmit = async (data: UploadStoryFormData) => {
    setUploadProgress(0);

    // Create FormData for file upload
    const formData = new FormData();

    // Add all form fields to FormData
    formData.append('title', data.title);
    formData.append('series', data.series);
    if (data.description) formData.append('description', data.description);
    formData.append('audioFile', data.audioFile);
    if (data.coverImage) formData.append('coverImage', data.coverImage);
    formData.append('isPaid', data.isPaid.toString());
    if (data.price) formData.append('price', data.price.toString());
    formData.append('currency', data.currency);
    formData.append('license', data.license);
    if (data.rightsOwner) formData.append('rightsOwner', data.rightsOwner);
    formData.append('isExplicit', data.isExplicit.toString());
    if (data.episodeNumber) formData.append('episodeNumber', data.episodeNumber.toString());
    if (data.storyType) formData.append('storyType', data.storyType);
    formData.append('genres', JSON.stringify(data.genres));
    if (data.duration) formData.append('duration', data.duration.toString());

    // Upload progress simulation
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 80) {
          clearInterval(progressInterval);
          return 80;
        }
        return prev + Math.random() * 15;
      });
    }, 300);

    // Use the mutation to upload
    uploadStoryMutation.mutate(formData);
    clearInterval(progressInterval);
  };

  const handleEditSubmit = async (data: UploadStoryFormData) => {
    if (!storyId) throw new Error('Story ID is required for editing');

    // Prepare update data
    const updateData = {
      title: data.title,
      series: data.series,
      description: data.description,
      creator: story?.creator, // Keep existing creator
      isPaid: data.isPaid,
      price: data.price,
      currency: data.currency,
      genre: data.genres?.[0] || '', // Primary genre
      genres: data.genres,
      license: data.license,
      rightsOwner: data.rightsOwner,
      isExplicit: data.isExplicit,
      episodeNumber: data.episodeNumber,
      storyType: data.storyType,
      duration: data.duration,
    };

    // Handle cover image update if new image selected
    const hasNewCoverImage = data.coverImage instanceof File;

    if (hasNewCoverImage && data.coverImage) {
      const formData = new FormData();
      formData.append('coverImage', data.coverImage);
      formData.append('storyId', storyId);

      try {
        const uploadResponse = await uploadCoverMutation.mutateAsync(formData);
        const data = uploadResponse.data as { coverUrl: string };
        (updateData as any).coverUrl = data.coverUrl; // eslint-disable-line @typescript-eslint/no-explicit-any
      } catch (error) {
        console.error('Cover upload failed:', error);
      }
    }

    // Update story via admin API
    updateStoryMutation.mutate({ storyId, data: updateData });
  };

  // Step validation
  const validateStep = async (step: number) => {
    switch (step) {
      case 0:
        if (isEditMode) {
          return await trigger(['title', 'series']);
        } else {
          return await trigger(['title', 'series', 'audioFile']);
        }
      case 1:
        return await trigger(['isPaid', 'price', 'currency', 'license']);
      default:
        return true;
    }
  };

  // Handle step navigation
  const handleNext = async () => {
    const isStepValid = await validateStep(activeStep);
    if (isStepValid) {
      setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  // Handle final submit
  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit(onSubmit)();
  };

  // Render step content
  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <StoryMediaStep
            control={control}
            errors={errors}
            audioFileRef={audioFileRef}
            coverFileRef={coverFileRef}
            audioPreviewUrl={audioPreviewUrl}
            coverPreviewUrl={coverPreviewUrl}
            onAudioFileSelect={handleAudioFileSelect}
            onCoverImageSelect={handleCoverImageSelect}
            genres={genres}
            genreInput={genreInput}
            setGenreInput={setGenreInput}
            onAddGenre={handleAddGenre}
            onRemoveGenre={handleRemoveGenre}
            isEditMode={isEditMode}
            story={story}
          />
        );
      case 1:
        return (
          <PricingRightsStep control={control} errors={errors} watchedIsPaid={watchedIsPaid} />
        );
      case 2:
        return <ReviewStep watch={watch} isEditMode={isEditMode} story={story} isDirty={isDirty} />;
      default:
        return null;
    }
  };

  return (
    <Box>
      {/* Progress Stepper */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 3 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {/* Upload/Save Progress */}
      {(isProcessing || isApiProcessing) && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2}>
              {isEditMode ? (
                <CircularProgress size={24} />
              ) : (
                <CloudUpload sx={{ color: theme.palette.primary.main }} />
              )}
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" gutterBottom>
                  {isEditMode
                    ? 'Saving changes...'
                    : `Uploading story... ${Math.round(uploadProgress)}%`}
                </Typography>
                {!isEditMode && <LinearProgress variant="determinate" value={uploadProgress} />}
              </Box>
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Form */}
      <form
        onSubmit={activeStep === steps.length - 1 ? handleFinalSubmit : (e) => e.preventDefault()}
      >
        <Paper sx={{ p: 4, borderRadius: 3, mb: 4 }}>{renderStepContent(activeStep)}</Paper>

        {/* Navigation Buttons */}
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Stack direction="row" spacing={2} justifyContent="space-between">
            <Button
              variant="outlined"
              onClick={handleBack}
              disabled={activeStep === 0 || isProcessing || isApiProcessing}
              startIcon={<Iconify icon="material-symbols:arrow-back" />}
            >
              Back
            </Button>

            <Stack direction="row" spacing={2}>
              {onCancel && (
                <Button
                  variant="outlined"
                  onClick={onCancel}
                  disabled={isProcessing || isApiProcessing}
                  startIcon={<Iconify icon="material-symbols:close" />}
                >
                  Cancel
                </Button>
              )}

              <Button
                variant="outlined"
                onClick={() => reset()}
                disabled={isProcessing || isApiProcessing}
                startIcon={<Iconify icon="material-symbols:refresh" />}
              >
                Reset
              </Button>

              {activeStep < steps.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={isProcessing || isApiProcessing}
                  endIcon={<Iconify icon="material-symbols:arrow-forward" />}
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="contained"
                  disabled={!isValid || isProcessing || isApiProcessing || (isEditMode && !isDirty)}
                  startIcon={isEditMode ? <Save /> : <CloudUpload />}
                  sx={{ minWidth: 140 }}
                >
                  {isProcessing || isApiProcessing
                    ? isEditMode
                      ? 'Saving...'
                      : 'Uploading...'
                    : isEditMode
                      ? 'Save Changes'
                      : 'Upload Story'}
                </Button>
              )}
            </Stack>
          </Stack>
        </Paper>
      </form>
    </Box>
  );
}

// Step Components
interface StepProps {
  control: Control<UploadStoryFormData>;
  errors: FieldErrors<UploadStoryFormData>;
}

// Step 1: Story & Media
interface StoryMediaStepProps extends StepProps {
  audioFileRef: React.RefObject<HTMLInputElement | null>;
  coverFileRef: React.RefObject<HTMLInputElement | null>;
  audioPreviewUrl: string | null;
  coverPreviewUrl: string | null;
  onAudioFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onCoverImageSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  genres: string[];
  genreInput: string;
  setGenreInput: (value: string) => void;
  onAddGenre: () => void;
  onRemoveGenre: (genre: string) => void;
  isEditMode: boolean;
  story?: AudioStory | null;
}

const StoryMediaStep: React.FC<StoryMediaStepProps> = ({
  control,
  errors,
  audioFileRef,
  coverFileRef,
  audioPreviewUrl,
  coverPreviewUrl,
  onAudioFileSelect,
  onCoverImageSelect,
  genres,
  genreInput,
  setGenreInput,
  onAddGenre,
  onRemoveGenre,
  isEditMode,
  story,
}) => {
  const theme = useTheme();

  return (
    <Stack spacing={4}>
      <Box>
        <Typography
          variant="h5"
          fontWeight={600}
          gutterBottom
          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <MusicNote sx={{ color: theme.palette.primary.main }} />
          Story & Media
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {isEditMode
            ? 'Edit story details and media files'
            : 'Enter story details and upload your files'}
        </Typography>
      </Box>

      <Stack spacing={4}>
        {/* Current Audio File Info (Edit Mode Only) */}
        {isEditMode && story && (
          <Card sx={{ bgcolor: alpha(theme.palette.info.main, 0.05) }}>
            <CardContent>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <MusicNote />
                Current Audio File
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Audio files cannot be changed in edit mode. To replace the audio, please upload a
                new story.
              </Typography>
              <Stack spacing={1}>
                <Typography>
                  <strong>Duration:</strong> {Math.floor((story.duration || 0) / 60)}m{' '}
                  {(story.duration || 0) % 60}s
                </Typography>
                {story.audioUrl && (
                  <audio controls style={{ width: '100%', maxWidth: '400px' }}>
                    <source src={story.audioUrl} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                )}
              </Stack>
            </CardContent>
          </Card>
        )}

        {/* Story Information */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Story Information
            </Typography>
            <Stack spacing={3}>
              <Controller
                name="title"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Story Title"
                    placeholder="Enter story title"
                    error={!!errors.title}
                    helperText={errors.title?.message}
                    fullWidth
                    required
                  />
                )}
              />

              <Controller
                name="series"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Series"
                    placeholder="Enter series name"
                    error={!!errors.series}
                    helperText={errors.series?.message}
                    fullWidth
                    required
                  />
                )}
              />

              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Description"
                    placeholder="Tell people about your story (optional)"
                    multiline
                    rows={4}
                    error={!!errors.description}
                    helperText={errors.description?.message}
                    fullWidth
                  />
                )}
              />
            </Stack>
          </CardContent>
        </Card>

        {/* Audio File Upload (Create Mode Only) */}
        {!isEditMode && (
          <Card>
            <CardContent>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <MusicNote />
                Audio Story (Required)
              </Typography>

              <Controller
                name="audioFile"
                control={control}
                render={({ field: { value, ...field } }) => (
                  <>
                    <input
                      {...field}
                      ref={audioFileRef}
                      type="file"
                      accept=".mp3,audio/mpeg,audio/mp3"
                      onChange={onAudioFileSelect}
                      style={{ display: 'none' }}
                    />

                    <Button
                      variant="outlined"
                      onClick={() => audioFileRef.current?.click()}
                      startIcon={<CloudUpload />}
                      fullWidth
                      sx={{ mb: 2, py: 2 }}
                    >
                      {value ? 'Change Story File' : 'Select Story MP3'}
                    </Button>

                    {errors.audioFile && (
                      <Alert severity="error" sx={{ mb: 2 }}>
                        {errors.audioFile.message}
                      </Alert>
                    )}

                    {audioPreviewUrl && (
                      <Box
                        sx={{
                          p: 2,
                          bgcolor: alpha(theme.palette.primary.main, 0.05),
                          borderRadius: 2,
                        }}
                      >
                        <Typography variant="body2" gutterBottom>
                          Selected: {value?.name}
                        </Typography>
                        <audio controls style={{ width: '100%' }}>
                          <source src={audioPreviewUrl} type="audio/mpeg" />
                          Your browser does not support the audio element.
                        </audio>
                      </Box>
                    )}
                  </>
                )}
              />
            </CardContent>
          </Card>
        )}

        {/* Cover Image Upload */}
        <Card>
          <CardContent>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <ImageIcon />
              Story Cover {isEditMode ? '' : '(Optional)'}
            </Typography>

            <Controller
              name="coverImage"
              control={control}
              render={({ field: { value, ...field } }) => (
                <>
                  <input
                    {...field}
                    ref={coverFileRef}
                    type="file"
                    accept="image/*"
                    onChange={onCoverImageSelect}
                    style={{ display: 'none' }}
                  />

                  <Button
                    variant="outlined"
                    onClick={() => coverFileRef.current?.click()}
                    startIcon={<ImageIcon />}
                    fullWidth
                    sx={{ mb: 2, py: 2 }}
                  >
                    {coverPreviewUrl ? 'Change Story Cover' : 'Select Story Cover'}
                  </Button>

                  {errors.coverImage && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {errors.coverImage.message}
                    </Alert>
                  )}

                  {coverPreviewUrl && (
                    <Box sx={{ textAlign: 'center' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={coverPreviewUrl}
                        alt="Cover preview"
                        style={{
                          maxWidth: '200px',
                          maxHeight: '200px',
                          borderRadius: '8px',
                          objectFit: 'cover',
                        }}
                      />
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {value?.name || 'Current cover image'}
                      </Typography>
                    </Box>
                  )}
                </>
              )}
            />
          </CardContent>
        </Card>

        {/* Genres */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Story Genres {isEditMode ? '' : '(Optional)'}
            </Typography>

            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
              <TextField
                value={genreInput}
                onChange={(e) => setGenreInput(e.target.value)}
                placeholder="Add a genre"
                size="small"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    onAddGenre();
                  }
                }}
                fullWidth
              />
              <Button
                onClick={onAddGenre}
                disabled={!genreInput.trim() || genres.length >= 5}
                variant="outlined"
              >
                Add
              </Button>
            </Stack>

            {genres.length > 0 && (
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                {genres.map((genre) => (
                  <Chip
                    key={genre}
                    label={genre}
                    onDelete={() => onRemoveGenre(genre)}
                    size="small"
                  />
                ))}
              </Stack>
            )}

            <Typography variant="caption" color="text.secondary">
              {genres.length}/5 genres
            </Typography>
          </CardContent>
        </Card>
      </Stack>
    </Stack>
  );
};

// Step 2: Pricing & Rights
interface PricingRightsStepProps extends StepProps {
  watchedIsPaid: boolean;
}

const PricingRightsStep: React.FC<PricingRightsStepProps> = ({
  control,
  errors,
  watchedIsPaid,
}) => {
  const theme = useTheme();

  return (
    <Stack spacing={4}>
      <Box>
        <Typography
          variant="h5"
          fontWeight={600}
          gutterBottom
          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <MonetizationOn sx={{ color: theme.palette.primary.main }} />
          Pricing & Rights
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Set pricing and licensing information
        </Typography>
      </Box>

      <Stack spacing={4}>
        {/* Pricing */}
        <Card>
          <CardContent>
            <Controller
              name="isPaid"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Switch {...field} checked={field.value} />}
                  label="This is a premium story"
                />
              )}
            />

            {watchedIsPaid && (
              <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                <Controller
                  name="price"
                  control={control}
                  render={({ field: { value, onChange, ...field } }) => (
                    <TextField
                      {...field}
                      label="Price"
                      type="number"
                      value={value || ''}
                      onChange={(e) =>
                        onChange(e.target.value ? parseFloat(e.target.value) : undefined)
                      }
                      error={!!errors.price}
                      helperText={errors.price?.message}
                      slotProps={{
                        input: {
                          startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                        },
                      }}
                      sx={{ flex: 1 }}
                      required
                    />
                  )}
                />

                <Controller
                  name="currency"
                  control={control}
                  render={({ field }) => (
                    <FormControl sx={{ minWidth: 120 }}>
                      <InputLabel>Currency</InputLabel>
                      <Select {...field} label="Currency">
                        {CURRENCY_OPTIONS.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Stack>
            )}
          </CardContent>
        </Card>

        {/* Licensing */}
        <Card>
          <CardContent>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <Copyright />
              Licensing & Rights
            </Typography>

            <Stack spacing={3}>
              <Controller
                name="license"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>License</InputLabel>
                    <Select {...field} label="License">
                      {LICENSE_OPTIONS.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />

              <Controller
                name="rightsOwner"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Rights Owner"
                    placeholder="Who owns the rights to this story?"
                    error={!!errors.rightsOwner}
                    helperText={errors.rightsOwner?.message}
                    fullWidth
                  />
                )}
              />

              <Controller
                name="isExplicit"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Checkbox {...field} checked={field.value} />}
                    label="This story contains explicit content"
                  />
                )}
              />
            </Stack>
          </CardContent>
        </Card>

        {/* Additional Metadata */}
        <Accordion>
          <AccordionSummary expandIcon={<Iconify icon="material-symbols:expand-more" />}>
            <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Speed />
              Story Metadata (Optional)
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={3}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Controller
                  name="episodeNumber"
                  control={control}
                  render={({ field: { value, onChange, ...field } }) => (
                    <TextField
                      {...field}
                      label="Episode Number"
                      type="number"
                      value={value || ''}
                      onChange={(e) =>
                        onChange(e.target.value ? parseInt(e.target.value) : undefined)
                      }
                      error={!!errors.episodeNumber}
                      helperText={errors.episodeNumber?.message}
                      fullWidth
                    />
                  )}
                />

                <Controller
                  name="storyType"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Story Type</InputLabel>
                      <Select {...field} label="Story Type">
                        <MenuItem value="suspense">Suspense</MenuItem>
                        <MenuItem value="thriller">Thriller</MenuItem>
                        <MenuItem value="mystery">Mystery</MenuItem>
                        <MenuItem value="horror">Horror</MenuItem>
                        <MenuItem value="drama">Drama</MenuItem>
                        <MenuItem value="comedy">Comedy</MenuItem>
                        <MenuItem value="romance">Romance</MenuItem>
                        <MenuItem value="adventure">Adventure</MenuItem>
                        <MenuItem value="fantasy">Fantasy</MenuItem>
                        <MenuItem value="sci-fi">Science Fiction</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
              </Stack>
            </Stack>
          </AccordionDetails>
        </Accordion>
      </Stack>
    </Stack>
  );
};

// Step 3: Review
interface ReviewStepProps {
  watch: UseFormWatch<UploadStoryFormData>;
  isEditMode: boolean;
  story?: AudioStory | null;
  isDirty: boolean;
}

const ReviewStep: React.FC<ReviewStepProps> = ({ watch, isEditMode, story, isDirty }) => {
  const theme = useTheme();
  const formData = watch();

  return (
    <Stack spacing={4}>
      <Box>
        <Typography
          variant="h5"
          fontWeight={600}
          gutterBottom
          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <Info sx={{ color: theme.palette.primary.main }} />
          {isEditMode ? 'Review Changes' : 'Review Your Story'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {isEditMode
            ? 'Please review your changes before saving'
            : 'Please review all information before uploading'}
        </Typography>
      </Box>

      {isEditMode && !isDirty && (
        <Alert severity="info">No changes have been made to this story.</Alert>
      )}

      {isEditMode && isDirty && (
        <Alert severity="success">
          Changes detected! Click "Save Changes" to update the story.
        </Alert>
      )}

      {!isEditMode && (
        <Alert severity="info">
          Once uploaded, you can edit most of these details from the admin dashboard.
        </Alert>
      )}

      <Stack spacing={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Story Information
            </Typography>
            <Stack spacing={1}>
              <Typography>
                <strong>Title:</strong> {formData.title || 'Not set'}
              </Typography>
              <Typography>
                <strong>Series:</strong> {formData.series || 'Not set'}
              </Typography>
              {formData.description && (
                <Typography>
                  <strong>Description:</strong> {formData.description}
                </Typography>
              )}
              {isEditMode && (
                <Typography>
                  <strong>Creator:</strong> {story?.creator || 'Unknown'}
                </Typography>
              )}
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {isEditMode ? 'Audio & Media' : 'Files'}
            </Typography>
            <Stack spacing={1}>
              {isEditMode ? (
                <>
                  <Typography>
                    <strong>Duration:</strong>{' '}
                    {story
                      ? `${Math.floor((story.duration || 0) / 60)}m ${(story.duration || 0) % 60}s`
                      : 'Unknown'}
                  </Typography>
                  <Typography>
                    <strong>Cover Image:</strong>{' '}
                    {formData.coverImage instanceof File ? 'New image selected' : 'Current image'}
                  </Typography>
                </>
              ) : (
                <>
                  <Typography>
                    <strong>Story File:</strong> {formData.audioFile?.name || 'Not selected'}
                  </Typography>
                  <Typography>
                    <strong>Story Cover:</strong> {formData.coverImage?.name || 'Not selected'}
                  </Typography>
                </>
              )}
              {formData.genres && formData.genres.length > 0 && (
                <Box>
                  <Typography component="span">
                    <strong>Genres:</strong>{' '}
                  </Typography>
                  {formData.genres.map((genre: string) => (
                    <Chip key={genre} label={genre} size="small" sx={{ ml: 0.5 }} />
                  ))}
                </Box>
              )}
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Pricing & Rights
            </Typography>
            <Stack spacing={1}>
              <Typography>
                <strong>Type:</strong> {formData.isPaid ? 'Premium Story' : 'Free Story'}
              </Typography>
              {formData.isPaid && (
                <Typography>
                  <strong>Price:</strong> {formData.currency} {formData.price}
                </Typography>
              )}
              <Typography>
                <strong>License:</strong>{' '}
                {LICENSE_OPTIONS.find((l) => l.value === formData.license)?.label}
              </Typography>
              <Typography>
                <strong>Explicit Content:</strong> {formData.isExplicit ? 'Yes' : 'No'}
              </Typography>
              {formData.episodeNumber && (
                <Typography>
                  <strong>Episode Number:</strong> {formData.episodeNumber}
                </Typography>
              )}
              {formData.storyType && (
                <Typography>
                  <strong>Story Type:</strong> {formData.storyType}
                </Typography>
              )}
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Stack>
  );
};
