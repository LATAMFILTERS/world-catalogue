import Hero from "@/components/sections/Hero";
import Stats from "@/components/sections/Stats";
import Industries from "@/components/sections/Industries";
import Technologies from "@/components/sections/Technologies";

import { homeData } from "@/app/data";

export default function Home() {
  return (
    <>
      <Hero />

      <Stats items={homeData.stats} />

      <Industries items={homeData.industries} />

      <Technologies items={homeData.technologies} />
    </>
  );
}
