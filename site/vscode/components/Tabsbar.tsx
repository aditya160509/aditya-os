import Tab from '@/components/Tab';

import styles from '@/styles/Tabsbar.module.css';

const Tabsbar = () => {
  return (
    <div className={styles.tabs}>
      <Tab icon="/vscode/logos/react_icon.svg" filename="home.tsx" path="/" />
      <Tab icon="/vscode/logos/html_icon.svg" filename="about.html" path="/about" />
      <Tab icon="/vscode/logos/css_icon.svg" filename="contact.css" path="/contact" />
      <Tab icon="/vscode/logos/js_icon.svg" filename="projects.js" path="/projects" />
      <Tab
        icon="/vscode/logos/json_icon.svg"
        filename="articles.json"
        path="/articles"
      />
      <Tab
        icon="/vscode/logos/markdown_icon.svg"
        filename="github.md"
        path="/github"
      />
    </div>
  );
};

export default Tabsbar;
