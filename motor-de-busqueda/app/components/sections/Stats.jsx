import { homeData } from "@/app/data";

export default function Stats() {
  const { stats } = homeData;

  return (
    <section className="stats">
      <div className="stats-grid">
        {stats.map((item, i) => (
          <div className="stat" key={i}>
            <div className="stat-n">{item.value}</div>
            <div className="stat-l">{item.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}