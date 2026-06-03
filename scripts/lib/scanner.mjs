/**
 * scanner.mjs — Scans project source to extract routes, components, and dialogs.
 * Works with the result of detector.mjs.
 */

import fs from 'fs';
import path from 'path';

// ── Main Entry Point ──────────────────────────────────────────────────────────

/**
 * Scan a project and return structured data for the generator.
 *
 * @param {string}       srcPath      Absolute path to project source root
 * @param {DetectResult} projectInfo  Result from detectProjectType()
 * @returns {ScanResult}
 */
export function scanProject(srcPath, projectInfo) {
  console.log(`\n[ADAPT] Scanning ${projectInfo.label} project at: ${srcPath}`);

  let routes = [];

  switch (projectInfo.type) {
    case 'react-router':
      routes = scanReactRouter(projectInfo.routerFile, projectInfo.componentRoot);
      break;
    case 'nextjs-app':
      routes = scanNextJsAppRouter(projectInfo.routeRoot);
      break;
    case 'nextjs-pages':
      routes = scanNextJsPagesRouter(projectInfo.routeRoot);
      break;
    case 'tanstack-router':
      routes = scanTanStackRouter(projectInfo.routeRoot, projectInfo.componentRoot);
      break;
    default:
      console.warn('[ADAPT] Unknown project type — attempting generic scan');
      routes = genericScan(srcPath);
  }

  const dialogs = scanDialogs(srcPath, projectInfo.componentRoot);
  const modules = groupRoutesByModule(routes);

  console.log(`[ADAPT] Found ${routes.length} routes, ${dialogs.length} dialogs, ${modules.length} modules`);

  return { routes, dialogs, modules };
}

// ── React Router Scanner ──────────────────────────────────────────────────────

function scanReactRouter(routerFile, componentRoot) {
  if (!routerFile || !fs.existsSync(routerFile)) {
    console.warn('[ADAPT] Router file not found — routes could not be extracted');
    return [];
  }

  const content  = fs.readFileSync(routerFile, 'utf-8');
  const routes   = [];
  const imports  = extractImports(content);

  // Pattern 1: <Route path="/foo" element={<FooPage />} />
  const jsxRoutes = [...content.matchAll(
    /path=["']([^"']+)["'][^>]*element=\{<(\w+)/g
  )];
  for (const [, routePath, componentName] of jsxRoutes) {
    routes.push(buildRoute(routePath, componentName, imports, componentRoot));
  }

  // Pattern 2: { path: '/foo', element: <FooPage /> }
  const objRoutes = [...content.matchAll(
    /path:\s*["']([^"']+)["'][^}]*element:\s*<(\w+)/g
  )];
  for (const [, routePath, componentName] of objRoutes) {
    if (!routes.find(r => r.path === routePath)) {
      routes.push(buildRoute(routePath, componentName, imports, componentRoot));
    }
  }

  // Pattern 3: { path: '/foo', component: FooPage }
  const compRoutes = [...content.matchAll(
    /path:\s*["']([^"']+)["'][^}]*component:\s*(\w+)/g
  )];
  for (const [, routePath, componentName] of compRoutes) {
    if (!routes.find(r => r.path === routePath)) {
      routes.push(buildRoute(routePath, componentName, imports, componentRoot));
    }
  }

  return routes.filter(r => r.path && r.path !== '*' && !r.path.includes(':'));
}

// ── Next.js App Router Scanner ────────────────────────────────────────────────

function scanNextJsAppRouter(appDir) {
  if (!fs.existsSync(appDir)) return [];
  const routes = [];
  walkDir(appDir, (filePath) => {
    if (!filePath.match(/page\.(tsx|jsx|ts|js)$/)) return;
    const routePath = filePath
      .replace(appDir, '')
      .replace(/\/page\.(tsx|jsx|ts|js)$/, '')
      .replace(/\\/g, '/')
      || '/';
    const componentName = deriveComponentName(routePath);
    const elements = scanComponentFile(filePath);
    routes.push({ path: routePath, componentName, componentFile: filePath, elements, confidence: 'HIGH' });
  });
  return routes;
}

// ── Next.js Pages Router Scanner ─────────────────────────────────────────────

function scanNextJsPagesRouter(pagesDir) {
  if (!fs.existsSync(pagesDir)) return [];
  const routes = [];
  walkDir(pagesDir, (filePath) => {
    if (filePath.match(/_(app|document|error)\.(tsx|jsx|ts|js)$/)) return;
    if (!filePath.match(/\.(tsx|jsx|ts|js)$/)) return;
    const routePath = filePath
      .replace(pagesDir, '')
      .replace(/\.(tsx|jsx|ts|js)$/, '')
      .replace(/\/index$/, '/')
      .replace(/\\/g, '/');
    const componentName = deriveComponentName(routePath);
    const elements = scanComponentFile(filePath);
    routes.push({ path: routePath, componentName, componentFile: filePath, elements, confidence: 'HIGH' });
  });
  return routes;
}

