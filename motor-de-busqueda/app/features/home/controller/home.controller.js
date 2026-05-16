import { homeData } from "../data";

export function getHomeModel() {
  return {
    sections: [
      { type: "hero" },

      {
        type: "stats",
        props: { items: homeData.stats },
      },

      {
        type: "industries",
        props: { items: homeData.industries },
      },

      {
        type: "technologies",
        props: { items: homeData.technologies },
      },
    ],
  };
}