import { cp, mkdir, rm } from 'node:fs/promises';
import { resolve } from 'node:path';

// The personal site (Next static export) is copied into the outer shell's
// static root, so one deployment serves both AdityaOS and /portfolio.
const root = resolve(import.meta.dirname, '..');
const exported = resolve(root, 'site/portfolio/out');
const target = resolve(root, 'site/outer/static/portfolio');

await rm(target, { recursive: true, force: true });
await mkdir(target, { recursive: true });
await cp(exported, target, { recursive: true });
console.log('Staged the personal portfolio at /portfolio.');
