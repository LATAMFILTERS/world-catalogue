'use client';

import { motion } from 'framer-motion';

const components = [
  {
    icon: '🔍',
    name: 'SearchBar',
    desc: 'Búsqueda con glow dorado, animación fluida, totalmente accesible',
  },
  {
    icon: '📋',
    name: 'ResultCard',
    desc: 'Tarjetas con specs animadas, tags de color, border dorado',
  },
  {
    icon: '🏷️',
    name: 'FilterChip',
    desc: 'Filtros activos/inactivos con animación, keyboard support',
  },
  {
    icon: '✨',
    name: 'TagBadge',
    desc: 'Badges de estado, 5 colores, 3 tamaños, 2 variantes',
  },
  {
    icon: '🔘',
    name: 'Button',
    desc: 'Botones 4 variantes, press feedback (0.98), spinner loading',
  },
  {
    icon: '⌨️',
    name: 'Input',
    desc: 'Inputs con label, error states, focus glow, validación',
  },
];

export function ComponentsGrid() {
  return (
    <section className="py-24 px-4 max-w-6xl mx-auto">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-5xl font-black text-center text-[#e8c94a] mb-16"
      >
        7 Componentes Listos
      </motion.h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {components.map((comp, i) => (
          <motion.div
            key={comp.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: i * 0.1 }}
            whileHover={{ y: -10, boxShadow: '0 20px 50px rgba(232,201,74,0.15)' }}
            className="bg-[#0d0d0d] border border-[rgba(232,201,74,0.2)] rounded-2xl p-8 cursor-pointer transition-all"
          >
            <div className="text-4xl mb-4">{comp.icon}</div>
            <h3 className="text-2xl font-bold text-[#e8c94a] mb-2">{comp.name}</h3>
            <p className="text-[#d1d5db] leading-relaxed">{comp.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
