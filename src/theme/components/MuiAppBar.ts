import type { Components, Theme } from '@mui/material/styles';

const MuiAppBar: Components<Theme>['MuiAppBar'] = {
  styleOverrides: {
    root: {
      boxShadow: 'none',
      borderBottom: '1px solid',
      borderColor: 'divider',
    },
  },
};

export default MuiAppBar;
