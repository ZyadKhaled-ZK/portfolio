// tests/transform.test.js
/**
 * Simple unit tests for 3D Transform Library
 * Run in Node.js or browser console
 */

import Vector3 from '../src/core/Vector3.js';
import Matrix4 from '../src/core/Matrix4.js';
import Transform from '../src/core/Transform.js';
import MathUtils from '../src/utils/MathUtils.js';

// Test utilities
const assertEqual = (actual, expected, message) => {
  const passed = Math.abs(actual - expected) < 0.001;
  console.log(passed ? '✅' : '❌', message, passed ? '' : `(${actual} !== ${expected})`);
  return passed;
};

const assertVector = (v, x, y, z, message) => {
  const passed = 
    Math.abs(v.x - x) < 0.001 &&
    Math.abs(v.y - y) < 0.001 &&
    Math.abs(v.z - z) < 0.001;
  console.log(passed ? '✅' : '❌', message, passed ? '' : `(${v.x}, ${v.y}, ${v.z}) !== (${x}, ${y}, ${z})`);
  return passed;
};

console.log('🧪 Running 3D Transform Library Tests\n');

// ===== Vector3 Tests =====
console.log('📐 Vector3 Tests');
console.log('─'.repeat(50));

(() => {
  const v1 = new Vector3(1, 2, 3);
  assertVector(v1, 1, 2, 3, 'Vector3 constructor');
})();

(() => {
  const v1 = new Vector3(1, 2, 3);
  const v2 = new Vector3(4, 5, 6);
  v1.add(v2);
  assertVector(v1, 5, 7, 9, 'Vector3 addition');
})();

(() => {
  const v1 = new Vector3(5, 7, 9);
  const v2 = new Vector3(1, 2, 3);
  v1.subtract(v2);
  assertVector(v1, 4, 5, 6, 'Vector3 subtraction');
})();

(() => {
  const v = new Vector3(2, 3, 4);
  v.multiplyScalar(2);
  assertVector(v, 4, 6, 8, 'Vector3 scalar multiplication');
})();

(() => {
  const v = new Vector3(3, 4, 0);
  const length = v.length();
  assertEqual(length, 5, 'Vector3 length/magnitude');
})();

(() => {
  const v = new Vector3(3, 4, 0);
  v.normalize();
  assertEqual(v.length(), 1, 'Vector3 normalization');
})();

(() => {
  const v1 = new Vector3(1, 0, 0);
  const v2 = new Vector3(0, 1, 0);
  const dot = v1.dot(v2);
  assertEqual(dot, 0, 'Vector3 dot product (perpendicular)');
})();

(() => {
  const v1 = new Vector3(1, 0, 0);
  const v2 = new Vector3(0, 1, 0);
  v1.cross(v2);
  assertVector(v1, 0, 0, 1, 'Vector3 cross product');
})();

(() => {
  const v1 = new Vector3(0, 0, 0);
  const v2 = new Vector3(3, 4, 0);
  const distance = v1.distanceTo(v2);
  assertEqual(distance, 5, 'Vector3 distance calculation');
})();

console.log('');

// ===== Matrix4 Tests =====
console.log('🔢 Matrix4 Tests');
console.log('─'.repeat(50));

(() => {
  const m = new Matrix4();
  const isIdentity = 
    m.elements[0] === 1 && m.elements[5] === 1 &&
    m.elements[10] === 1 && m.elements[15] === 1 &&
    m.elements[1] === 0 && m.elements[2] === 0;
  console.log(isIdentity ? '✅' : '❌', 'Matrix4 identity');
})();

(() => {
  const m = new Matrix4().makeTranslation(1, 2, 3);
  assertEqual(m.elements[12], 1, 'Translation matrix X');
  assertEqual(m.elements[13], 2, 'Translation matrix Y');
  assertEqual(m.elements[14], 3, 'Translation matrix Z');
})();

(() => {
  const m = new Matrix4().makeScale(2, 3, 4);
  assertEqual(m.elements[0], 2, 'Scale matrix X');
  assertEqual(m.elements[5], 3, 'Scale matrix Y');
  assertEqual(m.elements[10], 4, 'Scale matrix Z');
})();

(() => {
  const m = new Matrix4().makeRotationZ(Math.PI / 2);
  const v = new Vector3(1, 0, 0);
  v.applyMatrix4(m);
  assertVector(v, 0, 1, 0, 'Rotation Z 90° on vector');
})();

(() => {
  const m1 = new Matrix4().makeTranslation(1, 0, 0);
  const m2 = new Matrix4().makeScale(2, 2, 2);
  m1.multiply(m2);
  const v = new Vector3(1, 0, 0);
  v.applyMatrix4(m1);
  assertVector(v, 3, 0, 0, 'Matrix multiplication (translate then scale)');
})();

console.log('');

