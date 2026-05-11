'use client';
import { useEffect, useState } from 'react';

export default function SearchButton({
  text = 'FIND MY FILTER',
  className = '',
  variant = 'primary'
}) {
  const [searchUrl, setSearchUrl] = useState('/search');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const detectCountry = async () => {
      try {
        // opcional: solo si quieres geolocalización en el futuro
        await fetch('/api/get-country');
        
        // SIEMPRE ir al buscador interno
        setSearchUrl('/search');
      } catch (err) {
        setSearchUrl('/search');
      } finally {
        setLoading(false);
      }
    };

    detectCountry();
  }, []);

  const styles = {
    primary: {
      background: 'var(--y)',
      color: 'var(--b)',
      fontFamily: '"Russo One",sans-serif',
      fontSize: '18px',
      letterSpacing: '0.15em',
      textTransform: 'uppercase',
      padding: '22px 52px',
      textDecoration: 'none',
      transition: 'background .2s',
      fontWeight: 700,
      border: 'none',
      cursor: 'pointer'
    },
    secondary: {
      background: 'transparent',
      color: 'var(--b)',
      border: '2px solid var(--b)',
      fontFamily: '"Russo One",sans-serif',
      fontSize: '18px',
      letterSpacing: '0.15em',
      textTransform: 'uppercase',
      padding: '22px 52px',
      textDecoration: 'none',
      transition: 'all .2s',
      fontWeight: 700,
      cursor: 'pointer'
    },
    tertiary: {
      background: 'var(--y)',
      color: 'var(--b)',
      fontFamily: '"Russo One",sans-serif',
      fontSize: '13px',
      fontWeight: 700,
      letterSpacing: '0.15em',
      textTransform: 'uppercase',
      padding: '6px 14px',
      textDecoration: 'none',
      cursor: 'pointer',
      border: 'none',
      transition: 'all .2s'
    },
  };

  if (loading) {
    return (
      <button disabled style={styles[variant]} className={className}>
        {text}
      </button>
    );
  }

  return (
    <a
      href={searchUrl}
      style={styles[variant]}
      className={className}
    >
      {text}
    </a>
  );
}
