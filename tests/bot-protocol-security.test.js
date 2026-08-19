const test = require('node:test');
const assert = require('node:assert/strict');

const { validateBody } = require('../lib/bot-protocol-security');

test('image endpoint body is valid without a text message', () => {
  assert.equal(validateBody({
    image_data_url: 'data:image/jpeg;base64,AAAA',
    channel: 'whatsapp',
    context: { conversation_id: '123' }
  }, { image: true }), null);
});

test('text endpoint still requires a message', () => {
  assert.equal(validateBody({ channel: 'whatsapp' }), 'message_is_required');
});

test('rejects unsafe object keys (prototype pollution guard)', () => {
  assert.equal(validateBody(JSON.parse('{"message":"hola","context":{"__proto__":{"x":1}}}')), 'unsafe_object_keys');
});

test('rejects unsupported channels', () => {
  assert.equal(validateBody({ message: 'hola', channel: 'telegram' }), 'unsupported_channel');
});
