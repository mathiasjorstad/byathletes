// ByAthletes — build.js
// Generates:
//   index.html          — landing / front page
//   stories/{id}.html   — one reading page per story

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

// Resolve image path — story pages live one level deep, so local images need ../
function img(src, sub = false) {
  if (!src) return "";
  if (src.startsWith("http")) return src;
  return sub ? `../${src}` : src;
}

// ─── SHARED CSS ───────────────────────────────────────────────────────────

const css = `
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
  body { background: var(--cream); color: var(--ink); font-family: var(--sans); -webkit-font-smoothing: antialiased; }
  a { text-decoration: none; color: inherit; }
  img { display: block; width: 100%; }

  /* ── MASTHEAD ─────────────────────────────── */

  .mast {
    background: var(--ink);
    display: flex; align-items: center; justify-content: space-between;
    padding: 1.1rem 2.5rem;
    position: sticky; top: 0; z-index: 100;
  }
  .mast-logo {
    font-family: var(--serif); font-style: italic; font-weight: 700;
    font-size: 1.8rem; letter-spacing: -0.01em; color: #fff;
  }
  .mast-logo em { color: var(--red); font-style: normal; }
  .mast-issue {
    font-family: var(--cond); font-size: 1rem; font-weight: 900;
    letter-spacing: 0.12em; text-transform: uppercase; color: rgba(255,255,255,0.35);
  }
  .mast-right {
    font-size: 0.6rem; font-weight: 600; letter-spacing: 0.18em;
    text-transform: uppercase; color: rgba(255,255,255,0.22); text-align: right;
  }
  .mast-back {
    font-size: 0.6rem; font-weight: 700; letter-spacing: 0.18em;
    text-transform: uppercase; color: rgba(255,255,255,0.38);
    transition: color 0.2s;
  }
  .mast-back:hover { color: rgba(255,255,255,0.8); }

  /* ── ARCHIVE (shared) ─────────────────────── */

  .archive {
    background: var(--ink); padding: 5rem 0;
  }
  .archive-inner {
    max-width: 1280px; margin: 0 auto; padding: 0 2.5rem;
  }
  .archive-title {
    font-family: var(--serif); font-style: italic; font-weight: 700;
    font-size: 1.75rem; color: #fff;
    padding-bottom: 1.75rem; margin-bottom: 2.5rem;
    border-bottom: 1px solid rgba(255,255,255,0.08);
  }
  .archive-grid {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 1px; background: rgba(255,255,255,0.07);
  }
  .arc-card {
    background: var(--ink); padding: 2rem 2.25rem; transition: background 0.18s;
  }
  .arc-card:hover { background: #1C1916; }
  .arc-no {
    font-family: var(--cond); font-size: 0.72rem; font-weight: 900;
    letter-spacing: 0.14em; text-transform: uppercase; color: rgba(255,255,255,0.22);
  }
  .arc-rule { width: 22px; height: 2px; background: var(--red); margin: 0.85rem 0; }
  .arc-h {
    font-family: var(--serif); font-style: italic; font-weight: 400;
    font-size: 1rem; line-height: 1.5; color: rgba(255,255,255,0.7); margin-bottom: 1.25rem;
  }
  .arc-meta {
    display: flex; gap: 1.5rem; font-size: 0.57rem; font-weight: 600;
    letter-spacing: 0.12em; text-transform: uppercase; color: rgba(255,255,255,0.22);
  }

  /* ── FOOTER (shared) ──────────────────────── */

  .site-footer {
    background: #0A0805; border-top: 1px solid rgba(255,255,255,0.05);
    padding: 2rem 2.5rem; display: flex; justify-content: space-between; align-items: center;
  }
  .footer-logo {
    font-family: var(--serif); font-style: italic; font-size: 1.3rem;
    color: rgba(255,255,255,0.38);
  }
  .footer-meta, .footer-sub {
    font-size: 0.58rem; font-weight: 600; letter-spacing: 0.16em;
    text-transform: uppercase; color: rgba(255,255,255,0.2);
  }
  .footer-sub a { color: rgba(255,255,255,0.38); }

  @media (max-width: 680px) {
    .mast { padding: 1rem 1.25rem; }
    .mast-right, .mast-back { display: none; }
    .archive-inner { padding: 0 1.25rem; }
    .site-footer { padding: 1.5rem 1.25rem; flex-direction: column; gap: 0.75rem; text-align: center; }
  }
`;

const fonts = `
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400;1,700&family=Barlow+Condensed:wght@900&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
`;

// ─── ARCHIVE CARDS HTML ────────────────────────────────────────────────────

