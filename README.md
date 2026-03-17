# ♛ Iron & Alliances
**Strategia RPG stile Reigns — universo Game of Thrones**
🌐 Live: https://geom-pegoraro.github.io/game-of-thrones/

---

## 🚀 Deploy su GitHub Pages — Istruzioni Esatte

### Struttura da caricare nella repo

```
game-of-thrones/   ← root della repository
├── index.html
├── style.css
├── game.js
├── manifest.json
├── sw.js
├── README.md
└── icons/
    ├── icon-72.png
    ├── icon-96.png
    ├── icon-128.png
    ├── icon-144.png
    ├── icon-152.png
    ├── icon-192.png
    ├── icon-384.png
    └── icon-512.png
```

### Passaggi GitHub

1. Vai su https://github.com/geom-pegoraro → crea/apri la repo `game-of-thrones`
2. Carica tutti i file nella **root** (drag & drop su GitHub o git push)
3. Settings → Pages → Source: **Deploy from a branch** → Branch: **main** → Folder: **/ (root)** → Save
4. Dopo 1-2 min il gioco è live su: https://geom-pegoraro.github.io/game-of-thrones/

### NON serve GitHub Actions
Il gioco è HTML/CSS/JS puro statico. GitHub Pages lo serve direttamente dalla branch main, root /. Zero configurazione aggiuntiva.

---

## 🖼 Icone PWA

```bash
npm install sharp
node generate-icons.js
```

generate-icons.js:
```javascript
const sharp = require('sharp');
const fs = require('fs');
fs.mkdirSync('icons', { recursive: true });
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#0a0a0f"/>
  <rect x="6" y="6" width="500" height="500" fill="none" stroke="#c9a84c" stroke-width="12" rx="40"/>
  <text x="256" y="340" text-anchor="middle" font-size="300" fill="#c9a84c">♛</text>
</svg>`;
[72,96,128,144,152,192,384,512].forEach(size => {
  sharp(Buffer.from(svg)).resize(size,size).png()
    .toFile(`icons/icon-${size}.png`)
    .then(() => console.log(`icon-${size}.png OK`));
});
```

Alternativa online: https://realfavicongenerator.net

---

*"Il caos non è un abisso. Il caos è una scala." — Ditocorto*
