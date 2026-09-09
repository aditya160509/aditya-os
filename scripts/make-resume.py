"""Generate the current Aditya Balaji resume PDF.

The content is drawn from the application fact sheets and the research/project
details already published in this repository. The output is intentionally ATS-
friendly: two balanced pages, plain text headings, and readable result-led
bullets.
"""

from reportlab.lib import colors
from reportlab.lib.enums import TA_RIGHT
from reportlab.lib.pagesizes import LETTER
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    KeepTogether,
    PageBreak,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)
import os


ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INNER_OUT = os.path.join(ROOT, "site", "inner", "public", "files", "Aditya_Balaji_Resume.pdf")
PORTFOLIO_OUT = os.path.join(ROOT, "site", "portfolio", "public", "Aditya_Balaji_Resume.pdf")
os.makedirs(os.path.dirname(INNER_OUT), exist_ok=True)

NAVY = colors.HexColor("#17324d")
TEAL = colors.HexColor("#147d86")
INK = colors.HexColor("#1d2730")
MUTED = colors.HexColor("#53616d")
RULE = colors.HexColor("#cbd5dc")

styles = getSampleStyleSheet()
name_style = ParagraphStyle(
    "ResumeName", parent=styles["Normal"], fontName="Helvetica-Bold", fontSize=22,
    leading=25, textColor=NAVY, spaceAfter=2,
)
role_style = ParagraphStyle(
    "ResumeRole", parent=styles["Normal"], fontName="Helvetica", fontSize=9.5,
    leading=12, textColor=TEAL, spaceAfter=3,
)
contact_style = ParagraphStyle(
    "ResumeContact", parent=styles["Normal"], fontName="Helvetica", fontSize=8.2,
    leading=10, textColor=MUTED, spaceAfter=6,
)
profile_style = ParagraphStyle(
    "ResumeProfile", parent=styles["Normal"], fontName="Helvetica", fontSize=8.6,
    leading=11.2, textColor=INK, spaceAfter=4,
)
section_style = ParagraphStyle(
    "ResumeSection", parent=styles["Normal"], fontName="Helvetica-Bold", fontSize=9.4,
    leading=11, textColor=NAVY, spaceBefore=8, spaceAfter=3,
)
title_style = ParagraphStyle(
    "ResumeTitle", parent=styles["Normal"], fontName="Helvetica-Bold", fontSize=8.8,
    leading=10.5, textColor=INK, spaceAfter=1,
)
meta_style = ParagraphStyle(
    "ResumeMeta", parent=styles["Normal"], fontName="Helvetica-Oblique", fontSize=7.7,
    leading=9.5, textColor=MUTED, alignment=TA_RIGHT,
)
detail_style = ParagraphStyle(
    "ResumeDetail", parent=styles["Normal"], fontName="Helvetica", fontSize=8.1,
    leading=10.1, textColor=INK, leftIndent=9, firstLineIndent=-7, spaceAfter=1.2,
)
skill_label_style = ParagraphStyle(
    "ResumeSkillLabel", parent=styles["Normal"], fontName="Helvetica-Bold", fontSize=8.1,
    leading=10, textColor=NAVY,
)
skill_style = ParagraphStyle(
    "ResumeSkill", parent=styles["Normal"], fontName="Helvetica", fontSize=8.1,
    leading=10, textColor=INK,
)


def P(text, style):
    return Paragraph(text, style)


def section(label):
    return [
        Spacer(1, 3),
        Table(
            [[P(label, section_style)]],
            colWidths=[7.3 * inch],
            style=TableStyle([
                ("LINEBELOW", (0, 0), (-1, -1), 0.6, RULE),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
                ("TOPPADDING", (0, 0), (-1, -1), 0),
            ]),
        ),
    ]


def entry(title, meta, bullets):
    title_row = Table(
        [[P(title, title_style), P(meta, meta_style)]],
        colWidths=[4.95 * inch, 2.35 * inch],
        hAlign="LEFT",
        style=TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("LEFTPADDING", (0, 0), (-1, -1), 0),
            ("RIGHTPADDING", (0, 0), (-1, -1), 0),
            ("TOPPADDING", (0, 0), (-1, -1), 0),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
        ]),
    )
    body = [title_row]
    body.extend(P(f"- {bullet}", detail_style) for bullet in bullets)
    return KeepTogether(body)


