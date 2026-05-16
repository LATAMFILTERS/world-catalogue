export default function Industries({ items = [] }) {
  return (
    <section className="ind-sec">
      <div className="ind-list">
        {items.map((item, i) => (
          <div key={i} className="ind-item">
            <div>
              <div className="ind-name">{item.name}</div>
              <div className="ind-sub">{item.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
