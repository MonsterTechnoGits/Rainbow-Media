'use client';

import {
  TrendingUp,
  TrendingDown,
  AttachMoney,
  LibraryMusic,
  People,
  DateRange,
  Download,
} from '@mui/icons-material';
import {
  Box,
  Paper,
  Typography,
  Card,
  useTheme,
  alpha,
  Stack,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  LinearProgress,
  Avatar,
  IconButton,
  Tooltip,
  SelectChangeEvent,
} from '@mui/material';
import React, { useState, useEffect } from 'react';

import Iconify from '@/components/iconify';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface AnalyticsSectionProps {}

// Mock data interfaces
interface RevenueData {
  month: string;
  revenue: number;
  transactions: number;
  growth: number;
}

interface OverviewStats {
  totalRevenue: number;
  monthlyRevenue: number;
  totalTracks: number;
  totalUsers: number;
  totalPurchases: number;
  revenueGrowth: number;
  trackGrowth: number;
  userGrowth: number;
}

interface TopTrack {
  id: string;
  title: string;
  artist: string;
  revenue: number;
  purchases: number;
  growth: number;
}

const AnalyticsSection: React.FC<AnalyticsSectionProps> = () => {
  const theme = useTheme();
  const [selectedRange, setSelectedRange] = useState('6months');
  const [loading, setLoading] = useState(true);
  const [overviewStats, setOverviewStats] = useState<OverviewStats | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [topTracks, setTopTracks] = useState<TopTrack[]>([]);

  // Mock data - In real app, this would come from API
  useEffect(() => {
    const loadAnalyticsData = async () => {
      setLoading(true);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock overview stats
      setOverviewStats({
        totalRevenue: 125847.5,
        monthlyRevenue: 18650.25,
        totalTracks: 342,
        totalUsers: 1547,
        totalPurchases: 2891,
        revenueGrowth: 12.5,
        trackGrowth: 8.2,
        userGrowth: 15.8,
      });

      // Mock monthly revenue data
      const months = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ];
      const mockRevenueData = months
        .slice(0, selectedRange === '3months' ? 3 : selectedRange === '6months' ? 6 : 12)
        .map((month) => ({
          month,
          revenue: 15000 + Math.random() * 10000,
          transactions: 150 + Math.random() * 100,
          growth: (Math.random() - 0.5) * 30,
        }));
      setRevenueData(mockRevenueData);

      // Mock top tracks
      setTopTracks([
        {
          id: '1',
          title: 'Sunset Dreams',
          artist: 'Electronic Waves',
          revenue: 8450.75,
          purchases: 234,
          growth: 25.4,
        },
        {
          id: '2',
          title: 'City Lights',
          artist: 'Urban Beats',
          revenue: 7821.5,
          purchases: 198,
          growth: 18.7,
        },
        {
          id: '3',
          title: 'Ocean Breeze',
          artist: 'Chill Vibes',
          revenue: 6934.25,
          purchases: 167,
          growth: -5.2,
        },
        {
          id: '4',
          title: 'Mountain High',
          artist: 'Nature Sounds',
          revenue: 6245.8,
          purchases: 145,
          growth: 12.8,
        },
        {
          id: '5',
          title: 'Night Drive',
          artist: 'Synthwave Co.',
          revenue: 5678.9,
          purchases: 123,
          growth: 33.1,
        },
      ]);

      setLoading(false);
    };

    loadAnalyticsData();
  }, [selectedRange]);

  const handleRangeChange = (event: SelectChangeEvent<string>) => {
    setSelectedRange(event.target.value);
  };

  if (loading) {
    return (
      <Box sx={{ p: 4 }}>
        <AnalyticsLoadingSkeleton />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Analytics & Revenue
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Track your platform performance and revenue insights
          </Typography>
        </Box>

        <Stack direction="row" spacing={2}>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={selectedRange}
              label="Time Range"
              onChange={handleRangeChange}
              startAdornment={<DateRange sx={{ mr: 1, fontSize: 20 }} />}
            >
              <MenuItem value="3months">Last 3 Months</MenuItem>
              <MenuItem value="6months">Last 6 Months</MenuItem>
              <MenuItem value="12months">Last 12 Months</MenuItem>
            </Select>
          </FormControl>

          <Tooltip title="Export Report">
            <IconButton
              size="medium"
              sx={{
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) },
              }}
            >
              <Download />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      {/* Overview Stats Cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: '1fr 1fr',
            md: '1fr 1fr 1fr 1fr',
            lg: 'repeat(6, 1fr)',
          },
          gap: 3,
          mb: 4,
        }}
      >
        <StatsCard
          title="Total Revenue"
          value={`₹${overviewStats?.totalRevenue.toLocaleString()}`}
          growth={overviewStats?.revenueGrowth}
          icon={<AttachMoney />}
          color="success"
        />
        <StatsCard
          title="Monthly Revenue"
          value={`₹${overviewStats?.monthlyRevenue.toLocaleString()}`}
          growth={8.5}
          icon={<TrendingUp />}
          color="info"
        />
        <StatsCard
          title="Total Tracks"
          value={overviewStats?.totalTracks.toLocaleString() || '0'}
          growth={overviewStats?.trackGrowth}
          icon={<LibraryMusic />}
          color="warning"
        />
        <StatsCard
          title="Active Users"
          value={overviewStats?.totalUsers.toLocaleString() || '0'}
          growth={overviewStats?.userGrowth}
          icon={<People />}
          color="secondary"
        />
        <StatsCard
          title="Total Sales"
          value={`${overviewStats?.totalPurchases.toLocaleString()}`}
          growth={22.3}
          icon={<Iconify icon="material-symbols:shopping-bag" />}
          color="primary"
        />
        <StatsCard
          title="Avg. Order Value"
          value="₹43.52"
          growth={15.8}
          icon={<Iconify icon="material-symbols:trending-up" />}
          color="info"
        />
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md: '1fr 1fr',
            lg: '2fr 1fr',
            xl: '3fr 2fr',
          },
          gap: 4,
        }}
      >
        {/* Revenue Chart */}
        <Paper
          sx={{
            p: 3,
            borderRadius: 3,
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            height: 400,
          }}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
            <Box>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Revenue Trend
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Monthly revenue performance over selected period
              </Typography>
            </Box>
          </Stack>
          <RevenueChart data={revenueData} />
        </Paper>

        {/* Top Performing Tracks */}
        <Paper
          sx={{
            p: 3,
            borderRadius: 3,
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            height: 400,
          }}
        >
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Top Performing Tracks
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Highest earning tracks this period
          </Typography>

          <Stack spacing={2} sx={{ maxHeight: 300, overflowY: 'auto' }}>
            {topTracks.map((track, index) => (
              <Paper
                key={track.id}
                elevation={0}
                sx={{
                  p: 2,
                  bgcolor: alpha(theme.palette.background.paper, 0.5),
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  borderRadius: 2,
                }}
              >
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      color: theme.palette.primary.main,
                      fontSize: '0.875rem',
                      fontWeight: 600,
                    }}
                  >
                    {index + 1}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" fontWeight={600} noWrap>
                      {track.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {track.artist}
                    </Typography>
                  </Box>
                  <Stack alignItems="flex-end" spacing={0.5}>
                    <Typography variant="body2" fontWeight={600}>
                      ₹{track.revenue.toLocaleString()}
                    </Typography>
                    <Chip
                      label={`${track.growth > 0 ? '+' : ''}${track.growth.toFixed(1)}%`}
                      size="small"
                      color={track.growth > 0 ? 'success' : 'error'}
                      sx={{ height: 18, fontSize: '0.7rem' }}
                    />
                  </Stack>
                </Stack>
              </Paper>
            ))}
          </Stack>
        </Paper>
      </Box>

      {/* Additional Analytics Cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: '1fr',
            md: '1fr 1fr',
            lg: '1fr 1fr 1fr',
            xl: '1fr 1fr 1fr 1fr',
          },
          gap: 4,
          mt: 4,
        }}
      >
        <Paper
          sx={{
            p: 3,
            borderRadius: 3,
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}
        >
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Purchase Analytics
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Transaction insights and conversion metrics
          </Typography>

          <Stack spacing={3}>
            <Box>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 1 }}
              >
                <Typography variant="body2" color="text.secondary">
                  Total Purchases
                </Typography>
                <Typography variant="h6" fontWeight={600}>
                  {overviewStats?.totalPurchases.toLocaleString()}
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={75}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 3,
                    bgcolor: theme.palette.primary.main,
                  },
                }}
              />
            </Box>

            <Box>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 1 }}
              >
                <Typography variant="body2" color="text.secondary">
                  Conversion Rate
                </Typography>
                <Typography variant="h6" fontWeight={600}>
                  24.8%
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={24.8}
                color="success"
                sx={{
                  height: 6,
                  borderRadius: 3,
                  bgcolor: alpha(theme.palette.success.main, 0.1),
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 3,
                  },
                }}
              />
            </Box>

            <Box>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 1 }}
              >
                <Typography variant="body2" color="text.secondary">
                  Average Order Value
                </Typography>
                <Typography variant="h6" fontWeight={600}>
                  ₹43.52
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={65}
                color="warning"
                sx={{
                  height: 6,
                  borderRadius: 3,
                  bgcolor: alpha(theme.palette.warning.main, 0.1),
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 3,
                  },
                }}
              />
            </Box>
          </Stack>
        </Paper>

        <Paper
          sx={{
            p: 3,
            borderRadius: 3,
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}
        >
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Platform Insights
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            User engagement and platform statistics
          </Typography>

          <Stack spacing={2}>
            <PlatformMetric
              icon="material-symbols:play-arrow"
              label="Total Plays"
              value="1.2M"
              growth={18.5}
            />
            <PlatformMetric
              icon="material-symbols:favorite"
              label="Total Likes"
              value="45.7K"
              growth={22.1}
            />
            <PlatformMetric
              icon="material-symbols:comment"
              label="Comments"
              value="12.3K"
              growth={-5.2}
            />
            <PlatformMetric
              icon="material-symbols:share"
              label="Shares"
              value="8.9K"
              growth={31.4}
            />
          </Stack>
        </Paper>

        {/* User Engagement Card */}
        <Paper
          sx={{
            p: 3,
            borderRadius: 3,
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}
        >
          <Typography variant="h6" fontWeight={600} gutterBottom>
            User Engagement
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Daily active users and session metrics
          </Typography>

          <Stack spacing={3}>
            <Box>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 1 }}
              >
                <Typography variant="body2" color="text.secondary">
                  Daily Active Users
                </Typography>
                <Typography variant="h6" fontWeight={600}>
                  1,247
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={82}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  bgcolor: alpha(theme.palette.info.main, 0.1),
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 3,
                    bgcolor: theme.palette.info.main,
                  },
                }}
              />
            </Box>

            <Box>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 1 }}
              >
                <Typography variant="body2" color="text.secondary">
                  Avg. Session Duration
                </Typography>
                <Typography variant="h6" fontWeight={600}>
                  12:34
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={67}
                color="warning"
                sx={{
                  height: 6,
                  borderRadius: 3,
                  bgcolor: alpha(theme.palette.warning.main, 0.1),
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 3,
                  },
                }}
              />
            </Box>
          </Stack>
        </Paper>

        {/* Content Performance Card */}
        <Paper
          sx={{
            p: 3,
            borderRadius: 3,
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}
        >
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Content Performance
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Track performance and engagement rates
          </Typography>

          <Stack spacing={2}>
            <PlatformMetric
              icon="material-symbols:music-note"
              label="Top Genre"
              value="Electronic"
              growth={34.2}
            />
            <PlatformMetric
              icon="material-symbols:star"
              label="Avg. Rating"
              value="4.7/5"
              growth={8.1}
            />
            <PlatformMetric
              icon="material-symbols:download"
              label="Downloads"
              value="89.2K"
              growth={28.7}
            />
          </Stack>
        </Paper>

        {/* Recent Activity Card */}
        <Paper
          sx={{
            p: 3,
            borderRadius: 3,
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}
        >
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Recent Activity
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Latest platform activities and notifications
          </Typography>

          <Stack spacing={2}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar
                sx={{ width: 24, height: 24, bgcolor: alpha(theme.palette.success.main, 0.1) }}
              >
                <Iconify
                  icon="material-symbols:add"
                  width={12}
                  height={12}
                  sx={{ color: theme.palette.success.main }}
                />
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" fontWeight={600}>
                  New track uploaded
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  2 minutes ago
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar
                sx={{ width: 24, height: 24, bgcolor: alpha(theme.palette.primary.main, 0.1) }}
              >
                <Iconify
                  icon="material-symbols:person"
                  width={12}
                  height={12}
                  sx={{ color: theme.palette.primary.main }}
                />
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" fontWeight={600}>
                  New user registered
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  5 minutes ago
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar
                sx={{ width: 24, height: 24, bgcolor: alpha(theme.palette.warning.main, 0.1) }}
              >
                <Iconify
                  icon="material-symbols:shopping-cart"
                  width={12}
                  height={12}
                  sx={{ color: theme.palette.warning.main }}
                />
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" fontWeight={600}>
                  Track purchased
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  8 minutes ago
                </Typography>
              </Box>
            </Box>
          </Stack>
        </Paper>
      </Box>
    </Box>
  );
};

