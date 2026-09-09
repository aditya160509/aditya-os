# WORK.md — remaining backlog

Updated 2026-09-09 after the latest build, Render deployment, and Vercel redeploy. Each item says **what**, **why**, **how** and **where**.
Ordered so a session can start at the top and work down.

## Latest completed work

| # | Item | Result |
|---|---|---|
| 1 | Dead textures | 57 MB → **8.8 MB** |
| 2 | GitHub stars button | Removed from source and built HTML |
| 3 | Site menu | Research added; missing `about`/`blog` thumbnails restored |
| 6 | Project detail routes | Five placeholder links now open generated, responsive `/portfolio/projects/<slug>/` pages with playable previews and full copy |
| 7 | Desktop pet | Hermes-derived frames now have four selectable styles and a low-overhead idle / roam / cursor-follow loop |
| 8 | Assistant UI | Added command palette, conversation search, context picker, local run state, trace disclosure and a responsive workspace inspector |
| 9a | Wallpaper downloads | Always visible and works on touch |
| 9b | Mobile install | Existing PWA install flow confirmed; settings, assistant and install affordances now collapse for narrow screens |

Also fixed the online-users chip: it now defaults to the live relay instead of being hidden behind a missing `NEXT_PUBLIC_WS_URL`. The build remains full-quality for wallpapers; the new work is in initial loading, navigation and mobile affordances rather than media re-encoding.

Repo layout, for reference:

| Path | What it is |
|---|---|
| `site/outer` | Three.js CRT shell + Express server. Serves everything. |
| `site/inner` | The React desktop (windows, apps, games). Staged to `/desktop`. |
| `site/portfolio` | Next.js personal site (fork of Naresh-Khatri/3d-portfolio). Staged to `/portfolio`. |
| `presence/` | socket.io relay. Deployed on Render, live. |
| `<project>.md` | The original frontend build prompt for each project, with its real media URLs. |

Build everything: `npm run build` from the repo root. It runs inner → stage → portfolio → stage → outer, in that order. **Staging writes to `site/outer/static`; only the outer webpack build copies that into `site/outer/public`, which is what the server serves.** Rebuilding only the portfolio and re-staging will look like nothing changed — run the outer build too.

---

## 1. [Done] Delete dead assets

**Why:** it ships to every visitor's deploy and sits in the repo for nothing.

| Path | Size | Evidence it is unused |
|---|---|---|
| `site/outer/static/textures/monitor/video/real.mp4` | 37 MB | no reference in `site/outer/src` or `index.html` |
| `site/outer/static/textures/monitor/layers/png/` | 11 MB | `sources.ts` only loads `layers/compressed/` |

**How:**
```bash
rm -f site/outer/static/textures/monitor/video/real.mp4
rm -rf site/outer/static/textures/monitor/layers/png
grep -rn "real.mp4\|layers/png" site/outer/src site/outer/server   # must return nothing
npm run build
```
Keep `base-static.mp4` and `static-texture-layer.mp4` — both are referenced from `site/outer/src/index.html:138-141`.

---

## 2. [Done] Remove the GitHub stars button

**Why:** it reads `0` and is a leftover from the fork.

**Where:**
- `site/portfolio/src/components/header/header.tsx` — remove the `<GithubStarsButton>` usage
- `site/portfolio/src/components/ui/shadcn-io/github-stars-button/` — delete
- `site/portfolio/src/actions/github-stars.ts` — delete

Check nothing else imports them: `grep -rn "github-stars\|GithubStars" site/portfolio/src`

---

## 3. [Done] Update the site menu

**Why:** the nav still has the fork's sections, and no Research entry even though Research is now the strongest section.

**Where:** `site/portfolio/src/components/header/config.ts`

Target list: Home · About · Projects · **Research** · Blogs · Contact. Drop Skills as a top-level entry (the skills dock lives inside the page anyway) or keep it — but Research must be there, pointing at `/#research`.

Each entry has a `thumbnail` under `public/assets/nav-link-previews/`. A new Research entry needs one — screenshot the section and save it as `research.png`, same dimensions as the existing files.

---

## 4. [Done] Wire the remaining project videos

**Why:** four of seven project cards still show generated art. You have now added the prompt files.

**Available now:**

