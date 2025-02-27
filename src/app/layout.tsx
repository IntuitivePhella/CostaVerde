import "@/styles/globals.css"
import { Lexend } from "next/font/google"
import { Metadata } from 'next'
import { Toaster } from '@/components/ui/toaster'
import { AuthProvider } from '@/contexts/AuthContext'
import Footer from '@/components/layout/Footer'

const lexend = Lexend({ 
  subsets: ["latin"],
  variable: '--font-sans',
})

export const metadata: Metadata = {
  title: {
    default: 'Costa Verde Barcos | Aluguel de Embarcações',
    template: '%s | Costa Verde Barcos',
  },
  description: 'A maior plataforma de locação de embarcações do Brasil. Navegue com segurança e conforto pelos melhores destinos.',
  keywords: ['aluguel de barcos', 'locação de embarcações', 'passeios de barco', 'charter', 'costa verde', 'angra dos reis', 'paraty'],
  authors: [{ name: 'Costa Verde Barcos' }],
  creator: 'Costa Verde Barcos',
  publisher: 'Costa Verde Barcos',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'Costa Verde Barcos | Aluguel de Embarcações',
    description: 'A maior plataforma de locação de embarcações do Brasil.',
    url: 'https://costaverde.com.br',
    siteName: 'Costa Verde Barcos',
    locale: 'pt_BR',
    type: 'website',
  },
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
  twitter: {
    card: 'summary_large_image',
    title: 'Costa Verde Barcos | Aluguel de Embarcações',
    description: 'A maior plataforma de locação de embarcações do Brasil.',
    creator: '@costaverde',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  verification: {
    google: 'google-site-verification-code',
    other: {
      'facebook-domain-verification': 'facebook-domain-verification-code',
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={`${lexend.variable}`}>
      <body className="min-h-screen flex flex-col">
        <AuthProvider>
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}
