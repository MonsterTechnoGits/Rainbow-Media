'use client';

import { PlayArrow, Search, Visibility } from '@mui/icons-material';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
  IconButton,
  Pagination,
  Skeleton,
  useTheme,
  alpha,
  Stack,
  TextField,
  InputAdornment,
} from '@mui/material';
import React, { useState, useEffect } from 'react';

import Iconify from '@/components/iconify';
import { formatDuration } from '@/data/storyData';
import { FirestoreStoryService } from '@/services/firestore-stories';
import { AudioStory } from '@/types/audio-story';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface StoryListingSectionProps {}

const StoryListingSection: React.FC<StoryListingSectionProps> = () => {
  const theme = useTheme();
  const [stories, setStories] = useState<AudioStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStory, setSelectedStory] = useState<AudioStory | null>(null);

  const storiesPerPage = 10;

  // Load stories
  const loadStories = async (page: number = 1, search: string = '') => {
    try {
      setLoading(true);
      const result = await FirestoreStoryService.getStories({
        limit: storiesPerPage,
        search: search.trim() || undefined,
      });

      setStories(result.stories || []);

      // For pagination, we'll estimate pages based on current data
      // In a real implementation, you'd need total count from backend
      setTotalPages(Math.max(1, page + (result.hasMore ? 1 : 0)));
    } catch (error) {
      console.error('Error loading stories:', error);
      setStories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStories(currentPage, searchQuery);
  }, [currentPage, searchQuery]);

  const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
  };

  const handleStoryClick = (story: AudioStory) => {
    setSelectedStory(story);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchQuery(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  if (selectedStory) {
    return <StoryDetailView story={selectedStory} onBack={() => setSelectedStory(null)} />;
  }

  return (
    <Paper
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 3,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.secondary.main, 0.05)})`,
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar
              sx={{
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
              }}
            >
              <Iconify icon="material-symbols:library-music" width={24} height={24} />
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight={700}>
                Story Management
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage and view all stories in the platform
              </Typography>
            </Box>
          </Stack>

          <TextField
            placeholder="Search stories..."
            value={searchQuery}
            onChange={handleSearch}
            size="small"
            sx={{ minWidth: { xs: 200, sm: 300, md: 400 } }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: theme.palette.text.secondary }} />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Stack>
      </Box>

      {/* Track Table */}
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, color: theme.palette.text.secondary }}>
                Story
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: theme.palette.text.secondary }}>
                Series
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: theme.palette.text.secondary }}>
                Duration
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: theme.palette.text.secondary }}>
                Type
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: theme.palette.text.secondary }}>
                Price
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: theme.palette.text.secondary }}>
                Stats
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: theme.palette.text.secondary }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading
              ? Array.from({ length: storiesPerPage }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Skeleton
                          variant="rectangular"
                          width={48}
                          height={48}
                          sx={{ borderRadius: 2 }}
                        />
                        <Box>
                          <Skeleton variant="text" width={150} height={20} />
                          <Skeleton variant="text" width={100} height={16} />
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Skeleton variant="text" width={120} />
                    </TableCell>
                    <TableCell>
                      <Skeleton variant="text" width={60} />
                    </TableCell>
                    <TableCell>
                      <Skeleton variant="text" width={80} />
                    </TableCell>
                    <TableCell>
                      <Skeleton variant="text" width={60} />
                    </TableCell>
                    <TableCell>
                      <Skeleton variant="text" width={80} />
                    </TableCell>
                    <TableCell>
                      <Skeleton variant="circular" width={40} height={40} />
                    </TableCell>
                  </TableRow>
                ))
              : stories.map((story: AudioStory) => (
                  <TableRow
                    key={story.id}
                    hover
                    sx={{
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.04),
                      },
                    }}
                    onClick={() => handleStoryClick(story)}
                  >
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: 2,
                            overflow: 'hidden',
                            background: story.coverUrl
                              ? `url(${story.coverUrl}) center/cover`
                              : `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {!story.coverUrl && (
                            <Iconify
                              icon="material-symbols:auto-stories"
                              width={24}
                              height={24}
                              sx={{ color: 'white' }}
                            />
                          )}
                        </Box>
                        <Box>
                          <Typography variant="body1" fontWeight={600}>
                            {story.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {story.creator}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{story.series}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {formatDuration(story.duration)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={story.genre || 'Story'}
                        size="small"
                        sx={{
                          bgcolor: alpha(theme.palette.info.main, 0.1),
                          color: theme.palette.info.main,
                          fontWeight: 500,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      {story.paid ? (
                        <Chip
                          label={`${story.currency} ${story.amount}`}
                          size="small"
                          sx={{
                            bgcolor: alpha(theme.palette.success.main, 0.1),
                            color: theme.palette.success.main,
                            fontWeight: 600,
                          }}
                        />
                      ) : (
                        <Chip
                          label="Free"
                          size="small"
                          sx={{
                            bgcolor: alpha(theme.palette.warning.main, 0.1),
                            color: theme.palette.warning.main,
                            fontWeight: 600,
                          }}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <Stack spacing={1}>
                        <Typography variant="caption" color="text.secondary">
                          {story.likeCount || 0} likes
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {story.commentCount || 0} comments
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        sx={{
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          color: theme.palette.primary.main,
                          '&:hover': {
                            bgcolor: alpha(theme.palette.primary.main, 0.2),
                          },
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStoryClick(story);
                        }}
                      >
                        <Visibility />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {!loading && stories.length > 0 && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            p: 3,
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}
        >
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
            size="medium"
            showFirstButton
            showLastButton
          />
        </Box>
      )}

      {/* No tracks found */}
      {!loading && stories.length === 0 && (
        <Box
          sx={{
            p: 6,
            textAlign: 'center',
          }}
        >
          <Avatar
            sx={{
              width: 64,
              height: 64,
              bgcolor: alpha(theme.palette.text.secondary, 0.1),
              color: theme.palette.text.secondary,
              mx: 'auto',
              mb: 2,
            }}
          >
            <Iconify icon="material-symbols:music-off" width={32} height={32} />
          </Avatar>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {searchQuery ? 'No stories found' : 'No stories available'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {searchQuery
              ? `No stories match "${searchQuery}". Try a different search term.`
              : 'Upload some stories to get started.'}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

// Story Detail View Component (Split Layout)
interface StoryDetailViewProps {
  story: AudioStory;
  onBack: () => void;
}

const StoryDetailView: React.FC<StoryDetailViewProps> = ({ story, onBack }) => {
  const theme = useTheme();

  return (
    <Paper
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        height: '70vh',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          bgcolor: alpha(theme.palette.primary.main, 0.02),
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          <IconButton onClick={onBack} size="small">
            <Iconify icon="material-symbols:arrow-back" width={20} height={20} />
          </IconButton>
          <Typography variant="h6" fontWeight={600}>
            Story Details: {story.title}
          </Typography>
        </Stack>
      </Box>

      {/* Split Layout */}
      <Box sx={{ display: 'flex', height: 'calc(100% - 64px)' }}>
        {/* Left Side - Player */}
        <Box
          sx={{
            width: '50%',
            borderRight: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: alpha(theme.palette.background.paper, 0.5),
          }}
        >
          {/* Album Art */}
          <Paper
            elevation={0}
            sx={{
              width: 200,
              height: 200,
              borderRadius: 4,
              overflow: 'hidden',
              background: story.coverUrl
                ? `url(${story.coverUrl}) center/cover`
                : `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 3,
              boxShadow: `0 16px 32px ${alpha(theme.palette.primary.main, 0.15)}`,
            }}
          >
            {!story.coverUrl && (
              <Iconify
                icon="material-symbols:auto-stories"
                width={60}
                height={60}
                sx={{ color: 'white' }}
              />
            )}
          </Paper>

          {/* Track Info */}
          <Typography variant="h5" fontWeight={700} gutterBottom textAlign="center">
            {story.title}
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom textAlign="center">
            Series: {story.series}
          </Typography>

          {/* Play Button */}
          <IconButton
            size="large"
            sx={{
              bgcolor: theme.palette.primary.main,
              color: 'white',
              width: 64,
              height: 64,
              mt: 2,
              '&:hover': {
                bgcolor: theme.palette.primary.dark,
                transform: 'scale(1.05)',
              },
            }}
          >
            <PlayArrow sx={{ fontSize: 32 }} />
          </IconButton>
        </Box>

        {/* Right Side - Tabular Details */}
        <Box sx={{ width: '50%', display: 'flex', flexDirection: 'column' }}>
          <StoryDetailTabs story={story} />
        </Box>
      </Box>
    </Paper>
  );
};

// Story Detail Tabs Component
interface StoryDetailTabsProps {
  story: AudioStory;
}

const StoryDetailTabs: React.FC<StoryDetailTabsProps> = ({ story }) => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState('details');

  const tabs = [
    { id: 'details', label: 'Details', icon: 'material-symbols:info' },
    { id: 'comments', label: 'Comments', icon: 'material-symbols:comment' },
    { id: 'purchases', label: 'Purchase History', icon: 'material-symbols:shopping-cart' },
  ];

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Tab Headers */}
      <Box
        sx={{
          display: 'flex',
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          bgcolor: alpha(theme.palette.background.paper, 0.5),
        }}
      >
        {tabs.map((tab) => (
          <Box
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            sx={{
              flex: 1,
              p: 2,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              borderBottom:
                activeTab === tab.id
                  ? `2px solid ${theme.palette.primary.main}`
                  : '2px solid transparent',
              color:
                activeTab === tab.id ? theme.palette.primary.main : theme.palette.text.secondary,
              bgcolor:
                activeTab === tab.id ? alpha(theme.palette.primary.main, 0.04) : 'transparent',
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.04),
                color: theme.palette.primary.main,
              },
            }}
          >
            <Iconify icon={tab.icon} width={20} height={20} />
            <Typography variant="body2" fontWeight={activeTab === tab.id ? 600 : 500}>
              {tab.label}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Tab Content */}
      <Box sx={{ flex: 1, p: 3, overflow: 'auto' }}>
        {activeTab === 'details' && (
          <Stack spacing={2}>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Story ID
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {story.id}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Series
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {story.series}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Creator
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {story.creator}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Genre
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {story.genre || 'Story'}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Duration
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {formatDuration(story.duration)}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Pricing
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {story.paid ? `${story.currency} ${story.amount}` : 'Free'}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Statistics
              </Typography>
              <Stack direction="row" spacing={3}>
                <Box>
                  <Typography variant="h6" fontWeight={600} color="error.main">
                    {story.likeCount || 0}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Likes
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight={600} color="primary.main">
                    {story.commentCount || 0}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Comments
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </Stack>
        )}

        {activeTab === 'comments' && (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Avatar
              sx={{
                width: 64,
                height: 64,
                bgcolor: alpha(theme.palette.info.main, 0.1),
                color: theme.palette.info.main,
                mx: 'auto',
                mb: 2,
              }}
            >
              <Iconify icon="material-symbols:comment" width={32} height={32} />
            </Avatar>
            <Typography variant="h6" gutterBottom>
              Comments Coming Soon
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Comment management interface will be available in future updates.
            </Typography>
          </Box>
        )}

        {activeTab === 'purchases' && (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Avatar
              sx={{
                width: 64,
                height: 64,
                bgcolor: alpha(theme.palette.success.main, 0.1),
                color: theme.palette.success.main,
                mx: 'auto',
                mb: 2,
              }}
            >
              <Iconify icon="material-symbols:shopping-cart" width={32} height={32} />
            </Avatar>
            <Typography variant="h6" gutterBottom>
              Purchase History Coming Soon
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Track purchase analytics will be available in future updates.
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default StoryListingSection;
export { StoryListingSection as TrackListingSection }; // Backward compatibility
