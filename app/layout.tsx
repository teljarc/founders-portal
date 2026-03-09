import type { Metadata, Viewport } from 'next';
import { Toaster } from 'sonner';
import './globals.css';

export const metadata: Metadata = {
  title: 'Teljarc',
  description: 'Founders Portal — Idéer, projekt och beslut',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#0a0a0f',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sv">
      <body className="min-h-screen antialiased">
        {children}
        <Toaster
          theme="dark"
          toastOptions={{
            style: {
              background: '#12121a',
              border: '1px solid #2a2a3a',
              color: '#f0ede8',
              fontFamily: 'Courier New, monospace',
            },
          }}
        />
      </body>
    </html>
  );
}
