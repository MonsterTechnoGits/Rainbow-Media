import { Button } from '@mui/material';
import { useRouter } from 'next/navigation';
import React from 'react';

import { useMobileViewport } from '@/hooks/use-mobile-view-port';

import Iconify from './iconify';

export default function UploadButton() {
  const { isMobile } = useMobileViewport();
  const router = useRouter();

  const handleUploadClick = () => {
    router.push('/admin/upload');
  };

  return (
    <Button
      variant="contained"
      size="small"
      onClick={handleUploadClick}
      sx={{
        gap: 1,
        background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
        boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
        '&:hover': {
          background: 'linear-gradient(45deg, #1976D2 30%, #0097A7 90%)',
          boxShadow: '0 4px 8px 3px rgba(33, 203, 243, .4)',
        },
      }}
    >
      <Iconify icon="material-symbols:cloud-upload" />
      {!isMobile && 'Upload Story'}
    </Button>
  );
}
