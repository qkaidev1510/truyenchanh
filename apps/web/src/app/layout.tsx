import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { SWRProvider } from './providers.js';
import { Navbar } from '../components/layout/Navbar.js';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'TruyenChanh — Manga Reader',
  description: 'High-quality manga reading platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <SWRProvider>
          <Navbar />
          <main>{children}</main>
        </SWRProvider>
      </body>
    </html>
  );
}
