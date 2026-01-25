import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Store My Goods - Feedback Form',
  description: 'Share your experience with Store My Goods',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
