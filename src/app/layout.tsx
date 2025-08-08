import { Suspense } from 'react';

import QueryProvider from '@/components/QueryProvider';

import { AudioPlayerProvider } from '../contexts/AudioPlayerContext';
import { AuthProvider } from '../contexts/AuthContext';
import { CommentProvider } from '../contexts/CommentContext';
import { StoryLikesProvider } from '../contexts/StoryLikesContext';
import { ToastProvider } from '../contexts/ToastContext';
import { ThemeProvider } from '../theme/ThemeProvider';

import type { Metadata } from 'next';

import '../index.css';

export const metadata: Metadata = {
  title: 'RainbowMedia',
  description:
    'Your personal audio story platform featuring suspense, thriller, and captivating stories',
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
                  <StoryLikesProvider>
                    <CommentProvider>
                      <AudioPlayerProvider>{children}</AudioPlayerProvider>
                    </CommentProvider>
                  </StoryLikesProvider>
                </ToastProvider>
              </AuthProvider>
            </QueryProvider>
          </ThemeProvider>
        </Suspense>
      </body>
    </html>
  );
}
