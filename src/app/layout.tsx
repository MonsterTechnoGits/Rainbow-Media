import { CommentProvider } from '../contexts/CommentContext';
import { MusicPlayerProvider } from '../contexts/MusicPlayerContext';
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
      <body>
        <ThemeProvider>
          <CommentProvider>
            <MusicPlayerProvider>{children}</MusicPlayerProvider>
          </CommentProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
