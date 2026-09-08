# Full live-site reverse-engineering and rebuild specification

## Document purpose

This document consolidates the live inspection of the reference portfolio and translates it into an implementation plan for an original personal studio portfolio.

It explains the public architecture, loading sequence, asset families, browser behavior, desktop applications, window system, data model, external embeds, code boundaries, replacement points, and the proposed multi-computer research/quantitative version.

This is a technical reference and build specification. It is not a recommendation to publish another person’s personal information, branding, links, resume, music, or identity.

The implementation should preserve the interaction ideas while replacing the identity and assets with materials you own or are licensed to use.

## Status of inspection

- The outer site was inspected through its public HTML and JavaScript bundle.
- The inner portfolio was inspected through its public HTML, Next.js chunks, compiled CSS, and browser UI.
- The site was opened in a live browser.
- The inner desktop was opened directly.
- The About window was visually inspected.
- The outer monitor iframe behavior was inspected from the public bundle.
- Public model, texture, icon, CSS, JavaScript, and audio paths were enumerated.
- The reference site’s app registry was extracted from the compiled page bundle.
- No private repository, account, password, API key, or private file was accessed.
- No unrelated local project folder was edited.

## Reference URLs

Outer computer shell:

```text
https://yoshik-pc.vercel.app/
```

Inner portfolio desktop:

```text
https://yoshik-portfolio.vercel.app/
```

Public outer bundle:

```text
https://yoshik-pc.vercel.app/bundle.ee5bd72f17b93232.js
```

Public inner page chunk:

```text
https://yoshik-portfolio.vercel.app/_next/static/chunks/pages/index-b5be2ad72893e81d.js
```

Public inner stylesheet:

```text
https://yoshik-portfolio.vercel.app/_next/static/css/cbed387ce87dbd34.css
```

## High-level architecture

The reference is a two-layer web experience.

The first layer is a 3D computer scene.

The second layer is a simulated Ubuntu desktop rendered inside the computer monitor.

The outer layer provides atmosphere and physical context.

The inner layer provides portfolio content and app interactions.

The outer layer is not responsible for rendering the portfolio sections.

The inner layer is not responsible for rendering the 3D desk and computer model.

The bridge between both layers is an iframe.

The monitor surface is positioned in 3D.

The iframe is positioned over the monitor using CSS/DOM rendering.

The outer app also forwards mouse and keyboard behavior into the monitor experience.

## Layer 1: outer 3D shell

### Outer shell responsibilities

The outer shell is responsible for:

- Initial loading screen.
- Boot-style text.
- Startup animation.
- 3D computer model.
- Desk and room decoration.
- Environment lighting.
- Monitor framing.
- Monitor shadow overlay.
- Monitor smudge overlay.
- Camera movement.
- Mouse-enter monitor behavior.
- Mouse-leave monitor behavior.
- Mouse click sounds.
- Keyboard sounds.
- Startup sound.
- Office ambience.
- Loading progress.
- Embedding the inner portfolio.

### Outer shell technology

The public bundle contains evidence of:

- React.
- Three.js.
- GLTFLoader.
- OrbitControls-like camera behavior.
- AudioContext usage.
- WebGL texture loading.
- GLB model loading.
- HTML iframe creation.
- CSS3D or DOM overlay techniques.

### Outer shell loading flow

The expected loading sequence is:

```text
HTML loads
  ↓
React bootstraps
  ↓
Three.js scene initializes
  ↓
GLTF and texture resources begin loading
  ↓
Audio resources begin loading
  ↓
Loading progress is displayed
  ↓
Scene is ready
  ↓
Startup screen is shown
  ↓
User clicks or presses a key
  ↓
Startup audio is allowed by the browser
  ↓
Camera and monitor become interactive
  ↓
Inner portfolio iframe is shown
```

### Browser autoplay constraint

Audio should not start before a user gesture.

Browsers commonly block autoplay audio.

The correct implementation is to load audio silently, then start it after the Start button, Enter key, or Space key is activated.

### Outer loading resource registry

The inspected bundle contains a resource registry conceptually equivalent to:

