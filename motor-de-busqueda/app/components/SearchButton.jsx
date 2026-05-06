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
        const response = await fetch('/api/get-country');
        const data = await response.json();
        const country = data.country || '';

        const latinAmerica = ['MX', 'AR', 'CL', 'CO', 'PE', 'VE', 'EC', 'BO', 'PY', 'UY', 'GT', 'HN', 'SV', 'NI', 'CR', 'PA', 'CU', 'DO', 'PR', 'ES'];

        if (latinAmerica.includes(country)) {
          setSearchUrl('https://world-catalogue-production-a151.up.railway.app');
        } else {
          setSearchUrl('https://part-search.elimfilters.com/search');
        }
      } catch (err) {
        setSearchUrl('https://part-search.elimfilters.com/search');
      } finally {
        setLoading(false);
      }
    };

    detectCountry();
  }, []);

  const styles = {
    primary: 'background:var(--y);color:var(--b);font-family:"Russo One",sans-serif;font-size:18px;letter-spacing:0.15em;text-transform:uppercase;padding:22px 52px;text-decoration:none;transition:background .2s;font-weight:700;border:none;cursor:pointer;',
    secondary: 'background:transparent;color:var(--b);border:2px solid var(--b);font-family:"Russo One",sans-serif;font-size:18px;letter-spacing:0.15em;text-transform:uppercase;padding:22px 52px;text-decoration:none;transition:all .2s;font-weight:700;cursor:pointer;',
    tertiary: 'background:var(--y);color:var(--b);font-family:"Russo One",sans-serif;font-size:13px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;padding:6px 14px;text-decoration:none;cursor:pointer;border:none;transition:all .2s;',
  };

  if (loading) {
    return <button disabled style={styles[variant]} className={className}>{text}</button>;
  }

  return (
    
      href={searchUrl}
      target={searchUrl.startsWith('http') ? '_self' : undefined}
      style={styles[variant]}
      className={className}
    >
      {text}
    </a>
  );
}
