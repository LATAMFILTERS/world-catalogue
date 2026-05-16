import { homeData } from "@/app/data";

/**
 * HOME CONTROLLER (Application Layer)
 * Orquesta datos para la vista Home
 */
export function getHomeProps() {
  return {
    hero: {
      title: "Industrial Filtration Solutions",
      subtitle: "Global Performance Systems",
    },

    stats: homeData.stats,
    industries: homeData.industries,
    technologies: homeData.technologies,
  };
}