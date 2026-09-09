'use client';

import { VscGithub, VscMail, VscLinkExternal } from 'react-icons/vsc';
import Link from 'next/link';

import styles from '@/styles/AboutPage.module.css';

const AboutPage = () => {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.headerText}>
              <h1 className={styles.name}>Aditya Balaji</h1>
              <p className={styles.role}>Quantitative Researcher · Engineer · Builder</p>
              <div className={styles.location}><span className={styles.dot} />Mumbai, India</div>
            </div>
          </div>
          <div className={styles.headerActions}>
            <a href="https://github.com/aditya160509" target="_blank" rel="noopener noreferrer" className={styles.iconButton}><VscGithub size={20} /></a>
            <Link href="/contact" className={styles.iconButton}><VscMail size={20} /></Link>
          </div>
        </header>

        <div className={styles.content}>
          <section className={styles.section}>
            <div className={styles.sectionHeader}><span className={styles.sectionNumber}>01</span><h2 className={styles.sectionTitle}>About</h2></div>
            <div className={styles.sectionBody}>
              <p className={styles.paragraph}>I build systems at the intersection of quantitative research, applied machine learning, and software engineering. I care about the part after the prototype: clear assumptions, reproducible results, and interfaces that make complex work easier to use.</p>
              <p className={styles.paragraph}>My current work spans market microstructure, agent-based simulation, open-data climate research, and interactive web experiences. This portfolio is itself a small experiment — a personal site you can explore like a desktop.</p>
            </div>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHeader}><span className={styles.sectionNumber}>02</span><h2 className={styles.sectionTitle}>Focus</h2></div>
            <div className={styles.sectionBody}>
              <div className={styles.experienceCard}><div className={styles.expMeta}><span className={styles.expPeriod}>Now</span></div><h3 className={styles.expRole}>Research-driven engineering</h3><p className={styles.expDesc}>Building ATLAS, NEXUS, PhenoSync, Glassbox, and the tools around them — from data pipelines and model validation to polished, usable front ends.</p></div>
              <div className={styles.experienceCard}><div className={styles.expMeta}><span className={styles.expPeriod}>Always</span></div><h3 className={styles.expRole}>Make the work legible</h3><p className={styles.expDesc}>Good engineering should expose its reasoning. I like traceable systems, honest metrics, and small interfaces that reward curiosity.</p></div>
            </div>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHeader}><span className={styles.sectionNumber}>03</span><h2 className={styles.sectionTitle}>Stack</h2></div>
            <div className={styles.sectionBody}><div className={styles.skillsGrid}>
              <div className={styles.skillCategory}><h4 className={styles.skillTitle}>Languages</h4><div className={styles.skillTags}><span className={styles.skillTag}>Python</span><span className={styles.skillTag}>TypeScript</span><span className={styles.skillTag}>SQL</span></div></div>
              <div className={styles.skillCategory}><h4 className={styles.skillTitle}>Systems</h4><div className={styles.skillTags}><span className={styles.skillTag}>React</span><span className={styles.skillTag}>Next.js</span><span className={styles.skillTag}>Node.js</span></div></div>
              <div className={styles.skillCategory}><h4 className={styles.skillTitle}>Research</h4><div className={styles.skillTags}><span className={styles.skillTag}>Econometrics</span><span className={styles.skillTag}>Monte Carlo</span><span className={styles.skillTag}>Applied ML</span></div></div>
              <div className={styles.skillCategory}><h4 className={styles.skillTitle}>Build</h4><div className={styles.skillTags}><span className={styles.skillTag}>Three.js</span><span className={styles.skillTag}>WebGL</span><span className={styles.skillTag}>PostgreSQL</span></div></div>
            </div></div>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHeader}><span className={styles.sectionNumber}>04</span><h2 className={styles.sectionTitle}>Explore</h2></div>
            <div className={styles.sectionBody}>
              <p className={styles.paragraph}>The main portfolio has the long-form research notes, project details, resume, and live demos. This window is the compact code-facing view.</p>
              <div className={styles.writingLinks}>
                <a href="https://adityabalaji.vercel.app/portfolio/" target="_blank" rel="noopener noreferrer" className={styles.writingLink}><span>Open the personal site</span><VscLinkExternal size={14} /></a>
                <a href="https://github.com/aditya160509" target="_blank" rel="noopener noreferrer" className={styles.writingLink}><span>Browse the code archive</span><VscLinkExternal size={14} /></a>
              </div>
            </div>
          </section>
        </div>
        <footer className={styles.footer}><Link href="/projects" className={styles.footerLink}>View my projects →</Link></footer>
      </div>
    </div>
  );
};

export default AboutPage;
