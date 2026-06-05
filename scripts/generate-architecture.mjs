/**
 * generate-architecture.mjs — Generates the ADAPT Architecture document.
 *
 * Produces a Prism-format HTML file covering ADAPT's architecture,
 * design, features, and usage guides for new and existing projects.
 *
 * Usage:
 *   node scripts/generate-architecture.mjs
 *   node scripts/generate-architecture.mjs --out D:\happyq\public\adapt-architecture.html
 */

import fs   from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  getBaseHtml,
  createSection,
  createTable,
  createPill,
  createKpiGrid,
  createScriptList,
  createFolderTree,
  createNote,
  escHtml,
  code,
} from './lib/html-builder.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT      = path.resolve(__dirname, '..');

// ─── Output path ──────────────────────────────────────────────────────────────

const outArg = process.argv.indexOf('--out');
const outPath = outArg !== -1
  ? process.argv[outArg + 1]
  : path.join(ROOT, 'docs', 'adapt-architecture.html');

fs.mkdirSync(path.dirname(outPath), { recursive: true });

// ═══════════════════════════════════════════════════════════════════════════════
//  SECTION CONTENT BUILDERS
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Overview ─────────────────────────────────────────────────────────────────

const overviewKpi = createKpiGrid([
  { n: 'E2E',      label: 'Test Type',        cls: 'n-blue' },
  { n: 'Multi',    label: 'Multi-Project',    cls: 'n-blue' },
  { n: 'Excel',    label: 'Data-Driven',      cls: 'n-purple' },
  { n: '3',        label: 'Heal Scripts',     cls: 'n-pass' },
  { n: 'Prism',    label: 'Design System',    cls: 'n-purple' },
  { n: '100%',     label: 'TypeScript',       cls: 'n-blue' },
]);

const overviewContent = `
${overviewKpi}
<div class="table-wrap">
  <table>
    <thead><tr><th>Aspect</th><th>Detail</th></tr></thead>
    <tbody>
      <tr><td><strong>Full Name</strong></td><td>Automated Data-driven Playwright Testing</td></tr>
      <tr><td><strong>Built By</strong></td><td>DeepTree (deeptree.in)</td></tr>
      <tr><td><strong>Purpose</strong></td><td>A scalable, plug-and-play E2E test automation platform. One framework repo tests any number of web applications. No duplication of infrastructure across projects.</td></tr>
      <tr><td><strong>Test Framework</strong></td><td>Playwright (TypeScript) — industry standard, native TS, parallel execution, built-in screenshots on failure</td></tr>
      <tr><td><strong>Data Source</strong></td><td>Excel workbook per project — test cases, run control flags, user roles, and result history all in one file</td></tr>
      <tr><td><strong>Selector Healing</strong></td><td>Three heal scripts (heal:selectors, heal:actions, heal:dialogs) auto-fix broken selectors by inspecting the live app</td></tr>
      <tr><td><strong>Report Format</strong></td><td>Prism — DeepTree's Playwright-style dark/light HTML design system (playwright-theme.css + html-builder.mjs)</td></tr>
      <tr><td><strong>First Project</strong></td><td>HappyQ — 53/56 tests passing, 5 roles, 40+ screens, 14 dialogs mapped</td></tr>
    </tbody>
  </table>
</div>`;

// ─── Problem & Solution ───────────────────────────────────────────────────────

const problemContent = `
<div class="table-wrap" style="margin-bottom:16px">
  <table>
    <thead><tr><th>Problem</th><th>Without ADAPT</th><th>With ADAPT</th></tr></thead>
    <tbody>
      <tr>
        <td>Starting a new project's test suite</td>
        <td>Set up Playwright, write config, build auth, design Excel schema — hours of boilerplate</td>
        <td>${code('npm run new:project -- --name myapp --src D:\\myapp')} — scaffolds everything in seconds</td>
      </tr>
      <tr>
        <td>Selector guesses from source code are wrong</td>
        <td>Run tests, read error, open app, find real text, fix manually — repeated for every page</td>
        <td>${code('npm run heal:selectors -- --project myapp')} — auto-heals all headings from live DOM</td>
      </tr>
      <tr>
        <td>Adding a second app to automate</td>
        <td>Copy the entire test project, duplicate infrastructure, maintain two repos</td>
        <td>Add ${code('projects/myapp/')} folder — all infrastructure shared, nothing duplicated</td>
      </tr>
      <tr>
        <td>Non-developers need to control test runs</td>
        <td>Edit TypeScript files — requires dev knowledge</td>
        <td>Set ${code('RUN: YES/NO')} in Excel — no code knowledge needed</td>
      </tr>
      <tr>
        <td>Test data changes between runs</td>
        <td>Hardcoded data in test files — fails when data changes</td>
        <td>Edit ${code('TEST_DATA')} column in Excel — smart merge preserves edits on every update</td>
      </tr>
      <tr>
        <td>Viewing test results history</td>
        <td>Only the latest Playwright HTML report — previous runs lost</td>
        <td>Prism HTML report auto-generated after every run, dated archive kept in ${code('reports/')}</td>
      </tr>
    </tbody>
  </table>
</div>`;

// ─── Architecture ─────────────────────────────────────────────────────────────

