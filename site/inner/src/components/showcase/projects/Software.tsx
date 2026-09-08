import React from 'react';
// @ts-ignore
import saga from '../../../assets/pictures/projects/software/saga.mp4';
// @ts-ignore
import computer from '../../../assets/pictures/projects/software/computer.mp4';
// @ts-ignore
import scroll from '../../../assets/pictures/projects/software/scroll.mp4';
import VideoAsset from '../../general/VideoAsset';

export interface SoftwareProjectsProps {}

const SoftwareProjects: React.FC<SoftwareProjectsProps> = (props) => {
    return (
        <div className="site-page-content">
            <h1>Software</h1>
            <h3>Projects</h3>
            <br />
            <p>
                Below are some of my favorite software projects I have worked on
                over the last few years.
            </p>
            <br />
            <br />
            <div className="text-block">
                <h2>AdityaOS — this workstation</h2>
                <br />
                <p>
                    AdityaOS is my portfolio website, and also the website you
                    are on right now. This project was an absolute joy to make
                    and challenged me both technically and creatively — a full
                    3D desk scene wrapped around a working desktop OS with real
                    apps, games, a paper-trading terminal, and a looping video
                    wallpaper.
                </p>
                <br />
                <div className="captioned-image">
                    <VideoAsset src={computer} />
                    <p style={styles.caption}>
                        <sub>
                            <b>Figure 1:</b> Blender Scene of the 3D website.
                            The scene from Blender was baked and exported in a
                            GLTF format.
                        </sub>
                    </p>
                </div>
                <p>
                    Now, a quick technical breakdown of the site. The website is
                    split into two parts, the 3D site, and the 2D OS site. The
                    3D site uses Three.js to render the scene and renders the 2D
                    site inside of it using an iframe. The 2D OS site is a
                    simple react site that works as a standalone web app. The
                    actual rendering of the 2D site is accomplished using a CSS
                    renderer provided by Three.js that transforms the html of
                    the 2D site with 3D CSS transforms to give the illusion of
                    three dimensionality.
                </p>
                <br />
                <h3>Links:</h3>
                <ul>
                    <li>
                        <a
                            rel="noreferrer"
                            target="_blank"
                            href="https://grade-central.vercel.app/"
                        >
                            <p>
                                <b>[Live]</b> - Grade Central
                            </p>
                        </a>
                    </li>
                    <li>
                        <a
                            rel="noreferrer"
                            target="_blank"
                            href="https://github.com/aditya160509"
                        >
                            <p>
                                <b>[GitHub]</b> - aditya160509 repositories
                            </p>
                        </a>
                    </li>
                    <li>
                        <a
                            rel="noreferrer"
                            target="_blank"
                            href="https://github.com/aditya160509/phenosync"
                        >
                            <p>
                                <b>[GitHub]</b> - PhenoSync
                            </p>
                        </a>
                    </li>
                    <li>
                        <a
                            rel="noreferrer"
                            target="_blank"
                            href="https://github.com/aditya160509/study-notes"
                        >
                            <p>
                                <b>[GitHub]</b> - Study Notes archive
                            </p>
                        </a>
                    </li>
                </ul>
                <p>
                    I'm skipping over a lot of details in exchange for brevity,
                    but I do plan on doing a more in depth breakdown for those
                    interested sometime in the future. To get updates with that
                    project feel free to follow me on{' '}
                    <a
                        rel="noreferrer"
                        target="_blank"
                        href="https://www.linkedin.com/in/aditya-balaji-50375237a/"
                    >
                        LinkedIn
                    </a>
                </p>
            </div>
            <div className="text-block">
                <h2>Grade Central</h2>
                <br />
                <p>
                    Grade Central is my academic workflow and grade intelligence
                    dashboard — it pulls coursework, deadlines, and scores into
                    one place so I always know where I stand and what to work
                    on next. It started as a spreadsheet that got out of hand
                    and grew into a full web app with live data, clean
                    visualizations, and a workflow built around how I actually
                    study.
                </p>
                <br />
                <div className="captioned-image">
                    <VideoAsset src={saga} />
                    <div style={styles.caption}>
                        <p>
                            <sub>
                                <b>Figure 2: </b> Demo capture from the project
                                archive.
                            </sub>
                        </p>
                    </div>
                </div>
                <p>
                    The interesting challenge was data modeling: every subject
                    grades differently, weightings shift mid-term, and
                    predictions have to stay honest about uncertainty. Building
                    a model flexible enough for all of that — while keeping the
                    interface dead simple — was the fun part, and it changed
                    how I think about dashboards in general.
                </p>
                <br />
                <h3>Links:</h3>
                <ul>
                    <li>
                        <a
                            rel="noreferrer"
                            target="_blank"
                            href="https://grade-central.vercel.app/"
                        >
                            <p>
                                <b>[Live]</b> - Grade Central
                            </p>
                        </a>
                    </li>
                    <li>
                        <a
                            rel="noreferrer"
                            target="_blank"
                            href="https://github.com/aditya160509"
                        >
                            <p>
                                <b>[GitHub]</b> - aditya160509 repositories
                            </p>
                        </a>
                    </li>
                </ul>
                <p>
                    If you are a student drowning in grade portals and
                    spreadsheets, check out Grade Central — and if you like it,
                    star it on GitHub.
                </p>
            </div>
            <div className="text-block">
                <h2>PhenoSync</h2>
                <br />
                <p>
                    PhenoSync is my research software and experimental tooling
                    project — built for keeping observations, experiment runs,
                    and analysis in sync instead of scattered across notebooks,
                    chats, and memory. If you've ever lost a result to a messy
                    folder, this is the fix I built for myself.
                </p>
                <br />
                <div className="captioned-image">
                    <VideoAsset src={scroll} />
                    <p style={styles.caption}>
                        <sub>
                            <b>Figure 3:</b> Demo capture from the project
                            archive.
                        </sub>
                    </p>
                </div>
                <p>
                    The project is open source. PhenoSync is not a project with
                    massive scope, but it scratched a real itch and taught me a
                    lot about building tools other people (including future me)
                    can rely on. My open study-notes archive lives alongside it
                    as the public paper trail.
                </p>
                <br />
                <h3>Links:</h3>
                <ul>
                    <li>
                        <a
                            rel="noreferrer"
                            target="_blank"
                            href="https://github.com/aditya160509/phenosync"
                        >
                            <p>
                                <b>[GitHub]</b> - PhenoSync Repository
                            </p>
                        </a>
                    </li>
                    <li>
                        <a
                            rel="noreferrer"
                            target="_blank"
                            href="https://github.com/aditya160509/study-notes"
                        >
                            <p>
                                <b>[GitHub]</b> - Study Notes archive
                            </p>
                        </a>
                    </li>
                </ul>
                <p>
                    If you like it, feel free to star it on GitHub — and if
                    research tooling is your thing, reach out, I always want to
                    compare notes.
                </p>
            </div>
        </div>
    );
};

const styles: StyleSheetCSS = {
    video: {
        width: '100%',
        padding: 12,
    },
    caption: {
        width: '80%',
    },
};

export default SoftwareProjects;
