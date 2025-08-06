import Script from 'next/script';

import { AuthProvider } from '../contexts/AuthContext';
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
      <head />
      <body>
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="beforeInteractive" />
        <ThemeProvider>
          <AuthProvider>
            <CommentProvider>
              <MusicPlayerProvider>{children}</MusicPlayerProvider>
            </CommentProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
