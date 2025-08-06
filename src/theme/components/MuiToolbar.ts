import type { Components, Theme } from '@mui/material/styles';

const MuiToolbar: Components<Theme>['MuiToolbar'] = {
  styleOverrides: {
    root: {
      minHeight: '64px !important',
      paddingLeft: '16px !important',
      paddingRight: '16px !important',
    },
  },
};

export default MuiToolbar;
