'use client';

import { LightMode, DarkMode } from '@mui/icons-material';
import { IconButton, Tooltip, useTheme } from '@mui/material';
import React from 'react';

import { useThemeMode } from '../theme/ThemeProvider';

interface ThemeToggleProps {
  size?: 'small' | 'medium' | 'large';
  color?: 'inherit' | 'default' | 'primary' | 'secondary';
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ size = 'medium', color = 'default' }) => {
  const { mode, toggleTheme } = useThemeMode();
  const theme = useTheme();

  return (
    <Tooltip title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}>
      <IconButton
        onClick={toggleTheme}
        size={size}
        color={color}
        sx={{
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'scale(1.1)',
            backgroundColor: theme.palette.action.hover,
          },
        }}
      >
        {mode === 'light' ? <DarkMode /> : <LightMode />}
      </IconButton>
    </Tooltip>
  );
};
