#!/usr/bin/env bash
set -euo pipefail

# Export Mermaid .mmd files in docs/diagrams to PNG and SVG using mmdc (mermaid-cli)
# Usage: sh docs/diagrams/export_diagrams.sh

DIAGRAM_DIR="$(cd "$(dirname "$0")" && pwd)"
OUT_DIR="$DIAGRAM_DIR/output"
mkdir -p "$OUT_DIR"

# Ensure mmdc exists
if ! command -v mmdc >/dev/null 2>&1; then
  echo "mermaid-cli (mmdc) not found. Installing globally with npm..."
  if ! command -v npm >/dev/null 2>&1; then
    echo "npm not found. Please install Node.js/npm and re-run this script." >&2
    exit 1
  fi
  npm install -g @mermaid-js/mermaid-cli
fi

# List input files and map to base names (POSIX-compliant)
for src in \
  "architecture.flowchart.mmd" \
  "BD.erDiagram.mmd" \
  "deployment.flowchart.mmd"; do
  case "$src" in
    architecture.flowchart.mmd) base="architecture" ;;
    erd.erDiagram.mmd) base="erd" ;;
    deployment.flowchart.mmd) base="deployment" ;;
    *) base="${src%.*}" ;;
  esac
  srcpath="$DIAGRAM_DIR/$src"
  if [ ! -f "$srcpath" ]; then
    echo "Skipping $srcpath (not found)"
    continue
  fi

  svg_out="$OUT_DIR/${base}.svg"

  echo "Rendering $srcpath -> $svg_out"
  # render SVG
  mmdc -i "$srcpath" -o "$svg_out" || { echo "Failed to render SVG for $srcpath"; exit 1; }

done

echo "All diagrams exported to $OUT_DIR"