```js
const resources = [
  {
    name: "computerSetupModel",
    type: "gltfModel",
    path: "models/Computer/computer_setup.glb"
  },
  {
    name: "computerSetupTexture",
    type: "texture",
    path: "models/Computer/baked_computer.jpg"
  },
  {
    name: "environmentModel",
    type: "gltfModel",
    path: "models/World/environment.glb"
  },
  {
    name: "environmentTexture",
    type: "texture",
    path: "models/World/baked_environment.jpg"
  },
  {
    name: "decorModel",
    type: "gltfModel",
    path: "models/Decor/decor.glb"
  },
  {
    name: "decorTexture",
    type: "texture",
    path: "models/Decor/baked_decor_modified.jpg"
  },
  {
    name: "monitorSmudgeTexture",
    type: "texture",
    path: "textures/monitor/layers/compressed/smudges.jpg"
  },
  {
    name: "monitorShadowTexture",
    type: "texture",
    path: "textures/monitor/layers/compressed/shadow-compressed.png"
  },
  {
    name: "mouseDown",
    type: "audio",
    path: "audio/mouse/mouse_down.mp3"
  },
  {
    name: "mouseUp",
    type: "audio",
    path: "audio/mouse/mouse_up.mp3"
  },
  {
    name: "keyboardKeydown1",
    type: "audio",
    path: "audio/keyboard/key_1.mp3"
  },
  {
    name: "keyboardKeydown2",
    type: "audio",
    path: "audio/keyboard/key_2.mp3"
  },
  {
    name: "keyboardKeydown3",
    type: "audio",
    path: "audio/keyboard/key_3.mp3"
  },
  {
    name: "keyboardKeydown4",
    type: "audio",
    path: "audio/keyboard/key_4.mp3"
  },
  {
    name: "keyboardKeydown5",
    type: "audio",
    path: "audio/keyboard/key_5.mp3"
  },
  {
    name: "keyboardKeydown6",
    type: "audio",
    path: "audio/keyboard/key_6.mp3"
  },
  {
    name: "startup",
    type: "audio",
    path: "audio/startup/startup.mp3"
  },
  {
    name: "office",
    type: "audio",
    path: "audio/atmosphere/office.mp3"
  },
  {
    name: "ccType",
    type: "audio",
    path: "audio/cc/type.mp3"
  }
];
```

## Outer asset inventory

### Computer model

```text
models/Computer/computer_setup.glb
```

Role:

- Main computer hardware.
- Monitor geometry.
- Keyboard geometry.
- Mouse geometry.
- Physical setup geometry.

```text
models/Computer/baked_computer.jpg
```

Role:

- Baked color and lighting texture for the computer model.

### Environment model

```text
models/World/environment.glb
```

Role:

- Room or world environment.
- Background physical context.

```text
models/World/baked_environment.jpg
```

Role:

- Baked environment material.

### Decoration model

```text
models/Decor/decor.glb
```

Role:

- Desk objects.
- Decorative props.
- Scene atmosphere.

```text
models/Decor/baked_decor_modified.jpg
```

Role:

- Baked texture for the decor model.

### Monitor overlays

```text
textures/monitor/layers/compressed/smudges.jpg
```

Role:

- Simulated screen imperfections.
- Adds physical display texture.

```text
textures/monitor/layers/compressed/shadow-compressed.png
```

Role:

- Inner shadow around the display.
- Improves monitor depth.

### Audio assets

```text
audio/atmosphere/office.mp3
```

Role:

- Background ambience.

```text
audio/startup/startup.mp3
```

Role:

- Boot completion or startup cue.

```text
audio/cc/type.mp3
```

Role:

- Typing or command-center sound.

```text
audio/mouse/mouse_down.mp3
audio/mouse/mouse_up.mp3
```

Role:

- Mouse click feedback.

```text
audio/keyboard/key_1.mp3
audio/keyboard/key_2.mp3
audio/keyboard/key_3.mp3
audio/keyboard/key_4.mp3
audio/keyboard/key_5.mp3
audio/keyboard/key_6.mp3
```

Role:

- Randomized keyboard key feedback.

## Outer iframe implementation

The bundle creates an iframe with the following conceptual behavior:

```js
const iframe = document.createElement("iframe");

iframe.src = "https://yoshik-portfolio.vercel.app/";
iframe.width = "1280px";
iframe.height = "1024px";
iframe.id = "computer-screen";
iframe.frameBorder = "0";
iframe.title = "Portfolio";

monitorElement.appendChild(iframe);
```

The screen has a fixed internal design resolution.

The outer shell maps the physical monitor coordinates to that internal screen.

Mouse coordinates are converted before being dispatched into the iframe.

Keyboard events are converted and forwarded to the iframe.

This is why the 3D scene feels like the visitor is controlling a real computer.

## Outer monitor interaction model

The inspected bundle contains logic for:

- Detecting whether the pointer is over `computer-screen`.
- Marking the user as inside the monitor.
- Triggering camera enter-monitor behavior.
- Triggering camera leave-monitor behavior.
- Tracking whether a click started inside the monitor.
- Deciding whether a click ended outside the monitor.
- Forwarding mousemove events.
- Forwarding mousedown events.
- Forwarding mouseup events.
- Forwarding keydown events.
- Forwarding keyup events.

The conceptual flow is:

```text
Pointer enters monitor
  → camera may move closer

Pointer moves over monitor
  → coordinate is mapped to iframe

Mouse down
  → click sound
  → event is forwarded

Mouse up
  → release sound
  → event is forwarded

Pointer leaves monitor
  → camera may move back
```

## Layer 2: inner portfolio desktop

The inner site is a Next.js application.

The public HTML references the standard Next.js runtime chunks.

The important page chunk is:

```text
/_next/static/chunks/pages/index-b5be2ad72893e81d.js
```

The app has a full-screen desktop container.

The desktop uses an Ubuntu/Yaru visual language.

