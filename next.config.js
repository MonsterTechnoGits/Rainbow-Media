/** @type {import('next').NextConfig} */
const nextConfig = {
  // Existing MUI configuration
  transpilePackages: ['@mui/material', '@mui/system', '@mui/icons-material'],
  modularizeImports: {
    '@mui/icons-material': {
      transform: '@mui/icons-material/{{member}}',
    },
  },

  // Disable static export to enable API routes
  // output: 'export',

  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },

  // Disable base path when not using static export
  // basePath: process.env.NODE_ENV === 'production' ? '/Rainbow-Media' : '',

  // Disable asset prefix when not using static export
  // assetPrefix: process.env.NODE_ENV === 'production' ? '/Rainbow-Media/' : '',

  // Enable trailing slash for GitHub Pages
  trailingSlash: true,

  // Headers don't work with static export, but keeping for development
  ...(process.env.NODE_ENV === 'development' && {
    async headers() {
      return [
        {
          source: '/(.*)',
          headers: [
            {
              key: 'Cross-Origin-Opener-Policy',
              value: 'same-origin-allow-popups',
            },
          ],
        },
      ];
    },
  }),
};

module.exports = nextConfig;
