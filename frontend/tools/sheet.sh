#!/bin/bash
# A contact sheet: one image showing a clip every half second, each labeled with its time.
# Use it to pick the "moments" (seconds) for a content file.
#
#   tools/sheet.sh <clip> [pictures-per-second]
#
# Example:
#   tools/sheet.sh public/gym/legs/squats.mp4
#   tools/sheet.sh public/gym/legs/squats.mp4 4      ← finer, 4 per second
#
# Saves <clip>-sheet.png next to the clip and opens it.
set -e
CLIP="$1"; RATE="${2:-2}"
if [ -z "$CLIP" ]; then sed -n '2,11p' "$0"; exit 1; fi
OUT="${CLIP%.*}-sheet.png"
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$CLIP")
COUNT=$(python3 -c "import math; print(max(1, math.ceil($DUR * $RATE)))")
ROWS=$(( (COUNT + 5) / 6 ))
ffmpeg -v error -y -i "$CLIP" -vf "fps=$RATE,scale=320:-2,drawtext=text='%{pts\:hms}':x=6:y=6:fontsize=20:fontcolor=yellow:box=1:boxcolor=black@0.6,tile=6x$ROWS" -frames:v 1 "$OUT"
echo "saved $OUT (${DUR%.*}s of clip, $COUNT pictures)"
open "$OUT" 2>/dev/null || true