const archDiagram = createFolderTree({
  name: 'adapt/',
  desc: 'Framework root — clone once, test many apps',
  children: [
    {
      name: 'core/', cls: 'tc-core', open: true,
      desc: 'Shared infrastructure — never project-specific',
      children: [
        {
          name: 'lib/', cls: 'tc-muted', open: true,
          desc: 'Shared TypeScript utilities',
          children: [
            { name: 'spreadsheet-reader.ts', cls: 'tc-pass', desc: 'Reads TEST_CONTROL + E2E_TESTS + TEST_USERS sheets from Excel' },
            { name: 'results-writer.ts',     cls: 'tc-pass', desc: 'Appends test results to RESULTS sheet after every run' },
            { name: 'slack-reporter.ts',     cls: 'tc-pass', desc: 'Posts pass/fail summary to a Slack webhook' },
            { name: 'run-id.ts',             cls: 'tc-pass', desc: 'Generates ADAPT-YYYYMMDD-HHmm run IDs, tags created test data' },
            { name: 'cleanup.ts',            cls: 'tc-pass', desc: 'Deletes all ADAPT-tagged records via Supabase service role key' },
          ],
        },
        {
          name: 'fixtures/', cls: 'tc-muted', open: true,
          desc: 'Shared test fixtures',
          children: [
            { name: 'auth.setup.ts', cls: 'tc-pass', desc: 'Generic login fixture — logs in per role and saves storageState' },
          ],
        },
        {
          name: 'assets/', cls: 'tc-assets', open: true,
          desc: 'Prism design system files',
          children: [
            { name: 'playwright-theme.css', cls: 'tc-purple', desc: 'Prism — dark/light CSS design system, all tokens + components' },
            { name: 'report-template.html', cls: 'tc-purple', desc: 'Blank Prism HTML shell — copy and fill in sections' },
          ],
        },
        { name: 'playwright.base.config.ts', cls: 'tc-muted', desc: 'Base Playwright config — extended by every project' },
      ],
    },
    {
      name: 'projects/', cls: 'tc-projects', open: true,
      desc: 'One folder per application under test',
      children: [
        {
          name: 'happyq/', cls: 'tc-projects', open: true,
          desc: 'HappyQ — first project (53 tests, 5 roles, 40+ screens)',
          children: [
            { name: 'playwright.config.ts', cls: 'tc-muted', desc: 'Extends base, sets BASE_URL, roles, globalSetup, JSON reporter' },
            { name: 'global-setup.ts',      cls: 'tc-muted', desc: 'Runs cleanup (CLEANUP=true) and generates Run ID before tests start' },
            { name: '.env.local',           cls: 'tc-muted', desc: 'Credentials — gitignored. Copy from .env.example and fill in.' },
            { name: '.env.example',         cls: 'tc-muted', desc: 'Template — committed. Documents all required env vars.' },
            {
              name: 'data/', cls: 'tc-muted', open: true,
              desc: 'Excel testbook',
              children: [
                { name: 'HappyQ_Tests.xlsx', cls: 'tc-pass', desc: '4 sheets: TEST_CONTROL (run flags), E2E_TESTS, TEST_USERS, RESULTS' },
              ],
            },
            {
              name: 'pages/', cls: 'tc-muted', open: false,
              desc: 'Page Object Model — one class per screen',
              children: [
                { name: '<module>/<Screen>Page.ts',     cls: 'tc-muted', desc: 'One file per screen: goto(), expectLoaded(), action methods' },
                { name: '<module>/dialogs/<x>Dialog.ts', cls: 'tc-muted', desc: 'One file per modal: expectOpen(), fill(), submit(), cancel()' },
              ],
            },
            {
              name: 'tests/', cls: 'tc-muted', open: false,
              desc: 'E2E test files — one per module',
              children: [
                { name: 'auth/auth.setup.ts',      cls: 'tc-muted', desc: 'Logs in once per role, saves .auth/<role>.json' },
                { name: '<module>/<module>.e2e.ts', cls: 'tc-muted', desc: 'E2E tests using page objects — one describe per screen' },
              ],
            },
            {
              name: 'reports/', cls: 'tc-muted', open: false,
              desc: 'Auto-generated Prism HTML reports',
              children: [
                { name: 'report-latest.html',           cls: 'tc-purple', desc: 'Always the most recent run — overwritten each time' },
                { name: 'report-YYYYMMDD-HHmm.html',    cls: 'tc-purple', desc: 'Dated archive — one file per run, kept forever' },
              ],
            },
          ],
        },
        {
          name: 'onlinebooking/', cls: 'tc-muted', open: false,
          desc: 'Next project — just run: npm run new:project -- --name onlinebooking',
          children: [
            { name: '(same structure as happyq/)', cls: 'tc-muted', desc: 'All core infrastructure shared — zero setup overhead' },
          ],
        },
      ],
    },
    {
      name: 'scripts/', cls: 'tc-scripts', open: true,
      desc: 'Framework tooling — all commands',
      children: [
        { name: 'new-project.mjs',           cls: 'tc-amber', desc: 'Scaffolds new project. With --src: scans source, generates page objects + stubs' },
        { name: 'update-testbook.mjs',        cls: 'tc-amber', desc: 'Smart-merges test rows into Excel — preserves user-edited TEST_DATA / RUN / NOTES' },
        { name: 'setup-test-users.mjs',       cls: 'tc-amber', desc: 'Enables email/password login for existing Supabase users (run after db:reset)' },
        { name: 'generate-report.mjs',        cls: 'tc-amber', desc: 'Reads Playwright JSON, generates dated Prism HTML report. Auto-runs post-test.' },
        { name: 'generate-architecture.mjs',  cls: 'tc-amber', desc: 'Generates this document. Re-run to refresh: npm run generate:architecture' },
        { name: 'heal-selectors.mjs',         cls: 'tc-pass',  desc: 'Heals expectLoaded() heading selectors from live DOM' },
        { name: 'heal-actions.mjs',           cls: 'tc-pass',  desc: 'Heals button / tab / radio / placeholder selectors in action methods' },
        { name: 'heal-dialogs.mjs',           cls: 'tc-pass',  desc: 'Heals dialog fill() / submit() / cancel() selectors from live DOM' },
        {
          name: 'testdata/', cls: 'tc-muted', open: true,
          desc: 'Per-project test case definitions',
          children: [
            { name: 'happyq.mjs',         cls: 'tc-amber', desc: 'HappyQ test rows — add new modules here, then run update:testbook' },
            { name: '<project>.mjs',      cls: 'tc-muted', desc: 'One file per project — same structure as happyq.mjs' },
          ],
        },
        {
          name: 'lib/', cls: 'tc-muted', open: true,
          desc: 'Shared script utilities',
          children: [
            { name: 'html-builder.mjs', cls: 'tc-purple', desc: 'Prism component functions: getBaseHtml(), createSection(), createTable(), createPill(), createFolderTree()...' },
            { name: 'detector.mjs',     cls: 'tc-muted',  desc: 'Auto-detects app framework from package.json + folder structure' },
            { name: 'scanner.mjs',      cls: 'tc-muted',  desc: 'Scans routes, components, and dialog files from app source code' },
            { name: 'generator.mjs',    cls: 'tc-muted',  desc: 'Generates page objects, dialog classes, test stubs, and TODO_REPORT.md' },
          ],
        },
      ],
    },
    {
      name: 'CLAUDE.md', cls: 'tc-purple',
      desc: 'AI conventions — auto-read by Claude Code. Enforces all patterns, scenarios, compliance reports.',
    },
    { name: 'CONVENTIONS.md', cls: 'tc-muted', desc: 'Human reference — page object rules, dialog rules, test file rules, Excel schema' },
    { name: 'DEVELOPMENT.md', cls: 'tc-muted', desc: 'Day-to-day guide — all commands, selector verification, debugging, CI setup' },
    { name: 'README.md',      cls: 'tc-muted', desc: 'ADAPT overview, quick start, and links' },
  ],
}, 'arch');