// Stats Card Component
interface StatsCardProps {
  title: string;
  value: string;
  growth?: number;
  icon: React.ReactNode;
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'info' | 'error';
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, growth, icon, color }) => {
  const theme = useTheme();

  return (
    <Card
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 3,
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        background: `linear-gradient(135deg, ${alpha(theme.palette[color].main, 0.05)}, ${alpha(theme.palette[color].main, 0.02)})`,
        position: 'relative',
        overflow: 'visible',
      }}
    >
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4" fontWeight={700} color="text.primary" sx={{ mb: 1 }}>
            {value}
          </Typography>
          {growth !== undefined && (
            <Stack direction="row" alignItems="center" spacing={0.5}>
              {growth > 0 ? (
                <TrendingUp sx={{ fontSize: 16, color: theme.palette.success.main }} />
              ) : (
                <TrendingDown sx={{ fontSize: 16, color: theme.palette.error.main }} />
              )}
              <Typography
                variant="caption"
                sx={{
                  color: growth > 0 ? theme.palette.success.main : theme.palette.error.main,
                  fontWeight: 600,
                }}
              >
                {growth > 0 ? '+' : ''}
                {growth.toFixed(1)}%
              </Typography>
              <Typography variant="caption" color="text.secondary">
                vs last period
              </Typography>
            </Stack>
          )}
        </Box>

        <Avatar
          sx={{
            width: 48,
            height: 48,
            bgcolor: alpha(theme.palette[color].main, 0.1),
            color: theme.palette[color].main,
          }}
        >
          {icon}
        </Avatar>
      </Stack>
    </Card>
  );
};

