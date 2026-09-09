export const futureLab = {
    id: "futurelab",
    title: "Future Lab",
    subtitle: "Simulated market of ~150 companies across 15 industries",
    description:
        "A live simulated economy where companies trade, report earnings and respond to shocks, built so the mechanics of a market can be watched rather than described.",

    longDescription: `
Future Lab runs a market of roughly 150 companies across 15 industries. They report earnings, respond to macro shocks, and trade against participants in continuous time.

It was built as a teaching instrument: the mechanics of price formation, sector rotation and earnings surprise are far easier to understand when you can watch them happen than when they are described.
`,

    type: "Simulated Market",
    tech: [
        "Next.js",
        "TypeScript",
        "React",
        "Tailwind CSS",
        "PostgreSQL",
        "Python"
],

    links: {
        "live": "https://future-lab-terminal.vercel.app"
},

    architecture: `
[150 Companies / 15 Industries]
        |
        +--> Earnings Engine
        +--> Macro Shock Generator
        |
        v
[Continuous Price Formation]
        |
        v
[Trading Terminal UI]
`
};
