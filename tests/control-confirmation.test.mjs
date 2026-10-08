import test from 'node:test';
import assert from 'node:assert/strict';
import {createControlConfirmation} from '../src/control-confirmation.mjs';

test('running reset, pause and settings ignore one press and accept a quick second press',()=>{
  for(const id of ['reset','pause','settings']) {
    const gate=createControlConfirmation();
    assert.equal(gate.accept('running',id,1000),false);
    assert.equal(gate.accept('running',id,1250),true);
    assert.equal(gate.accept('running',id,1300),false);
  }
});
test('different controls cannot confirm each other',()=>{
  const gate=createControlConfirmation();
  assert.equal(gate.accept('running','reset',1000),false);
  assert.equal(gate.accept('running','settings',1100),false);
  assert.equal(gate.accept('running','reset',1200),false);
  assert.equal(gate.accept('running','reset',1300),true);
});
test('expired or backwards timestamps start a fresh confirmation',()=>{
  const gate=createControlConfirmation();
  assert.equal(gate.accept('running','pause',1000),false);
  assert.equal(gate.accept('running','pause',1601),false);
  assert.equal(gate.accept('running','pause',1500),false);
  assert.equal(gate.accept('running','pause',1700),true);
});
test('idle, paused and finished controls act on the first press and clear pending presses',()=>{
  for(const status of ['idle','paused','finished']) {
    const gate=createControlConfirmation();
    gate.accept('running','pause',1000);
    assert.equal(gate.accept(status,'pause',1100),true);
    assert.equal(gate.accept('running','pause',1150),false);
  }
});
test('clock moves and state changes can clear a pending confirmation',()=>{
  const gate=createControlConfirmation();
  gate.accept('running','settings',1000);gate.reset();
  assert.equal(gate.accept('running','settings',1100),false);
});