const layersTable = createTable(
  ['Layer', 'What It Is', 'Who Changes It', 'When'],
  [
    [createPill('core/', 'blue'), 'Shared infrastructure — spreadsheet reader, auth fixture, cleanup, Prism assets', 'Framework maintainer', 'Rarely — only when adding new cross-project capabilities'],
    [createPill('projects/', 'amber'), 'Project-specific — pages, dialogs, tests, Excel, config', 'Project test developer', 'When adding new screens, modules, or fixing selectors'],
    [createPill('scripts/', 'cyan'), 'Framework tooling — new:project, heal:*, generate:report, update:testbook', 'Framework maintainer', 'When adding new automation capabilities'],
  ]
);

const archContent = archDiagram + layersTable;

// ─── Features ─────────────────────────────────────────────────────────────────

const scriptsContent = createScriptList([
  {
    name: 'new:project',
    description: 'Scaffolds a complete new project. With --src, auto-detects the app framework (React Router, Next.js, Vue, Angular), scans all routes and dialog components, and generates page objects + test stubs + TODO_REPORT.md.',
    example: 'npm run new:project -- --name myapp --src D:\\myapp',
    status: 'built',
  },
  {
    name: 'update:testbook',
    description: 'Smart-merges test case definitions into the project Excel workbook. Adds new rows, preserves user-edited TEST_DATA / RUN / NOTES columns, and flags removed tests [OBSOLETE]. Never overwrites user data.',
    example: 'npm run update:testbook -- --project myapp',
    status: 'built',
  },
  {
    name: 'heal:selectors',
    description: 'Navigates every page route using a role session, extracts the real h1/h2 heading from the live DOM, and patches expectLoaded() selectors automatically. Detects auth-redirect and permission-denied pages.',
    example: 'npm run heal:selectors -- --project myapp [--role admin] [--module settings]',
    status: 'built',
  },
  {
    name: 'heal:actions',
    description: 'Extracts all visible buttons, tabs, radio buttons, and input placeholders from each live page. Fuzzy-matches against action method selectors, auto-corrects role type (e.g. button→radio for Radix ToggleGroup).',
    example: 'npm run heal:actions -- --project myapp [--role receptionist]',
    status: 'built',
  },
  {
    name: 'heal:dialogs',
    description: 'Auto-detects dialog triggers from test files, navigates to parent page, opens each dialog, and extracts live placeholders + button labels. Patches getByLabel→getByPlaceholder and adds .first() to button clicks.',
    example: 'npm run heal:dialogs -- --project myapp [--dialog PatientDialog]',
    status: 'built',
  },
  {
    name: 'generate:report',
    description: 'Reads Playwright JSON output after a test run, enriches with Excel metadata (module, screen, role), and generates a dated Prism HTML report. Auto-runs via posttest hook — no manual step needed.',
    example: 'npm run generate:report -- --project myapp [--open]',
    status: 'built',
  },
  {
    name: 'setup-test-users',
    description: 'Enables email/password login for existing Supabase users without creating new accounts. Uses each user\'s email as their password. Run after every db:reset.',
    example: 'node scripts/setup-test-users.mjs',
    status: 'built',
  },
]);

