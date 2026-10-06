# MyFirstWebApp (Bootstrap 5 rebuild)

Personal “About Me” page rebuilt with Bootstrap 5. Same contact form rules and Advice Slip tip as the earlier hand-written version, plus a short reflection on using the framework.

## Files

- `index.html` — page structure, Bootstrap 5.3 CDN links, navbar, grid, form and tip UI
- `css/styles.css` — small overrides (tip area height, phone button width, focus)
- `js/script.js` — form validation and Advice Slip `fetch` (no inline scripts)
- `REFLECTION.md` — course reflection notes (also shown on the page)
- `screenshots/` — optional local test screenshots

## Run locally

From this folder:

```bash
python3 -m http.server 8000
```

Open http://localhost:8000/ in a browser.

## Deploy to GitHub Pages

This is a plain static site (no build step). To publish it as the existing Pages site:

1. Copy `index.html`, `css/`, `js/`, and `REFLECTION.md` into the `MyFirstWebApp` repository (replace the previous files).
2. Commit and push to the branch that GitHub Pages serves (usually `main` or `gh-pages`).
3. Wait a minute, then check https://irfanasrar.github.io/MyFirstWebApp/

You do not need npm or any bundler. Bootstrap loads from the jsDelivr CDN.
