'use client';

import { motion } from 'framer-motion';

const stats = [
  { num: '7', label: 'Componentes' },
  { num: '100%', label: 'Type-Safe' },
  { num: '21:1', label: 'Contraste' },
  { num: '60fps', label: 'Animaciones' },
];

export function Stats() {
  return (
    <section className="py-24 px-4 bg-[#080808]">
      <div className="max-w-6xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-4xl font-black text-center text-[#e8c94a] mb-16"
        >
          Por Los Números
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="p-8 bg-[rgba(232,201,74,0.08)] border border-[rgba(232,201,74,0.2)] rounded-2xl text-center"
            >
              <motion.div className="text-5xl font-black text-[#e8c94a] mb-3">
                {stat.num}
              </motion.div>
              <div className="text-[#d1d5db] font-semibold">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
