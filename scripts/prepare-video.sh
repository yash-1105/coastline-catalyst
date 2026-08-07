#!/usr/bin/env bash
# Crop the Veo watermark and re-encode for frame-accurate scroll scrubbing.
#
# Usage: ./scripts/prepare-video.sh IN OUT [width] [crf] [precrop]
#   ./scripts/prepare-video.sh raw-video/hero-coastline.mp4 public/video/hero-coastline.mp4 1280
#
#   precrop  optional ffmpeg crop applied BEFORE the watermark crop, for
#            sources that arrive letterboxed. open-water.mp4 is 2.39:1 content
#            inside a 16:9 frame with 132px black bars, and its watermark sits
#            on the bottom bar, so removing the bars removes the watermark and
#            no further inset is needed:
#              precrop="crop=1920:816:0:132" and width applied after.
set -euo pipefail

IN="$1"; OUT="$2"; W="${3:-1600}"; CRF="${4:-22}"; PRECROP="${5:-}"
mkdir -p "$(dirname "$OUT")"

# crop keeps the central 80% of the frame, removing 10% from every edge.
# The clips were generated with an intentionally empty 12% margin, so this
# loses no composition and takes the bottom-right watermark with it.
CROP="crop=iw*0.80:ih*0.80:iw*0.10:ih*0.10"

# A letterboxed source has already lost its watermark with the bars, so the
# 80% inset would only throw away real picture.
if [ -n "$PRECROP" ]; then
  VF="${PRECROP},scale=${W}:-2"
else
  VF="${CROP},scale=${W}:-2"
fi

# -g 1 -keyint_min 1 -sc_threshold 0 puts a keyframe on every frame. Without
# it the decoder replays intermediate frames on each seek and scrubbing
# stutters no matter how well the component is written. It is also why these
# files are large for their length: every frame is an I-frame.
ffmpeg -y -i "$IN" \
  -vf "$VF" \
  -c:v libx264 -crf "$CRF" \
  -g 1 -keyint_min 1 -sc_threshold 0 \
  -pix_fmt yuv420p \
  -movflags +faststart \
  -an \
  "$OUT"

printf '%s -> %s  %s\n' "$IN" "$OUT" "$(du -h "$OUT" | cut -f1)"
