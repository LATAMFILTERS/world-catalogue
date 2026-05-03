'use client';

import { motion } from 'framer-motion';

export function Hero() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: 'easeOut' },
    },
  };

  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-b from-[#080808] to-[#0d0d0d]">
      {/* Animated background glow */}
      <motion.div
        className="absolute w-96 h-96 bg-gradient-radial from-[rgba(232,201,74,0.2)] to-transparent rounded-full blur-3xl"
        animate={{
          y: [0, -30, 0],
          x: [0, 20, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{ top: '10%', left: '10%' }}
      />

      <motion.div
        className="relative z-10 text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1
          variants={itemVariants}
          className="text-6xl md:text-8xl font-black mb-6 bg-gradient-to-r from-[#e8c94a] via-[#f0d563] to-white bg-clip-text text-transparent"
        >
          ELIMFILTERS
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="text-xl md:text-2xl text-[#d1d5db] mb-8 max-w-2xl mx-auto"
        >
          La librería de componentes cinematográfica
        </motion.p>

        <motion.button
          variants={itemVariants}
          whileHover={{ scale: 1.05, y: -5 }}
          whileTap={{ scale: 0.98 }}
          className="px-12 py-4 bg-gradient-to-r from-[#e8c94a] to-[#f0d563] text-black font-bold rounded-full text-lg shadow-lg hover:shadow-2xl transition-all"
        >
          Explorar Componentes ↓
        </motion.button>
      </motion.div>

      {/* Scroll hint */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-[#9ca3af]"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        ↓ Scroll
      </motion.div>
    </section>
  );
}
