# AdityaOS — interactive desktop portfolio

A 3D CRT workstation you can actually use: boot into the monitor, and the screen runs a full
Windows-style desktop with real, working applications.

**Aditya Balaji** — Mumbai, India · builder, researcher and student across software, markets, AI and science.

- GitHub — https://github.com/aditya160509
- LinkedIn — https://www.linkedin.com/in/aditya-balaji-50375237a/
- Email — aditya160509@gmail.com
- Grade Central — https://grade-central.vercel.app/
- PhenoSync — https://github.com/aditya160509/phenosync
- Study notes — https://github.com/aditya160509/study-notes
- Future Lab (Quant Finance Club) — https://future-lab-terminal.vercel.app

## Run it

```bash
npm run install:all
npm run dev          # builds the desktop, stages it into the 3D shell, serves on :8080
```

`npm run build` alone produces the deployable bundle: the inner desktop (CRA) is compiled,
staged into `site/outer/static/desktop` by `scripts/stage-desktop.mjs`, then the outer
Three.js shell is bundled into `site/outer/public`.

## What runs inside the desktop

| App | Built on |
|---|---|
| Open WebUI | `open-webui/open-webui` (BSD-3), built from source, boot endpoints served locally |
| Markets | lightweight-charts + indicator math ported from OpenCharts (EMA / RSI / MACD), paper trading |
| VS Code | Monaco editor, local autosave |
| Ghostty | `zerebos/ghostty-config` (MIT), built from source |
| Chrome / Safari | in-desktop tabbed browser (Google renders via `webhp?igu=1`) |
| Terminal + Explorer | shared virtual file system (`src/utils/filesystem.ts`) |
| Minesweeper | `nickarocho/minesweeper` |
| Solitaire | `scarolan/klondike` (MIT) |
| Tetris · Pong | straker's Basic HTML Games (CC0) |
| Wordle | `modem7/react-wordle` (MIT) |
| Chess | lichess `chessground` (GPL-3) + `chess.js` (MIT) |
| Doom · Oregon Trail · Scrabble · Digger | js-dos + DOSBox |
| Spotify · Radio | Spotify embed · radio-browser.info |
| Calculator | Qalculate-style unit-aware evaluator |
| Paint · Notepad · Settings | native to this desktop |

Vendored projects keep their upstream licence file next to the code they ship with.

## Layout

```
site/inner    React desktop (windows, apps, file system)
site/outer    Three.js CRT shell + Express host
scripts       stage-desktop.mjs — copies the built desktop into the shell
```
