export const colors = {
  // Primary Purple Palette
  primary: {
    50: '#f3f0ff',
    100: '#e5dbff',
    200: '#d0bfff',
    300: '#b197fc',
    400: '#9775ff',
    500: '#7d52ea',
    600: '#6033e6',
    700: '#4a28b8',
    800: '#3b1f9a',
    900: '#2d1b69',
  },

  // Secondary Purple Palette
  secondary: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a78bfa',
    600: '#8b5cf6',
    700: '#7c3aed',
    800: '#6d28d9',
    900: '#581c87',
  },

  // Semantic Colors
  success: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981',
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
  },

  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },

  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },

  info: {
    50: '#f0fdff',
    100: '#ccfbf1',
    200: '#99f6e4',
    300: '#5eead4',
    400: '#22d3ee',
    500: '#06b6d4',
    600: '#0891b2',
    700: '#0e7490',
    800: '#155e75',
    900: '#164e63',
  },

  // Neutral/Gray Palette
  gray: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },

  // AMOLED Dark Theme Grays
  darkGray: {
    50: '#000000', // Pure black
    100: '#121212', // Very dark gray
    200: '#1e1e1e', // Dark gray
    300: '#333333', // Medium dark gray
    400: '#4d4d4d', // Medium gray
    500: '#666666', // Light medium gray
    600: '#808080', // Light gray
    700: '#999999', // Lighter gray
    800: '#b3b3b3', // Very light gray
    900: '#cccccc', // Almost white gray
  },
};

// Light theme palette configuration
export const lightPalette = {
  mode: 'light' as const,
  primary: {
    main: colors.primary[600],
    light: colors.primary[500],
    dark: colors.primary[700],
    contrastText: '#ffffff',
  },
  secondary: {
    main: colors.secondary[700],
    light: colors.secondary[600],
    dark: colors.secondary[800],
    contrastText: '#ffffff',
  },
  success: {
    main: colors.success[600],
    light: colors.success[400],
    dark: colors.success[700],
  },
  warning: {
    main: colors.warning[500],
    light: colors.warning[400],
    dark: colors.warning[600],
  },
  error: {
    main: colors.error[500],
    light: colors.error[400],
    dark: colors.error[600],
  },
  info: {
    main: colors.info[500],
    light: colors.info[400],
    dark: colors.info[600],
  },
  background: {
    default: colors.gray[50],
    paper: '#ffffff',
  },
  text: {
    primary: colors.gray[800],
    secondary: colors.gray[500],
  },
  divider: colors.gray[200],
  grey: colors.gray,
};

// Dark theme palette configuration (AMOLED)
export const darkPalette = {
  mode: 'dark' as const,
  primary: {
    main: colors.primary[500],
    light: colors.primary[400],
    dark: colors.primary[600],
    contrastText: '#ffffff',
  },
  secondary: {
    main: colors.secondary[600],
    light: colors.secondary[500],
    dark: colors.secondary[700],
    contrastText: '#ffffff',
  },
  success: {
    main: colors.success[600],
    light: colors.success[400],
    dark: colors.success[700],
  },
  warning: {
    main: colors.warning[500],
    light: colors.warning[400],
    dark: colors.warning[600],
  },
  error: {
    main: colors.error[500],
    light: colors.error[400],
    dark: colors.error[600],
  },
  info: {
    main: colors.info[500],
    light: colors.info[400],
    dark: colors.info[600],
  },
  background: {
    default: colors.darkGray[50], // Pure black for AMOLED
    paper: colors.darkGray[100], // Very dark gray for cards/papers
  },
  text: {
    primary: '#ffffff', // Pure white text
    secondary: colors.darkGray[800], // Light gray for secondary text
    disabled: colors.darkGray[500], // Medium gray for disabled text
  },
  divider: colors.darkGray[300], // Dark gray for dividers
  action: {
    hover: 'rgba(255, 255, 255, 0.08)',
    selected: 'rgba(255, 255, 255, 0.12)',
    disabled: 'rgba(255, 255, 255, 0.3)',
    disabledBackground: 'rgba(255, 255, 255, 0.12)',
  },
  grey: colors.darkGray,
};
