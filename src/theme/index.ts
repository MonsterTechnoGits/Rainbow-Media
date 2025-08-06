import { createTheme, type ThemeOptions } from '@mui/material/styles';

import * as componentOverrides from './components';
import { lightPalette, darkPalette } from './palette';

// Base theme options shared by both light and dark themes
const baseTheme: ThemeOptions = {
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: componentOverrides.MuiButton,
    MuiPaper: componentOverrides.MuiPaper,
    MuiAppBar: componentOverrides.MuiAppBar,
    MuiToolbar: componentOverrides.MuiToolbar,
    MuiIconButton: componentOverrides.MuiIconButton,
    MuiCard: componentOverrides.MuiCard,
    MuiTextField: componentOverrides.MuiTextField,
    MuiBottomNavigation: componentOverrides.MuiBottomNavigation,
    MuiBottomNavigationAction: componentOverrides.MuiBottomNavigationAction,
  },
};

// Light theme configuration
const lightTheme = createTheme({
  ...baseTheme,
  palette: lightPalette,
});

// AMOLED Dark theme configuration
const darkTheme = createTheme({
  ...baseTheme,
  palette: darkPalette,
});

export { lightTheme, darkTheme };
