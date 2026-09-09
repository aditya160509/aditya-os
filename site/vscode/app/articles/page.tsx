import { Metadata } from 'next';
import { VscBook, VscLinkExternal, VscGlobe } from 'react-icons/vsc';

import ArticleCard from '@/components/ArticleCard';

import { Article } from '@/types';

import styles from '@/styles/ArticlesPage.module.css';

export const metadata: Metadata = {
  title: 'Articles',
};

const articles: Article[] = [
  {
    id: 'gasi',
    title: 'Silence Before the Break',
    description: 'A threshold model for shared narratives and coordination stress across equity markets.',
    cover_image: '/vscode/logos/vscode_icon.svg',
    url: '/portfolio/research/',
    page_views_count: 0,
    public_reactions_count: 0,
    comments_count: 0,
  },
  {
    id: 'fpl',
    title: 'When Realized Outcomes Outweigh Predictive Signals',
    description: 'What 100,801 Fantasy Premier League player-gameweeks reveal about crowds and information.',
    cover_image: '/vscode/logos/react_icon.svg',
    url: '/portfolio/research/',
    page_views_count: 0,
    public_reactions_count: 0,
    comments_count: 0,
  },
  {
    id: 'phenosync',
    title: 'Asymmetric phenological advance',
    description: 'An open-data workflow for estimating when climate change pushes species out of sync.',
    cover_image: '/vscode/logos/markdown_icon.svg',
    url: '/portfolio/research/',
    page_views_count: 0,
    public_reactions_count: 0,
    comments_count: 0,
  },
];

export default function ArticlesPage() {
  const totalViews = articles.reduce((sum, article) => sum + article.page_views_count, 0);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.headerMain}>
            <div className={styles.iconWrapper}>
              <VscBook className={styles.icon} size={24} />
            </div>

            <div className={styles.headerContent}>
              <div className={styles.headerTop}>
                <h1 className={styles.title}>Articles</h1>
                <div className={styles.stats}>
                  <div className={styles.stat}>
                    <VscGlobe size={14} />
                    <span>{articles.length} posts</span>
                  </div>
                  <div className={styles.divider} />
                  <div className={styles.stat}>
                    <span>{totalViews.toLocaleString()} views</span>
                  </div>
                </div>
              </div>

              <p className={styles.subtitle}>
                Research notes on markets, information, climate, and the systems built to study them.
              </p>
            </div>
          </div>

          <a
            href="/portfolio/research/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.profileLink}
          >
            <span>Research archive</span>
            <VscLinkExternal size={14} />
          </a>
        </header>

        <div className={styles.articlesList}>
          {articles.map((article, index) => (
            <ArticleCard
              key={article.id}
              article={article}
              index={index + 1}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
