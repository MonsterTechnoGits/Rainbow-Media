import { Suspense } from 'react';

import QueryProvider from '@/components/QueryProvider';

import { AuthProvider } from '../contexts/AuthContext';
import { CommentProvider } from '../contexts/CommentContext';
import { MusicPlayerProvider } from '../contexts/MusicPlayerContext';
import { ToastProvider } from '../contexts/ToastContext';
import { TrackLikesProvider } from '../contexts/TrackLikesContext';
import { ThemeProvider } from '../theme/ThemeProvider';

import type { Metadata } from 'next';

import '../index.css';

export const metadata: Metadata = {
  title: 'RainbowMedia',
  description: 'Your personal online music player',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head />
      <body>
        <Suspense>
          <ThemeProvider>
            <QueryProvider>
              <AuthProvider>
                <ToastProvider>
                  <TrackLikesProvider>
                    <CommentProvider>
                      <MusicPlayerProvider>{children}</MusicPlayerProvider>
                    </CommentProvider>
                  </TrackLikesProvider>
                </ToastProvider>
              </AuthProvider>
            </QueryProvider>
          </ThemeProvider>
        </Suspense>
      </body>
    </html>
  );
}