## Inner desktop visual structure

The browser inspection showed:

- Ubuntu logo.
- Activity label.
- Time display.
- Wi-Fi icon.
- Sound icon.
- Battery icon.
- Left dock.
- Desktop shortcuts.
- Wallpaper.
- Windows opening above the desktop.

The main About window showed:

- Window titlebar.
- Close control.
- Minimize control.
- Maximize control.
- Dark content area.
- Left navigation rail.
- Orange selected navigation item.
- Scrollable content area.
- Profile illustration.
- Large name/role title.
- Short descriptive paragraphs.

## Inner app registry

The compiled app registry contains these entries:

```text
chrome → Google Chrome
calc → Calc
about-vivek → About Yoshik
vscode → Visual Studio Code
terminal → Terminal
spotify → Spotify
settings → Settings
trash → Trash
gedit → Contact Me
github → AskYoshik
```

The identifier `about-vivek` is an internal legacy-style identifier even though the visible title says `About Yoshik`.

For your app, use clean identifiers that match your identity.

Example:

```js
const apps = [
  {
    id: "about",
    title: "About Me",
    icon: "/icons/about.svg",
    desktopShortcut: true,
    component: AboutApp
  },
  {
    id: "research",
    title: "Research Lab",
    icon: "/icons/research.svg",
    desktopShortcut: true,
    component: ResearchLabApp
  },
  {
    id: "signal",
    title: "Signal Mode",
    icon: "/icons/signal.svg",
    desktopShortcut: true,
    component: SignalModeApp
  }
];
```

## Desktop app registry fields

The reference app objects conceptually contain:

```js
{
  id,
  title,
  icon,
  disabled,
  favourite,
  desktop_shortcut,
  screen,
  isExternalApp,
  url
}
```

Recommended fields for your version:

```ts
type AppDefinition = {
  id: string;
  title: string;
  icon: string;
  category: "core" | "research" | "tools" | "external";
  desktopShortcut?: boolean;
  dockFavorite?: boolean;
  component?: React.ComponentType;
  externalUrl?: string;
  iframeUrl?: string;
  requiresUserGesture?: boolean;
};
```

## Window manager

The reference uses a draggable/resizable window component.

The compiled code contains a draggable window library pattern with:

- Drag handle.
- Position state.
- Width state.
- Height state.
- Parent boundary calculations.
- Resize behavior.
- Minimize behavior.
- Maximize behavior.
- Close behavior.
- Focus behavior.
- Z-index behavior.
- Cursor changes while dragging.

The window titlebar is the drag handle.

The component recalculates bounds when the viewport resizes.

The default window size is percentage-based.

On smaller screens the default height changes.

For your version, build this as a standalone package.

Suggested files:

```text
src/window-manager/types.ts
src/window-manager/WindowManager.tsx
src/window-manager/WindowFrame.tsx
src/window-manager/windowReducer.ts
src/window-manager/useWindowManager.ts
src/window-manager/windowManager.css
```

## Window state model

```ts
type WindowState = {
  id: string;
  title: string;
  open: boolean;
  minimized: boolean;
  maximized: boolean;
  focused: boolean;
  zIndex: number;
  position: {
    x: number;
    y: number;
  };
  size: {
    width: number;
    height: number;
  };
};
```

## Window actions

```ts
type WindowAction =
  | { type: "OPEN"; id: string }
  | { type: "CLOSE"; id: string }
  | { type: "MINIMIZE"; id: string }
  | { type: "MAXIMIZE"; id: string }
  | { type: "RESTORE"; id: string }
  | { type: "FOCUS"; id: string }
  | { type: "MOVE"; id: string; x: number; y: number }
  | { type: "RESIZE"; id: string; width: number; height: number };
```

## Window reducer behavior

Opening an app should:

- Add it if it is not open.
- Focus it if it is already open.
- Bring it to the highest z-index.

Closing an app should:

- Mark it closed or remove it from active windows.
- Return focus to the next visible window.

Minimizing an app should:

- Keep its state alive.
- Hide the window.
- Leave a taskbar item visible.

Maximizing an app should:

- Store the previous position.
- Store the previous size.
- Fill the desktop work area.

Restoring an app should:

- Return to the previous position.
- Return to the previous size.

Focusing an app should:

- Set `focused: true`.
- Set all other windows to `focused: false`.
- Increment the global z-index counter.

## Main portfolio app

The About window has an internal section switcher.

The reference sections are:

```text
About Me
Education
Skills
Projects
Resume
```

For your version, the main app can use:

```text
Identity
Research
Builds
Writing
Experience
Resume
Contact
```

The main app should remain usable even if the visitor does not explore every desktop app.

## About data model

```ts
type Profile = {
  name: string;
  role: string;
  eyebrow: string;
  avatar?: string;
  paragraphs: string[];
  location?: string;
  currentFocus?: string;
};
```

Example original content shape:

