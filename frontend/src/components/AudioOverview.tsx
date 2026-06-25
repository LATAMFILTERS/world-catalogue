'use client';

import { useState, useRef, useEffect } from 'react';

interface AudioOverviewProps {
  pageSlug: string;
  title: string;
}

const AUDIO_BASE = 'https://pub-audio.elimfilters.com'; // R2 public bucket URL

function getLang(): string {
  if (typeof navigator === 'undefined') return 'en';
  const l = navigator.language?.toLowerCase() || 'en';
  if (l.startsWith('es') || l.startsWith('pt')) return 'es';
  return 'en';
}

export function AudioOverview({ pageSlug, title }: AudioOverviewProps) {
  const [lang, setLang] = useState<'en' | 'es'>('en');
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [expanded, setExpanded] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const audioUrl = `${AUDIO_BASE}/${pageSlug}-${lang}.mp3`;

  useEffect(() => {
    setLang(getLang() as 'en' | 'es');
  }, []);

  useEffect(() => {
    // Check if audio file exists
    fetch(audioUrl, { method: 'HEAD' })
      .then(r => setAvailable(r.ok))
      .catch(() => setAvailable(false));
  }, [audioUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setProgress(audio.currentTime / (audio.duration || 1));
    const onDurationChange = () => setDuration(audio.duration);
    const onEnded = () => { setPlaying(false); setProgress(0); };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('durationchange', onDurationChange);
    audio.addEventListener('ended', onEnded);
    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('durationchange', onDurationChange);
      audio.removeEventListener('ended', onEnded);
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.load();
      if (playing) audioRef.current.play();
    }
  }, [audioUrl]);

  if (available === false) return null;

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      setLoading(true);
      audio.src = audioUrl;
      try {
        await audio.play();
        setPlaying(true);
      } catch {
        setAvailable(false);
      } finally {
        setLoading(false);
      }
    }
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    audio.currentTime = pct * duration;
  };

  const fmt = (s: number) => {
    if (!s || !isFinite(s)) return '--:--';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{
      background: 'rgba(255,241,45,0.04)',
      border: '1px solid rgba(255,241,45,0.2)',
      borderRadius: '8px',
      padding: '1rem 1.25rem',
      marginBottom: '2rem',
    }}>
      <audio ref={audioRef} preload="none" />

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Play button */}
        <button
          onClick={togglePlay}
          disabled={loading}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: playing ? 'rgba(255,241,45,0.15)' : '#FFF12D',
            border: 'none',
            cursor: loading ? 'wait' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: 'background 0.15s',
          }}
        >
          {loading ? (
            <span style={{ fontSize: '0.7rem', color: '#000' }}>...</span>
          ) : playing ? (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="2" y="1" width="4" height="12" fill={playing ? '#FFF12D' : '#000'} />
              <rect x="8" y="1" width="4" height="12" fill={playing ? '#FFF12D' : '#000'} />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 1l10 6-10 6V1z" fill="#000" />
            </svg>
          )}
        </button>

        {/* Info + progress */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', color: '#FFF12D' }}>
              AUDIO OVERVIEW
            </span>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              {/* Language toggle */}
              <button
                onClick={() => { setLang(l => l === 'en' ? 'es' : 'en'); setPlaying(false); setProgress(0); }}
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '4px', color: 'rgba(255,255,255,0.6)', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', padding: '0.15rem 0.5rem', cursor: 'pointer' }}
              >
                {lang.toUpperCase()}
              </button>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)' }}>
                {playing ? fmt(progress * duration) : fmt(0)} / {fmt(duration)}
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div
            onClick={seek}
            style={{ height: '3px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', cursor: 'pointer', position: 'relative' }}
          >
            <div style={{ height: '100%', width: `${progress * 100}%`, background: '#FFF12D', borderRadius: '2px', transition: 'width 0.1s' }} />
          </div>

          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.4rem', marginBottom: 0 }}>
            {lang === 'en' ? `AI-generated audio overview of ${title}` : `Resumen de audio generado por IA: ${title}`}
          </p>
        </div>
      </div>
    </div>
  );
}
