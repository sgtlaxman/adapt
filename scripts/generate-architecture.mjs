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

const html = getBaseHtml({
  title:       'ADAPT Architecture',
  subtitle:    'by deeptree.in · v1.0',
  badgeText:   'deeptree.in · ADAPT',
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