// Revenue Chart Component
interface RevenueChartProps {
  data: RevenueData[];
}

const RevenueChart: React.FC<RevenueChartProps> = ({ data }) => {
  const theme = useTheme();
  const maxRevenue = Math.max(...data.map((d) => d.revenue));

  return (
    <Box sx={{ height: 300, position: 'relative' }}>
      {/* Chart bars */}
      <Stack direction="row" alignItems="end" spacing={1} sx={{ height: '100%', px: 2 }}>
        {data.map((item, index) => {
          const height = (item.revenue / maxRevenue) * 100;
          return (
            <Box
              key={index}
              sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            >
              <Tooltip
                title={
                  <Stack spacing={0.5}>
                    <Typography variant="caption" fontWeight={600}>
                      {item.month}
                    </Typography>
                    <Typography variant="caption">
                      Revenue: ₹{item.revenue.toLocaleString()}
                    </Typography>
                    <Typography variant="caption">Transactions: {item.transactions}</Typography>
                    <Typography
                      variant="caption"
                      color={
                        item.growth > 0 ? theme.palette.success.main : theme.palette.error.main
                      }
                    >
                      Growth: {item.growth > 0 ? '+' : ''}
                      {item.growth.toFixed(1)}%
                    </Typography>
                  </Stack>
                }
              >
                <Box
                  sx={{
                    width: '100%',
                    maxWidth: 40,
                    height: `${height}%`,
                    bgcolor: alpha(theme.palette.primary.main, 0.8),
                    borderRadius: '4px 4px 0 0',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: theme.palette.primary.main,
                      transform: 'scaleY(1.05)',
                    },
                  }}
                />
              </Tooltip>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, fontWeight: 500 }}>
                {item.month}
              </Typography>
            </Box>
          );
        })}
      </Stack>

      {/* Y-axis labels */}
      <Box
        sx={{
          position: 'absolute',
          left: 0,
          top: 0,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          py: 2,
        }}
      >
        {[maxRevenue, maxRevenue * 0.75, maxRevenue * 0.5, maxRevenue * 0.25, 0].map(
          (value, index) => (
            <Typography key={index} variant="caption" color="text.secondary">
              ₹{(value / 1000).toFixed(0)}K
            </Typography>
          )
        )}
      </Box>
    </Box>
  );
};

