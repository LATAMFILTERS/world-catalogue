const { MongoClient } = require('mongodb');
const config = require('./modules/config');

async function analyzeSuperMaestro() {
  const client = new MongoClient(config.MONGO_URI);
  await client.connect();
  const db = client.db(config.DB_NAME);
  
  console.log('\n📊 SUPER_MAESTRO_INTELLIGENT_2026:');
  console.log('═'.repeat(70));
  
  const collection = db.collection('SUPER_MAESTRO_INTELLIGENT_2026');
  
  // Total de registros
  const total = await collection.countDocuments();
  console.log(`\n📈 Total de registros: ${total}`);
  
  // Obtener un sample
  const sample = await collection.findOne();
  
  console.log('\n📋 ESTRUCTURA DEL REGISTRO:');
  console.log('─'.repeat(70));
  console.log(JSON.stringify(sample, null, 2));
  
  console.log('\n🔑 CAMPOS DISPONIBLES:');
  const keys = Object.keys(sample);
  keys.forEach((key, idx) => {
    const value = sample[key];
    const type = Array.isArray(value) ? 'Array' : typeof value;
    console.log(`   ${idx + 1}. ${key} (${type})`);
  });
  
  console.log(`\n📊 Total de campos: ${keys.length}`);
  
  // Buscar el código 57MD42M
  console.log('\n🔍 BUSCANDO CÓDIGO: 57MD42M');
  console.log('─'.repeat(70));
  
  const searchFields = keys.filter(k => 
    k.toLowerCase().includes('code') || 
    k.toLowerCase().includes('sku') ||
    k.toLowerCase().includes('reference') ||
    k.toLowerCase().includes('oem') ||
    k.toLowerCase().includes('cross')
  );
  
  console.log(`\n📋 Campos de búsqueda identificados:`);
  searchFields.forEach(field => console.log(`   - ${field}`));
  
  // Buscar en todos los campos posibles
  const searchQuery = { $or: [] };
  searchFields.forEach(field => {
    searchQuery.$or.push({ [field]: '57MD42M' });
    searchQuery.$or.push({ [field]: /57MD42M/i });
  });
  
  const found = await collection.findOne(searchQuery);
  
  if (found) {
    console.log('\n✅ CÓDIGO 57MD42M ENCONTRADO:');
    console.log(JSON.stringify(found, null, 2));
  } else {
    console.log('\n❌ Código 57MD42M NO encontrado en campos específicos');
    
    // Buscar en TODOS los campos (búsqueda amplia)
    console.log('\n🔍 BUSCANDO EN TODOS LOS CAMPOS...');
    const allFieldsSearch = await collection.findOne({
      $or: keys.map(field => ({ [field]: /57MD42M/i }))
    });
    
    if (allFieldsSearch) {
      console.log('\n✅ ENCONTRADO EN BÚSQUEDA AMPLIA:');
      console.log(JSON.stringify(allFieldsSearch, null, 2));
    } else {
      console.log('\n❌ Código 57MD42M NO encontrado en ningún campo');
      
      // Buscar códigos similares
      const similar = await collection.find({
        $or: searchFields.map(field => ({
          [field]: /57MD/i
        }))
      }).limit(5).toArray();
      
      if (similar.length > 0) {
        console.log('\n📊 CÓDIGOS SIMILARES ENCONTRADOS:');
        similar.forEach((item, idx) => {
          console.log(`\n   [${idx + 1}]`);
          searchFields.forEach(field => {
            if (item[field]) {
              console.log(`      ${field}: ${item[field]}`);
            }
          });
        });
      }
    }
  }
  
  // Análisis de OEM Codes y Cross References
  console.log('\n\n📊 ANÁLISIS DE REFERENCIAS:');
  console.log('═'.repeat(70));
  
  const refFields = keys.filter(k => 
    k.toLowerCase().includes('oem') || 
    k.toLowerCase().includes('cross') ||
    k.toLowerCase().includes('reference')
  );
  
  console.log(`\n🔑 Campos de referencias encontrados:`);
  refFields.forEach(field => {
    console.log(`   - ${field}`);
  });
  
  // Contar registros con referencias
  for (const field of refFields) {
    const withRefs = await collection.countDocuments({
      [field]: { $exists: true, $ne: null, $ne: [] }
    });
    console.log(`\n   ${field}: ${withRefs} registros con datos`);
    
    // Sample de este campo
    const sampleWithField = await collection.findOne({
      [field]: { $exists: true, $ne: null, $ne: [] }
    });
    
    if (sampleWithField && sampleWithField[field]) {
      const value = sampleWithField[field];
      if (Array.isArray(value)) {
        console.log(`      Ejemplo (Array): ${value.slice(0, 3).join(', ')}...`);
      } else {
        console.log(`      Ejemplo: ${value}`);
      }
    }
  }
  
  await client.close();
  console.log('\n✅ ANÁLISIS COMPLETADO');
}

analyzeSuperMaestro().catch(console.error);
