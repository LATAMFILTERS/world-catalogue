const { MongoClient } = require('mongodb');
const ExcelJS = require('exceljs');
const config = require('./modules/config');

async function generateKitsExcel() {
  console.log('🚀 Conectando a MongoDB Atlas...');
  const client = new MongoClient(config.MONGO_URI);
  await client.connect();
  const db = client.db(config.DB_NAME);

  console.log('📊 Exportando MASTER_KITS_V1...');
  
  // Obtener datos de master_kits
  const kits = await db.collection(config.COLLECTIONS.MASTER_KITS)
    .find()
    .toArray();

  console.log(`✅ ${kits.length} kits obtenidos`);

  // Crear workbook
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('MASTER_KITS_V1');

  // Definir las 21 columnas de kits
  worksheet.columns = [
    { header: 'Kit SKU', key: 'kit_sku', width: 15 },
    { header: 'Kit Series', key: 'kit_series', width: 20 },
    { header: 'Kit Description', key: 'description', width: 40 },
    { header: 'Industry Segment', key: 'industry_segment', width: 20 },
    { header: 'Equipment Model', key: 'equipment_model', width: 25 },
    { header: 'Equipment Year', key: 'equipment_year', width: 15 },
    { header: 'Engine Model', key: 'engine_model', width: 20 },
    { header: 'Service Interval (hours)', key: 'service_interval_hours', width: 20 },
    { header: 'Filters Included', key: 'filters_included', width: 30 },
    { header: 'Filter Count', key: 'filter_count', width: 12 },
    { header: 'Oil Filter Qty', key: 'oil_filter_qty', width: 12 },
    { header: 'Fuel Filter Qty', key: 'fuel_filter_qty', width: 12 },
    { header: 'Air Filter Qty', key: 'air_filter_qty', width: 12 },
    { header: 'Hydraulic Filter Qty', key: 'hydraulic_filter_qty', width: 18 },
    { header: 'Total Kit Price', key: 'total_kit_price', width: 15 },
    { header: 'Discount %', key: 'discount_percentage', width: 12 },
    { header: 'Final Price', key: 'final_price', width: 15 },
    { header: 'Stock Status', key: 'stock_status', width: 12 },
    { header: 'Created Date', key: 'created_at', width: 20 },
    { header: 'Updated Date', key: 'updated_at', width: 20 },
    { header: 'Notes', key: 'notes', width: 30 }
  ];

  // Agregar datos
  kits.forEach(kit => {
    worksheet.addRow({
      kit_sku: kit.kit_sku,
      kit_series: kit.kit_series,
      description: kit.description,
      industry_segment: kit.industry_segment,
      equipment_model: kit.equipment_model,
      equipment_year: kit.equipment_year,
      engine_model: kit.engine_model,
      service_interval_hours: kit.service_interval_hours,
      filters_included: Array.isArray(kit.filters_included) ? kit.filters_included.join(', ') : '',
      filter_count: kit.filter_count,
      oil_filter_qty: kit.oil_filter_qty,
      fuel_filter_qty: kit.fuel_filter_qty,
      air_filter_qty: kit.air_filter_qty,
      hydraulic_filter_qty: kit.hydraulic_filter_qty,
      total_kit_price: kit.total_kit_price,
      discount_percentage: kit.discount_percentage,
      final_price: kit.final_price,
      stock_status: kit.stock_status,
      created_at: kit.created_at,
      updated_at: kit.updated_at,
      notes: kit.notes
    });
  });

  // Guardar archivo
  const filename = 'MASTER_KITS_V1.xlsx';
  await workbook.xlsx.writeFile(filename);
  console.log(`✅ Archivo generado: ${filename}`);

  await client.close();
  console.log('🎉 Exportación completada!');
}

generateKitsExcel().catch(console.error);
