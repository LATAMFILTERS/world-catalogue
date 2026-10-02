// Every /es/ route: mark the document as Spanish while the HTML is parsed, before hydration,
// so screen readers use Spanish pronunciation. (The shared root layout renders <html lang="en">.)
export default function SpanishLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: "document.documentElement.lang='es'" }} />
      {children}
    </>
  );
}
