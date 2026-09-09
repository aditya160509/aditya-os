import { ArrowLeft, ArrowUpRight, Github, Play } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import projects from "@/data/projects";

export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = projects.find((item) => item.id === slug);
  return project
    ? { title: `${project.title} — Aditya Balaji`, description: project.category }
    : { title: "Project — Aditya Balaji" };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = projects.find((item) => item.id === slug);
  if (!project) notFound();

  return (
    <main className="project-detail-page min-h-screen bg-slate-100 px-4 py-5 text-slate-950 dark:bg-[#09090b] dark:text-slate-100 sm:px-8 sm:py-8">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate-500 transition-colors hover:text-slate-950 dark:hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to portfolio
        </Link>

        <header className="mt-10 grid gap-8 md:grid-cols-[1fr_0.72fr] md:items-end">
          <div>
            <p className="mb-4 text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
              {project.category}
            </p>
            <h1 className="max-w-4xl font-display text-4xl font-semibold tracking-tight sm:text-6xl">
              {project.title}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">
              A full project brief with the original preview, implementation context, and the research or engineering detail behind the build.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 md:justify-end">
            {project.github && project.github !== "#" && (
              <Link
                href={project.github}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm transition-colors hover:bg-white dark:border-slate-700 dark:hover:bg-white/10"
              >
                <Github className="h-4 w-4" /> Source <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            )}
            {project.live && project.live !== "#" && (
              <Link
                href={project.live}
                target={project.live.startsWith("/") ? undefined : "_blank"}
                rel={project.live.startsWith("/") ? undefined : "noreferrer"}
                className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm text-white transition-transform hover:-translate-y-0.5 dark:bg-white dark:text-black"
              >
                Open project <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
        </header>

        <section className="mt-10 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_22px_80px_-34px_rgba(15,23,42,0.45)] dark:border-white/10 dark:bg-white/[0.04]">
          <div className="relative aspect-[16/9] min-h-[220px] bg-slate-950 sm:min-h-[360px]">
            {project.video ? (
              <video
                className="h-full w-full object-cover"
                src={project.video}
                poster={project.src}
                controls
                playsInline
                preload="metadata"
              />
            ) : (
              <img className="h-full w-full object-cover" src={project.src} alt={`${project.title} preview`} />
            )}
            <div className="pointer-events-none absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full bg-black/65 px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] text-white backdrop-blur">
              <Play className="h-3 w-3 fill-current" /> {project.video ? "Playable preview" : "Project preview"}
            </div>
          </div>
          <div className="grid gap-10 border-t border-slate-200 p-5 dark:border-white/10 sm:p-8 lg:grid-cols-[0.32fr_1fr]">
            <aside className="lg:sticky lg:top-8 lg:self-start">
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Stack</p>
              <div className="mt-4 space-y-5">
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Frontend</p>
                  <div className="flex flex-wrap gap-2">
                    {project.skills.frontend.map((skill) => <span key={skill.title} className="rounded-full border border-slate-200 px-2.5 py-1 text-xs dark:border-white/10">{skill.title}</span>)}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Backend</p>
                  <div className="flex flex-wrap gap-2">
                    {project.skills.backend.map((skill) => <span key={skill.title} className="rounded-full border border-slate-200 px-2.5 py-1 text-xs dark:border-white/10">{skill.title}</span>)}
                  </div>
                </div>
              </div>
            </aside>
            <article className="project-detail-copy min-w-0 text-slate-700 dark:text-slate-200">
              {project.content}
            </article>
          </div>
        </section>

        <footer className="flex flex-wrap items-center justify-between gap-4 py-8 text-xs text-slate-500 dark:text-slate-400">
          <span>Built and documented by Aditya Balaji.</span>
          <Link href="/" className="underline underline-offset-4">View the rest of the work</Link>
        </footer>
      </div>
    </main>
  );
}
