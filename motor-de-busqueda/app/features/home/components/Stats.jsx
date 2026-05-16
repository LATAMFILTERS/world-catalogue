export default function Stats({ items = [] }) {
  return (
    <section className="stats">
      <div className="stats-grid">
        {items.map((item, i) => (
          <div key={i} className="stat">
            <div className="stat-n">{item.value}</div>
            <div className="stat-l">{item.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
