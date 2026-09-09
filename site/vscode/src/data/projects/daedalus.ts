export const daedalus = {
    id: "daedalus",
    title: "Daedalus",
    subtitle: "Engineering platform for long-running computational work",
    description:
        "A platform for orchestrating research pipelines that run for hours or days \u2014 scheduling, checkpointing, and recovering work that is too expensive to lose.",

    longDescription: `
Daedalus exists because research code fails halfway through and the cost is measured in hours.

It orchestrates long-running computational pipelines with checkpointing, dependency resolution between stages, and recovery that resumes from the last good state rather than the beginning.

Built after losing an overnight factor-construction run to a single unhandled exception in the final stage.
`,

    type: "Engineering Platform",
    tech: [
        "Python",
        "TypeScript",
        "React",
        "PostgreSQL",
        "Redis",
        "Docker",
        "Celery"
],

    links: {
        "github": "https://github.com/aditya160509"
},

    architecture: `
[Pipeline Definition]  ->  stage DAG
        |
        v
[Scheduler]  ->  dependency resolution
        |
        +--> Checkpoint Store (per stage)
        +--> Failure Detection
        |
        v
[Resume From Last Good State]
`
};
