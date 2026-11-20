# Happy Kids Games

10 permainan sentuhan untuk anak 1 hingga 3 tahun. Setiap permainan ada 10 level, dari senang ke susah. Main terus di telefon:

**https://firdauspeace.github.io/HAPPY-KIDS-GAMES/**

## Permainan

| Permainan | Apa anak buat |
|---|---|
| Coloring | Tarik warna ke gambar. 10 gambar, dari bola sampai rama-rama |
| Colors | Cari warna yang disebut |
| Numbers | Kira epal, pilih nombor |
| Shapes | Cari bentuk yang disebut |
| Animals | Cari haiwan yang disebut |
| Animal Sounds | Dengar bunyi, teka haiwan |
| Big & Small | Pilih yang besar atau yang kecil |
| Food | Cari makanan Melayu (nasi lemak, satay, roti canai dan lain-lain) |
| ABC | Cari huruf yang disebut |
| Piano | Dengar lagu, tekan kekunci yang sama |

Ciri lain: nama pemain, skor, suara English yang sudah dirakam, muzik piano perlahan (butang 🎵 untuk matikan), dan animasi bila disentuh. Skor dan level disimpan dalam telefon.

## Fail

- `index.html` – game
- `data.js` – senarai haiwan, warna, makanan, gambar mewarna dan ayat yang disebut
- `clips.js` – klip suara (dijana oleh `tools/fetch-clips.mjs`)
- `tests/check-game.mjs` – semak setiap permainan di setiap level dan setiap ayat ada klip suara

## Tukar atau tambah ayat suara

Selepas ubah `data.js`, jana klip yang baru sahaja, kemudian semak:

```
node tools/fetch-clips.mjs data.js clips.js mp3 en
node tests/check-game.mjs .
```
