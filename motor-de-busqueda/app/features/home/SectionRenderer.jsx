import Hero from "./components/Hero";
import Stats from "./components/Stats";
import Industries from "./components/Industries";

export default function SectionRenderer({ section, model }) {
  const map = {
    hero: Hero,
    stats: Stats,
    industries: Industries,
  };

  const Component = map[section.type];

  if (!Component) return null;

  return <Component model={model} />;
}