const featuresTable = createTable(
  ['Feature', 'Description', 'Benefit'],
  [
    ['Data-Driven Testing', `Test cases live in Excel (${code('TEST_DATA')} column). Non-developers edit data without touching code.`, 'Business-controlled test data'],
    ['Run Control', `Per-test ${code('RUN: YES/NO')} flag in Excel. Toggle modules on/off without code changes.`, 'Selective test execution'],
    ['Multi-Role Testing', '5 roles in HappyQ (Standard, Receptionist, Doctor, Accountant, Admin). Each has its own saved Playwright session.', 'Full RBA coverage'],
    ['Session Reuse', 'Login once per role via auth setup → all tests reuse storageState. Auth tests always use real login.', 'Fast runs, realistic auth tests'],
    ['Run ID Tagging', `All created data tagged ${code('[ADAPT-YYYYMMDD-HHmm]')}. Cleanup deletes only ADAPT-tagged records.`, 'Safe, repeatable test data'],
    ['CLEANUP flag', `${code('CLEANUP=true npm run test:myapp')} deletes previous run data before starting.`, 'Clean slate every run'],
    ['Multi-Environment', `${code('ENV_FILE=.env.staging npm run test:myapp')} — same tests against any environment.`, 'One suite, many targets'],
    ['Slack Notifications', 'Pass/fail summary posted to Slack after every run.', 'Team-wide visibility'],
    ['Prism Reports', 'Dated HTML report auto-generated after every run. Dark/light theme, module grouping, error details.', 'Persistent run history'],
    ['Source Scanner', `${code('new:project --src')} auto-detects framework, scans routes + dialogs, generates stubs.`, 'Minutes not hours to onboard'],
    ['Smart Excel Merge', `${code('update:testbook')} preserves user edits — TEST_DATA, RUN, NOTES never overwritten.`, 'Safe to re-run anytime'],
    ['TODO Report', 'Generated with new projects — lists every guessed selector with confidence level and codegen instructions.', 'Clear verification roadmap'],
  ]
);

const featuresContent = `
<p style="font-size:12px;color:var(--color-text-muted);margin-bottom:16px">All features available to every project in the framework — no per-project configuration needed.</p>
${featuresTable}
<div style="margin-top:20px">${scriptsContent}</div>`;

// ─── Prism Design System ──────────────────────────────────────────────────────

const prismContent = `
<p style="font-size:12px;color:var(--color-text-muted);margin-bottom:16px">
  <strong style="color:var(--color-text)">Prism</strong> is DeepTree's HTML document format — a Playwright-inspired dark/light design system
  used for all ADAPT outputs: test reports, architecture docs, summaries, and dashboards.
  The name reflects how it refracts raw data into clear, organised views.
</p>
${createTable(
  ['Asset', 'Location', 'Purpose'],
  [
    [code('playwright-theme.css'), code('core/assets/playwright-theme.css'), 'All design tokens, components, dark + light CSS. Link or inline in any HTML.'],
    [code('report-template.html'), code('core/assets/report-template.html'), 'Blank Prism shell — sidebar, topbar, theme toggle pre-wired. Copy and add sections.'],
    [code('html-builder.mjs'), code('scripts/lib/html-builder.mjs'), 'JS functions for programmatic HTML generation: getBaseHtml(), createSection(), createTable(), createPill(), createKpiGrid(), createRunTimeline(), createScriptList().'],
  ]
)}
<div style="margin-top:16px">
${createTable(
  ['Component', 'Class / Function', 'Description'],
  [
    ['Page shell',     code('getBaseHtml(opts)'),       'Full page with sidebar, topbar, progress bar, theme toggle, scroll-spy nav'],
    ['Section',        code('createSection(id, title, html)'), 'Titled section with anchor ID for sidebar navigation'],
    ['Table',          code('createTable(headers, rows)'), 'Bordered table with hover rows, monospace IDs, dark/light adaptive'],
    ['Status pill',    code('createPill(text, type)'),   'Inline badge: pass · fail · skip · blue · green · amber · red · purple · rose · cyan · gray'],
    ['KPI grid',       code('createKpiGrid(items)'),     'Row of stat cards with large numbers (pass count, duration, etc.)'],
    ['Run timeline',   code('createRunTimeline(runs)'),  'Visual bar chart of run history with pass/fail/skip proportions'],
    ['Script list',    code('createScriptList(scripts)'),'Command cards with name, description, example, built/backlog badge'],
    ['Note box',       code('createNote(text)'),         'Amber warning/info callout box'],
    ['Theme toggle',   'Built into every page',          'Switches dark ↔ light, persists to localStorage'],
    ['Active nav',     'Built into every page',          'IntersectionObserver highlights current section in sidebar as you scroll'],
  ]
)}
</div>
<div style="margin-top:16px">
<div class="script-list">
  <div class="script-item">
    <div class="script-cmd-name" style="width:110px">Link CSS</div>
    <div class="script-body">
      <div class="script-desc">For pages inside the adapt/ repo — link the shared CSS file.</div>
      <div class="script-example">&lt;link rel="stylesheet" href="../../core/assets/playwright-theme.css"&gt;</div>
    </div>
  </div>
  <div class="script-item">
    <div class="script-cmd-name" style="width:110px">Inline CSS</div>
    <div class="script-body">
      <div class="script-desc">For portable, self-contained single-file HTML (e.g. emailed reports).</div>
      <div class="script-example">import { getInlineCss } from './scripts/lib/html-builder.mjs';</div>
    </div>
  </div>
  <div class="script-item">
    <div class="script-cmd-name" style="width:110px">Programmatic</div>
    <div class="script-body">
      <div class="script-desc">Generate full reports from data using the builder functions.</div>
      <div class="script-example">const html = getBaseHtml({ title, sidebarStats, content: [ createSection(...) ] });</div>
    </div>
  </div>
</div>
</div>`;