```js
export const profile = {
  name: "Your Name",
  role: "Builder / Researcher",
  eyebrow: "Personal Studio Portfolio",
  paragraphs: [
    "I build systems, products, and experiments.",
    "My work sits between software, research, and design.",
    "I enjoy making complex ideas easier to explore.",
    "This studio is a map of what I am building and learning."
  ]
};
```

## Education data model

```ts
type EducationEntry = {
  institution: string;
  period: string;
  program: string;
  detail?: string;
  link?: string;
};
```

## Skills data model

```ts
type Skill = {
  name: string;
  icon?: string;
  category: "language" | "frontend" | "backend" | "data" | "tools";
  confidence?: "learning" | "working" | "advanced";
};
```

Use categories that reflect your actual work.

Possible categories:

- Software.
- Data.
- Research.
- Quantitative methods.
- Design.
- Infrastructure.
- Communication.

## Project data model

```ts
type Project = {
  id: string;
  name: string;
  date: string;
  summary: string;
  description: string[];
  technologies: string[];
  image?: string;
  liveUrl?: string;
  repositoryUrl?: string;
  caseStudyUrl?: string;
  status: "active" | "complete" | "archived";
};
```

The reference uses a list of projects with:

- Name.
- Date.
- External link.
- Description array.
- Technology/domain tags.

That data model is reusable.

The actual project names and descriptions must be replaced.

## Resume app

The reference uses a local PDF iframe.

Your version can use:

```jsx
<iframe
  src="/files/resume.pdf"
  title="Resume"
  className="h-full w-full"
/>
```

Add a normal download button outside the iframe.

Do not make the resume available only through a hidden desktop interaction.

## Terminal app

The reference terminal has a command row system.

It uses hidden input elements for keyboard capture.

The visible prompt is rendered separately from the actual input.

For your version, use a standard accessible input while preserving the terminal visual style.

Suggested commands:

```text
help
whoami
about
work
research
signal
projects
skills
now
contact
clear
exit
```

Command handling model:

```ts
const commands: Record<string, () => string> = {
  help: () => "Available commands: about, work, research, signal, projects, contact",
  whoami: () => profile.name,
  about: () => profile.summary,
  now: () => profile.currentFocus ?? "No current focus recorded."
};
```

Do not allow arbitrary JavaScript evaluation in a public terminal.

The reference calculator evaluates expressions, but your terminal should not evaluate arbitrary code.

## Calculator app

The reference includes a C-style arbitrary precision calculator presentation.

It supports a help message, clear, exit, and expression evaluation.

For your version, use a safe math parser.

Do not call JavaScript `eval` on user input.

Use a restricted parser or a vetted math expression library.

## Chrome app

The simulated browser has:

- URL input.
- Home button.
- Refresh button.
- Iframe content area.
- Google homepage fallback.
- localStorage persistence.

The reference stores values conceptually like:

```text
chrome-url
chrome-display-url
```

For your version, avoid embedding arbitrary websites unless you understand iframe restrictions and security implications.

Better alternatives:

- Use an internal project browser.
- Open external links in a real new tab.
- Allow only an explicit allowlist of known URLs.

## VS Code app

The reference embeds GitHub1s.

Your version can provide:

- Public GitHub repository viewer.
- Static code snippets.
- Project architecture diagrams.
- Read-only file tree.

Avoid embedding private repositories or asking visitors to authenticate inside your portfolio.

## Spotify app

The reference embeds a Spotify playlist.

For your version:

- Use your own playlist.
- Start playback only after a user gesture.
- Provide a mute control.
- Provide a no-audio mode.
- Do not make music necessary to understand content.

## Settings app

The reference provides background selection.

Your Settings app could control:

- Background theme.
- Motion level.
- Sound level.
- Studio/Classic mode.
- Dark/light contrast.
- Reduced effects.

Persist only non-sensitive preferences.

## Trash app

The reference contains a simulated trash file list.

Your version could use Trash as a playful archive:

- Failed experiments.
- Retired projects.
- Old versions.
- Design sketches.

Do not imply that it can delete real user files.

## Contact app

The reference styles Contact Me like an editor window.

Your version should include:

- Email.
- GitHub.
- LinkedIn.
- Optional social account.
- Optional contact form.

Use a normal accessible link to email.

If adding a form, use a secure server-side endpoint and spam protection.

## Social/external app

The reference contains an external social shortcut.

Your version can use:

- GitHub.
- LinkedIn.
- X.
- Personal blog.
- Research profile.

Open external links in a new tab with safe `rel` attributes.

## Inner icon inventory

The public inner bundle references icons under:

```text
themes/Yaru/apps/
themes/Yaru/status/
themes/Yaru/system/
themes/Yaru/window/
```

App icon references include:

```text
themes/Yaru/apps/bash.png
themes/Yaru/apps/calc.png
themes/Yaru/apps/chrome.png
themes/Yaru/apps/gedit.png
themes/Yaru/apps/gnome-control-center.png
themes/Yaru/apps/spotify.png
themes/Yaru/apps/vscode.png
themes/Yaru/apps/x.avif
```

Status icon references include:

