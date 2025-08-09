'use client';

import {
  AppBar,
  Toolbar as MuiToolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Box,
  useTheme,
  TextField,
  InputAdornment,
  alpha,
  Stack,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { JSX, useState } from 'react';

import Iconify from './iconify';

interface MenuOption {
  label: string;
  icon?: string;
  onClick: () => void;
}

interface ToolbarProps {
  title?: string;
  menuOptions?: MenuOption[];
  singleAction?:
    | {
        icon: string;
        onClick: () => void;
        tooltip?: string;
      }
    | JSX.Element;
  showBackButton?: boolean;
  showCloseButton?: boolean;
  onClosePress?: () => void;
  onSearch?: (query: string) => void;
  searchPlaceholder?: string;
}

export default function Toolbar({
  title,
  menuOptions,
  singleAction,
  showBackButton,
  showCloseButton = false,
  onClosePress = () => {},
  onSearch,
  searchPlaceholder = 'Search music...',
}: ToolbarProps) {
  const theme = useTheme();
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const open = Boolean(anchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = (onClick: () => void) => {
    onClick();
    handleMenuClose();
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchQuery(query);
    onSearch?.(query);
  };

  const handleSearchClear = () => {
    setSearchQuery('');
    onSearch?.('');
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        bgcolor: theme.palette.mode === 'dark' ? '#0f0f0f' : '#ffffff',
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        backdropFilter: 'blur(20px)',
        backgroundImage: 'none',
      }}
    >
      <MuiToolbar
        sx={{
          minHeight: { xs: '56px !important', sm: '64px !important' },
          px: { xs: 1.5, sm: 2, md: 3 },
          justifyContent: 'space-between',
        }}
      >
        {/* Left Section - Logo/Back Button + Title */}
        <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 0, flex: '0 0 auto' }}>
          {showCloseButton ? (
            <IconButton sx={{ borderRadius: '50%' }} onClick={onClosePress}>
              <Iconify icon={'iconamoon:close-bold'} />
            </IconButton>
          ) : showBackButton ? (
            <>
              <IconButton
                onClick={() => router.back()}
                sx={{
                  mr: 2,
                  color: theme.palette.text.primary,
                  '&:hover': {
                    bgcolor: alpha(theme.palette.text.primary, 0.08),
                  },
                }}
              >
                <Iconify icon="material-symbols:arrow-back" />
              </IconButton>
            </>
          ) : (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                mr: { xs: 1.5, sm: 2, md: 3 },
                color: '#ff0000',
              }}
            >
              <Iconify
                icon="material-symbols:music-note"
                width={{ xs: 20, sm: 24 }}
                height={{ xs: 20, sm: 24 }}
              />
              <Typography
                variant="h6"
                sx={{
                  ml: 1,
                  fontWeight: 600,
                  color: theme.palette.text.primary,
                  fontSize: '1.125rem',
                  display: { xs: 'none', sm: 'block' },
                }}
              >
                Music
              </Typography>
            </Box>
          )}
          <Typography
            variant="h6"
            sx={{
              fontWeight: 500,
              color: theme.palette.text.primary,
              fontSize: { xs: '1rem', sm: '1.125rem' },
              display: { xs: title ? 'block' : 'none', sm: 'block' },
            }}
          >
            {title}
          </Typography>
        </Box>

        {/* Center Section - Search Bar */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            flex: '1 1 auto',
            maxWidth: { xs: '300px', sm: '480px', md: '640px' },
            mx: { xs: 0.5, sm: 2, md: 3 },
          }}
        >
          {onSearch && (
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                maxWidth: { xs: '280px', sm: '400px', md: '540px' },
              }}
            >
              <TextField
                fullWidth
                size="small"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder={searchPlaceholder}
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <IconButton
                        size="small"
                        sx={{
                          color: theme.palette.text.secondary,
                          '&:hover': {
                            bgcolor: 'transparent',
                          },
                        }}
                        disableRipple
                      >
                        <Iconify icon="material-symbols:search" width={20} height={20} />
                      </IconButton>
                    </InputAdornment>
                  ),
                  endAdornment: searchQuery && (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={handleSearchClear}
                        sx={{
                          color: theme.palette.text.secondary,
                          '&:hover': {
                            bgcolor: alpha(theme.palette.text.primary, 0.08),
                          },
                        }}
                      >
                        <Iconify icon="material-symbols:close" width={20} height={20} />
                      </IconButton>
                    </InputAdornment>
                  ),
                  sx: {
                    height: { xs: '36px', sm: '40px' },
                    bgcolor: theme.palette.mode === 'dark' ? '#1c1c1c' : '#f1f3f4',
                    borderRadius: '20px',
                    '& .MuiOutlinedInput-notchedOutline': {
                      border: 'none',
                    },
                    '&:hover': {
                      bgcolor: theme.palette.mode === 'dark' ? '#222222' : '#e8eaed',
                      '& .MuiOutlinedInput-notchedOutline': {
                        border: `1px solid ${alpha(theme.palette.text.primary, 0.2)}`,
                      },
                    },
                    '&.Mui-focused': {
                      bgcolor: theme.palette.mode === 'dark' ? '#0f0f0f' : '#ffffff',
                      '& .MuiOutlinedInput-notchedOutline': {
                        border: `2px solid ${theme.palette.primary.main}`,
                      },
                    },
                  },
                }}
                sx={{
                  '& .MuiInputBase-input': {
                    color: theme.palette.text.primary,
                    fontSize: { xs: '14px', sm: '16px' },
                    fontWeight: 400,
                    '&::placeholder': {
                      color: theme.palette.text.secondary,
                      opacity: 1,
                    },
                  },
                }}
              />
            </Box>
          )}
        </Box>

        {/* Right Section - Action Buttons */}
        <Box
          sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 }, flex: '0 0 auto' }}
        >
          <Stack direction="row" spacing={{ xs: 0.25, sm: 0.5 }} alignItems="center">
            {/* Settings Action */}
            {singleAction &&
              (typeof singleAction === 'object' &&
              'icon' in singleAction &&
              'onClick' in singleAction ? (
                <IconButton
                  onClick={singleAction.onClick}
                  title={singleAction.tooltip}
                  sx={{
                    color: theme.palette.text.primary,
                    '&:hover': {
                      bgcolor: alpha(theme.palette.text.primary, 0.08),
                    },
                  }}
                >
                  <Iconify
                    icon={singleAction.icon}
                    width={{ xs: 20, sm: 24 }}
                    height={{ xs: 20, sm: 24 }}
                  />
                </IconButton>
              ) : (
                singleAction
              ))}

            {/* Menu Options */}
            {menuOptions && menuOptions.length > 0 && (
              <>
                <IconButton
                  onClick={handleMenuClick}
                  aria-label="menu options"
                  sx={{
                    color: theme.palette.text.primary,
                    '&:hover': {
                      bgcolor: alpha(theme.palette.text.primary, 0.08),
                    },
                  }}
                >
                  <Iconify
                    icon="material-symbols:more-vert"
                    width={{ xs: 20, sm: 24 }}
                    height={{ xs: 20, sm: 24 }}
                  />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={open}
                  onClose={handleMenuClose}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  PaperProps={{
                    sx: {
                      bgcolor: theme.palette.background.paper,
                      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                      borderRadius: 2,
                      mt: 1,
                      minWidth: 200,
                      boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                    },
                  }}
                >
                  {menuOptions.map((option, index) => (
                    <MenuItem
                      key={index}
                      onClick={() => handleMenuItemClick(option.onClick)}
                      sx={{
                        py: 1.5,
                        px: 2,
                        '&:hover': {
                          bgcolor: alpha(theme.palette.text.primary, 0.08),
                        },
                      }}
                    >
                      {option.icon && (
                        <Box
                          sx={{
                            mr: 1.5,
                            display: 'flex',
                            alignItems: 'center',
                            color: theme.palette.text.secondary,
                          }}
                        >
                          <Iconify icon={option.icon} width={20} height={20} />
                        </Box>
                      )}
                      <Typography variant="body2" fontWeight={400}>
                        {option.label}
                      </Typography>
                    </MenuItem>
                  ))}
                </Menu>
              </>
            )}
          </Stack>
        </Box>
      </MuiToolbar>
    </AppBar>
  );
}
