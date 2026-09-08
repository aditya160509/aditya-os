"""Generate Aditya Balaji's one-page resume PDF from the activity list + fact sheet.

Source: ~/Documents/Codex/aditya (activities, fact-sheets).
Run: python3 scripts/make-resume.py
Output: site/inner/public/files/Aditya_Balaji_Resume.pdf
"""
from reportlab.lib.pagesizes import LETTER
from reportlab.lib.units import inch
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable
from reportlab.lib.enums import TA_CENTER
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'site', 'inner', 'public', 'files', 'Aditya_Balaji_Resume.pdf')
os.makedirs(os.path.dirname(OUT), exist_ok=True)

name = ParagraphStyle('name', fontName='Helvetica-Bold', fontSize=18, alignment=TA_CENTER, spaceAfter=2)
contact = ParagraphStyle('contact', fontName='Helvetica', fontSize=8.5, alignment=TA_CENTER, spaceAfter=6)
head = ParagraphStyle('head', fontName='Helvetica-Bold', fontSize=10, spaceBefore=8, spaceAfter=3, textColor='#1a1a1a')
body = ParagraphStyle('body', fontName='Helvetica', fontSize=8.5, leading=11, spaceAfter=2, leftIndent=10)
item = ParagraphStyle('item', parent=body, bulletIndent=0)
story = [
    Paragraph('Aditya Balaji', name),
    Paragraph('Mumbai, India &nbsp;|&nbsp; aditya160509@gmail.com &nbsp;|&nbsp; github.com/aditya160509 &nbsp;|&nbsp; linkedin.com/in/aditya-balaji-50375237a', contact),
    HRFlowable(width='100%', thickness=1),
    Paragraph('EDUCATION', head),
    Paragraph('<b>JBCN International School, Mumbai</b> — Cambridge International', item),
    Paragraph('Subjects: Computer Science, Mathematics, Further Mathematics, Economics, Physics', item),
    Paragraph('RESEARCH', head),
    Paragraph('<b>Global Attention Saturation Index (GASI)</b> — Corresponding Author · <i>Borsa Istanbul Review</i> (Q1, peer-reviewed). Investor-attention thresholds across 22 equity markets via Lewbel IV; structural threshold 1.5625; “Silence Signature” confirmed in 14/22 markets.', item),
    Paragraph('<b>Behavioral Ownership Gap (Fantasy Premier League)</b> — Corresponding Author · <i>Journal of Sports Economics</i> (Q1, under review). Fama-MacBeth panel over 380 gameweeks (t=-57.20); £137.1M welfare cost; 105/105 profitable weeks out-of-sample.', item),
    Paragraph('<b>PhenoSync — Climate-Risk Pipeline</b> — Sole Author · Oxford Saïd Challenge. 4 public datasets; quantified 4.6 days/yr phenology shift; modeled $B crop exposure.', item),
    Paragraph('TECHNICAL PROJECTS', head),
    Paragraph('<b>NEXUS Exchange</b> — Agent-based market simulator, 9 trader types; 10,200 Monte Carlo runs reproducing 9 real-market patterns; independently confirmed the GASI threshold.', item),
    Paragraph('<b>ATLAS / QUANT360</b> — Quant research platform used live for investment research; free data only; point-in-time correct.', item),
    Paragraph('<b>Glassbox SRE</b> — Autonomous incident-response system; 87% vs 13% on 15 seeded incidents.', item),
    Paragraph('<b>Daedalus</b> — Engineering decision platform for STEM Racing team; Monte Carlo + Pareto trade-off analysis used in competition.', item),
    Paragraph('<b>Grade Central</b> (grade-central.vercel.app) — Academic workflow and grade-intelligence dashboard.', item),
    Paragraph('<b>AdityaOS</b> — Interactive 3D + desktop-OS portfolio; React, Three.js, WebGL charting, emulation.', item),
    Paragraph('LEADERSHIP & EXPERIENCE', head),
    Paragraph('<b>Founder, Quant Finance Club</b> — 25–30 members; 13-week curriculum; built Future Lab market (150 stocks).', item),
    Paragraph('<b>Intern, MalkansView</b> — Stock-market research firm; 140 hrs analyzing fundamentals on live market data.', item),
    Paragraph('<b>Teacher, Rural Education Program</b> — Foundational math & English for 50+ rural children.', item),
    Paragraph('<b>Co-Founder, Sports Analysis Hub</b> — Sports analytics club; consistent community programming.', item),
    Paragraph('AWARDS', head),
    Paragraph('IAYP Bronze Award (community service) · Cambridge IPQ (4,982-word qualification on HFT destabilization)', item),
    Paragraph('SKILLS', head),
    Paragraph('Python (pandas, Playwright) · TypeScript · React · Three.js · Node.js · Monte Carlo simulation · Panel econometrics · Git · Vercel', item),
]

SimpleDocTemplate(OUT, pagesize=LETTER, leftMargin=0.6 * inch, rightMargin=0.6 * inch, topMargin=0.5 * inch, bottomMargin=0.5 * inch).build(story)
print('Wrote', OUT)
