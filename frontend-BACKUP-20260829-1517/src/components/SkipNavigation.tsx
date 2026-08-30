'use client'

export default function SkipNavigation() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:bg-white focus:text-black focus:px-4 focus:py-2 focus:z-50 focus:outline-2 focus:outline-blue-600"
      style={{
        position: 'absolute',
        top: '-40px',
        left: '4px',
        background: '#fff',
        color: '#000',
        padding: '8px 16px',
        zIndex: 9999,
        transition: 'top 0.3s ease',
        textDecoration: 'none',
        fontSize: '14px',
        fontWeight: 600,
      }}
      onFocus={(e) => {
        e.currentTarget.style.top = '4px'
      }}
      onBlur={(e) => {
        e.currentTarget.style.top = '-40px'
      }}
    >
      Skip to main content
    </a>
  )
}
