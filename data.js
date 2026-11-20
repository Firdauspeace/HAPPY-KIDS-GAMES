// Game content: items, what the voice says, coloring pictures and food drawings.
// Pure data (no DOM), so the clip downloader can read the same phrase list.
(function (W) {
  const SHAPES = [
    { id: 'circle', color: '#ff6b8b', d: '<circle cx="50" cy="50" r="42"/>' },
    { id: 'square', color: '#4fc3f7', d: '<rect x="10" y="10" width="80" height="80" rx="8"/>' },
    { id: 'triangle', color: '#ffca28', d: '<polygon points="50,6 96,92 4,92"/>' },
    { id: 'star', color: '#ab47bc', d: '<polygon points="50,4 61,37 96,37 68,58 79,92 50,72 21,92 32,58 4,37 39,37"/>' },
    { id: 'heart', color: '#ff5252', d: '<path d="M50 88C20 66 6 48 6 32C6 18 17 8 30 8C40 8 47 14 50 22C53 14 60 8 70 8C83 8 94 18 94 32C94 48 80 66 50 88Z"/>' },
    { id: 'oval', color: '#43a047', d: '<ellipse cx="50" cy="50" rx="44" ry="28"/>' }
  ];
  // mono: same colour for every shape at hard levels, so only the shape tells them apart
  const shapeSvg = (s, mono) => `<svg viewBox="0 0 100 100"><g fill="${mono ? '#7e57c2' : s.color}">${s.d}</g></svg>`;

  const ANIMALS = [
    { id: 'cat', html: '🐱' }, { id: 'dog', html: '🐶' }, { id: 'fish', html: '🐟' },
    { id: 'chicken', html: '🐔' }, { id: 'cow', html: '🐮' }, { id: 'elephant', html: '🐘' },
    { id: 'rabbit', html: '🐰' }, { id: 'duck', html: '🦆' }, { id: 'monkey', html: '🐵' },
    { id: 'horse', html: '🐴' }, { id: 'tiger', html: '🐯' }, { id: 'frog', html: '🐸' }
  ];
  const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(l => ({ id: l, html: l }));
  const NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => ({ id: n, html: String(n) }));

  const COLORS = [
    { id: 'red', c: '#e53935' }, { id: 'blue', c: '#1e88e5' }, { id: 'yellow', c: '#fdd835' },
    { id: 'green', c: '#43a047' }, { id: 'orange', c: '#fb8c00' }, { id: 'purple', c: '#8e24aa' },
    { id: 'pink', c: '#f48fb1' }, { id: 'brown', c: '#795548' }, { id: 'black', c: '#212121' },
    { id: 'white', c: '#ffffff' }
  ];
  const colorSvg = c => `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="44" fill="${c.c}" stroke="#bdb5a6" stroke-width="3"/></svg>`;

  // Animal sounds are spoken by the voice (easy first)
  const SOUNDS = [
    { id: 'cat', html: '🐱', sound: 'Meow, meow!' }, { id: 'dog', html: '🐶', sound: 'Woof, woof!' },
    { id: 'cow', html: '🐮', sound: 'Moo, moo!' }, { id: 'rooster', html: '🐓', sound: 'Cock-a-doodle-doo!' },
    { id: 'duck', html: '🦆', sound: 'Quack, quack!' }, { id: 'goat', html: '🐐', sound: 'Maa, maa!' },
    { id: 'bird', html: '🐦', sound: 'Tweet, tweet!' }, { id: 'frog', html: '🐸', sound: 'Ribbit, ribbit!' },
    { id: 'tiger', html: '🐯', sound: 'Roar!' }, { id: 'monkey', html: '🐵', sound: 'Ooh ooh, aah aah!' },
    { id: 'horse', html: '🐴', sound: 'Neigh!' }, { id: 'bee', html: '🐝', sound: 'Buzz, buzz!' },
    { id: 'snake', html: '🐍', sound: 'Hiss!' }
  ];

  // rank = real-life size, small to big
  const SIZES = [
    { id: 'semut', html: '🐜', rank: 1 }, { id: 'lebah', html: '🐝', rank: 2 }, { id: 'tikus', html: '🐁', rank: 3 },
    { id: 'katak', html: '🐸', rank: 4 }, { id: 'arnab', html: '🐇', rank: 5 }, { id: 'kucing', html: '🐈', rank: 6 },
    { id: 'anjing', html: '🐕', rank: 7 }, { id: 'kambing', html: '🐐', rank: 8 }, { id: 'harimau', html: '🐅', rank: 9 },
    { id: 'lembu', html: '🐄', rank: 10 }, { id: 'kuda', html: '🐎', rank: 11 }, { id: 'zirafah', html: '🦒', rank: 12 },
    { id: 'gajah', html: '🐘', rank: 13 }, { id: 'ikan paus', html: '🐋', rank: 14 }
  ];

  const sv = body => `<svg viewBox="0 0 100 100">${body}</svg>`;
  const bowl = (y, ry) => `<path d="M10 ${y} H90 A40 ${ry} 0 0 1 10 ${y}Z" fill="#fff" stroke="#bbb" stroke-width="2"/>`;
  const crimp = [[12, 68], [14.9, 53.5], [23.1, 41.1], [35.5, 32.9], [50, 30], [64.5, 32.9], [76.9, 41.1], [85.1, 53.5], [88, 68]]
    .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5"/>`).join('');
  const satayRow = y => [22, 40, 58].map(x => `<rect x="${x}" y="${y}" width="14" height="14" rx="4"/>`).join('');
  const layers = [20, 30, 40, 50, 60, 70].map((y, i) => `<rect x="20" y="${y}" width="60" height="10" fill="${i % 2 ? '#fce4ec' : '#ec407a'}"/>`).join('');

  // Malay food in Malaysia (most familiar first)
  const FOODS = [
    { id: 'nasi lemak', html: sv(`<ellipse cx="50" cy="60" rx="47" ry="32" fill="#43a047"/><ellipse cx="50" cy="60" rx="40" ry="26" fill="#66bb6a"/>
      <ellipse cx="40" cy="52" rx="20" ry="15" fill="#fff" stroke="#e0e0e0" stroke-width="2"/><ellipse cx="68" cy="48" rx="12" ry="9" fill="#d32f2f"/>
      <ellipse cx="66" cy="70" rx="12" ry="9" fill="#fff" stroke="#e0e0e0" stroke-width="1.5"/><circle cx="66" cy="70" r="5" fill="#fbc02d"/>
      <circle cx="28" cy="72" r="6" fill="#7cb342"/><circle cx="28" cy="72" r="3.5" fill="#dcedc8"/>
      <circle cx="40" cy="77" r="6" fill="#7cb342"/><circle cx="40" cy="77" r="3.5" fill="#dcedc8"/>
      <g fill="#a1662f"><ellipse cx="52" cy="73" rx="3" ry="2"/><ellipse cx="55" cy="78" rx="3" ry="2"/><ellipse cx="50" cy="81" rx="3" ry="2"/></g>`) },
    { id: 'satay', html: sv(`<g stroke="#c8a165" stroke-width="3" stroke-linecap="round"><line x1="8" y1="22" x2="92" y2="22"/><line x1="8" y1="38" x2="92" y2="38"/><line x1="8" y1="54" x2="92" y2="54"/></g>
      <g fill="#8d4a1c">${satayRow(15)}${satayRow(31)}${satayRow(47)}</g>
      <path d="M22 72 H78 A28 20 0 0 1 22 72Z" fill="#fff" stroke="#bbb" stroke-width="2"/><ellipse cx="50" cy="72" rx="28" ry="6" fill="#c77b30"/>`) },
    { id: 'roti canai', html: sv(`<circle cx="50" cy="52" r="46" fill="#eceff1"/><circle cx="44" cy="56" r="34" fill="#f3c26b"/>
      <circle cx="44" cy="56" r="24" fill="none" stroke="#d9a441" stroke-width="3"/><circle cx="44" cy="56" r="13" fill="none" stroke="#d9a441" stroke-width="3"/>
      <circle cx="80" cy="22" r="15" fill="#fff" stroke="#bbb" stroke-width="2"/><circle cx="80" cy="22" r="11" fill="#e65100"/>`) },
    { id: 'teh tarik', html: sv(`<path d="M28 22 H72 L66 92 H34 Z" fill="#c58b52" stroke="#8d6e63" stroke-width="3" stroke-linejoin="round"/>
      <path d="M29.5 23.5 H70.5 L69.5 36 H30.5 Z" fill="#f5e6d3"/>
      <path d="M42 16 q-4 -6 0 -12 M56 16 q-4 -6 0 -12" fill="none" stroke="#bdb5a6" stroke-width="3" stroke-linecap="round"/>`) },
    { id: 'pisang goreng', html: sv(`<ellipse cx="50" cy="66" rx="47" ry="26" fill="#eceff1"/>
      <g fill="#f0a830" stroke="#c77800" stroke-width="2"><ellipse cx="50" cy="44" rx="34" ry="10" transform="rotate(-12 50 44)"/>
      <ellipse cx="50" cy="60" rx="34" ry="10" transform="rotate(8 50 60)"/><ellipse cx="50" cy="76" rx="32" ry="10" transform="rotate(-5 50 76)"/></g>
      <g fill="#b06a10"><circle cx="40" cy="45" r="2"/><circle cx="62" cy="41" r="2"/><circle cx="45" cy="60" r="2"/><circle cx="66" cy="63" r="2"/><circle cx="55" cy="76" r="2"/></g>`) },
    { id: 'nasi goreng', html: sv(`<ellipse cx="50" cy="62" rx="47" ry="30" fill="#eceff1"/><ellipse cx="50" cy="58" rx="36" ry="22" fill="#f4b860"/>
      <g fill="#7cb342"><circle cx="28" cy="60" r="3"/><circle cx="72" cy="62" r="3"/><circle cx="56" cy="72" r="3"/><circle cx="38" cy="70" r="3"/></g>
      <g fill="#e53935"><circle cx="66" cy="50" r="2.5"/><circle cx="30" cy="50" r="2.5"/><circle cx="48" cy="74" r="2.5"/></g>
      <path d="M36 46 Q38 32 52 34 Q66 30 66 44 Q66 56 52 54 Q38 58 36 46Z" fill="#fff" stroke="#e0e0e0" stroke-width="1.5"/><circle cx="51" cy="44" r="7" fill="#fbc02d"/>`) },
    { id: 'karipap', html: sv(`<path d="M12 68 A38 38 0 0 1 88 68 Z" fill="#f2b155" stroke="#c77800" stroke-width="2"/><g fill="#e09a3e">${crimp}</g>`) },
    { id: 'cendol', html: sv(`${bowl(45, 36)}<ellipse cx="50" cy="45" rx="40" ry="10" fill="#fff8e1"/>
      <ellipse cx="50" cy="34" rx="20" ry="13" fill="#e3f2fd" stroke="#bbdefb" stroke-width="2"/>
      <g fill="none" stroke="#7cb342" stroke-width="4" stroke-linecap="round"><path d="M20 46 q5 -6 10 0 t10 0"/><path d="M56 46 q5 -6 10 0 t10 0"/><path d="M38 52 q5 -6 10 0 t10 0"/></g>
      <path d="M34 30 Q50 42 66 30" fill="none" stroke="#6d4c41" stroke-width="4" stroke-linecap="round"/>`) },
    { id: 'ketupat', html: sv(`<polygon points="50,14 86,50 50,86 14,50" fill="#9ccc65" stroke="#558b2f" stroke-width="3"/>
      <g stroke="#558b2f" stroke-width="2.5"><line x1="41" y1="23" x2="77" y2="59"/><line x1="32" y1="32" x2="68" y2="68"/><line x1="23" y1="41" x2="59" y2="77"/>
      <line x1="59" y1="23" x2="23" y2="59"/><line x1="68" y1="32" x2="32" y2="68"/><line x1="77" y1="41" x2="41" y2="77"/></g>
      <path d="M50 14 Q54 6 62 4 M50 14 Q44 6 38 6" fill="none" stroke="#558b2f" stroke-width="3" stroke-linecap="round"/>`) },
    { id: 'rendang', html: sv(`${bowl(48, 34)}<ellipse cx="50" cy="48" rx="40" ry="10" fill="#5d2a0c"/>
      <g fill="#7b3f1a" stroke="#4e2208" stroke-width="1.5"><circle cx="34" cy="42" r="10"/><circle cx="56" cy="38" r="11"/><circle cx="72" cy="45" r="8"/><circle cx="46" cy="50" r="7"/></g>
      <path d="M62 30 q6 -8 12 -4" fill="none" stroke="#e53935" stroke-width="4" stroke-linecap="round"/>`) },
    { id: 'kuih lapis', html: sv(`${layers}<rect x="20" y="20" width="60" height="60" rx="3" fill="none" stroke="#ad1457" stroke-width="3"/>`) },
    { id: 'lemang', html: sv(`<rect x="10" y="16" width="80" height="24" rx="11" fill="#8bc34a" stroke="#558b2f" stroke-width="3"/>
      <line x1="40" y1="16" x2="40" y2="40" stroke="#558b2f" stroke-width="3"/><line x1="66" y1="16" x2="66" y2="40" stroke="#558b2f" stroke-width="3"/>
      <g fill="#6d4c41"><circle cx="24" cy="70" r="15"/><circle cx="50" cy="74" r="15"/><circle cx="76" cy="70" r="15"/></g>
      <g fill="#fff8e1"><circle cx="24" cy="70" r="10"/><circle cx="50" cy="74" r="10"/><circle cx="76" cy="70" r="10"/></g>`) }
  ];

  // Coloring pictures, one per level, from few parts to many. Parts with class "region" can be coloured.
  const R = 'class="region"';
  const PICTURES = [
    // 1 bola
    `<circle ${R} cx="150" cy="150" r="110"/><path ${R} d="M150 40C110 90 110 210 150 260C190 210 190 90 150 40Z"/><circle ${R} cx="150" cy="150" r="20"/>`,
    // 2 epal
    `<path ${R} d="M150 95C120 70 60 75 60 150C60 220 110 265 150 245C190 265 240 220 240 150C240 75 180 70 150 95Z"/>
     <rect ${R} x="145" y="55" width="10" height="40"/><path ${R} d="M155 75C175 45 215 45 225 60C205 80 175 85 155 75Z"/>`,
    // 3 matahari
    `<polygon ${R} points="150,20 185,65 242,58 235,115 280,150 235,185 242,242 185,235 150,280 115,235 58,242 65,185 20,150 65,115 58,58 115,65"/>
     <circle ${R} cx="150" cy="150" r="80"/><circle ${R} cx="112" cy="170" r="13"/><circle ${R} cx="188" cy="170" r="13"/>
     <circle class="eye" cx="122" cy="135" r="8"/><circle class="eye" cx="178" cy="135" r="8"/><path class="deco" d="M120 182Q150 208 180 182"/>`,
    // 4 belon
    `<path class="deco" d="M100 175Q90 220 140 290"/><path class="deco" d="M200 165Q215 220 160 290"/><path class="deco" d="M150 215Q145 250 150 290"/>
     <ellipse ${R} cx="100" cy="110" rx="45" ry="55"/><ellipse ${R} cx="200" cy="100" rx="45" ry="55"/><ellipse ${R} cx="150" cy="150" rx="45" ry="55"/>
     <polygon ${R} points="92,177 108,177 100,165"/><polygon ${R} points="192,167 208,167 200,155"/><polygon ${R} points="142,217 158,217 150,205"/>`,
    // 5 ikan
    `<rect ${R} x="0" y="250" width="300" height="50"/><path ${R} d="M40 250C30 220 55 210 45 180C62 205 52 228 62 250Z"/>
     <circle ${R} cx="60" cy="60" r="16"/><circle ${R} cx="38" cy="102" r="10"/><polygon ${R} points="215,140 280,92 280,188"/>
     <polygon ${R} points="110,98 150,58 172,100"/><ellipse ${R} cx="140" cy="145" rx="82" ry="52"/><circle ${R} cx="96" cy="132" r="13"/>`,
    // 6 bot
    `<circle ${R} cx="50" cy="55" r="28"/><ellipse ${R} cx="232" cy="52" rx="40" ry="18"/>
     <path ${R} d="M0 220Q37 205 75 220T150 220T225 220T300 220L300 300L0 300Z"/>
     <rect ${R} x="146" y="60" width="8" height="140"/><polygon ${R} points="154,42 185,52 154,62"/>
     <polygon ${R} points="158,70 158,190 235,190"/><polygon ${R} points="142,88 142,190 80,190"/><polygon ${R} points="60,200 240,200 210,245 90,245"/>`,
    // 7 kereta
    `<rect ${R} x="0" y="228" width="300" height="50"/>
     <path ${R} d="M30 192L30 150Q30 135 50 135L90 135L120 95L200 95L235 135L260 135Q275 135 275 155L275 192Z"/>
     <polygon ${R} points="100,135 126,105 158,105 158,135"/><polygon ${R} points="168,135 168,105 196,105 222,135"/>
     <rect ${R} x="255" y="146" width="16" height="12"/>
     <circle ${R} cx="85" cy="195" r="30"/><circle ${R} cx="85" cy="195" r="12"/><circle ${R} cx="220" cy="195" r="30"/><circle ${R} cx="220" cy="195" r="12"/>`,
    // 8 rumah
    `<circle ${R} cx="250" cy="50" r="32"/><ellipse ${R} cx="75" cy="62" rx="42" ry="24"/>
     <rect ${R} x="200" y="200" width="20" height="50"/><circle ${R} cx="210" cy="180" r="34"/>
     <rect ${R} x="90" y="150" width="120" height="100"/><polygon ${R} points="75,155 150,90 225,155"/>
     <rect ${R} x="135" y="195" width="30" height="55"/><rect ${R} x="165" y="165" width="28" height="28"/><rect ${R} x="0" y="250" width="300" height="50"/>`,
    // 9 bunga
    `<polygon ${R} points="108,232 192,232 180,292 120,292"/><rect ${R} x="146" y="128" width="8" height="104"/>
     <path ${R} d="M150 205C130 182 104 186 98 197C114 209 134 212 150 205Z"/><path ${R} d="M154 182C176 160 202 166 206 176C190 188 170 190 154 182Z"/>
     <circle ${R} cx="150" cy="60" r="27"/><circle ${R} cx="190" cy="88" r="27"/><circle ${R} cx="175" cy="133" r="27"/>
     <circle ${R} cx="125" cy="133" r="27"/><circle ${R} cx="110" cy="88" r="27"/><circle ${R} cx="150" cy="100" r="22"/>`,
    // 10 rama-rama
    `<path class="deco" d="M146 82Q130 55 118 50"/><path class="deco" d="M154 82Q170 55 182 50"/>
     <path ${R} d="M145 140C100 60 30 60 40 120C45 160 100 165 145 150Z"/><path ${R} d="M155 140C200 60 270 60 260 120C255 160 200 165 155 150Z"/>
     <path ${R} d="M145 160C100 165 60 200 80 235C100 260 140 220 145 175Z"/><path ${R} d="M155 160C200 165 240 200 220 235C200 260 160 220 155 175Z"/>
     <circle ${R} cx="85" cy="115" r="14"/><circle ${R} cx="215" cy="115" r="14"/><circle ${R} cx="100" cy="215" r="10"/><circle ${R} cx="200" cy="215" r="10"/>
     <ellipse ${R} cx="150" cy="160" rx="10" ry="60"/><circle ${R} cx="150" cy="92" r="14"/>`
  ];

  // Everything the voice says. Each string must match a recorded clip in clips.js.
  const SAY = {
    numbers: () => 'How many apples?',
    shape: t => `Where is the ${t.id}?`,
    animal: t => `Where is the ${t.id}?`,
    abc: t => `Where is the letter ${t.id}?`,
    warna: t => `Find the color ${t.id}!`,
    bunyi: t => `${t.sound} Who says that?`,
    makanan: t => `Where is the ${t.id}?`,
    big: 'Which one is big?',
    small: 'Which one is small?',
    piano: 'Listen, then play the same!'
  };
  const GOOD = ['Wow! Good job!', 'Wow! Good job! So clever!', 'Yay! Good job!'];
  const BAD = 'Oops! Try again!';
  const LEVEL_UP = 'Wow! Level up! Great job!';
  const CHAMP = 'Wow! Congratulations! You are the champion!';
  // No apostrophes here: the self-check reads say('...') literals from the page
  const OTHER = ['Please write your name.', 'Hi there! Time to play!', 'Time to color!', 'Wow! All done! So pretty! Good job!', 'Here is a new picture!'];

  const allPhrases = () => [...new Set([
    SAY.numbers(), ...SHAPES.map(SAY.shape), ...ANIMALS.map(SAY.animal), ...LETTERS.map(SAY.abc),
    ...COLORS.map(SAY.warna), ...SOUNDS.map(SAY.bunyi), ...FOODS.map(SAY.makanan),
    SAY.big, SAY.small, SAY.piano, ...GOOD, BAD, LEVEL_UP, CHAMP, ...OTHER
  ])];

  W.GAME = { SHAPES, shapeSvg, ANIMALS, LETTERS, NUMBERS, COLORS, colorSvg, SOUNDS, SIZES, FOODS, PICTURES,
    SAY, GOOD, BAD, LEVEL_UP, CHAMP, allPhrases };
})(window);
