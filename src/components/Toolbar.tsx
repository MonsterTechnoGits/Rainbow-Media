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
  Fade,
  alpha,
  Paper,
  Stack,
  Avatar,
  Chip,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import Iconify from './iconify';

interface MenuOption {
  label: string;
  icon?: string;
  onClick: () => void;
}

interface ToolbarProps {
  title: string;
  menuOptions?: MenuOption[];
  singleAction?: {
    icon: string;
    onClick: () => void;
    tooltip?: string;
  };
  showBackButton?: boolean;
  onSearch?: (query: string) => void;
  searchPlaceholder?: string;
}

export default function Toolbar({
  title,
  menuOptions,
  singleAction,
  showBackButton,
  onSearch,
  searchPlaceholder = 'Search music...',
}: ToolbarProps) {
  const theme = useTheme();
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
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

  const handleSearchToggle = () => {
    setIsSearchOpen(!isSearchOpen);
    if (isSearchOpen) {
      setSearchQuery('');
      onSearch?.('');
    }
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
        bgcolor: 'transparent',
        backgroundImage: 'none',
      }}
    >
      {/* Main Header Card */}
      <Paper
        elevation={0}
        sx={{
          m: 2,
          borderRadius: 4,
          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`,
        }}
      >
        {/* Decorative Elements */}
        <Box
          sx={{
            position: 'absolute',
            top: -20,
            right: -20,
            width: 100,
            height: 100,
            borderRadius: '50%',
            bgcolor: 'rgba(255,255,255,0.1)',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: -30,
            left: -30,
            width: 80,
            height: 80,
            borderRadius: '50%',
            bgcolor: 'rgba(255,255,255,0.05)',
          }}
        />

        <MuiToolbar
          sx={{
            minHeight: '72px !important',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* Left Section */}
          <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
            {showBackButton ? (
              <IconButton
                sx={{
                  color: 'white',
                  bgcolor: 'rgba(255,255,255,0.15)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' },
                  mr: 2,
                  backdropFilter: 'blur(10px)',
                }}
                onClick={() => router.back()}
              >
                <Iconify icon="material-symbols:arrow-back" />
              </IconButton>
            ) : (
              <Avatar
                sx={{
                  width: 48,
                  height: 48,
                  bgcolor: 'rgba(255,255,255,0.2)',
                  mr: 2,
                }}
              >
                <Iconify icon="material-symbols:music-note" width={24} height={24} />
              </Avatar>
            )}

            {/* Title Section */}
            <Box sx={{ minWidth: 0 }}>
              <Fade in={!isSearchOpen} timeout={200}>
                <Box
                  sx={{
                    position: isSearchOpen ? 'absolute' : 'static',
                    opacity: isSearchOpen ? 0 : 1,
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Typography
                    variant="h5"
                    component="h1"
                    sx={{
                      fontWeight: 700,
                      color: 'white',
                      mb: 0.5,
                    }}
                  >
                    {title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'rgba(255,255,255,0.8)',
                      fontWeight: 500,
                    }}
                  >
                    Your personal music player
                  </Typography>
                </Box>
              </Fade>

              {/* Search Field */}
              <Fade in={isSearchOpen} timeout={200}>
                <Paper
                  elevation={0}
                  sx={{
                    position: isSearchOpen ? 'static' : 'absolute',
                    width: isSearchOpen ? 320 : 0,
                    opacity: isSearchOpen ? 1 : 0,
                    transition: 'all 0.2s ease',
                    bgcolor: 'rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: 3,
                    border: '1px solid rgba(255,255,255,0.2)',
                  }}
                >
                  <TextField
                    fullWidth
                    size="small"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder={searchPlaceholder}
                    variant="outlined"
                    autoFocus={isSearchOpen}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Iconify
                            icon="material-symbols:search"
                            sx={{ color: 'rgba(255,255,255,0.7)' }}
                          />
                        </InputAdornment>
                      ),
                      endAdornment: searchQuery && (
                        <InputAdornment position="end">
                          <IconButton
                            size="small"
                            onClick={handleSearchClear}
                            sx={{
                              color: 'rgba(255,255,255,0.7)',
                              '&:hover': {
                                color: 'white',
                                bgcolor: 'rgba(255,255,255,0.1)',
                              },
                            }}
                          >
                            <Iconify icon="material-symbols:close" />
                          </IconButton>
                        </InputAdornment>
                      ),
                      sx: {
                        '& .MuiOutlinedInput-notchedOutline': {
                          border: 'none',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          border: 'none',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          border: 'none',
                        },
                        bgcolor: 'transparent',
                      },
                    }}
                    sx={{
                      '& .MuiInputBase-input': {
                        color: 'white',
                        fontWeight: 500,
                        '&::placeholder': {
                          color: 'rgba(255,255,255,0.7)',
                          opacity: 1,
                        },
                      },
                    }}
                  />
                </Paper>
              </Fade>
            </Box>
          </Box>

          {/* Right Section */}
          <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Search Results Chip */}
            {isSearchOpen && searchQuery && (
              <Chip
                label={`${searchQuery.length > 10 ? searchQuery.substring(0, 10) + '...' : searchQuery}`}
                size="small"
                onDelete={handleSearchClear}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.15)',
                  color: 'white',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  '& .MuiChip-deleteIcon': {
                    color: 'rgba(255,255,255,0.7)',
                    '&:hover': {
                      color: 'white',
                    },
                  },
                }}
              />
            )}

            <Stack direction="row" spacing={1} alignItems="center">
              {/* Search Toggle */}
              {onSearch && (
                <Paper
                  elevation={0}
                  sx={{
                    borderRadius: 2,
                    bgcolor: isSearchOpen ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                  }}
                >
                  <IconButton
                    sx={{
                      color: 'white',
                      '&:hover': {
                        bgcolor: 'rgba(255,255,255,0.1)',
                      },
                    }}
                    onClick={handleSearchToggle}
                    title="Search"
                  >
                    <Iconify
                      icon={isSearchOpen ? 'material-symbols:close' : 'material-symbols:search'}
                    />
                  </IconButton>
                </Paper>
              )}

              {/* Settings Action */}
              {singleAction && (
                <Paper
                  elevation={0}
                  sx={{
                    borderRadius: 2,
                    bgcolor: 'rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                  }}
                >
                  <IconButton
                    sx={{
                      color: 'white',
                      '&:hover': {
                        bgcolor: 'rgba(255,255,255,0.1)',
                      },
                    }}
                    onClick={singleAction.onClick}
                    title={singleAction.tooltip}
                  >
                    <Iconify icon={singleAction.icon} />
                  </IconButton>
                </Paper>
              )}

              {/* Menu Options */}
              {menuOptions && menuOptions.length > 0 && (
                <>
                  <Paper
                    elevation={0}
                    sx={{
                      borderRadius: 2,
                      bgcolor: 'rgba(255,255,255,0.15)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.2)',
                    }}
                  >
                    <IconButton
                      sx={{
                        color: 'white',
                        '&:hover': {
                          bgcolor: 'rgba(255,255,255,0.1)',
                        },
                      }}
                      onClick={handleMenuClick}
                      aria-label="menu options"
                    >
                      <Iconify icon="material-symbols:more-vert" />
                    </IconButton>
                  </Paper>
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
                        bgcolor: alpha(theme.palette.background.paper, 0.95),
                        backdropFilter: 'blur(20px)',
                        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                        borderRadius: 3,
                        mt: 1,
                        minWidth: 200,
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
                            bgcolor: alpha(theme.palette.primary.main, 0.08),
                          },
                        }}
                      >
                        {option.icon && (
                          <Paper
                            elevation={0}
                            sx={{
                              p: 0.5,
                              mr: 1.5,
                              borderRadius: 1.5,
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                            }}
                          >
                            <Iconify
                              icon={option.icon}
                              width={18}
                              height={18}
                              sx={{ color: theme.palette.primary.main }}
                            />
                          </Paper>
                        )}
                        <Typography variant="body2" fontWeight={500}>
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
      </Paper>
    </AppBar>
  );
}