// ─── New Project Guide ────────────────────────────────────────────────────────

const newProjectContent = `
<p style="font-size:12px;color:var(--color-text-muted);margin-bottom:16px">
  For a brand new application that has no existing test coverage.
</p>
${createTable(
  ['Step', 'Command / Action', 'What Happens', 'Manual?'],
  [
    ['1', code('npm run new:project -- --name myapp --src D:\\myapp'), 'Scaffolds folders, config, env, BasePage, testdata file, Excel workbook. If --src provided: auto-detects framework, scans routes + dialogs, generates page objects + test stubs + TODO_REPORT.md', createPill('Automated', 'pass')],
    ['2', 'Open ' + code('projects/myapp/TODO_REPORT.md'), 'Reviews every generated selector with confidence level (✅ HIGH / ⚠️ MEDIUM / ❌ LOW)', createPill('Review', 'blue')],
    ['3', code('npx playwright codegen http://localhost:PORT/route'), 'Click elements in browser → Playwright writes real selectors → paste into page objects', createPill('Per page', 'amber')],
    ['4', code('npm run heal:selectors -- --project myapp'), 'Auto-heals all expectLoaded() heading selectors from live DOM', createPill('Automated', 'pass')],
    ['5', code('npm run heal:actions -- --project myapp'), 'Auto-heals button/tab/placeholder selectors in action methods', createPill('Automated', 'pass')],
    ['6', code('npm run heal:dialogs -- --project myapp'), 'Auto-heals dialog fill/submit/cancel selectors', createPill('Automated', 'pass')],
    ['7', 'Fill in ' + code('TEST_DATA') + ' column in Excel', 'Add meaningful test values (names, phones, dates) — smart merge preserves these forever', createPill('Once', 'amber')],
    ['8', 'Fill in ' + code('projects/myapp/.env.local'), 'Add BASE_URL, test user credentials, SUPABASE_URL', createPill('Once', 'amber')],
    ['9', code('node scripts/setup-test-users.mjs'), 'Enable email/password login for test users in Supabase', createPill('Once', 'amber')],
    ['10', code('npm run test:myapp'), 'Run full suite — report auto-generated at projects/myapp/reports/', createPill('Automated', 'pass')],
  ]
)}
${createNote('When adding a new module later: create page object + dialog classes + test file → add rows to testdata/myapp.mjs → run update:testbook → run heal scripts → run tests.')}`;

// ─── Existing App Guide ───────────────────────────────────────────────────────

const existingAppContent = `
<p style="font-size:12px;color:var(--color-text-muted);margin-bottom:16px">
  For an application that already exists and has running code. ADAPT plugs in non-invasively — no changes to the app's source code.
</p>
${createTable(
  ['Step', 'Command / Action', 'Notes'],
  [
    ['1', 'Clone the ADAPT repo alongside your app', code('git clone adapt/ D:\\adapt')],
    ['2', code('cd D:\\adapt && npm install && npm run install:browsers'), 'Install dependencies + Playwright Chromium once per machine'],
    ['3', code('npm run new:project -- --name myapp --src D:\\myapp'), 'Source scanner detects framework, generates page objects from your existing routes and components'],
    ['4', 'Start the app: ' + code('cd D:\\myapp && npm run dev'), 'The app must be running for heal scripts to work'],
    ['5', code('npm run heal:selectors -- --project myapp'), 'Fix all heading selectors — most will be auto-healed'],
    ['6', code('npm run heal:actions -- --project myapp'), 'Fix action method selectors'],
    ['7', code('npm run heal:dialogs -- --project myapp'), 'Fix dialog selectors for dialogs referenced in test files'],
    ['8', 'Create test users in your app/database', 'One user per role. Use ' + code('node scripts/setup-test-users.mjs') + ' for Supabase apps.'],
    ['9', code('cp projects/myapp/.env.example projects/myapp/.env.local'), 'Fill in credentials and BASE_URL'],
    ['10', code('npm run test:myapp'), 'First run — expect some failures from selectors still needing codegen. Fix iteratively.'],
  ]
)}
<div style="margin-top:16px">
<div class="table-wrap">
  <table>
    <thead><tr><th>Framework</th><th>Auto-Detection</th><th>Route Source</th><th>Dialog Detection</th></tr></thead>
    <tbody>
      <tr><td>React + React Router</td><td><span class="pill pill-pass">✓ Full</span></td><td>App.tsx / router.tsx</td><td>Files with "Dialog" in name</td></tr>
      <tr><td>Next.js App Router</td><td><span class="pill pill-pass">✓ Full</span></td><td>app/ folder structure</td><td>Files with "Dialog" in name</td></tr>
      <tr><td>Next.js Pages Router</td><td><span class="pill pill-pass">✓ Full</span></td><td>pages/ folder structure</td><td>Files with "Dialog" in name</td></tr>
      <tr><td>TanStack Router</td><td><span class="pill pill-pass">✓ Full</span></td><td>src/routes/ config</td><td>Files with "Dialog" in name</td></tr>
      <tr><td>Vue + Vue Router</td><td><span class="pill pill-blue">Partial</span></td><td>src/router/index.ts</td><td>Files with "Dialog" in name</td></tr>
      <tr><td>Angular</td><td><span class="pill pill-amber">Basic</span></td><td>Component scan</td><td>Files with "dialog" in name</td></tr>
    </tbody>
  </table>
</div>
</div>`;

