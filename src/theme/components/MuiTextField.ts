import type { Components, Theme } from '@mui/material/styles';

const MuiTextField: Components<Theme>['MuiTextField'] = {
  styleOverrides: {
    root: {
      '& .MuiOutlinedInput-root': {
        borderRadius: 10,
      },
    },
  },
};

export default MuiTextField;
