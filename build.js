// ByAthletes — build.js
// Reads stories.json + archive.json → writes index.html
// Run: node build.js

const fs   = require("fs");
const path = require("path");

const data = JSON.parse(fs.readFileSync(path.join(__dirname, "stories.json"), "utf8"));

let archive = [];
try {
  archive = JSON.parse(fs.readFileSync(path.join(__dirname, "archive.json"), "utf8"));
} catch(e) { /* no archive yet — that's fine */ }

// ─── HELPERS ───────────────────────────────────────────────

function toRoman(n) {
  const map = [[1000,"M"],[900,"CM"],[500,"D"],[400,"CD"],[100,"C"],[90,"XC"],
               [50,"L"],[40,"XL"],[10,"X"],[9,"IX"],[5,"V"],[4,"IV"],[1,"I"]];
  return map.reduce((acc,[v,s]) => { while(n>=v){acc+=s;n-=v;} return acc; }, "");
}

const tag = (label, style = "") => {
  const s = style === "red"
    ? "background:var(--red);color:#fff;border-color:var(--red);"
    : style === "blue"
    ? "background:#1A3CFF;color:#fff;border-color:#1A3CFF;"
    : "background:transparent;color:var(--ink-3);border-color:var(--border);";
  return `<span class="tag" style="${s}">${label}</span>`;
};

const readMore = (url, label = "Read more") =>
  url ? `<a href="${url}" class="read-more" target="_blank" rel="noopener">${label} →</a>` : "";

// ─── TEMPLATE FRAGMENTS ────────────────────────────────────

const sideStoryCards = data.side_stories.map(s => `
  <div class="side-card">
    <div class="side-card-accent"></div>
    <div class="side-card-tag">${tag(s.tag, s.tag_style || "")}</div>
    <h3 class="side-card-h">${s.headline}</h3>
    <p class="side-card-body">${s.body}</p>
    ${readMore(s.source_url)}
  </div>`).join("");

const roundupCards = data.roundup.map((r, i) => `
  <div class="roundup-card">
    ${r.image ? `<div class="roundup-img-wrap"><img src="${r.image}" class="roundup-img" alt="" loading="lazy" /></div>` : ""}
    <div class="roundup-text">
      <div class="roundup-meta">
        ${tag(r.tag)}
        <span class="roundup-num-label">${String(i+1).padStart(2,"0")}</span>
      </div>
      <h3 class="roundup-h">${r.headline}</h3>
      <p class="roundup-body">${r.body}</p>
      ${r.source_url ? `<a href="${r.source_url}" class="read-more" target="_blank" rel="noopener">${r.source_name || "Read more"} →</a>` : ""}
    </div>
  </div>`).join("");

const tipRows = data.tips.map((t, i) => `
  <div class="tip-row">
    <span class="tip-num">${String(i+1).padStart(2,"0")}</span>
    <div>
      <h4 class="tip-h">${t.headline}</h4>
      <p class="tip-body">${t.body}</p>
    </div>
  </div>`).join("");

const statFigures = data.stats.figures.map(s => `
  <div class="stat-figure">
    <div class="stat-num">${s.num}</div>
    <p class="stat-label">${s.label}</p>
  </div>`).join("");

const sectorList = data.stats.sectors.map((s, i) => `
  <div class="sector-item">
    <span class="sector-num">${String(i+1).padStart(2,"0")}</span>
    <span class="sector-name">${s}</span>
  </div>`).join("");

const investCards = data.investments.map(inv => `
  <div class="invest-card">
    <div class="invest-sport">${inv.sport}</div>
    <div class="invest-amount">${inv.amount}</div>
    <h3 class="invest-h">${inv.headline}</h3>
    <p class="invest-body">${inv.body}</p>
    <div class="invest-footer">
      <span class="invest-investor">${inv.investor}</span>
      <span class="invest-round">${inv.round}</span>
    </div>
  </div>`).join("");

