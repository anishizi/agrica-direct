import Head from 'next/head';
import Navbar from './Navbar';
import { useRouter } from 'next/router';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  keywords?: string;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  title = 'Agrica Credit',
  description = 'Gérez vos crédits efficacement avec Agrica Credit',
  keywords = 'crédit, gestion, finance, Agrica',
}) => {
  const router = useRouter();

  const isAuthPage = router.pathname === '/login' || router.pathname === '/register';

  return (
    <>
      <Head>
        {/* Metadonnées pour SEO */}
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta charSet="UTF-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />

        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />

        {/* Open Graph pour les réseaux sociaux */}
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content="/og-image.png" />
        <meta property="og:type" content="website" />
      </Head>

      {!isAuthPage && <Navbar />} {/* Affiche la Navbar sauf sur les pages /login et /register */}

      <main className={`min-h-screen ${isAuthPage ? '' : ''}`}>{children}</main>
    </>
  );
};

export default Layout;
