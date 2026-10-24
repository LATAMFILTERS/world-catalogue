/**
 * Mining hero's primary media: direct, muted background video.
 * Do not put a still image, poster, controls or play overlay in this hero.
 */
export function MiningHeroMedia() {
  return (
    <video
      className="miningHeroVideo"
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        display: 'block',
        zIndex: 1,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        objectPosition: 'center',
        opacity: 1,
        pointerEvents: 'none',
        background: '#050505',
      }}
    >
      <source src="/images/Mineria-Video1.mp4" type="video/mp4" />
    </video>
  );
}
