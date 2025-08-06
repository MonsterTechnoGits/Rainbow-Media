import type { Components, Theme } from '@mui/material/styles';

const MuiCard: Components<Theme>['MuiCard'] = {
  styleOverrides: {
    root: ({ theme }) => ({
      borderRadius: 16,
      boxShadow:
        theme.palette.mode === 'dark'
          ? '0 2px 8px rgba(255, 255, 255, 0.05)'
          : '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
      '&:hover': {
        boxShadow:
          theme.palette.mode === 'dark'
            ? '0 4px 12px rgba(255, 255, 255, 0.08)'
            : '0 4px 6px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.12)',
      },
    }),
  },
};

export default MuiCard;
