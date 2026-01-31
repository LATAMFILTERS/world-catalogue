const fs = require('fs');
const path = require('path');

console.log('\n🏗️  CREANDO ESTRUCTURA DEL PROYECTO...\n');

const dirs = [
  'logs',
  'checkpoints',
  'modules',
  'data',
  'temp'
];

dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✅ Carpeta creada: ${dir}`);
  } else {
    console.log(`⏭️  Ya existe: ${dir}`);
  }
});

console.log('\n✅ ESTRUCTURA BASE CREADA\n');
