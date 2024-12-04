import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import Navbar from '../components/Navbar';

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token && router.pathname !== '/login' && router.pathname !== '/register') {
      router.push('/login');
    } else if (token) {
      fetch('/api/verifyToken', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.valid) {
            setIsAuthenticated(true);
          } else {
            localStorage.removeItem('token');
            router.push('/login');
          }
        })
        .catch(() => {
          localStorage.removeItem('token');
          router.push('/login');
        });
    }
  }, [router]);

  if (!isAuthenticated && router.pathname !== '/login' && router.pathname !== '/register') {
    return null; // Attente de la vérification
  }

  return (
    <Layout
      title="Agrica Credit - Gestion des Crédits"
      description="Simplifiez la gestion de vos crédits avec Agrica Credit"
      keywords="Agrica Credit, gestion de crédits, finance"
    >
      {/* Affiche Navbar seulement si ce n'est pas la page de login ou register */}
      {router.pathname !== '/login' && router.pathname !== '/register' && <Navbar />}
      <div style={{ paddingBottom: '64px' }}> {/* Ajout du padding pour le contenu */}
        <Component {...pageProps} />
      </div>
    </Layout>
  );
}

export default MyApp;
