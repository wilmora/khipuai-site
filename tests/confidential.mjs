// Client names, people and billing codes that must never appear in this
// repository. The repository is public, so the list itself must not name
// anyone: it holds the SHA-256 of each lower-case word or two-word phrase,
// never the words. A check hashes every word and pair of adjacent words in a
// file and looks them up here.
//
// To add a term, hash it lower-case and add the hash with a comment saying
// what kind of term it is (client, person, code), not what it is:
//   node -e "console.log(require('node:crypto').createHash('sha256').update('the term').digest('hex'))"
// A hash cannot be read back, but anyone who already suspects a name can
// test it against this list. Keep the list short and specific.
import { createHash } from 'node:crypto';

// Client and project names, and people at clients (whole words or two-word phrases).
export const NAMES = new Set([
  'b8a5516ee8e50c9cc6bb89598c6cc404dded5cf48a0d9390cf6215641a233e6e',
  '8b5ac3579a1b698fb6167820d12b8458ece4f2de6581fd52d3a389029066b199',
  '478ba9965f38aaad7af3fe3a4bdd107d9cb68a35e398f53e3bcb40a00771fd3a',
  '7091d993cb3475877654d63c3d87a6ed309b8a2cbc4fae54f53e291d3d71b6ae',
  '831c07d25d377ae70687d549017ba5356446ebaa3546bec4b0054e8f723c1886',
  '2ce8d05aa723e28e3bcd65f7fc4680a62ecd07a2e4fae46392279a6940318295',
  '66b2bf140f8711dd494d61f171846c41f7dc7e91cca02297226967e2c82df2dd',
  '07f15cde5b181425db8524becd96263d600c9652c7de5b89fe1a644f8fd0724b',
  '12aea5f4cd614e6bbcdd214c0e2286e75d62d5c6c348096d56b8bd20393226d8',
  'c252c99dc7f6d49d3faa4a43643cc55e3149534c2ddfcf12549d13284a7d2542',
  '351fda740bdbb2faf4dd107c83b7772a7001a443b07acb52081e66f678bf37a3',
  '9ae74ff8dba1429658f9e6aeb52a3c04c4255bb5898d12228dda1ee84f0fd3fe',
]);

// A client's billing item codes. Plain numbers like these also turn up in
// unrelated files (SVG path data), so only the demo miniatures check them.
export const CODES = new Set([
  'ab9828ca390581b72629069049793ba3c99bb8e5e9e7b97a55c71957e04df9a3',
  '36ab771eba23f49d7ae43af88c601f3de8fccb201250906a4085444ae765f2db',
  '277375b99e186c72ac38ac47b03199038342fe0389be8765476fa2be0c5b5649',
  'f0d588a225e6e6ba0501a3f787230abf579f6db2dd55be0fa3450f8acd54e6f3',
  'd74fe97872d8a425b5263add13d51a1066bf0b2cdd5e368d316dfe31048b2104',
  '47c5fbf51c636da0b48309ad799e2e4d0443b9c25b055c6b762d6b6f6d95fc52',
  'fb7bab9edf08f024aabf3501518399e82ab590666207a8b0ab7963b181ecf4b8',
  '86cb35a822329fe1de40eb82a1791be1f66f8bd327446686bdd859a89e436853',
  '737c6b9773fa031bee4787ad780d2c9c9ecb3375a7c1f4dbd8047a6cd5c67b4c',
  '6711597a2bc4e5878638c2115353f0792a9bec6ff55a84f283c4be5d897fe110',
  '829f00a11ddfdebb51b67a913981eddb7937c3f8f01f4140415a24ff1cc29609',
]);

const seen = new Map();
const sha = s => {
  let h = seen.get(s);
  if (h === undefined) { h = createHash('sha256').update(s).digest('hex'); seen.set(s, h); }
  return h;
};

// Lower-case words of a line, with camelCase split ("AcmeCorp" -> acme, corp).
const words = line => line.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);

// Line numbers (1-based) of the text that hold a listed word or two-word
// phrase. Only line numbers come back, so a failing check never prints the
// term it found (CI logs of a public repository are public too).
export function confidentialLines(text, lists = [NAMES]) {
  const hit = s => lists.some(list => list.has(sha(s)));
  const lines = [];
  text.split('\n').forEach((line, i) => {
    const w = words(line);
    if (w.some((x, j) => hit(x) || (j + 1 < w.length && hit(`${x} ${w[j + 1]}`)))) lines.push(i + 1);
  });
  return lines;
}
