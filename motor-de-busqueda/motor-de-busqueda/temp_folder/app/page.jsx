'use client';
import { useEffect, useState } from 'react';

export default function SearchButton({
  text = 'FIND MY FILTER',
  className = '',
  variant = 'primary'
}) {
  const [searchUrl, setSearchUrl] = useState('https://elimfilters.com/search'); // Default buscador
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const detectCountry = async () => {
      try {
        const response = await fetch('/api/get-country');
        const data = await response.json();
        const country = data.country || '';
        const latinAmerica = ['MX', 'AR', 'CL', 'CO', 'PE', 'VE', 'EC', 'BO', 'PY', 'UY', 'GT', 'HN', 'SV', 'NI', 'CR', 'PA', 'CU', 'DO', 'PR', 'ES'];
        
        // Aquí puedes diferenciar las URLs si lo necesitas en el futuro
        const finalUrl = latinAmerica.includes(country) 
          ? 'https://elimfilters.com/search' 
          : 'https://elimfilters.com/search';
          
        setSearchUrl(finalUrl);
      } catch (err) {
        setSearchUrl('https://elimfilters.com/search');
      } finally {
        setLoading(false);
      }
    };
    detectCountry();
  }, []);

  const styles = {
    primary: { background: 'var(--y)', color: 'var(--b)', fontFamily: '"Russo One",sans-serif', fontSize: '18px', letterSpacing: '0.15em', textTransform: 'uppercase', padding: '22px 52px', textDecoration: 'none', transition: 'background .2s', fontWeight: 700, border: 'none', cursor: 'pointer', display: 'inline-block' },
    secondary: { background: 'transparent', color: 'var(--b)', border: '2px solid var(--b)', fontFamily: '"Russo One",sans-serif', fontSize: '18px', letterSpacing: '0.15em', textTransform: 'uppercase', padding: '22px 52px', textDecoration: 'none', transition: 'all .2s', fontWeight: 700, cursor: 'pointer', display: 'inline-block' },
    tertiary: { background: 'var(--y)', color: 'var(--b)', fontFamily: '"Russo One",sans-serif', fontSize: '13px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', padding: '6px 14px', textDecoration: 'none', cursor: 'pointer', border: 'none', transition: 'all .2s', display: 'inline-block' },
  };

  if (loading) {
    return <button disabled style={styles[variant]} className={className}>{text}</button>;
  }

  return (
    <a
      href={searchUrl}
      target="_self"
      style={styles[variant]}
      className={className}
    >
      {text}
    </a>
  );
}