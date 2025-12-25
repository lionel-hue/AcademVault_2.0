// client/src/app/layout.jsx
import './globals.css'
import { Inter } from 'next/font/google'
import { ModalProvider } from '@/app/components/UI/Modal/ModalContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'AcademVault - Intelligent Research Platform',
  description: 'Your intelligent platform for academic research',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes scaleIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(-10px) rotate(5deg); }
          }
        `}</style>
      </head>
      <body className={`${inter.className} bg-gradient-to-br from-gray-900 via-black to-gray-900`}>
        <ModalProvider>
          {children}
        </ModalProvider>
      </body>
    </html>
  )
}