export default function Industries({ items = [] }) {
  return (
    <section>
      {items.map((ind, i) => (
        <div key={i}>
          <h3>{ind.name}</h3>
          <p>{ind.desc}</p>
        </div>
      ))}
    </section>
  );
}