| Project | Prompt file | Media |
|---|---|---|
| Glassbox | `glassbox.md` | `hf_20260508_215831_c6a8989c-....mp4` |
| PhenoSync | `phenosync.md` | two **PNG** stills (`hf_20260808_192942_...`, `hf_20260808_151324_...`) — no video |

**How** (same pipeline already used for atlas/nexus/daedalus):
```bash
curl -sL -o /tmp/glassbox.mp4 "<url from glassbox.md>"
ffmpeg -y -i /tmp/glassbox.mp4 -t 12 -vf "scale=960:-2:flags=lanczos,fps=24" \
  -c:v libx264 -preset slow -crf 27 -movflags +faststart -an \
  site/portfolio/public/assets/projects-video/glassbox.mp4
ffmpeg -y -i site/portfolio/public/assets/projects-video/glassbox.mp4 \
  -frames:v 1 -q:v 3 site/portfolio/public/assets/projects-video/glassbox.jpg
```
Then in `site/portfolio/src/data/projects.tsx` set `src: \`${VIDEO_PATH}/glassbox.jpg\`` and `video: \`${VIDEO_PATH}/glassbox.mp4\``.

For PhenoSync, download the two PNGs into `public/assets/projects-screenshots/phenosync/` and use them as `src` + `screenshots` — do **not** invent a video it doesn't have.

Future Lab and AdityaOS still have no prompt file. Leave their generated art until one exists.

---

## 5. [Done] Rewrite the project descriptions

**Why:** your words, in the modal: *"there is no detail inside the url just plain"* and *"remove honest data bullshit"*.

**Where:** `site/portfolio/src/data/projects.tsx`, the `get content()` block of each project.

Two changes:

**a. Delete the "Honest data" heading and its paragraph** from the ATLAS entry. The survivorship-bias / free-sources framing reads defensively. Fold anything worth keeping into the body text without the heading.

**b. Expand every description.** Each project's `.md` prompt file contains the real copy from the original site — section headings, feature lists, the actual product language. Read the prompt file and rewrite the modal content from it, keeping your metrics. Aim for three or four real sections per project, not one paragraph.

Sources: `atlas.md`, `nexus.md`, `daedulus.md`, `glassbox.md`, `phenosync.md`.

---

## 6. [Done] Make the project modal a real preview

**Why:** two problems, both visible in the screenshots — the modal doesn't scroll to the video, and there is no signal that this is a preview of a real site rather than the site itself.

**What to build:**

1. **A scrollable preview pane.** The modal already has a `ScrollArea`; the video sits in the card behind it and is never reachable once open. Put the loop at the top of the modal body, above the copy, so opening a project shows the motion first.

2. **Label it.** A caption under the media: *"Preview of the live site"*, plus the Visit Website button that already exists. Right now a visitor can't tell whether they're looking at a screenshot, a video, or an embed.

3. **Optional, higher effort — build the real thing.** Each `.md` is a complete, self-contained build spec (stack, fonts, colours, exact copy, exact media URLs). Any one could be built as a static page and served under `/portfolio/preview/<id>/`, then embedded in the modal as an iframe. That turns "here's a video of a site" into "here's the site". Do this for one project first (Daedalus is the most cinematic) and judge whether it's worth repeating.

**Where:** `site/portfolio/src/components/sections/projects.tsx` (`ProjectCard`, `ProjectLoop`).

---

## 7. [Done for the current sprite set] Sprite picker + cursor-following pet
**Why:** you asked for a choice of sprites and for the pet to move toward the cursor.

**Where:** `site/inner/src/components/os/DesktopPet.tsx`, sprites in `site/inner/public/assets/pet/`.

**Current state:** 8 Hermes-derived frames, wanders, follows the cursor within a wider viewport-relative radius, and now has live size presets from 48px (Tiny) through 160px (Showcase).

Implemented: the pet now follows from a wider viewport-relative radius, pauses between walks, roams toward bounded destinations, and updates its position directly in the DOM so the animation does not re-render the desktop every frame. Settings → Desktop offers Hermes, Amber, Mono and Pixel presentation styles plus six persisted size presets; the style choice applies live. Hermes currently publishes one official animated character set, so these are palette/render variants rather than uncredited artwork from a second source.