function archiveHTML() {
  if (archive.length === 0) return "";
  const cards = archive.map(a => `
    <div class="arc-card">
      <span class="arc-no">No.&thinsp;${String(a.issue).padStart(3,"0")}</span>
      <div class="arc-rule"></div>
      <h3 class="arc-h">${a.headline}</h3>
      <div class="arc-meta"><span>${a.date}</span><span>${a.sport}</span></div>
    </div>`).join("");
  return `
    <section class="archive">
      <div class="archive-inner">
        <h2 class="archive-title">Previous Issues</h2>
        <div class="archive-grid">${cards}</div>
      </div>
    </section>`;
}

function footerHTML() {
  return `
    <footer class="site-footer">
      <span class="footer-logo">ByAthletes</span>
      <span class="footer-meta">Vol. I &ensp;·&ensp; Issue No. ${data.issue} &ensp;·&ensp; ${data.date}</span>
      <span class="footer-sub">For athletes who build &ensp;·&ensp; <a href="#">Subscribe</a></span>
    </footer>`;
}

// ─── LANDING PAGE ──────────────────────────────────────────────────────────

function buildLandingPage() {
  const hero = data.stories[0];
  const rest = data.stories.slice(1);
  const heroImg = img(hero.image, false);

  const restCards = rest.map(s => `
    <a class="story-card" href="stories/${s.id}.html">
      ${s.image ? `<div class="card-img"><img src="${img(s.image, false)}" alt="${s.headline}" loading="lazy" /></div>` : ""}
      <span class="card-sport">${s.sport}</span>
      <h2 class="card-h">${s.headline}</h2>
      <p class="card-dek">${s.dek}</p>
      <div class="card-meta">By ${s.author}&ensp;·&ensp;${s.date || data.date}</div>
      <span class="card-link">Read Story →</span>
    </a>`).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>ByAthletes — No. ${toRoman(data.issue)}</title>
  ${fonts}
  <style>
    ${css}

    /* ── HERO ─────────────────────────────────── */

    .hero {
      position: relative;
      min-height: 92vh;
      display: flex;
      align-items: flex-end;
      overflow: hidden;
    }
    .hero-img {
      position: absolute; inset: 0;
    }
    .hero-img img {
      height: 100%; object-fit: cover;
    }
    .hero-gradient {
      position: absolute; inset: 0;
      background: linear-gradient(
        to top,
        rgba(5,4,3,0.92) 0%,
        rgba(5,4,3,0.55) 38%,
        rgba(5,4,3,0.15) 65%,
        transparent 100%
      );
    }
    .hero-content {
      position: relative; z-index: 2;
      width: 100%; max-width: 1280px;
      margin: 0 auto;
      padding: 0 2.5rem 3.75rem;
    }
    .hero-sport {
      display: block; font-size: 0.57rem; font-weight: 800;
      letter-spacing: 0.3em; text-transform: uppercase;
      color: var(--red); margin-bottom: 1.5rem;
    }
    .hero-h1 {
      font-family: var(--serif); font-style: italic; font-weight: 700;
      font-size: clamp(2.6rem, 5.5vw, 5.5rem);
      line-height: 1.06; letter-spacing: -0.025em;
      color: #fff; max-width: 760px; margin-bottom: 1.25rem;
    }
    .hero-dek {
      font-size: 1rem; line-height: 1.7;
      color: rgba(255,255,255,0.6);
      max-width: 520px; margin-bottom: 1.5rem;
    }
    .hero-meta {
      font-size: 0.6rem; font-weight: 700; letter-spacing: 0.16em;
      text-transform: uppercase; color: rgba(255,255,255,0.38);
      margin-bottom: 2rem;
    }
    .hero-cta {
      display: inline-block; font-size: 0.62rem; font-weight: 800;
      letter-spacing: 0.2em; text-transform: uppercase; color: #fff;
      border: 1px solid rgba(255,255,255,0.35); padding: 0.85rem 2rem;
      transition: background 0.2s, border-color 0.2s;
    }
    .hero-cta:hover {
      background: rgba(255,255,255,0.1);
      border-color: rgba(255,255,255,0.65);
    }

    /* ── STORY GRID (for additional stories) ─── */

    .stories-section {
      max-width: 1280px; margin: 0 auto; padding: 4rem 2.5rem;
    }
    .stories-eyebrow {
      display: flex; align-items: center; gap: 1.25rem; margin-bottom: 2.5rem;
    }
    .eyebrow-label {
      font-size: 0.57rem; font-weight: 800; letter-spacing: 0.26em;
      text-transform: uppercase; color: var(--red); white-space: nowrap;
    }
    .eyebrow-rule { flex: 1; height: 1px; background: var(--brd); }
    .stories-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 2.5rem;
    }
    .story-card {
      display: flex; flex-direction: column;
      cursor: pointer;
    }
    .card-img {
      aspect-ratio: 3/2; overflow: hidden; margin-bottom: 1.25rem;
    }
    .card-img img {
      height: 100%; object-fit: cover;
      transition: transform 0.5s ease;
    }
    .story-card:hover .card-img img { transform: scale(1.04); }
    .card-sport {
      display: block; font-size: 0.57rem; font-weight: 800;
      letter-spacing: 0.26em; text-transform: uppercase;
      color: var(--red); margin-bottom: 0.75rem;
    }
    .card-h {
      font-family: var(--serif); font-style: italic; font-weight: 700;
      font-size: 1.5rem; line-height: 1.2; color: var(--ink); margin-bottom: 0.65rem;
    }
    .card-dek {
      font-size: 0.85rem; color: var(--ink-3); line-height: 1.65;
      margin-bottom: 1rem; flex: 1;
    }
    .card-meta {
      font-size: 0.58rem; font-weight: 700; letter-spacing: 0.14em;
      text-transform: uppercase; color: var(--ink-3); margin-bottom: 0.85rem;
    }
    .card-link {
      font-size: 0.6rem; font-weight: 800; letter-spacing: 0.16em;
      text-transform: uppercase; color: var(--red);
    }

    @media (max-width: 680px) {
      .hero-content { padding: 0 1.25rem 3rem; }
      .hero-h1 { font-size: 2.4rem; }
      .stories-section { padding: 3rem 1.25rem; }
    }
  </style>
