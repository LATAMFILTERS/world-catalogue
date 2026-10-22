import ClientNav from '@/app/knowledge-center/ClientNav';

// /pt/knowledge-center/: same Knowledge Center navigation as the English section.
export default function KnowledgeCenterLayout({ children }: { children: React.ReactNode }) {
  return <><ClientNav />{children}</>;
}
