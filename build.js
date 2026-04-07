// ByAthletes — build.js
// Generates:
//   index.html                 — newspaper front page
//   issue-{N}-cover.html       — cover story page
//   issue-{N}-side-{i}.html    — each side story page
//   issue-{N}-news-{i}.html    — each roundup item page
//   posts.json                 — accumulated post index for front page

const fs   = require("fs");
const path = require("path");

const data = JSON.parse(fs.readFileSync(path.join(__dirname, "stories.json"), "utf8"));

let posts = [];
try { posts = JSON.parse(fs.readFileSync(path.join(__dirname, "posts.json"), "utf8")); } catch(e) {}

// ─── HELPERS ──────────────────────────────────────────────────────────────

function esc(s) {
  return String(s || "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

function slug(n, type, i) {
  return `issue-${n}-${type}-${i}.html`;
}

function coverSlug(n) { return `issue-${n}-cover.html`; }

function snippet(text, len = 120) {
  const s = String(text || "");
  return s.length > len ? s.slice(0, len).replace(/\s\S*$/, "") + "…" : s;
}

// ─── FONTS & SHARED CSS ───────────────────────────────────────────────────

const fonts = `
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400;1,700&family=Barlow+Condensed:wght@900&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
`;

const sharedCSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --cream : #F5F3EE;
    --white : #ffffff;
    --ink   : #0F0E0D;
    --ink-2 : #2C2A27;
    --ink-3 : #7A776F;
    --red   : #C41230;
    --brd   : #E0DDD6;
    --serif : 'Playfair Display', Georgia, serif;
    --cond  : 'Barlow Condensed', sans-serif;
    --sans  : 'Inter', system-ui, sans-serif;
  }
  html { scroll-behavior: smooth; }
  body { background: var(--cream); color: var(--ink); font-family: var(--sans); -webkit-font-smoothing: antialiased; }
  a { text-decoration: none; color: inherit; }
  img { display: block; width: 100%; }

  /* ── MASTHEAD ─────────────────────────────── */
  .mast {
    background: var(--ink); padding: 2.5rem 2.5rem 2rem;
    text-align: center; border-bottom: 3px solid var(--red);
  }
  .mast-eyebrow {
    font-size: 0.55rem; font-weight: 800; letter-spacing: 0.32em;
    text-transform: uppercase; color: rgba(255,255,255,0.28); margin-bottom: 0.85rem;
  }
  .mast-logo {
    font-family: var(--serif); font-style: italic; font-weight: 700;
    font-size: clamp(2.8rem, 7vw, 5.5rem); letter-spacing: -0.02em;
    color: #fff; line-height: 1; margin-bottom: 0.6rem;
    display: block;
  }
  .mast-logo em { color: var(--red); font-style: normal; }
  .mast-tagline {
    font-size: 0.6rem; font-weight: 600; letter-spacing: 0.22em;
    text-transform: uppercase; color: rgba(255,255,255,0.22);
  }
  .mast-bar {
    background: var(--cream); border-bottom: 1px solid var(--brd);
    padding: 0.5rem 2.5rem;
    display: flex; justify-content: space-between; align-items: center;
  }
  .mast-bar span {
    font-size: 0.55rem; font-weight: 700; letter-spacing: 0.18em;
    text-transform: uppercase; color: var(--ink-3);
  }

  /* ── ISSUE MAST (single pages) ────────────── */
  .issue-mast {
    background: var(--ink);
    display: flex; align-items: center; justify-content: space-between;
    padding: 1rem 2.5rem; position: sticky; top: 0; z-index: 100;
  }
  .issue-mast-logo {
    font-family: var(--serif); font-style: italic; font-weight: 700;
    font-size: 1.6rem; color: #fff;
  }
  .issue-mast-logo em { color: var(--red); font-style: normal; }
  .issue-mast-meta {
    font-family: var(--cond); font-size: 0.72rem; font-weight: 900;
    letter-spacing: 0.15em; text-transform: uppercase; color: rgba(255,255,255,0.28);
  }
  .back-bar {
    background: var(--cream); border-bottom: 1px solid var(--brd); padding: 0.55rem 2.5rem;
  }
  .back-link {
    font-size: 0.55rem; font-weight: 800; letter-spacing: 0.2em;
    text-transform: uppercase; color: var(--ink-3); transition: color 0.15s;
  }
  .back-link:hover { color: var(--red); }

  /* ── FOOTER ───────────────────────────────── */
  .site-footer {
    background: var(--ink); border-top: 1px solid rgba(255,255,255,0.05);
    padding: 2.25rem 2.5rem; display: flex; justify-content: space-between; align-items: center;
  }
  .footer-logo {
    font-family: var(--serif); font-style: italic; font-size: 1.3rem; color: rgba(255,255,255,0.4);
  }
  .footer-meta {
    font-size: 0.55rem; font-weight: 700; letter-spacing: 0.18em;
    text-transform: uppercase; color: rgba(255,255,255,0.2);
  }
  .footer-sub {
    font-size: 0.55rem; font-weight: 700; letter-spacing: 0.18em;
    text-transform: uppercase; color: rgba(255,255,255,0.2);
  }
  .footer-sub a { color: rgba(255,255,255,0.4); }

  @media (max-width: 680px) {
    .mast { padding: 1.75rem 1.25rem 1.5rem; }
    .mast-bar { padding: 0.5rem 1.25rem; }
    .issue-mast { padding: 1rem 1.25rem; }
    .back-bar { padding: 0.55rem 1.25rem; }
    .site-footer { padding: 1.75rem 1.25rem; flex-direction: column; gap: 0.75rem; text-align: center; }
  }
`;

// ─── FRONT PAGE ───────────────────────────────────────────────────────────

function buildFrontPage(allPosts) {
  if (!allPosts || allPosts.length === 0) return;

  const featured = allPosts[0];
  const rest     = allPosts.slice(1);

  const featuredHTML = `
    <a class="featured-card" href="${esc(featured.url)}">
      <div class="featured-img">
        ${featured.image
          ? `<img src="${esc(featured.image)}" alt="${esc(featured.headline)}" />`
          : `<div class="img-fallback"></div>`}
        <div class="featured-gradient"></div>
        <div class="featured-text">
          <span class="card-tag">${esc(featured.tag)}</span>
          <h2 class="featured-h">${esc(featured.headline)}</h2>
          <p class="featured-dek">${esc(featured.dek)}</p>
          <span class="card-meta">${esc(featured.date)} &ensp;·&ensp; Issue No. ${featured.issue}</span>
        </div>
      </div>
    </a>`;

  const gridCards = rest.map(p => `
    <a class="grid-card" href="${esc(p.url)}">
      <div class="grid-img">
        ${p.image
          ? `<img src="${esc(p.image)}" alt="${esc(p.headline)}" loading="lazy" />`
          : `<div class="img-fallback"></div>`}
      </div>
      <div class="grid-body">
        <span class="card-tag">${esc(p.tag)}</span>
        <h3 class="grid-h">${esc(p.headline)}</h3>
        <p class="grid-snippet">${esc(snippet(p.dek || p.body, 110))}</p>
        <span class="card-meta">${esc(p.date)}</span>
      </div>
    </a>`).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>ByAthletes — Athletes Who Build</title>
  ${fonts}
  <style>
    ${sharedCSS}

    /* ── FRONT PAGE GRID ──────────────────────── */
    .front-wrap { max-width: 1280px; margin: 0 auto; padding: 3.5rem 2.5rem 5rem; }

    .section-label {
      font-size: 0.55rem; font-weight: 800; letter-spacing: 0.28em;
      text-transform: uppercase; color: var(--red); margin-bottom: 1.75rem;
    }
    .divider { width: 100%; height: 1px; background: var(--brd); margin: 3.5rem 0; }

    /* Featured */
    .featured-card { display: block; }
    .featured-img {
      position: relative; width: 100%; height: 580px; overflow: hidden;
    }
    .featured-img img { height: 100%; object-fit: cover; transition: transform 0.5s ease; }
    .featured-card:hover .featured-img img { transform: scale(1.02); }
    .img-fallback { width: 100%; height: 100%; background: #1C1916; }
    .featured-gradient {
      position: absolute; inset: 0;
      background: linear-gradient(to top, rgba(8,7,6,0.92) 0%, rgba(8,7,6,0.5) 40%, transparent 75%);
    }
    .featured-text {
      position: absolute; bottom: 0; left: 0; right: 0; padding: 2.5rem 2.5rem 2.75rem;
    }
    .card-tag {
      display: inline-block; font-size: 0.52rem; font-weight: 800;
      letter-spacing: 0.28em; text-transform: uppercase;
      color: var(--red); margin-bottom: 0.85rem;
    }
    .featured-h {
      font-family: var(--serif); font-style: italic; font-weight: 700;
      font-size: clamp(1.8rem, 3.5vw, 3rem); line-height: 1.12;
      letter-spacing: -0.015em; color: #fff;
      max-width: 720px; margin-bottom: 0.85rem;
    }
    .featured-dek {
      font-size: 0.92rem; line-height: 1.65; color: rgba(255,255,255,0.55);
      max-width: 580px; margin-bottom: 1rem;
    }
    .card-meta {
      font-size: 0.52rem; font-weight: 700; letter-spacing: 0.18em;
      text-transform: uppercase; color: rgba(255,255,255,0.3);
    }

    /* Grid */
    .story-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 2rem;
    }
    .grid-card { display: flex; flex-direction: column; }
    .grid-img {
      aspect-ratio: 3/2; overflow: hidden; margin-bottom: 1.1rem; background: var(--ink);
    }
    .grid-img img { height: 100%; object-fit: cover; transition: transform 0.45s ease; }
    .grid-card:hover .grid-img img { transform: scale(1.04); }
    .grid-body { display: flex; flex-direction: column; gap: 0.45rem; }
    .grid-card .card-tag { color: var(--red); }
    .grid-card .card-meta { color: var(--ink-3); }
    .grid-h {
      font-family: var(--serif); font-style: italic; font-size: 1.1rem;
      line-height: 1.38; color: var(--ink);
    }
    .grid-snippet { font-size: 0.82rem; line-height: 1.65; color: var(--ink-3); }

    @media (max-width: 960px) { .story-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 640px) {
      .front-wrap { padding: 2.5rem 1.25rem 4rem; }
      .featured-img { height: 420px; }
      .featured-text { padding: 1.5rem 1.25rem 2rem; }
      .story-grid { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>

<header class="mast">
  <p class="mast-eyebrow">The athlete entrepreneur publication</p>
  <a href="index.html" class="mast-logo">By<em>Athletes</em></a>
  <p class="mast-tagline">For athletes who build</p>
</header>
<div class="mast-bar">
  <span>${esc(allPosts[0].date)}</span>
  <span>Issue No. ${allPosts[0].issue} &ensp;·&ensp; Entrepreneur Edition</span>
</div>

<div class="front-wrap">
  <p class="section-label">Latest</p>
  ${featuredHTML}

  ${rest.length > 0 ? `
  <div class="divider"></div>
  <p class="section-label">From This Issue</p>
  <div class="story-grid">${gridCards}</div>` : ""}
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

function buildStoryPage(post) {
  const bodyHTML = (post.body || []).map((p, i) =>
    i === 0 ? `<p class="body-p drop">${esc(p)}</p>` : `<p class="body-p">${esc(p)}</p>`
  ).join("");

  const chips = (post.chips || []).map(c => `<span class="chip">${esc(c)}</span>`).join("");

  const quoteBlock = post.quote ? `
    <blockquote class="pull-quote">
      <p>&ldquo;${esc(post.quote)}&rdquo;</p>
      <cite>&mdash; ${esc(post.quote_author)}</cite>
    </blockquote>` : "";

  const sourceBlock = post.source_url ? `
    <a class="source-link" href="${esc(post.source_url)}" target="_blank" rel="noopener">
      Read the original essay${post.source_name ? ` — ${esc(post.source_name)}` : ""} &rarr;
    </a>` : "";

  const statBlock = post.big_stat ? `
    <div class="stat-callout">
      <span class="stat-num">${esc(post.big_stat)}</span>
      <span class="stat-lbl">${esc(post.stat_label)}</span>
    </div>` : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(post.headline)} — ByAthletes</title>
  ${fonts}
  <style>
    ${sharedCSS}

    /* ── STORY HERO ───────────────────────────── */
    .story-hero {
      position: relative; width: 100%; height: 70vh; min-height: 420px;
      overflow: hidden; display: flex; align-items: flex-end;
    }
    .story-hero img {
      position: absolute; inset: 0; height: 100%; object-fit: cover;
    }
    .hero-fallback {
      position: absolute; inset: 0; background: #111;
    }
    .hero-grad {
      position: absolute; inset: 0;
      background: linear-gradient(to top, rgba(6,5,4,0.96) 0%, rgba(6,5,4,0.5) 38%, transparent 70%);
    }
    .hero-text {
      position: relative; z-index: 2;
      width: 100%; max-width: 1280px; margin: 0 auto;
      padding: 0 2.5rem 3.5rem;
    }
    .hero-tag {
      display: inline-block; font-size: 0.52rem; font-weight: 800;
      letter-spacing: 0.3em; text-transform: uppercase;
      color: var(--red); margin-bottom: 1.25rem;
    }
    .hero-h1 {
      font-family: var(--serif); font-style: italic; font-weight: 700;
      font-size: clamp(2rem, 5vw, 4.5rem); line-height: 1.08;
      letter-spacing: -0.02em; color: #fff;
      max-width: 800px; margin-bottom: 1rem;
    }
    .hero-dek {
      font-size: 1rem; line-height: 1.7;
      color: rgba(255,255,255,0.55); max-width: 560px; margin-bottom: 1rem;
    }
    .hero-byline {
      font-size: 0.55rem; font-weight: 700; letter-spacing: 0.18em;
      text-transform: uppercase; color: rgba(255,255,255,0.3);
    }
    .hero-chips {
      display: flex; flex-wrap: wrap; gap: 0.4rem; margin-top: 1.25rem;
    }
    .chip {
      font-size: 0.52rem; font-weight: 700; letter-spacing: 0.14em;
      text-transform: uppercase; border: 1px solid rgba(255,255,255,0.2);
      color: rgba(255,255,255,0.4); padding: 3px 10px;
    }

    /* ── STORY BODY ───────────────────────────── */
    .story-layout {
      max-width: 1280px; margin: 0 auto; padding: 4rem 2.5rem 5rem;
      display: grid; grid-template-columns: 1fr 280px; gap: 5rem; align-items: start;
    }
    .story-text {}
    .body-p {
      font-size: 1.05rem; line-height: 1.9; color: var(--ink-2); margin-bottom: 1.5rem;
      max-width: 680px;
    }
    .drop::first-letter {
      font-family: var(--serif); font-size: 5rem; font-weight: 700;
      line-height: 0.72; float: left;
      margin-right: 0.08em; margin-top: 0.08em; color: var(--ink);
    }
    .pull-quote {
      margin: 2.75rem 0; padding: 0 0 0 1.75rem;
      border-left: 3px solid var(--red);
    }
    .pull-quote p {
      font-family: var(--serif); font-style: italic;
      font-size: 1.5rem; line-height: 1.42; color: var(--ink);
    }
    .pull-quote cite {
      display: block; font-style: normal;
      font-size: 0.55rem; font-weight: 700; letter-spacing: 0.18em;
      text-transform: uppercase; color: var(--ink-3); margin-top: 0.75rem;
    }
    .source-link {
      display: inline-flex; align-items: center; gap: 0.5rem;
      margin-top: 2rem; padding: 0.75rem 1.25rem;
      border: 1px solid var(--brd);
      font-size: 0.6rem; font-weight: 800; letter-spacing: 0.18em;
      text-transform: uppercase; color: var(--red);
      transition: background 0.15s, border-color 0.15s;
    }
    .source-link:hover { background: var(--red); color: #fff; border-color: var(--red); }

    /* ── STORY SIDEBAR ────────────────────────── */
    .story-sidebar { position: sticky; top: 80px; }
    .stat-callout {
      background: var(--ink); padding: 2rem 1.75rem; margin-bottom: 1.5rem;
    }
    .stat-num {
      font-family: var(--cond); font-size: 3.5rem; font-weight: 900;
      line-height: 1; color: #fff; display: block; margin-bottom: 0.6rem;
      letter-spacing: -0.02em;
    }
    .stat-lbl {
      font-size: 0.72rem; line-height: 1.5; color: rgba(255,255,255,0.45);
    }
    .sidebar-chips { display: flex; flex-wrap: wrap; gap: 0.4rem; }
    .sidebar-chips .chip { border-color: var(--brd); color: var(--ink-3); }

    @media (max-width: 900px) {
      .story-layout { grid-template-columns: 1fr; gap: 2.5rem; }
      .story-sidebar { position: static; order: -1; }
      .stat-callout { display: flex; align-items: center; gap: 1.5rem; }
      .stat-num { font-size: 2.5rem; margin-bottom: 0; }
    }
    @media (max-width: 640px) {
      .hero-text { padding: 0 1.25rem 2.5rem; }
      .hero-h1 { font-size: 2rem; }
      .story-layout { padding: 3rem 1.25rem 4rem; }
    }
  </style>
</head>
<body>

<header class="issue-mast">
  <a href="index.html" class="issue-mast-logo">By<em>Athletes</em></a>
  <span class="issue-mast-meta">Issue No. ${post.issue} &ensp;·&ensp; ${esc(post.date)}</span>
</header>
<div class="back-bar">
  <a class="back-link" href="index.html">&larr; All stories</a>
</div>

<section class="story-hero">
  ${post.image
    ? `<img src="${esc(post.image)}" alt="${esc(post.headline)}" />`
    : `<div class="hero-fallback"></div>`}
  <div class="hero-grad"></div>
  <div class="hero-text">
    <span class="hero-tag">${esc(post.tag)}</span>
    <h1 class="hero-h1">${esc(post.headline)}</h1>
    ${post.dek ? `<p class="hero-dek">${esc(post.dek)}</p>` : ""}
    <p class="hero-byline">
      ${post.author ? `By ${esc(post.author)} &ensp;&middot;&ensp; ` : ""}${esc(post.date)}
    </p>
    ${chips ? `<div class="hero-chips">${chips}</div>` : ""}
  </div>
</section>

<div class="story-layout">
  <div class="story-text">
    ${bodyHTML}
    ${quoteBlock}
    ${sourceBlock}
  </div>
  ${(post.big_stat || chips) ? `
  <aside class="story-sidebar">
    ${statBlock}
    ${chips ? `<div class="sidebar-chips">${chips}</div>` : ""}
  </aside>` : ""}
</div>

<footer class="site-footer">
  <a href="index.html" class="footer-logo">ByAthletes</a>
  <span class="footer-meta">Issue No. ${post.issue} &ensp;·&ensp; ${esc(post.date)}</span>
  <span class="footer-sub"><a href="#">Subscribe</a></span>
</footer>

</body>
</html>`;
}

