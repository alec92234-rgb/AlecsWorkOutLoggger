# Alec's Workout Logger (Static Web App)

A super-fast, offline-first workout logger tailored to your 3-day full-body plan. No backend, no accounts. Data is stored locally in your browser (localStorage), with one-click export/import for backups.

## Features
- Preloaded with your exact 3-day plan (Day 1/2/3)
- Add/edit sets with **weight × reps + RIR + notes**
- Auto-saves on demand, quick history open/delete
- **Export CSV/JSON** and **Import JSON** for backups or migration
- Works offline; can be hosted anywhere static (GitHub Pages, Netlify, or even opening the HTML file directly)

## Quick Start
1. Download the ZIP.
2. Unzip and open `index.html` in your browser. It just works.

## GitHub Pages Hosting (free)
1. Create a new GitHub repo (e.g., `workout-logger`).
2. Upload `index.html`, `app.js`, and `styles.css`.
3. In repo Settings → Pages → set Source to **Deploy from a branch**, select `main` and `/ (root)`.
4. After it builds, your app will be live at `https://<your-username>.github.io/workout-logger/`.

## Netlify (one-click)
- Drag & drop the folder to https://app.netlify.com/drop — it will deploy instantly.
- You’ll get a public URL you can bookmark on your phone.

## iPhone / Android
- Open the URL in Safari/Chrome → Share → **Add to Home Screen**. It behaves like an app.

## Backups
- Click **Export JSON** regularly to save your data file.
- To restore or move devices, click **Import JSON** and select your saved file.

## Customizing the Plan
- Open `index.html` and edit the `PLAN` object near the bottom to change exercise names, target sets, or reps. Save & refresh.

## Notes
- Everything stays on-device unless you export it yourself.
- If you clear your browser storage, your data will be removed (so keep a JSON backup).

Enjoy, and lift heavy.
