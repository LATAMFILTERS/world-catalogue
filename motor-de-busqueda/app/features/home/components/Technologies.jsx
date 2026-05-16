export default function Technologies({ items = [] }) {
  return (
    <section className="tech-sec">
      <div className="tech-grid">
        {items.map((item, i) => (
          <div key={i} className="tech-card">
            <div className="tech-name-big">{item.name}</div>
            <div className="tech-desc">{item.desc}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
