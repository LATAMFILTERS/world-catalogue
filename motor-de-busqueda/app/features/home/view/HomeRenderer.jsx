import Hero from "../components/Hero";
import Stats from "../components/Stats";
import Industries from "../components/Industries";
import Technologies from "../components/Technologies";

const registry = {
  hero: Hero,
  stats: Stats,
  industries: Industries,
  technologies: Technologies,
};

export default function HomeRenderer({ sections }) {
  return sections.map((section, i) => {
    const Component = registry[section.type];
    if (!Component) return null;

    return <Component key={i} {...section.props} />;
  });
}