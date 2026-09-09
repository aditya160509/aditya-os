export const glassbox = {
    id: "glassbox",
    title: "Glassbox SRE",
    subtitle: "Autonomous incident response with an audit trail",
    description:
        "An agent that triages production incidents end to end \u2014 reads telemetry, forms a hypothesis, proposes a fix \u2014 and shows its reasoning at every step rather than emitting a verdict.",

    longDescription: `
Glassbox is an incident-response agent built on the premise that an opaque recommendation is worthless during an outage.

It ingests logs, metrics and traces, forms a hypothesis about the failure, and proposes a remediation — but every step of that chain is inspectable. You can see which signal moved it, what it ruled out, and why.

The name is the whole argument: an SRE tool that cannot be audited under pressure will not be trusted under pressure.
`,

    type: "Autonomous Agent / SRE Tooling",
    tech: [
        "Python",
        "FastAPI",
        "TypeScript",
        "React",
        "Docker",
        "OpenTelemetry",
        "PostgreSQL"
],

    links: {
        "github": "https://github.com/aditya160509"
},

    architecture: `
[Telemetry: logs · metrics · traces]
        |
        v
[Signal Extraction]
        |
        v
[Hypothesis Engine]  --> every step recorded
        |
        v
[Proposed Remediation] + [Full Reasoning Trail]
`
};
