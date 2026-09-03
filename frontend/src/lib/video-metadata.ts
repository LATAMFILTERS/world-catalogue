/**
 * Video Metadata Configuration
 * Structured data for Google Video Index optimization
 */

export interface VideoMetadata {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  uploadDate: string;
  duration: string; // ISO 8601 format: PT00H00M00S
  url: string;
  contentUrl: string;
  category: 'industry' | 'product' | 'hero' | 'technology';
  keywords: string[];
}

export const VIDEOS: Record<string, VideoMetadata> = {
  // Hero / Home
  'moleculas': {
    id: 'moleculas',
    title: 'ELIMFILTERS — Molecular Contamination Control',
    description: 'Advanced contamination control systems engineered to reduce wear, minimize downtime, and extend equipment lifespan across industrial operations.',
    thumbnailUrl: 'https://elimfilters.com/images/moleculas-thumb.jpg',
    uploadDate: '2024-01-15T00:00:00Z',
    duration: 'PT0H0M30S',
    url: 'https://elimfilters.com/videos/moleculas/',
    contentUrl: 'https://elimfilters.com/images/moleculas.mp4',
    category: 'hero',
    keywords: ['contamination control', 'industrial filtration', 'asset protection'],
  },

  // Industries
  'agriculture': {
    id: 'agriculture',
    title: 'ELIMFILTERS — Agricultural Equipment Protection',
    description: 'Filtration systems engineered for agricultural operations: tractors, combines, harvesters, sprayers protecting against crop residue, soil dust, and seasonal contamination.',
    thumbnailUrl: 'https://elimfilters.com/industries/agriculture-thumb.jpg',
    uploadDate: '2024-02-01T00:00:00Z',
    duration: 'PT0H1M15S',
    url: 'https://elimfilters.com/videos/agriculture/',
    contentUrl: 'https://elimfilters.com/images/Agriculture-2.mp4',
    category: 'industry',
    keywords: ['agriculture', 'filtration systems', 'equipment protection', 'tractors', 'combines'],
  },

  'automotive': {
    id: 'automotive',
    title: 'ELIMFILTERS — Automotive Filtration Systems',
    description: 'Protection systems for passenger vehicles and commercial fleets: engines, fuel systems, cabin air, hydraulic circuits protecting against urban particulate and highway contaminants.',
    thumbnailUrl: 'https://elimfilters.com/industries/automotive-thumb.jpg',
    uploadDate: '2024-02-01T00:00:00Z',
    duration: 'PT0H1M10S',
    url: 'https://elimfilters.com/videos/automotive/',
    contentUrl: 'https://elimfilters.com/images/Autos-Vin4.mp4',
    category: 'industry',
    keywords: ['automotive', 'passenger vehicles', 'commercial vehicles', 'air filtration', 'fuel filtration'],
  },

  'mining': {
    id: 'mining',
    title: 'ELIMFILTERS — Mining Equipment Asset Protection',
    description: 'Heavy-duty filtration for mining operations: excavators, haul trucks, processing equipment protecting against abrasive dust, hydraulic stress, and extreme duty cycles.',
    thumbnailUrl: 'https://elimfilters.com/industries/mining-thumb.jpg',
    uploadDate: '2024-02-01T00:00:00Z',
    duration: 'PT0H1M20S',
    url: 'https://elimfilters.com/videos/mining/',
    contentUrl: 'https://elimfilters.com/images/Minning4.mp4',
    category: 'industry',
    keywords: ['mining', 'heavy equipment', 'dust control', 'hydraulic protection', 'asset protection'],
  },

  'construction': {
    id: 'construction',
    title: 'ELIMFILTERS — Construction Equipment Filtration',
    description: 'Asset protection for construction: excavators, loaders, bulldozers, graders protecting against silica dust, hydraulic load, and severe jobsite conditions.',
    thumbnailUrl: 'https://elimfilters.com/industries/construction-thumb.jpg',
    uploadDate: '2024-02-01T00:00:00Z',
    duration: 'PT0H1M15S',
    url: 'https://elimfilters.com/videos/construction/',
    contentUrl: 'https://elimfilters.com/images/construction-2.mp4',
    category: 'industry',
    keywords: ['construction', 'heavy equipment', 'jobsite protection', 'dust control', 'contamination'],
  },

  'trucks-fleets': {
    id: 'trucks-fleets',
    title: 'ELIMFILTERS — Fleet Truck Filtration Systems',
    description: 'Protection systems for commercial trucking and logistics: long-haul trucks, delivery fleets, municipal vehicles protecting against highway dust and fuel contamination.',
    thumbnailUrl: 'https://elimfilters.com/industries/trucks-thumb.jpg',
    uploadDate: '2024-02-01T00:00:00Z',
    duration: 'PT0H1M10S',
    url: 'https://elimfilters.com/videos/trucks-fleets/',
    contentUrl: 'https://elimfilters.com/images/Trucks&Feel-1.mp4',
    category: 'industry',
    keywords: ['trucking', 'fleet filtration', 'commercial vehicles', 'logistics', 'downtime reduction'],
  },

  'railway': {
    id: 'railway',
    title: 'ELIMFILTERS — Railway Locomotive Protection',
    description: 'Filtration systems for locomotives and rail equipment: diesel locomotives, passenger rail, freight trains protecting against vibration, soot, and fuel contamination.',
    thumbnailUrl: 'https://elimfilters.com/industries/railway-thumb.jpg',
    uploadDate: '2024-02-01T00:00:00Z',
    duration: 'PT0H1M15S',
    url: 'https://elimfilters.com/videos/railway/',
    contentUrl: 'https://elimfilters.com/images/Train-2.mp4',
    category: 'industry',
    keywords: ['railway', 'locomotives', 'rail equipment', 'diesel engines', 'vibration protection'],
  },

  'marine': {
    id: 'marine',
    title: 'ELIMFILTERS — Marine Vessel Filtration Systems',
    description: 'Asset protection for maritime operations: commercial vessels, workboats, offshore equipment protecting against salt air, humidity, and fuel water contamination.',
    thumbnailUrl: 'https://elimfilters.com/industries/marine-thumb.jpg',
    uploadDate: '2024-02-01T00:00:00Z',
    duration: 'PT0H1M20S',
    url: 'https://elimfilters.com/videos/marine/',
    contentUrl: 'https://elimfilters.com/images/Marino-1.mp4',
    category: 'industry',
    keywords: ['marine', 'vessels', 'offshore', 'salt air', 'fuel contamination', 'sea operations'],
  },

  'manufacturing': {
    id: 'manufacturing',
    title: 'ELIMFILTERS — Industrial Manufacturing Protection',
    description: 'Filtration systems for manufacturing facilities: industrial engines, hydraulic systems, compressors, production equipment protecting against process dust and contamination.',
    thumbnailUrl: 'https://elimfilters.com/industries/manufacturing-thumb.jpg',
    uploadDate: '2024-02-01T00:00:00Z',
    duration: 'PT0H1M15S',
    url: 'https://elimfilters.com/videos/manufacturing/',
    contentUrl: 'https://elimfilters.com/images/Manufacture-1.mp4',
    category: 'industry',
    keywords: ['manufacturing', 'industrial equipment', 'production', 'compressors', 'hydraulic systems'],
  },

  'power-generation': {
    id: 'power-generation',
    title: 'ELIMFILTERS — Power Generation Backup Systems',
    description: 'Asset protection for power generation: generator sets, standby power units, turbines protecting against fuel degradation, thermal cycling, and long idle periods.',
    thumbnailUrl: 'https://elimfilters.com/industries/power-thumb.jpg',
    uploadDate: '2024-02-01T00:00:00Z',
    duration: 'PT0H1M15S',
    url: 'https://elimfilters.com/videos/power-generation/',
    contentUrl: 'https://elimfilters.com/images/Power-1.mp4',
    category: 'industry',
    keywords: ['power generation', 'generator sets', 'backup power', 'emergency systems', 'standby'],
  },

  'oil-gas': {
    id: 'oil-gas',
    title: 'ELIMFILTERS — Oil & Gas Equipment Protection',
    description: 'Filtration systems for energy operations: compressors, pumps, turbines, offshore equipment protecting against salt air, fuel contamination, and extreme duty cycles.',
    thumbnailUrl: 'https://elimfilters.com/industries/oil-gas-thumb.jpg',
    uploadDate: '2024-02-01T00:00:00Z',
    duration: 'PT0H1M20S',
    url: 'https://elimfilters.com/videos/oil-gas/',
    contentUrl: 'https://elimfilters.com/images/Petro&Gas-1.mp4',
    category: 'industry',
    keywords: ['oil and gas', 'energy', 'compressors', 'offshore', 'corrosion protection'],
  },

  'bus-coach': {
    id: 'bus-coach',
    title: 'ELIMFILTERS — Transit Bus & Coach Protection',
    description: 'Asset protection for public transit and passenger vehicles: city buses, school buses, coaches protecting against urban dust, soot loading, and stop-go duty cycles.',
    thumbnailUrl: 'https://elimfilters.com/industries/bus-thumb.jpg',
    uploadDate: '2024-02-01T00:00:00Z',
    duration: 'PT0H1M10S',
    url: 'https://elimfilters.com/videos/bus-coach/',
    contentUrl: 'https://elimfilters.com/images/buses-2.mp4',
    category: 'industry',
    keywords: ['transit', 'buses', 'public transportation', 'passenger vehicles', 'urban filtration'],
  },

  // Products
  'product-elimf': {
    id: 'product-elimf',
    title: 'ELIMFILTERS Product Overview',
    description: 'ELIMFILTERS filtration products: industrial-grade filter cartridges, housings, and systems engineered for asset protection across critical industrial domains.',
    thumbnailUrl: 'https://elimfilters.com/products-thumb.jpg',
    uploadDate: '2024-01-20T00:00:00Z',
    duration: 'PT0H0M45S',
    url: 'https://elimfilters.com/products',
    contentUrl: 'https://elimfilters.com/images/product-elimf.mp4',
    category: 'product',
    keywords: ['products', 'filter cartridges', 'industrial filtration', 'ELIMFILTERS'],
  },
};

/**
 * Get video metadata by ID
 */
export function getVideoMetadata(id: string): VideoMetadata | undefined {
  return VIDEOS[id];
}

/**
 * Get all videos for a specific category
 */
export function getVideosByCategory(category: VideoMetadata['category']): VideoMetadata[] {
  return Object.values(VIDEOS).filter(v => v.category === category);
}

/**
 * Generate JSON-LD VideoObject schema
 */
export function generateVideoSchema(video: VideoMetadata): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: video.title,
    description: video.description,
    thumbnailUrl: video.thumbnailUrl,
    uploadDate: video.uploadDate,
    duration: video.duration,
    contentUrl: video.contentUrl,
    url: video.url,
    keywords: video.keywords.join(', '),
    author: {
      '@type': 'Organization',
      name: 'ELIMFILTERS',
      url: 'https://elimfilters.com',
    },
    publisher: {
      '@type': 'Organization',
      name: 'ELIMFILTERS',
      '@id': 'https://elimfilters.com/#organization',
    },
  }, null, 2);
}
