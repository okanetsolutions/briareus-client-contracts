// Generate the proposed Home Assistant and menu status scenes with matching SVG previews.
import { readFile, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

const root = new URL('../', import.meta.url);
const sizes = JSON.parse(await readFile(new URL('tokens/size.json', root)));
const sidebar = parseInt(sizes.layout.sidebarWidth.$value);
const margin = parseInt(sizes.layout.paneMargin.$value);
const narrow = parseInt(sizes.layout.narrowWidth.$value);
const escape = (s) => String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const width = 1900, height = 1440;
let elements, svg, frameId;

function element(type, x, y, w, h, extra = {}) {
  assert.ok(x >= 0 && y >= 0 && x + w <= width && y + h <= height, `Outside canvas: ${extra.text ?? type}`);
  const id = `ha-${elements.length + 1}`;
  const value = { id, type, x, y, width: w, height: h, angle: 0,
    strokeColor: '#303030', backgroundColor: 'transparent', fillStyle: 'solid',
    strokeWidth: 1, strokeStyle: 'solid', roughness: 0, opacity: 100,
    groupIds: [], frameId, roundness: null, seed: elements.length + 1,
    version: 1, versionNonce: elements.length + 1, isDeleted: false,
    boundElements: null, updated: 1, link: null, locked: false, ...extra };
  elements.push(value);
  return value;
}
function box(x, y, w, h, fill = '#ffffff') {
  element('rectangle', x, y, w, h, { backgroundColor: fill });
  svg.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="#303030"/>`);
}
function text(x, y, value, size = 16) {
  const lines = value.split('\n');
  const w = Math.max(...lines.map(s => s.length)) * size * 0.61;
  const h = lines.length * size * 1.25;
  element('text', x, y, w, h, { text: value, originalText: value,
    fontSize: size, fontFamily: 3, textAlign: 'left', verticalAlign: 'top',
    containerId: null, autoResize: true, lineHeight: 1.25 });
  svg.push(`<text x="${x}" y="${y}" xml:space="preserve" style="white-space:pre" font-family="monospace" font-size="${size}" fill="#303030">${lines.map((s, i) => `<tspan x="${x}" dy="${i ? size * 1.25 : size}">${escape(s)}</tspan>`).join('')}</text>`);
}
function button(x, y, label, w = 160) { box(x, y, w, 36, '#eeeeee'); text(x + 12, y + 8, label, 14); }
function field(x, y, w, label, value, h = 42) {
  text(x, y, label, 14); box(x, y + 25, w, h, '#f5f5f5'); text(x + 12, y + 36, value, 14);
}
function card(x, y, w, title, body, h = 95) {
  box(x, y, w, h, '#f5f5f5'); text(x + 14, y + 13, title, 16); text(x + 14, y + 42, body, 14);
}
function frame(x, y, w, h, label) {
  frameId = null;
  const e = element('frame', x, y, w, h, { name: label });
  text(x, y - 26, label, 14);
  frameId = e.id; box(x, y, w, h);
}
function computerStatus(x, y, w = 248) {
  box(x, y, w, 144, '#f5f5f5');
  text(x + 12, y + 12, 'This computer          v', 14);
  text(x + 12, y + 46, 'CPU                 18%', 14);
  text(x + 12, y + 74, 'Memory     12.4 / 32 GB', 14);
  text(x + 12, y + 102, 'Battery   72% charging', 14);
}
function shell(title, tab) {
  elements = []; svg = []; frameId = null;
  text(40, 16, `${title} / proposed client screen`, 22);
  frame(40, 90, 1400, 820, `Wide / at least layout.narrowWidth (${narrow}px)`);
  box(40, 90, sidebar, 820, '#eeeeee');
  text(54, 108, '+ New session', 16); text(54, 145, 'WhatsApp  Mail  📊  ⚑', 13);
  text(54, 201, 'Projects', 16); text(64, 239, 'briareus', 16); text(64, 275, 'briareus-contracts', 16);
  box(50, 335, sidebar - 20, 55, '#dddddd'); text(64, 350, 'Home Assistant', 16);
  text(54, 408, 'Proposed global entry', 13);
  computerStatus(50, 594);
  text(54, 771, 'Media player when active', 13);
  text(54, 824, 'Select  Settings  Sign out', 13); text(54, 868, 'theme.sidebar / 268px', 13);
  text(40 + sidebar + margin, 112, tab ? 'Home Assistant' : 'Menu status widgets', 24);
  text(40 + sidebar + margin, 153, tab ? 'Connected to Home Assistant' : 'Local device / sample values / proposed UI', 14);
  if (tab) text(40 + sidebar + margin, 194, ['Entities', 'Actions', 'Events', 'Connection'].map(t => t === tab ? `[${t}]` : t).join('   '), 16);
  text(40 + sidebar + margin, 872, 'theme.canvas / layout.paneMargin = 18px', 13);
}
function phone(title) {
  frame(1480, 90, 390, 1000, 'Narrow / one column below 1024px');
  text(1498, 110, '< Back to sessions', 14);
  text(1498, 150, 'Home Assistant', 22);
  text(1498, 191, `[${title} v]`, 16);
}
function notes(lines, source = 'Proposal based on Core #147. API and source revisions: home-assistant.md. Example entities and values only.') {
  frameId = null;
  text(40, 1130, 'Behavior and platform notes', 20);
  lines.forEach((line, i) => text(40, 1173 + i * 29, line, 15));
  text(40, 1390, source, 14);
}
async function save(name) {
  const scene = { type: 'excalidraw', version: 2, source: 'https://excalidraw.com', elements,
    appState: { viewBackgroundColor: '#ffffff', gridSize: null }, files: {} };
  const ids = new Set(elements.map(e => e.id));
  assert.equal(ids.size, elements.length);
  for (const e of elements) {
    if (e.frameId) {
      assert.ok(ids.has(e.frameId));
      const f = elements.find(f => f.id === e.frameId);
      assert.ok(e.x >= f.x && e.y >= f.y && e.x + e.width <= f.x + f.width && e.y + e.height <= f.y + f.height, `Outside frame: ${e.text ?? e.id}`);
    }
  }
  await writeFile(new URL(`wireframes/${name}.excalidraw`, root), JSON.stringify(scene, null, 2) + '\n');
  await writeFile(new URL(`wireframes/${name}.svg`, root), `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title"><title id="title">${escape(name)}: proposed wide and narrow wireframes</title><rect width="100%" height="100%" fill="white"/>${svg.join('\n')}</svg>\n`);
}

shell('Connection and setup', 'Connection');
card(326, 245, 1096, 'Connection', 'Configured on the Briareus server. Home Assistant credentials stay on the server.');
button(326, 361, 'Check connection', 190);
card(326, 423, 1096, 'Not configured', 'Ask the server administrator to connect Home Assistant, then check again.\nAdd devices and integrations in Home Assistant.', 116);
card(326, 563, 530, 'Cannot connect', 'Check the server connection or saved credentials.\nYour Briareus login is still active.', 110);
card(878, 563, 544, 'Admin access required', 'Use a Briareus admin connection.\nRead and manage tokens cannot access this screen.', 110);
text(326, 707, 'Alternative states shown together for review.', 14);
text(326, 742, 'No URL, token, pairing, or integration editor in the client.', 16);
phone('Connection');
card(1498, 245, 354, 'Connected', 'Configured on the server.\nCredentials stay there.', 110);
button(1498, 381, 'Check connection', 190);
card(1498, 450, 354, 'Not configured', 'Ask your server administrator\nto connect Home Assistant.\nThen check again.', 130);
card(1498, 607, 354, 'Cannot connect', 'Check server connection\nor saved credentials.\nBriareus login stays active.', 130);
card(1498, 764, 354, 'Admin access required', 'Use an admin connection.', 100);
notes([
  'GET /api/v1/home-assistant: configured:false is setup needed; 502 is a connection or upstream credentials error.',
  'Hide the entry when the API catalog omits it or the token lacks admin access; handle 403 if access changes.',
  'The selected Home Assistant row is a proposed addition to the existing Windows sidebar, independent of projects.',
  'Windows and Mac use the wide shell. iPhone uses one pane with Back; iPad switches at layout.narrowWidth.',
  'Quest keeps this structure with headset.type sizing. All four clients are unimplemented at the cited revisions.',
  'Server setup instructions belong in documentation. There is no bridge endpoint to save or remove credentials.'
]);
await save('home-assistant-connection');

shell('Entities and details', 'Entities');
field(326, 245, 400, 'Domain filter', 'All domains                  v');
button(744, 270, 'Refresh', 125);
text(326, 337, 'Entities / select to inspect', 16);
card(326, 373, 418, 'Kitchen light', 'light.kitchen                 on', 84);
card(326, 473, 418, 'MOVA vacuum', 'vacuum.mova               docked', 84);
card(326, 573, 418, 'Temperature', 'sensor.temperature         21.5 C', 84);
card(326, 673, 418, 'Hall sensor', 'sensor.hall          unavailable', 84);
card(766, 373, 656, 'Kitchen light', 'light.kitchen\nState: on\nLast changed: 12 Oct, 09:41\nLast updated: 12 Oct, 09:42', 175);
field(784, 576, 620, 'Attributes / read-only', '{ "friendly_name": "Kitchen light", "brightness": 128 }', 72);
button(784, 702, 'Choose action', 175);
text(784, 766, 'Last refreshed 09:42 / polling while visible', 14);
phone('Entities');
field(1498, 237, 354, 'Domain filter', 'All domains               v');
card(1498, 333, 354, 'Kitchen light', 'light.kitchen / on', 80);
card(1498, 430, 354, 'MOVA vacuum', 'vacuum.mova / docked', 80);
text(1498, 543, 'Select a row to open details.', 14);
box(1498, 591, 354, 468, '#f5f5f5');
text(1512, 608, 'Next pane / < Back to entities', 14);
text(1512, 648, 'Kitchen light', 20);
text(1512, 688, 'light.kitchen\nState: on\nChanged: 12 Oct, 09:41\nUpdated: 12 Oct, 09:42', 14);
text(1512, 791, 'Attributes\nbrightness: 128\nfriendly_name: Kitchen light', 14);
button(1512, 903, 'Choose action', 175);
notes([
  'GET /api/v1/home-assistant/entities supports only the domain query filter; no device or area registry exists.',
  'Select a row to GET /entities/{id}. Use name, id, state, attributes, lastChanged, and lastUpdated from Core.',
  'Loading: show a progress label. Empty: "No entities in this domain" with "All domains". A missing entity returns 404.',
  'Read failure: retain the last values marked stale with Retry. Display unknown and unavailable states as returned.',
  'Poll only while visible. The bridge has no subscription; timestamps above are examples, not device completion times.',
  'Windows/Mac use list and detail. iPhone/narrow iPad use consecutive panes; Quest uses headset.type and scrolling.'
]);
await save('home-assistant');

shell('Service actions', 'Actions');
field(326, 245, 520, 'Domain / from available services', 'light');
field(874, 245, 548, 'Action / from available services', 'turn_on');
field(326, 345, 1096, 'Service data / editable JSON object', '{ "entity_id": "light.kitchen", "brightness": 128 }', 76);
text(326, 473, 'Available fields and descriptions come from Home Assistant.', 16);
text(326, 512, '[ ] Request response data / only when supported; required for some actions', 16);
button(326, 557, 'Run action', 150);
card(326, 625, 530, 'Action confirmed', 'Changed states: light.kitchen = on\nResponse data: none\nThe physical action may still be in progress.', 125);
card(878, 625, 544, 'Action not confirmed', 'It may have run. Read the entity state before retrying.\nDo not resend automatically.', 125);
button(896, 770, 'Read entity state', 210);
phone('Actions');
field(1498, 245, 354, 'Domain', 'light');
field(1498, 342, 354, 'Action', 'turn_on');
field(1498, 439, 354, 'Service data / JSON object', '{\n  "entity_id": "light.kitchen",\n  "brightness": 128\n}', 112);
text(1498, 605, '[ ] Request response data', 14);
button(1498, 648, 'Run action', 150);
card(1498, 728, 354, 'Action not confirmed', 'It may have run. Read the\nentity state before retrying.', 110);
button(1498, 866, 'Read entity state', 210);
notes([
  'GET /services populates domain, action, descriptions, and field hints. Examples are not a hardcoded action catalog.',
  'POST /services/{domain}/{service} sends the JSON object directly, without an extra data wrapper.',
  'Use returnResponse=1 when required or requested and supported; otherwise omit it. Render entities and response.',
  'Validate JSON objects before sending. Disable Run while pending; no automatic POST retries after timeout or invalid receipt.',
  '400: preserve data and show the error. 404: reload services. 429: show rate limit. 502: action may be unconfirmed.',
  'Choose action pre-fills entity_id from details. Refresh state after success. Platform layouts follow the entities screen.'
]);
await save('home-assistant-action');

shell('Send an event', 'Events');
text(326, 247, 'Send data to an existing Home Assistant automation.', 18);
field(326, 296, 1096, 'Event type', 'briareus_command');
field(326, 394, 1096, 'Event data / editable JSON object', '{ "source": "briareus", "command": "arriving_home" }', 95);
text(326, 551, 'Configure the listening automation in Home Assistant.', 16);
button(326, 599, 'Send event', 150);
card(326, 679, 530, 'Event accepted', 'Home Assistant accepted the event.\nThis does not confirm an automation finished.', 110);
card(878, 679, 544, 'Event not confirmed', 'It may have been sent. Check Home Assistant\nbefore sending again.', 110);
phone('Events');
text(1498, 245, 'Send to an existing automation.', 14);
field(1498, 293, 354, 'Event type', 'briareus_command');
field(1498, 391, 354, 'Event data / JSON object', '{\n  "source": "briareus",\n  "command": "arriving_home"\n}', 112);
text(1498, 562, 'Set up the listening automation\nin Home Assistant.', 14);
button(1498, 631, 'Send event', 150);
card(1498, 711, 354, 'Event accepted', 'The automation may still\nbe running.', 110);
card(1498, 858, 354, 'Event not confirmed', 'Check Home Assistant before\nsending again.', 110);
notes([
  'POST /api/v1/home-assistant/events/{type} sends the JSON object directly; encode the nonempty event type as a path segment.',
  'This sends an event. It is not an event feed, automation editor, or subscription. No event history is available.',
  'Require a nonempty type and a JSON object. Disable Send while pending. Keep the entered data if the call fails.',
  'Show {ok:true} as accepted, not completed. On an ambiguous failure, do not automatically resend the event.',
  'The event type and data shown are examples; they only have an effect if Home Assistant has a matching listener.',
  'Windows/Mac keep the sidebar. iPhone/narrow iPad show one pane with Back; Quest uses headset.type and scrolling.'
]);
await save('home-assistant-event');
shell('Menu status widgets', null);
text(326, 224, 'Small numbers in the menu', 22);
text(326, 274, 'CPU usage, memory used / total, and battery charge at a glance.', 16);
text(326, 310, 'These describe the device running the client, not the Briareus server.', 16);
card(326, 365, 530, 'CPU / 18%', 'Total system utilization over the last sample.\nA short spike is normal; keep the text neutral.', 110);
card(878, 365, 544, 'Memory / 12.4 of 32 GB', 'System memory used and total physical memory.\nLabel the OS memory definition in a tooltip.', 110);
card(326, 501, 530, 'Battery / 72% charging', 'Show charge and charging or on-battery status.\nHide this row on a device without a battery.', 110);
card(878, 501, 544, 'Unavailable or stale', 'CPU: Unavailable / never substitute zero.\nAfter a missed refresh, mark old values stale.', 110);
card(326, 645, 530, 'Collapsed / This computer >', 'One click hides the numbers and saves space.\nRemember this preference on this device.', 110);
card(878, 645, 544, 'Keep the menu quiet', 'No charts, alarms, or battery-time guesses.\nSample only while the menu is visible.', 110);
frame(1480, 90, 390, 1000, 'Narrow / menu pane below 1024px');
text(1498, 110, '+ New session', 20);
text(1498, 156, 'WhatsApp  Mail  Dashboard  Findings', 14);
text(1498, 225, 'Projects', 18);
text(1510, 276, 'briareus', 16);
text(1510, 322, 'briareus-contracts', 16);
button(1498, 387, 'Home Assistant', 220);
text(1498, 465, 'Projects scroll above the footer.', 14);
card(1498, 597, 354, 'This device              v', 'Battery   72% charging', 100);
text(1498, 726, 'Phone / tablet example.\nOnly show supported local metrics.\nDesktop narrow mode keeps CPU\nand memory when available.', 14);
text(1498, 883, 'Media player when active', 14);
text(1498, 965, 'Select  Settings  Sign out', 14);
text(1498, 1020, 'Open a screen to hide this menu.', 14);
notes([
  'Place the collapsible block above the media player and footer. Keep projects scrollable when vertical space is limited.',
  'Desktop default: CPU percentage, memory used / total, and battery percentage with charging status when a battery exists.',
  'Use local OS readings. Start with a 5-second visible refresh; pause when hidden. No Core or Home Assistant API is involved.',
  'A missing reading is Unavailable. Retained readings show Stale and their last sample time; never show a missing value as zero.',
  'Windows/Mac: This computer. iPhone/iPad/Quest: This device, battery first; hide metrics the platform cannot supply.',
  'Use theme.sidebar, theme.sunken, theme.ink, and theme.muted. Keep numbers stable-width; explain labels with accessible text.'
], 'Menu widget proposal / example readings, not live telemetry. See menu-status.md for scope and platform behavior.');
await save('menu-status');
console.log('Generated four Home Assistant scenes and the menu status proposal; checked IDs and frame bounds.');
