export const nexus = {
    id: "nexus",
    title: "NEXUS Exchange",
    subtitle: "Agent-based market simulator, 10,200 Monte Carlo runs",
    description:
        "Nine behaviourally distinct trader archetypes trading against each other in a simulated limit order book, used to study how coordination and liquidity withdrawal emerge from individual behaviour.",

    longDescription: `
NEXUS is an agent-based exchange where nine behaviourally distinct trader archetypes — market makers, momentum chasers, noise traders, informed traders and others — interact through a real limit order book.

Across 10,200 Monte Carlo runs it reproduces the stylised facts of real markets: fat-tailed returns, volatility clustering, and liquidity that withdraws precisely when it is most needed.

It exists to test the mechanism behind the attention-threshold paper: coordination stress is supposed to emerge from individual behaviour rather than be imposed. In NEXUS it does.
`,

    type: "Agent-Based Simulation",
    tech: [
        "Python",
        "NumPy",
        "TypeScript",
        "React",
        "PostgreSQL",
        "Docker"
],

    links: {
        "github": "https://github.com/aditya160509"
},

    architecture: `
[9 Trader Archetypes]
        |
        v
[Limit Order Book Engine]  ->  matching · depth · spread
        |
        +--> 10,200 Monte Carlo runs
        |
        v
[Stylised Facts]
  fat tails · vol clustering · liquidity withdrawal
`
};
