// Client names, people at clients and client billing codes must never appear
// in this repository. The repository is public, so the list of those terms is
// not kept in it in any form: not as words, and not as hashes (short names and
// 4-digit codes fall to a brute-force search in minutes, and dictionary-word
// names to a wordlist at once). The terms come from outside the repository:
//
//   - in GitHub Actions, from the CONFIDENTIAL_TERMS repository secret, which
//     the workflows pass to the test step only;
//   - on your computer, from the file tests/.confidential-terms, which
//     .gitignore keeps out of git. Never commit it, and never paste a term
//     into an issue, a pull request, a commit message or a test.
//
// Format: one term per line (| also separates terms on a line). Blank lines and
// lines that start with # are ignored. A term written code:1234 is a client
// billing code, checked only in the demo miniatures (plain numbers like these
// also turn up in SVG path data). Every other term is a name or a two-word
// phrase. Case and accents are ignored.
//
// How a term matches, after regex escapes such as \b \s \w \d (and \B \S \W \D)
// become a space and camelCase is split ("getAcmeData" -> "get Acme Data"):
//   - a name of 5 or more letters matches anywhere, even inside another word
//     or glued into a file name;
//   - a shorter name matches only where the characters on both sides are not
//     letters, so it is not flagged inside an ordinary longer word, but it is
//     in "name2026" or "name-portal";
//   - a two-word phrase matches with any run of non-letters, or none, between
//     the words; each end word follows the rule above for its own length;
//   - a code matches only where the characters on both sides are not digits.
// Text is also checked as written, before those two changes, so neither can
// hide a term.
//
// When no terms are available, `available` is false and the tests that use
// this module skip their name checks. A check returns line numbers only, and
// nothing here prints a term: the CI logs of a public repository are public.
import { readFileSync } from 'node:fs';

export const TERMS_FILE = new URL('./.confidential-terms', import.meta.url);

// Lower case, with accents and look-alike characters folded ("Peña" and
// "Pena" compare equal, a fullwidth letter becomes a plain one), and with
// invisible characters such as soft hyphens and zero-width spaces removed.
const fold = s => s.toLowerCase().normalize('NFKD').replace(/[\p{M}\p{Cf}]+/gu, '').toLowerCase();

// The terms in a CONFIDENTIAL_TERMS value or a tests/.confidential-terms file.
export function parseTerms(source = '') {
  const names = [], codes = [];
  for (const line of String(source).split(/\r\n|\n|\r/)) {
    if (line.trim().startsWith('#')) continue;
    for (const piece of line.split('|')) {
      const term = fold(piece).trim().replace(/\s+/g, ' ');
      if (!term || term.startsWith('#')) continue;
      if (term.startsWith('code:')) {
        const code = term.slice('code:'.length).trim();
        if (code) codes.push(code);
      } else if (/\p{L}/u.test(term)) {
        names.push(term);
      }
    }
  }
  return { names, codes };
}

// Escapes regex syntax characters (only those: the patterns use the u flag,
// which rejects needless escapes such as \-).
const escapeRe = s => s.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');

function namePattern(term) {
  const words = term.split(/\P{L}+/u).filter(Boolean);
  if (!words.length) return null;
  const left = words[0].length >= 5 ? '' : '(?<!\\p{L})';
  const right = words.at(-1).length >= 5 ? '' : '(?!\\p{L})';
  return `${left}${words.map(escapeRe).join('\\P{L}*')}${right}`;
}

const codePattern = code => `(?<!\\d)${escapeRe(code)}(?!\\d)`;

const combine = patterns => {
  const parts = patterns.filter(Boolean);
  return parts.length ? new RegExp(parts.map(p => `(?:${p})`).join('|'), 'gu') : null;
};

// The forms of a text that are checked. None adds or removes a line break, so
// a match's position gives the same line number in every form.
const REGEX_ESCAPE = /\\[bBsSwWdD]/g;
const splitCamel = s => s.replace(/(\p{Ll})(\p{Lu})/gu, '$1 $2').replace(/(\p{Lu})(\p{Lu}\p{Ll})/gu, '$1 $2');
const forms = text => {
  const plain = String(text), unescaped = plain.replace(REGEX_ESCAPE, ' ');
  return [...new Set([plain, unescaped, splitCamel(plain), splitCamel(unescaped)].map(fold))];
};

// 1-based line number of a position in a text.
const lineAt = (breaks, index) => {
  let lo = 0, hi = breaks.length;
  while (lo < hi) { const mid = (lo + hi) >> 1; if (breaks[mid] < index) lo = mid + 1; else hi = mid; }
  return lo + 1;
};

// A matcher for the terms in `source` (the same format as the secret).
// The tests' own checks use the terms from the secret or the local file,
// below; the matcher's self-test passes invented terms in directly.
export function makeMatcher(source = '') {
  const { names, codes } = parseTerms(source);
  const nameRe = combine(names.map(namePattern));
  const codeRe = combine(codes.map(codePattern));
  return {
    available: names.length + codes.length > 0,
    // Line numbers (1-based, ascending) of the text that hold a name, or with
    // { codes: true } a name or a billing code. Only numbers come back, so a
    // failing check never shows the term it found.
    confidentialLines(text, { codes: withCodes = false } = {}) {
      const res = [nameRe, withCodes ? codeRe : null].filter(Boolean);
      const lines = new Set();
      if (!res.length) return [];
      for (const form of forms(text)) {
        const breaks = [];
        for (let i = form.indexOf('\n'); i !== -1; i = form.indexOf('\n', i + 1)) breaks.push(i);
        for (const re of res) for (const m of form.matchAll(re)) {
          lines.add(lineAt(breaks, m.index));
          lines.add(lineAt(breaks, m.index + Math.max(m[0].length - 1, 0)));
        }
      }
      return [...lines].sort((a, b) => a - b);
    },
  };
}

// The terms for this run: the CONFIDENTIAL_TERMS environment variable when it
// holds any, otherwise tests/.confidential-terms when it exists.
function source() {
  const env = process.env.CONFIDENTIAL_TERMS ?? '';
  const { names, codes } = parseTerms(env);
  if (names.length + codes.length) return env;
  try { return readFileSync(TERMS_FILE, 'utf8'); } catch { return ''; }
}

const matcher = makeMatcher(source());
export const available = matcher.available;
export const confidentialLines = matcher.confidentialLines;

// For test(name, { skip: SKIP_REASON }, ...): false when the terms are
// available, otherwise the reason the check is skipped.
export const SKIP_REASON = available ? false
  : 'no confidential terms: set the CONFIDENTIAL_TERMS secret (GitHub Actions) or create tests/.confidential-terms (local runs); see README.md, Security upkeep';

// In GitHub Actions, a skipped check also shows as a warning on the run.
export function warnIfSkipped() {
  if (!available && process.env.GITHUB_ACTIONS === 'true')
    console.log('::warning::The CONFIDENTIAL_TERMS secret is not set, so the client-name check was skipped.');
}
