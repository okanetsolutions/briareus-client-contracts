import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const data = JSON.parse(readFileSync(new URL('../features/features.json', import.meta.url)));
const LEVELS = new Set(['full', 'partial', 'none', 'n/a']);

test('every feature says where each client stands, and only in the known terms', () => {
  for (const area of data.areas) {
    for (const f of area.features) {
      assert.deepEqual(Object.keys(f.support).sort(), [...data.clients].sort(), `${f.id}: support lists every client`);
      for (const [client, level] of Object.entries(f.support)) assert.ok(LEVELS.has(level), `${f.id}.${client}: ${level}`);
      for (const client of Object.keys(f.notes ?? {})) assert.ok(data.clients.includes(client), `${f.id}: note for unknown ${client}`);
    }
  }
});

test('feature and area ids are unique', () => {
  for (const ids of [data.areas.map((a) => a.id), data.areas.flatMap((a) => a.features.map((f) => f.id))]) {
    assert.equal(new Set(ids).size, ids.length, ids.filter((id, i) => ids.indexOf(id) !== i).join(', '));
  }
});

test('a partial or n/a mark says why', () => {
  for (const f of data.areas.flatMap((a) => a.features)) {
    for (const [client, level] of Object.entries(f.support)) {
      if (level === 'partial' || level === 'n/a') assert.ok(f.notes?.[client], `${f.id}.${client} is ${level} without a note`);
    }
  }
});

test('a feature names a wireframe that exists', () => {
  for (const f of data.areas.flatMap((a) => a.features)) {
    if (f.wireframe) assert.ok(existsSync(new URL(`../wireframes/${f.wireframe}.excalidraw`, import.meta.url)), `${f.id}: no wireframes/${f.wireframe}.excalidraw`);
  }
});
