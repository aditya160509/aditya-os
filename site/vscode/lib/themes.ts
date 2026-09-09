export interface ThemeInfo {
  name: string;
  theme: string;
  icon: string;
  publisher: string;
}

export const THEMES: ThemeInfo[] = [
  {
    name: 'GitHub Dark',
    theme: 'github-dark',
    icon: '/vscode/themes/github-dark.png',
    publisher: 'GitHub',
  },
  {
    name: 'Dracula',
    theme: 'dracula',
    icon: '/vscode/themes/dracula.png',
    publisher: 'Dracula Theme',
  },
  {
    name: 'Ayu Dark',
    theme: 'ayu-dark',
    icon: '/vscode/themes/ayu.png',
    publisher: 'teabyii',
  },
  {
    name: 'Ayu Mirage',
    theme: 'ayu-mirage',
    icon: '/vscode/themes/ayu.png',
    publisher: 'teabyii',
  },
  {
    name: 'Nord',
    theme: 'nord',
    icon: '/vscode/themes/nord.png',
    publisher: 'arcticicestudio',
  },
  {
    name: 'Night Owl',
    theme: 'night-owl',
    icon: '/vscode/themes/night-owl.png',
    publisher: 'sarah.drasner',
  },
];

export const THEME_KEYS = THEMES.map(t => t.theme) as [string, ...string[]];
