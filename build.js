// ByAthletes — build.js
// Generates:
//   index.html       — front page (latest issue + past issues)
//   issue-{N}.html   — individual issue page (full content)
//   archive.json     — updated with current issue stub

const fs   = require("fs");
const path = require("path");

const data = JSON.parse(fs.readFileSync(path.join(__dirname, "stories.json"), "utf8"));

// ─── ARCHIVE ──────────────────────────────────────────────────────────────
// Load existing archive, add current issue if new

let archive = [];
try { archive = JSON.parse(fs.readFileSync(path.join(__dirname, "archive.json"), "utf8")); } catch(e) {}

if (!archive.some(a => a.issue === data.issue)) {
  archive.unshift({
    issue : data.issue,
    date  : data.date,
    headline : data.cover_story.headline,
    dek      : data.cover_story.dek,
    tag      : data.cover_story.tag,
    image    : data.cover_story.image || ""
  });
  fs.writeFileSync(path.join(__dirname, "archive.json"), JSON.stringify(archive, null, 2));
}

// ─── HELPERS ──────────────────────────────────────────────────────────────

function esc(s) {
  return String(s || "")
    .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;");
}

function issueSlug(n) { return `issue-${n}.html`; }

// ─── FONTS + SHARED CSS ───────────────────────────────────────────────────

const fonts = `
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400;1,700&family=Barlow+Condensed:wght@900&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
`;

const baseCSS = `
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
  .mast-center {
    font-family: var(--cond); font-size: 0.75rem; font-weight: 900;
    letter-spacing: 0.18em; text-transform: uppercase; color: rgba(255,255,255,0.28);
  }
  .mast-right {
    font-size: 0.58rem; font-weight: 600; letter-spacing: 0.18em;
    text-transform: uppercase; color: rgba(255,255,255,0.22); text-align: right;
  }

  /* ── FOOTER ───────────────────────────────── */

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

  /* ── SECTION EYEBROW ──────────────────────── */

  .section-eyebrow {
    display: flex; align-items: center; gap: 1.25rem; margin-bottom: 2.5rem;
  }
  .eyebrow-label {
    font-size: 0.57rem; font-weight: 800; letter-spacing: 0.26em;
    text-transform: uppercase; color: var(--red); white-space: nowrap;
  }
  .eyebrow-rule { flex: 1; height: 1px; background: var(--brd); }

  @media (max-width: 680px) {
    .mast { padding: 1rem 1.25rem; }
    .mast-right { display: none; }
    .site-footer { padding: 1.5rem 1.25rem; flex-direction: column; gap: 0.75rem; text-align: center; }
  }
`;

// ─── FRONT PAGE ───────────────────────────────────────────────────────────

