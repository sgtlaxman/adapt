/**
 * detector.mjs — Auto-detects the project type from source code.
 * Returns structured info needed by scanner.mjs to find routes.
 */

import fs from 'fs';
import path from 'path';

/**
 * Detect the project type and return metadata for the scanner.
 *
 * @param {string} srcPath  Absolute path to the project source root
 * @returns {DetectResult}
 */
export function detectProjectType(srcPath) {
  if (!fs.existsSync(srcPath)) {
    return { type: 'unknown', reason: `Path does not exist: ${srcPath}` };
  }

  // ── 1. Read package.json dependencies ──────────────────────────────────────

  const pkgPath = path.join(srcPath, 'package.json');
  let deps = {};

  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
      deps = { ...(pkg.dependencies ?? {}), ...(pkg.devDependencies ?? {}) };
    } catch {
      // ignore parse errors
    }
  }

  // ── 2. Match against known frameworks ──────────────────────────────────────

  // Next.js — check before React Router (Next apps may also have react-router)
  if (deps['next']) {
    const appDir   = path.join(srcPath, 'app');
    const pagesDir = path.join(srcPath, 'pages');
    const hasApp   = fs.existsSync(path.join(appDir, 'page.tsx'))
                  || fs.existsSync(path.join(appDir, 'page.jsx'));
    const hasPages = fs.existsSync(pagesDir);

    if (hasApp) {
      return {
        type: 'nextjs-app',
        label: 'Next.js (App Router)',
        routeRoot: appDir,
        componentRoot: path.join(srcPath, 'src') || srcPath,
        dialogGlob: '**/*Dialog*.{tsx,jsx}',
      };
    }
    if (hasPages) {
      return {
        type: 'nextjs-pages',
        label: 'Next.js (Pages Router)',
        routeRoot: pagesDir,
        componentRoot: path.join(srcPath, 'src') || srcPath,
        dialogGlob: '**/*Dialog*.{tsx,jsx}',
      };
    }
    return {
      type: 'nextjs-app',
      label: 'Next.js (App Router — assumed)',
      routeRoot: path.join(srcPath, 'app'),
      componentRoot: srcPath,
      dialogGlob: '**/*Dialog*.{tsx,jsx}',
    };
  }

  // TanStack Router
  if (deps['@tanstack/react-router']) {
    const routesDir = path.join(srcPath, 'src', 'routes');
    return {
      type: 'tanstack-router',
      label: 'TanStack Router',
      routeRoot: fs.existsSync(routesDir) ? routesDir : path.join(srcPath, 'src'),
      componentRoot: path.join(srcPath, 'src'),
      dialogGlob: '**/*Dialog*.{tsx,jsx}',
    };
  }

  // React Router DOM
  if (deps['react-router-dom'] || deps['react-router']) {
    const srcDir    = path.join(srcPath, 'src');
    const routerFile = findRouterFile(srcDir);
    return {
      type: 'react-router',
      label: 'React Router',
      routerFile,
      componentRoot: srcDir,
      dialogGlob: '**/*Dialog*.{tsx,jsx}',
    };
  }

  // Vue Router
  if (deps['vue-router']) {
    const routerFile = findFile(srcPath, ['src/router/index.ts', 'src/router.ts', 'src/router/index.js']);
    return {
      type: 'vue-router',
      label: 'Vue Router',
      routerFile,
      componentRoot: path.join(srcPath, 'src'),
      dialogGlob: '**/*Dialog*.vue',
    };
  }

  // Angular
  if (deps['@angular/router']) {
    return {
      type: 'angular',
      label: 'Angular Router',
      componentRoot: path.join(srcPath, 'src', 'app'),
      dialogGlob: '**/*dialog*.component.html',
    };
  }

  // ── 3. Fallback — check folder structure ───────────────────────────────────

  if (fs.existsSync(path.join(srcPath, 'app'))) {
    return {
      type: 'nextjs-app',
      label: 'Next.js (App Router — inferred from folder)',
      routeRoot: path.join(srcPath, 'app'),
      componentRoot: srcPath,
      dialogGlob: '**/*Dialog*.{tsx,jsx}',
    };
  }

  return {
    type: 'unknown',
    label: 'Unknown — could not detect framework',
    componentRoot: srcPath,
    dialogGlob: '**/*Dialog*.{tsx,jsx}',
  };
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function findRouterFile(srcDir) {
  const candidates = [
    'App.tsx', 'App.jsx',
    'router.tsx', 'router.jsx',
    'routes.tsx', 'routes.jsx',
    'Router.tsx', 'Router.jsx',
  ];
  for (const c of candidates) {
    const full = path.join(srcDir, c);
    if (fs.existsSync(full)) return full;
  }
  // Deeper search — check one level down
  for (const c of candidates) {
    for (const sub of ['router', 'routes', 'navigation']) {
      const full = path.join(srcDir, sub, c);
      if (fs.existsSync(full)) return full;
    }
  }
  return null;
}

function findFile(base, candidates) {
  for (const c of candidates) {
    const full = path.join(base, c);
    if (fs.existsSync(full)) return full;
  }
  return null;
}
