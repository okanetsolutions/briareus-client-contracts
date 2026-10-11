// Checks the built tokens, not the sources: run `npm run build` first (`npm run check` does both).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const tokens = JSON.parse(readFileSync(new URL('../dist/json/briareus-tokens.json', import.meta.url)));

function luminance(hex) {
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.slice(1 + i, 3 + i), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

for (const mode of ['dark', 'light']) {
  const t = tokens.theme[mode];

  test(`${mode}: body text reads at WCAG AA on every surface`, () => {
    for (const surface of ['canvas', 'sidebar', 'raise', 'field', 'sunken']) {
      assert.ok(contrast(t.ink, t[surface]) >= 4.5, `ink on ${surface}: ${contrast(t.ink, t[surface]).toFixed(2)}`);
    }
  });

  test(`${mode}: secondary text reads at AA on the canvas and sidebar`, () => {
    for (const surface of ['canvas', 'sidebar']) {
      assert.ok(contrast(t.muted, t[surface]) >= 4.5, `muted on ${surface}: ${contrast(t.muted, t[surface]).toFixed(2)}`);
    }
  });

  test(`${mode}: the accent and the status colours stand out from the canvas (3:1, large text and UI)`, () => {
    for (const role of ['accent', 'ok', 'warn', 'danger']) {
      assert.ok(contrast(t[role], t.canvas) >= 3, `${role} on canvas: ${contrast(t[role], t.canvas).toFixed(2)}`);
    }
  });

  test(`${mode}: text on the accent reads`, () => {
    assert.ok(contrast(t.onAccent, t.accent) >= 3, `onAccent on accent: ${contrast(t.onAccent, t.accent).toFixed(2)}`);
  });
}

test('every status role names a theme colour', () => {
  for (const [name, s] of Object.entries(tokens.status)) {
    assert.ok(s.role in tokens.theme.dark, `status.${name} names ${s.role}`);
  }
});

test('no server status maps to two roles', () => {
  const seen = new Map();
  for (const [name, s] of Object.entries(tokens.status)) {
    for (const status of s.statuses) {
      assert.ok(!seen.has(status), `${status} is in both ${seen.get(status)} and ${name}`);
      seen.set(status, name);
    }
  }
});
