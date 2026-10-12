# Briareus contracts

[![CI](https://github.com/okanetsolutions/briareus-contracts/actions/workflows/ci.yml/badge.svg)](https://github.com/okanetsolutions/briareus-contracts/actions/workflows/ci.yml) [![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

The design tokens of the [Briareus](https://github.com/nadinyamaui/briareus) clients in one place: colours for dark and light, what colour each session status takes, text styles, corner radii, layout widths and the working indicator. [Style Dictionary](https://styledictionary.com/info/tokens/) builds them into each client's own idiom, so a change here reaches Windows, the Mac, iPhone and iPad, and Quest as one reviewed diff instead of four hand edits.

| Client | Gets | Copied to |
| --- | --- | --- |
| [briareus-windows](https://github.com/okanetsolutions/briareus-windows) (C11, Win32) | `dist/c/briareus_tokens.h`, header-only | `app/briareus_tokens.h` |
| [briareus-swift](https://github.com/okanetsolutions/briareus-swift) (SwiftUI, Mac and iOS) | `dist/swift/BriareusTokens.swift`, no UIKit/AppKit | `Mac/Core/BriareusTokens.swift` |
| [briareus-quest](https://github.com/okanetsolutions/briareus-quest) (Kotlin, Compose) | `dist/kotlin/BriareusTokens.kt` | `app/src/main/kotlin/com/okanetsolutions/briareus/tokens/BriareusTokens.kt` |
| Anything on the web (docs, a status page) | `dist/css/briareus-tokens.css`, `dist/json/briareus-tokens.json` | |

The server ([nadinyamaui/briareus](https://github.com/nadinyamaui/briareus)) has no UI of its own any more; what it owns here is the vocabulary of session statuses (`running`, `idle`, `waiting`, …) that [`tokens/semantic/status.json`](tokens/semantic/status.json) maps to colours. When the server adds a status, add it there.

## Layout

```
tokens/
  color/palette.json      primitive colours: warm neutrals 0–975, clay (the accent), green, amber, red
  semantic/dark.json      theme.dark.*  — the roles the screens draw with (canvas, sidebar, raise, ink, accent, …)
  semantic/light.json     theme.light.* — the same roles on paper; must list exactly the dark roles
  semantic/status.json    status.*      — status role → theme colour, and the server statuses in each
  typography.json         font sizes, weights and families; type.* text styles by the Windows/Mac names
  platform/headset.json   headset.type.* — Quest's larger type, by Material 3 role
  chart.json              chart.series.* (usage rings and bars) and chart.context.{dark,light}.* (the context bar)
  size.json               radius.*, layout.*, motion.*
  content.json            working.* — the working indicator's glyphs and verbs
features/features.json    what each client offers, feature by feature (FEATURES.md is generated from it)
build.mjs                 Style Dictionary config and the five formats (Compose, Swift, C, CSS, JSON)
dist/                     generated; committed so clients and reviewers see exactly what changed
scripts/sync.mjs          copies dist/ into client checkouts, or --check says which are stale
test/                     WCAG contrast of every text/surface pair, and status sanity
```

Tokens are in the [DTCG format](https://www.designtokens.org/tr/drafts/format/) (`$value`, `$type`, `$description`), with references between tiers: a client reads `theme.dark.accent`, which points at `palette.clay.500`.

## Features

[FEATURES.md](FEATURES.md) shows, for each of the 89 features the clients offer, whether Windows, the Mac, iPhone/iPad and Quest have it in full, in part, not at all, or cannot (n/a). It also lists the server routes no client calls. It is generated from [features/features.json](features/features.json): when a client gains or loses a feature, update the JSON in the same change and run `npm run build`.

## Changing a token

```bash
npm ci
```

Edit the JSON under `tokens/`, then:

```bash
npm run check
```

That builds `dist/`, checks contrast (ink on every surface ≥ 4.5:1, muted on canvas and sidebar ≥ 4.5:1, accent and status colours on canvas ≥ 3:1, chart colours ≥ 3:1 on the surfaces they sit on, both modes), and fails if the committed `dist/` differs from what the tokens build. Commit `tokens/` and `dist/` together.

Then bring the clients up to date. With them checked out beside this repo:

```bash
node scripts/sync.mjs
```

and open a pull request in each client with the copied file. `node scripts/sync.mjs --check` exits 1 when a client's copy is stale, for a client's CI to run against a checkout of this repo.

## Using the tokens

**Windows.** Colours are `0xRRGGBB`, which is what `theme.c`'s `rgb_hex` already takes:

```c
#include "briareus_tokens.h"
const BriareusPalette *p = dark ? &BRIAREUS_PALETTE_DARK : &BRIAREUS_PALETTE_LIGHT;
theme.canvas = rgb_hex(p->canvas);
COLORREF dot = rgb_hex(briareus_status_color(p, briareus_status_role(session->status)));
set_font(FONT_BODY, ui, BRIAREUS_TYPE_BODY.size, BRIAREUS_TYPE_BODY.weight, BRIAREUS_TYPE_BODY.italic);
```

**Mac, iPhone and iPad.** The file has no UIKit or AppKit, so it lives in the shared core; each app wraps it in its own dynamic colour:

```swift
static let canvas = dynamic(BriareusPalette.dark.canvas, BriareusPalette.light.canvas)           // Mac
static let accent = Color(light: BriareusPalette.light.accent, dark: BriareusPalette.dark.accent)  // iOS
static func statusColor(_ s: String?) -> Color { color(BriareusStatusRole(status: s)) }
static let body = Font.system(size: BriareusType.body.size, weight: weight(BriareusType.body.weight))  // 400 → .regular, 500 → .medium, 600 → .semibold
```

**Quest.** Light or dark as the system says, with the headset type:

```kotlin
val dark = isSystemInDarkTheme()
val p = if (dark) BriareusPalette.Dark else BriareusPalette.Light
val scheme = if (dark) darkColorScheme(primary = p.accent, background = p.canvas, /* … */)
             else lightColorScheme(primary = p.accent, background = p.canvas, /* … */)
val type = Typography(bodyLarge = BriareusHeadsetType.bodyLarge, /* … */)
StatusDot(color = p.statusColor(session.status))
```

## The rules

- Every client draws with these colours, and only these: no client keeps a palette of its own.
- Every client supports light and dark, following the system's setting.
- A status takes the same colour everywhere.

## Where the clients stood

The tokens start from the palette Windows, the Mac app and Quest already share: the old web dashboard's `@theme` block, copied by hand into each (`app/theme.c`, `Mac/App/Theme.swift`, `ui/Theme.kt`). Adopting the tokens there changes nothing on screen. The iPhone and iPad app is the one that drifted:

| | Windows · Mac · Quest | iPhone and iPad (`App/Theme.swift`) |
| --- | --- | --- |
| Dark background | `#262624` canvas, `#1F1E1D` sidebar | `#1F1E1D` background, `#2A2927` surface |
| Dark success / warning / danger | `#7FBF7F` · `#E0AF68` · `#E06C75` | `#6FBF8B` · `#E3B25C` · `#E5776A` |
| Light success / warning / danger | `#3D8B4A` · `#A86E12` · `#C2404B` | `#3D8C5A` · `#B7791F` · `#C0392B` |
| Colour names | canvas, sidebar, raise, field, sunken, line, ink, muted | background, surface, elevated, bubble, border, code |
| `running` dot | accent (clay) | success (green) |
| `queued`, `preparing`, `starting` | accent | warning |
| `idle` | ok (green) | secondary grey |
| `cancelled` | warn | danger |

The iPhone app moves onto the shared palette, in line with the Mac app it shares a core with: running sessions turn clay instead of green, finished ones green instead of grey. Quest, which was dark only, gains the light theme.

Charts: the usage dashboard's series colours were already shared by Windows, the Mac and iPhone, and read in both modes. The context bar's colours were tuned for dark only, at about 2.5:1 on a light surface; `chart.context.light` keeps their hues at 3:1. Each client looks a category up with `contextColor`/`briareus_context_color`, so the names Claude's /context report uses live here too.

Text sizes match between Windows and the Mac (15px body, 13px chrome, 12/11px metadata). Quest keeps its larger headset scale, which is in the tokens as `headset.type`. Corner radii vary most: the scale here (3, 4, 5, 6, 8, 10, 12, 16, full) covers what the desktop clients use; Quest's 14 is the one value outside it.

## License

[MIT](LICENSE)
