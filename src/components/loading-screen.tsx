'use client';

import { Box, Typography, useTheme, LinearProgress } from '@mui/material';

export default function LoadingScreen() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.palette.background.default,
        zIndex: 9999,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4,
          textAlign: 'center',
          maxWidth: 400,
          px: 4,
        }}
      >
        {/* Company Logo/Title */}
        <Box sx={{ mb: 2 }}>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 500,
              color: theme.palette.text.primary,
              letterSpacing: '0.5px',
              mb: 1,
            }}
          >
            iBudget
          </Typography>
        </Box>

        {/* Loading Indicator */}
        <Box sx={{ width: '100%', maxWidth: 240 }}>
          {/* Progress Bar */}
          <LinearProgress
            sx={{
              height: 2,
              borderRadius: 1,
              backgroundColor: theme.palette.divider,
              '& .MuiLinearProgress-bar': {
                backgroundColor: theme.palette.primary.main,
                borderRadius: 1,
              },
            }}
          />
        </Box>

        {/* Loading Status */}
        <Box sx={{ mt: 1 }}>
          <Typography
            variant="body2"
            sx={{
              color: theme.palette.text.secondary,
              fontSize: '0.875rem',
              fontWeight: 400,
            }}
          >
            Please wait while we loading...
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