// ===== Transform Tests =====
console.log('🎯 Transform Tests');
console.log('─'.repeat(50));

(() => {
  const t = new Transform();
  t.setPosition(1, 2, 3);
  const p = new Vector3(0, 0, 0);
  const result = t.transformPoint(p);
  assertVector(result, 1, 2, 3, 'Transform translation');
})();

(() => {
  const t = new Transform();
  t.setRotationDegrees(0, 90, 0);
  const p = new Vector3(1, 0, 0);
  const result = t.transformPoint(p);
  assertVector(result, 0, 0, -1, 'Transform rotation Y 90°');
})();

(() => {
  const t = new Transform();
  t.setScale(2, 2, 2);
  const p = new Vector3(1, 1, 1);
  const result = t.transformPoint(p);
  assertVector(result, 2, 2, 2, 'Transform scale');
})();

(() => {
  const t = new Transform();
  t.setPosition(1, 0, 0).setScale(2, 2, 2);
  const p = new Vector3(1, 0, 0);
  const result = t.transformPoint(p);
  assertVector(result, 3, 0, 0, 'Transform combined (translate + scale)');
})();

(() => {
  const t = new Transform();
  t.translate(1, 1, 1);
  t.translate(1, 1, 1);
  assertVector(t.position, 2, 2, 2, 'Transform translate (accumulative)');
})();

(() => {
  const t = new Transform();
  t.setRotationDegrees(45, 0, 0);
  t.rotateDegrees(45, 0, 0);
  assertEqual(t.rotation.x * 180 / Math.PI, 90, 'Transform rotate (accumulative)');
})();

(() => {
  const t = new Transform();
  t.setScale(2, 2, 2);
  t.scaleBy(2, 2, 2);
  assertVector(t.scale, 4, 4, 4, 'Transform scaleBy (accumulative)');
})();

(() => {
  const t = new Transform();
  t.setPosition(1, 2, 3).setRotation(1, 2, 3).setScale(4, 5, 6);
  t.reset();
  assertVector(t.position, 0, 0, 0, 'Transform reset position');
  assertVector(t.rotation, 0, 0, 0, 'Transform reset rotation');
  assertVector(t.scale, 1, 1, 1, 'Transform reset scale');
})();

(() => {
  const t = new Transform();
  const points = [
    new Vector3(1, 0, 0),
    new Vector3(0, 1, 0),
    new Vector3(0, 0, 1)
  ];
  t.setPosition(1, 1, 1);
  const results = t.transformPoints(points);
  assertVector(results[0], 2, 1, 1, 'Transform multiple points [0]');
  assertVector(results[1], 1, 2, 1, 'Transform multiple points [1]');
  assertVector(results[2], 1, 1, 2, 'Transform multiple points [2]');
})();

console.log('');

// ===== MathUtils Tests =====
console.log('🧮 MathUtils Tests');
console.log('─'.repeat(50));

(() => {
  const rad = MathUtils.degToRad(180);
  assertEqual(rad, Math.PI, 'Degrees to radians conversion');
})();

(() => {
  const deg = MathUtils.radToDeg(Math.PI);
  assertEqual(deg, 180, 'Radians to degrees conversion');
})();

(() => {
  const clamped = MathUtils.clamp(15, 0, 10);
  assertEqual(clamped, 10, 'Clamp value (max)');
})();

(() => {
  const clamped = MathUtils.clamp(-5, 0, 10);
  assertEqual(clamped, 0, 'Clamp value (min)');
})();

(() => {
  const lerped = MathUtils.lerp(0, 10, 0.5);
  assertEqual(lerped, 5, 'Linear interpolation');
})();

(() => {
  const mapped = MathUtils.mapRange(5, 0, 10, 0, 100);
  assertEqual(mapped, 50, 'Map range');
})();

(() => {
  const equal = MathUtils.approxEqual(1.0001, 1.0002, 0.001);
  console.log(equal ? '✅' : '❌', 'Approximate equality');
})();

(() => {
  const distance = MathUtils.distance(0, 0, 0, 3, 4, 0);
  assertEqual(distance, 5, 'Distance 3D calculation');
})();

(() => {
  const smoothed = MathUtils.smoothStep(0.5);
  assertEqual(smoothed, 0.5, 'Smooth step at 0.5');
})();

(() => {
  const projected = MathUtils.project3DTo2D(1, 1, 0, 500, 5);
  assertEqual(projected.x, 100, 'Simple 3D to 2D projection');
})();

console.log('');

// ===== Summary =====
console.log('📊 Test Summary');
console.log('─'.repeat(50));
console.log('All tests completed!');
console.log('Check results above for any failures (❌)');
console.log('');
console.log('💡 Run this file with:');
console.log('   - Node.js: node tests/transform.test.js');
console.log('   - Browser: Include in HTML with type="module"');
console.log('   - Or copy-paste into browser console');