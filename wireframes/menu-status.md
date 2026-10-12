# Menu status widgets

[Preview](menu-status.svg) · [Editable scene](menu-status.excalidraw)

This proposal adds a collapsible local device status block above the menu's media player and footer. It also appears in the four proposed Home Assistant screens. The readings are examples, and telemetry is not implemented by this change.

| Reading | Example | Meaning |
| --- | --- | --- |
| CPU | 18% | Total system CPU utilization over the last sampling interval. |
| Memory | 12.4 / 32 GB | System memory used and total physical memory, with the OS definition of used memory explained in a tooltip. |
| Battery | 72% charging | Battery percentage and power state; omit this row when no battery exists. |

Use **This computer** on Windows and Mac and **This device** on mobile and Quest. These readings describe the device running the client. They do not describe the Briareus server or a Home Assistant entity, and require no bridge permission or server endpoint.

On desktop, show the three readings when available. On iPhone, iPad, and Quest, lead with battery and omit any metrics that the platform cannot supply. Narrow desktop windows retain available CPU and memory readings. The narrow drawing shows the phone menu; opening a screen hides the menu using the existing one-pane navigation.

Start with a five-second refresh while the menu is visible, and pause when hidden. Show **Unavailable** when a supported metric cannot be read. Mark retained values **Stale** with the last sample time after a failed refresh. Never replace a failed reading with zero. Resume sampling when the menu becomes visible again.

Collapse the block to its title and remember the preference locally. Keep project rows scrollable and the footer controls reachable on short windows. Preserve the existing media player below the status block when it is active.

Use the shared sidebar, sunken, ink, and muted roles. Keep numbers at a stable width and provide accessible metric labels and units. Collapsing must work with keyboard and assistive controls. Avoid announcing every polling update to screen readers.

The initial scope is numbers only. Temperature, network throughput, charts, and guessed battery runtimes add noise or require additional platform work. Disk space can be considered later if users need to monitor local worktree storage.

The placement follows the Windows shell cited in [the Home Assistant source notes](home-assistant.md#source-revisions). This status block is proposed, not copied from an implemented Windows feature. Regenerate the scene and SVG with `node scripts/home-assistant-wireframes.mjs`.
