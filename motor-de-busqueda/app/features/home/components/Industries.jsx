export default function Industries() {
  const items = [
    "Automotive",
    "Hydraulics",
    "Industrial Systems",
    "Heavy Machinery",
  ];

  return (
    <section style={{ padding: "20px 0" }}>
      <h2 style={{ marginBottom: "10px" }}>Industries</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "12px",
        }}
      >
        {items.map((item) => (
          <div
            key={item}
            style={{
              padding: "14px",
              border: "1px solid #ddd",
              borderRadius: "8px",
            }}
          >
            {item}
          </div>
        ))}
      </div>
    </section>
  );
}