// Platform Metric Component
interface PlatformMetricProps {
  icon: string;
  label: string;
  value: string;
  growth: number;
}

const PlatformMetric: React.FC<PlatformMetricProps> = ({ icon, label, value, growth }) => {
  const theme = useTheme();

  return (
    <Stack direction="row" alignItems="center" spacing={2}>
      <Avatar
        sx={{
          width: 36,
          height: 36,
          bgcolor: alpha(theme.palette.primary.main, 0.1),
          color: theme.palette.primary.main,
        }}
      >
        <Iconify icon={icon} width={20} height={20} />
      </Avatar>
      <Box sx={{ flex: 1 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
          <Typography variant="body2" fontWeight={600}>
            {value}
          </Typography>
        </Stack>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 0.5 }}>
          <Box />
          <Stack direction="row" alignItems="center" spacing={0.5}>
            {growth > 0 ? (
              <TrendingUp sx={{ fontSize: 14, color: theme.palette.success.main }} />
            ) : (
              <TrendingDown sx={{ fontSize: 14, color: theme.palette.error.main }} />
            )}
            <Typography
              variant="caption"
              sx={{
                color: growth > 0 ? theme.palette.success.main : theme.palette.error.main,
                fontWeight: 600,
              }}
            >
              {growth > 0 ? '+' : ''}
              {growth.toFixed(1)}%
            </Typography>
          </Stack>
        </Stack>
      </Box>
    </Stack>
  );
};

