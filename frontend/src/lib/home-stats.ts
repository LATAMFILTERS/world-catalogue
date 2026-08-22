import { catalogue } from './catalogue';

export interface HomeStat {
  id: 'industries' | 'technologies' | 'systems' | 'resources';
  value: number;
  suffix: string;
  label: string;
}

/**
 * Systems (5) and Knowledge Center resources (105+) are not modeled as
 * arrays in catalogue.json today, so they are fixed here rather than
 * derived. Industries and technologies ARE derived from the live
 * catalogue so they can't silently drift out of sync with real data.
 */
export function getHomeStats(): HomeStat[] {
  return [
    { id: 'industries', value: catalogue.industries.length, suffix: '', label: 'Industries Served' },
    { id: 'technologies', value: catalogue.technologies.length, suffix: '', label: 'Proprietary Technologies' },
    { id: 'systems', value: 5, suffix: '', label: 'Protection Systems' },
    { id: 'resources', value: 105, suffix: '+', label: 'Knowledge Center Resources' },
  ];
}
