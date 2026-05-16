export default function Stats({ items = [] }) {
  return (
    <section>
      {items.map((s, i) => (
        <div key={i}>
          <h3>{s.value}</h3>
          <p>{s.label}</p>
        </div>
      ))}
    </section>
  );
}