// ─── ASSEMBLE POSTS FROM stories.json ─────────────────────────────────────

const cs = data.cover_story;
const allNewPosts = [];

// Cover story
allNewPosts.push({
  issue      : data.issue,
  date       : data.date,
  tag        : cs.tag,
  headline   : cs.headline,
  dek        : cs.dek,
  author     : cs.author || "",
  body       : cs.body || [],
  quote      : cs.quote || "",
  quote_author: cs.quote_author || "",
  big_stat   : cs.big_stat || "",
  stat_label : cs.stat_label || "",
  image      : cs.image || "",
  source_url : cs.source_url || "",
  source_name: cs.source_name || "",
  chips      : cs.chips || [],
  url        : coverSlug(data.issue),
  type       : "cover"
});

// Side stories
(data.side_stories || []).forEach((s, i) => {
  allNewPosts.push({
    issue      : data.issue,
    date       : data.date,
    tag        : s.tag,
    headline   : s.headline,
    dek        : "",
    body       : [s.body],
    image      : s.image || "",
    source_url : s.source_url || "",
    source_name: s.source_name || "",
    url        : slug(data.issue, "side", i + 1),
    type       : "side"
  });
});

// Roundup
(data.roundup || []).forEach((r, i) => {
  allNewPosts.push({
    issue      : data.issue,
    date       : data.date,
    tag        : r.tag,
    headline   : r.headline,
    dek        : "",
    body       : [r.body],
    image      : r.image || "",
    source_url : r.source_url || "",
    source_name: r.source_name || "",
    url        : slug(data.issue, "news", i + 1),
    type       : "news"
  });
});

// Merge into posts.json — prepend new posts (avoid dupes by url)
const existingUrls = new Set(posts.map(p => p.url));
const freshPosts   = allNewPosts.filter(p => !existingUrls.has(p.url));
const allPosts     = [...freshPosts, ...posts];
fs.writeFileSync(path.join(__dirname, "posts.json"), JSON.stringify(allPosts, null, 2));

// ─── WRITE ALL FILES ──────────────────────────────────────────────────────

allNewPosts.forEach(post => {
  fs.writeFileSync(path.join(__dirname, post.url), buildStoryPage(post));
});

fs.writeFileSync(path.join(__dirname, "index.html"), buildFrontPage(allPosts));

console.log(`✅  index.html — ${allPosts.length} posts total`);
allNewPosts.forEach(p => console.log(`    ${p.url}`));
