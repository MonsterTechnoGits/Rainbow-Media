'use client';

import { Shield } from '@mui/icons-material';
import {
  Box,
  Typography,
  Paper,
  Stack,
  Avatar,
  useTheme,
  alpha,
  Button,
  Tabs,
  Tab,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

import Iconify from '@/components/iconify';
import Toolbar from '@/components/Toolbar';
import UploadButton from '@/components/UploadButton';
import { useAuth } from '@/contexts/AuthContext';

import AnalyticsSection from './AnalyticsSection';
import StoryListingSection from './TrackListingSection';
export default function AdminPageView() {
  const theme = useTheme();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    // Redirect if not admin or not authenticated
    if (!loading && (!user || !user.isAdmin)) {
      router.push('/');
    }
  }, [user, loading, router]);

  // Show loading while checking auth
  if (loading) {
    return (
      <Box sx={{ py: 4, px: { xs: 2, sm: 3, md: 4 } }}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="60vh"
          flexDirection="column"
        >
          <Box sx={{ mb: 2 }}>
            <Iconify
              icon="material-symbols:admin-panel-settings"
              width={48}
              height={48}
              sx={{ color: theme.palette.primary.main }}
            />
          </Box>
          <Typography variant="h6" color="text.secondary">
            Verifying admin access...
          </Typography>
        </Box>
      </Box>
    );
  }

  // Show access denied if not admin
  if (!user || !user.isAdmin) {
    return (
      <Box sx={{ py: 4, px: { xs: 2, sm: 3, md: 4 } }}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="60vh"
          flexDirection="column"
        >
          <Paper
            sx={{
              p: 4,
              textAlign: 'center',
              borderRadius: 3,
              maxWidth: 400,
            }}
          >
            <Avatar
              sx={{
                bgcolor: alpha(theme.palette.error.main, 0.1),
                color: theme.palette.error.main,
                width: 64,
                height: 64,
                mx: 'auto',
                mb: 2,
              }}
            >
              <Shield sx={{ fontSize: 32 }} />
            </Avatar>
            <Typography variant="h5" fontWeight={600} gutterBottom>
              Access Denied
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              You don't have permission to access this page. Admin privileges are required.
            </Typography>
            <Button
              variant="contained"
              onClick={() => router.push('/')}
              startIcon={<Iconify icon="material-symbols:home" width={20} height={20} />}
            >
              Go Home
            </Button>
          </Paper>
        </Box>
      </Box>
    );
  }
  return (
    <>
      <Toolbar title="Admin Dashboard" showBackButton={true} singleAction={<UploadButton />} />
      <Box sx={{ pt: { xs: 9, sm: 12 }, pb: 4, px: { xs: 2, sm: 3, md: 4 } }}>
        <Stack spacing={4} sx={{ maxWidth: 'none' }}>
          {/* Admin Tabs */}
          <AdminTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        </Stack>
      </Box>
    </>
  );
}

// Admin Tabs Component
interface AdminTabsProps {
  activeTab: number;
  setActiveTab: (tab: number) => void;
}

const AdminTabs: React.FC<AdminTabsProps> = ({ activeTab, setActiveTab }) => {
  const theme = useTheme();

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const tabs = [
    {
      label: 'Story Management',
      icon: 'material-symbols:library-books',
      component: <StoryListingSection />,
    },
    {
      label: 'Analytics & Revenue',
      icon: 'material-symbols:analytics',
      component: <AnalyticsSection />,
    },
  ];

  return (
    <Paper
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
      }}
    >
      {/* Tab Headers */}
      <Box
        sx={{
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          bgcolor: alpha(theme.palette.background.paper, 0.8),
        }}
      >
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{
            '& .MuiTab-root': {
              minHeight: 64,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '1rem',
              '&.Mui-selected': {
                color: theme.palette.primary.main,
              },
            },
            '& .MuiTabs-indicator': {
              height: 3,
              borderRadius: '3px 3px 0 0',
              bgcolor: theme.palette.primary.main,
            },
          }}
        >
          {tabs.map((tab, index) => (
            <Tab
              key={index}
              label={
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Iconify icon={tab.icon} width={20} height={20} />
                  <Typography variant="body1" fontWeight="inherit">
                    {tab.label}
                  </Typography>
                </Stack>
              }
              sx={{
                px: 4,
                py: 2,
              }}
            />
          ))}
        </Tabs>
      </Box>

      {/* Tab Content */}
      <Box>
        {tabs.map((tab, index) => (
          <Box key={index} hidden={activeTab !== index}>
            {activeTab === index && tab.component}
          </Box>
        ))}
      </Box>
    </Paper>
  );
};
