// ByAthletes — build.js
// Run: node build.js
//
// Generates:
//   index.html              — newspaper front page
//   issue-{N}-cover.html    — cover story page
//   issue-{N}-side-{i}.html — side story pages
//   issue-{N}-news-{i}.html — roundup story pages
//   archive.json            — updated with current issue stub

const fs   = require("fs");
const path = require("path");
const DIR  = __dirname;

const data = JSON.parse(fs.readFileSync(path.join(DIR, "stories.json"), "utf8"));

// archive.json: manually curated list of past issues
let archive = [];
try { archive = JSON.parse(fs.readFileSync(path.join(DIR, "archive.json"), "utf8")); } catch(e) {}

// Add current issue to archive if not already there
if (!archive.some(a => a.issue === data.issue)) {
  archive.unshift({
    issue   : data.issue,
    date    : data.date,
    tag     : data.cover_story.tag,
    headline: data.cover_story.headline,
    dek     : data.cover_story.dek || "",
    image   : data.cover_story.image || "",
    page    : `issue-${data.issue}-cover.html`
  });
  fs.writeFileSync(path.join(DIR, "archive.json"), JSON.stringify(archive, null, 2));
}

// ─── HELPERS ──────────────────────────────────────────────────────────────

function e(s) {
  return String(s || "")
    .replace(/&/g,"&amp;").replace(/</g,"&lt;")
    .replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

function snip(s, n) {
  s = String(s || ""); n = n || 115;
  return s.length > n ? s.slice(0, n).replace(/\s\S*$/, "") + "…" : s;
}

// ─── SHARED ASSETS ────────────────────────────────────────────────────────

const FONTS = [
  '<link rel="preconnect" href="https://fonts.googleapis.com">',
  '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
  '<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400;1,700&family=Barlow+Condensed:wght@900&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">'
].join("");

const BASE = `
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --cream: #F5F3EE; --ink: #0F0E0D; --ink-2: #2C2A27; --ink-3: #7A776F;
  --red: #C41230; --brd: #E0DDD6;
  --serif: 'Playfair Display', Georgia, serif;
  --cond: 'Barlow Condensed', sans-serif;
  --sans: 'Inter', system-ui, sans-serif;
}
html { scroll-behavior: smooth; }
body { background: var(--cream); color: var(--ink); font-family: var(--sans); -webkit-font-smoothing: antialiased; }
a { text-decoration: none; color: inherit; }
img { display: block; width: 100%; }

/* masthead — front page */
.mast { background: var(--ink); padding: 2.5rem 2.5rem 2rem; text-align: center; border-bottom: 3px solid var(--red); }
.mast-eyebrow { font-size: .55rem; font-weight: 800; letter-spacing: .32em; text-transform: uppercase; color: rgba(255,255,255,.28); margin-bottom: .85rem; }
.mast-logo { font-family: var(--serif); font-style: italic; font-weight: 700; font-size: clamp(2.8rem,7vw,5.5rem); letter-spacing: -.02em; color: #fff; line-height: 1; margin-bottom: .6rem; display: block; }
.mast-logo em { color: var(--red); font-style: normal; }
.mast-tagline { font-size: .6rem; font-weight: 600; letter-spacing: .22em; text-transform: uppercase; color: rgba(255,255,255,.22); }
.mast-bar { background: var(--cream); border-bottom: 1px solid var(--brd); padding: .5rem 2.5rem; display: flex; justify-content: space-between; align-items: center; }
.mast-bar span { font-size: .55rem; font-weight: 700; letter-spacing: .18em; text-transform: uppercase; color: var(--ink-3); }

/* masthead — story pages */
.smast { background: var(--ink); display: flex; align-items: center; justify-content: space-between; padding: 1rem 2.5rem; position: sticky; top: 0; z-index: 100; }
.smast-logo { font-family: var(--serif); font-style: italic; font-weight: 700; font-size: 1.6rem; color: #fff; }
.smast-logo em { color: var(--red); font-style: normal; }
.smast-meta { font-family: var(--cond); font-size: .72rem; font-weight: 900; letter-spacing: .15em; text-transform: uppercase; color: rgba(255,255,255,.28); }
.back-bar { background: var(--cream); border-bottom: 1px solid var(--brd); padding: .55rem 2.5rem; }
.back-link { font-size: .55rem; font-weight: 800; letter-spacing: .2em; text-transform: uppercase; color: var(--ink-3); }
.back-link:hover { color: var(--red); }

/* footer */
.site-footer { background: var(--ink); border-top: 1px solid rgba(255,255,255,.05); padding: 2.25rem 2.5rem; display: flex; justify-content: space-between; align-items: center; }
.footer-logo { font-family: var(--serif); font-style: italic; font-size: 1.3rem; color: rgba(255,255,255,.4); }
.footer-meta, .footer-sub { font-size: .55rem; font-weight: 700; letter-spacing: .18em; text-transform: uppercase; color: rgba(255,255,255,.2); }
.footer-sub a { color: rgba(255,255,255,.4); }

@media (max-width: 680px) {
  .mast { padding: 1.75rem 1.25rem 1.5rem; }
  .mast-bar { padding: .5rem 1.25rem; }
  .smast { padding: 1rem 1.25rem; }
  .back-bar { padding: .55rem 1.25rem; }
  .site-footer { padding: 1.75rem 1.25rem; flex-direction: column; gap: .75rem; text-align: center; }
}`;

const FRONT_CSS = `
.wrap { max-width: 1280px; margin: 0 auto; padding: 3.5rem 2.5rem 5rem; }
.section-label { font-size: .55rem; font-weight: 800; letter-spacing: .28em; text-transform: uppercase; color: var(--red); margin-bottom: 1.75rem; }
.divider { height: 1px; background: var(--brd); margin: 3.5rem 0; }

/* featured */
.featured { display: block; }
.feat-img { position: relative; width: 100%; height: 580px; overflow: hidden; }
.feat-img img { height: 100%; object-fit: cover; transition: transform .5s; }
.featured:hover .feat-img img { transform: scale(1.02); }
.img-fallback { width: 100%; height: 100%; background: #1C1916; }
.feat-grad { position: absolute; inset: 0; background: linear-gradient(to top, rgba(8,7,6,.92) 0%, rgba(8,7,6,.5) 40%, transparent 75%); }
.feat-text { position: absolute; bottom: 0; left: 0; right: 0; padding: 2.5rem 2.5rem 2.75rem; }
.card-tag { display: inline-block; font-size: .52rem; font-weight: 800; letter-spacing: .28em; text-transform: uppercase; color: var(--red); margin-bottom: .85rem; }
.feat-h { font-family: var(--serif); font-style: italic; font-weight: 700; font-size: clamp(1.8rem,3.5vw,3rem); line-height: 1.12; letter-spacing: -.015em; color: #fff; max-width: 720px; margin-bottom: .85rem; }
.feat-dek { font-size: .92rem; line-height: 1.65; color: rgba(255,255,255,.55); max-width: 580px; margin-bottom: 1rem; }
.card-meta { font-size: .52rem; font-weight: 700; letter-spacing: .18em; text-transform: uppercase; color: rgba(255,255,255,.3); }

/* grid */
.grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem; }
.grid-card { display: flex; flex-direction: column; }
.grid-img { aspect-ratio: 3/2; overflow: hidden; margin-bottom: 1.1rem; background: var(--ink); }
.grid-img img { height: 100%; object-fit: cover; transition: transform .45s; }
.grid-card:hover .grid-img img { transform: scale(1.04); }
.grid-body { display: flex; flex-direction: column; gap: .45rem; }
.grid-card .card-tag { color: var(--red); }
.grid-card .card-meta { color: var(--ink-3); }
.grid-h { font-family: var(--serif); font-style: italic; font-size: 1.1rem; line-height: 1.38; color: var(--ink); }
.grid-dek { font-size: .82rem; line-height: 1.65; color: var(--ink-3); }

/* archive */
.arc-section { border-top: 1px solid var(--brd); padding: 4rem 0 5rem; }
.arc-inner { max-width: 1280px; margin: 0 auto; padding: 0 2.5rem; }
.arc-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; }
.arc-card { display: flex; gap: 1.25rem; align-items: flex-start; padding: 1.5rem; border: 1px solid var(--brd); transition: border-color .15s; }
.arc-card:hover { border-color: var(--ink-3); }
.arc-thumb { width: 90px; height: 60px; flex-shrink: 0; overflow: hidden; background: var(--ink); }
.arc-thumb img { width: 90px; height: 60px; object-fit: cover; }
.arc-body {}
.arc-tag { font-size: .5rem; font-weight: 800; letter-spacing: .24em; text-transform: uppercase; color: var(--red); display: block; margin-bottom: .35rem; }
.arc-h { font-family: var(--serif); font-style: italic; font-size: .95rem; line-height: 1.38; color: var(--ink); margin-bottom: .35rem; }
.arc-meta { font-size: .5rem; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: var(--ink-3); }

@media (max-width: 960px) { .grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 640px) {
  .wrap { padding: 2.5rem 1.25rem 4rem; }
  .feat-img { height: 420px; }
  .feat-text { padding: 1.5rem 1.25rem 2rem; }
  .grid { grid-template-columns: 1fr; }
  .arc-inner { padding: 0 1.25rem; }
}`;

const STORY_CSS = `
.s-hero { position: relative; width: 100%; height: 72vh; min-height: 440px; overflow: hidden; display: flex; align-items: flex-end; }
.s-hero img { position: absolute; inset: 0; height: 100%; object-fit: cover; }
.s-hero-fallback { position: absolute; inset: 0; background: #111; }
.s-hero-grad { position: absolute; inset: 0; background: linear-gradient(to top, rgba(6,5,4,.96) 0%, rgba(6,5,4,.5) 38%, transparent 70%); }
.s-hero-text { position: relative; z-index: 2; width: 100%; max-width: 1280px; margin: 0 auto; padding: 0 2.5rem 3.5rem; }
.s-tag { display: inline-block; font-size: .52rem; font-weight: 800; letter-spacing: .3em; text-transform: uppercase; color: var(--red); margin-bottom: 1.25rem; }
.s-h1 { font-family: var(--serif); font-style: italic; font-weight: 700; font-size: clamp(2rem,5vw,4.5rem); line-height: 1.08; letter-spacing: -.02em; color: #fff; max-width: 820px; margin-bottom: 1rem; }
.s-dek { font-size: 1rem; line-height: 1.7; color: rgba(255,255,255,.55); max-width: 560px; margin-bottom: 1rem; }
.s-byline { font-size: .55rem; font-weight: 700; letter-spacing: .18em; text-transform: uppercase; color: rgba(255,255,255,.3); }
.s-chips { display: flex; flex-wrap: wrap; gap: .4rem; margin-top: 1.25rem; }
.chip { font-size: .52rem; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; border: 1px solid rgba(255,255,255,.2); color: rgba(255,255,255,.4); padding: 3px 10px; }

.s-layout { max-width: 1280px; margin: 0 auto; padding: 4rem 2.5rem 5rem; display: grid; grid-template-columns: 1fr 280px; gap: 5rem; align-items: start; }
.s-body-p { font-size: 1.05rem; line-height: 1.9; color: var(--ink-2); margin-bottom: 1.5rem; max-width: 680px; }
.drop::first-letter { font-family: var(--serif); font-size: 5rem; font-weight: 700; line-height: .72; float: left; margin-right: .08em; margin-top: .08em; color: var(--ink); }
.pull-quote { margin: 2.75rem 0; padding: 0 0 0 1.75rem; border-left: 3px solid var(--red); }
.pull-quote p { font-family: var(--serif); font-style: italic; font-size: 1.5rem; line-height: 1.42; color: var(--ink); }
.pull-quote cite { display: block; font-style: normal; font-size: .55rem; font-weight: 700; letter-spacing: .18em; text-transform: uppercase; color: var(--ink-3); margin-top: .75rem; }
.source-btn { display: inline-block; margin-top: 2rem; padding: .75rem 1.25rem; border: 1px solid var(--brd); font-size: .6rem; font-weight: 800; letter-spacing: .18em; text-transform: uppercase; color: var(--red); transition: background .15s, border-color .15s; }
.source-btn:hover { background: var(--red); color: #fff; border-color: var(--red); }

.s-sidebar { position: sticky; top: 80px; }
.stat-box { background: var(--ink); padding: 2rem 1.75rem; margin-bottom: 1.5rem; }
.stat-num { font-family: var(--cond); font-size: 3.5rem; font-weight: 900; line-height: 1; color: #fff; display: block; margin-bottom: .6rem; letter-spacing: -.02em; }
.stat-lbl { font-size: .72rem; line-height: 1.5; color: rgba(255,255,255,.45); }
.sidebar-chips { display: flex; flex-wrap: wrap; gap: .4rem; }
.sidebar-chips .chip { border-color: var(--brd); color: var(--ink-3); }

@media (max-width: 900px) { .s-layout { grid-template-columns: 1fr; gap: 2.5rem; } .s-sidebar { position: static; order: -1; } }
@media (max-width: 640px) { .s-hero-text { padding: 0 1.25rem 2.5rem; } .s-h1 { font-size: 2rem; } .s-layout { padding: 3rem 1.25rem 4rem; } }`;

// ─── FRONT PAGE ───────────────────────────────────────────────────────────

function buildFrontPage(stories) {
  const cs = data.cover_story;

  // Featured card = current cover story
  const featImg = cs.image
    ? `<img src="${e(cs.image)}" alt="${e(cs.headline)}" />`
    : `<div class="img-fallback"></div>`;

  const featured = `
    <a class="featured" href="issue-${data.issue}-cover.html">
      <div class="feat-img">
        ${featImg}
        <div class="feat-grad"></div>
        <div class="feat-text">
          <span class="card-tag">${e(cs.tag)}</span>
          <h2 class="feat-h">${e(cs.headline)}</h2>
          <p class="feat-dek">${e(cs.dek || "")}</p>
          <span class="card-meta">${e(data.date)} &ensp;·&ensp; Issue No. ${data.issue}</span>
        </div>
      </div>
    </a>`;

  // Stories grid = current issue stories + past issue covers, all in one grid
  const makeGridCard = (s) => {
    const img = s.image
      ? `<img src="${e(s.image)}" alt="${e(s.headline)}" loading="lazy" />`
      : `<div class="img-fallback"></div>`;
    return `
    <a class="grid-card" href="${e(s.url)}">
      <div class="grid-img">${img}</div>
      <div class="grid-body">
        <span class="card-tag">${e(s.tag)}</span>
        <h3 class="grid-h">${e(s.headline)}</h3>
        <p class="grid-dek">${e(snip(s.dek || (Array.isArray(s.body) ? s.body[0] : s.body) || ""))}</p>
        <span class="card-meta">${e(s.date)}</span>
      </div>
    </a>`;
  };

  const currentCards = stories.map(makeGridCard).join("");

  const pastIssues = archive.filter(a => a.issue !== data.issue);
  const pastCards = pastIssues.map(a => makeGridCard({
    image   : a.image || "",
    url     : a.page || "#",
    tag     : a.tag,
    headline: a.headline,
    dek     : a.dek || "",
    date    : a.date
  })).join("");

  const allGridCards = currentCards + pastCards;
  const arcSection = "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>ByAthletes — Athletes Who Build</title>
  ${FONTS}
  <style>${BASE}${FRONT_CSS}</style>
</head>
<body>

<header class="mast">
  <p class="mast-eyebrow">The athlete entrepreneur publication</p>
  <a href="index.html" class="mast-logo">By<em>Athletes</em></a>
  <p class="mast-tagline">For athletes who build</p>
</header>
<div class="mast-bar">
  <span>${e(data.date)}</span>
  <span>Issue No. ${data.issue} &ensp;·&ensp; Entrepreneur Edition</span>
</div>

<div class="wrap">
  <p class="section-label">Latest</p>
  ${featured}
  ${allGridCards ? `<div class="divider"></div><p class="section-label">Stories</p><div class="grid">${allGridCards}</div>` : ""}
</div>


<footer class="site-footer">
  <span class="footer-logo">ByAthletes</span>
  <span class="footer-meta">For athletes who build</span>
  <span class="footer-sub"><a href="#">Subscribe</a></span>
</footer>

</body>
</html>`;
}

// ─── STORY PAGE ───────────────────────────────────────────────────────────

function buildStoryPage(p) {
  const body = (p.body || []).map((par, i) =>
    i === 0
      ? `<p class="s-body-p drop">${e(par)}</p>`
      : `<p class="s-body-p">${e(par)}</p>`
  ).join("");

  const chips = (p.chips || []).map(c => `<span class="chip">${e(c)}</span>`).join("");

  const quote = p.quote ? `
    <blockquote class="pull-quote">
      <p>&ldquo;${e(p.quote)}&rdquo;</p>
      <cite>&mdash; ${e(p.quote_author)}</cite>
    </blockquote>` : "";

  const source = p.source_url ? `
    <a class="source-btn" href="${e(p.source_url)}" target="_blank" rel="noopener">
      Read the original essay${p.source_name ? ` &mdash; ${e(p.source_name)}` : ""} &rarr;
    </a>` : "";

  const stat = p.big_stat ? `
    <div class="stat-box">
      <span class="stat-num">${e(p.big_stat)}</span>
      <span class="stat-lbl">${e(p.stat_label)}</span>
    </div>` : "";

  const sidebar = (p.big_stat || chips) ? `
    <aside class="s-sidebar">
      ${stat}
      ${chips ? `<div class="sidebar-chips">${chips}</div>` : ""}
    </aside>` : "";

  const heroImg = p.image
    ? `<img src="${e(p.image)}" alt="${e(p.headline)}" />`
    : `<div class="s-hero-fallback"></div>`;

  const byline = [p.author ? `By ${e(p.author)}` : "", e(p.date)].filter(Boolean).join(" &ensp;·&ensp; ");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${e(p.headline)} — ByAthletes</title>
  ${FONTS}
  <style>${BASE}${STORY_CSS}</style>
</head>
<body>

<header class="smast">
  <a href="index.html" class="smast-logo">By<em>Athletes</em></a>
  <span class="smast-meta">Issue No. ${p.issue} &ensp;·&ensp; ${e(p.date)}</span>
</header>
<div class="back-bar">
  <a class="back-link" href="index.html">&larr; All stories</a>
</div>

<section class="s-hero">
  ${heroImg}
  <div class="s-hero-grad"></div>
  <div class="s-hero-text">
    <span class="s-tag">${e(p.tag)}</span>
    <h1 class="s-h1">${e(p.headline)}</h1>
    ${p.dek ? `<p class="s-dek">${e(p.dek)}</p>` : ""}
    <p class="s-byline">${byline}</p>
    ${chips ? `<div class="s-chips">${chips}</div>` : ""}
  </div>
</section>

<div class="s-layout">
  <div class="s-text">
    ${body}
    ${quote}
    ${source}
  </div>
  ${sidebar}
</div>

<footer class="site-footer">
  <a href="index.html" class="footer-logo">ByAthletes</a>
  <span class="footer-meta">Issue No. ${p.issue} &ensp;·&ensp; ${e(p.date)}</span>
  <span class="footer-sub"><a href="#">Subscribe</a></span>
</footer>

</body>
</html>`;
}

// ─── ASSEMBLE STORIES FROM stories.json ───────────────────────────────────

const cs = data.cover_story;

const coverPost = {
  issue       : data.issue,
  date        : data.date,
  tag         : cs.tag,
  headline    : cs.headline,
  dek         : cs.dek || "",
  author      : cs.author || "",
  body        : cs.body || [],
  quote       : cs.quote || "",
  quote_author: cs.quote_author || "",
  big_stat    : cs.big_stat || "",
  stat_label  : cs.stat_label || "",
  image       : cs.image || "",
  source_url  : cs.source_url || "",
  source_name : cs.source_name || "",
  chips       : cs.chips || [],
  url         : `issue-${data.issue}-cover.html`
};

const sideStories = (data.side_stories || []).map((s, i) => ({
  issue      : data.issue,
  date       : data.date,
  tag        : s.tag,
  headline   : s.headline,
  body       : [s.body],
  dek        : "",
  image      : s.image || "",
  source_url : s.source_url || "",
  source_name: s.source_name || "",
  url        : `issue-${data.issue}-side-${i + 1}.html`
}));

const newsStories = (data.roundup || []).map((r, i) => ({
  issue      : data.issue,
  date       : data.date,
  tag        : r.tag,
  headline   : r.headline,
  body       : [r.body],
  dek        : "",
  image      : r.image || "",
  source_url : r.source_url || "",
  source_name: r.source_name || "",
  url        : `issue-${data.issue}-news-${i + 1}.html`
}));

const allCurrentStories = [coverPost, ...sideStories, ...newsStories];

// ─── WRITE FILES ──────────────────────────────────────────────────────────

// Cover story page
fs.writeFileSync(path.join(DIR, coverPost.url), buildStoryPage(coverPost));
console.log(`  ✓ ${coverPost.url}`);

// Side story pages
sideStories.forEach(s => {
  fs.writeFileSync(path.join(DIR, s.url), buildStoryPage(s));
  console.log(`  ✓ ${s.url}`);
});

// News/roundup pages
newsStories.forEach(s => {
  fs.writeFileSync(path.join(DIR, s.url), buildStoryPage(s));
  console.log(`  ✓ ${s.url}`);
});

// Front page — featured = cover, grid = past issues only (archive, manually curated)
fs.writeFileSync(path.join(DIR, "index.html"), buildFrontPage([]));
console.log(`  ✓ index.html`);

console.log(`\n✅ Built Issue #${data.issue} (${data.date}) — ${allCurrentStories.length} pages`);