def footer(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(RULE)
    canvas.setLineWidth(0.45)
    canvas.line(doc.leftMargin, 0.38 * inch, LETTER[0] - doc.rightMargin, 0.38 * inch)
    canvas.setFont("Helvetica", 7.2)
    canvas.setFillColor(MUTED)
    canvas.drawString(doc.leftMargin, 0.22 * inch, "ADITYA BALAJI  |  QUANTITATIVE RESEARCH + SOFTWARE ENGINEERING")
    canvas.drawRightString(LETTER[0] - doc.rightMargin, 0.22 * inch, f"{doc.page}")
    canvas.restoreState()


doc = BaseDocTemplate(
    INNER_OUT,
    pagesize=LETTER,
    leftMargin=0.58 * inch,
    rightMargin=0.58 * inch,
    topMargin=0.43 * inch,
    bottomMargin=0.52 * inch,
    title="Aditya Balaji - Resume",
    author="Aditya Balaji",
)
frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="normal")
doc.addPageTemplates([PageTemplate(id="resume", frames=frame, onPage=footer)])

story = [
    P("Aditya Balaji", name_style),
    P("Student researcher and software engineer | Computer Science + quantitative finance", role_style),
    P("Mumbai, India  |  aditya160509@gmail.com  |  github.com/aditya160509  |  linkedin.com/in/aditya-balaji-50375237a", contact_style),
    P("Cambridge student building research systems and data-driven software at the intersection of markets, machine learning, and reliable engineering. Corresponding author on a peer-reviewed Q1 finance paper; develops tools used by others for analysis, simulation, and decisions.", profile_style),
]

story += section("EDUCATION")
story += [
    entry(
        "JBCN International School, Mumbai - Cambridge International (CAIE)",
        "Expected 2027",
        [
            "A Levels: Mathematics, Further Mathematics, Computer Science, Economics, Physics, English General Paper; IGCSE: 93%.",
            "Cambridge Independent Research Report (IPQ 9980), 4,982 words: investigated whether high-frequency trading destabilises markets during stress using an independently designed research question and empirical analysis.",
        ],
    ),
]

story += section("RESEARCH")
story += [
    entry(
        "Global Attention Saturation Index (GASI)",
        "Lead / corresponding author - Borsa Istanbul Review (Q1), peer-reviewed",
        [
            "Measured investor-attention thresholds across 22 international equity markets using Lewbel IV identification to address endogeneity between attention and volatility.",
            "Estimated a structural threshold of gamma* = 1.5625 by profile likelihood (Hansen set [1.14, 2.50]); documented the Silence Signature, confirmed in 14 of 22 markets through synthetic-control falsification with Driscoll-Kraay standard errors.",
        ],
    ),
    entry(
        "Behavioral Ownership Gap in Fantasy Premier League",
        "Corresponding author - Journal of Sports Economics (Q1), under review",
        [
            "Formalised the gap between optimal and actual ownership in a GBP 7.5B ecosystem; a Fama-MacBeth panel across 380 gameweeks returned t = -57.20.",
            "Estimated a GBP 137.1M annual welfare cost from information-architecture failure; a frozen, out-of-sample long-short replication produced 105 profitable weeks out of 105.",
        ],
    ),
    entry(
        "PhenoSync - phenological mismatch and climate value-at-risk",
        "Sole author - Oxford Said Climate Challenge",
        [
            "Joined GBIF, NASA MODIS (LST/NDVI), NOAA GHCND, and FAOSTAT data to quantify a 4.57-day/year phenology shift (R2 = 0.83, p = 0.0003) across a seven-framework robustness battery.",
            "Designed a PMI-severity crop-exposure model translating ecological mismatch into interpretable, billion-dollar value-at-risk indicators.",
        ],
    ),
    entry(
        "Why Overparameterised Neural Networks Generalise",
        "Independent mathematical exposition",
        [
            "Derived the Neural Tangent Kernel from first principles using Further Mathematics, connecting gradient dynamics, spectral bias, and generalisation through a fully worked two-neuron example.",
        ],
    ),
]