```text
themes/Yaru/status/about.svg
themes/Yaru/status/arrow-up-right.svg
themes/Yaru/status/audio-headphones-symbolic.svg
themes/Yaru/status/audio-volume-medium-symbolic.svg
themes/Yaru/status/battery-good-symbolic.svg
themes/Yaru/status/bluetooth-symbolic.svg
themes/Yaru/status/changes-prevent-symbolic.svg
themes/Yaru/status/chrome_home.svg
themes/Yaru/status/chrome_refresh.svg
themes/Yaru/status/cof_orange_hex.svg
themes/Yaru/status/display-brightness-symbolic.svg
themes/Yaru/status/download.svg
themes/Yaru/status/education.svg
themes/Yaru/status/emblem-system-symbolic.svg
themes/Yaru/status/network-wireless-signal-good-symbolic.svg
themes/Yaru/status/power-button.svg
themes/Yaru/status/process-working-symbolic.svg
themes/Yaru/status/projects.svg
themes/Yaru/status/skills.svg
themes/Yaru/status/system-shutdown-symbolic.svg
themes/Yaru/status/ubuntu_white_hex.svg
themes/Yaru/status/user-trash-symbolic.svg
```

System icon references include:

```text
themes/Yaru/system/folder.png
themes/Yaru/system/user-home.png
themes/Yaru/system/user-trash-full.png
themes/Yaru/system/view-app-grid-symbolic.svg
```

Window icon references include:

```text
themes/Yaru/window/window-close-symbolic.svg
themes/Yaru/window/window-maximize-symbolic.svg
themes/Yaru/window/window-minimize-symbolic.svg
themes/Yaru/window/window-restore-symbolic.svg
```

For your original version, use a consistent icon family.

Possible icon directions:

- Custom SVG line icons.
- Monochrome terminal glyphs.
- Abstract signal icons.
- Hand-drawn studio icons.
- Industrial control-room icons.

## External badge assets

The reference skill section uses shields.io badges.

Observed badge families include:

```text
Linux
Bash
Cloudflare
Docker
GCP
Git
Grafana
Kubernetes
Nginx
Prometheus
Python
SaltStack
Terraform
Azure
Akamai
Ansible
```

For your version, badges can be generated from your own skill data.

Avoid showing technologies only because they look attractive.

Show tools you can explain.

## External embeds

The reference app embeds:

```text
https://github1s.com/Yoshik18/Github-Finder/blob/master/src/App.js
```

The reference app embeds:

```text
https://open.spotify.com/embed/playlist/37i9dQZEVXbLZ52XmnySJg
```

The reference app uses external project links.

For your site, external embeds should be configured in data rather than hard-coded throughout components.

Example:

```ts
const externalApps = {
  code: {
    provider: "github1s",
    url: "https://github1s.com/your-handle/your-repo/blob/main/src/App.tsx"
  },
  music: {
    provider: "spotify",
    url: "https://open.spotify.com/embed/playlist/your-playlist"
  }
};
```

## Data and UI separation

The reference compiles much of its personal content into the page bundle.

Your version should separate content from UI.

Recommended structure:

```text
src/data/profile.ts
src/data/education.ts
src/data/skills.ts
src/data/projects.ts
src/data/apps.ts
src/data/links.ts
```

This lets you change your identity without rewriting the window system.

## Recommended project architecture

```text
studio-portfolio/
  app/
    page.tsx
    classic/page.tsx
    studio/page.tsx
    research/page.tsx
    globals.css
    layout.tsx
  components/
    outer-shell/
      StudioScene.tsx
      MonitorSurface.tsx
      BootScreen.tsx
      LoadingOverlay.tsx
      AudioController.tsx
    desktop/
      Desktop.tsx
      TopBar.tsx
      Dock.tsx
      DesktopIcon.tsx
      Wallpaper.tsx
    windows/
      WindowManager.tsx
      WindowFrame.tsx
      WindowTitlebar.tsx
      WindowControls.tsx
      windowReducer.ts
    apps/
      MainComputerApp.tsx
      ResearchLabApp.tsx
      SignalModeApp.tsx
      ProjectsApp.tsx
      TerminalApp.tsx
      CodeApp.tsx
      CodexApp.tsx
      ClaudeApp.tsx
      TradingViewApp.tsx
      ResumeApp.tsx
      ContactApp.tsx
      SettingsApp.tsx
    classic/
      Hero.tsx
      About.tsx
      Work.tsx
      Research.tsx
      Contact.tsx
  data/
    profile.ts
    apps.ts
    projects.ts
    research.ts
    signals.ts
  public/
    icons/
    models/
    textures/
    audio/
    files/
```

## Main Computer design

The main computer is the central entry point.

Its screen should show:

- Your name.
- Your role.
- Current focus.
- One featured project.
- One featured research item.
- Buttons for Studio and Classic modes.

The main computer can open the rest of the experience.

Suggested main screen:

```text
YOUR NAME
Builder / Researcher / Engineer

I build products, experiments, and systems.

CURRENTLY
Building: ...
Researching: ...
Reading: ...

[Open Studio]
[View Work]
```

