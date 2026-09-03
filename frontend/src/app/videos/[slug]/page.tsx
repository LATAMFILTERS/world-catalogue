import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import VideoSchema from '@/components/VideoSchema';
import { PageHeader } from '@/components/PageHeader';
import { VIDEOS, getVideoMetadata } from '@/lib/video-metadata';

type Props = { params: Promise<{ slug: string }> };

const INDEXABLE_VIDEO_IDS = Object.values(VIDEOS)
  .filter((video) => video.category !== 'product')
  .map((video) => video.id);

export function generateStaticParams() {
  return INDEXABLE_VIDEO_IDS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const video = getVideoMetadata(slug);
  if (!video || video.category === 'product') {
    return { title: 'Video Not Found | ELIMFILTERS', robots: { index: false, follow: false } };
  }

  return {
    title: `${video.title} | ELIMFILTERS Video`,
    description: video.description,
    alternates: { canonical: video.url },
    openGraph: {
      type: 'video.other',
      title: video.title,
      description: video.description,
      url: video.url,
      images: [{ url: video.thumbnailUrl, alt: video.title }],
      videos: [{ url: video.contentUrl, type: 'video/mp4' }],
    },
  };
}

export default async function VideoWatchPage({ params }: Props) {
  const { slug } = await params;
  const video = getVideoMetadata(slug);
  if (!video || video.category === 'product') notFound();

  return (
    <main style={{ minHeight: '100vh', background: '#000', color: '#fff' }}>
      <VideoSchema video={video} />
      <PageHeader breadcrumbs={[{ label: 'Videos', href: '/videos' }]} currentPage={video.title} />
      <article style={{ maxWidth: '1120px', margin: '0 auto', padding: 'clamp(2rem, 6vw, 5rem) 1.5rem 6rem' }}>
        <p style={{ color: '#FFF12D', fontFamily: 'var(--font-mono)', letterSpacing: '0.16em', textTransform: 'uppercase', fontSize: '0.75rem' }}>
          ELIMFILTERS // Video
        </p>
        <h1 style={{ maxWidth: '900px', margin: '0.8rem 0 1.5rem', fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 5vw, 4.5rem)', lineHeight: 1.05 }}>
          {video.title}
        </h1>
        <p style={{ maxWidth: '820px', color: 'rgba(255,255,255,0.76)', fontSize: '1.1rem', lineHeight: 1.75 }}>
          {video.description}
        </p>
        <video
          controls
          preload="metadata"
          playsInline
          poster={video.thumbnailUrl}
          aria-label={video.title}
          style={{ display: 'block', width: '100%', marginTop: '2rem', background: '#050505', border: '1px solid rgba(255,241,45,0.22)', aspectRatio: '16 / 9' }}
        >
          <source src={video.contentUrl} type="video/mp4" />
          Your browser does not support HTML5 video.
        </video>
        <section aria-labelledby="video-summary" style={{ maxWidth: '820px', marginTop: '2.5rem' }}>
          <h2 id="video-summary" style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem' }}>Video summary</h2>
          <p style={{ color: 'rgba(255,255,255,0.72)', lineHeight: 1.8 }}>
            This ELIMFILTERS presentation explains how contamination-control strategy supports equipment reliability, service continuity and asset protection in the operating environment shown. The primary video is available directly on this page without requiring JavaScript to insert the media element.
          </p>
        </section>
      </article>
    </main>
  );
}
