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
} from '@mui/material';
import { useRouter } from 'next/navigation';
import React, { useState, useCallback, useRef } from 'react';
import { useForm, Controller, Control, FieldErrors, UseFormWatch } from 'react-hook-form';

import Iconify from '@/components/iconify';
import Toolbar from '@/components/Toolbar';
import { useToast } from '@/contexts/ToastContext';
import { getAuthInstance } from '@/lib/firebase';
import { handleUploadError, type UploadResponse } from '@/lib/upload-utils';
import {
  uploadStorySchema,
  type UploadStoryFormData,
  LICENSE_OPTIONS,
  CURRENCY_OPTIONS,
} from '@/schemas/uploadSchema';

const UPLOAD_STEPS = ['Story & Media', 'Pricing & Rights', 'Review & Submit'];

export default function UploadStoryView() {
  const theme = useTheme();
  const router = useRouter();
  const { showToast } = useToast();
  const [activeStep, setActiveStep] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);
  const [genres, setGenres] = useState<string[]>([]);
  const [genreInput, setGenreInput] = useState('');

  const audioFileRef = useRef<HTMLInputElement | null>(null);
  const coverFileRef = useRef<HTMLInputElement | null>(null);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
    trigger,
    reset,
  } = useForm<UploadStoryFormData>({
    resolver: zodResolver(uploadStorySchema) as any, // eslint-disable-line @typescript-eslint/no-explicit-any
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
  // const watchedAudioFile = watch('audioFile');
  // const watchedCoverImage = watch('coverImage');

  // Handle audio file selection
  const handleAudioFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        setValue('audioFile', file, { shouldValidate: true });

        // Create preview URL
        const url = URL.createObjectURL(file);
        setAudioPreviewUrl(url);

        // Auto-detect duration (simplified)
        const audio = new Audio(url);
        audio.addEventListener('loadedmetadata', () => {
          setValue('duration', Math.round(audio.duration));
        });
      }
    },
    [setValue]
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
      setValue('genres', newGenres);
      setGenreInput('');
    }
  }, [genreInput, genres, setValue]);

  const handleRemoveGenre = useCallback(
    (genreToRemove: string) => {
      const newGenres = genres.filter((genre) => genre !== genreToRemove);
      setGenres(newGenres);
      setValue('genres', newGenres);
    },
    [genres, setValue]
  );

  // Handle form submission
  const onSubmit = async (data: UploadStoryFormData) => {
    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Debug: Log form data to console
      console.log('Form data being submitted:', data);
      console.log('isPaid value:', data.isPaid);
      console.log('price value:', data.price);

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

      // Upload to API with authentication
      const headers: Record<string, string> = {};

      // Add auth token if user is logged in
      if (getAuthInstance().currentUser) {
        const token = await getAuthInstance().currentUser?.getIdToken();
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }
      }

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers,
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const result: UploadResponse = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Upload failed');
      }

      console.log('Upload successful:', result);
      setUploadProgress(100);

      // Show success toast
      showToast('Story uploaded successfully!', 'success');

      // Success - redirect to admin page
      setTimeout(() => {
        router.push('/admin');
      }, 1500);
    } catch (error) {
      console.error('Upload failed:', error);
      const uploadError = handleUploadError(error);

      setIsUploading(false);
      setUploadProgress(0);

      // Show error toast
      showToast(uploadError.message, 'error');
    }
  };

  // Step validation
  const validateStep = async (step: number) => {
    switch (step) {
      case 0:
        return await trigger(['title', 'series', 'audioFile', 'coverImage']);
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
      setActiveStep((prev) => Math.min(prev + 1, UPLOAD_STEPS.length - 1));
    }
  };

  // Handle final submit
  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit(onSubmit)();
  };

  const handleBack = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  // Render step content
  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <TrackMediaStep
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
          />
        );
      case 1:
        return (
          <PricingRightsStep control={control} errors={errors} watchedIsPaid={watchedIsPaid} />
        );
      case 2:
        return <ReviewStep watch={watch} />;
      default:
        return null;
    }
  };

  return (
    <>
      <Toolbar title="Upload Story" showBackButton={true} />
      <Box sx={{ pt: { xs: 9, sm: 12 }, pb: 4, px: { xs: 2, sm: 3, md: 4 } }}>
        {/* Progress Stepper */}
        <Paper sx={{ p: 3, mb: 4, borderRadius: 3 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {UPLOAD_STEPS.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>

        {/* Upload Progress */}
        {isUploading && (
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <CloudUpload sx={{ color: theme.palette.primary.main }} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" gutterBottom>
                    Uploading story... {Math.round(uploadProgress)}%
                  </Typography>
                  <LinearProgress variant="determinate" value={uploadProgress} />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        )}

        {/* Form */}
        <form
          onSubmit={
            activeStep === UPLOAD_STEPS.length - 1 ? handleFinalSubmit : (e) => e.preventDefault()
          }
        >
          <Paper sx={{ p: 4, borderRadius: 3, mb: 4 }}>{renderStepContent(activeStep)}</Paper>

          {/* Navigation Buttons */}
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Stack direction="row" spacing={2} justifyContent="space-between">
              <Button
                variant="outlined"
                onClick={handleBack}
                disabled={activeStep === 0 || isUploading}
                startIcon={<Iconify icon="material-symbols:arrow-back" />}
              >
                Back
              </Button>

              <Stack direction="row" spacing={2}>
                <Button
                  variant="outlined"
                  onClick={() => reset()}
                  disabled={isUploading}
                  startIcon={<Iconify icon="material-symbols:refresh" />}
                >
                  Reset
                </Button>

                {activeStep < UPLOAD_STEPS.length - 1 ? (
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    disabled={isUploading}
                    endIcon={<Iconify icon="material-symbols:arrow-forward" />}
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={!isValid || isUploading}
                    startIcon={<CloudUpload />}
                    sx={{ minWidth: 140 }}
                  >
                    {isUploading ? 'Uploading...' : 'Upload Story'}
                  </Button>
                )}
              </Stack>
            </Stack>
          </Paper>
        </form>
      </Box>
    </>
  );
}

// Step Components
interface StepProps {
  control: Control<UploadStoryFormData>;
  errors: FieldErrors<UploadStoryFormData>;
}

// Step 1: Track & Media
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
}

const TrackMediaStep: React.FC<StoryMediaStepProps> = ({
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
          Enter story details and upload your files
        </Typography>
      </Box>

      <Stack spacing={4}>
        {/* Track Information */}
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

        {/* Audio File Upload */}
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

        {/* Cover Image Upload */}
        <Card>
          <CardContent>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <ImageIcon />
              Story Cover (Optional)
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
                    {value ? 'Change Story Cover' : 'Select Story Cover'}
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
                        {value?.name}
                      </Typography>
                    </Box>
                  )}
                </>
              )}
            />
          </CardContent>
        </Card>

        {/* Tags */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Story Genres (Optional)
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
                    placeholder="Who owns the rights to this track?"
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
                    label="This track contains explicit content"
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
}

const ReviewStep: React.FC<ReviewStepProps> = ({ watch }) => {
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
          Review Your Story
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Please review all information before uploading
        </Typography>
      </Box>

      <Alert severity="info">
        Once uploaded, you can edit most of these details from the admin dashboard.
      </Alert>

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
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Files
            </Typography>
            <Stack spacing={1}>
              <Typography>
                <strong>Story File:</strong> {formData.audioFile?.name || 'Not selected'}
              </Typography>
              <Typography>
                <strong>Story Cover:</strong> {formData.coverImage?.name || 'Not selected'}
              </Typography>
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