## Multi-computer design

Use multiple machines as semantic spaces.

Do not make them merely decorative.

Recommended computers:

```text
Main Computer
Research Computer
Signal Computer
Build Computer
Archive Computer
Communication Computer
```

### Main Computer

Purpose:

- Identity.
- Current work.
- First-time orientation.

### Research Computer

Purpose:

- Papers.
- Notes.
- Literature review.
- Experiments.
- Methods.

### Signal Computer

Purpose:

- Quantitative analysis.
- Data visualizations.
- Factor signals.
- Backtest summaries.
- Monitoring.

### Build Computer

Purpose:

- Projects.
- Code.
- Architecture.
- Deployments.

### Archive Computer

Purpose:

- Older work.
- Learning history.
- Retired experiments.
- Design sketches.

### Communication Computer

Purpose:

- Email.
- GitHub.
- LinkedIn.
- Contact form.

## Signal Mode

Signal Mode should be a clearly labeled research and analytics area.

It should not pretend to be a live trading platform if it is not one.

Use labels such as:

```text
DEMO SIGNAL
RESEARCH OUTPUT
HISTORICAL SAMPLE
SIMULATED DATA
NOT FINANCIAL ADVICE
```

Possible Signal Mode panels:

- Market regime overview.
- Factor exposure.
- Volatility chart.
- Correlation matrix.
- Backtest summary.
- Risk summary.
- Research notes.
- Data freshness timestamp.

Every panel should show its source or status.

## Research Lab

Research Lab can contain:

- Codex-style workspace.
- Claude-style workspace.
- Literature notes.
- Experiment log.
- Prompt notebook.
- Code snippets.
- Dataset cards.
- Method cards.
- Findings.

These should be visual representations of your workflow.

Do not expose private chat transcripts, keys, tokens, or unpublished work.

Possible Research Lab tabs:

```text
Overview
Questions
Sources
Methods
Experiments
Findings
Next steps
```

## Codex and Claude apps

The visual studio can include apps named Codex and Claude as fictional or visual workspace panels.

The apps should not claim to be official integrations unless they actually connect to an API.

Safe choices:

- Static mock workspace.
- Link to the real service in a new tab.
- Local prompt notebook.
- Publicly shareable research notes.

If connecting an API:

- Keep keys server-side.
- Use environment variables.
- Add authentication.
- Rate-limit requests.
- Avoid exposing user content.
- Explain data retention.

## TradingView app

TradingView content can be handled in three ways.

### Option one: external link

Open TradingView in a new browser tab.

This is the simplest and safest option.

### Option two: official embed

Use an official widget or embed allowed by TradingView.

Check current terms and embed requirements before publishing.

### Option three: original chart UI

Build your own charts with a chart library.

Use only data you are allowed to display.

This gives the strongest visual consistency.

## Classic portfolio fallback

The studio should have a normal route.

The normal route is important for:

- Search engines.
- Recruiters.
- Mobile users.
- Screen readers.
- Slow devices.
- Visitors who want information quickly.

The classic page should contain:

- Short hero.
- About.
- Selected work.
- Research.
- Skills.
- Resume.
- Contact.

The studio should never be the only route to your essential information.

## Original visual direction

Do not use an exact macOS clone.

Do not use an exact Windows clone.

Do not use an exact Ubuntu clone.

Do not use a fake Bloomberg identity.

Create a fictional personal studio language.

Potential names:

- StudioOS.
- Signal House.
- The Workbench.
- Orbit Desk.
- Research Room.
- Personal Command Center.

## Visual design tokens

Suggested dark palette:

```css
:root {
  --studio-bg: #080b12;
  --studio-panel: #101622;
  --studio-panel-raised: #182233;
  --studio-border: #2b3b52;
  --studio-text: #e8eef7;
  --studio-muted: #92a0b5;
  --studio-cyan: #46d9ff;
  --studio-blue: #5a8cff;
  --studio-violet: #9f7aea;
  --studio-green: #58d68d;
  --studio-amber: #ffbd5a;
  --studio-red: #ff6675;
}
```

Use one primary accent.

Use green only for positive/status indicators.

Use red only for warnings or errors.

Use chart colors consistently.

## Responsive behavior

The 3D desktop should not be desktop-only.

On mobile:

- Replace the full room with a compact app launcher.
- Show one screen at a time.
- Use normal vertical navigation.
- Keep all content accessible.
- Disable heavy 3D if performance is poor.

Use feature detection:

```js
const supportsWebGL = Boolean(
  document.createElement("canvas").getContext("webgl")
);
```

Use a reduced-motion preference:

```js
const reducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;
```

## Performance plan

Load the classic route quickly.

Lazy-load the 3D shell.

Lazy-load heavy models.

Compress textures.

Use compressed GLB models.

Use lower-resolution textures on mobile.

Pause animation when the tab is hidden.

Pause ambience when the studio is inactive.

Avoid rendering unnecessary monitors outside the viewport.

