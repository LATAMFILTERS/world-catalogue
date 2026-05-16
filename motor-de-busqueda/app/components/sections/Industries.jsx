import { homeData } from "@/app/data";

export default function Industries() {
  const { industries } = homeData;

  return (
    <section className="ind-sec">
      <div className="ind-list">
        {industries.map((ind, i) => (
          <div key={i} className="ind-item">
            <div>
              <div className="ind-name">{ind.name}</div>
              <div className="ind-sub">{ind.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}