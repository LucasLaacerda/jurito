import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';

type LayoutProps = {
  children: React.ReactNode;
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogoClick = () => {
    // Se estiver na página inicial, recarregar a página
    if (router.pathname === '/') {
      window.location.reload();
    } else {
      // Caso contrário, navegar para a página inicial
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen bg-dark-900">
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-dark-800/80 backdrop-blur-lg shadow-lg' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div 
              className="flex items-center space-x-2 cursor-pointer"
              onClick={handleLogoClick}
            >
              <motion.div 
                className="text-2xl font-bold text-white"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">jurito</span>
              </motion.div>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/como-funciona" legacyBehavior>
                <a className="text-white/80 hover:text-white transition-colors">Como Funciona</a>
              </Link>
              <Link href="/consultar" legacyBehavior>
                <a className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl backdrop-blur-sm transition-all">
                  Consultar Caso
                </a>
              </Link>
            </nav>
            
            {/* Mobile Menu Button */}
            <button 
              className="md:hidden text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden bg-dark-800/80 backdrop-blur-lg"
            >
              <div className="px-4 py-4 space-y-4">
                <Link href="/como-funciona" legacyBehavior>
                  <a className="block text-white/80 hover:text-white transition-colors py-2">Como Funciona</a>
                </Link>
                <Link href="/consultar" legacyBehavior>
                  <a className="block px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl backdrop-blur-sm transition-all text-center">
                    Consultar Caso
                  </a>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="pt-16">
        {children}
      </main>

      <footer className="py-8 text-center text-dark-400 text-sm">
        <div className="max-w-7xl mx-auto px-4">
          <p>© {new Date().getFullYear()} jurito. Transformando direitos em realidade.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout; 