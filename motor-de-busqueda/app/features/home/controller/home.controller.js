import { homeData } from "../data";

import Hero from "../components/Hero";
import Stats from "../components/Stats";
import Industries from "../components/Industries";
import Technologies from "../components/Technologies";

export function getHomeModel() {
  return {
    view: (
      <>
        <Hero />
        <Stats items={homeData.stats} />
        <Industries items={homeData.industries} />
        <Technologies items={homeData.technologies} />
      </>
    ),
  };
}