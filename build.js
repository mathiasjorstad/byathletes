// ByAthletes — build.js
// Generates:
//   index.html   — full editorial landing page (new schema)

const fs   = require("fs");
const path = require("path");

const data    = JSON.parse(fs.readFileSync(path.join(__dirname, "stories.json"), "utf8"));
let archive   = [];
try { archive = JSON.parse(fs.readFileSync(path.join(__dirname, "archive.json"), "utf8")); } catch(e) {}

// ─── HELPERS ──────────────────────────────────────────────────────────────

function toRoman(n) {
  const m = [[1000,"M"],[900,"CM"],[500,"D"],[400,"CD"],[100,"C"],[90,"XC"],
             [50,"L"],[40,"XL"],[10,"X"],[9,"IX"],[5,"V"],[4,"IV"],[1,"I"]];
  return m.reduce((a,[v,s])=>{ while(n>=v){a+=s;n-=v;} return a; },"");
}

function esc(s) {
  return String(s || "")
    .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;");
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

  /* ── ARCHIVE ──────────────────────────────── */

  .archive { background: var(--ink); padding: 5rem 0; }
  .archive-inner { max-width: 1280px; margin: 0 auto; padding: 0 2.5rem; }
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
  .arc-card { background: var(--ink); padding: 2rem 2.25rem; transition: background 0.18s; }
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
    .archive-inner { padding: 0 1.25rem; }
    .site-footer { padding: 1.5rem 1.25rem; flex-direction: column; gap: 0.75rem; text-align: center; }
  }
