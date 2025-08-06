import type { Components, Theme } from '@mui/material/styles';

const MuiIconButton: Components<Theme>['MuiIconButton'] = {
  styleOverrides: {
    root: ({ theme }) => ({
      borderRadius: 8,
      padding: 10,
      '&:hover': {
        backgroundColor:
          theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
      },
    }),
  },
};

export default MuiIconButton;
