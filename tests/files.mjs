// Shared by the tests: which files are in the repository, and which of them
// the Pages workflow leaves out of the published site.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export const ROOT = new URL('../', import.meta.url);
const SKIP_DIRS = new Set(['.git', 'node_modules', '_site']);

// The local list of confidential terms (gitignored). It is never scanned: it
// holds the terms by design.
export const TERMS_PATH = 'tests/.confidential-terms';

// Every file in the repository, as paths relative to its root: the files git
// tracks plus new files it does not ignore (what a commit could add), so
// ignored local files such as .DS_Store or mobile-preview.html, which never
// reach the deploy's checkout, do not count. Without git, every file in the
// working copy.
const walk = (dir = '') => readdirSync(new URL(dir, ROOT), { withFileTypes: true }).flatMap(e =>
  e.isDirectory() ? (SKIP_DIRS.has(e.name) ? [] : walk(`${dir}${e.name}/`)) : [`${dir}${e.name}`]);
const gitFiles = () => {
  try {
    return execFileSync('git', ['ls-files', '-z', '--cached', '--others', '--exclude-standard'],
      { cwd: fileURLToPath(ROOT), encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 64 << 20 })
      .split('\0').filter(f => f && existsSync(new URL(f, ROOT)));
  } catch { return null; }
};
export const REPO_FILES = (gitFiles() ?? walk()).filter(f => f !== TERMS_PATH).sort();

// The rsync --exclude patterns in .github/workflows/pages.yml, read from the
// file itself so the tests cannot drift from what the deploy does.
export const PAGES_EXCLUDES = [...readFileSync(new URL('.github/workflows/pages.yml', ROOT), 'utf8')
  .matchAll(/--exclude(?:=|\s+)(?:'([^']*)'|"([^"]*)"|([^\s'"\\]+))/g)].map(m => m[1] ?? m[2] ?? m[3]);

// True when rsync, with those patterns, leaves the file out. rsync's rules: a
// pattern ending in / matches directories only; a pattern without a slash
// matches a file or directory name at any depth; a pattern with a slash inside
// matches the end of a path; * matches within one name.
const glob = p => new RegExp(`^${p.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '[^/]*')}$`);
const RULES = PAGES_EXCLUDES.map(p => {
  const dirOnly = p.endsWith('/'), core = dirOnly ? p.slice(0, -1) : p;
  return { dirOnly, anchored: core.includes('/'), re: glob(core) };
});
export function leftOutByPages(file) {
  const parts = file.split('/');
  return RULES.some(({ dirOnly, anchored, re }) => {
    // Each path the file passes through: its folders, then the file itself.
    for (let i = 1; i <= parts.length; i++) {
      if (dirOnly && i === parts.length) break;                   // directory patterns skip the file itself
      const path = parts.slice(0, i);
      if (anchored ? path.some((_, j) => re.test(path.slice(j).join('/'))) : re.test(path.at(-1))) return true;
    }
    return false;
  });
}
