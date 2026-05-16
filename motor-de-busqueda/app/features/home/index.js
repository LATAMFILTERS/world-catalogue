import industries from './data/industries';
import stats from './data/stats';
import technologies from './data/technologies';

import Hero from './components/Hero';
import Stats from './components/Stats';
import Industries from './components/Industries';
import Technologies from './components/Technologies';

export const homeController = {
  industries,
  stats,
  technologies,
  view: {
    Hero,
    Stats,
    Industries,
    Technologies,
  },
};
