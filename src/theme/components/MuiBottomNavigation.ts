import type { Components, Theme } from '@mui/material/styles';

const MuiBottomNavigation: Components<Theme>['MuiBottomNavigation'] = {
  styleOverrides: {
    root: {
      height: 80,
      paddingTop: 8,
      paddingBottom: 8,
    },
  },
};

export default MuiBottomNavigation;
