import type { Components, Theme } from '@mui/material/styles';

const MuiBottomNavigationAction: Components<Theme>['MuiBottomNavigationAction'] = {
  styleOverrides: {
    root: ({ theme }) => ({
      minWidth: 'auto',
      '& .MuiBottomNavigationAction-label': {
        fontWeight: 'bold',
        fontSize: '0.75rem',
        marginTop: '4px',
        '&.Mui-selected': {
          fontWeight: 'bold',
          fontSize: '0.8rem',
          color:
            theme.palette.mode === 'dark'
              ? theme.palette.primary.light // Brighter color when selected in dark mode
              : theme.palette.primary.main,
        },
      },
      '& .MuiBox-root': {
        width: '25px',
        height: '25px',
      },
      '&.Mui-selected': {
        '& .MuiSvgIcon-root': {
          color:
            theme.palette.mode === 'dark'
              ? theme.palette.primary.light // Brighter icon when selected in dark mode
              : theme.palette.primary.main,
        },
      },
    }),
  },
};

export default MuiBottomNavigationAction;
