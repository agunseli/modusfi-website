#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

if [[ ! -f package.json ]]; then
  echo "Error: package.json not found at repository root." >&2
  exit 1
fi

if [[ ! -d node_modules ]]; then
  echo "Error: node_modules missing. Run npm ci first." >&2
  exit 1
fi

has_script() {
  node -e 'const p=require("./package.json"); process.exit(p.scripts && p.scripts[process.argv[1]] ? 0 : 1)' "$1"
}

echo '== Production build =='
npm run build

if has_script check; then
  echo '== Project check =='
  npm run check
else
  echo '== Project check: skipped (no npm check script) =='
fi

if has_script lint; then
  echo '== Lint =='
  npm run lint
else
  echo '== Lint: skipped (no npm lint script) =='
fi

if [[ -x node_modules/.bin/prettier ]]; then
  echo '== Prettier check =='
  # Check existing tracked and new source files; exclude deleted and ignored files.
  files=()
  while IFS= read -r -d '' file; do
    if [[ -f "$file" ]]; then
      files+=("$file")
    fi
  done < <(git ls-files --cached --others --exclude-standard -z -- '*.astro' '*.css' '*.ts' '*.tsx' '*.js' '*.mjs' '*.json' '*.md' '*.mdc' ':!:package-lock.json')
  if (( ${#files[@]} > 0 )); then
    node_modules/.bin/prettier --check -- "${files[@]}"
  else
    echo 'Prettier: no matching tracked files.'
  fi
else
  echo '== Prettier: skipped (not installed locally) =='
fi

echo '== Checks completed =='
