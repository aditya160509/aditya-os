"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight, FileText } from "lucide-react";
import { motion } from "motion/react";

import { SectionHeader } from "./section-header";
import SectionWrapper from "../ui/section-wrapper";
import { Button } from "../ui/button";

type Paper = {
  id: string;
  title: string;
  venue: string;
  authors: string;
  abstract: string;
  findings: string[];
  pdf: string;
  repo?: string;
};

const PAPERS: Paper[] = [
  {
    id: "attention",
    title:
      "Silence Before the Break: How Investor Attention Thresholds Trigger Liquidity Withdrawal and Volatility Amplification",
    venue: "Working paper · JEL G14, G15, C58",
    authors: "Aditya Balaji, Priyam Goyani, Vevaan Malkan, Aarnav Panchal",
    abstract:
      "A threshold in investor attention density, measurable from public exchange volume alone, above which equity markets shift from independent information processing to correlated narrative-following. Estimated at γ* = 1.5625 across 23 markets, with a three-step transmission mechanism — belief compression, liquidity withdrawal, volatility amplification — each identified by a separate empirical design.",
    findings: [
      "18,915 hourly crossing events across 23 equity markets, 2015–2025",
      "Calibrated on 2015–2020 and frozen: still classifies the 2021–2025 holdout correctly",
      "Up to two hours of lead over standard volatility metrics (AUC 0.814 inside coordination episodes)",
      "Separates coordination stress from credit stress — abstains on SVB-type events",
    ],
    pdf: "/papers/attention-saturation-threshold.pdf",
  },
  {
    id: "fpl",
    title:
      "When Realized Outcomes Outweigh Predictive Signals: Evidence from Fantasy Premier League",
    venue: "Working paper · JEL D83, D84, D91, L83",
    authors: "Aditya Balaji",
    abstract:
      "Fantasy Premier League publishes the share of entries holding each player, so collective belief is observable as a quantity rather than inferred from a price. That makes it possible to separate two properties usually seen through the same number: whether a crowd's holdings are informative, and whether it updates them in proportion to what each new signal actually predicts.",
    findings: [
      "100,801 player-gameweeks across four seasons",
      "Ownership predicts performance beyond public-information benchmarks (coefficient 0.831)",
      "Proportional calibration rejected across all ten signals: a goal moves ownership far more than playing time, which predicts better",
      "Matched players who scored gain 1.3pp more ownership with no difference in subsequent chance quality",
    ],
    pdf: "/papers/fantasy-league-betting-markets.pdf",
  },
  {
    id: "phenosync",
    title:
      "Asymmetric phenological advance erodes pollinator-crop temporal overlap in a major commercial crop system",
    venue: "Working paper · PhenoSync pipeline",
    authors: "Aditya Balaji",
    abstract:
      "Highbush blueberry flowering has advanced 5.03 days per year over a decade while its primary pollinator has stayed essentially static. The probability that pollinator activity overlaps the flowering window has collapsed by 99.1% since 2016 — the first formal evidence from an agricultural system that crop and pollinator phenology are actively diverging rather than merely shifting.",
    findings: [
      "Adaptive percentile first-event estimator: 30× RMSE improvement over the naive minimum under observer-effort bias",
      "Mismatch trend of 4.57 days/year (p = 0.0003, R² = 0.83) — 4.7× larger than temperature alone explains",
      "Four global regions classified by evidence strength rather than forced into significance",
      "Modeled economic exposure of $723M by 2024 under conservative dependence assumptions",
    ],
    pdf: "/papers/phenosync-pollinator-mismatch.pdf",
    repo: "https://github.com/aditya160509/phenosync",
  },
];

const PaperCard = ({ paper, index }: { paper: Paper; index: number }) => (
  <motion.article
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-80px" }}
    transition={{ duration: 0.5, delay: index * 0.08 }}
    className="group relative rounded-xl border border-border bg-background/40 p-6 md:p-8 backdrop-blur-sm transition-colors hover:border-foreground/25"
  >
    <div className="mb-3 flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
      <FileText className="h-3.5 w-3.5" />
      {paper.venue}
    </div>

    <h3 className="font-display text-xl md:text-2xl font-bold leading-snug tracking-tight text-foreground">
      {paper.title}
    </h3>
    <p className="mt-2 font-mono text-xs text-muted-foreground">{paper.authors}</p>

    <p className="mt-5 font-mono text-sm leading-relaxed text-muted-foreground">
      {paper.abstract}
    </p>

    <ul className="mt-5 space-y-2">
      {paper.findings.map((f) => (
        <li key={f} className="flex gap-3 font-mono text-sm text-muted-foreground">
          <span aria-hidden className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-primary" />
          <span>{f}</span>
        </li>
      ))}
    </ul>

    <div className="mt-7 flex flex-wrap items-center gap-3">
      <Link href={paper.pdf} target="_blank" rel="noopener">
        <Button size="sm">
          Read the paper
          <ArrowUpRight className="ml-2 h-4 w-4" />
        </Button>
      </Link>
      {paper.repo && (
        <Link href={paper.repo} target="_blank" rel="noopener">
          <Button size="sm" variant="outline">
            Code
            <ArrowUpRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      )}
    </div>
  </motion.article>
);

const ResearchSection = () => (
  <SectionWrapper id="research" className="mx-auto max-w-5xl px-4">
    <SectionHeader
      id="research"
      title="Research"
      desc="Three papers asking one question in different clothes: what happens to a system when the agents inside it stop reasoning independently."
    />
    <div className="grid grid-cols-1 gap-5">
      {PAPERS.map((paper, i) => (
        <PaperCard key={paper.id} paper={paper} index={i} />
      ))}
    </div>
  </SectionWrapper>
);

export default ResearchSection;
