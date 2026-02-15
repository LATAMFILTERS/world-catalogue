const donaldsonScraper = require('./services/scrapers/donaldson.scraper');

async function test() {
    console.log('🧪 TESTING DONALDSON SCRAPER v2.0\n');
    console.log('='.repeat(50));
    
    // Códigos de prueba
    const testCodes = [
        'P551808',  // El que vimos en la web
        'P608533',  // Otro código
        'INVALID'   // Para probar error handling
    ];
    
    for (const code of testCodes) {
        console.log(`\n🔍 Probando código: ${code}`);
        console.log('-'.repeat(50));
        
        try {
            const result = await donaldsonScraper(code);
            
            if (result.error) {
                console.log('❌ ERROR:', result.message);
            } else {
                console.log('✅ SUCCESS');
                console.log('📦 Descripción:', result.descripcion);
                console.log('🔗 URL:', result.urlFinal);
                console.log('📊 Especificaciones:', result.stats.cantidadEspecificaciones);
                console.log('🔄 Cross References:', result.stats.cantidadCrossReferences);
                console.log('🖼️  Imagen:', result.imagen ? 'Sí' : 'No');
                console.log('📁 Categoría:', result.categoria);
            }
            
            // Mostrar JSON completo (comentar si es muy largo)
            // console.log('\n📄 JSON completo:');
            // console.log(JSON.stringify(result, null, 2));
            
        } catch (error) {
            console.log('💥 EXCEPCIÓN:', error.message);
        }
        
        console.log('='.repeat(50));
    }
}

test().then(() => {
    console.log('\n✅ Tests completados');
    process.exit(0);
}).catch(err => {
    console.error('\n❌ Error en tests:', err);
    process.exit(1);
});
