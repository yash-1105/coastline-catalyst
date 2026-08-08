#!/usr/bin/env bash
# Build the mobile variant of a clip.
#
# Usage: ./scripts/prepare-video-mobile.sh IN OUT [width] [crf] [precrop]
#   ./scripts/prepare-video-mobile.sh raw-video/hero-coastline.mp4 \
#       public/video/hero-coastline.mobile.mp4 720 28
#
# WHY THIS IS A SEPARATE SCRIPT
#
# The desktop encode puts a keyframe on every frame so scroll scrubbing can
# seek anywhere instantly. That is what makes those files ~8MB for 8 seconds.
#
# Below 900px nothing scrubs: the footage loops on its own clock, so it plays
# start to finish and never seeks. A normal keyframe interval is therefore
# fine, and it is the single biggest saving available. Combined with a smaller
# frame and a higher CRF, the mobile files come out roughly a tenth the size,
# on exactly the connections least able to afford the bytes.
set -euo pipefail

IN="$1"; OUT="$2"; W="${3:-720}"; CRF="${4:-28}"; PRECROP="${5:-}"

mkdir -p "$(dirname "$OUT")"

CROP="crop=iw*0.80:ih*0.80:iw*0.10:ih*0.10"
if [ -n "$PRECROP" ]; then
  VF="${PRECROP},scale=${W}:-2"
else
  VF="${CROP},scale=${W}:-2"
fi

# No -g 1 here, deliberately. See the note above.
ffmpeg -y -i "$IN" \
  -vf "$VF" \
  -c:v libx264 -crf "$CRF" -preset slow \
  -profile:v main -level 4.0 \
  -pix_fmt yuv420p \
  -movflags +faststart \
  -an \
  "$OUT"

printf '%s -> %s  %s\n' "$IN" "$OUT" "$(du -h "$OUT" | cut -f1)"
