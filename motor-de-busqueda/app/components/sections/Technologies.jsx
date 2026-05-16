export default function Technologies({ items = [] }) {
  return (
    <section>
      {items.map((t, i) => (
        <div key={i}>
          <h3>{t.name}</h3>
          <p>{t.desc}</p>
        </div>
      ))}
    </section>
  );
}