</head>
<body>

<header class="mast">
  <span class="mast-logo">By<em>Athletes</em></span>
  <span class="mast-issue">No.&thinsp;${toRoman(data.issue)}</span>
  <span class="mast-right">Issue ${data.issue}&ensp;·&ensp;${data.date}</span>
</header>

<section class="hero">
  <div class="hero-img">
    ${heroImg ? `<img src="${heroImg}" alt="${hero.headline}" />` : `<div style="background:#1a1917;width:100%;height:100%;"></div>`}
  </div>
  <div class="hero-gradient"></div>
  <div class="hero-content">
    <span class="hero-sport">${hero.sport}</span>
    <h1 class="hero-h1">${hero.headline}</h1>
    <p class="hero-dek">${hero.dek}</p>
    <div class="hero-meta">By ${hero.author}&ensp;·&ensp;${hero.date || data.date}</div>
    <a class="hero-cta" href="stories/${hero.id}.html">Read Story →</a>
  </div>
</section>

${rest.length > 0 ? `
<div class="stories-section">
  <div class="stories-eyebrow">
    <span class="eyebrow-label">Also in This Issue</span>
    <div class="eyebrow-rule"></div>
  </div>
  <div class="stories-grid">${restCards}</div>
</div>` : ""}

${archiveHTML()}
${footerHTML()}

