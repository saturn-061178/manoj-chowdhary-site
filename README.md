# Manoj Kumar Chowdhary — Advocate, Supreme Court of India

A single-page static site. No build step: open `index.html` or serve the folder.

```
index.html        markup
css/style.css     styles
js/main.js        interactions (menu, filters, booking form, lightbox)
assets/img/       photographs and practice-area images (WebP)
```

Both forms compose a WhatsApp message to the number set as `WA` near the end of `js/main.js`; nothing is sent to a server.

Preview locally:

```bash
python -m http.server 4174
```