// ── TanStack Router Scanner ───────────────────────────────────────────────────

function scanTanStackRouter(routeRoot, componentRoot) {
  if (!fs.existsSync(routeRoot)) return [];
  const routes = [];
  const imports = {};

  walkDir(routeRoot, (filePath) => {
    if (!filePath.match(/\.(tsx|jsx|ts|js)$/)) return;
    const content = fs.readFileSync(filePath, 'utf-8');

    // createRoute({ path: '/foo', component: FooPage })
    const matches = [...content.matchAll(
      /path:\s*["']([^"']+)["'][^}]*component:\s*(\w+)/g
    )];
    for (const [, routePath, componentName] of matches) {
      routes.push(buildRoute(routePath, componentName, imports, componentRoot));
    }
  });

  return routes;
}

// ── Generic Fallback Scanner ──────────────────────────────────────────────────

function genericScan(srcPath) {
  const routes = [];
  // Look for common component patterns in src/
  const srcDir = path.join(srcPath, 'src');
  if (!fs.existsSync(srcDir)) return routes;

  // Find files that look like pages (Page.tsx suffix)
  walkDir(srcDir, (filePath) => {
    if (!filePath.match(/Page\.(tsx|jsx)$/)) return;
    const componentName = path.basename(filePath).replace(/\.(tsx|jsx)$/, '');
    const routePath = '/' + componentName.replace(/Page$/, '').toLowerCase();
    const elements = scanComponentFile(filePath);
    routes.push({
      path: routePath,
      componentName,
      componentFile: filePath,
      elements,
      confidence: 'LOW',
    });
  });

  return routes;
}

// ── Dialog Scanner ────────────────────────────────────────────────────────────

function scanDialogs(srcPath, componentRoot) {
  const dialogs = [];
  const searchRoot = componentRoot || srcPath;
  if (!fs.existsSync(searchRoot)) return dialogs;

  walkDir(searchRoot, (filePath) => {
    const basename = path.basename(filePath);
    if (!basename.includes('Dialog') && !basename.includes('Modal') && !basename.includes('Sheet')) return;
    if (!filePath.match(/\.(tsx|jsx)$/)) return;

    const content  = fs.readFileSync(filePath, 'utf-8');
    const name     = basename.replace(/\.(tsx|jsx)$/, '');
    const fields   = extractFormFields(content);
    const buttons  = extractButtons(content);
    const module   = deriveModuleFromPath(filePath, searchRoot);

    dialogs.push({ name, filePath, module, fields, buttons, confidence: 'MEDIUM' });
  });

  return dialogs;
}

// ── Component Scanner ─────────────────────────────────────────────────────────

export function scanComponentFile(filePath) {
  if (!filePath || !fs.existsSync(filePath)) {
    return { headings: [], buttons: [], labels: [], placeholders: [], confidence: 'LOW' };
  }

  const content = fs.readFileSync(filePath, 'utf-8');

  return {
    headings:     extractHeadings(content),
    buttons:      extractButtons(content),
    labels:       extractLabels(content),
    placeholders: extractPlaceholders(content),
    confidence:   'MEDIUM',
  };
}

// ── Element Extractors ────────────────────────────────────────────────────────

