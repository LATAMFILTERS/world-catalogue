const XLSX = require('xlsx');
const fs = require('fs');

console.log('\n📊 VERIFICANDO COLUMNAS DE ARCHIVOS EXCEL ORIGINALES:\n');

// Leer Baldwin
try {
    const workbook = XLSX.readFile('baldwin_pdf_2016.xlsx');
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { defval: null });
    
    if (data.length > 0) {
        console.log('baldwin_pdf_2016.xlsx tiene ' + Object.keys(data[0]).length + ' columnas:');
        Object.keys(data[0]).forEach(k => console.log('  - ' + k));
    }
} catch(e) {
    console.log('baldwin_pdf_2016.xlsx: No se puede leer - ' + e.message);
}

console.log('\n');

// Leer WIX
try {
    const workbook = XLSX.readFile('WIX_Master_Interchange.xlsx');
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { defval: null });
    
    if (data.length > 0) {
        console.log('WIX_Master_Interchange.xlsx tiene ' + Object.keys(data[0]).length + ' columnas:');
        Object.keys(data[0]).forEach(k => console.log('  - ' + k));
    }
} catch(e) {
    console.log('WIX_Master_Interchange.xlsx: No se puede leer - ' + e.message);
}

console.log('\n');

// Leer MANN HD
try {
    const workbook = XLSX.readFile('MANN-FILTER_Cross_Reference_HD.xlsx');
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { defval: null });
    
    if (data.length > 0) {
        console.log('MANN-FILTER_Cross_Reference_HD.xlsx tiene ' + Object.keys(data[0]).length + ' columnas:');
        Object.keys(data[0]).forEach(k => console.log('  - ' + k));
    }
} catch(e) {
    console.log('MANN-FILTER_Cross_Reference_HD.xlsx: No se puede leer - ' + e.message);
}