Use a loading progress UI.

Provide a skip option.

## Asset replacement map

Reference asset:

```text
computer_setup.glb
```

Your replacement:

```text
your-main-computer.glb
```

Reference asset:

```text
environment.glb
```

Your replacement:

```text
your-studio-room.glb
```

Reference asset:

```text
decor.glb
```

Your replacement:

```text
your-desk-props.glb
```

Reference asset:

```text
office.mp3
```

Your replacement:

```text
your-ambient-loop.mp3
```

Reference asset:

```text
startup.mp3
```

Your replacement:

```text
studio-boot.mp3
```

Reference asset:

```text
themes/Yaru/
```

Your replacement:

```text
icons/studio/
```

## Suggested original asset set

Create or license:

- One main computer model.
- Two or three secondary computer models.
- One desk model.
- One room or background environment.
- Monitor bezel textures.
- Screen glow overlay.
- Dust/smudge overlay.
- Keyboard click sounds.
- Mouse click sounds.
- Boot sound.
- Ambient loop.
- App icons.
- Section icons.
- Project thumbnails.
- Profile illustration.
- Resume PDF.

## Implementation sequence

### Step 1

Create the project repository.

### Step 2

Create the classic portfolio route.

### Step 3

Create shared profile, project, and skill data.

### Step 4

Create the desktop shell using CSS only.

### Step 5

Create the reusable window manager.

### Step 6

Create the Main Computer app.

### Step 7

Create Projects, Research Lab, and Signal Mode apps.

### Step 8

Create Terminal, Contact, Resume, and Code apps.

### Step 9

Add external links and safe embeds.

### Step 10

Add settings, background themes, and reduced motion.

### Step 11

Add audio after user interaction.

### Step 12

Add a 2D multi-monitor scene.

### Step 13

Add the Three.js shell.

### Step 14

Optimize models and textures.

### Step 15

Test fallback modes.

### Step 16

Deploy to Vercel.

## Example app component

```tsx
"use client";

export function ResearchLabApp() {
  return (
    <section className="research-lab">
      <header className="research-header">
        <span className="status-dot" />
        <h1>Research Lab</h1>
        <span className="status-label">LOCAL WORKSPACE</span>
      </header>

      <nav className="research-tabs" aria-label="Research sections">
        <button>Overview</button>
        <button>Questions</button>
        <button>Sources</button>
        <button>Experiments</button>
        <button>Findings</button>
      </nav>

      <main className="research-grid">
        <article className="research-card">
          <span>ACTIVE QUESTION</span>
          <h2>What am I exploring?</h2>
          <p>Replace this with your current research question.</p>
        </article>
      </main>
    </section>
  );
}
```

## Example Signal Mode component

```tsx
"use client";

export function SignalModeApp() {
  return (
    <section className="signal-mode">
      <header>
        <span>Signal Mode</span>
        <span>DEMO DATA</span>
      </header>

      <div className="signal-grid">
        <div className="signal-card">
          <span>REGIME</span>
          <strong>Research sample</strong>
        </div>
        <div className="signal-card">
          <span>VOLATILITY</span>
          <strong>Illustrative</strong>
        </div>
        <div className="signal-card">
          <span>LAST UPDATED</span>
          <strong>Not connected</strong>
        </div>
      </div>
    </section>
  );
}
```

## Example iframe screen

```tsx
export function EmbeddedScreen({ src, title }: Props) {
  return (
    <iframe
      src={src}
      title={title}
      loading="lazy"
      referrerPolicy="no-referrer"
      className="h-full w-full border-0"
    />
  );
}
```

Use iframes only for sources you trust.

## Example 3D model loader

```tsx
import { useGLTF } from "@react-three/drei";

export function StudioComputer() {
  const { scene } = useGLTF("/models/your-computer.glb");

  return (
    <primitive
      object={scene}
      position={[0, 0, 0]}
      scale={1}
    />
  );
}
```

Preload only the models needed for the first view.

## Example boot state machine

```ts
type BootState =
  | "loading"
  | "ready"
  | "start"
  | "desktop";
```

The transition logic should be:

```text
loading → ready
ready → start
start → desktop
```

Allow:

```text
Enter → desktop
Space → desktop
Escape → skip animation
```

## Example audio controller

```ts
export class AudioController {
  private started = false;

  async start() {
    if (this.started) return;
    this.started = true;
    // Start only after a user gesture.
  }

  playClick() {
    if (!this.started) return;
    // Play a short click effect.
  }

  stop() {
    // Pause ambience and release resources.
  }
}
```

## What not to copy

Do not copy the reference person’s:

- Name.
- Biography.
- Role description.
- Education history.
- Employers.
- Resume.
- Project descriptions.
- GitHub repositories.
- Social links.
- Playlist.
- Personal illustration.
- Exact branding.

Do not publish their personal PDF.

Do not hard-code their external URLs.

Do not leave their analytics IDs in your deployment.

Do not ship their compiled bundle as your app.

## What to learn from the reference