</body>
</html>`;
}

// ─── STORY PAGE ────────────────────────────────────────────────────────────

function buildStoryPage(story) {
  const heroImg = img(story.image, true);

  const paras = story.body.map((p, i) =>
    i === 0 ? `<p class="p drop">${p}</p>` : `<p class="p">${p}</p>`
  ).join("\n");

  const tags = (story.tags || []).map(t => `<span class="tag">${t}</span>`).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${story.headline} — ByAthletes</title>
  ${fonts}
  <style>
    ${css}

    /* ── ARTICLE ──────────────────────────────── */

    .article-header {
      max-width: 800px; margin: 0 auto;
      padding: 5.5rem 2rem 3.5rem; text-align: center;
    }
    .sport {
      display: block; font-size: 0.57rem; font-weight: 800;
      letter-spacing: 0.3em; text-transform: uppercase;
      color: var(--red); margin-bottom: 2.25rem;
    }
    .h1 {
      font-family: var(--serif); font-style: italic; font-weight: 700;
      font-size: clamp(2.8rem, 5.5vw, 5.2rem); line-height: 1.06;
      letter-spacing: -0.025em; color: var(--ink); margin-bottom: 1.75rem;
    }
    .dek {
      font-size: 1.05rem; line-height: 1.72; color: var(--ink-2);
      max-width: 580px; margin: 0 auto 1.75rem;
    }
    .byline {
      font-size: 0.6rem; font-weight: 700; letter-spacing: 0.18em;
      text-transform: uppercase; color: var(--ink-3);
    }
    .hero {
      width: 100%; border-top: 1px solid var(--brd); overflow: hidden;
    }
    .hero img { height: 72vh; object-fit: cover; }
    .body {
      max-width: 680px; margin: 0 auto; padding: 3.75rem 2rem 0;
    }
    .p {
      font-size: 1.05rem; line-height: 1.9; color: var(--ink-2); margin-bottom: 1.4rem;
    }
    .drop::first-letter {
      font-family: var(--serif); font-size: 5rem; font-weight: 700;
      line-height: 0.68; float: left;
      margin-right: 0.07em; margin-top: 0.1em; color: var(--ink);
    }
    .quote {
      margin: 3.25rem 0; padding: 0 0 0 2rem; border-left: 3px solid var(--red);
    }
    .quote p {
      font-family: var(--serif); font-style: italic;
      font-size: 1.6rem; line-height: 1.42; color: var(--ink);
    }
    .quote cite {
      display: block; font-family: var(--sans); font-style: normal;
      font-size: 0.6rem; font-weight: 700; letter-spacing: 0.18em;
      text-transform: uppercase; color: var(--ink-3); margin-top: 0.85rem;
    }
    .stat {
      display: flex; align-items: baseline; gap: 1.75rem;
      border-top: 1px solid var(--brd); border-bottom: 1px solid var(--brd);
      padding: 2.25rem 0; margin: 2.75rem 0;
    }
    .stat-num {
      font-family: var(--cond); font-size: 5rem; font-weight: 900;
      line-height: 1; color: var(--ink); letter-spacing: -0.02em; white-space: nowrap;
    }
    .stat-label { font-size: 0.85rem; color: var(--ink-3); line-height: 1.6; }
    .article-footer {
      max-width: 680px; margin: 0 auto;
      padding: 1.75rem 2rem 6rem; display: flex; flex-direction: column; gap: 1rem;
    }
    .tags { display: flex; flex-wrap: wrap; gap: 0.5rem; }
    .tag {
      font-size: 0.57rem; font-weight: 700; letter-spacing: 0.14em;
      text-transform: uppercase; border: 1px solid var(--brd); color: var(--ink-3); padding: 5px 12px;
    }
    .source {
      display: inline-block; font-size: 0.6rem; font-weight: 800;
      letter-spacing: 0.18em; text-transform: uppercase; color: var(--red);
      transition: letter-spacing 0.2s;
    }
    .source:hover { letter-spacing: 0.28em; }

    @media (max-width: 680px) {
      .article-header { padding: 3.5rem 1.25rem 2.5rem; }
      .body { padding-left: 1.25rem; padding-right: 1.25rem; }
      .article-footer { padding-left: 1.25rem; padding-right: 1.25rem; }
      .quote { padding-left: 1.25rem; }
      .h1 { font-size: 2.6rem; }
    }
  </style>
</head>
<body>

<header class="mast">
  <a class="mast-logo" href="../index.html">By<em>Athletes</em></a>
  <span class="mast-issue">No.&thinsp;${toRoman(data.issue)}</span>
  <a class="mast-back" href="../index.html">← Front Page</a>
</header>

<header class="article-header">
  <span class="sport">${story.sport}</span>
  <h1 class="h1">${story.headline}</h1>
  <p class="dek">${story.dek}</p>
  <p class="byline">By ${story.author}&ensp;·&ensp;${story.date || data.date}</p>
</header>

${heroImg ? `<div class="hero"><img src="${heroImg}" alt="${story.headline}" /></div>` : `<div style="height:2px;background:var(--brd);"></div>`}

<div class="body">
  ${paras}
  <div class="quote">
    <p>"${story.quote}"</p>
    <cite>— ${story.quote_author}</cite>
  </div>
  ${story.stat ? `
  <div class="stat">
    <span class="stat-num">${story.stat}</span>
    <span class="stat-label">${story.stat_label}</span>
  </div>` : ""}
</div>

<footer class="article-footer">
  ${tags ? `<div class="tags">${tags}</div>` : ""}
  ${story.source_url ? `<a class="source" href="${story.source_url}" target="_blank" rel="noopener">Read original — ${story.source_name || "Source"} →</a>` : ""}
</footer>

${archiveHTML()}
${footerHTML()}

</body>
</html>`;
}

// ─── BUILD ─────────────────────────────────────────────────────────────────

// Ensure stories/ directory exists
const storiesDir = path.join(__dirname, "stories");
if (!fs.existsSync(storiesDir)) fs.mkdirSync(storiesDir);

// Generate individual story pages
data.stories.forEach(story => {
  const html = buildStoryPage(story);
  fs.writeFileSync(path.join(storiesDir, `${story.id}.html`), html);
  console.log(`  📄 stories/${story.id}.html`);
});

// Generate landing page
const landing = buildLandingPage();
fs.writeFileSync(path.join(__dirname, "index.html"), landing);

console.log(`✅ Built index.html + ${data.stories.length} story page(s) — Issue #${data.issue} (${data.date})`);
