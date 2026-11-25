# Turkey Time

A Thanksgiving countdown and play app for kids, made for an Android tablet.

- **Countdown** – sleeps until Thanksgiving; the turkey grows a feather each day of the last week.
- **Dress the Turkey** – hats, glasses, necklaces, things to hold, feathers and places. Save the picture.
- **Thankful Tree** – add leaves by picking a picture, drawing, or writing.
- **Pie Match** – memory game with 4, 8, 12 or 16 cards.
- **Catch the Feast** – slide the basket to catch falling food.
- **Word Search** – find hidden Thanksgiving words; drag across a word, or tap its first and last letter.
- **Crossword** – a new picture-clue crossword every time, with letter buttons so no keyboard is needed.

Each kid has their own player button. Press and hold the gear on the home screen for grown-up settings
(sound, names, little-kid or big-kid difficulty, reset).

No ads, no accounts, no tracking. Everything is saved only on the device, and the app works offline after the first visit.

## Put it on the tablet

1. Publish this folder with GitHub Pages (Settings → Pages → Deploy from a branch → `main`, `/ (root)`).
2. Open the Pages address in Chrome on the tablet.
3. Tap the ⋮ menu → **Add to Home screen** → **Install**.

## Run it on a computer

It is plain HTML, CSS and JavaScript with no build step:

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000. Add `?date=2026-11-26` to the address to preview another day.

## Updating

After changing any file, bump `VERSION` in `sw.js` so tablets fetch the new copy.

The Fredoka font is used under the SIL Open Font License (see `fonts/LICENSE-fredoka.txt`).