function buildFrontPage() {
  const latest   = archive[0];
  const past     = archive.slice(1);

  const latestCard = `
    <a class="lead-card" href="${issueSlug(latest.issue)}">
      <div class="lead-img">
        ${latest.image
          ? `<img src="${esc(latest.image)}" alt="${esc(latest.headline)}" />`
          : `<div class="lead-img-fallback"></div>`}
        <div class="lead-img-overlay"></div>
      </div>
      <div class="lead-body">
        <span class="lead-tag">${esc(latest.tag)}</span>
        <h2 class="lead-h">${esc(latest.headline)}</h2>
        <p class="lead-dek">${esc(latest.dek)}</p>
        <div class="lead-meta">
          <span class="lead-issue">Issue No. ${latest.issue}</span>
          <span class="lead-date">${esc(latest.date)}</span>
        </div>
        <span class="lead-cta">Read this issue →</span>
      </div>
    </a>`;

  const pastCards = past.length === 0 ? "" : `
    <section class="past-section">
      <div class="past-inner">
        <div class="section-eyebrow">
          <span class="eyebrow-label">Previous Issues</span>
          <div class="eyebrow-rule"></div>
        </div>
        <div class="past-grid">
          ${past.map(a => `
          <a class="past-card" href="${issueSlug(a.issue)}">
            <div class="past-img">
              ${a.image
                ? `<img src="${esc(a.image)}" alt="${esc(a.headline)}" loading="lazy" />`
                : `<div class="past-img-fallback"></div>`}
            </div>
            <div class="past-body">
              <span class="past-tag">${esc(a.tag)}</span>
              <h3 class="past-h">${esc(a.headline)}</h3>
              <div class="past-meta">No. ${a.issue} &ensp;·&ensp; ${esc(a.date)}</div>
            </div>
          </a>`).join("")}
        </div>
      </div>
    </section>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>ByAthletes — Athletes Who Build</title>
  ${fonts}
  <style>
    ${baseCSS}

    /* ── FRONT PAGE MASTHEAD ──────────────────── */

    .mast-front {
      background: var(--ink);
      padding: 3rem 2.5rem 2.5rem;
      text-align: center;
      border-bottom: 3px solid var(--red);
    }
    .mast-front-kicker {
      font-size: 0.57rem; font-weight: 800; letter-spacing: 0.3em;
      text-transform: uppercase; color: rgba(255,255,255,0.3); margin-bottom: 1rem;
    }
    .mast-front-logo {
      font-family: var(--serif); font-style: italic; font-weight: 700;
      font-size: clamp(3rem, 8vw, 6.5rem); letter-spacing: -0.02em; color: #fff;
      line-height: 1; margin-bottom: 0.75rem;
    }
    .mast-front-logo em { color: var(--red); font-style: normal; }
    .mast-front-sub {
      font-size: 0.65rem; font-weight: 600; letter-spacing: 0.2em;
      text-transform: uppercase; color: rgba(255,255,255,0.25);
    }

    /* ── DATE BAR ─────────────────────────────── */

    .date-bar {
      background: var(--cream); border-bottom: 1px solid var(--brd);
      padding: 0.55rem 2.5rem;
      display: flex; justify-content: space-between; align-items: center;
    }
    .date-bar-left {
      font-size: 0.57rem; font-weight: 700; letter-spacing: 0.18em;
      text-transform: uppercase; color: var(--ink-3);
    }
    .date-bar-right {
      font-size: 0.57rem; font-weight: 700; letter-spacing: 0.18em;
      text-transform: uppercase; color: var(--ink-3);
    }

    /* ── LATEST ISSUE (LEAD) ─────────────────── */

    .lead-section { max-width: 1280px; margin: 0 auto; padding: 3.5rem 2.5rem 4rem; }

    .lead-label {
      font-size: 0.57rem; font-weight: 800; letter-spacing: 0.3em;
      text-transform: uppercase; color: var(--red); margin-bottom: 1.5rem;
    }

    .lead-card {
      display: grid; grid-template-columns: 1fr 420px; gap: 0;
      background: var(--ink); overflow: hidden;
      transition: opacity 0.2s;
    }
    .lead-card:hover { opacity: 0.92; }

    .lead-img { position: relative; min-height: 480px; }
    .lead-img img { height: 100%; object-fit: cover; }
    .lead-img-fallback { width: 100%; height: 100%; background: #1C1916; }
    .lead-img-overlay {
      position: absolute; inset: 0;
      background: linear-gradient(to right, transparent 50%, rgba(17,16,16,0.7) 100%);
    }

    .lead-body {
      padding: 3rem 2.5rem;
      display: flex; flex-direction: column; justify-content: center; gap: 1rem;
    }
    .lead-tag {
      font-size: 0.55rem; font-weight: 800; letter-spacing: 0.26em;
      text-transform: uppercase; color: var(--red);
    }
    .lead-h {
      font-family: var(--serif); font-style: italic; font-weight: 700;
      font-size: clamp(1.6rem, 2.5vw, 2.4rem); line-height: 1.18;
      letter-spacing: -0.01em; color: #fff;
    }
    .lead-dek {
      font-size: 0.9rem; line-height: 1.7; color: rgba(255,255,255,0.5);
    }
    .lead-meta {
      display: flex; gap: 1.5rem;
      font-size: 0.57rem; font-weight: 700; letter-spacing: 0.16em;
      text-transform: uppercase; color: rgba(255,255,255,0.28);
    }
    .lead-cta {
      display: inline-block; margin-top: 0.5rem;
      font-size: 0.6rem; font-weight: 800; letter-spacing: 0.2em;
      text-transform: uppercase; color: var(--red);
      border-bottom: 1px solid var(--red); padding-bottom: 2px;
      width: fit-content;
    }

    /* ── PAST ISSUES ─────────────────────────── */

    .past-section { border-top: 1px solid var(--brd); }
    .past-inner { max-width: 1280px; margin: 0 auto; padding: 4rem 2.5rem 5rem; }

    .past-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 2rem; }

    .past-card { display: flex; flex-direction: column; transition: opacity 0.2s; }
    .past-card:hover { opacity: 0.8; }

    .past-img { aspect-ratio: 3/2; overflow: hidden; margin-bottom: 1.1rem; }
    .past-img img { height: 100%; object-fit: cover; transition: transform 0.4s ease; }
    .past-card:hover .past-img img { transform: scale(1.04); }
    .past-img-fallback { width: 100%; height: 100%; background: var(--ink); }

    .past-tag {
      display: block; font-size: 0.55rem; font-weight: 800;
      letter-spacing: 0.24em; text-transform: uppercase; color: var(--red); margin-bottom: 0.5rem;
    }
    .past-h {
      font-family: var(--serif); font-style: italic; font-size: 1.1rem;
      line-height: 1.4; color: var(--ink); margin-bottom: 0.6rem;
    }
    .past-meta {
      font-size: 0.57rem; font-weight: 700; letter-spacing: 0.14em;
      text-transform: uppercase; color: var(--ink-3);
    }

    @media (max-width: 900px) {
      .lead-card { grid-template-columns: 1fr; }
      .lead-img { min-height: 280px; }
      .lead-img-overlay { background: linear-gradient(to bottom, transparent 50%, rgba(17,16,16,0.7) 100%); }
    }
    @media (max-width: 680px) {
      .mast-front { padding: 2rem 1.25rem; }
      .date-bar { padding: 0.55rem 1.25rem; }
      .lead-section { padding: 2.5rem 1.25rem 3rem; }
      .past-inner { padding: 3rem 1.25rem 4rem; }
      .lead-body { padding: 2rem 1.5rem; }
    }
  </style>
</head>
<body>

<!-- MASTHEAD -->
<header class="mast-front">
  <p class="mast-front-kicker">The athlete entrepreneur publication</p>
  <h1 class="mast-front-logo">By<em>Athletes</em></h1>
  <p class="mast-front-sub">For athletes who build</p>
</header>

<div class="date-bar">
  <span class="date-bar-left">${esc(latest.date)}</span>
  <span class="date-bar-right">Issue No. ${latest.issue} &ensp;·&ensp; Entrepreneur Edition</span>
</div>

<!-- LATEST ISSUE -->
<div class="lead-section">
  <p class="lead-label">Latest Issue</p>
  ${latestCard}
</div>

${pastCards}

<footer class="site-footer">
  <span class="footer-logo">ByAthletes</span>
  <span class="footer-meta">For athletes who build</span>
  <span class="footer-sub"><a href="#">Subscribe</a></span>
</footer>

</body>
</html>`;
}

