// Self-check: runs the game's script against a stub DOM, then checks every mode at every level
// and that every spoken phrase has a recorded clip. Usage: node check-game.mjs <folder>
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const dir = process.argv[2];
const html = readFileSync(join(dir, 'index.html'), 'utf8');
const main = html.match(/<script>\n([\s\S]*?)<\/script>/)[1];

const fake = new Proxy(function () {}, {
  get: (t, p) => p === Symbol.toPrimitive ? () => '' : p === 'forEach' ? () => {} : p === 'hidden' ? true : fake,
  set: () => true,
  apply: () => fake
});
const ctx = { window: {}, document: fake, addEventListener: () => {}, setTimeout: () => 0, setInterval: () => 0, clearInterval: () => {}, clearTimeout: () => {}, console };
ctx.window = ctx;
vm.createContext(ctx);
vm.runInContext(readFileSync(join(dir, 'data.js'), 'utf8'), ctx);
vm.runInContext(readFileSync(join(dir, 'clips.js'), 'utf8'), ctx);

const test = `
  const out = [];
  for (const key of Object.keys(MODES)) {
    for (let l = 1; l <= MAX_LEVEL; l++) {
      for (let i = 0; i < 40; i++) {
        const r = MODES[key].round(l);
        const n = r.options.length, ok = r.options.filter(o => o.ok).length;
        if (n < 2 || n > 4 || ok !== 1) out.push(key + ' L' + l + ': ' + n + ' options, ' + ok + ' correct');
        if (!window.CLIPS[r.say]) out.push(key + ' L' + l + ': no clip for "' + r.say + '"');
      }
    }
  }
  if (D.PICTURES.length !== MAX_LEVEL) out.push('coloring has ' + D.PICTURES.length + ' pictures');
  for (const l of [1, 3, 4, 6, 7, 10]) if (TUNE_LENGTH[l - 1] < 1) out.push('piano L' + l);
  out;
`;
const problems = vm.runInContext(main + '\n' + test, ctx);

const literals = [...main.matchAll(/say\('([^']+)'\)/g)].map(m => m[1]);
const missing = [...ctx.window.GAME.allPhrases(), ...literals].filter(p => !ctx.window.CLIPS[p]);
assert.deepEqual(missing, [], 'phrases without a clip');
assert.equal(problems.length, 0, 'round problems:\n' + [...problems].join('\n'));
console.log(`OK: ${Object.keys(ctx.window.CLIPS).length} clips, all modes x 10 levels produce valid rounds`);
