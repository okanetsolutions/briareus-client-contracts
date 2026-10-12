# Wireframes

One wireframe per screen, not one per platform: Windows, the Mac, iPhone and iPad, and Quest all build the same structure. They set what sits where. Colour, type and spacing come from the tokens in [`tokens/`](../tokens), so the wireframes are drawn in greys on purpose.

| Screen | File | Features |
| --- | --- | --- |
| Conversation | [`conversation.excalidraw`](conversation.excalidraw) | list beside conversation, transcript, composer, stop, session details panel |

## Editing

The files are [Excalidraw](https://excalidraw.com) scenes, which are plain JSON, so a change goes through review as a diff like any token. Open one at excalidraw.com (Open, or drag the file in) or with the Excalidraw extension for VS Code, edit it, and save it back over the same file.

## The rules

- **Name regions after the tokens.** Label boxes with the `theme.*` roles (`sidebar`, `canvas`, `raise`, `sunken`) and the `layout.*` widths (`sidebarWidth`, `panelWidth`, `narrowWidth`, `paneMargin`), so every client reads a box the same way.
- **Draw wide and narrow.** One frame at or above `layout.narrowWidth` (1024px) and the one-column flow below it. A platform gets its own frame only where its structure differs, not just its chrome.
- **Write platform differences as notes on the canvas**, under "Platform notes", in the same terms as the notes in [`features/features.json`](../features/features.json).
- **Link features to their screen.** A feature that lives on a screen gets `"wireframe": "<file name without .excalidraw>"` in `features/features.json`. FEATURES.md then links to it, and `npm test` fails if the file is missing.
