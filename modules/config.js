module.exports = {
  // Modo piloto
  PILOT_MODE: true,
  PILOT_SIZE: 1000,
  BATCH_SIZE: 100,
  
  // MongoDB
  MONGO_URI: process.env.MONGO_URI || '',
  DB_NAME: 'elimfilters',
  
  // Colecciones
  COLLECTIONS: {
    SUPER_MAESTRO: 'SUPER_MAESTRO_INTELLIGENT_2026',
    MASTER_KITS: 'MASTER_KITS_V1',
    CROSS_REF: 'CROSS_REFERENCE_MASTER',
    WIX_IMPORT: 'WIX_IMPORT_PILOT',
    FLEETGUARD_IMPORT: 'FLEETGUARD_IMPORT_PILOT',
    DONALDSON_IMPORT: 'DONALDSON_IMPORT_PILOT'
  },
  
  // Archivos de entrada - MOCK DATA para piloto
  // En producción, estas rutas se actualizarían con archivos reales
  FILES: {
    WIX: null,  // Usaremos datos mock
    FLEETGUARD: null,
    DONALDSON: null,
    CATALOGO_DONALDSON: null,
    DENSO: null,
    CG_FILTERS: null
  },
  
  // Prefijos SKU
  PREFIXES: {
    HD_KIT: 'EK5',
    LD_KIT: 'EK3',
    OIL: 'EL8',
    AIR: 'EA1',
    FUEL: 'EF9',
    HYDRAULIC: 'EH6',
    CABIN: 'EC1'
  },
  
  // Tecnologías ADN
  TECHNOLOGIES: {
    'Lube': 'SINTRAX™',
    'Air': 'MACROCORE™',
    'Fuel': 'SYNTEPORE™',
    'Hydraulic': 'NANOFORCE™',
    'Cabin': 'MICROKAPPA™'
  },
  
  // Clasificación de Duty
  DUTY_RULES: {
    ALWAYS_HD: [
      'Agriculture', 'Mining', 'Construction', 'Off-Highway',
      'Industrial', 'Power Generation', 'Forestry', 'Material Handling'
    ],
    ALWAYS_LD: [
      'Automotive', 'Passenger Car', 'Light Truck', 'SUV', 'Van', 'Pickup'
    ]
  }
};
