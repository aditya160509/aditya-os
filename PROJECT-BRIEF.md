# Personal Studio Portfolio — project brief

## Core decision

Make the interactive studio the main experience. Make the normal personal website the accessibility, mobile, SEO, and fast-loading fallback.

The studio should feel like a place where the visitor can discover your work, not like a literal copy of macOS, Windows, Ubuntu, Bloomberg, or another person’s portfolio.

Working concept names:

- StudioOS
- Personal Command Center
- Signal House
- The Workbench
- Orbit Desk
- Research Room

## What the screenshots suggest

The visual direction has:

- A dark browser-friendly palette.
- Several monitors rather than one laptop screen.
- Cool blue/teal chart colors with a few warm accent lights.
- Dense but intentional information surfaces.
- A “real workstation” feeling: screens, terminals, dashboards, notes, research, and media.
- A quant/research flavor that can be expressed through abstract market terminals without presenting fake financial advice or pretending that a demo dashboard is live trading data.

## Two-version product structure

### Version 1: Studio mode — primary

Route: `/studio`

This is the memorable version. It can include:

- 3D or illustrated workstation.
- Multiple monitors.
- Clickable computers and terminals.
- Research console.
- Project browser.
- Writing/notes terminal.
- Data visualization screen.
- Music or ambient sound panel.
- Personal “system status” panel.
- Contact and social apps.

### Version 2: Normal mode — fallback

Route: `/` or `/classic`

This is a polished, fast, conventional portfolio with:

- Hero section.
- Selected work.
- About.
- Skills.
- Experience/education.
- Resume.
- Contact.

Add a visible `Enter Studio` button from the normal site and a `View Classic Portfolio` link inside the studio. Do not force visitors to understand the desktop interface.

## Direction options

### Option A — Personal Workbench (recommended)

One large desk with three to five screens:

1. Main screen: your introduction and featured work.
2. Research screen: notes, reading, experiments, or case studies.
3. Terminal screen: commands that reveal projects and skills.
4. Data screen: abstract charts or project metrics.
5. Side screen: music, contact, or currently exploring.

Why it works: personal, flexible, and easier to keep coherent than a giant fake trading floor.

### Option B — Quant Research Lab

Use a darker command-center visual language:

- Market-style charts.
- Backtest cards.
- Research notebooks.
- Data pipelines.
- Model monitoring.
- Risk and performance panels.

Use clearly labeled fictional/demo data unless you have a real data source. This option is strong if your identity is genuinely connected to quant research, markets, analytics, or engineering.

### Option C — Multi-Computer Studio

Make each computer represent a different part of your identity:

- Research machine.
- Build machine.
- Creative machine.
- Archive machine.
- Communication machine.

Visitors click between computers and discover your work spatially. This matches the supplied workstation references and is more distinctive than a normal desktop clone.

### Option D — Personal Operating System

Create a fictional OS with its own vocabulary:

- Home screen: `Desk`.
- Projects: `Builds`.
- About: `Identity`.
- Resume: `Credentials`.
- Contact: `Open Channel`.
- Music: `Atmosphere`.

This has the strongest branding potential and avoids the “another macOS portfolio” problem.

### Option E — Research Archive

Treat the site as a digital archive:

- Desktop folders become topics.
- Windows become essays or case studies.
- Terminal commands reveal timelines.
- Screenshots, papers, prototypes, and experiments are the content.

This is best if you want the site to communicate curiosity and depth rather than just list skills.

## Recommendation

Use Option A as the base and borrow the best parts of Options B and D:

> A personal research workbench with multiple monitors, a small quant-style analytics screen, and a fictional studio operating system.

Avoid:

- An exact macOS clone.
- An exact Windows clone.
- A fake Bloomberg terminal.
- Too many screens with no story.
- Autoplay sound.
- Making visitors hunt for basic contact information.

## Suggested first screen

The visitor sees a quiet dark studio with three monitors:

### Main monitor — identity

```text
YOUR NAME
Builder / Researcher / Designer

I build systems, experiments, and products.

[Enter Studio] [View Classic Portfolio]
```

### Left monitor — current signal

```text
NOW
Building: PROJECT NAME
Reading: TOPIC
Exploring: TOPIC
```

### Right monitor — system index

```text
[WORK] [RESEARCH] [WRITING] [ABOUT] [CONTACT]
```

## App ideas for your studio

Start with 6–8 apps, then expand:

1. **Command Center** — overview and featured work.
2. **Builds** — projects with screenshots, links, and technical notes.
3. **Research Lab** — experiments, papers, models, and findings.
4. **Terminal** — typed commands such as `help`, `work`, `about`, and `contact`.
5. **Signal Board** — charts, metrics, or live APIs if genuinely useful.
6. **Notebook** — essays, ideas, and learning notes.
7. **Archive** — older projects and previous versions.
8. **Open Channel** — email, LinkedIn, GitHub, and contact form.

Optional later apps:

- Media player.
- Calendar.
- Reading list.
- Interactive résumé timeline.
- 3D asset viewer.
- Live build/deployment monitor.
- Small games or experiments.

## Technical project plan

### Milestone 1 — project foundation

- Create a GitHub repository.
- Build the classic portfolio route.
- Add your personal content model.
- Add responsive layout and SEO.

### Milestone 2 — studio shell

- Add the `/studio` route.
- Build the monitor layout with CSS first.
- Add keyboard navigation and a skip-to-content option.
- Make every screen usable on a small laptop.

### Milestone 3 — apps and windows

- Add reusable windows.
- Add projects, research, terminal, notebook, and contact apps.
- Add app focus, minimize, close, and restore.

### Milestone 4 — visual depth

- Add monitor glow and subtle lighting.
- Add optional 3D scene or illustrated workstation.
- Add sound only after a user gesture.
- Add reduced-motion mode.

### Milestone 5 — polish and deployment

- Test Safari, Chrome, Firefox, mobile Safari, and Android Chrome.
- Keep classic mode fast and fully usable.
- Deploy to Vercel.
- Add analytics only with a clear privacy decision.

## The Mac question

The site can be developed on your Mac and still run everywhere. The design does not need to be Mac-like.

My recommendation is:

- Use Mac as the development environment.
- Use a fictional studio OS for the visual identity.
- Keep the classic site as a normal web page.
- Make the studio interface feel like your world, not like an operating-system advertisement.

## Information needed before implementation

- Your name and title.
- One-sentence positioning statement.
- About paragraph.
- 3–6 projects.
- Skills and tools.
- Education and experience.
- Resume link or PDF.
- Social/contact links.
- Current project or “now” status.
- Whether quant/research is part of your real identity or only a visual theme.
- Preferred visual mood: calm, cyberpunk, editorial, technical, warm studio, or minimal.
