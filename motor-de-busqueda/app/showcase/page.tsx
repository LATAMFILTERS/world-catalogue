import { Hero, ComponentsGrid, DemoSection, Stats } from '@/components/showcase';

export const metadata = {
  title: 'ELIMFILTERS - Showcase',
  description: 'Librería de componentes cinematográfica para ELIMFILTERS',
};

export default function ShowcasePage() {
  return (
    <main className="bg-[#080808] text-white">
      <Hero />
      <ComponentsGrid />
      <DemoSection />
      <Stats />

      <footer className="py-12 px-4 border-t border-[rgba(232,201,74,0.1)] text-center text-[#9ca3af]">
        <p className="mb-2">ELIMFILTERS Components Library v0.1.0</p>
        <p className="text-sm">Production-Ready • Cinematographic • Type-Safe • Fully Accessible</p>
      </footer>
    </main>
  );
}
