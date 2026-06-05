/**
 * html-builder.mjs — Programmatic HTML report builder using the ADAPT design system.
 *
 * Exports reusable component functions that produce Playwright-themed HTML strings.
 * Use this when generating reports programmatically (e.g. from Excel RESULTS sheet).
 *
 * Usage:
 *   import { getBaseHtml, createSection, createTable, createPill, createKpiGrid } from './lib/html-builder.mjs';
 *
 *   const html = getBaseHtml({
 *     title: 'My Report',
 *     subtitle: 'Project · June 2026',
 *     sidebarStats: [{ n: 53, l: 'Passed', cls: 'n-pass' }],
 *     sidebarNav: [{ href: '#results', label: 'Results', dot: '#4caf50' }],
 *     topbarTitle: 'ADAPT — My Report',
 *     topbarMeta: 'Chrome · 5 roles',
 *     progress: { pass: 94.6, fail: 0, skip: 5.4 },
 *     content: [
 *       createSection('results', 'Test Results', createTable(headers, rows)),
 *     ],
 *     cssPath: '../../core/assets/playwright-theme.css',  // or null to inline
 *   });
 *
 *   fs.writeFileSync('report.html', html);
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CSS_PATH  = path.resolve(__dirname, '../../core/assets/playwright-theme.css');

// ─── Base page shell ──────────────────────────────────────────────────────────

/**
 * Generates a full HTML page with sidebar, topbar, progress bar and content.
 *
 * @param {Object} opts
 * @param {string}   opts.title          - <title> and sidebar h1
 * @param {string}   opts.subtitle       - sidebar subtext (e.g. "Playwright · June 2026")
 * @param {Array}    opts.sidebarStats   - [{ n, l, cls }] — chips in sidebar
 * @param {Array}    opts.sidebarNav     - [{ href, label, dot, active }] — nav links
 * @param {string}   opts.topbarTitle    - topbar left text
 * @param {string}   opts.topbarMeta     - topbar right small text
 * @param {Object}   opts.progress       - { pass, fail, skip } as percentages (0-100)
 * @param {string[]} opts.content        - array of HTML strings (sections)
 * @param {string}   [opts.cssPath]      - relative path to playwright-theme.css, or null to inline
 * @param {string}   [opts.badgeText]    - sidebar badge text (default: "DeepTree · ADAPT")
 * @returns {string} full HTML string
 */
export function getBaseHtml(opts) {
  const {
    title        = 'ADAPT Report',
    subtitle     = '',
    sidebarStats = [],
    sidebarNav   = [],
    topbarTitle  = 'ADAPT Report',
    topbarMeta   = '',
    progress     = { pass: 100, fail: 0, skip: 0 },
    content      = [],
    cssPath      = null,
    badgeText    = 'DeepTree · ADAPT',
  } = opts;

  // CSS: link or inline
  const cssBlock = cssPath
    ? `<link rel="stylesheet" href="${cssPath}">`
    : `<style>${fs.readFileSync(CSS_PATH, 'utf-8')}</style>`;

  const statsHtml = sidebarStats.map(s =>
    `<div class="stat-chip"><div class="n ${s.cls || ''}">${s.n}</div><div class="l">${s.l}</div></div>`
  ).join('');

  const navHtml = sidebarNav.map(n =>
    `<a class="nav-item${n.active ? ' active' : ''}" href="${n.href}">
      <span class="nav-dot" style="background:${n.dot || '#4a90d9'}"></span> ${n.label}
    </a>`
  ).join('');

  return `<!DOCTYPE html>
<html style="scrollbar-gutter:stable both-edges" data-theme="dark">
<head>
  <meta charset="UTF-8"/>
  <meta name="color-scheme" content="dark light"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>${escHtml(title)}</title>
  ${cssBlock}
</head>
<body>
<div class="app">
  <aside class="sidebar">
    <div class="sidebar-logo">
      <div class="badge">${escHtml(badgeText)}</div>
      <h1>${escHtml(title)}</h1>
      <p>${escHtml(subtitle)}</p>
    </div>
    <div class="sidebar-stats">${statsHtml}</div>
    <nav class="sidebar-nav">
      <div class="nav-section">Sections</div>
      ${navHtml}
    </nav>
  </aside>

  <main class="main">
    <div class="topbar">
      <div class="topbar-title">${escHtml(topbarTitle)}</div>
      <div style="display:flex;align-items:center;gap:16px">
        <div class="topbar-meta">${escHtml(topbarMeta)}</div>
        <button class="theme-toggle" id="themeToggle" title="Toggle light/dark theme">
          <span class="toggle-icon" id="toggleIcon">☀️</span>
          <span id="toggleLabel">Light</span>
        </button>
      </div>
    </div>

    <div class="progress-track">
      <div class="progress-pass" style="width:${progress.pass}%"></div>
      <div class="progress-fail" style="width:${progress.fail || 0}%"></div>
      <div class="progress-skip" style="width:${progress.skip || 0}%"></div>
    </div>

    <div class="content">
      ${content.join('\n')}
    </div>

    <footer>ADAPT — Built by DeepTree</footer>
  </main>
</div>
${themeScript()}
</body>
</html>`;
}

// ─── Section ──────────────────────────────────────────────────────────────────

/**
 * Wraps content in a titled section with an anchor ID.
 * @param {string} id      - anchor ID (used by sidebar nav href)
 * @param {string} title   - section heading text
 * @param {string} content - inner HTML
 */
export function createSection(id, title, content) {
  return `<section id="${id}">
  <div class="section-title">${escHtml(title)}</div>
  ${content}
</section>`;
}

// ─── Table ────────────────────────────────────────────────────────────────────

