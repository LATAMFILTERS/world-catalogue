export default function Card({ title, description, image }) {
  return (
    <div style={{
      border: '1px solid #1a1a1a',
      padding: 24,
      background: '#0a0a0a'
    }}>
      {image && <img src={image} style={{ width: '100%', height: 180, objectFit: 'cover' }} />}
      <h3 style={{ color: '#FFF12D', fontFamily: 'Russo One' }}>{title}</h3>
      <p style={{ color: '#999' }}>{description}</p>
    </div>
  );
}
