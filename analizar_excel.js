const XLSX = require('xlsx');
const fs = require('fs');

const archivos = [
    'Catalogo_Donaldson_Final.xlsx',
    'MANN-FILTER_Cross_Reference_HD.xlsx',
    'mann-filter_equipo_pesado.xlsx',
    'WIX_Master_Interchange.xlsx',
    'baldwin pdf 2016.xlsx'
];

const kitKeywords = ['vehicle', 'vehiculo', 'machine', 'maquina', 'model', 
                     'modelo', 'year', 'ano', 'engine', 'motor', 'application',
                     'oil', 'air', 'fuel', 'cabin', 'aceite', 'aire'];

archivos.forEach(archivo => {
    if (!fs.existsSync(archivo)) {
        console.log(Advertencia: No encontrado: @{Nombre=Filtros_Motores_Diesel_COMPLETO.xlsx; Ruta=C:\Users\VICTOR ABREU\OneDrive\Desktop\ELIMFILTERS\Nueva carpeta\Filtros_Motores_Diesel_COMPLETO.xlsx; TamanoMB=20.33; Extension=.xlsx; FechaModificacion=06/25/2025 14:18:20});
        return;
    }
    
    console.log('\n' + '='.repeat(60));
    console.log(ARCHIVO: @{Nombre=Filtros_Motores_Diesel_COMPLETO.xlsx; Ruta=C:\Users\VICTOR ABREU\OneDrive\Desktop\ELIMFILTERS\Nueva carpeta\Filtros_Motores_Diesel_COMPLETO.xlsx; TamanoMB=20.33; Extension=.xlsx; FechaModificacion=06/25/2025 14:18:20});
    console.log('='.repeat(60));
    
    try {
        const workbook = XLSX.readFile(archivo);
        const sheets = workbook.SheetNames.slice(0, 3);
        
        sheets.forEach(sheetName => {
            console.log(\nHOJA: );
            
            const sheet = workbook.Sheets[sheetName];
            const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
            
            const headers = data[0] || [];
            console.log(   Filas: );
            console.log(   Columnas: );
            console.log('\n   COLUMNAS:');
            
            const kitCols = [];
            headers.forEach(col => {
                console.log(      - );
                if (kitKeywords.some(kw => String(col).toLowerCase().includes(kw))) {
                    kitCols.push(col);
                }
            });
            
            if (kitCols.length > 0) {
                console.log('\n   COLUMNAS DE KIT DETECTADAS:');
                kitCols.forEach(col => console.log(      * ));
            } else {
                console.log('\n   No se detectaron columnas de kit');
            }
            
            console.log('\n   PRIMERAS 5 FILAS:');
            data.slice(0, 6).forEach((row, i) => {
                console.log(   Fila : );
            });
            
            // Analisis
            const hasVehicle = headers.some(h => 
                String(h).toLowerCase().includes('vehicle') || 
                String(h).toLowerCase().includes('model')
            );
            const hasFilters = headers.filter(h => 
                ['oil', 'air', 'fuel', 'cabin'].some(f => 
                    String(h).toLowerCase().includes(f)
                )
            ).length;
            
            console.log('\n   ANALISIS:');
            if (hasVehicle && hasFilters > 2) {
                console.log('      ESCENARIO A: Datos ESTRUCTURADOS');
                console.log('         Costo: GRATIS');
            } else if (hasVehicle || kitCols.length > 0) {
                console.log('      ESCENARIO B: Datos SEMI-ESTRUCTURADOS');
                console.log('         Costo: ~0.0002 USD por vehiculo');
            } else {
                console.log('      ESCENARIO C: Datos NO ESTRUCTURADOS');
                console.log('         Costo: ~0.003 USD por vehiculo');
            }
        });
        
    } catch (error) {
        console.log(   Error: );
    }
});

console.log('\nAnalisis completado!');
