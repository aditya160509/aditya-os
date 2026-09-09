import { Metadata } from 'next';
import Image from 'next/image';
import GitHubCalendar from 'react-github-calendar';
import { VscRepo, VscPerson, VscStarEmpty, VscRepoForked, VscLinkExternal, VscGithub } from 'react-icons/vsc';

import RepoCard from '@/components/RepoCard';
import { Repo, User } from '@/types';

import styles from '@/styles/GithubPage.module.css';

export const metadata: Metadata = {
  title: 'GitHub',
};

const GITHUB_USERNAME = 'aditya160509';
const user: User = {
  login: GITHUB_USERNAME,
  avatar_url: 'https://github.com/aditya160509.png',
  public_repos: 0,
  followers: 0,
};
const repos: Repo[] = [
  { id: 1, name: 'aditya-os', description: 'Interactive 3D workstation portfolio and playable personal site.', language: 'TypeScript', watchers: 0, forks: 0, stargazers_count: 0, html_url: 'https://github.com/aditya160509/aditya-os', homepage: '/' },
  { id: 2, name: 'phenosync', description: 'Climate-driven phenological mismatch research pipeline.', language: 'Python', watchers: 0, forks: 0, stargazers_count: 0, html_url: 'https://github.com/aditya160509/phenosync', homepage: '' },
  { id: 3, name: 'study-notes', description: 'Working notes, experiments, and technical reference material.', language: 'Markdown', watchers: 0, forks: 0, stargazers_count: 0, html_url: 'https://github.com/aditya160509/study-notes', homepage: '' },
];

export default function GithubPage() {

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.profile}>
            <Image
              src={user.avatar_url}
              className={styles.avatar}
              alt={user.login}
              width={80}
              height={80}
              priority
            />
            <div className={styles.profileInfo}>
              <h1 className={styles.name}>{user.login}</h1>
              <span className={styles.handle}>@{user.login}</span>
            </div>
          </div>

          <a
            href={`https://github.com/${user.login}`}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.profileLink}
          >
            <VscGithub size={18} />
            <span>View Profile</span>
            <VscLinkExternal size={14} />
          </a>
        </header>

        {/* Stats */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <VscRepo size={20} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{user.public_repos}</span>
              <span className={styles.statLabel}>Repositories</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <VscPerson size={20} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{user.followers}</span>
              <span className={styles.statLabel}>Followers</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <VscStarEmpty size={20} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>
                {repos.reduce((acc, repo) => acc + repo.stargazers_count, 0)}
              </span>
              <span className={styles.statLabel}>Total Stars</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <VscRepoForked size={20} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>
                {repos.reduce((acc, repo) => acc + repo.forks, 0)}
              </span>
              <span className={styles.statLabel}>Total Forks</span>
            </div>
          </div>
        </div>

        {/* Contribution Graph */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Contribution Activity</h2>
          <div className={styles.contributions}>
            <GitHubCalendar
              username={GITHUB_USERNAME}
              hideColorLegend
              hideMonthLabels
              colorScheme="dark"
              theme={{
                dark: ['#161B22', '#0e4429', '#006d32', '#26a641', '#39d353'],
                light: ['#161B22', '#0e4429', '#006d32', '#26a641', '#39d353'],
              }}
              style={{
                width: '100%',
              }}
            />
          </div>
        </section>

        {/* Repositories */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Popular Repositories</h2>
            <a
              href={`https://github.com/${user.login}?tab=repositories`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.viewAll}
            >
              View All
              <VscLinkExternal size={14} />
            </a>
          </div>

          <div className={styles.reposGrid}>
            {repos.map((repo) => (
              <RepoCard key={repo.id} repo={repo} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
