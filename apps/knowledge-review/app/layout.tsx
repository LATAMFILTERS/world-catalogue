import './globals.css';
import Link from 'next/link';

export const metadata = {
  title: 'ELIMFILTERS Knowledge Review',
  description: 'Internal governed technical knowledge review workspace'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <header className="topbar">
          <Link href="/" className="brand"><span className="mark">E</span><span>ELIMFILTERS</span></Link>
          <div className="topmeta"><strong>Knowledge Review</strong><span>Internal · Governed</span></div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
