export default function Hero({ model }) {
  const hero = model?.hero;

  if (!hero) return null;

  return (
    <section style={{ padding: "40px 0" }}>
      <h1 style={{ fontSize: "32px", fontWeight: "bold" }}>
        {hero.title}
      </h1>
      <p style={{ color: "#666", marginTop: "8px" }}>
        {hero.subtitle}
      </p>
    </section>
  );
}