**Do:**
1. **Widen the follow.** Raise the radius to roughly a third of the viewport, and make it approach continuously rather than only when close. Keep an idle/nap state so it isn't glued to the pointer.
2. **Add a picker.** Put a "Desktop pet" section in Settings → Desktop with a sprite grid, storing the choice in `localStorage` under `aditya-pet`. Support "None" so it can be turned off.
3. **Add sprite sets.** Organise as `public/assets/pet/<set>/pet-N.png`. Hermes is set one. Any additional set must be a licence-clean source — record it in `CREDITS.md` next to the existing `LICENSE-hermes.txt`, as was done for the Hermes frames.

---

## 8. [Done] Rebuild the Assistant as a real Claude-style UI

**Why:** the current one is a plain log with a text box. You asked for the full interface.

**Where:** `site/inner/src/components/applications/StudioApps.tsx` (`ClaudeApp`), styles in `StudioApps.css` under `.assistant`.

**Keep:** no model, no network — every reply comes from the local corpus. That constraint is the honest part and should stay.

**Add, in rough order of impact:**
- **Conversation sidebar** — named past chats, new-chat button, stored in `localStorage`. Seed it with two or three pre-written conversations so it doesn't open empty.
- **Message chrome** — avatars, copy button per reply, thumbs up/down, regenerate.
- **Markdown rendering** — headings, lists, tables, and syntax-highlighted code blocks. The corpus already contains formatting the current renderer flattens.
- **Streaming polish** — a stop button while generating, and a thinking indicator before the first token.
- **Artifacts panel** — a right-hand pane that renders a code block or a chart the reply refers to. This is the detail that sells it.
- **Input affordances** — attach button (inert but present), model picker showing "Local corpus", token/character count.

Grow the corpus in the same file — it is a list of `{ match: RegExp, reply: string }`. More entries make it feel less canned.

Implemented: Claude-inspired dark workspace with seeded local conversations, persistent chat history, new-chat flow, safe Markdown headings/lists/tables/code rendering, copy and feedback controls, regenerate, stop/thinking states, local-corpus model indicator, character count, contextual artifact previews, conversation search, a keyboard command palette (`⌘K`), context scopes, a local run-state indicator, expandable local trace and a responsive inspector rail. It remains fully local with no model, analytics, or networked chat.

---

## 9. Make downloads discoverable

**Why:** your words — *"there is no option to download like i wouldn't know how to download"*.

**Two separate things, both currently hidden:**

**a. Wallpapers — done.** The ⤓ button is always visible at reduced opacity and works on touch. The 88 wallpapers remain at their original, final quality; do not re-encode them.

**b. Installing the app — done.** The desktop has a persistent Install button, a Start-menu entry, a one-time prompt after a visitor has been active for a minute, a native Chromium install flow, and Safari/iOS Add to Home Screen guidance. Copy explains the own window, browser-chrome-free shell, and offline benefits.

---

## 10. The six platform features

From the earlier list. All are in `site/outer/static/manifest.webmanifest` and `site/outer/static/sw.js` unless noted.

1. **File handlers** — register `.txt`/`.md`/`.json` via the manifest `file_handlers` field so double-clicking one on the real desktop opens it in the in-OS Notepad. Needs a `launchQueue.setConsumer` handler in the inner app to receive the file. Biggest "it's a real app" moment.
2. **File System Access API** — let the desktop's file tools open and save real files through a picker (`showOpenFilePicker` / `showSaveFilePicker`). Chromium only; feature-detect and hide the buttons elsewhere.
3. **Share target** — manifest `share_target`, so a link shared from a phone opens in the in-OS browser.
4. **Protocol handler** — manifest `protocol_handlers` for `web+adityaos://`, routed to open a named app.
5. **App badge** — `navigator.setAppBadge(n)` with the count of locked achievements, cleared when all are unlocked.
6. **Selective offline** — precache the games (a few MB) in `sw.js` so Minesweeper, Solitaire, Tetris and Pong work with no connection. The Code Studio portfolio is a separate static page and is not cached offline. Video, models and wasm stay excluded — that exclusion is deliberate and must not be removed.
7. **Wake lock** — `navigator.wakeLock.request('screen')` while a game or the radio is playing; release on window close or blur.

---

## 11. [Done] Delete the Explorer app

**Why:** you asked for it. It duplicates the file system the Terminal already exposes.

**Where:** `site/inner/src/components/os/Desktop.tsx` (its entry in the app list), its component in `site/inner/src/components/applications/`, and its styles. Leave `site/inner/src/utils/filesystem.ts` alone — the Terminal depends on it.

