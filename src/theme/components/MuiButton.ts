import type { Components, Theme } from '@mui/material/styles';

const MuiButton: Components<Theme>['MuiButton'] = {
  styleOverrides: {
    root: {
      borderRadius: 8,
      textTransform: 'none',
      fontSize: '0.95rem',
      fontWeight: 500,
      padding: '8px 16px',
    },
    contained: {
      boxShadow: 'none',
      '&:hover': {
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
      },
    },
    outlined: {
      borderWidth: '1.5px',
      '&:hover': {
        borderWidth: '1.5px',
      },
    },
  },
};

export default MuiButton;
