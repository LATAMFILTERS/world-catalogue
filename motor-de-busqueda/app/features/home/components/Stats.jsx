export default function Stats({ model }) {
  const stats = model?.stats;

  if (!stats) return null;

  return (
    <section style={{ padding: "20px 0" }}>
      <h2 style={{ marginBottom: "10px" }}>Stats</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "12px",
        }}
      >
        {stats.map((s) => (
          <div
            key={s.label}
            style={{
              padding: "16px",
              border: "1px solid #ddd",
              borderRadius: "8px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "20px", fontWeight: "bold" }}>
              {s.value}
            </div>
            <div style={{ color: "#666" }}>{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}