#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# PayFlow AI Practice — Learning Portal launcher
#
# Usage:  ./start-learning-app.sh
#
# What it does:
#   1. Checks Node.js 18+
#   2. Installs npm packages in learning-app/ if needed
#   3. Starts the API server  (port 3737) in the background
#   4. Starts the Vite UI dev server (port 5173) — opens browser automatically
#   5. Ctrl+C stops both processes cleanly
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$SCRIPT_DIR/learning-app"
API_PORT=3737
UI_PORT=5173

# ── Colors ───────────────────────────────────────────────────────────────────
CYAN='\033[0;36m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
RED='\033[0;31m'; BOLD='\033[1m'; RESET='\033[0m'

info()  { echo -e "${CYAN}  →${RESET} $*"; }
ok()    { echo -e "${GREEN}  ✓${RESET} $*"; }
warn()  { echo -e "${YELLOW}  !${RESET} $*"; }
error() { echo -e "${RED}  ✗ ${RESET} $*" >&2; }

echo ""
echo -e "${BOLD}  PayFlow AI Practice — Learning Portal${RESET}"
echo -e "  ${CYAN}────────────────────────────────────────${RESET}"
echo ""

# ── Check Node.js ─────────────────────────────────────────────────────────────
if ! command -v node &>/dev/null; then
  error "Node.js not found. Install from https://nodejs.org or via: brew install node"
  exit 1
fi

NODE_MAJOR=$(node -e "process.stdout.write(process.versions.node.split('.')[0])")
NODE_VER=$(node --version)

if [ "$NODE_MAJOR" -lt 18 ]; then
  warn "Node.js $NODE_VER detected. Version 18+ is recommended."
else
  ok "Node.js $NODE_VER"
fi

# ── Install dependencies if needed ────────────────────────────────────────────
if [ ! -d "$APP_DIR/node_modules" ]; then
  info "Installing dependencies (first run only)..."
  npm install --prefix "$APP_DIR" --silent
  ok "Dependencies installed"
else
  ok "Dependencies ready"
fi

# ── Free ports if still in use from a previous run ───────────────────────────
lsof -ti:$API_PORT | xargs kill -9 2>/dev/null || true
lsof -ti:$UI_PORT  | xargs kill -9 2>/dev/null || true
sleep 0.3

# ── PID tracking ─────────────────────────────────────────────────────────────
API_PID=""
UI_PID=""

cleanup() {
  echo ""
  echo -e "${YELLOW}  Stopping servers...${RESET}"
  [ -n "$API_PID" ] && kill "$API_PID" 2>/dev/null || true
  [ -n "$UI_PID"  ] && kill "$UI_PID"  2>/dev/null || true
  echo -e "${CYAN}  Done.${RESET}"
  echo ""
}
trap cleanup EXIT INT TERM

# ── Start API server ─────────────────────────────────────────────────────────
info "Starting API server on port $API_PORT..."
node "$APP_DIR/server.js" &
API_PID=$!
sleep 0.6

if ! kill -0 "$API_PID" 2>/dev/null; then
  error "API server failed to start. Check learning-app/server.js"
  exit 1
fi
ok "API server running (PID $API_PID)"

# ── Start Vite dev server ─────────────────────────────────────────────────────
info "Starting Vite UI server on port $UI_PORT..."
npm run dev --prefix "$APP_DIR" &
UI_PID=$!
sleep 2

if ! kill -0 "$UI_PID" 2>/dev/null; then
  error "Vite server failed to start. Try: cd learning-app && npm run dev"
  exit 1
fi
ok "Vite server running  (PID $UI_PID)"

echo ""
echo -e "  ${BOLD}Learning portal:${RESET} ${CYAN}http://localhost:$UI_PORT${RESET}"
echo -e "  ${BOLD}API server:${RESET}      ${CYAN}http://localhost:$API_PORT${RESET}"
echo ""
echo -e "  Press ${BOLD}Ctrl+C${RESET} to stop"
echo ""

# ── Wait for both processes ───────────────────────────────────────────────────
wait $API_PID $UI_PID
