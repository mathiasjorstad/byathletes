// ByAthletes — build.js
// Reads stories.json + archive.json → writes index.html

const fs   = require("fs");
const path = require("path");

const data = JSON.parse(fs.readFileSync(path.join(__dirname, "stories.json"), "utf8"));

let archive = [];
try { archive = JSON.parse(fs.readFileSync(path.join(__dirname, "archive.json"), "utf8")); } catch(e) {}

// ─── HELPERS ──────────────────────────────────────────────────────────────

function toRoman(n) {
  const m = [[1000,"M"],[900,"CM"],[500,"D"],[400,"CD"],[100,"C"],[90,"XC"],
             [50,"L"],[40,"XL"],[10,"X"],[9,"IX"],[5,"V"],[4,"IV"],[1,"I"]];
  return m.reduce((a,[v,s])=>{ while(n>=v){a+=s;n-=v;} return a; },"");
}

// ─── STORY TEMPLATE ───────────────────────────────────────────────────────

function storyHTML(s) {
  const paras = s.body.map((p, i) =>
    i === 0 ? `<p class="p drop">${p}</p>` : `<p class="p">${p}</p>`
  ).join("\n");

  const tags = (s.tags || []).map(t => `<span class="tag">${t}</span>`).join("");

  return `
<article class="article">

  <header class="article-header">
    <span class="sport">${s.sport}</span>
    <h1 class="h1">${s.headline}</h1>
    <p class="dek">${s.dek}</p>
    <p class="byline">By ${s.author}&ensp;·&ensp;${s.date || data.date}</p>
  </header>

  ${s.image ? `
  <div class="hero">
    <img src="${s.image}" alt="${s.headline}" />
  </div>` : `<div class="hero-blank"></div>`}

  <div class="body">
    ${paras}

    <blockquote class="quote">
      <p>"${s.quote}"</p>
      <cite>— ${s.quote_author}</cite>
    </blockquote>

    ${s.stat ? `
    <div class="stat">
      <span class="stat-num">${s.stat}</span>
      <span class="stat-label">${s.stat_label}</span>
    </div>` : ""}
  </div>

  <footer class="article-footer">
    ${tags ? `<div class="tags">${tags}</div>` : ""}
    ${s.source_url ? `<a class="source" href="${s.source_url}" target="_blank" rel="noopener">Read original — ${s.source_name || "Source"} →</a>` : ""}
  </footer>

</article>`;
}

// ─── ARCHIVE ──────────────────────────────────────────────────────────────

const archiveCards = archive.map(a => `
  <div class="arc-card">
    <span class="arc-no">No.&thinsp;${String(a.issue).padStart(3,"0")}</span>
    <div class="arc-rule"></div>
    <h3 class="arc-h">${a.headline}</h3>
    <div class="arc-meta"><span>${a.date}</span><span>${a.sport}</span></div>
  </div>`).join("");