function extractHeadings(content) {
  const results = new Set();

  // <h1>Text</h1>, <h2>Text</h2>
  for (const [, text] of content.matchAll(/<h[1-3][^>]*>\s*([^<{]+)\s*</g)) {
    const t = clean(text);
    if (t) results.add(t);
  }
  // title="..." or heading="..."
  for (const [, text] of content.matchAll(/(?:title|heading)=["']([^"']+)["']/g)) {
    const t = clean(text);
    if (t) results.add(t);
  }
  // <PageHeader title="..." /> or similar
  for (const [, text] of content.matchAll(/PageHeader[^>]*title=["']([^"']+)["']/g)) {
    const t = clean(text);
    if (t) results.add(t);
  }

  return [...results].slice(0, 3); // top 3 most likely headings
}

function extractButtons(content) {
  const results = new Set();

  // <Button ...>Text</Button> or <button ...>Text</button>
  for (const [, text] of content.matchAll(/<[Bb]utton[^>]*>\s*([^<{]+)\s*</g)) {
    const t = clean(text);
    if (t && t.length > 1 && t.length < 50) results.add(t);
  }
  // name="..." on buttons
  for (const [, text] of content.matchAll(/<[Bb]utton[^>]*name=["']([^"']+)["']/g)) {
    const t = clean(text);
    if (t) results.add(t);
  }

  return [...results].slice(0, 8);
}

function extractLabels(content) {
  const results = new Set();

  // <Label ...>Text</Label>
  for (const [, text] of content.matchAll(/<Label[^>]*>\s*([^<{(]+)\s*</g)) {
    const t = clean(text);
    if (t && t.length > 1 && t.length < 40) results.add(t);
  }
  // <label ...>Text</label>
  for (const [, text] of content.matchAll(/<label[^>]*>\s*([^<{]+)\s*</g)) {
    const t = clean(text);
    if (t && t.length > 1 && t.length < 40) results.add(t);
  }

  return [...results].slice(0, 10);
}

function extractPlaceholders(content) {
  const results = new Set();

  for (const [, text] of content.matchAll(/placeholder=["']([^"']+)["']/g)) {
    const t = clean(text);
    if (t) results.add(t);
  }

  return [...results].slice(0, 8);
}

function extractFormFields(content) {
  return {
    labels:       extractLabels(content),
    placeholders: extractPlaceholders(content),
  };
}

// ── Route / Module Helpers ────────────────────────────────────────────────────

function buildRoute(routePath, componentName, imports, componentRoot) {
  const componentFile = resolveComponentFile(componentName, imports, componentRoot);
  const elements      = componentFile ? scanComponentFile(componentFile) : {
    headings: [], buttons: [], labels: [], placeholders: [], confidence: 'LOW',
  };

  return {
    path: routePath,
    componentName,
    componentFile,
    elements,
    confidence: componentFile ? 'MEDIUM' : 'LOW',
  };
}

function resolveComponentFile(componentName, imports, componentRoot) {
  // Check imports map first
  if (imports[componentName]) {
    const full = imports[componentName];
    for (const ext of ['.tsx', '.jsx', '.ts', '.js']) {
      if (fs.existsSync(full + ext)) return full + ext;
      if (fs.existsSync(full)) return full;
    }
  }

  // Search componentRoot for matching filename
  if (!fs.existsSync(componentRoot)) return null;
  let found = null;
  walkDir(componentRoot, (filePath) => {
    if (found) return;
    const base = path.basename(filePath, path.extname(filePath));
    if (base === componentName) found = filePath;
  });

  return found;
}

function extractImports(content) {
  const imports = {};
  for (const [, name, importPath] of content.matchAll(
    /import\s+(?:\w+\s*,\s*)?\{?(\w+)\}?\s+from\s+["']([^"']+)["']/g
  )) {
    imports[name] = importPath;
  }
  // Lazy imports: const Foo = lazy(() => import('./pages/foo/FooPage'))
  for (const [, name, importPath] of content.matchAll(
    /const\s+(\w+)\s*=\s*lazy\([^)]*import\(['"]([^'"]+)['"]\)/g
  )) {
    imports[name] = importPath;
  }
  return imports;
}

function groupRoutesByModule(routes) {
  const map = new Map();
  for (const route of routes) {
    const seg     = route.path.split('/').filter(Boolean)[0] || 'home';
    const module  = seg.charAt(0).toUpperCase() + seg.slice(1);
    if (!map.has(module)) map.set(module, { module, prefix: derivePrefix(module), routes: [] });
    map.get(module).routes.push(route);
  }
  return [...map.values()];
}

function derivePrefix(module) {
  // Common known mappings
  const known = {
    Auth: 'AUTH', Patients: 'PAT', Appointments: 'APT', Reception: 'REC',
    Consultant: 'CON', Billing: 'BIL', Followups: 'FOL', Tasks: 'TSK',
    Documents: 'DOC', Settings: 'SET', Dashboard: 'DASH', Display: 'DIS',
    Home: 'HOME', Users: 'USR', Reports: 'RPT', Profile: 'PRF',
  };
  return known[module] ?? module.slice(0, 3).toUpperCase();
}

function deriveComponentName(routePath) {
  const seg = routePath.split('/').filter(Boolean).pop() || 'home';
  return seg.charAt(0).toUpperCase() + seg.slice(1) + 'Page';
}

function deriveModuleFromPath(filePath, root) {
  const rel  = filePath.replace(root, '').replace(/\\/g, '/');
  const segs = rel.split('/').filter(Boolean);
  // e.g. components/patients/PatientDialog → patients
  return segs.length > 1 ? segs[segs.length - 2] : 'shared';
}

// ── Filesystem Helpers ────────────────────────────────────────────────────────

function walkDir(dir, cb) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // Skip node_modules, .git, dist, build
      if (['node_modules', '.git', 'dist', 'build', '.next', 'out'].includes(entry.name)) continue;
      walkDir(full, cb);
    } else {
      cb(full);
    }
  }
}

function clean(str) {
  return str?.replace(/\s+/g, ' ').trim() ?? '';
}
