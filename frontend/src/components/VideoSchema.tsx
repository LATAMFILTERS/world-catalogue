import { VideoMetadata, generateVideoSchema } from '@/lib/video-metadata';

interface VideoSchemaProps {
  video: VideoMetadata;
}

/**
 * VideoSchema Component
 * Renders JSON-LD VideoObject schema directly into HTML (SSR compatible)
 * Usage: <VideoSchema video={videoMetadata} />
 */
export default function VideoSchema({ video }: VideoSchemaProps) {
  const schema = JSON.parse(generateVideoSchema(video));

  return (
    <script
      id={`video-schema-${video.id}`}
      type="application/ld+json"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
