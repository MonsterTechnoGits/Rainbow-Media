/** @type {import('next').NextConfig} */
const nextConfig = {
  // Existing MUI configuration
  transpilePackages: ['@mui/material', '@mui/system', '@mui/icons-material'],
  modularizeImports: {
    '@mui/icons-material': {
      transform: '@mui/icons-material/{{member}}',
    },
  },
  
  // Enable static export for GitHub Pages
  output: 'export',
  
  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },
  
  // Set base path for GitHub Pages
  basePath: process.env.NODE_ENV === 'production' ? '/Rainbow-Media' : '',
  
  // Ensure assets work with base path
  assetPrefix: process.env.NODE_ENV === 'production' ? '/Rainbow-Media/' : '',
  
  // Enable trailing slash for GitHub Pages
  trailingSlash: true,
  
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
};

module.exports = nextConfig;