// ─── Plug & Play ──────────────────────────────────────────────────────────────

const plugPlayContent = `
<p style="font-size:12px;color:var(--color-text-muted);margin-bottom:16px">
  ADAPT is designed as a platform, not a per-project tool. The monorepo structure means every new application adds a folder and inherits the full framework.
</p>
${createTable(
  ['What\'s Shared (core/)', 'What\'s Per-Project (projects/name/)'],
  [
    ['Spreadsheet reader + results writer', 'playwright.config.ts (extends base)'],
    ['Slack reporter', 'global-setup.ts (cleanup + Run ID)'],
    ['Auth fixture (generic login + session save)', '.env.local (credentials — gitignored)'],
    ['Run ID generator + cleanup engine', 'data/*.xlsx (testbook — 4 standard sheets)'],
    ['Base Playwright config', 'pages/ (Page Object Model)'],
    ['Prism design system (CSS + builder)', 'tests/ (E2E test files)'],
    ['All heal scripts', 'reports/ (auto-generated HTML)'],
    ['new:project + update:testbook scripts', '.auth/ (role sessions — gitignored)'],
  ]
)}
<div style="margin-top:16px">
<div style="background:var(--color-bg);border:1px solid var(--color-border);border-radius:4px;padding:16px 20px;font-family:var(--font-mono);font-size:12px;line-height:2;color:var(--color-text-muted)">
<span style="color:var(--color-text-dim)"># Adding a second project takes under 5 minutes:</span>
<br>
<span style="color:var(--color-accent)">npm run new:project</span> -- --name <span style="color:var(--color-pass)">onlinebooking</span> --src D:\\onlinebooking
<br><span style="color:var(--color-text-dim)"># → Detects React Router, scans 20 routes, generates 20 page objects, creates Excel</span>
<br><br>
<span style="color:var(--color-accent)">npm run heal:selectors</span> -- --project <span style="color:var(--color-pass)">onlinebooking</span>
<br><span style="color:var(--color-text-dim)"># → Navigates each page, heals headings automatically</span>
<br><br>
<span style="color:var(--color-accent)">npm run test:onlinebooking</span>
<br><span style="color:var(--color-text-dim)"># → Full suite runs, Prism report generated at projects/onlinebooking/reports/</span>
</div>
</div>
${createNote('Every project added to ADAPT gets: heal scripts, Prism reports, Excel run control, multi-role auth, Slack notifications, and CI workflows — for free. Zero setup beyond the project folder itself.')}`;

// ─── Conventions ─────────────────────────────────────────────────────────────

const conventionsContent = `
<p style="font-size:12px;color:var(--color-text-muted);margin-bottom:16px">
  Enforced automatically by ${code('CLAUDE.md')} when the ADAPT repo is open in Claude Code.
  Every AI session follows these conventions without being reminded.
</p>
${createTable(
  ['Convention', 'Rule', 'Why'],
  [
    ['Page objects', `Extend ${code('BasePage')}, always have ${code('goto()')}, ${code('expectLoaded()')}, ${code('expectAccessDenied()')}`, 'Consistent interface across all pages'],
    ['Dialog classes', `Do NOT extend BasePage. Always have ${code('expectOpen()')}, typed ${code('fill(data)')} with interface, action method, ${code('cancel()')}`, 'Dialogs are scoped, not pages'],
    ['Dialog scope', 'All interactions scoped to ' + code('getByRole(\'dialog\')') + ' to prevent selector conflicts', 'Avoids multiple-match strict mode errors'],
    ['Selectors', 'Use ' + code('getByRole') + ', ' + code('getByLabel') + ', ' + code('getByPlaceholder') + ' — never CSS class selectors', 'Resilient to styling changes'],
    ['shadcn labels', code('getByPlaceholder()') + ' preferred over ' + code('getByLabel()') + ' inside shadcn dialogs', 'shadcn FormLabel htmlFor is unreliable'],
    ['Test IDs', code('MODULE-E2E-001') + ' format. RBA checks: ' + code('RBA-MODULE-001'), 'Consistent, searchable, matches Excel'],
    ['storageState', 'File named after role lowercased: ' + code('.auth/accountant.json'), 'Convention enforced by CLAUDE.md'],
    ['Compliance report', 'After every creation task, Claude produces a compliance table (followed / missed / assumptions)', 'Catches issues before tests run'],
  ]
)}`;

// ─── Roadmap ──────────────────────────────────────────────────────────────────

