import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Header } from '@/components/header'
import { I18nClient } from '@/components/i18n-client'
import { AuthProvider } from '@/contexts/auth-context'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'RTRWH Assessment Platform',
  description: 'Rooftop Rainwater Harvesting Assessment and Guidance Platform',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          //  initial light theme flash by setting class before first paint
          dangerouslySetInnerHTML={{
            __html: `(() => {
  try {
    const storageKey = 'rainharvest-theme';
    const stored = typeof localStorage !== 'undefined' ? localStorage.getItem(storageKey) : null;
    const preference = stored || 'system';
    const prefersDark = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = preference === 'dark' || (preference === 'system' && prefersDark);
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(isDark ? 'dark' : 'light');
    // Hint to UA for built-in form controls, etc.
    root.style.colorScheme = isDark ? 'dark' : 'light';
  } catch (_) {}
})();`,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <ThemeProvider>
            <I18nClient />
            <Header />
            <main>
              {children}
            </main>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
