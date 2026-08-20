import assert from 'node:assert/strict';
import { applyDragDelta, applyResizeDelta, calculatePixelBounds } from '../utils/coordinates.utils';

const run = () => {
  // Test calculatePixelBounds
  const bounds = calculatePixelBounds({
    fromRow: 2,
    fromCol: 2,
    toRow: 10,
    toCol: 10,
    offsetX: 50,
    offsetY: 60,
    width: 400,
    height: 300,
  });

  assert.equal(bounds.left, 50);
  assert.equal(bounds.top, 60);
  assert.equal(bounds.width, 400);
  assert.equal(bounds.height, 300);

  // Test applyDragDelta
  const dragged = applyDragDelta(bounds, 20, 30, 1920, 1080);
  assert.equal(dragged.left, 70);
  assert.equal(dragged.top, 90);
  assert.equal(dragged.width, 400);
  assert.equal(dragged.height, 300);

  // Test applyResizeDelta (southeast corner)
  const resizedSE = applyResizeDelta(bounds, 'se', 50, 40);
  assert.equal(resizedSE.left, 50);
  assert.equal(resizedSE.top, 60);
  assert.equal(resizedSE.width, 450);
  assert.equal(resizedSE.height, 340);

  // Test applyResizeDelta (northwest corner)
  const resizedNW = applyResizeDelta(bounds, 'nw', 20, 20);
  assert.equal(resizedNW.left, 70);
  assert.equal(resizedNW.top, 80);
  assert.equal(resizedNW.width, 380);
  assert.equal(resizedNW.height, 280);

  console.log('COORDINATES TESTS PASS');
};

run();
