#!/bin/bash
# Make a cutout (PNG frames with no background) from part of a clip.
#
#   tools/cutout.sh <clip> <start-second> <length-seconds> <output-folder> [width]
#
# Example (DISCIPLINE hero, 16:9):
#   tools/cutout.sh public/gym/legs/hero.mp4 0 3.4 public/gym/legs/hero-cutout
# Example (shoulders, 4:3 edit):
#   tools/cutout.sh public/gym/shoulders/opening.mp4 2.4 1.4 public/gym/shoulders/her-cutout 1440
#
# Run from the frontend folder. Needs ffmpeg and rembg (~/rembg-env).
set -e
CLIP="$1"; START="$2"; LEN="$3"; OUT="$4"; WIDTH="${5:-1920}"
if [ -z "$OUT" ]; then sed -n '2,12p' "$0"; exit 1; fi
source ~/rembg-env/bin/activate
TMP=$(mktemp -d)
echo "extracting frames…"
ffmpeg -v error -ss "$START" -t "$LEN" -i "$CLIP" -vf "fps=30,scale=${WIDTH}:-2" "$TMP/%04d.png"
mkdir -p "$OUT"
echo "removing backgrounds (this takes a few minutes)…"
rembg p -m u2net_human_seg "$TMP" "$OUT"
rm -rf "$TMP"
echo "done: $(ls "$OUT" | wc -l | tr -d ' ') frames in $OUT  ← use this as the cutout's count"
