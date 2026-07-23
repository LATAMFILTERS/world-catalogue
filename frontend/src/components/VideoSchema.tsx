'use client';

import Script from 'next/script';
import { VideoMetadata, generateVideoSchema } from '@/lib/video-metadata';

interface VideoSchemaProps {
  video: VideoMetadata;
}

/**
 * VideoSchema Component
 * Injects JSON-LD VideoObject schema into page head for Google Video Index
 * Usage: <VideoSchema video={videoMetadata} />
 */
export default function VideoSchema({ video }: VideoSchemaProps) {
  const schema = generateVideoSchema(video);

  return (
    <Script
      id={`video-schema-${video.id}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: schema }}
      strategy="afterInteractive"
    />
  );
}
