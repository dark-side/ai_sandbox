#!/usr/bin/env node
/**
 * PayFlow Learning App — local file server.
 *
 * Serves the SPA from learning-app/ and exposes three JSON API endpoints
 * that read exercise/solution content directly from the repo on disk,
 * so every edit to exercises/ is reflected on the next browser refresh.
 *
 * Port: 3737  (avoids common dev-port conflicts)
 */

'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3737;
const REPO_ROOT = path.resolve(__dirname, '..');
const APP_DIR = __dirname;

// ─── MIME types ────────────────────────────────────────────────────────────
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.md':   'text/plain; charset=utf-8',
  '.png':  'image/png',
  '.ico':  'image/x-icon',
};

// ─── Section directory mapping ──────────────────────────────────────────────
const SECTION_DIRS = {
  'section-01': 'section-01-agent-decision',
  'section-02': 'section-02-spec',
  'section-03': 'section-03-evals',
  'section-04': 'section-04-workflow-model',
  'section-05': 'section-05-context',
  'section-06': 'section-06-cost',
  'section-07': 'section-07-security',
  'section-08': 'section-08-observability',
  'section-09': 'section-09-packaging',
  'section-10': 'section-10-scheduled',
  'section-11': 'section-11-multiagent',
  'section-12': 'section-12-maturity',
};

// ─── Helpers ────────────────────────────────────────────────────────────────
function readFileSafe(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch {
    return null;
  }
}

function json(res, data, status = 200) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data));
}

function notFound(res, msg = 'Not found') {
  json(res, { error: msg }, 404);
}

// ─── API handlers ───────────────────────────────────────────────────────────

/**
 * GET /api/sections
 * Returns a list of all section IDs and their directory names.
 */
function handleSections(res) {
  const sections = Object.entries(SECTION_DIRS).map(([id, dir]) => ({ id, dir }));
  json(res, sections);
}

/**
 * GET /api/exercise/:sectionId
 * Reads README.md and hints.md from exercises/<dir>/ and returns both as JSON.
 */
function handleExercise(sectionId, res) {
  const dir = SECTION_DIRS[sectionId];
  if (!dir) return notFound(res, `Unknown section: ${sectionId}`);

  const exerciseDir = path.join(REPO_ROOT, 'exercises', dir);
  const readme = readFileSafe(path.join(exerciseDir, 'README.md'));
  const hints  = readFileSafe(path.join(exerciseDir, 'hints.md'));

  if (!readme) return notFound(res, `Exercise README not found for ${sectionId}`);

  json(res, { sectionId, readme, hints: hints || null });
}

/**
 * GET /api/solution/:sectionId
 * Reads all files from solutions/<dir>/ and returns them as an array of { name, content }.
 */
function handleSolution(sectionId, res) {
  const dir = SECTION_DIRS[sectionId];
  if (!dir) return notFound(res, `Unknown section: ${sectionId}`);

  const solutionDir = path.join(REPO_ROOT, 'solutions', dir);

  let files = [];
  try {
    files = fs.readdirSync(solutionDir, { withFileTypes: true })
      .filter(e => e.isFile())
      .map(e => ({
        name: e.name,
        content: readFileSafe(path.join(solutionDir, e.name)) || '',
      }));
  } catch {
    // Directory may not exist yet — that's fine
  }

  json(res, { sectionId, files });
}



// ─── Static file handler ────────────────────────────────────────────────────
function handleStatic(urlPath, res) {
  // Default to index.html for SPA root
  const filePath = urlPath === '/' || urlPath === ''
    ? path.join(APP_DIR, 'index.html')
    : path.join(APP_DIR, urlPath);

  // Security: prevent directory traversal outside APP_DIR
  if (!filePath.startsWith(APP_DIR)) {
    res.writeHead(403); res.end('Forbidden'); return;
  }

  const ext = path.extname(filePath);
  const mime = MIME[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      // For SPA: fall back to index.html on 404 so client-side routing works
      fs.readFile(path.join(APP_DIR, 'index.html'), (e2, d2) => {
        if (e2) { res.writeHead(404); res.end('Not found'); return; }
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(d2);
      });
      return;
    }
    res.writeHead(200, { 'Content-Type': mime });
    res.end(data);
  });
}

// ─── Main router ────────────────────────────────────────────────────────────
const server = http.createServer((req, res) => {
  // CORS for local development
  res.setHeader('Access-Control-Allow-Origin', '*');

  const url = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = url.pathname;

  if (pathname === '/api/sections') {
    return handleSections(res);
  }


  const exerciseMatch = pathname.match(/^\/api\/exercise\/(section-\d+)$/);
  if (exerciseMatch) return handleExercise(exerciseMatch[1], res);

  const solutionMatch = pathname.match(/^\/api\/solution\/(section-\d+)$/);
  if (solutionMatch) return handleSolution(solutionMatch[1], res);

  // Static file fallback
  handleStatic(pathname, res);
});

server.listen(PORT, '127.0.0.1', () => {
  console.log('');
  console.log('  ╔══════════════════════════════════════════════╗');
  console.log('  ║   PayFlow Learning App                       ║');
  console.log('  ║                                              ║');
  console.log(`  ║   http://localhost:${PORT}                  ║`);
  console.log('  ║                                              ║');
  console.log('  ║   Press Ctrl+C to stop                       ║');
  console.log('  ╚══════════════════════════════════════════════╝');
  console.log('');
});
