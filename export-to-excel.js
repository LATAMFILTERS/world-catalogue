const { MongoClient } = require('mongodb');
const ExcelJS = require('exceljs');
const config = require('./modules/config');

async function generateExcel() {
  console.log('🚀 Conectando a MongoDB Atlas...');
  const client = new MongoClient(config.MONGO_URI);
  await client.connect();
  const db = client.db(config.DB_NAME);

  console.log('📊 Exportando MASTER_UNIFIED_V5...');
  
  // Obtener datos de super_maestro
  const filters = await db.collection(config.COLLECTIONS.SUPER_MAESTRO)
    .find()
    .limit(config.PILOT_SIZE)
    .toArray();

  console.log(`✅ ${filters.length} filtros obtenidos`);

  // Crear workbook
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('MASTER_UNIFIED_V5');

  // Definir las 39 columnas
  worksheet.columns = [
    { header: 'Input Code', key: 'Input Code', width: 15 },
    { header: 'ELIMFILTERS SKU', key: 'ELIMFILTERS SKU', width: 15 },
    { header: 'Description', key: 'Description', width: 30 },
    { header: 'Filter Type', key: 'Filter Type', width: 12 },
    { header: 'Subtype', key: 'Subtype', width: 12 },
    { header: 'Duty', key: 'Duty', width: 8 },
    { header: 'Application', key: 'Application', width: 20 },
    { header: 'Installation Type', key: 'Installation Type', width: 15 },
    { header: 'ELIMFILTERS Technology', key: 'ELIMFILTERS Technology', width: 20 },
    { header: 'Media Type', key: 'Media Type', width: 15 },
    { header: 'Micron Rating', key: 'Micron Rating', width: 12 },
    { header: 'Beta Ratio', key: 'Beta Ratio', width: 12 },
    { header: 'ISO Test Method', key: 'ISO Test Method', width: 15 },
    { header: 'Special Features', key: 'Special Features', width: 25 },
    { header: 'Height (mm)', key: 'Height (mm)', width: 12 },
    { header: 'Height (inch)', key: 'Height (inch)', width: 12 },
    { header: 'Outer Diameter (mm)', key: 'Outer Diameter (mm)', width: 15 },
    { header: 'Outer Diameter (inch)', key: 'Outer Diameter (inch)', width: 15 },
    { header: 'Inner Diameter (mm)', key: 'Inner Diameter (mm)', width: 15 },
    { header: 'Inner Diameter (inch)', key: 'Inner Diameter (inch)', width: 15 },
    { header: 'Thread Size', key: 'Thread Size', width: 12 },
    { header: 'Gasket OD (mm)', key: 'Gasket OD (mm)', width: 12 },
    { header: 'Gasket OD (inch)', key: 'Gasket OD (inch)', width: 12 },
    { header: 'Gasket ID (mm)', key: 'Gasket ID (mm)', width: 12 },
    { header: 'Gasket ID (inch)', key: 'Gasket ID (inch)', width: 12 },
    { header: 'Max Pressure (PSI)', key: 'Max Pressure (PSI)', width: 15 },
    { header: 'Rated Flow (L/min)', key: 'Rated Flow (L/min)', width: 15 },
    { header: 'Rated Flow (GPM)', key: 'Rated Flow (GPM)', width: 15 },
    { header: 'Nominal Efficiency (%)', key: 'Nominal Efficiency (%)', width: 18 },
    { header: 'Burst Pressure (PSI)', key: 'Burst Pressure (PSI)', width: 15 },
    { header: 'Collapse Pressure (PSI)', key: 'Collapse Pressure (PSI)', width: 18 },
    { header: 'Bypass Valve Pressure (PSI)', key: 'Bypass Valve Pressure (PSI)', width: 20 },
    { header: 'Pressure Valve', key: 'Pressure Valve', width: 12 },
    { header: 'Anti-Drainback Valve', key: 'Anti-Drainback Valve', width: 18 },
    { header: 'Equipment Applications', key: 'Equipment Applications', width: 30 },
    { header: 'Engine Applications', key: 'Engine Applications', width: 30 },
    { header: 'Equipment Year', key: 'Equipment Year', width: 15 },
    { header: 'OEM Codes', key: 'OEM Codes', width: 25 },
    { header: 'Cross References', key: 'Cross References', width: 25 }
  ];

  // Agregar datos
  filters.forEach(filter => {
    worksheet.addRow({
      'Input Code': filter['Input Code'],
      'ELIMFILTERS SKU': filter['ELIMFILTERS SKU'],
      'Description': filter['Description'],
      'Filter Type': filter['Filter Type'],
      'Subtype': filter['Subtype'],
      'Duty': filter['Duty'],
      'Application': filter['Application'],
      'Installation Type': filter['Installation Type'],
      'ELIMFILTERS Technology': filter['ELIMFILTERS Technology'],
      'Media Type': filter['Media Type'],
      'Micron Rating': filter['Micron Rating'],
      'Beta Ratio': filter['Beta Ratio'],
      'ISO Test Method': filter['ISO Test Method'],
      'Special Features': filter['Special Features'],
      'Height (mm)': filter['Height (mm)'],
      'Height (inch)': filter['Height (inch)'],
      'Outer Diameter (mm)': filter['Outer Diameter (mm)'],
      'Outer Diameter (inch)': filter['Outer Diameter (inch)'],
      'Inner Diameter (mm)': filter['Inner Diameter (mm)'],
      'Inner Diameter (inch)': filter['Inner Diameter (inch)'],
      'Thread Size': filter['Thread Size'],
      'Gasket OD (mm)': filter['Gasket OD (mm)'],
      'Gasket OD (inch)': filter['Gasket OD (inch)'],
      'Gasket ID (mm)': filter['Gasket ID (mm)'],
      'Gasket ID (inch)': filter['Gasket ID (inch)'],
      'Max Pressure (PSI)': filter['Max Pressure (PSI)'],
      'Rated Flow (L/min)': filter['Rated Flow (L/min)'],
      'Rated Flow (GPM)': filter['Rated Flow (GPM)'],
      'Nominal Efficiency (%)': filter['Nominal Efficiency (%)'],
      'Burst Pressure (PSI)': filter['Burst Pressure (PSI)'],
      'Collapse Pressure (PSI)': filter['Collapse Pressure (PSI)'],
      'Bypass Valve Pressure (PSI)': filter['Bypass Valve Pressure (PSI)'],
      'Pressure Valve': filter['Pressure Valve'],
      'Anti-Drainback Valve': filter['Anti-Drainback Valve'],
      'Equipment Applications': Array.isArray(filter['Equipment Applications']) ? filter['Equipment Applications'].join(', ') : '',
      'Engine Applications': Array.isArray(filter['Engine Applications']) ? filter['Engine Applications'].join(', ') : '',
      'Equipment Year': filter['Equipment Year'],
      'OEM Codes': Array.isArray(filter['OEM Codes']) ? filter['OEM Codes'].join(', ') : '',
      'Cross References': Array.isArray(filter['Cross References']) ? filter['Cross References'].join(', ') : ''
    });
  });

  // Guardar archivo
  const filename = 'MASTER_UNIFIED_V5.xlsx';
  await workbook.xlsx.writeFile(filename);
  console.log(`✅ Archivo generado: ${filename}`);

  await client.close();
  console.log('🎉 Exportación completada!');
}

generateExcel().catch(console.error);
