# MUI Theme Global Overrides Guide

## 1. Palette Customization (Colors)

```typescript
palette: {
  mode: 'light',
  primary: {
    main: '#1976d2',        // Main primary color
    light: '#42a5f5',       // Light variant
    dark: '#1565c0',        // Dark variant
    contrastText: '#fff',   // Text color on primary
  },
  secondary: {
    main: '#dc004e',
    light: '#ff5983',
    dark: '#9a0036',
    contrastText: '#fff',
  },
  // Custom colors
  success: { main: '#2e7d32' },
  warning: { main: '#ed6c02' },
  error: { main: '#d32f2f' },
  info: { main: '#0288d1' },
  
  // Background colors
  background: {
    default: '#fafafa',     // App background
    paper: '#fff',          // Card/Paper background
  },
  
  // Text colors
  text: {
    primary: '#212121',     // Primary text
    secondary: '#757575',   // Secondary text
    disabled: '#bdbdbd',    // Disabled text
  },
  
  // Action colors (hover, focus, etc.)
  action: {
    hover: 'rgba(0, 0, 0, 0.04)',
    selected: 'rgba(0, 0, 0, 0.08)',
    disabled: 'rgba(0, 0, 0, 0.26)',
    disabledBackground: 'rgba(0, 0, 0, 0.12)',
  },
}
```

## 2. Component Style Overrides

```typescript
components: {
  // Button overrides
  MuiButton: {
    styleOverrides: {
      root: {
        textTransform: 'none',  // Remove uppercase
        fontWeight: 600,
        borderRadius: 8,
      },
      contained: {
        boxShadow: 'none',     // Remove shadow
        '&:hover': {
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
        },
      },
    },
    // Default props
    defaultProps: {
      disableElevation: true,
    },
  },
  
  // AppBar/Toolbar overrides
  MuiAppBar: {
    styleOverrides: {
      root: {
        backgroundColor: '#ffffff',
        color: '#000000',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  
  // Typography overrides
  MuiTypography: {
    styleOverrides: {
      h1: { fontWeight: 700 },
      h2: { fontWeight: 600 },
      body1: { lineHeight: 1.6 },
    },
  },
  
  // Input field overrides
  MuiTextField: {
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': {
          borderRadius: 12,
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#1976d2',
          },
        },
      },
    },
  },
}
```

## 3. Typography Customization

```typescript
typography: {
  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  fontSize: 14,
  fontWeightLight: 300,
  fontWeightRegular: 400,
  fontWeightMedium: 500,
  fontWeightBold: 700,
  
  // Heading styles
  h1: {
    fontSize: '2.5rem',
    fontWeight: 700,
    lineHeight: 1.2,
  },
  h2: {
    fontSize: '2rem',
    fontWeight: 600,
    lineHeight: 1.3,
  },
  
  // Body text styles
  body1: {
    fontSize: '1rem',
    lineHeight: 1.6,
  },
  body2: {
    fontSize: '0.875rem',
    lineHeight: 1.5,
  },
  
  // Button text
  button: {
    textTransform: 'none',
    fontWeight: 600,
  },
}
```

## 4. Shape (Border Radius)

```typescript
shape: {
  borderRadius: 8,  // Global border radius
}
```

## 5. Spacing (Padding/Margin)

```typescript
spacing: 8,  // Base spacing unit (default is 8px)
// Usage: theme.spacing(1) = 8px, theme.spacing(2) = 16px
```

## 6. Shadows

```typescript
shadows: [
  'none',
  '0px 1px 2px rgba(0, 0, 0, 0.05)',
  '0px 1px 3px rgba(0, 0, 0, 0.1)',
  // ... more shadow definitions
],
```

## 7. Breakpoints (Responsive)

```typescript
breakpoints: {
  values: {
    xs: 0,
    sm: 600,
    md: 900,
    lg: 1200,
    xl: 1536,
  },
}
```

## 8. Z-Index

```typescript
zIndex: {
  mobileStepper: 1000,
  speedDial: 1050,
  appBar: 1100,
  drawer: 1200,
  modal: 1300,
  snackbar: 1400,
  tooltip: 1500,
}
```

## 9. Using Theme in Components

```typescript
import { useTheme } from '@mui/material/styles';

const MyComponent = () => {
  const theme = useTheme();
  
  return (
    <div
      style={{
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        padding: theme.spacing(2),
        borderRadius: theme.shape.borderRadius,
      }}
    >
      Themed content
    </div>
  );
};
```

## 10. sx Prop Usage

```typescript
<Box
  sx={{
    bgcolor: 'primary.main',
    color: 'primary.contrastText',
    p: 2,  // padding: theme.spacing(2)
    m: 1,  // margin: theme.spacing(1)
    borderRadius: 1,  // theme.shape.borderRadius
    '&:hover': {
      bgcolor: 'primary.dark',
    },
  }}
>
  Content
</Box>
```