story += section("ENGINEERING")
story += [
    entry(
        "ATLAS (QUANT360) - quantitative research platform",
        "Solo build - in production use",
        [
            "Built eight research modules spanning regimes, screening, ML, volatility, factors, PCA, and portfolios; made the platform usable for independent analysis by another CS graduate.",
            "Implemented causal engines for DiD, RD, IV, and event studies; a volatility suite for HAR-RV, GARCH, jumps, and connectedness; and a bias-aware ML stack with purged CV, deflated Sharpe, Double ML, meta-labelling, and hierarchical risk parity.",
        ],
    ),
    entry(
        "NEXUS Exchange - agent-based market simulator",
        "Developer / researcher - SSRN paper",
        [
            "Simulated nine behaviourally distinct trader archetypes across 10,200 Monte Carlo runs with Numba and multiprocessing; recovered gamma* = 1.5625 by Simulated Method of Moments, independently corroborating GASI.",
            "Validated nine canonical stylised facts with jump-filtered ARCH-LM tests and shipped a five-tier FastAPI architecture with a PPO adversarial market maker and XGBoost/LSTM fragility predictor.",
        ],
    ),
    entry(
        "Glassbox SRE - autonomous incident response",
        "Developer",
        [
            "Connected Prometheus/Alertmanager, LangGraph investigation, parallel commit correlation, pgvector runbook retrieval, and queried impact estimation into an evidence-cited incident brief.",
            "Built a 15-scenario evaluation harness with seeded ground-truth commits: 86.7% top-1 accuracy versus a 13.3% deterministic baseline.",
        ],
    ),
    PageBreak(),
]

story += section("ENGINEERING - CONTINUED")
story += [
    entry(
        "Daedalus - engineering decision platform",
        "Solo developer - used in STEM Racing",
        [
            "Built a unit- and dimension-validated execution engine with provenance tracking, Monte Carlo sensitivity, multi-objective Pareto optimisation, and equation traceability across Next.js, FastAPI, PostgreSQL, and Three.js.",
        ],
    ),
    entry(
        "Zeus - agentic execution pipeline",
        "Developer",
        [
            "Designed goal decomposition, importance-weighted memory decay, DAG execution visualisation, and Playwright verification into an end-to-end prompt-to-verified-task loop at 35% lower token cost.",
        ],
    ),
    entry(
        "AdityaOS - interactive 3D desktop portfolio",
        "Solo build - live at adityabalaji.vercel.app",
        [
            "Created an installable, mobile-ready desktop shell with Three.js/WebGL, research and project windows, local-first interactions, games, presence, and an adapted VS Code portfolio workspace.",
        ],
    ),
]

story += section("LEADERSHIP, EXPERIENCE & SERVICE")
story += [
    entry(
        "MalkansView - market research intern",
        "3 months, approximately 35 hrs/week",
        ["Analysed company fundamentals against live market data and followed research through to the investment decisions the firm made."],
    ),
    entry(
        "Quantitative Finance Club - founder",
        "25-30 members",
        ["Designed a 13-week curriculum on markets, valuation, and quantitative methods; led Future Lab, a 150-company simulated market with intrinsic-value scoring, Ornstein-Uhlenbeck price dynamics, and timeline branching."],
    ),
    entry(
        "Sports Analysis Club - co-founder and co-host",
        "Student-led community",
        ["Built a consistent space for students to explore sports, data, and decision-making beyond formal coursework."],
    ),
    entry(
        "Rural Education Program & Fund Your Dream - volunteer",
        "Teacher / fundraiser",
        ["Taught foundational Mathematics and English to 50+ rural children, adapting delivery to student needs; raised INR 25,000+ for study kits, clothing, and footwear."],
    ),
    entry(
        "International Award for Young People (IAYP)",
        "Bronze and Silver Awards",
        ["Completed community service, football goalkeeping, and a 26-week quantitative research skills project focused on AI, machine learning, and quantitative trading."],
    ),
]

story += section("TECHNICAL")
story += [
    Table(
        [
            [P("Languages", skill_label_style), P("Python, TypeScript/JavaScript, SQL, R", skill_style)],
            [P("Research", skill_label_style), P("Econometrics (IV, DiD, RD, event studies), GARCH/HAR volatility, factor construction, causal ML, Monte Carlo, agent-based simulation", skill_style)],
            [P("Engineering", skill_label_style), P("FastAPI, Next.js/React, PostgreSQL, pgvector, LangGraph, Prometheus, Docker, Numba, Playwright, Three.js/WebGL, Git, Vercel", skill_style)],
            [P("Data", skill_label_style), P("yfinance, FRED, Ken French, GBIF, NASA MODIS, NOAA GHCND, FAOSTAT", skill_style)],
        ],
        colWidths=[0.85 * inch, 6.45 * inch],
        hAlign="LEFT",
        style=TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("LEFTPADDING", (0, 0), (-1, -1), 0),
            ("RIGHTPADDING", (0, 0), (-1, -1), 3),
            ("TOPPADDING", (0, 0), (-1, -1), 1),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 1),
        ]),
    ),
]

doc.build(story)
if INNER_OUT != PORTFOLIO_OUT:
    with open(INNER_OUT, "rb") as source, open(PORTFOLIO_OUT, "wb") as target:
        target.write(source.read())
print("Wrote", INNER_OUT)
print("Wrote", PORTFOLIO_OUT)
