const config = {
  title: "Aditya Balaji | Quantitative Researcher & Engineer",
  description: {
    long: "Aditya Balaji — quantitative researcher and software engineer in Mumbai. Peer-reviewed work on investor attention thresholds (Borsa Istanbul Review), behavioural market microstructure, and research platforms: ATLAS (QUANT360), NEXUS Exchange, Glassbox SRE, Daedalus and PhenoSync.",
    short:
      "Quantitative researcher and engineer — market microstructure, applied ML, and research platforms people actually use.",
  },
  keywords: [
    "Aditya Balaji",
    "quantitative research",
    "market microstructure",
    "investor attention",
    "GASI",
    "agent-based modelling",
    "machine learning",
    "portfolio",
    "ATLAS QUANT360",
    "NEXUS Exchange",
    "Glassbox SRE",
    "PhenoSync",
    "Python",
    "TypeScript",
    "Next.js",
  ],
  author: "Aditya Balaji",
  email: "aditya160509@gmail.com",
  site: "https://adityabalajiportfolio.vercel.app",

  // for github stars button
  githubUsername: "aditya160509",
  githubRepo: "aditya-os",

  get ogImg() {
    return this.site + "/assets/seo/og-image.png";
  },
  social: {
    linkedin: "https://www.linkedin.com/in/aditya-balaji-50375237a/",
    github: "https://github.com/aditya160509",
  },
};
export { config };
