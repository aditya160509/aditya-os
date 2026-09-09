export const phenosync = {
    id: "phenosync",
    title: "PhenoSync",
    subtitle: "Open pipeline for detecting pollinator\u2013crop phenological mismatch",
    description:
        "Converts effort-biased GBIF citizen-science records into validated annual mismatch estimates linked to crop exposure. Published research with a reproducible pipeline behind it.",

    longDescription: `
Highbush blueberry flowering has advanced 5.03 days per year over the past decade while its primary pollinator has stayed essentially static. The probability that pollinator activity overlaps the flowering window has collapsed by 99.1% since 2016.

PhenoSync is the pipeline that found it. Its core contribution is an adaptive percentile first-event estimator — a 30× RMSE improvement over the naive minimum when observer effort is skewed, which it always is in citizen-science data.

The North American mismatch trend of 4.57 days/year (p = 0.0003, R² = 0.83) is 4.7× larger than temperature alone explains. Four global regions are classified by evidence strength rather than forced into significance.
`,

    type: "Research Pipeline / Published Paper",
    tech: [
        "Python",
        "Pandas",
        "SciPy",
        "statsmodels",
        "GBIF API",
        "NASA MODIS",
        "FAOSTAT",
        "R"
],

    links: {
        "github": "https://github.com/aditya160509"
},

    architecture: `
[GBIF · MODIS · NOAA · FAOSTAT]
        |
        v
[Effort-Bias Correction]
  adaptive percentile first-event estimator
        |
        v
[Phenological Mismatch Index]
        |
        +--> 6-framework robustness battery
        +--> climate-sufficiency test
        |
        v
[Regional Classification + Economic Exposure]
`
};
