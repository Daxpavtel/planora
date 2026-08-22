import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter, Manrope } from 'next/font/google'
import { AuthProvider } from '@/lib/auth'
import { SidebarProvider } from '@/components/sidebar'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const manrope = Manrope({ subsets: ['latin'], variable: '--font-manrope' })

export const metadata: Metadata = {
  title: 'Planora — Plan Smarter. Travel Better.',
  description:
    'Plan multi-city trips across India, discover famous places, iconic local food, manage budgets and build collaborative itineraries with Planora.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/logo.png',
        type: 'image/png',
      },
    ],
    apple: '/logo.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#102A43',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`bg-background ${inter.variable} ${manrope.variable}`}>
      <body className="font-sans antialiased">
        <AuthProvider>
          <SidebarProvider>{children}</SidebarProvider>
        </AuthProvider>
        <Toaster />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