const roadmapContent = createTable(
  ['Item', 'Description', 'Priority'],
  [
    ['Update + Delete test cases', 'Edit patient, edit appointment, cancel invoice — needs test cases using existing dialog classes in edit mode', createPill('High', 'amber')],
    ['Full journey tests', 'Book appointment end-to-end, billing journey (invoice → payment → print), follow-up lifecycle', createPill('High', 'amber')],
    ['Outstanding Balances role', 'Identify which HappyQ role has /billing/outstanding permission — enable 3 skipped tests', createPill('High', 'amber')],
    ['RBA reception fix', 'Identify role denied reception access — re-enable RBA-REC-001', createPill('Medium', 'blue')],
    ['Excel RESULTS history', 'Write test results back to Excel RESULTS sheet after each run (in addition to JSON) for long-term trend tracking', createPill('Medium', 'blue')],
    ['OnlineBooking project', 'Add second project to validate plug-and-play — use new:project --src', createPill('Medium', 'blue')],
    ['Multi-environment scripts', 'Add npm scripts for .env.dev, .env.test, .env.staging per project', createPill('Low', 'gray')],
    ['GitHub Actions CI', 'Wire on-push and nightly workflows for HappyQ — push ADAPT to remote repo first', createPill('Low', 'gray')],
    ['generate-report: all-runs mode', 'Option to show aggregated results across all runs in one report', createPill('Low', 'gray')],
    ['heal:actions — strict mode detection', 'Auto-add .first() when heal:actions detects multiple matching elements', createPill('Low', 'gray')],
  ]
);

// ═══════════════════════════════════════════════════════════════════════════════
//  ASSEMBLE FULL PAGE
// ═══════════════════════════════════════════════════════════════════════════════

const sections = [
  createSection('overview',     'Overview',                      overviewContent),
  createSection('problem',      'Problem & Solution',            problemContent),
  createSection('architecture', 'Architecture',                  archContent),
  createSection('features',     'Features & Scripts',            featuresContent),
  createSection('prism',        'Prism — The Design System',     prismContent),
  createSection('newproject',   'New Project Guide',             newProjectContent),
  createSection('existingapp',  'Existing App Guide',            existingAppContent),
  createSection('plugplay',     'Plug & Play',                   plugPlayContent),
  createSection('conventions',  'Conventions & AI Enforcement',  conventionsContent),
  createSection('roadmap',      'Roadmap',                       roadmapContent),
];

const sidebarStats = [
  { n: 'ADAPT', l: 'Framework',    cls: 'n-blue'   },
  { n: '1.0',   l: 'Version',      cls: 'n-blue'   },
  { n: '3',     l: 'Heal Scripts', cls: 'n-pass'   },
  { n: '∞',     l: 'Projects',     cls: 'n-purple' },
];

const sidebarNav = [
  { href: '#overview',     label: 'Overview',               dot: '#4a90d9', active: true },
  { href: '#problem',      label: 'Problem & Solution',     dot: '#f44336' },
  { href: '#architecture', label: 'Architecture',           dot: '#9c6ef5' },
  { href: '#features',     label: 'Features & Scripts',     dot: '#4caf50' },
  { href: '#prism',        label: 'Prism Design System',    dot: '#4dd0e1' },
  { href: '#newproject',   label: 'New Project Guide',      dot: '#ff9800' },
  { href: '#existingapp',  label: 'Existing App Guide',     dot: '#ff9800' },
  { href: '#plugplay',     label: 'Plug & Play',            dot: '#4caf50' },
  { href: '#conventions',  label: 'Conventions',            dot: '#888'    },
  { href: '#roadmap',      label: 'Roadmap',                dot: '#888'    },
];

// ─── DeepTree logo (inline SVG — scaled to sidebar width) ────────────────────

