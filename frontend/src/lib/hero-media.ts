export const HERO_MEDIA_TREATMENT = {
  opacity: 'var(--hero-media-opacity)',
  overlayBackground: 'var(--hero-media-overlay)',
} as const;

// Compatibility alias for existing video hero callers. Both names resolve to the
// same governed treatment; there is only one source of truth.
export const VIDEO_HERO_TREATMENT = HERO_MEDIA_TREATMENT;

export function heroBackgroundImage(src: string) {
  const overlay = HERO_MEDIA_TREATMENT.overlayBackground;
  return `linear-gradient(${overlay}, ${overlay}), url('${src}')`;
}
