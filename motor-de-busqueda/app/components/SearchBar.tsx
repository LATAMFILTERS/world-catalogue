'use client';
import { useState, useEffect } from 'react';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.length >= 3) {
        setLoading(true);
        try {
          const res = await fetch('/api/search?q=' + encodeURIComponent(query));
          const data = await res.json();
          setResults(data);
        } catch (error) {
          console.error("Error buscando:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="relative">
        <input
          type="text"
          placeholder="Busca un código OEM o Elimfilters..."
          className="w-full p-4 text-xl border-2 border-blue-900 rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
          onChange={(e) => setQuery(e.target.value)}
        />
        {loading && <div className="absolute right-4 top-5 animate-spin">⏳</div>}
      </div>

      <div className="mt-8 grid gap-4">
        {results.map((filter: any) => (
          <div key={filter.id} className="p-4 border rounded-lg bg-white shadow-sm hover:border-blue-500 transition-colors">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-bold text-blue-900">{filter.sku}</h3>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                {filter.technology || 'Standard'}
              </span>
            </div>
            <p className="text-gray-600 mt-2">{filter.description}</p>
            <div className="mt-2 text-sm text-gray-400">
              Cruces detectados: {filter.cross_references?.map((cr: any) => cr.code).join(', ') || 'N/A'}
            </div>
          </div>
        ))}
        {query.length >= 3 && results.length === 0 && !loading && (
          <p className="text-center text-gray-500">No se encontraron resultados para "{query}"</p>
        )}
      </div>
    </div>
  );
}