Learn the separation between physical scene and screen content.

Learn the app registry pattern.

Learn the reusable window manager pattern.

Learn data-driven project rendering.

Learn how to make a portfolio feel like an environment.

Learn how to provide normal navigation inside an unusual interface.

Learn how to combine external embeds with original UI.

Learn how sound and loading feedback create atmosphere.

## Proposed app set for your version

```text
Main Computer
Research Lab
Signal Mode
Projects
Terminal
Code
Codex Workspace
Claude Workspace
TradingView
Notebook
Archive
Resume
Contact
Settings
```

## Proposed desktop dock

```text
Main Computer
Research Lab
Signal Mode
Projects
Code
Terminal
Music
Settings
```

## Proposed desktop shortcuts

```text
Research Lab
Signal Mode
Projects
Contact
Archive
```

## Proposed route structure

```text
/
/classic
/studio
/studio/research
/studio/signal
/projects
/projects/[slug]
/writing
/resume
/contact
```

## Proposed first-time experience

1. User lands on a normal fast shell.
2. A short boot card appears.
3. User sees a clear title and Start Studio button.
4. User can choose Classic Portfolio.
5. Studio loads the main computer first.
6. Other computers load progressively.
7. Audio remains muted until enabled.
8. A help hint explains the interface.
9. Essential content remains available through the dock.
10. The user can exit back to Classic mode.

## Help overlay

Add a small `?` help control.

Show:

```text
Click a computer to open it.
Drag a window by its titlebar.
Use the dock to restore apps.
Press Escape to close overlays.
Use Classic Portfolio for a fast overview.
```

## Accessibility requirements

All desktop icons must be keyboard focusable.

All app buttons must have accessible names.

Every window must have a visible title.

Focus must move into a newly opened modal-like window.

Escape should close or minimize the active overlay.

Screen readers must have access to the classic route.

Do not hide content only behind canvas pixels.

Do not use color as the only state indicator.

Provide captions or labels for audio controls.

Provide reduced-motion behavior.

## Security requirements

Never expose API keys in client JavaScript.

Never expose private research notes.

Never load arbitrary user-provided iframe URLs.

Use an allowlist for external embeds.

Use `rel="noopener noreferrer"` for new tabs.

Use a Content Security Policy where practical.

Avoid arbitrary code execution in the terminal.

Avoid `eval` for the calculator.

Do not persist sensitive data in localStorage.

Do not store access tokens in browser state.

## Testing plan

Test the classic route.

Test the studio route.

Test boot skip.

Test keyboard navigation.

Test opening each app.

Test closing each app.

Test minimizing each app.

Test maximizing each app.

Test restoring each app.

Test dragging windows.

Test resizing windows.

Test opening multiple windows.

Test z-index focus.

Test mobile layout.

Test WebGL fallback.

Test reduced motion.

Test audio permission behavior.

Test external links.

Test PDF loading.

Test refresh persistence.

Test slow network loading.

Test browser back behavior.

Test Safari.

Test Chrome.

Test Firefox.

Test iPhone Safari.

Test Android Chrome.

## Deployment plan

Use GitHub for source control.

Use Vercel or another static/Next.js host.

Build the classic route first.

Deploy a preview.

Test the preview on desktop.

Test the preview on mobile.

Add the 3D shell behind a feature flag.

Monitor bundle size.

Compress large models.

Deploy the studio mode after the fallback is reliable.

## Suggested milestones

### Milestone one: content

Deliver:

- Profile data.
- Project data.
- Research data.
- Contact data.
- Classic portfolio.

### Milestone two: desktop

Deliver:

- Desktop background.
- App icons.
- Dock.
- Window frame.
- Main Computer app.

### Milestone three: interaction

Deliver:

- Dragging.
- Resizing.
- Focusing.
- Minimize.
- Maximize.
- Restore.
- Close.

### Milestone four: research apps

Deliver:

- Research Lab.
- Signal Mode.
- Terminal.
- Notebook.
- Code viewer.

### Milestone five: scene

Deliver:

- Main computer model.
- Monitor overlay.
- Desk environment.
- Camera interaction.
- Audio.

### Milestone six: polish

Deliver:

- Loading UI.
- Help overlay.
- Accessibility.
- Mobile fallback.
- Performance optimization.

## Final recommendation

Build on the interaction architecture, not on the reference person’s files.

Start with a fresh project.

Build the normal portfolio.

Build the desktop in CSS.

Add the window manager.

Add Research Lab and Signal Mode.

Add the multi-computer composition.

Add Three.js only after the content and interactions work.

Make the studio your main visual identity.

Keep the classic portfolio available at all times.

Use your own models, icons, sounds, copy, projects, and data.

Treat quant screens as research presentation surfaces unless you have real authorized live data.

Treat Codex, Claude, and TradingView panels as links or carefully bounded embeds.

The core reusable system is:

```text
3D shell
  → monitor overlay
    → desktop
      → app registry
        → window manager
          → personal apps
            → personal data
```

That is the complete build model.