/**
 * Creates a styled table.
 * @param {string[]}   headers - column header labels
 * @param {string[][]} rows    - 2D array of cell HTML strings (not escaped — pass HTML or use escHtml())
 * @param {string}     [note]  - optional note box below the table
 */
export function createTable(headers, rows, note) {
  const ths  = headers.map(h => `<th>${escHtml(h)}</th>`).join('');
  const trs  = rows.map(row =>
    `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`
  ).join('\n');
  const noteHtml = note ? `<div class="note">${note}</div>` : '';
  return `<div class="table-wrap">
  <table>
    <thead><tr>${ths}</tr></thead>
    <tbody>${trs}</tbody>
  </table>
</div>${noteHtml}`;
}

// ─── Pills ────────────────────────────────────────────────────────────────────

/**
 * Creates a status pill.
 * @param {string} text - label
 * @param {'pass'|'fail'|'skip'|'blue'|'green'|'amber'|'red'|'purple'|'rose'|'cyan'|'gray'} type
 */
export function createPill(text, type = 'gray') {
  return `<span class="pill pill-${type}">${escHtml(text)}</span>`;
}

// ─── KPI grid ─────────────────────────────────────────────────────────────────

/**
 * Creates a row of KPI stat cards.
 * @param {Array} items - [{ n, label, cls }]
 *   cls: 'n-pass' | 'n-fail' | 'n-skip' | 'n-blue' | 'n-purple'
 */
export function createKpiGrid(items) {
  const cards = items.map(({ n, label, cls = '' }) =>
    `<div class="kpi-card"><div class="kpi-n ${cls}">${n}</div><div class="kpi-l">${escHtml(label)}</div></div>`
  ).join('');
  return `<div class="kpi-grid">${cards}</div>`;
}

// ─── Run timeline ─────────────────────────────────────────────────────────────

/**
 * Creates a run history timeline.
 * @param {Array} runs - [{ label, labelColor, pass, fail, skip, total, description }]
 *   pass/fail/skip are counts; total is used to compute percentages
 */
export function createRunTimeline(runs) {
  const rows = runs.map(r => {
    const total    = r.total || (r.pass + r.fail + r.skip) || 1;
    const passPct  = Math.round(r.pass / total * 100);
    const failPct  = Math.round(r.fail / total * 100);
    const skipPct  = Math.round(r.skip / total * 100);
    const numParts = [
      r.pass ? `<span style="color:var(--color-pass)">${r.pass} pass</span>` : '',
      r.fail ? `<span style="color:var(--color-fail)">${r.fail} fail</span>` : '',
      r.skip ? `<span style="color:var(--color-skip)">${r.skip} skip</span>` : '',
    ].filter(Boolean).join(' · ');
    return `<div class="run-row">
      <div class="run-label" style="color:${r.labelColor || 'var(--color-text-muted)'}">${escHtml(r.label)}</div>
      <div class="run-bar-wrap">
        <div class="run-bar" style="width:${passPct}%;background:var(--color-pass)"></div>
        <div class="run-bar" style="width:${failPct}%;background:var(--color-fail)"></div>
        <div class="run-bar" style="width:${skipPct}%;background:var(--color-skip)"></div>
      </div>
      <div class="run-nums">${numParts}</div>
      <div class="run-desc">${escHtml(r.description || '')}</div>
    </div>`;
  }).join('');

  return `<div style="border:1px solid var(--color-border);border-radius:var(--radius);overflow:hidden">
  ${rows}
</div>`;
}

// ─── Script list ──────────────────────────────────────────────────────────────

/**
 * Creates a list of script cards.
 * @param {Array} scripts - [{ name, description, example, status }]
 *   status: 'built' | 'backlog'
 */
export function createScriptList(scripts) {
  const items = scripts.map(s => {
    const pill = s.status === 'built'
      ? createPill('✓ Built', 'pass')
      : createPill('⏳ Backlog', 'amber');
    return `<div class="script-item">
      <div class="script-cmd-name">${escHtml(s.name)}</div>
      <div class="script-body">
        <div class="script-desc">${s.description}</div>
        ${s.example ? `<div class="script-example">${escHtml(s.example)}</div>` : ''}
      </div>
      <div class="script-status">${pill}</div>
    </div>`;
  }).join('');
  return `<div class="script-list">${items}</div>`;
}

// ─── Note box ─────────────────────────────────────────────────────────────────

/** Creates a warning/info note box. */
export function createNote(text) {
  return `<div class="note">${text}</div>`;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Escapes HTML special characters. Use for plain text values. */
export function escHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Wraps plain text in a <code> element. */
export function code(text) {
  return `<code>${escHtml(text)}</code>`;
}

/** Inlines the CSS — call this to produce a self-contained single-file HTML. */
export function getInlineCss() {
  return fs.readFileSync(CSS_PATH, 'utf-8');
}

// ─── Theme script (embedded) ─────────────────────────────────────────────────

function themeScript() {
  return `<script>
  const _h = document.documentElement;
  const _b = document.getElementById('themeToggle');
  const _i = document.getElementById('toggleIcon');
  const _l = document.getElementById('toggleLabel');
  function _t(t) {
    _h.setAttribute('data-theme', t);
    localStorage.setItem('adapt-theme', t);
    _i.textContent = t === 'light' ? '🌙' : '☀️';
    _l.textContent = t === 'light' ? 'Dark' : 'Light';
  }
  _t(localStorage.getItem('adapt-theme') || 'dark');
  _b.addEventListener('click', () => _t(_h.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'));
  const _obs = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) document.querySelectorAll('.nav-item[href^="#"]').forEach(n =>
      n.classList.toggle('active', n.getAttribute('href') === '#' + e.target.id));
  }), { rootMargin: '-20% 0px -70% 0px' });
  document.querySelectorAll('section[id]').forEach(s => _obs.observe(s));
<\/script>`;
}
