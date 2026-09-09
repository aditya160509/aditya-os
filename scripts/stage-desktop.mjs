import { cp, mkdir, rm } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const exported = resolve(root, 'site/inner/build');
const staticRoot = resolve(root, 'site/outer/static');
const desktop = resolve(staticRoot, 'desktop');

await rm(desktop, { recursive: true, force: true });
await rm(resolve(staticRoot, '_next'), { recursive: true, force: true });
await mkdir(desktop, { recursive: true });
await cp(exported, desktop, { recursive: true });
// The outer shell already owns the canonical copies of the UI sounds and
// radio tracks at /audio. The inner public folder is retained for standalone
// CRA development, but must not be shipped a second time under /desktop.
await rm(resolve(desktop, 'audio'), { recursive: true, force: true });
console.log('Staged AdityaOS at /desktop.');
