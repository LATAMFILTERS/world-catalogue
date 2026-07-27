'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '@/i18n';

const LANGUAGE_LABELS: Record<string, { name: string; nativeName: string }> = {
  en: { name: 'English', nativeName: 'English' },
  es: { name: 'Spanish', nativeName: 'Español' },
  fr: { name: 'French', nativeName: 'Français' },
  it: { name: 'Italian', nativeName: 'Italiano' },
  nl: { name: 'Dutch', nativeName: 'Nederlands' },
  ru: { name: 'Russian', nativeName: 'Русский' },
  zh: { name: 'Chinese', nativeName: '中文' },
  ja: { name: 'Japanese', nativeName: '日本語' },
  ar: { name: 'Arabic', nativeName: 'العربية' },
  fa: { name: 'Farsi', nativeName: 'فارسی' },
  pt: { name: 'Portuguese', nativeName: 'Português' },
};

export function LanguageSelector() {
  const { i18n: i18nInstance } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState('en');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentLang(i18nInstance.language);
  }, [i18nInstance.language]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleLanguageChange = (langCode: string) => {
    i18nInstance.changeLanguage(langCode);
    setCurrentLang(langCode);
    setIsOpen(false);
  };

  const currentLabel = LANGUAGE_LABELS[currentLang];

  return (
    <div
      ref={dropdownRef}
      style={{
        position: 'relative',
        display: 'inline-block',
      }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,241,45,0.15)',
          color: '#fff',
          padding: '0.6rem 1rem',
          borderRadius: '4px',
          fontSize: '0.85rem',
          fontWeight: 500,
          cursor: 'pointer',
          fontFamily: 'Inter, sans-serif',
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          minWidth: '140px',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.background = 'rgba(255,241,45,0.08)';
          (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,241,45,0.3)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)';
          (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,241,45,0.15)';
        }}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span>{currentLabel?.nativeName || 'Language'}</span>
        <span style={{ fontSize: '0.7rem', marginLeft: 'auto' }}>
          {isOpen ? '▲' : '▼'}
        </span>
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '0.5rem',
            background: '#1a1a1a',
            border: '1px solid rgba(255,241,45,0.2)',
            borderRadius: '4px',
            minWidth: '180px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            zIndex: 1000,
            maxHeight: '320px',
            overflowY: 'auto',
          }}
          role="listbox"
        >
          {Object.entries(LANGUAGE_LABELS).map(([code, label]) => (
            <button
              key={code}
              onClick={() => handleLanguageChange(code)}
              style={{
                display: 'block',
                width: '100%',
                padding: '0.75rem 1rem',
                background: currentLang === code ? 'rgba(255,241,45,0.12)' : 'transparent',
                border: 'none',
                color: currentLang === code ? '#FFF12D' : '#fff',
                textAlign: 'left',
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.85rem',
                transition: 'all 0.15s ease',
                borderLeft: currentLang === code ? '3px solid #FFF12D' : '3px solid transparent',
              }}
              onMouseEnter={(e) => {
                if (currentLang !== code) {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)';
                }
              }}
              onMouseLeave={(e) => {
                if (currentLang !== code) {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                }
              }}
              role="option"
              aria-selected={currentLang === code}
            >
              <div style={{ fontWeight: currentLang === code ? 600 : 400 }}>
                {label.nativeName}
              </div>
              <div style={{ fontSize: '0.7rem', opacity: 0.6, marginTop: '0.2rem' }}>
                {label.name}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
