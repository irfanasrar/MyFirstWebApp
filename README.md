# MyFirstWebApp

This is my "About Me" page for the Web Technologies course, rebuilt with Bootstrap 5. It keeps the contact form checks and the random tip button from my first version, and has a short reflection on what using a framework was like.

## Files

- `index.html` - the page itself (Bootstrap 5.3 from the CDN)
- `css/styles.css` - a few small style tweaks on top of Bootstrap
- `js/script.js` - form validation and the Advice Slip tip fetch
- `REFLECTION.md` - my reflection (same text as on the page)
- `screenshots/` - screenshots I took while testing

## How to run

No build step, it's just static files. From this folder run:

```bash
python3 -m http.server 8000
```

then open http://localhost:8000/ in a browser.

Live version: https://irfanasrar.github.io/MyFirstWebApp/
