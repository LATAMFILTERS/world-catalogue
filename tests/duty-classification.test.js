'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { classifyDuty, ReasonCode } = require('../lib/duty-classification');

test('pickup gasolina -> LD (combustible no decide)', () => {
  const r = classifyDuty({ manufacturer: 'FORD', equipmentType: 'pickup', fuelType: 'gasoline' });
  assert.equal(r.duty, 'LIGHT_DUTY');
  assert.equal(r.reason_code, ReasonCode.LD_PICKUP);
});

test('pickup diesel -> LD (el combustible no convierte una pickup en HD)', () => {
  const r = classifyDuty({ manufacturer: 'FORD', equipmentType: 'pickup', fuelType: 'diesel' });
  assert.equal(r.duty, 'LIGHT_DUTY');
  assert.equal(r.reason_code, ReasonCode.LD_PICKUP);
});

test('Toyota Corolla -> LD (automóvil/sedán)', () => {
  const r = classifyDuty({ manufacturer: 'TOYOTA', equipmentType: 'sedan', model: 'Corolla' });
  assert.equal(r.duty, 'LIGHT_DUTY');
  assert.equal(r.reason_code, ReasonCode.LD_PASSENGER_VEHICLE);
});

test('Toyota Hilux/Tacoma -> LD (pickup, no HD solo por marca)', () => {
  const r = classifyDuty({ manufacturer: 'TOYOTA', equipmentType: 'pickup truck', model: 'Hilux' });
  assert.equal(r.duty, 'LIGHT_DUTY');
  assert.equal(r.reason_code, ReasonCode.LD_PICKUP);
});

test('Toyota forklift -> HD (tipo de equipo pesa mas que la marca)', () => {
  const r = classifyDuty({ manufacturer: 'TOYOTA', equipmentType: 'forklift' });
  assert.equal(r.duty, 'HEAVY_DUTY');
  assert.equal(r.reason_code, ReasonCode.HD_FORKLIFT);
});

test('Nissan automóvil -> LD', () => {
  const r = classifyDuty({ manufacturer: 'NISSAN', equipmentType: 'crossover', model: 'Rogue' });
  assert.equal(r.duty, 'LIGHT_DUTY');
  assert.equal(r.reason_code, ReasonCode.LD_PASSENGER_VEHICLE);
});

test('Nissan pickup -> LD', () => {
  const r = classifyDuty({ manufacturer: 'NISSAN', equipmentType: 'pickup', model: 'Titan' });
  assert.equal(r.duty, 'LIGHT_DUTY');
  assert.equal(r.reason_code, ReasonCode.LD_PICKUP);
});

test('Nissan commercial truck -> HD (no HD/LD solo por marca)', () => {
  const r = classifyDuty({ manufacturer: 'NISSAN', equipmentType: 'commercial truck', model: 'UD' });
  assert.equal(r.duty, 'HEAVY_DUTY');
  assert.equal(r.reason_code, ReasonCode.HD_COMMERCIAL_TRUCK);
});

test('Caterpillar -> HD (maquinaria de construccion/mineria)', () => {
  const r = classifyDuty({ manufacturer: 'CATERPILLAR', equipmentType: 'wheel loader' });
  assert.equal(r.duty, 'HEAVY_DUTY');
  assert.equal(r.reason_code, ReasonCode.HD_CONSTRUCTION_EQUIPMENT);
});

test('Komatsu -> HD', () => {
  const r = classifyDuty({ manufacturer: 'KOMATSU', equipmentType: 'excavator' });
  assert.equal(r.duty, 'HEAVY_DUTY');
  assert.equal(r.reason_code, ReasonCode.HD_CONSTRUCTION_EQUIPMENT);
});

test('Freightliner + Detroit Diesel (camion comercial) -> HD', () => {
  const r = classifyDuty({ manufacturer: 'FREIGHTLINER', equipmentType: 'semi truck', model: 'Cascadia' });
  assert.equal(r.duty, 'HEAVY_DUTY');
  assert.equal(r.reason_code, ReasonCode.HD_COMMERCIAL_TRUCK);
});

test('Volvo truck -> HD', () => {
  const r = classifyDuty({ manufacturer: 'VOLVO', equipmentType: 'tractor truck' });
  assert.equal(r.duty, 'HEAVY_DUTY');
  assert.equal(r.reason_code, ReasonCode.HD_COMMERCIAL_TRUCK);
});

test('motor industrial (generador) -> HD', () => {
  const r = classifyDuty({ manufacturer: 'CUMMINS', equipmentType: 'stationary generator' });
  assert.equal(r.duty, 'HEAVY_DUTY');
  assert.equal(r.reason_code, ReasonCode.HD_INDUSTRIAL_ENGINE);
});

test('mismo SKU con aplicaciones LD y HD confirmadas -> MIXED_DUTY, nunca por marca ambigua sola', () => {
  const r = classifyDuty({ manufacturer: 'MIXED-BRAND', confirmedLdApplications: true, confirmedHdApplications: true });
  assert.equal(r.duty, 'MIXED_DUTY');
  assert.equal(r.reason_code, ReasonCode.MIXED_CONFIRMED_APPLICATIONS);
});

test('evidencia insuficiente -> REVIEW_REQUIRED, nunca una clasificacion inventada', () => {
  const r = classifyDuty({ manufacturer: 'UNKNOWN BRAND XYZ' });
  assert.equal(r.duty, 'REVIEW_REQUIRED');
  assert.equal(r.reason_code, ReasonCode.REVIEW_REQUIRED);
});

test('marca ambigua sola (sin equipo/aplicacion confirmada) nunca produce MIXED_DUTY automaticamente', () => {
  const r = classifyDuty({ manufacturer: 'TOYOTA' }); // no equipmentType/model/application at all
  assert.notEqual(r.duty, 'MIXED_DUTY');
  assert.equal(r.duty, 'REVIEW_REQUIRED');
});
