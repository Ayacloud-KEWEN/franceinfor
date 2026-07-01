#!/usr/bin/env bash
# Daily Knowledge OS refresh + opportunity digest.
# Hits the app's cron endpoints in order, authenticated with CRON_SECRET read
# from .env. Uses Node's global fetch (no curl/wget dependency).
#
# Install (root crontab, runs 06:00 server time):
#   crontab -e
#   0 6 * * * /home/france-infor/htdocs/infr.europeanaialliance.org/scripts/daily-cron.sh >> /var/log/francego-cron.log 2>&1
set -uo pipefail

# Repo root = parent of this script's dir.
REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_DIR"

# Make node available under cron's minimal PATH (nvm if present, else system).
export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" >/dev/null 2>&1 || true

BASE="${APP_BASE_URL:-https://francego.fr}"
KEY="$(grep -E '^CRON_SECRET=' .env | cut -d= -f2- | tr -d '"'\''')"
if [ -z "$KEY" ]; then
  echo "$(date -Is) ERROR: CRON_SECRET not found in $REPO_DIR/.env" >&2
  exit 1
fi

export BASE KEY
hit() {
  node -e "fetch(process.env.BASE+'/api/'+process.argv[1]+'?key='+process.env.KEY).then(r=>r.text()).then(t=>console.log(new Date().toISOString(), process.argv[1], t)).catch(e=>{console.error(new Date().toISOString(), process.argv[1], 'ERR', e.message); process.exit(0);})" "$1"
}

# Order matters: ingest -> index (embeddings) -> extract (graph) -> digest (email).
hit cron/ingest
hit cron/index
hit cron/extract
hit cron/digest
