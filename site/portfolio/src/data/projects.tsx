import AceTernityLogo from "@/components/logos/aceternity";
import SlideShow from "@/components/slide-show";
import { Button } from "@/components/ui/button";
import { TypographyH3, TypographyP } from "@/components/ui/typography";
import { ArrowUpRight, ExternalLink, Link2, MoveUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";
// Spline has no thesvg entry — keep the Three.js mark as its stand-in.
import { SiThreedotjs } from "react-icons/si";
const BASE_PATH = "/portfolio/assets/projects-screenshots";
// Loops rendered for the original product sites, re-encoded to 960p/24fps for
// the card previews and self-hosted so nothing depends on the CDN they came from.
const VIDEO_PATH = "/portfolio/assets/projects-video";

// Renders a brand SVG from /public as a monochrome glyph that inherits the
// surrounding text color (the skill dock styles every icon via currentColor),
// so full-color marks like Mistral flatten to match the rest of the set.
const MaskIcon = ({ src, title }: { src: string; title?: string }) => (
  <span
    role="img"
    aria-label={title}
    className="block bg-current"
    style={{
      width: "1em",
      height: "1em",
      WebkitMaskImage: `url(${src})`,
      maskImage: `url(${src})`,
      WebkitMaskRepeat: "no-repeat",
      maskRepeat: "no-repeat",
      WebkitMaskPosition: "center",
      maskPosition: "center",
      WebkitMaskSize: "contain",
      maskSize: "contain",
    }}
  />
);

const ProjectsLinks = ({ live, repo }: { live?: string; repo?: string }) => {
  return (
    <div className="flex flex-col md:flex-row items-center justify-start gap-3 my-3 mb-8">
      {live && live !== "#" && (
        <Link
          className="font-mono underline flex gap-2"
          rel="noopener"
          target="_new"
          href={live}
        >
          <Button variant={"default"} size={"sm"}>
            Visit Website
            <ArrowUpRight className="ml-3 w-5 h-5" />
          </Button>
        </Link>
      )}
      {repo && repo !== "#" && (
        <Link
          className="font-mono underline flex gap-2"
          rel="noopener"
          target="_new"
          href={repo}
        >
          <Button variant={"default"} size={"sm"}>
            Github
            <ArrowUpRight className="ml-3 w-5 h-5" />
          </Button>
        </Link>
      )}
    </div>
  );
};

export type Skill = {
  title: string;
  bg: string;
  fg: string;
  icon: ReactNode;
};
// Brand chips sourced from thesvg CLI mono SVGs in /public/assets/logos,
// rendered via MaskIcon so each one inherits the dock's currentColor.
const brand = (title: string, file: string): Skill => ({
  title,
  bg: "black",
  fg: "white",
  icon: <MaskIcon src={`/portfolio/assets/logos/${file}`} title={title} />,
});
const PROJECT_SKILLS = {
  next: brand("Next.js", "nextdotjs-mono.svg"),
  chakra: brand("Chakra UI", "chakra-ui-mono.svg"),
  node: brand("Node.js", "nodedotjs-mono.svg"),
  python: brand("Python", "python-mono.svg"),
  prisma: brand("Prisma", "prisma-mono.svg"),
  postgres: brand("PostgreSQL", "postgresql-mono.svg"),
  mongo: brand("MongoDB", "mongodb-mono.svg"),
  express: brand("Express", "express-mono.svg"),
  reactQuery: brand("React Query", "react-query-mono.svg"),
  shadcn: brand("shadcn/ui", "shadcn-ui-mono.svg"),
  // Not in the thesvg registry — keep the existing custom logo.
  aceternity: {
    title: "Aceternity",
    bg: "black",
    fg: "white",
    icon: <AceTernityLogo />,
  },
  tailwind: brand("Tailwind", "tailwind-css-mono.svg"),
  docker: brand("Docker", "docker-mono.svg"),
  // Not in the thesvg registry — keep the text mark.
  yjs: {
    title: "Y.js",
    bg: "black",
    fg: "white",
    icon: (
      <span>
        <strong>Y</strong>js
      </span>
    ),
  },
  firebase: brand("Firebase", "firebase-mono.svg"),
  sockerio: brand("Socket.io", "socketdotio-mono.svg"),
  js: brand("JavaScript", "javascript-mono.svg"),
  ts: brand("TypeScript", "typescript-mono.svg"),
  vue: brand("Vue.js", "vuedotjs-mono.svg"),
  react: brand("React.js", "react-mono.svg"),
  sanity: brand("Sanity", "sanity-mono.svg"),
  // Not in the thesvg registry — keep the Three.js stand-in.
  spline: {
    title: "Spline",
    bg: "black",
    fg: "white",
    icon: <SiThreedotjs />,
  },
  gsap: brand("GSAP", "gsap-mono.svg"),
  motion: brand("Motion", "motion.svg"),
  supabase: brand("Supabase", "supabase-mono.svg"),
  trpc: brand("tRPC", "trpc-mono.svg"),
  drizzle: brand("Drizzle ORM", "drizzle-mono.svg"),
  hono: brand("Hono", "hono-mono.svg"),
  redis: brand("Redis / BullMQ", "redis-mono.svg"),
  cloudflare: brand("Cloudflare", "cloudflare-mono.svg"),
  // React Native reuses the React mark.
  reactNative: brand("React Native", "react-mono.svg"),
  betterAuth: brand("Better Auth", "better-auth-mono.svg"),
  // Not in the thesvg registry — keep the text marks.
  zustand: {
    title: "Zustand",
    bg: "black",
    fg: "white",
    icon: <span className="text-xs font-bold">Zu</span>,
  },
  partykit: {
    title: "PartyKit",
    bg: "black",
    fg: "white",
    icon: <span className="text-base">🎈</span>,
  },
  hocuspocus: {
    title: "Hocuspocus",
    bg: "black",
    fg: "white",
    icon: <span className="text-xs font-bold">Hp</span>,
  },
  // React Flow ships under the xyflow brand.
  reactFlow: brand("React Flow", "xyflow-mono.svg"),
  codemirror: brand("CodeMirror", "codemirror-mono.svg"),
  // "Satori / sharp" — uses the sharp mark.
  satori: brand("Satori / sharp", "sharp-mono.svg"),
  turborepo: brand("Turborepo", "turborepo-mono.svg"),
  // Vercel AI SDK uses the Vercel mark.
  aiSDK: brand("Vercel AI SDK", "vercel-mono.svg"),
  anthropic: brand("Anthropic Claude", "anthropic-mono.svg"),
  mistral: brand("Mistral AI", "mistral-ai-mono.svg"),
  // Not in the thesvg registry — keep the text mark.
  nextIntl: {
    title: "next-intl",
    bg: "black",
    fg: "white",
    icon: <span className="text-xs font-bold">i18n</span>,
  },
  // Not in the thesvg registry — keep the text marks.
  expo: {
    title: "Expo",
    bg: "black",
    fg: "white",
    icon: <span className="text-xs font-bold">Expo</span>,
  },
  mcp: {
    title: "MCP",
    bg: "black",
    fg: "white",
    icon: <span className="text-xs font-bold">MCP</span>,
  },
};
export type Project = {
  id: string;
  category: string;
  title: string;
  src: string;
  screenshots: string[];
  /** Optional looping preview shown on the card instead of the still. */
  video?: string;
  skills: { frontend: Skill[]; backend: Skill[] };
  content: React.ReactNode | any;
  github?: string;
  live: string;
};
const projects: Project[] = [
  {
    id: "atlas",
    category: "Quantitative research platform",
    title: "ATLAS · QUANT360",
    src: `${VIDEO_PATH}/atlas.jpg`,
    video: `${VIDEO_PATH}/atlas.mp4`,
    screenshots: ["landing.png"],
    skills: {
      frontend: [PROJECT_SKILLS.next, PROJECT_SKILLS.ts, PROJECT_SKILLS.react, PROJECT_SKILLS.tailwind],
      backend: [PROJECT_SKILLS.python, PROJECT_SKILLS.postgres, PROJECT_SKILLS.docker],
    },
    live: "/projects/atlas",
    get content() {
      return (
        <div>
          <TypographyP className="font-mono text-2xl text-center">
            An institutional-grade quant research platform, built solo — and used
            by someone else for real analysis.
          </TypographyP>
          <TypographyP className="font-mono">
            Eight modules: Regime, Research, Screener, ML, Volatility, Factor, PCA
            and Portfolio. The Research module carries causal identification
            engines for Callaway–Sant&apos;Anna difference-in-differences,
            regression discontinuity, instrumental variables and event studies.
          </TypographyP>
          <TypographyH3 className="my-4 mt-8">Volatility and machine learning</TypographyH3>
          <p className="font-mono mb-2">
            Nine volatility features spanning HAR-RV, the full GARCH family,
            statistical jump models and Diebold–Yilmaz connectedness. Twelve ML
            features including combinatorial purged cross-validation with the
            deflated Sharpe ratio, Double ML causal decomposition, meta-labelling
            and hierarchical risk parity.
          </p>
          <TypographyH3 className="my-4 mt-8">Research workflow</TypographyH3>
          <p className="font-mono mb-2">
            Point-in-time fundamentals, IC-IR weighted composite scoring, full QMJ
            factor construction and a reproducible data workflow built from
            public market sources. Core analytics were vectorised so a research
            question can move from data to a testable portfolio in one workspace.
          </p>
        </div>
      );
    },
  },
  {
    id: "nexus",
    category: "Agent-based simulation",
    title: "NEXUS Exchange",
    src: `${VIDEO_PATH}/nexus.jpg`,
    video: `${VIDEO_PATH}/nexus.mp4`,
    screenshots: ["landing.png"],
    skills: {
      frontend: [PROJECT_SKILLS.ts, PROJECT_SKILLS.react],
      backend: [PROJECT_SKILLS.python, PROJECT_SKILLS.docker, PROJECT_SKILLS.postgres],
    },
    live: "/projects/nexus",
    get content() {
      return (
        <div>
          <TypographyP className="font-mono text-2xl text-center">
            Nine behaviourally distinct trader archetypes, 10,200 Monte Carlo
            runs, and a threshold that matched the empirical one.
          </TypographyP>
          <TypographyP className="font-mono">
            Numba JIT and multiprocessing drive the simulation; Simulated Method
            of Moments recovers γ* = 1.5625 — independently corroborating the
            GASI paper through an entirely separate methodology.
          </TypographyP>
          <TypographyH3 className="my-4 mt-8">Validation</TypographyH3>
          <p className="font-mono mb-2">
            All nine canonical market stylised facts validated under jump-filtered
            ARCH-LM testing following Andersen–Bollerslev–Diebold (2007): fat
            tails, volatility clustering, autocorrelation structure.
          </p>
          <TypographyH3 className="my-4 mt-8">Architecture</TypographyH3>
          <p className="font-mono mb-2">
            Five tiers, including an adversarial reinforcement-learning market
            maker trained with PPO, a liquidity-fragility predictor built on
            XGBoost and LSTM, and a FastAPI inference server. The agentic
            architecture is written up in a paper on SSRN.
          </p>
        </div>
      );
    },
  },
  {
    id: "glassbox",
    category: "Autonomous agent",
    title: "Glassbox SRE",
    src: `${VIDEO_PATH}/glassbox.jpg`,
    video: `${VIDEO_PATH}/glassbox.mp4`,
    screenshots: ["landing.png"],
    skills: {
      frontend: [PROJECT_SKILLS.next, PROJECT_SKILLS.react, PROJECT_SKILLS.tailwind],
      backend: [PROJECT_SKILLS.python, PROJECT_SKILLS.postgres, PROJECT_SKILLS.redis, PROJECT_SKILLS.docker],
    },
    live: "/projects/glassbox",
    get content() {
      return (
        <div>
          <TypographyP className="font-mono text-2xl text-center">
            An incident-response agent that investigates production alerts without
            a human in the loop — and scores 86.7% where naive triage gets 13.3%.
          </TypographyP>
          <TypographyP className="font-mono">
            A Prometheus/Alertmanager alert fires a FastAPI webhook into a Redis
            queue, launching a LangGraph investigation with three parallel nodes:
            commit correlation over diffs, runbook retrieval through pgvector RAG,
            and impact estimation queried straight from Prometheus.
          </TypographyP>
          <TypographyH3 className="my-4 mt-8">No invented numbers</TypographyH3>
          <p className="font-mono mb-2">
            Findings synthesise into an evidence-cited brief posted to Slack, then
            an automated postmortem stored in Postgres behind a React dashboard.
            The model never fabricates figures: impact numbers come from
            Prometheus and timelines are reconstructed from stored event
            timestamps.
          </p>
          <TypographyH3 className="my-4 mt-8">Measured, not asserted</TypographyH3>
          <p className="font-mono mb-2">
            A 15-scenario harness with ground-truth seeded commits benchmarks the
            agent against a deterministic-heuristics baseline, isolating exactly
            what the reasoning pipeline adds: 86.7% top-1 versus 13.3%.
          </p>
        </div>
      );
    },
  },
  {
    id: "daedalus",
    category: "Engineering platform",
    title: "Daedalus",
    src: `${VIDEO_PATH}/daedalus.jpg`,
    video: `${VIDEO_PATH}/daedalus.mp4`,
    screenshots: ["landing.png"],
    skills: {
      frontend: [PROJECT_SKILLS.next, PROJECT_SKILLS.ts, PROJECT_SKILLS.react, PROJECT_SKILLS.spline, PROJECT_SKILLS.tailwind],
      backend: [PROJECT_SKILLS.python, PROJECT_SKILLS.postgres],
    },
    live: "/projects/daedalus",
    get content() {
      return (
        <div>
          <TypographyP className="font-mono text-2xl text-center">
            Built solo for my STEM Racing team, and used in competition for real
            trade-off decisions — not a demo.
          </TypographyP>
          <TypographyP className="font-mono">
            An engineering execution engine with unit and dimensional validation
            and provenance tracking, design-space exploration, Monte Carlo
            sensitivity and robustness analysis, multi-objective Pareto
            optimisation, scenario comparison and equation traceability.
          </TypographyP>
          <p className="font-mono mb-2">
            Next.js, React and TypeScript on the front, Python and FastAPI behind
            it, PostgreSQL for storage and Three.js for 3D visualisation.
          </p>
        </div>
      );
    },
  },
  {
    id: "phenosync",
    category: "Climate research",
    title: "PhenoSync",
    src: `${BASE_PATH}/phenosync/landing.png`,
    screenshots: ["landing.png"],
    skills: {
      frontend: [PROJECT_SKILLS.ts, PROJECT_SKILLS.react],
      backend: [PROJECT_SKILLS.python, PROJECT_SKILLS.postgres],
    },
    live: "/projects/phenosync",
    github: "https://github.com/aditya160509/phenosync",
    get content() {
      return (
        <div>
          <TypographyP className="font-mono text-2xl text-center">
            Open-data phenological mismatch monitoring — four public datasets,
            one measurable shift.
          </TypographyP>
          <TypographyP className="font-mono">
            GBIF species occurrences, NASA MODIS land-surface temperature and
            NDVI, NOAA GHCND climate records and FAOSTAT agriculture, integrated
            into a single pipeline. OLS recovers a 4.57 days-per-year shift
            (R² = 0.83, p = 0.0003).
          </TypographyP>
          <ProjectsLinks live={this.live} repo={this.github} />
          <TypographyH3 className="my-4 mt-8">Robustness</TypographyH3>
          <p className="font-mono mb-2">
            Validated across seven frameworks — Kendall, Spearman, Mann-Kendall,
            permutation and jackknife — then extended with a PMI-severity crop
            exposure model translating mismatch into billion-dollar
            value-at-risk. Sole author from conception to manuscript; entered
            into the Oxford Saïd Business School Climate Challenge.
          </p>
        </div>
      );
    },
  },
  {
    id: "futurelab",
    category: "Simulated market",
    title: "Future Lab",
    src: `${BASE_PATH}/futurelab/landing.png`,
    screenshots: ["landing.png"],
    skills: {
      frontend: [PROJECT_SKILLS.next, PROJECT_SKILLS.ts, PROJECT_SKILLS.react, PROJECT_SKILLS.tailwind],
      backend: [PROJECT_SKILLS.postgres, PROJECT_SKILLS.python],
    },
    live: "https://future-lab-terminal.vercel.app",
    get content() {
      return (
        <div>
          <TypographyP className="font-mono text-2xl text-center">
            A market of ~150 companies across 15 industries that trades on
            fundamentals, not random noise.
          </TypographyP>
          <ProjectsLinks live={this.live} repo={this.github} />
          <TypographyP className="font-mono">
            Two engines: an Intrinsic Value engine deriving fair value from
            financial statements through five factors (management quality, moat,
            financial quality, free-cash-flow quality, growth), and a Price Driver
            engine moving price around it with seven weighted drivers including
            earnings surprise, news sentiment and institutional flow.
          </TypographyP>
          <TypographyH3 className="my-4 mt-8">Mean reversion with teeth</TypographyH3>
          <p className="font-mono mb-2">
            Price is tethered to intrinsic value by an Ornstein–Uhlenbeck process
            on the log valuation gap, so prices can drift but are structurally
            pulled back — the way real markets converge. Every weight and
            coefficient lives in the database, so the whole simulation
            recalibrates without touching code.
          </p>
        </div>
      );
    },
  },
  {
    id: "adityaos",
    category: "Interactive portfolio",
    title: "AdityaOS",
    src: `${BASE_PATH}/adityaos/landing.png`,
    screenshots: ["landing.png"],
    skills: {
      frontend: [PROJECT_SKILLS.ts, PROJECT_SKILLS.react, PROJECT_SKILLS.spline],
      backend: [PROJECT_SKILLS.node, PROJECT_SKILLS.docker],
    },
    live: "https://aditya-os.vercel.app",
    github: "https://github.com/aditya160509/aditya-os",
    get content() {
      return (
        <div>
          <TypographyP className="font-mono text-2xl text-center">
            A 3D CRT workstation you can actually use — the screen runs a full
            desktop with working applications.
          </TypographyP>
          <ProjectsLinks live={this.live} repo={this.github} />
          <TypographyP className="font-mono">
            A Three.js shell renders the desk; inside the monitor, a React
            window manager runs a markets terminal, a Monaco editor, an
            in-desktop browser, a virtual file system with a real shell, and a
            games library — several of them upstream open-source projects
            vendored and running unmodified.
          </TypographyP>
        </div>
      );
    },
  },
];

export default projects;