Afterwards, check the achievement count in the tray still adds up and that `noteAppOpened`'s "open every application" achievement isn't now unreachable.

Implemented: Explorer was removed from the application registry, desktop shortcuts, and toolbar quick-launch path. The shared virtual filesystem remains because Terminal uses it; the source component and styles are kept in place for recoverability. README references now describe Terminal only.

---

## 12. The four bigger pieces

Deliberately last: each is a day of work, not an hour.

**a. Mobile — substantially improved, final native packaging still out of scope.** The desktop keeps the full 3D experience, but touch devices now open apps as viewport-sized panels, use pointer events for window drag/resize, keep assistant/settings controls within the phone width, and surface the install affordance. The PWA manifest starts installed apps at `/desktop/`, includes Android maskable icons, and links an Apple touch icon. Android Chrome/Edge can install it as a PWA and iOS Safari can use Share → Add to Home Screen; this is not an APK or App Store binary.

**b. First-run cue.** A visitor lands on a dark room with a CRT and no idea the monitor is clickable or that twenty apps are inside. A five-second cue — a pulse on the screen, one line of text — converts more visitors than any new feature.

**c. Per-paper pages.** The three papers are download-only. Give each a route under `/portfolio/research/<slug>` with the abstract, key figures (they exist as PNGs in the source repos), and the PDF link. Makes the research readable and gives search engines something.

**d. OG images.** No link preview anywhere. Add per-route OG images and metadata in `site/portfolio/src/app/layout.tsx` and the outer `index.html`. The desktop is JS-rendered, so crawlers currently see almost nothing.

---

## 13. [Done] Performance pass — preserve full-quality media

**Goal:** keep every feature and the original wallpaper quality while reducing the amount downloaded during startup. These changes improve initial load time; they do not necessarily reduce total Vercel deployment storage.

1. **Lazy-load wallpapers only when selected.** Keep the full-quality files, but avoid requesting the complete wallpaper library when the picker opens. Load a selected wallpaper on demand.
2. **Remove duplicate audio and other duplicate assets.** Audit the staged output and retain one canonical copy of each file, updating references where necessary.
3. **Lazy-load games and DOS files.** Load game bundles and DOS assets only when their applications open. Code Studio now uses the separately staged VS Code portfolio page, so it does not ship an editor engine with the desktop shell.
4. **Lazy-load apps generally.** Split heavy applications into dynamic chunks so the initial desktop bundle contains only the shell and lightweight apps.

**Expected result:** roughly **30–60% less initial loading**, depending on the visitor’s browser and which apps are opened. Do not re-encode or reduce the quality of the 88 wallpapers.

Implemented: wallpaper videos use metadata preload and the picker thumbnails are lazy/async; the selected wallpaper remains the only full-quality loop requested. The staging script removes the duplicate inner `/desktop/audio` tree and keeps the outer shell's canonical `/audio` files. Desktop applications are React lazy chunks, with DOS/js-dos and game modules fetched only when opened; Code Studio is a separately staged static VS Code portfolio. Removing the browser editor's workers and package drops roughly 24 MB from shipped static assets while keeping the full Code Studio routes available. The 88 wallpaper files remain unchanged.

---

## Standing constraints

- **Never re-encode the 88 wallpapers.** They took hours and are final.
- **Nothing about a visitor leaves their device** — wallpapers and achievements are local; the presence relay stores no account, IP, geolocation or history. The fork's analytics beacon was removed for exactly this reason; do not reintroduce anything like it.
- **Vendor real upstream code** rather than reimplementing it, and credit it in `CREDITS.md`.
- **Media stays out of the service worker cache.** The exclusion in `sw.js` is intentional.

## Done, for context

Papers section and three PDFs · project loops for atlas/nexus/daedalus · Settings rebuilt · Open WebUI deleted (66 MB) · native Assistant · presence relay live on Render · Render CORS allowlist updated · GitHub keepalive workflow committed · PWA manifest, screenshots, maskable icon, offline page · wallpaper downloads · desktop pet · achievements · analytics beacon removed · credits added · Vercel environment configured and redeployed.

The Render relay and GitHub keepalive workflow are now configured. The relay is live at `https://aditya-presence.onrender.com`; the public site is deployed at `https://adityabalaji.vercel.app`.
