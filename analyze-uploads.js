const fs = require('fs');
const path = require('path');

const uploadDir = '/mnt/user-data/uploads';
const files = fs.readdirSync(uploadDir);

console.log('ARCHIVOS ENCONTRADOS:');
console.log('='.repeat(70));

files.forEach(file => {
  const fullPath = path.join(uploadDir, file);
  const stats = fs.statSync(fullPath);
  const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
  console.log(`${file} - ${sizeMB} MB`);
});
