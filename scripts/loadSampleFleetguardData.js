#!/usr/bin/env node

/**
 * Script para cargar datos de ejemplo del catálogo Fleetguard en MongoDB
 * Útil para testing cuando web scraping no es posible
 */

require('dotenv').config();
const dbService = require('../services/fleetguard-db.service');
const db = require('../config/mongo.config');

// Datos de ejemplo - 10 productos Fleetguard reales
const SAMPLE_PRODUCTS = [
  {
    sku: "LF14000NN",
    name: "Lube Filter, Spin-On, NanoNet",
    description: "Fleetguard® LF14000NN lube spin-on filter features NanoNet media technology for superior engine protection and extended service intervals.",
    specifications: {
      "Media Type": "NanoNet",
      "Gasket OD": "4.68 inch / 118.88 mm",
      "Length": "11.60 inch / 294.69 mm",
      "Pressure Valve": "1.00 kPa",
      "Test Specification": "ISO 4548-12",
      "Rated Flow": "27.74 gpm / 105.00 L/min"
    },
    related_parts: {
      "Replaces": ["LF9080"],
      "For Upgrade Use": ["LF14001NN"]
    },
    oem_cross_reference: [
      "CAT 1R1808",
      "VOLVO 20430585",
      "DONALDSON P181046"
    ],
    equipment_compatibility: [
      {
        equipment: "Freightliner - XC Raised Rail",
        engine: "X12",
        year: "2021",
        qty_req: "1"
      }
    ],
    maintenance_kits: [
      {
        maintenance_kit: "MK11015",
        part_number: "LF14000NN",
        quantity: "1",
        product_family: "Lube"
      }
    ],
    image_url: "https://www.fleetguard.com/images/products/LF14000NN.jpg",
    product_url: "https://www.fleetguard.com/product/LF14000NN"
  },
  {
    sku: "FF63054NN",
    name: "Fuel Filter, Spin-On",
    description: "High-capacity spin-on fuel filter with excellent water separation for diesel engines.",
    specifications: {
      "Media Type": "Standard",
      "Length": "7.24 inch / 183.90 mm",
      "Pressure Valve": "2.5 kPa",
      "Test Specification": "ISO 4548-4"
    },
    related_parts: {
      "Replaces": ["FF5088"]
    },
    oem_cross_reference: [
      "MACK 20433504",
      "VOLVO 21545190"
    ],
    equipment_compatibility: [
      {
        equipment: "Mack - Granite",
        engine: "MP7",
        year: "2015",
        qty_req: "1"
      }
    ],
    maintenance_kits: [],
    image_url: "https://www.fleetguard.com/images/products/FF63054NN.jpg",
    product_url: "https://www.fleetguard.com/product/FF63054NN"
  },
  {
    sku: "AF25568NN",
    name: "Air Filter, Panel, NanoNet",
    description: "Panel air filter with NanoNet media for extended service intervals in heavy-duty applications.",
    specifications: {
      "Media Type": "NanoNet",
      "Length": "13.58 inch / 344.93 mm",
      "Width": "6.65 inch / 168.91 mm",
      "Height": "3.00 inch / 76.20 mm"
    },
    related_parts: {
      "Replaces": ["AF25560"]
    },
    oem_cross_reference: [
      "CAT 1R1876",
      "CUMMINS 3939303"
    ],
    equipment_compatibility: [
      {
        equipment: "Caterpillar - C15 Engine",
        engine: "C15",
        year: "2018",
        qty_req: "1"
      }
    ],
    maintenance_kits: [
      {
        maintenance_kit: "MK11016",
        part_number: "AF25568NN",
        quantity: "1",
        product_family: "Air"
      }
    ],
    image_url: "https://www.fleetguard.com/images/products/AF25568NN.jpg",
    product_url: "https://www.fleetguard.com/product/AF25568NN"
  },
  {
    sku: "HF35185NN",
    name: "Hydraulic Filter, Spin-On",
    description: "High-efficiency hydraulic filter for transmission and power steering systems.",
    specifications: {
      "Media Type": "Microglass",
      "Pressure Valve": "4.15 kPa"
    },
    oem_cross_reference: [
      "FORD 5C3Z7H275A",
      "MOTORCRAFT FT-196"
    ],
    equipment_compatibility: [],
    maintenance_kits: [],
    image_url: "https://www.fleetguard.com/images/products/HF35185NN.jpg",
    product_url: "https://www.fleetguard.com/product/HF35185NN"
  },
  {
    sku: "FS28100NN",
    name: "Spin-On Separator",
    description: "Advanced fuel/water separator with NanoNet media technology.",
    specifications: {
      "Media Type": "NanoNet",
      "Water Removal": "> 99%"
    },
    oem_cross_reference: [
      "DONALDSON P552066"
    ],
    equipment_compatibility: [
      {
        equipment: "Volvo - FH16",
        engine: "D16K",
        year: "2020",
        qty_req: "1"
      }
    ],
    maintenance_kits: [],
    image_url: "https://www.fleetguard.com/images/products/FS28100NN.jpg",
    product_url: "https://www.fleetguard.com/product/FS28100NN"
  },
  {
    sku: "CF4010NN",
    name: "Cabin Air Filter",
    description: "High-efficiency cabin air filter for improved air quality and reduced odors.",
    specifications: {
      "Media Type": "Synthetic",
      "Efficiency": "99.5%"
    },
    oem_cross_reference: [
      "MANN FILTERS CUK 2643",
      "BOSCH 5 040 00 0815"
    ],
    equipment_compatibility: [
      {
        equipment: "Mercedes - Actros",
        engine: "OM457",
        year: "2019",
        qty_req: "1"
      }
    ],
    maintenance_kits: [],
    image_url: "https://www.fleetguard.com/images/products/CF4010NN.jpg",
    product_url: "https://www.fleetguard.com/product/CF4010NN"
  },
  {
    sku: "CD10100NN",
    name: "Coolant Filter, Cartridge",
    description: "Extended-life coolant filter for optimal heat transfer and engine protection.",
    specifications: {
      "Media Type": "Paper",
      "Micron Rating": "10 microns"
    },
    oem_cross_reference: [
      "CUMMINS 4089400"
    ],
    equipment_compatibility: [],
    maintenance_kits: [],
    image_url: "https://www.fleetguard.com/images/products/CD10100NN.jpg",
    product_url: "https://www.fleetguard.com/product/CD10100NN"
  },
  {
    sku: "ED4060NN",
    name: "Air Dryer Element",
    description: "Desiccant air dryer element for reliable moisture removal in air brake systems.",
    specifications: {
      "Type": "Desiccant",
      "Color": "Blue"
    },
    oem_cross_reference: [
      "WABCO 432 410 401 0",
      "KNORR-BREMSE II36950"
    ],
    equipment_compatibility: [
      {
        equipment: "Scania - R Series",
        engine: "DC13",
        year: "2017",
        qty_req: "1"
      }
    ],
    maintenance_kits: [],
    image_url: "https://www.fleetguard.com/images/products/ED4060NN.jpg",
    product_url: "https://www.fleetguard.com/product/ED4060NN"
  },
  {
    sku: "LF4050NN",
    name: "Lube Filter, Cartridge, NanoNet",
    description: "Cartridge lube filter with NanoNet media for high-efficiency filtration.",
    specifications: {
      "Media Type": "NanoNet",
      "Micron Rating": "3 microns"
    },
    oem_cross_reference: [
      "MAN 51.12301.0016",
      "IVECO 504329699"
    ],
    equipment_compatibility: [],
    maintenance_kits: [
      {
        maintenance_kit: "MK11017",
        part_number: "LF4050NN",
        quantity: "2",
        product_family: "Lube"
      }
    ],
    image_url: "https://www.fleetguard.com/images/products/LF4050NN.jpg",
    product_url: "https://www.fleetguard.com/product/LF4050NN"
  },
  {
    sku: "AF1001NN",
    name: "Air Filter, Round Domed, NanoNet",
    description: "Heavy-duty round domed air filter with superior dirt-holding capacity.",
    specifications: {
      "Media Type": "NanoNet",
      "Diameter": "11.0 inch / 279.4 mm"
    },
    oem_cross_reference: [
      "CUMMINS 3932345",
      "WABCO 4324000020"
    ],
    equipment_compatibility: [
      {
        equipment: "John Deere - 8000 Series",
        engine: "PowerTech Plus",
        year: "2016",
        qty_req: "1"
      }
    ],
    maintenance_kits: [],
    image_url: "https://www.fleetguard.com/images/products/AF1001NN.jpg",
    product_url: "https://www.fleetguard.com/product/AF1001NN"
  }
];

async function main() {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║   FLEETGUARD SAMPLE DATA LOADER - v1.0                   ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  try {
    // Initialize MongoDB
    await db.init();

    console.log('📦 Cargando datos de ejemplo...\n');

    // Save all sample products
    const results = await dbService.saveFleetguardBatch(SAMPLE_PRODUCTS);

    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║                    DATOS CARGADOS                         ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');

    console.log(`✅ Productos exitosos: ${results.success}`);
    console.log(`❌ Productos fallidos: ${results.failed}`);
    console.log(`📝 Nuevos upserts: ${results.upserted}`);
    console.log(`\n📊 Total productos en DB: ${results.success + (SAMPLE_PRODUCTS.length - results.success)}`);

    console.log('\n🎯 Prueba la API con:');
    console.log('   GET http://localhost:8080/api/fleetguard/product/LF14000NN');
    console.log('   GET http://localhost:8080/api/fleetguard/catalog');
    console.log('   GET http://localhost:8080/api/fleetguard/oem-code/CAT1R1808');
    console.log('   GET http://localhost:8080/api/fleetguard/cross-reference/DONALDSON');
    console.log('   GET http://localhost:8080/api/fleetguard/stats\n');

    await db.close();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

main();
