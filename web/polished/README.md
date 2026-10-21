# Polished Three.js Prototype

Open `web/polished/index.html` using a static server (browsers block module imports from file://):

```bash
cd "d:\coding\MY PROJECT\3\web\polished"
python -m http.server 8000
# open http://localhost:8000
```

Notes:
- The prototype uses ES module imports of Three.js and examples from CDN.
- Drop glTF models into `web/polished/assets/models/` as `sunflower.glb` or `gift.glb` to replace placeholders.
- Post-processing (bloom, SSAO) is enabled.
