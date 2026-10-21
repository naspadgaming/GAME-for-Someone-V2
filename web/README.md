# Web prototype: Sunflower Gift Game

Open `web/index.html` in a browser via a local static server (required for ES module imports):

```bash
cd "d:\coding\MY PROJECT\3\web"
python -m http.server 8000
# then open http://localhost:8000 in your browser
```

Notes:
- Do not open the page with `file://`; use `http://localhost:8000`.
- Put an MP3 you have permission to use at `web/assets/sparks.mp3`. The gift player starts at the beginning; the local copy is git-ignored, so upload it to your hosting project yourself if you have distribution rights. If absent, the game offers an Apple Music link instead.
- The prototype now uses lighter Three.js rendering settings for better performance on slower machines.
- Gameplay: click sunflowers to pick them, click the brown shrine to place them. After placing 5, the gift modal appears.