// Loading Skeleton Component
const AnalyticsLoadingSkeleton: React.FC = () => {
  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ width: 200, height: 32, bgcolor: 'grey.300', borderRadius: 1, mb: 1 }} />
        <Box sx={{ width: 300, height: 16, bgcolor: 'grey.200', borderRadius: 1 }} />
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr 1fr' },
          gap: 3,
          mb: 4,
        }}
      >
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} sx={{ p: 3, borderRadius: 3 }}>
            <Box sx={{ width: '60%', height: 16, bgcolor: 'grey.200', borderRadius: 1, mb: 2 }} />
            <Box sx={{ width: '80%', height: 32, bgcolor: 'grey.300', borderRadius: 1, mb: 1 }} />
            <Box sx={{ width: '40%', height: 14, bgcolor: 'grey.200', borderRadius: 1 }} />
          </Card>
        ))}
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' },
          gap: 3,
        }}
      >
        <Card sx={{ p: 3, borderRadius: 3, height: 400 }}>
          <Box sx={{ width: '30%', height: 24, bgcolor: 'grey.300', borderRadius: 1, mb: 3 }} />
          <Box sx={{ width: '100%', height: 300, bgcolor: 'grey.100', borderRadius: 1 }} />
        </Card>

        <Card sx={{ p: 3, borderRadius: 3, height: 400 }}>
          <Box sx={{ width: '50%', height: 24, bgcolor: 'grey.300', borderRadius: 1, mb: 3 }} />
          {[1, 2, 3, 4, 5].map((i) => (
            <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Box sx={{ width: 32, height: 32, bgcolor: 'grey.200', borderRadius: '50%' }} />
              <Box sx={{ flex: 1 }}>
                <Box
                  sx={{ width: '70%', height: 14, bgcolor: 'grey.200', borderRadius: 1, mb: 1 }}
                />
                <Box sx={{ width: '50%', height: 12, bgcolor: 'grey.100', borderRadius: 1 }} />
              </Box>
              <Box sx={{ width: 60, height: 16, bgcolor: 'grey.200', borderRadius: 1 }} />
            </Box>
          ))}
        </Card>
      </Box>
    </Box>
  );
};

export default AnalyticsSection;