const bodyParas = data.cover_story.body.map((p, i) =>
  i === 0
    ? `<p class="body-p drop-cap">${p}</p>`
    : `<p class="body-p">${p}</p>`
).join("");

const chips = data.cover_story.chips.map(c => `<span class="chip">${c}</span>`).join("");

const archiveCards = archive.map(a => `
  <div class="archive-card">
    <span class="archive-issue-label">No. ${String(a.issue).padStart(3,"0")}</span>
    <div class="archive-rule"></div>
    <h3 class="archive-h">${a.headline}</h3>
    <div class="archive-meta">
      <span>${a.date}</span>
      <span>${a.sport}</span>
    </div>
  </div>`).join("");

const issueRoman = toRoman(data.issue);

// ─── HTML ──────────────────────────────────────────────────

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>ByAthletes — No. ${data.issue} — ${data.date}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,600;1,700&family=Barlow+Condensed:wght@700;800;900&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --cream:  #F4F2ED;
      --white:  #FFFFFF;
      --ink:    #111010;
      --ink-2:  #2C2A27;
      --ink-3:  #7A776F;
      --red:    #C41230;
      --border: #E2DED7;
      --gap:    1px;
      --serif:  'Playfair Display', Georgia, serif;
      --cond:   'Barlow Condensed', sans-serif;
      --sans:   'Inter', system-ui, sans-serif;
      --page:   1280px;
    }

    html { scroll-behavior: smooth; }
    body {
      background: var(--cream); color: var(--ink);
      font-family: var(--sans); font-size: 15px; line-height: 1.6;
      -webkit-font-smoothing: antialiased;
    }
    a { text-decoration: none; color: inherit; }
    img { display: block; max-width: 100%; }

    /* ── MASTHEAD ───────────────────────────────── */
    .mast {
      background: var(--ink); color: var(--white);
      position: sticky; top: 0; z-index: 100;
    }
    .mast-top {
      max-width: var(--page); margin: 0 auto;
      display: flex; align-items: center; justify-content: space-between;
      padding: 1rem 2.5rem;
      border-bottom: 1px solid rgba(255,255,255,0.08);
    }
    .mast-logo {
      font-family: var(--serif); font-style: italic; font-weight: 700;
      font-size: 1.8rem; letter-spacing: -0.01em; color: var(--white);
    }
    .mast-logo em { color: var(--red); font-style: normal; }
    .mast-center {
      text-align: center;
      font-family: var(--sans); font-size: 0.58rem;
      font-weight: 700; letter-spacing: 0.22em; text-transform: uppercase;
      color: rgba(255,255,255,0.28);
    }
    .mast-center strong {
      display: block; font-family: var(--cond); font-weight: 900;
      font-size: 1.35rem; letter-spacing: 0.06em;
      color: rgba(255,255,255,0.65); margin-bottom: 0.1rem;
    }
    .mast-tagline {
      font-size: 0.57rem; font-weight: 600; letter-spacing: 0.16em;
      text-transform: uppercase; color: rgba(255,255,255,0.25);
      text-align: right; max-width: 190px; line-height: 1.7;
    }
    .mast-nav {
      max-width: var(--page); margin: 0 auto;
      display: flex; align-items: center; padding: 0 2.5rem;
    }
    .mast-nav a {
      font-size: 0.58rem; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase;
      color: rgba(255,255,255,0.35); padding: 0.8rem 0; margin-right: 2rem;
      position: relative; transition: color 0.2s;
    }
    .mast-nav a::after {
      content: ''; position: absolute; bottom: 0; left: 0; right: 0;
      height: 2px; background: var(--red);
      transform: scaleX(0); transform-origin: left; transition: transform 0.25s ease;
    }
    .mast-nav a:hover { color: rgba(255,255,255,0.85); }
    .mast-nav a:hover::after { transform: scaleX(1); }
    .mast-nav-spacer { flex: 1; }
    .mast-nav-date {
      font-size: 0.57rem; font-weight: 600; letter-spacing: 0.14em;
      text-transform: uppercase; color: rgba(255,255,255,0.2);
    }

    /* ── PAGE WRAPPER ───────────────────────────── */
    .page { max-width: var(--page); margin: 0 auto; padding: 0 2.5rem; }

    /* ── SECTION EYEBROW ────────────────────────── */
    .eyebrow {
      display: flex; align-items: center; gap: 1.25rem;
      padding: 2.75rem 0 1.75rem;
    }
    .eyebrow-label {
      font-size: 0.57rem; font-weight: 800; letter-spacing: 0.24em;
      text-transform: uppercase; color: var(--red); white-space: nowrap;
    }
    .eyebrow-rule { flex: 1; height: 1px; background: var(--border); }
    .eyebrow-sub {
      font-family: var(--cond); font-size: 0.85rem; font-weight: 900;
      color: var(--border); letter-spacing: 0.06em; text-transform: uppercase;
    }

    /* ── TAG ────────────────────────────────────── */
    .tag {
      display: inline-block; font-size: 0.55rem; font-weight: 800;
      letter-spacing: 0.18em; text-transform: uppercase;
      padding: 3px 9px; border: 1px solid; border-radius: 1px;
    }

    /* ── COVER SPREAD ───────────────────────────── */
    .cover-spread {
      display: grid; grid-template-columns: 56% 1fr;
      border: 1px solid var(--border); background: var(--white);
      margin-bottom: var(--gap); min-height: 72vh; align-items: stretch;
    }
    .cover-img-col { position: relative; overflow: hidden; }
    .cover-img-col img {
      position: absolute; inset: 0;
      width: 100%; height: 100%; object-fit: cover;
    }
    .cover-img-overlay {
      position: absolute; bottom: 0; left: 0; right: 0; padding: 2.5rem;
      background: linear-gradient(to top, rgba(10,8,5,0.92) 0%, rgba(10,8,5,0.45) 55%, transparent 100%);
      pointer-events: none;
    }
    .cover-stat-big {
      font-family: var(--cond); font-size: clamp(3.5rem, 7vw, 6.5rem);
      font-weight: 900; line-height: 1; color: var(--white); letter-spacing: -0.02em;
    }
    .cover-stat-sub {
      font-size: 0.65rem; font-weight: 700; letter-spacing: 0.16em;
      text-transform: uppercase; color: rgba(255,255,255,0.45); margin-top: 0.35rem;
    }
    .cover-text-col {
      padding: 3rem 3rem 2.5rem; display: flex; flex-direction: column;
      border-left: 1px solid var(--border);
    }
    .cover-tag-row { margin-bottom: 1.5rem; }
    .cover-h1 {
      font-family: var(--serif); font-style: italic; font-weight: 700;
      font-size: clamp(2rem, 3vw, 3rem); line-height: 1.1; letter-spacing: -0.02em;
      color: var(--ink); margin-bottom: 1.25rem;
    }
    .cover-dek {
      font-size: 0.93rem; color: var(--ink-2); line-height: 1.7;
      padding-bottom: 1.5rem; margin-bottom: 1.5rem;
      border-bottom: 1px solid var(--border);
    }
    .cover-byline {
      font-size: 0.6rem; font-weight: 700; letter-spacing: 0.16em;
      text-transform: uppercase; color: var(--ink-3); margin-bottom: 1.5rem;
    }
    .body-p { font-size: 0.88rem; color: var(--ink-2); line-height: 1.8; margin-bottom: 0.9rem; }
    .drop-cap::first-letter {
      font-family: var(--serif); font-size: 4rem; font-weight: 700;
      line-height: 0.72; float: left; margin-right: 0.08em; margin-top: 0.08em;
      color: var(--ink);
    }
    .cover-blockquote {
      margin: 1.5rem 0; padding: 1.25rem 1.5rem;
      border-left: 3px solid var(--red); background: var(--cream);
    }
    .cover-blockquote p {
      font-family: var(--serif); font-style: italic;
      font-size: 1.05rem; line-height: 1.6; color: var(--ink);
    }
    .cover-blockquote cite {
      display: block; font-family: var(--sans); font-style: normal;
      font-size: 0.6rem; font-weight: 700; letter-spacing: 0.14em;
      text-transform: uppercase; color: var(--ink-3); margin-top: 0.55rem;
    }
    .cover-chips {
      display: flex; flex-wrap: wrap; gap: 0.5rem;
      padding-top: 1.5rem; margin-top: auto;
    }
    .chip {
      font-size: 0.57rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase;
      border: 1px solid var(--border); color: var(--ink-3); padding: 4px 10px;
    }
    .read-more {
      display: inline-block; font-size: 0.6rem; font-weight: 800;
      letter-spacing: 0.16em; text-transform: uppercase;
      color: var(--red); margin-top: 0.75rem; transition: letter-spacing 0.2s;
    }
    .read-more:hover { letter-spacing: 0.22em; }

    /* ── SIDE STORIES ───────────────────────────── */
    .side-grid {
      display: grid; grid-template-columns: repeat(4, 1fr);
      background: var(--border); border: 1px solid var(--border);
      border-top: none; gap: var(--gap); margin-bottom: 3.5rem;
    }
    .side-card {
      background: var(--white); padding: 2rem 1.75rem;
      display: flex; flex-direction: column;
    }
    .side-card-accent { width: 28px; height: 2px; background: var(--red); margin-bottom: 1.25rem; }
    .side-card-tag { margin-bottom: 0.85rem; }
    .side-card-h {
      font-size: 0.93rem; font-weight: 800; line-height: 1.38;
      color: var(--ink); margin-bottom: 0.6rem; flex: 1;
    }
    .side-card-body { font-size: 0.8rem; color: var(--ink-3); line-height: 1.65; }

    /* ── NEWS ROUNDUP ───────────────────────────── */
    .roundup-grid {
      display: grid; grid-template-columns: repeat(4, 1fr);
      gap: 2.5rem; margin-bottom: 3.5rem;
    }
    .roundup-card { display: flex; flex-direction: column; }
    .roundup-img-wrap { overflow: hidden; margin-bottom: 1.1rem; border-bottom: 2px solid var(--red); }
    .roundup-img {
      width: 100%; aspect-ratio: 3/2; object-fit: cover;
      transition: transform 0.5s ease;
    }
    .roundup-card:hover .roundup-img { transform: scale(1.04); }
    .roundup-meta {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 0.65rem;
    }
    .roundup-num-label {
      font-family: var(--cond); font-size: 1.3rem; font-weight: 900;
      color: var(--border); letter-spacing: -0.02em; line-height: 1;
    }
    .roundup-h {
      font-size: 0.9rem; font-weight: 800; line-height: 1.38;
      color: var(--ink); margin-bottom: 0.55rem;
    }
    .roundup-body { font-size: 0.79rem; color: var(--ink-3); line-height: 1.65; flex: 1; }

    /* ── TIPS + STATS ───────────────────────────── */
    .two-panel { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 3.5rem; }
    .tips-card { background: var(--white); border: 1px solid var(--border); padding: 2.75rem; }
    .tips-card-heading {
      font-family: var(--serif); font-style: italic; font-weight: 700;
      font-size: 2rem; line-height: 1.15; color: var(--ink); margin-bottom: 2rem;
    }
    .tip-row { display: flex; gap: 1.25rem; padding: 1.1rem 0; border-top: 1px solid var(--border); }
    .tip-row:last-child { border-bottom: 1px solid var(--border); }
    .tip-num {
      font-family: var(--cond); font-size: 1.15rem; font-weight: 900;
      color: var(--border); flex-shrink: 0; width: 32px; line-height: 1.4;
    }
    .tip-h { font-size: 0.84rem; font-weight: 800; color: var(--ink); margin-bottom: 0.2rem; line-height: 1.35; }
    .tip-body { font-size: 0.77rem; color: var(--ink-3); line-height: 1.65; }

    .stats-card {
      background: var(--ink); color: var(--white);
      padding: 2.75rem; display: flex; flex-direction: column;
    }
    .stats-heading {
      font-family: var(--cond); font-size: 2rem; font-weight: 900;
      text-transform: uppercase; letter-spacing: 0.02em;
      color: var(--white); margin-bottom: 2rem;
    }
    .stat-figure { border-top: 1px solid rgba(255,255,255,0.09); padding: 1.25rem 0; }
    .stat-num {
      font-family: var(--cond); font-size: 3.5rem; font-weight: 900;
      line-height: 1; color: var(--white); letter-spacing: -0.02em;
    }
    .stat-label { font-size: 0.77rem; color: rgba(255,255,255,0.38); line-height: 1.55; margin-top: 0.3rem; }
    .sectors-wrap { border-top: 1px solid rgba(255,255,255,0.09); padding-top: 1.25rem; margin-top: auto; }
    .sectors-title {
      font-size: 0.57rem; font-weight: 700; letter-spacing: 0.2em;
      text-transform: uppercase; color: rgba(255,255,255,0.28); margin-bottom: 0.85rem;
    }
    .sector-item {
      display: flex; align-items: baseline; gap: 0.75rem;
      padding: 0.45rem 0; border-bottom: 1px solid rgba(255,255,255,0.05);
    }
    .sector-num { font-family: var(--cond); font-size: 0.75rem; font-weight: 900; color: var(--red); }
    .sector-name { font-size: 0.8rem; color: rgba(255,255,255,0.5); }

    /* ── INVESTMENTS ────────────────────────────── */
    .invest-grid {
      display: grid; grid-template-columns: repeat(3, 1fr);
      gap: var(--gap); background: var(--border);
      border: 1px solid var(--border); margin-bottom: 3.5rem;
    }
    .invest-card {
      background: var(--white); padding: 2.25rem;
      display: flex; flex-direction: column; gap: 0.6rem;
    }
    .invest-sport {
      font-size: 0.57rem; font-weight: 800; letter-spacing: 0.22em;
      text-transform: uppercase; color: var(--red);
    }
    .invest-amount {
      font-family: var(--cond); font-size: 3.8rem; font-weight: 900;
      line-height: 1; color: var(--ink); letter-spacing: -0.02em;
    }
    .invest-h { font-size: 0.93rem; font-weight: 800; line-height: 1.38; color: var(--ink); }
    .invest-body { font-size: 0.79rem; color: var(--ink-3); line-height: 1.65; flex: 1; }
    .invest-footer {
      display: flex; justify-content: space-between; align-items: flex-end; gap: 0.75rem;
      border-top: 1px solid var(--border); padding-top: 0.85rem; margin-top: auto;
    }
    .invest-investor { font-size: 0.72rem; font-weight: 700; color: var(--ink); }
    .invest-round {
      font-size: 0.57rem; font-weight: 700; letter-spacing: 0.12em;
      text-transform: uppercase; color: var(--ink-3); white-space: nowrap;
    }

    /* ── ARCHIVE ────────────────────────────────── */
    .archive-section { background: var(--ink); padding: 4.5rem 0; }
    .archive-inner { max-width: var(--page); margin: 0 auto; padding: 0 2.5rem; }
    .archive-eyebrow {
      display: flex; align-items: baseline; gap: 1.5rem;
      border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 1.75rem; margin-bottom: 2.5rem;
    }
    .archive-eyebrow h2 {
      font-family: var(--serif); font-style: italic; font-weight: 700;
      font-size: 1.75rem; color: var(--white);
    }
    .archive-eyebrow span {
      font-size: 0.57rem; font-weight: 700; letter-spacing: 0.2em;
      text-transform: uppercase; color: rgba(255,255,255,0.22);
    }
    .archive-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
      gap: var(--gap); background: rgba(255,255,255,0.06);
    }
    .archive-card {
      background: var(--ink); padding: 2rem 2.25rem;
      transition: background 0.2s;
    }
    .archive-card:hover { background: #1C1915; }
    .archive-issue-label {
      font-family: var(--cond); font-size: 0.72rem; font-weight: 900;
      letter-spacing: 0.14em; text-transform: uppercase; color: rgba(255,255,255,0.22);
    }
    .archive-rule { width: 22px; height: 2px; background: var(--red); margin: 0.85rem 0; }
    .archive-h {
      font-family: var(--serif); font-style: italic; font-weight: 400;
      font-size: 1rem; color: rgba(255,255,255,0.72); line-height: 1.5; margin-bottom: 1.25rem;
    }
    .archive-meta {
      display: flex; gap: 1.25rem; font-size: 0.57rem; font-weight: 600;
      letter-spacing: 0.12em; text-transform: uppercase; color: rgba(255,255,255,0.22);
    }

    /* ── FOOTER ─────────────────────────────────── */
    footer {
      background: #0A0805; border-top: 1px solid rgba(255,255,255,0.05);
      padding: 2rem 2.5rem; display: flex; justify-content: space-between;
      align-items: center; max-width: 100%;
    }
    .footer-logo {
      font-family: var(--serif); font-style: italic; font-weight: 700;
      font-size: 1.3rem; color: rgba(255,255,255,0.45);
    }
    .footer-meta, .footer-sub {
      font-size: 0.57rem; font-weight: 600; letter-spacing: 0.14em;
      text-transform: uppercase; color: rgba(255,255,255,0.2);
    }
    .footer-sub a { color: rgba(255,255,255,0.38); }

    /* ── RESPONSIVE ─────────────────────────────── */
    @media (max-width: 1040px) {
      .cover-spread { grid-template-columns: 1fr; min-height: auto; }
      .cover-img-col { min-height: 52vw; }
      .cover-img-col img { position: relative; width: 100%; height: 52vw; }
      .two-panel { grid-template-columns: 1fr; }
      .roundup-grid { grid-template-columns: repeat(2, 1fr); }
      .side-grid { grid-template-columns: repeat(2, 1fr); }
      .invest-grid { grid-template-columns: 1fr; }
    }
    @media (max-width: 640px) {
      .page { padding: 0 1.25rem; }
      .mast-top { padding: 0.9rem 1.25rem; }
      .mast-nav { padding: 0 1.25rem; }
      .archive-inner { padding: 0 1.25rem; }
      footer { padding: 1.5rem 1.25rem; flex-direction: column; gap: 0.75rem; text-align: center; }
      .roundup-grid { grid-template-columns: 1fr; }
      .side-grid { grid-template-columns: 1fr; }
      .mast-tagline { display: none; }
    }
  </style>
</head>
<body>

<!-- ═══ MASTHEAD ════════════════════════════════ -->
<header class="mast">
  <div class="mast-top">
    <span class="mast-logo">By<em>Athletes</em></span>
    <div class="mast-center">
      <strong>No. ${issueRoman}</strong>
      <span>Issue ${data.issue}</span>
    </div>
    <span class="mast-tagline">Founder Intelligence<br/>for Professional Athletes</span>
  </div>
  <nav class="mast-nav">
    <a href="#cover">Cover</a>
    <a href="#roundup">News</a>
    <a href="#playbook">Playbook</a>
    <a href="#deals">Deals</a>
    ${archive.length > 0 ? `<a href="#archive">Archive</a>` : ""}
    <span class="mast-nav-spacer"></span>
    <span class="mast-nav-date">${data.date}</span>
  </nav>
</header>

<!-- ═══ COVER STORY ══════════════════════════════ -->
<div class="page" id="cover">
  <div class="eyebrow">
    <span class="eyebrow-label">Cover Story</span>
    <div class="eyebrow-rule"></div>
    <span class="eyebrow-sub">${data.date}</span>
  </div>

  <div class="cover-spread">
    <!-- Image col -->
    <div class="cover-img-col">
      ${data.cover_story.image
        ? `<img src="${data.cover_story.image}" alt="${data.cover_story.headline}" />`
        : `<div style="background:#1a1917;width:100%;height:100%;"></div>`}
      <div class="cover-img-overlay">
        <div class="cover-stat-big">${data.cover_story.big_stat}</div>
        <div class="cover-stat-sub">${data.cover_story.stat_label}</div>
      </div>
    </div>

    <!-- Text col -->
    <div class="cover-text-col">
      <div class="cover-tag-row">${tag(data.cover_story.tag, "red")}</div>
      <h1 class="cover-h1">${data.cover_story.headline}</h1>
      <p class="cover-dek">${data.cover_story.dek}</p>
      <div class="cover-byline">By ${data.cover_story.author} &nbsp;·&nbsp; Staff Writer</div>
      ${bodyParas}
      <div class="cover-blockquote">
        <p>"${data.cover_story.quote}"</p>
        <cite>— ${data.cover_story.quote_author}</cite>
      </div>
      <div class="cover-chips">${chips}</div>
      ${data.cover_story.source_url
        ? `<a href="${data.cover_story.source_url}" class="read-more" target="_blank" rel="noopener">Read original — ${data.cover_story.source_name || ""} →</a>`
        : ""}
    </div>
  </div>

  <!-- Side stories strip -->
  <div class="side-grid">${sideStoryCards}</div>
</div>

<!-- ═══ NEWS ROUNDUP ════════════════════════════ -->
<div class="page" id="roundup">
  <div class="eyebrow">
    <span class="eyebrow-label">News Roundup</span>
    <div class="eyebrow-rule"></div>
    <span class="eyebrow-sub">Latest</span>
  </div>
  <div class="roundup-grid">${roundupCards}</div>
</div>

<!-- ═══ PLAYBOOK + STATS ══════════════════════════ -->
<div class="page" id="playbook">
  <div class="eyebrow">
    <span class="eyebrow-label">The Playbook</span>
    <div class="eyebrow-rule"></div>
    <span class="eyebrow-sub">Tips & Data</span>
  </div>
  <div class="two-panel">
    <div class="tips-card">
      <h2 class="tips-card-heading">The athlete's<br/>startup playbook.</h2>
      ${tipRows}
    </div>
    <div class="stats-card">
      <h2 class="stats-heading">By The<br/>Numbers.</h2>
      ${statFigures}
      <div class="sectors-wrap">
        <div class="sectors-title">Fastest Growing Sectors</div>
        ${sectorList}
      </div>
    </div>
  </div>
</div>

<!-- ═══ INVESTMENTS ═══════════════════════════════ -->
<div class="page" id="deals">
  <div class="eyebrow">
    <span class="eyebrow-label">Investment Deals</span>
    <div class="eyebrow-rule"></div>
    <span class="eyebrow-sub">Q1 2026</span>
  </div>
  <div class="invest-grid">${investCards}</div>
</div>

<!-- ═══ ARCHIVE ════════════════════════════════════ -->
${archive.length > 0 ? `
<section class="archive-section" id="archive">
  <div class="archive-inner">
    <div class="archive-eyebrow">
      <h2>Previous Issues</h2>
      <span>${archive.length} issue${archive.length !== 1 ? "s" : ""} in the archive</span>
    </div>
    <div class="archive-grid">${archiveCards}</div>
  </div>
</section>` : ""}

<!-- ═══ FOOTER ════════════════════════════════════ -->
<footer>
  <span class="footer-logo">ByAthletes</span>
  <span class="footer-meta">Vol. I &nbsp;·&nbsp; Issue No. ${data.issue} &nbsp;·&nbsp; ${data.date}</span>
  <span class="footer-sub">For athletes who build &nbsp;·&nbsp; <a href="#">Subscribe</a></span>
</footer>

</body>
</html>`;

fs.writeFileSync(path.join(__dirname, "index.html"), html, "utf8");
console.log(`✅ Built index.html — Issue #${data.issue} (${data.date})`);