const deeptreeLogo = `<svg width="52" height="50" viewBox="0 0 434 414" style="flex-shrink:0" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block;margin-bottom:12px">
<path d="M214.988 17.6185C173.186 17.6847 131.384 17.7528 89.5828 17.8164C72.761 17.842 55.9371 18.0228 39.118 17.8192C28.0125 17.6848 16.6871 27.4934 16.7172 40.2883C16.9757 150.379 16.8445 260.471 16.8764 370.562C16.8803 383.731 25.1628 393.369 38.3161 394.145C52.5912 394.986 66.9382 394.611 81.254 394.757C94.2308 394.89 107.208 395.011 120.679 395.673C121.185 401.371 121.195 406.534 121.206 411.696C92.559 411.752 63.9072 412.131 35.2662 411.733C19.7161 411.516 3.5297 395.656 1.08442 379.445C0.441659 375.184 0.0591833 370.839 0.0568023 366.532C-0.00346975 257.592 -0.00594249 148.653 0.00516651 39.7135C0.00742451 17.3136 16.9164 0.1035 39.4116 0.0575265C97.2123 -0.0605925 155.014 0.0371097 212.815 0.0535897C213.313 0.0537267 213.811 0.123231 214.756 0.675767C215.131 6.66693 215.059 12.1427 214.988 17.6185Z" fill="#3D93F1"/>
<path d="M329.413 299.062C330.203 295.07 331.655 291.082 331.676 287.086C331.819 259.929 331.589 232.771 331.662 205.613C331.675 200.476 330.338 196.436 326.542 192.729C309.99 176.567 293.636 160.201 277.289 143.83C273.788 140.323 269.958 138.793 264.859 138.822C230.371 139.019 195.881 139.001 161.393 138.834C156.713 138.811 154.067 139.853 152.027 144.58C146.543 157.287 132.356 163.829 118.425 160.868C105.983 158.224 94.4692 145.629 94.7456 131.815C95.0683 115.686 103.861 103.878 119.324 100.54C133.362 97.5093 147.51 105.268 153.325 119.574C154.678 122.903 156.838 122.965 159.601 122.961C194.423 122.904 229.25 123.197 264.065 122.671C274.943 122.506 282.936 125.874 290.424 133.772C306.333 150.551 322.958 166.662 339.561 182.767C345.096 188.136 347.83 194.172 347.816 201.785C347.758 232.775 348.003 263.767 347.574 294.751C347.516 298.925 344.25 303.055 341.891 307.211C337.347 304.499 333.38 301.78 329.413 299.062ZM139.965 128.786C138.081 120.825 133.219 116.26 126.243 115.901C118.906 115.524 113.276 119.041 111.146 125.573C109.26 131.357 109.77 136.744 114.479 141.173C119.135 145.552 124.506 147.195 130.512 144.581C136.912 141.794 140.243 136.775 139.965 128.786Z" fill="#F13B3C"/>
<path d="M215.449 17.6822C215.059 12.1427 215.131 6.66693 215.241 0.748625C225.43 0.212477 235.582 0.0464307 245.734 0.0386637C278.7 0.0133947 311.666 0.10948 344.631 0.0111216C352.689 -0.0129114 359.578 2.16739 365.387 7.99882C385.927 28.6206 406.587 49.1228 427.21 69.662C431.425 73.8602 433.714 78.9729 433.721 84.8549C433.78 129.973 433.738 175.091 433.218 220.645C427.908 221.004 423.107 220.927 418.305 220.849C418.182 217.193 417.955 213.537 417.952 209.88C417.916 170.584 417.854 131.287 417.978 91.9906C417.995 86.6064 416.346 82.4973 412.491 78.7217C394.065 60.6781 375.731 42.539 357.56 24.239C353.065 19.7111 348.416 17.6525 341.79 17.6978C299.832 17.9847 257.871 17.785 215.449 17.6822Z" fill="#F1393C"/>
<path d="M121.649 411.777C121.195 406.534 121.185 401.371 121.082 395.777C121.188 392.871 121.556 390.398 121.556 387.924C121.554 370.926 121.581 353.927 121.374 336.931C121.276 328.814 123.772 322.126 129.657 316.325C147.679 298.562 165.43 280.523 183.361 262.667C186.231 259.81 187.674 257.381 186.349 252.788C182.456 239.295 189.867 224.989 202.961 219.118C216.361 213.11 232.079 217.792 240.874 230.412C248.399 241.209 246.742 257.645 237.166 267.185C225.763 278.546 212.959 279.941 197.696 271.206C185.588 283.361 173.377 295.59 161.203 307.857C154.876 314.233 148.721 320.783 142.279 327.04C139.159 330.071 137.992 333.458 138.013 337.726C138.125 360.557 138.073 383.389 138.078 406.221C138.078 408.012 138.078 409.803 138.078 411.858C132.383 411.858 127.237 411.858 121.649 411.777ZM229.839 246.54C229.681 238.107 222.616 232.769 215.937 232.034C210.184 231.401 204.311 235.108 202.18 240.649C200.051 246.187 200.373 251.509 204.503 255.989C208.513 260.338 213.659 262.004 219.452 260.43C226.01 258.648 229.22 253.967 229.839 246.54Z" fill="#F5B92B"/>
<path d="M329.184 299.243C333.38 301.78 337.347 304.499 341.608 307.443C329.112 320.506 316.365 333.387 303.514 346.162C294.667 354.958 285.586 363.522 276.839 372.414C275.494 373.781 274.648 376.426 274.817 378.371C276.305 395.451 266.328 409.504 249.94 412.986C234.742 416.215 217.973 405.118 214.465 389.51C210.723 372.863 220.55 356.8 236.721 353.13C247.027 350.791 251.979 352.023 266.443 360.661C287.225 340.303 308.09 319.863 329.184 299.243ZM250.13 397.114C258.982 392.309 261.971 383.509 257.508 375.394C253.634 368.353 244.032 365.642 236.7 369.521C230.092 373.018 227.135 381.538 229.979 388.888C232.852 396.315 240.221 399.552 250.13 397.114Z" fill="#4CA868"/>
<path d="M418.229 221.319C423.107 220.927 427.908 221.004 433.149 221.124C433.619 259.47 433.647 297.774 433.68 336.078C433.69 347.403 433.051 358.777 433.877 370.043C435.358 390.232 412.016 413.481 392.246 412.368C389.971 412.24 387.683 412.351 383.982 412.351C391.3 405.486 397.823 399.742 403.897 393.557C409.168 388.188 415.976 383.834 417.48 375.606C417.865 373.5 418.026 371.325 418.029 369.181C418.092 320.05 418.119 270.919 418.229 221.319Z" fill="#49A568"/>
</svg>`;

const html = getBaseHtml({
  title:       'ADAPT Architecture',
  subtitle:    'by deeptree.in · v1.0',
  badgeText:   'deeptree.in · ADAPT',
  logoHtml:    deeptreeLogo,
  sidebarStats,
  sidebarNav,
  topbarTitle: 'ADAPT — Automated Data-driven Playwright Testing',
  topbarMeta:  'Architecture & Developer Guide · deeptree.in',
  progress:    { pass: 100, fail: 0, skip: 0 },
  content:     sections,
  cssPath:     null, // inline CSS — portable single file
});

// ─── Write output ─────────────────────────────────────────────────────────────

fs.writeFileSync(outPath, html, 'utf-8');
console.log(`\n[ADAPT] Architecture document generated:\n  📄  ${outPath}\n`);
