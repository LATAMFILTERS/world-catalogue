const ExcelJS = require('exceljs');

async function verify() {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile('MASTER_UNIFIED_V5.xlsx');
  
  const worksheet = workbook.getWorksheet('MASTER_UNIFIED_V5');
  const headerRow = worksheet.getRow(1);
  
  console.log('\n📋 ESTRUCTURA DEL ARCHIVO:');
  console.log(`   Filas totales: ${worksheet.rowCount}`);
  console.log(`   Columnas totales: ${headerRow.cellCount}`);
  
  console.log('\n📊 PRIMERAS 10 COLUMNAS:');
  for (let i = 1; i <= Math.min(10, headerRow.cellCount); i++) {
    const cell = headerRow.getCell(i);
    console.log(`   ${i}. ${cell.value}`);
  }
  
  console.log('\n📊 ÚLTIMAS 5 COLUMNAS:');
  for (let i = Math.max(1, headerRow.cellCount - 4); i <= headerRow.cellCount; i++) {
    const cell = headerRow.getCell(i);
    console.log(`   ${i}. ${cell.value}`);
  }
  
  console.log('\n✅ Archivo validado correctamente!');
}

verify().catch(console.error);
