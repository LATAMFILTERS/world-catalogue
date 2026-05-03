'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

export function DemoSection() {
  const [searchValue, setSearchValue] = useState('');
  const [specs, setSpecs] = useState([
    { label: 'OEM', value: 'Donaldson' },
    { label: 'Application', value: 'Heavy Duty' },
    { label: 'Efficiency', value: '99.95%' },
    { label: 'Life', value: '2000 hrs' },
  ]);

  return (
    <section className="py-24 px-4 bg-gradient-to-b from-[#0d0d0d] to-[#080808]">
      <div className="max-w-4xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-4xl font-black text-[#e8c94a] mb-16 text-center"
        >
          Demo Interactivo
        </motion.h2>

        {/* SearchBar Demo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="mb-12 p-8 bg-[#0d0d0d] border border-[rgba(232,201,74,0.2)] rounded-2xl"
        >
          <h3 className="text-2xl font-bold text-[#e8c94a] mb-6">SearchBar</h3>
          <motion.input
            type="text"
            placeholder="Busca algo (P552100, LF3620...)"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            whileFocus={{ boxShadow: '0 0 30px rgba(232,201,74,0.4)' }}
            className="w-full px-6 py-4 bg-[#000] border-2 border-[rgba(232,201,74,0.3)] rounded-lg text-white focus:border-[#e8c94a] focus:outline-none transition-all"
          />
          <p className="text-[#9ca3af] text-sm mt-4">✓ Focus glow | ✓ Transiciones suaves | ✓ Accesible</p>
        </motion.div>

        {/* ResultCard Demo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="mb-12 p-8 bg-[#0d0d0d] border border-[rgba(232,201,74,0.2)] rounded-2xl"
        >
          <h3 className="text-2xl font-bold text-[#e8c94a] mb-6">ResultCard</h3>
          <motion.div
            whileHover={{ y: -5, boxShadow: '0 10px 25px rgba(232,201,74,0.1)' }}
            className="bg-[#000] border-l-4 border-[#e8c94a] p-6 rounded-lg cursor-pointer transition-all"
          >
            <div className="font-mono text-[#e8c94a] font-bold text-sm mb-2">P552100</div>
            <h4 className="text-xl font-bold mb-4">Air Filter Element Premium</h4>
            <div className="flex gap-3 mb-6">
              <span className="px-3 py-1 bg-[rgba(34,197,94,0.2)] text-[#22c55e] rounded text-sm">In Stock</span>
              <span className="px-3 py-1 bg-[rgba(34,197,94,0.2)] text-[#22c55e] rounded text-sm">Premium</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {specs.map((spec, i) => (
                <motion.div
                  key={spec.label}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="text-[#9ca3af] text-xs uppercase font-bold">{spec.label}</div>
                  <div className="font-mono font-bold text-white">{spec.value}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Buttons Demo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="p-8 bg-[#0d0d0d] border border-[rgba(232,201,74,0.2)] rounded-2xl"
        >
          <h3 className="text-2xl font-bold text-[#e8c94a] mb-6">Buttons</h3>
          <div className="flex flex-wrap gap-4">
            <motion.button
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-3 bg-gradient-to-r from-[#e8c94a] to-[#f0d563] text-black font-bold rounded-lg"
            >
              Primary Action
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-3 bg-[#000] border-2 border-[#e8c94a] text-[#e8c94a] font-bold rounded-lg hover:bg-[rgba(232,201,74,0.1)]"
            >
              Secondary Action
            </motion.button>
          </div>
          <p className="text-[#9ca3af] text-sm mt-4">✓ Press feedback (0.98) | ✓ Hover elevation | ✓ Focus glow</p>
        </motion.div>
      </div>
    </section>
  );
}
