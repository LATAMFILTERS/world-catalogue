export default function Button({ children, variant = 'primary', ...props }) {
  const base = {
    padding: '12px 24px',
    fontFamily: 'Russo One',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    border: 'none',
    cursor: 'pointer',
  };

  const variants = {
    primary: { background: '#FFF12D', color: '#000' },
    outline: { background: 'transparent', border: '1px solid #FFF12D', color: '#FFF12D' },
    dark: { background: '#000', color: '#FFF' },
  };

  return (
    <button style={{ ...base, ...variants[variant] }} {...props}>
      {children}
    </button>
  );
}