`;

const fonts = `
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400;1,700&family=Barlow+Condensed:wght@900&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
`;

// ─── ARCHIVE HTML ─────────────────────────────────────────────────────────

function archiveHTML() {
  if (!archive || archive.length === 0) return "";
  const cards = archive.map(a => `
    <div class="arc-card">
      <span class="arc-no">No.&thinsp;${String(a.issue).padStart(3,"0")}</span>
      <div class="arc-rule"></div>
      <h3 class="arc-h">${esc(a.headline)}</h3>
      <div class="arc-meta"><span>${esc(a.date)}</span><span>${esc(a.sport)}</span></div>
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
      <span class="footer-meta">Vol. I &ensp;·&ensp; Issue No. ${data.issue} &ensp;·&ensp; ${esc(data.date)}</span>
      <span class="footer-sub">For athletes who build &ensp;·&ensp; <a href="#">Subscribe</a></span>
    </footer>`;
}

// ─── LANDING PAGE ──────────────────────────────────────────────────────────

function buildLandingPage() {
  const cs = data.cover_story;
  const ss = data.side_stories || [];
  const roundup = data.roundup || [];
  const tips = data.tips || [];
  const stats = data.stats || {};
  const investments = data.investments || [];

  // ── HERO (cover story) ──────────────────────────────────────────────────
  const heroImg = cs.image || "";
  const chips = (cs.chips || []).map(c => `<span class="chip">${esc(c)}</span>`).join("");
  const bodyParas = (cs.body || []).map((p, i) =>
    i === 0 ? `<p class="cover-p drop">${p}</p>` : `<p class="cover-p">${p}</p>`
  ).join("");

  // ── SIDE STORIES ────────────────────────────────────────────────────────
  const sideCards = ss.map(s => {
    const isBlue = s.tag_style === "blue";
    return `
    <article class="side-card ${isBlue ? "side-card--opinion" : ""}">
      <span class="side-tag ${isBlue ? "side-tag--blue" : ""}">${esc(s.tag)}</span>
      <h3 class="side-h">${esc(s.headline)}</h3>
      <p class="side-body">${esc(s.body)}</p>
      ${s.source_url ? `<a class="side-link" href="${esc(s.source_url)}" target="_blank" rel="noopener">Read →</a>` : ""}
    </article>`;
  }).join("");

  // ── ROUNDUP ─────────────────────────────────────────────────────────────
  const roundupCards = roundup.map(r => `
    <article class="roundup-card">
      ${r.image ? `<div class="roundup-img"><img src="${esc(r.image)}" alt="${esc(r.headline)}" loading="lazy" /></div>` : ""}
      <div class="roundup-body">
        <span class="roundup-tag">${esc(r.tag)}</span>
        <h3 class="roundup-h">${esc(r.headline)}</h3>
        <p class="roundup-p">${esc(r.body)}</p>
        ${r.source_url ? `<a class="roundup-source" href="${esc(r.source_url)}" target="_blank" rel="noopener">${esc(r.source_name || "Source")} →</a>` : ""}
      </div>
    </article>`).join("");

  // ── TIPS ────────────────────────────────────────────────────────────────
  const tipCards = tips.map((t, i) => `
    <div class="tip-card">
      <span class="tip-num">${String(i + 1).padStart(2,"0")}</span>
      <div>
        <h4 class="tip-h">${esc(t.headline)}</h4>
        <p class="tip-body">${esc(t.body)}</p>
      </div>
    </div>`).join("");

  // ── STATS ───────────────────────────────────────────────────────────────
  const figureCards = (stats.figures || []).map(f => `
    <div class="stat-figure">
      <span class="stat-num">${esc(f.num)}</span>
      <span class="stat-lbl">${esc(f.label)}</span>
    </div>`).join("");

  const sectorPills = (stats.sectors || []).map(s => `<span class="sector-pill">${esc(s)}</span>`).join("");

  // ── INVESTMENTS ─────────────────────────────────────────────────────────
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
  <title>ByAthletes — No. ${toRoman(data.issue)}</title>
  ${fonts}
  <style>
    ${css}

    /* ── HERO / COVER ─────────────────────────── */

    .hero {
      position: relative; min-height: 92vh;
      display: flex; align-items: flex-end; overflow: hidden;
    }
    .hero-img { position: absolute; inset: 0; }
    .hero-img img { height: 100%; object-fit: cover; }
    .hero-gradient {
      position: absolute; inset: 0;
      background: linear-gradient(to top, rgba(5,4,3,0.93) 0%, rgba(5,4,3,0.55) 38%, rgba(5,4,3,0.12) 65%, transparent 100%);
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
      font-size: clamp(2.6rem, 5.5vw, 5.5rem); line-height: 1.06;
      letter-spacing: -0.025em; color: #fff; max-width: 820px; margin-bottom: 1.25rem;
    }
    .hero-dek {
      font-size: 1rem; line-height: 1.7; color: rgba(255,255,255,0.62);
      max-width: 560px; margin-bottom: 1.25rem;
    }
    .hero-meta {
      font-size: 0.6rem; font-weight: 700; letter-spacing: 0.16em;
      text-transform: uppercase; color: rgba(255,255,255,0.38); margin-bottom: 1.5rem;
    }
    .hero-chips { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 2rem; }
    .chip {
      font-size: 0.55rem; font-weight: 700; letter-spacing: 0.14em;
      text-transform: uppercase; border: 1px solid rgba(255,255,255,0.22);
      color: rgba(255,255,255,0.5); padding: 4px 12px;
    }

    /* ── COVER BODY ──────────────────────────── */

    .cover-section {
      max-width: 1280px; margin: 0 auto; padding: 4rem 2.5rem;
      display: grid; grid-template-columns: 1fr 340px; gap: 4rem;
      align-items: start;
    }
    .cover-body-wrap {}
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
      font-size: 1.5rem; line-height: 1.42; color: var(--ink);
    }
    .cover-quote cite {
      display: block; font-style: normal; font-size: 0.58rem; font-weight: 700;
      letter-spacing: 0.18em; text-transform: uppercase; color: var(--ink-3); margin-top: 0.75rem;
    }
    .cover-source {
      display: inline-block; font-size: 0.6rem; font-weight: 800;
      letter-spacing: 0.18em; text-transform: uppercase; color: var(--red);
      margin-top: 1rem;
    }

    /* ── COVER SIDEBAR ───────────────────────── */

    .cover-sidebar {}
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
      font-family: var(--serif); font-style: italic; font-size: 1.15rem;
      line-height: 1.38; color: var(--ink); margin-bottom: 0.75rem;
    }
    .side-body { font-size: 0.82rem; line-height: 1.7; color: var(--ink-3); margin-bottom: 0.75rem; }
    .side-link { font-size: 0.58rem; font-weight: 800; letter-spacing: 0.16em; text-transform: uppercase; color: var(--red); }

    /* ── ROUNDUP ─────────────────────────────── */

    .roundup-section { border-top: 1px solid var(--brd); background: #F9F7F3; }
    .roundup-inner { max-width: 1280px; margin: 0 auto; padding: 4rem 2.5rem; }
    .roundup-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 2.5rem; }
    .roundup-card { display: flex; flex-direction: column; }
    .roundup-img { aspect-ratio: 16/9; overflow: hidden; margin-bottom: 1.25rem; }
    .roundup-img img { height: 100%; object-fit: cover; transition: transform 0.5s ease; }
    .roundup-card:hover .roundup-img img { transform: scale(1.04); }
    .roundup-tag {
      display: block; font-size: 0.55rem; font-weight: 800;
      letter-spacing: 0.24em; text-transform: uppercase; color: var(--red); margin-bottom: 0.6rem;
    }
    .roundup-h {
      font-family: var(--serif); font-style: italic; font-size: 1.15rem;
      line-height: 1.38; color: var(--ink); margin-bottom: 0.65rem;
    }
    .roundup-p { font-size: 0.82rem; line-height: 1.7; color: var(--ink-3); flex: 1; margin-bottom: 0.75rem; }
    .roundup-source {
      font-size: 0.58rem; font-weight: 800; letter-spacing: 0.16em;
      text-transform: uppercase; color: var(--red);
    }

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

    @media (max-width: 900px) {
      .cover-section { grid-template-columns: 1fr; gap: 2.5rem; }
      .cover-sidebar { order: -1; }
      .stats-figures { grid-template-columns: 1fr; }
    }
    @media (max-width: 680px) {
      .hero-content { padding: 0 1.25rem 3rem; }
      .hero-h1 { font-size: 2.4rem; }
      .cover-section, .side-inner, .roundup-inner, .tips-inner, .invest-inner { padding: 3rem 1.25rem; }
      .stats-inner { padding: 0 1.25rem; }
    }
  </style>
</head>
<body>

<header class="mast">
  <span class="mast-logo">By<em>Athletes</em></span>
  <span class="mast-issue">No.&thinsp;${toRoman(data.issue)}</span>
  <span class="mast-right">Issue ${data.issue}&ensp;·&ensp;${esc(data.date)}</span>
</header>

<!-- HERO -->
<section class="hero">
  <div class="hero-img">
    ${heroImg ? `<img src="${esc(heroImg)}" alt="${esc(cs.headline)}" />` : `<div style="background:#1a1917;width:100%;height:100%;"></div>`}
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
    <div class="section-eyebrow" style="margin-bottom:2rem;">
      <span class="eyebrow-label">Cover Story</span>
      <div class="eyebrow-rule"></div>
    </div>
    ${bodyParas}
    <div class="cover-quote">
      <p>"${esc(cs.quote)}"</p>
      <cite>— ${esc(cs.quote_author)}</cite>
    </div>
    ${cs.source_url ? `<a class="cover-source" href="${esc(cs.source_url)}" target="_blank" rel="noopener">Read full story — ${esc(cs.source_name || "Source")} →</a>` : ""}
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
      <span class="eyebrow-label" style="color:rgba(255,255,255,0.35);">Numbers That Matter</span>
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

${archiveHTML()}
${footerHTML()}

</body>
</html>`;
}

// ─── BUILD ─────────────────────────────────────────────────────────────────

const landing = buildLandingPage();
fs.writeFileSync(path.join(__dirname, "index.html"), landing);

console.log(`✅ Built index.html — Issue #${data.issue} (${data.date})`);