// ─── PAGE ─────────────────────────────────────────────────────────────────

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>ByAthletes — No. ${toRoman(data.issue)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400;1,700&family=Barlow+Condensed:wght@900&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --cream : #F4F2ED;
      --ink   : #111010;
      --ink-2 : #2C2A27;
      --ink-3 : #7A776F;
      --red   : #C41230;
      --brd   : #E2DED7;
      --serif : 'Playfair Display', Georgia, serif;
      --cond  : 'Barlow Condensed', sans-serif;
      --sans  : 'Inter', system-ui, sans-serif;
    }

    html { scroll-behavior: smooth; }

    body {
      background: var(--cream);
      color: var(--ink);
      font-family: var(--sans);
      -webkit-font-smoothing: antialiased;
    }

    a { text-decoration: none; color: inherit; }
    img { display: block; width: 100%; }

    /* ── MASTHEAD ─────────────────────────────── */

    .mast {
      background: var(--ink);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.1rem 2.5rem;
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .mast-logo {
      font-family: var(--serif);
      font-style: italic;
      font-weight: 700;
      font-size: 1.8rem;
      letter-spacing: -0.01em;
      color: #fff;
    }

    .mast-logo em {
      color: var(--red);
      font-style: normal;
    }

    .mast-issue {
      font-family: var(--cond);
      font-size: 1rem;
      font-weight: 900;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: rgba(255,255,255,0.35);
    }

    .mast-date {
      font-size: 0.6rem;
      font-weight: 600;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: rgba(255,255,255,0.22);
    }

    /* ── ARTICLE ──────────────────────────────── */

    .article {
      padding-bottom: 6rem;
    }

    /* Header — centered */
    .article-header {
      max-width: 800px;
      margin: 0 auto;
      padding: 5.5rem 2rem 3.5rem;
      text-align: center;
    }

    .sport {
      display: block;
      font-size: 0.57rem;
      font-weight: 800;
      letter-spacing: 0.3em;
      text-transform: uppercase;
      color: var(--red);
      margin-bottom: 2.25rem;
    }

    .h1 {
      font-family: var(--serif);
      font-style: italic;
      font-weight: 700;
      font-size: clamp(2.8rem, 5.5vw, 5.2rem);
      line-height: 1.06;
      letter-spacing: -0.025em;
      color: var(--ink);
      margin-bottom: 1.75rem;
    }

    .dek {
      font-size: 1.05rem;
      line-height: 1.72;
      color: var(--ink-2);
      max-width: 580px;
      margin: 0 auto 1.75rem;
    }

    .byline {
      font-size: 0.6rem;
      font-weight: 700;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: var(--ink-3);
    }

    /* Hero image */
    .hero {
      width: 100%;
      border-top: 1px solid var(--brd);
      overflow: hidden;
    }

    .hero img {
      height: 72vh;
      object-fit: cover;
    }

    .hero-blank {
      height: 2px;
      background: var(--brd);
    }

    /* Body — reading column */
    .body {
      max-width: 680px;
      margin: 0 auto;
      padding: 3.75rem 2rem 0;
    }

    .p {
      font-size: 1.05rem;
      line-height: 1.9;
      color: var(--ink-2);
      margin-bottom: 1.4rem;
    }

    .drop::first-letter {
      font-family: var(--serif);
      font-size: 5rem;
      font-weight: 700;
      line-height: 0.68;
      float: left;
      margin-right: 0.07em;
      margin-top: 0.1em;
      color: var(--ink);
    }

    /* Pull quote */
    .quote {
      margin: 3.25rem 0;
      padding: 0 0 0 2rem;
      border-left: 3px solid var(--red);
    }

    .quote p {
      font-family: var(--serif);
      font-style: italic;
      font-size: 1.6rem;
      line-height: 1.42;
      color: var(--ink);
    }

    .quote cite {
      display: block;
      font-family: var(--sans);
      font-style: normal;
      font-size: 0.6rem;
      font-weight: 700;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: var(--ink-3);
      margin-top: 0.85rem;
    }

    /* Stat callout */
    .stat {
      display: flex;
      align-items: baseline;
      gap: 1.75rem;
      border-top: 1px solid var(--brd);
      border-bottom: 1px solid var(--brd);
      padding: 2.25rem 0;
      margin: 2.75rem 0;
    }

    .stat-num {
      font-family: var(--cond);
      font-size: 5rem;
      font-weight: 900;
      line-height: 1;
      color: var(--ink);
      letter-spacing: -0.02em;
      white-space: nowrap;
    }

    .stat-label {
      font-size: 0.85rem;
      color: var(--ink-3);
      line-height: 1.6;
    }

    /* Article footer */
    .article-footer {
      max-width: 680px;
      margin: 0 auto;
      padding: 1.75rem 2rem 0;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .tag {
      font-size: 0.57rem;
      font-weight: 700;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      border: 1px solid var(--brd);
      color: var(--ink-3);
      padding: 5px 12px;
    }

    .source {
      display: inline-block;
      font-size: 0.6rem;
      font-weight: 800;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: var(--red);
      transition: letter-spacing 0.2s;
    }

    .source:hover { letter-spacing: 0.28em; }

    /* ── ARCHIVE ──────────────────────────────── */

    .archive {
      background: var(--ink);
      padding: 5rem 0;
    }

    .archive-inner {
      max-width: 1280px;
      margin: 0 auto;
      padding: 0 2.5rem;
    }

    .archive-title {
      font-family: var(--serif);
      font-style: italic;
      font-weight: 700;
      font-size: 1.75rem;
      color: #fff;
      padding-bottom: 1.75rem;
      margin-bottom: 2.5rem;
      border-bottom: 1px solid rgba(255,255,255,0.08);
    }

    .archive-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 1px;
      background: rgba(255,255,255,0.07);
    }

    .arc-card {
      background: var(--ink);
      padding: 2rem 2.25rem;
      transition: background 0.18s;
    }

    .arc-card:hover { background: #1C1916; }

    .arc-no {
      font-family: var(--cond);
      font-size: 0.72rem;
      font-weight: 900;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: rgba(255,255,255,0.22);
    }

    .arc-rule {
      width: 22px;
      height: 2px;
      background: var(--red);
      margin: 0.85rem 0;
    }

    .arc-h {
      font-family: var(--serif);
      font-style: italic;
      font-weight: 400;
      font-size: 1rem;
      line-height: 1.5;
      color: rgba(255,255,255,0.7);
      margin-bottom: 1.25rem;
    }

    .arc-meta {
      display: flex;
      gap: 1.5rem;
      font-size: 0.57rem;
      font-weight: 600;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: rgba(255,255,255,0.22);
    }

    /* ── FOOTER ───────────────────────────────── */

    .site-footer {
      background: #0A0805;
      border-top: 1px solid rgba(255,255,255,0.05);
      padding: 2rem 2.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .footer-logo {
      font-family: var(--serif);
      font-style: italic;
      font-size: 1.3rem;
      color: rgba(255,255,255,0.38);
    }

    .footer-meta, .footer-sub {
      font-size: 0.58rem;
      font-weight: 600;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: rgba(255,255,255,0.2);
    }

    .footer-sub a { color: rgba(255,255,255,0.38); }

    /* ── DIVIDER between articles ─────────────── */

    .divider {
      max-width: 680px;
      margin: 0 auto;
      height: 1px;
      background: var(--brd);
    }

    /* ── RESPONSIVE ───────────────────────────── */

    @media (max-width: 680px) {
      .mast { padding: 1rem 1.25rem; }
      .mast-date { display: none; }
      .article-header { padding: 3.5rem 1.25rem 2.5rem; }
      .body { padding-left: 1.25rem; padding-right: 1.25rem; }
      .article-footer { padding-left: 1.25rem; padding-right: 1.25rem; }
      .quote { padding-left: 1.25rem; }
      .h1 { font-size: 2.6rem; }
      .archive-inner { padding: 0 1.25rem; }
      .site-footer { padding: 1.5rem 1.25rem; flex-direction: column; gap: 0.75rem; text-align: center; }
    }
  </style>
</head>
<body>

<header class="mast">
  <span class="mast-logo">By<em>Athletes</em></span>
  <span class="mast-issue">No.&thinsp;${toRoman(data.issue)}</span>
  <span class="mast-date">Issue ${data.issue}&ensp;·&ensp;${data.date}</span>
</header>

${data.stories.map(storyHTML).join('\n<div class="divider"></div>\n')}

${archive.length > 0 ? `
<section class="archive">
  <div class="archive-inner">
    <h2 class="archive-title">Previous Issues</h2>
    <div class="archive-grid">${archiveCards}</div>
  </div>
</section>` : ""}

<footer class="site-footer">
  <span class="footer-logo">ByAthletes</span>
  <span class="footer-meta">Vol. I &ensp;·&ensp; Issue No. ${data.issue} &ensp;·&ensp; ${data.date}</span>
  <span class="footer-sub">For athletes who build &ensp;·&ensp; <a href="#">Subscribe</a></span>
</footer>

</body>
</html>`;

fs.writeFileSync(path.join(__dirname, "index.html"), html, "utf8");
console.log(`✅ Built index.html — Issue #${data.issue} (${data.date})`);
