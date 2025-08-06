import type { Components, Theme } from '@mui/material/styles';

const MuiPaper: Components<Theme>['MuiPaper'] = {
  styleOverrides: {
    root: {
      borderRadius: 12,
    },
  },
};

export default MuiPaper;