// ─── ISSUE PAGE ───────────────────────────────────────────────────────────

function buildIssuePage() {
  const cs          = data.cover_story;
  const ss          = data.side_stories  || [];
  const roundup     = data.roundup       || [];
  const tips        = data.tips          || [];
  const stats       = data.stats         || {};
  const investments = data.investments   || [];

  const chips = (cs.chips || []).map(c => `<span class="chip">${esc(c)}</span>`).join("");
  const bodyParas = (cs.body || []).map((p, i) =>
    i === 0 ? `<p class="cover-p drop">${p}</p>` : `<p class="cover-p">${p}</p>`
  ).join("");

  const sideCards = ss.map(s => {
    const isBlue = s.tag_style === "blue";
    return `
    <article class="side-card ${isBlue ? "side-card--opinion" : ""}">
      <span class="side-tag ${isBlue ? "side-tag--blue" : ""}">${esc(s.tag)}</span>
      <h3 class="side-h">${esc(s.headline)}</h3>
      <p class="side-body">${esc(s.body)}</p>
    </article>`;
  }).join("");

  const roundupCards = roundup.map(r => `
    <article class="roundup-card">
      <div class="roundup-body">
        <span class="roundup-tag">${esc(r.tag)}</span>
        <h3 class="roundup-h">${esc(r.headline)}</h3>
        <p class="roundup-p">${esc(r.body)}</p>
      </div>
    </article>`).join("");

  const tipCards = tips.map((t, i) => `
    <div class="tip-card">
      <span class="tip-num">${String(i + 1).padStart(2,"0")}</span>
      <div>
        <h4 class="tip-h">${esc(t.headline)}</h4>
        <p class="tip-body">${esc(t.body)}</p>
      </div>
    </div>`).join("");

  const figureCards = (stats.figures || []).map(f => `
    <div class="stat-figure">
      <span class="stat-num">${esc(f.num)}</span>
      <span class="stat-lbl">${esc(f.label)}</span>
    </div>`).join("");

  const sectorPills = (stats.sectors || []).map(s => `<span class="sector-pill">${esc(s)}</span>`).join("");

  const investCards = investments.map(inv => `
    <article class="invest-card">
      <div class="invest-top">
        <span class="invest-sport">${esc(inv.sport)}</span>
        <span class="invest-round">${esc(inv.round)}</span>
      </div>
      <h3 class="invest-h">${esc(inv.headline)}</h3>
      <p class="invest-investor">${esc(inv.investor)}</p>
      <p class="invest-amount">${esc(inv.amount)}</p>
      <p class="invest-body">${esc(inv.body)}</p>
    </article>`).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>ByAthletes — Issue No. ${data.issue}</title>
  ${fonts}
  <style>
    ${baseCSS}

    /* ── HERO / COVER ─────────────────────────── */

    .hero {
      position: relative; min-height: 88vh;
      display: flex; align-items: flex-end; overflow: hidden;
    }
    .hero-img { position: absolute; inset: 0; }
    .hero-img img { height: 100%; object-fit: cover; }
    .hero-img-fallback { width: 100%; height: 100%; background: #1C1916; }
    .hero-gradient {
      position: absolute; inset: 0;
      background: linear-gradient(to top, rgba(5,4,3,0.95) 0%, rgba(5,4,3,0.5) 40%, rgba(5,4,3,0.1) 70%, transparent 100%);
    }
    .hero-content {
      position: relative; z-index: 2; width: 100%;
      max-width: 1280px; margin: 0 auto; padding: 0 2.5rem 3.75rem;
    }
    .hero-tag {
      display: inline-block; font-size: 0.57rem; font-weight: 800;
      letter-spacing: 0.3em; text-transform: uppercase;
      color: var(--red); margin-bottom: 1.5rem;
    }
    .hero-h1 {
      font-family: var(--serif); font-style: italic; font-weight: 700;
      font-size: clamp(2.4rem, 5.5vw, 5rem); line-height: 1.06;
      letter-spacing: -0.025em; color: #fff; max-width: 820px; margin-bottom: 1.25rem;
    }
    .hero-dek {
      font-size: 1rem; line-height: 1.7; color: rgba(255,255,255,0.55);
      max-width: 560px; margin-bottom: 1.25rem;
    }
    .hero-meta {
      font-size: 0.6rem; font-weight: 700; letter-spacing: 0.16em;
      text-transform: uppercase; color: rgba(255,255,255,0.35); margin-bottom: 1.5rem;
    }
    .hero-chips { display: flex; flex-wrap: wrap; gap: 0.5rem; }
    .chip {
      font-size: 0.55rem; font-weight: 700; letter-spacing: 0.14em;
      text-transform: uppercase; border: 1px solid rgba(255,255,255,0.22);
      color: rgba(255,255,255,0.45); padding: 4px 12px;
    }

    /* ── COVER BODY ──────────────────────────── */

    .cover-section {
      max-width: 1280px; margin: 0 auto; padding: 4rem 2.5rem;
      display: grid; grid-template-columns: 1fr 320px; gap: 4rem;
      align-items: start;
    }
    .cover-p {
      font-size: 1.05rem; line-height: 1.9; color: var(--ink-2); margin-bottom: 1.4rem;
    }
    .drop::first-letter {
      font-family: var(--serif); font-size: 5rem; font-weight: 700;
      line-height: 0.68; float: left;
      margin-right: 0.07em; margin-top: 0.1em; color: var(--ink);
    }
    .cover-quote {
      margin: 2.5rem 0; padding: 0 0 0 2rem; border-left: 3px solid var(--red);
    }
    .cover-quote p {
      font-family: var(--serif); font-style: italic;
      font-size: 1.45rem; line-height: 1.42; color: var(--ink);
    }
    .cover-quote cite {
      display: block; font-style: normal; font-size: 0.58rem; font-weight: 700;
      letter-spacing: 0.18em; text-transform: uppercase; color: var(--ink-3); margin-top: 0.75rem;
    }

    /* ── COVER SIDEBAR ───────────────────────── */

    .big-stat {
      background: var(--ink); color: #fff;
      padding: 2.25rem 2rem; margin-bottom: 1.5rem;
    }
    .big-stat-num {
      font-family: var(--cond); font-size: 4rem; font-weight: 900;
      line-height: 1; letter-spacing: -0.02em; color: #fff; display: block;
      margin-bottom: 0.75rem;
    }
    .big-stat-label {
      font-size: 0.75rem; color: rgba(255,255,255,0.5); line-height: 1.5;
    }
    .cover-chips-sidebar { display: flex; flex-wrap: wrap; gap: 0.4rem; }
    .cover-chips-sidebar .chip {
      border-color: var(--brd); color: var(--ink-3);
    }

    /* ── SIDE STORIES ────────────────────────── */

    .side-section { border-top: 1px solid var(--brd); }
    .side-inner { max-width: 1280px; margin: 0 auto; padding: 4rem 2.5rem; }
    .side-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 0; border: 1px solid var(--brd);
    }
    .side-card {
      padding: 2rem 2.25rem; border-right: 1px solid var(--brd);
      border-bottom: 1px solid var(--brd);
    }
    .side-card--opinion { background: #F0EEF8; }
    .side-tag {
      display: inline-block; font-size: 0.55rem; font-weight: 800;
      letter-spacing: 0.24em; text-transform: uppercase; color: var(--red);
      margin-bottom: 0.85rem;
    }
    .side-tag--blue { color: #3B4FAB; }
    .side-h {
      font-family: var(--serif); font-style: italic; font-size: 1.1rem;
      line-height: 1.38; color: var(--ink); margin-bottom: 0.75rem;
    }
    .side-body { font-size: 0.82rem; line-height: 1.7; color: var(--ink-3); }

    /* ── ROUNDUP ─────────────────────────────── */

    .roundup-section { border-top: 1px solid var(--brd); background: #F9F7F3; }
    .roundup-inner { max-width: 1280px; margin: 0 auto; padding: 4rem 2.5rem; }
    .roundup-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 0; border: 1px solid var(--brd);
    }
    .roundup-card { border-right: 1px solid var(--brd); border-bottom: 1px solid var(--brd); }
    .roundup-body { padding: 1.75rem 2rem; }
    .roundup-tag {
      display: block; font-size: 0.55rem; font-weight: 800;
      letter-spacing: 0.24em; text-transform: uppercase; color: var(--red); margin-bottom: 0.6rem;
    }
    .roundup-h {
      font-family: var(--serif); font-style: italic; font-size: 1.05rem;
      line-height: 1.38; color: var(--ink); margin-bottom: 0.65rem;
    }
    .roundup-p { font-size: 0.82rem; line-height: 1.7; color: var(--ink-3); }

    /* ── STATS ───────────────────────────────── */

    .stats-section { background: var(--ink); padding: 5rem 0; }
    .stats-inner { max-width: 1280px; margin: 0 auto; padding: 0 2.5rem; }
    .stats-figures {
      display: grid; grid-template-columns: repeat(3, 1fr);
      gap: 1px; background: rgba(255,255,255,0.07); margin-bottom: 3rem;
    }
    .stat-figure { background: var(--ink); padding: 2.5rem 2rem; }
    .stat-num {
      font-family: var(--cond); font-size: 4rem; font-weight: 900;
      line-height: 1; letter-spacing: -0.02em; color: #fff; display: block; margin-bottom: 0.85rem;
    }
    .stat-lbl { font-size: 0.78rem; color: rgba(255,255,255,0.42); line-height: 1.55; }
    .sectors-label {
      font-size: 0.57rem; font-weight: 800; letter-spacing: 0.24em;
      text-transform: uppercase; color: rgba(255,255,255,0.25); margin-bottom: 1rem;
    }
    .sectors-pills { display: flex; flex-wrap: wrap; gap: 0.5rem; }
    .sector-pill {
      font-size: 0.58rem; font-weight: 700; letter-spacing: 0.12em;
      text-transform: uppercase; border: 1px solid rgba(255,255,255,0.18);
      color: rgba(255,255,255,0.45); padding: 5px 14px;
    }

    /* ── TIPS ────────────────────────────────── */

    .tips-section { border-top: 1px solid var(--brd); }
    .tips-inner { max-width: 1280px; margin: 0 auto; padding: 4rem 2.5rem; }
    .tips-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 2rem; }
    .tip-card { display: flex; gap: 1.25rem; align-items: flex-start; }
    .tip-num {
      font-family: var(--cond); font-size: 2.25rem; font-weight: 900;
      line-height: 1; color: var(--brd); flex-shrink: 0; padding-top: 0.1rem;
    }
    .tip-h {
      font-size: 0.78rem; font-weight: 800; letter-spacing: 0.04em;
      text-transform: uppercase; color: var(--ink); margin-bottom: 0.5rem;
    }
    .tip-body { font-size: 0.82rem; line-height: 1.7; color: var(--ink-3); }

    /* ── INVESTMENTS ──────────────────────────── */

    .invest-section { border-top: 1px solid var(--brd); background: #F9F7F3; }
    .invest-inner { max-width: 1280px; margin: 0 auto; padding: 4rem 2.5rem; }
    .invest-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 2px; background: var(--brd); }
    .invest-card { background: var(--cream); padding: 2.25rem 2rem; }
    .invest-top { display: flex; justify-content: space-between; margin-bottom: 0.85rem; }
    .invest-sport {
      font-size: 0.55rem; font-weight: 800; letter-spacing: 0.22em;
      text-transform: uppercase; color: var(--red);
    }
    .invest-round {
      font-size: 0.55rem; font-weight: 700; letter-spacing: 0.14em;
      text-transform: uppercase; color: var(--ink-3);
    }
    .invest-h {
      font-family: var(--serif); font-style: italic; font-size: 1.1rem;
      line-height: 1.38; color: var(--ink); margin-bottom: 0.5rem;
    }
    .invest-investor {
      font-size: 0.62rem; font-weight: 800; letter-spacing: 0.1em;
      text-transform: uppercase; color: var(--ink); margin-bottom: 0.35rem;
    }
    .invest-amount {
      font-family: var(--cond); font-size: 1.75rem; font-weight: 900;
      color: var(--red); line-height: 1; margin-bottom: 0.85rem;
    }
    .invest-body { font-size: 0.82rem; line-height: 1.7; color: var(--ink-3); }

    /* ── BACK LINK ───────────────────────────── */

    .back-bar {
      background: var(--cream); border-bottom: 1px solid var(--brd);
      padding: 0.6rem 2.5rem;
    }
    .back-link {
      font-size: 0.57rem; font-weight: 800; letter-spacing: 0.2em;
      text-transform: uppercase; color: var(--ink-3);
    }
    .back-link:hover { color: var(--red); }

    @media (max-width: 900px) {
      .cover-section { grid-template-columns: 1fr; gap: 2.5rem; }
      .cover-sidebar { order: -1; }
      .stats-figures { grid-template-columns: 1fr; }
    }
    @media (max-width: 680px) {
      .hero-content { padding: 0 1.25rem 3rem; }
      .hero-h1 { font-size: 2.2rem; }
      .cover-section, .side-inner, .roundup-inner, .tips-inner, .invest-inner { padding: 3rem 1.25rem; }
      .stats-inner { padding: 0 1.25rem; }
      .back-bar { padding: 0.6rem 1.25rem; }
    }
  </style>
</head>
<body>

<header class="mast">
  <a href="index.html" class="mast-logo">By<em>Athletes</em></a>
  <span class="mast-center">Issue No. ${data.issue}</span>
  <span class="mast-right">${esc(data.date)}</span>
</header>

<div class="back-bar">
  <a class="back-link" href="index.html">← All Issues</a>
</div>

<!-- HERO -->
<section class="hero">
  <div class="hero-img">
    ${cs.image
      ? `<img src="${esc(cs.image)}" alt="${esc(cs.headline)}" />`
      : `<div class="hero-img-fallback"></div>`}
  </div>
  <div class="hero-gradient"></div>
  <div class="hero-content">
    <span class="hero-tag">${esc(cs.tag)}</span>
    <h1 class="hero-h1">${esc(cs.headline)}</h1>
    <p class="hero-dek">${esc(cs.dek)}</p>
    <div class="hero-meta">By ${esc(cs.author)}&ensp;·&ensp;${esc(data.date)}</div>
    <div class="hero-chips">${chips}</div>
  </div>
</section>

<!-- COVER BODY -->
<section class="cover-section">
  <div class="cover-body-wrap">
    <div class="section-eyebrow">
      <span class="eyebrow-label">Cover Story</span>
      <div class="eyebrow-rule"></div>
    </div>
    ${bodyParas}
    <div class="cover-quote">
      <p>"${esc(cs.quote)}"</p>
      <cite>— ${esc(cs.quote_author)}</cite>
    </div>
  </div>
  <div class="cover-sidebar">
    <div class="big-stat">
      <span class="big-stat-num">${esc(cs.big_stat)}</span>
      <span class="big-stat-label">${esc(cs.stat_label)}</span>
    </div>
    <div class="cover-chips-sidebar">${chips}</div>
  </div>
</section>

<!-- SIDE STORIES -->
${ss.length > 0 ? `
<section class="side-section">
  <div class="side-inner">
    <div class="section-eyebrow">
      <span class="eyebrow-label">Also in This Issue</span>
      <div class="eyebrow-rule"></div>
    </div>
    <div class="side-grid">${sideCards}</div>
  </div>
</section>` : ""}

<!-- ROUNDUP -->
${roundup.length > 0 ? `
<section class="roundup-section">
  <div class="roundup-inner">
    <div class="section-eyebrow">
      <span class="eyebrow-label">News Roundup</span>
      <div class="eyebrow-rule"></div>
    </div>
    <div class="roundup-grid">${roundupCards}</div>
  </div>
</section>` : ""}

<!-- STATS -->
${(stats.figures && stats.figures.length > 0) ? `
<section class="stats-section">
  <div class="stats-inner">
    <div class="section-eyebrow" style="margin-bottom:2rem;">
      <span class="eyebrow-label" style="color:rgba(255,255,255,0.3);">Numbers That Matter</span>
      <div class="eyebrow-rule" style="background:rgba(255,255,255,0.08);"></div>
    </div>
    <div class="stats-figures">${figureCards}</div>
    ${stats.sectors && stats.sectors.length > 0 ? `
    <p class="sectors-label">Active Sectors This Issue</p>
    <div class="sectors-pills">${sectorPills}</div>` : ""}
  </div>
</section>` : ""}

<!-- TIPS -->
${tips.length > 0 ? `
<section class="tips-section">
  <div class="tips-inner">
    <div class="section-eyebrow">
      <span class="eyebrow-label">Founder Playbook</span>
      <div class="eyebrow-rule"></div>
    </div>
    <div class="tips-grid">${tipCards}</div>
  </div>
</section>` : ""}

<!-- INVESTMENTS -->
${investments.length > 0 ? `
<section class="invest-section">
  <div class="invest-inner">
    <div class="section-eyebrow">
      <span class="eyebrow-label">Athlete Investments</span>
      <div class="eyebrow-rule"></div>
    </div>
    <div class="invest-grid">${investCards}</div>
  </div>
</section>` : ""}

<footer class="site-footer">
  <a href="index.html" class="footer-logo">ByAthletes</a>
  <span class="footer-meta">Issue No. ${data.issue} &ensp;·&ensp; ${esc(data.date)}</span>
  <span class="footer-sub">For athletes who build &ensp;·&ensp; <a href="#">Subscribe</a></span>
</footer>

</body>
</html>`;
}

// ─── BUILD ─────────────────────────────────────────────────────────────────

const frontPage  = buildFrontPage();
const issuePage  = buildIssuePage();

fs.writeFileSync(path.join(__dirname, "index.html"),                  frontPage);
fs.writeFileSync(path.join(__dirname, issueSlug(data.issue)),         issuePage);

console.log(`✅ Built index.html + ${issueSlug(data.issue)} — Issue #${data.issue} (${data.date})`);
