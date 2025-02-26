import "@/styles/globals.css"
import { Inter } from "next/font/google"
import { LayoutRoot } from "@/components/layout-root"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Costa Verde Barcos",
  description: "Alugue barcos no litoral brasileiro de forma fácil e segura",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#1322ad" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
      </head>
      <body className={inter.className}>
        <LayoutRoot>
          {children}
        </LayoutRoot>
      </body>
    </html>
  )
}
