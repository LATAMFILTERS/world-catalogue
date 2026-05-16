import { homeData } from "@/app/data";

export default function Technologies() {
  const { technologies } = homeData;

  return (
    <section className="tech-sec">
      <div className="tech-grid">
        {technologies.map((tech, i) => (
          <div key={i} className="tech-card">
            <div className="tech-name-big">{tech.name}</div>
            <div className="tech-desc">{tech.desc}</div>
          </div>
        ))}
      </div>
    </section>
  );
}