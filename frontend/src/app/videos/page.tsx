import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHeader } from '@/components/PageHeader';
import { VIDEOS } from '@/lib/video-metadata';

export const metadata: Metadata = {
  title: 'Industrial Asset Protection Videos | ELIMFILTERS',
  description: 'Watch ELIMFILTERS presentations about contamination control and industrial asset protection by operating environment.',
  alternates: { canonical: 'https://elimfilters.com/videos/' },
};

const videos = Object.values(VIDEOS).filter((video) => video.category !== 'product');

export default function VideosPage() {
  return (
    <main style={{ minHeight: '100vh', background: '#000', color: '#fff' }}>
      <PageHeader currentPage="Videos" />
      <section style={{ maxWidth: '1180px', margin: '0 auto', padding: 'clamp(3rem, 7vw, 6rem) 1.5rem' }}>
        <p style={{ color: '#FFF12D', fontFamily: 'var(--font-mono)', letterSpacing: '0.16em', textTransform: 'uppercase', fontSize: '0.75rem' }}>
          ELIMFILTERS // Video Library
        </p>
        <h1 style={{ margin: '0.8rem 0 1.2rem', fontFamily: 'var(--font-display)', fontSize: 'clamp(2.4rem, 6vw, 5rem)', lineHeight: 1 }}>
          Industrial Asset Protection Videos
        </h1>
        <p style={{ maxWidth: '780px', color: 'rgba(255,255,255,0.72)', lineHeight: 1.75 }}>
          Technical and industry presentations covering contamination control, equipment reliability and asset-protection strategy.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', marginTop: '3rem' }}>
          {videos.map((video) => (
            <article key={video.id} style={{ border: '1px solid rgba(255,255,255,0.1)', background: '#050505', padding: '1.25rem' }}>
              <Link href={`/videos/${video.id}/`} style={{ color: 'inherit', textDecoration: 'none' }}>
                <img src={video.thumbnailUrl} alt="" width={640} height={360} style={{ width: '100%', height: 'auto', aspectRatio: '16 / 9', objectFit: 'cover', background: '#111' }} />
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', margin: '1rem 0 0.55rem' }}>{video.title}</h2>
                <p style={{ color: 'rgba(255,255,255,0.62)', lineHeight: 1.6, fontSize: '0.92rem' }}>{video.description}</p>
                <span style={{ color: '#FFF12D', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>WATCH VIDEO →</span>
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
