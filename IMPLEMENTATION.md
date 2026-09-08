# How to build your own version

## 1. What the reference site actually contains

The experience has two layers:

1. A 3D computer shell at `yoshik-pc.vercel.app`.
2. A web portfolio rendered inside the monitor as an iframe from `yoshik-portfolio.vercel.app`.

The outer shell provides the boot sequence, computer model, monitor, desk, atmosphere, keyboard/mouse audio, and the iframe screen. The inner app provides the Ubuntu-style desktop, windows, navigation, portfolio sections, and external app embeds.

## 2. Recommended stack

### Inner portfolio

- Next.js or Vite + React
- Tailwind CSS or CSS Modules
- React state for open windows, active window, minimized windows, and active section
- `react-rnd` or pointer events for draggable/resizable windows
- Local JSON/JavaScript data for profile, education, skills, projects, and songs

### Outer shell

- Three.js
- React Three Fiber, or vanilla Three.js if you prefer direct control
- GLTFLoader for `.glb` models
- HTML/CSS overlay for the monitor iframe
- Web Audio / HTML Audio for boot and interaction effects

## 3. Build order

### Phase A — personal content website

Create these sections first:

- About
- Education
- Skills
- Projects
- Resume
- Contact

Use your own content model:

```js
export const profile = {
  name: "Your Name",
  role: "Your Role",
  summary: "A short introduction.",
  email: "you@example.com",
  links: {
    github: "https://github.com/your-handle",
    linkedin: "https://linkedin.com/in/your-handle"
  }
};
```

```js
export const projects = [
  {
    name: "Project Name",
    date: "2026",
    link: "https://example.com",
    description: [
      "What it does.",
      "What you built and learned."
    ],
    technologies: ["React", "Node.js"]
  }
];
```

### Phase B — desktop interface

Create a desktop component with:

- Top bar with activity/menu label, time, network, sound, and battery icons.
- Desktop wallpaper or background.
- Icon grid.
- Taskbar or dock.
- Window manager.
- Mobile fallback that switches to a normal navigation layout.

Example app registry:

```js
const apps = [
  { id: "about", title: "About Me", component: AboutWindow },
  { id: "education", title: "Education", component: EducationWindow },
  { id: "skills", title: "Skills", component: SkillsWindow },
  { id: "projects", title: "Projects", component: ProjectsWindow },
  { id: "resume", title: "Resume", component: ResumeWindow },
  { id: "contact", title: "Contact Me", component: ContactWindow },
  { id: "music", title: "Music", component: MusicWindow }
];
```

Window state should include:

```js
{
  id: "projects",
  isOpen: true,
  isMinimized: false,
  zIndex: 12,
  position: { x: 120, y: 80 },
  size: { width: 720, height: 520 }
}
```

Use semantic controls and keyboard support. Every window should have close, minimize, and focus behavior. Do not depend on fixed coordinates.

### Phase C — boot screen

Make a boot component with these states:

```text
loading → bios → start-screen → desktop
```

Show fake loading messages for atmosphere, but allow users to skip the animation. A good implementation includes:

- Start button
- Enter/Space keyboard activation
- Skip button or Escape shortcut
- Reduced-motion mode
- A short startup sound only after user interaction

### Phase D — 3D shell

The reference shell uses a computer setup model, a desk/decor model, an environment model, baked textures, a monitor surface, and an HTML iframe attached to the monitor.

Basic layout:

```jsx
<Canvas camera={{ position: [0, 1.4, 4] }}>
  <ambientLight intensity={0.5} />
  <ComputerModel />
  <DeskDecor />
  <Environment />
</Canvas>

<div className="monitor-screen">
  <iframe src="/desktop" title="Your portfolio desktop" />
</div>
```

For your original version, use a new computer/desk model or create a stylized low-poly scene. Do not rely on the reference person's downloaded models in production unless you have permission.

## 4. Reference interaction details

The observed experience includes:

- BIOS-style text and loading percentages.
- A centered portfolio start panel.
- A simulated Ubuntu desktop.
- Top status bar.
- Desktop icons for About, Trash, Contact, and a social/external app.
- Portfolio navigation for About, Education, Skills, Projects, and Resume.
- A project view with dates, descriptions, technology tags, and external links.
- A Visual Studio Code window backed by GitHub1s.
- A Spotify window backed by an embedded playlist.
- A Contact Me editor-style window.
- A browser-like Google Chrome window.
- Terminal, calculator, settings, and trash apps.
- Window focus, minimize, maximize, close, and taskbar behavior.

## 5. Mac version or Ubuntu version?

You do not need to make it Mac-specific. The reference is intentionally Ubuntu/Linux themed, but the website itself can run on Mac, Windows, Linux, iPhone, and Android because it is a web app.

### Best choice for you

Build a fictional “personal operating system” instead of copying Ubuntu or macOS exactly. For example:

- `YourOS`
- `StudioOS`
- `DevDesk`
- `Orbit Desktop`

Use a neutral visual language: dark window chrome, custom icons, your colors, and your own boot screen. This gives you the same memorable interaction without tying the portfolio to someone else’s identity.

### Difficulty

- Normal portfolio: easy to medium.
- Draggable desktop windows: medium.
- Embedded apps and audio player: medium.
- 3D computer scene: advanced.
- Polished responsive 3D scene with good performance: advanced.

Recommended timeline for one developer:

1. Content website: 1–3 days.
2. Desktop/window system: 2–5 days.
3. App embeds and music: 1–2 days.
4. 3D shell and polish: 1–3 weeks depending on modeling experience.

## 6. Mac-specific guidance

If you want a Mac flavor, use visual inspiration such as:

- A custom dock.
- Finder-like windows.
- A menu bar.
- A terminal app.
- A personal “About This Mac” panel.

Avoid reproducing Apple logos, exact system icons, or a deceptive copy of macOS. A custom desktop OS is easier to brand and more legally/visually distinct.

## 7. Hosting

The easiest deployment is Vercel:

1. Put the project in GitHub.
2. Import it into Vercel.
3. Configure `public/` assets.
4. Add environment variables only if an API is needed.
5. Test desktop, tablet, and mobile layouts.

Do not autoplay audio before a user gesture. Browsers usually block it. Start music and sound effects after clicking the boot/start control.

## 8. Production checklist

- Replace every reference name, email, social link, project, resume, song, and image.
- Optimize `.glb`, texture, and audio sizes.
- Add a no-WebGL fallback.
- Add reduced-motion support.
- Make every important action keyboard accessible.
- Test on Safari, Chrome, Firefox, mobile Safari, and Android Chrome.
- Add SEO metadata and a normal mobile navigation path.
- Use licensed or self-created audio and 3D assets.
- Never make the 3D animation the only way to reach your content.
