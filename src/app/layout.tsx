import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({
  display: "swap",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600", "800", "900"],
})

export const metadata: Metadata = {
  title: "Encontrar Sesgos en sitios web",
  description: "Encontrar sesgos en sitios web",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className}`}>{children}</body>
    </html>
  )
}
