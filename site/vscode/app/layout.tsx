import type { Metadata } from 'next';

import Layout from '@/components/Layout';

import '@/styles/globals.css';
import '@/styles/themes.css';

export const metadata: Metadata = {
  title: {
    default: 'Aditya Balaji | Code Studio',
    template: 'Aditya Balaji | %s',
  },
  description:
    'Aditya Balaji is a quantitative researcher, engineer, and builder working across markets, applied machine learning, and interactive software.',
  keywords: [
    'aditya balaji',
    'quantitative researcher',
    'software engineer portfolio',
    'market microstructure',
    'applied machine learning',
    'research portfolio',
    'vscode-portfolio',
  ],
  openGraph: {
    title: "Aditya Balaji's Code Studio",
    description:
      'A VS Code workspace for Aditya Balaji\'s research, engineering, and selected projects.',
    url: '/vscode/',
  },
  twitter: {
    card: 'summary_large_image',
  },
};

const themeScript = `
  (function() {
    const theme = localStorage.getItem('theme');
    if (theme) {
      document.documentElement.setAttribute('data-theme', theme);
    }
  })();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}
