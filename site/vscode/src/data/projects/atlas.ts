export const atlas = {
    id: "atlas",
    title: "ATLAS \u00b7 QUANT360",
    subtitle: "Institutional-grade quantitative research platform, built solo",
    description:
        "Eight modules \u2014 Regime, Research, Screener, ML, Volatility, Factor, PCA and Portfolio \u2014 carrying causal identification engines and a full factor pipeline, constrained entirely to free data sources.",

    longDescription: `
ATLAS is a quantitative research platform I built alone and someone else now uses for real analysis.

The Research module carries causal identification engines for Callaway–Sant'Anna difference-in-differences, regression discontinuity, instrumental variables and event studies.

Volatility spans nine features: HAR-RV, the full GARCH family, statistical jump models and Diebold–Yilmaz connectedness. Machine learning adds twelve more, including combinatorial purged cross-validation with the deflated Sharpe ratio, Double ML causal decomposition, meta-labelling and hierarchical risk parity.

Everything runs on point-in-time fundamentals with IC-IR weighted composite scoring and full QMJ factor construction — from yfinance, FRED and Ken French only. Core analytics were vectorised to remove the bottlenecks that made the first version unusable.
`,

    type: "Quantitative Research Platform",
    tech: [
        "Python",
        "Pandas",
        "NumPy",
        "PostgreSQL",
        "Docker",
        "Next.js",
        "TypeScript",
        "statsmodels",
        "scikit-learn"
],

    links: {
        "github": "https://github.com/aditya160509"
},

    architecture: `
[Free Data Sources]
  yfinance · FRED · Ken French
        |
        v
[Point-in-Time Store]  ->  survivorship-bias disclosure
        |
        +--> Regime · Volatility (HAR-RV, GARCH, jumps)
        +--> Research (DiD, RDD, IV, event studies)
        +--> ML (purged CV, deflated Sharpe, Double ML)
        +--> Factor · PCA · Screener
        |
        v
[Portfolio Construction]  ->  hierarchical risk parity
`
};
