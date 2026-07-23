import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import 'katex/dist/katex.min.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { AuthProvider } from '../context/AuthContext';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://dmatcracker.vercel.app'),
  title: {
    default: 'dMATcracker | Digital Mathematics & Logic Official Hub',
    template: '%s | dMATcracker',
  },
  description: 'Master Digital Mathematics and Logic (dMAT). Practice combinational logic, linear transformations, figure sequences, Latin squares, and linear equations on dMATcracker.',
  keywords: [
    'dMATcracker',
    'dMAT',
    'Digital Mathematics and Logic',
    'dMAT exam prep',
    'Combinational Logic',
    'Linear Transformations',
    'Figure Sequences',
    'Mathematical Equations',
    'Latin Squares',
  ],
  authors: [{ name: 'dMATcracker Team' }],
  creator: 'dMATcracker Platform',
  publisher: 'dMATcracker Platform',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://dmatcracker.vercel.app',
    siteName: 'dMATcracker',
    title: 'dMATcracker | Digital Mathematics & Logic Official Hub',
    description: 'Master Digital Mathematics and Logic on dMATcracker. Comprehensive theory, step-by-step solutions, interactive practice questions, and progress tracking.',
    images: [
      {
        url: '/dmat_logo_transparent.png',
        width: 1200,
        height: 630,
        alt: 'dMATcracker Official Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'dMAT Digital Mathematics & Logic Platform',
    description: 'Master Digital Mathematics and Logic (dMAT) with structured theory, worked examples, and practice questions.',
    images: ['/dmat_logo_transparent.png'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '192x192', type: 'image/png' },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 transition-colors duration-205">
        <AuthProvider>
          <Navbar />
          <main className="flex-grow flex flex-col">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
