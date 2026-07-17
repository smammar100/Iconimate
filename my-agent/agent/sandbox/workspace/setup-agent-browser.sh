#!/usr/bin/env bash
set -euo pipefail


mkdir -p "${AGENT_BROWSER_ASSETS_DIR:-reports/assets}"
if [ ! -f package.json ]; then
  npm init -y >/dev/null
fi
if [ ! -x node_modules/.bin/agent-browser ]; then
  npm install agent-browser@latest playwright@latest "$@"
fi

install_agent_browser_shim() {
  local bin_dir="/usr/local/bin"
  mkdir -p "$bin_dir"
  cat > "$bin_dir/agent-browser" <<'SHIM'
#!/usr/bin/env bash
exec /workspace/node_modules/.bin/agent-browser "$@"
SHIM
  chmod +x "$bin_dir/agent-browser"
}

install_agent_browser_shim

run_agent_browser_setup_check() {
  if command -v timeout >/dev/null 2>&1; then
    timeout 60s npx agent-browser --session setup-check open about:blank >/tmp/agent-browser-setup-check.log 2>&1
  else
    npx agent-browser --session setup-check open about:blank >/tmp/agent-browser-setup-check.log 2>&1
  fi
}

validate_agent_browser_config() {
  echo "[setup-agent-browser] validating browser launch..."
  if run_agent_browser_setup_check; then
    npx agent-browser --session setup-check close >/dev/null 2>&1 || true
    echo "[setup-agent-browser] browser launch validation passed."
    return 0
  fi

  npx agent-browser --session setup-check close >/dev/null 2>&1 || true
  echo "[setup-agent-browser] browser launch validation failed:" >&2
  cat /tmp/agent-browser-setup-check.log >&2 || true
  rm -f agent-browser.json
  return 1
}

if [ -f .agent-browser-ready ] && validate_agent_browser_config; then
  exit 0
fi
rm -f .agent-browser-ready

install_system_chromium() {
  if ! command -v apt-get >/dev/null 2>&1; then
    return 1
  fi

  export DEBIAN_FRONTEND=noninteractive
  echo "[setup-agent-browser] installing system Chromium..."
  apt-get update
  if ! apt-get install -y --no-install-recommends chromium; then
    return 1
  fi

  CHROMIUM_PATH="$(command -v chromium || command -v chromium-browser || true)"
  if [ -z "$CHROMIUM_PATH" ]; then
    return 1
  fi

  printf '{"executablePath":"%s","args":"--no-sandbox"}\n' "$CHROMIUM_PATH" > agent-browser.json
  echo "[setup-agent-browser] using Chromium at $CHROMIUM_PATH"
  validate_agent_browser_config
}

install_playwright_chromium() {
  echo "[setup-agent-browser] installing Playwright Chromium fallback..."
  npx playwright install --with-deps chromium
  CHROMIUM_PATH="$(node -e "const { chromium } = require('playwright'); console.log(chromium.executablePath())")"
  printf '{"executablePath":"%s","args":"--no-sandbox"}\n' "$CHROMIUM_PATH" > agent-browser.json
  echo "[setup-agent-browser] using Playwright Chromium at $CHROMIUM_PATH"
  validate_agent_browser_config
}

if ! install_system_chromium; then
  echo "[setup-agent-browser] system Chromium unavailable or unusable; falling back to Playwright Chromium..."
  install_playwright_chromium
fi
touch .agent-browser-ready
