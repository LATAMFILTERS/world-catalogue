// Every /pt/ route: mark the document as Brazilian Portuguese while the HTML is parsed, before hydration,
// so screen readers use Portuguese pronunciation. (The shared root layout renders <html lang="en">.)
export default function PortugueseLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: "document.documentElement.lang='pt-BR'" }} />
      {children}
    </>
  );
}
