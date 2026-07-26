const fs=require('node:fs');
const assert=require('node:assert/strict');
const server=fs.readFileSync('server-original.js','utf8');
const ui=fs.readFileSync('frontend/src/components/ui/ChatBot.tsx','utf8');

assert.match(server,/Then connect the verified chain only in this order/);
assert.match(server,/CHAT_OUTPUT_LEAK_PATTERNS/);
assert.match(server,/Unsafe model output blocked/);
assert.match(server,/buyerType: 'unknown'/);
assert.match(server,/CHAT_UNRESOLVED_LIMIT = 5/);
assert.match(server,/support@elimfilters\.com/);
assert.match(ui,/Para entender la causa, contame qué activo usás/);
assert.match(ui,/Describe el activo, síntoma o riesgo operativo/);
assert.doesNotMatch(ui,/Pregunta sobre filtros, normas, industrias/);
console.log('chatbot safety contract verified');
