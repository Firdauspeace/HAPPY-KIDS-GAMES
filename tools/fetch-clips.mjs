// Downloads Malay Google voice clips for every phrase in data.js and writes clips.js.
// Phrases that already have a clip in clips.js are kept, not downloaded again.
// Usage: node fetch-clips.mjs <data.js> <clips.js> <mp3Dir> [lang, default ms]
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import vm from 'node:vm';

const [, , dataFile, clipsFile, mp3Dir, lang = 'ms'] = process.argv;
if (!dataFile || !clipsFile || !mp3Dir) { console.error('usage: node fetch-clips.mjs <data.js> <clips.js> <mp3Dir>'); process.exit(1); }

const ctx = { window: {} };
vm.runInNewContext(await readFile(dataFile, 'utf8'), ctx);
const phrases = ctx.window.GAME.allPhrases();

let clips = {};
if (existsSync(clipsFile)) {
  const c = { window: {} };
  vm.runInNewContext(await readFile(clipsFile, 'utf8'), c);
  clips = c.window.CLIPS || {};
}

await mkdir(mp3Dir, { recursive: true });
const failed = [];
let fetched = 0;
for (const [i, p] of phrases.entries()) {
  if (clips[p]) continue;
  const url = 'https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=' + lang + '&q=' + encodeURIComponent(p);
  try {
    const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const buf = Buffer.from(await r.arrayBuffer());
    const isMp3 = buf.subarray(0, 3).toString() === 'ID3' || (buf[0] === 0xff && (buf[1] & 0xe0) === 0xe0);
    if (!r.ok || buf.length < 800 || !isMp3) { failed.push(`${p} (${r.status}, ${buf.length}B)`); continue; }
    await writeFile(join(mp3Dir, 'new-' + String(i).padStart(3, '0') + '.mp3'), buf);
    clips[p] = 'data:audio/mpeg;base64,' + buf.toString('base64');
    fetched++;
  } catch (e) { failed.push(`${p} (${e.message})`); }
  await new Promise(r => setTimeout(r, 300));
}
// Keep only phrases the game still uses
const kept = Object.fromEntries(phrases.filter(p => clips[p]).map(p => [p, clips[p]]));
await writeFile(clipsFile, '// Recorded Malay voice clips, keyed by the exact text the game says\nwindow.CLIPS = ' + JSON.stringify(kept) + ';\n');
const chars = Object.values(kept).reduce((s, v) => s + v.length, 0);
console.log(`phrases ${phrases.length}, have clip ${Object.keys(kept).length}, newly fetched ${fetched}, clips.js ~${Math.round(chars / 1024)} KB`);
if (failed.length) console.log('failed:\n' + failed.join('\n'));
