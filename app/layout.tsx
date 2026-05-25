import type { Metadata } from 'next';
import './globals.css';
import Nav from './components/Nav';
import Ticker from './components/Ticker';
import LiveBar from './components/LiveBar';
import Footer from './components/Footer';

export const metadata: Metadata = {
  title: 'GolesNews — Fútbol en vivo, resultados y noticias',
  description: 'Portal de fútbol argentino y europeo. Liga Profesional, Premier League, LaLiga, Copa Argentina y Mundial 2026. Resultados en tiempo real.',
  openGraph: {
    title: 'GolesNews',
    description: 'Fútbol en vivo, resultados y noticias',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800&family=Inter:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Nav />
        <Ticker />
        <LiveBar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
