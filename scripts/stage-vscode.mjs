import { cp, mkdir, rm } from 'node:fs/promises';
import { resolve } from 'node:path';

// The upstream VS Code portfolio is built as a static, mobile-ready page and
// mounted beside the desktop so its exact routes and assets work in the same
// Vercel deployment.
const root = resolve(import.meta.dirname, '..');
const exported = resolve(root, 'site/vscode/out');
const target = resolve(root, 'site/outer/static/vscode');

await rm(target, { recursive: true, force: true });
await mkdir(target, { recursive: true });
await cp(exported, target, { recursive: true });
console.log('Staged the VS Code portfolio at /vscode.');
