export interface Project {
  title: string;
  description: string;
  logo: string;
  link: string;
  slug: string;
}

export const projects: Project[] = [
  {
    title: 'AdityaOS',
    description:
      'A playful 3D workstation portfolio with working apps, research, games, live presence, and an installable desktop.',
    logo: '/vscode/logos/vscode_icon.svg',
    link: '/',
    slug: 'aditya-os',
  },
  {
    title: 'ATLAS · QUANT360',
    description:
      'A quantitative research platform for signal discovery, portfolio construction, robustness checks, and market attention analysis.',
    logo: '/vscode/logos/react_icon.svg',
    link: '/portfolio/projects/atlas/',
    slug: 'atlas-quant360',
  },
  {
    title: 'NEXUS Exchange',
    description:
      'An agent-based market simulator used to study coordination, liquidity, and investor attention across thousands of runs.',
    logo: '/vscode/logos/js_icon.svg',
    link: '/portfolio/projects/nexus/',
    slug: 'nexus-exchange',
  },
  {
    title: 'PhenoSync',
    description:
      'An open-data pipeline for estimating climate-driven phenological mismatch without letting observation effort distort the result.',
    logo: '/vscode/logos/markdown_icon.svg',
    link: '/portfolio/projects/phenosync/',
    slug: 'phenosync',
  },
];
