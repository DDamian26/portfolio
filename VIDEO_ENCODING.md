# Video encoding spec (Before/After + Portfolio clips)

All MP4s served from `/public/videos/` must be encoded to this spec. It is the
lowest common denominator that plays inline on **iOS Safari / iOS Chrome**
(both WebKit), Android Chrome, and desktop. If a clip renders as a black card
or refuses to play on an iPhone, it almost always violates one of these rules —
re-export before touching the player code.

## Required spec

| Setting            | Value                                             |
| ------------------ | ------------------------------------------------- |
| Container          | MP4                                               |
| Video codec        | H.264 (AVC)                                        |
| Profile            | High or Main (**not** High 4:2:2 / High 10)       |
| Bit depth          | 8-bit                                             |
| Chroma subsampling | 4:2:0 (`yuv420p`)                                 |
| Audio codec        | AAC-LC                                            |
| Web optimization   | `faststart` (moov atom at the front)             |
| Pixel aspect       | Square pixels (1:1)                              |

## Must NOT use

- ❌ **HEVC / H.265** — inconsistent inline support on iOS, fails elsewhere.
- ❌ **10-bit** (e.g. `yuv420p10le`) — iOS will not decode inline.
- ❌ **4:2:2 chroma** (`yuv422p`, "High 4:2:2 profile") — the single most
  common cause of a black `<video>` on iOS. Editing/export presets aimed at
  ProRes-style masters often emit this. Always down-sample to 4:2:0.
- ❌ Missing `faststart` — the file may still play but only after a full
  download, breaking first-frame paint and lazy loading.

## Reference ffmpeg command

Re-encode any source into a compliant file:

```sh
ffmpeg -i input.mov \
  -c:v libx264 -profile:v high -pix_fmt yuv420p \
  -crf 20 -preset slow \
  -c:a aac -b:a 128k \
  -movflags +faststart \
  output.mp4
```

`-pix_fmt yuv420p` is the critical flag — it forces 8-bit 4:2:0 regardless of
the source, which is what fixes the iOS black-card case.

## Verify a file

```sh
ffprobe -v error -select_streams v:0 \
  -show_entries stream=codec_name,profile,pix_fmt,bits_per_raw_sample \
  -of default=noprint_wrappers=1 output.mp4
```

Expected output:

```
codec_name=h264
profile=High            # or Main
pix_fmt=yuv420p         # NOT yuv422p / yuv420p10le
bits_per_raw_sample=8   # (may be blank; 8-bit is the default for yuv420p)
```

## The six Before/After files

Row order and paths (also defined in `src/sections/BeforeAfter.jsx` → `ROW_VIDEOS`):

- `/public/videos/color-raw.mp4`, `/public/videos/color-edited.mp4`
- `/public/videos/pacing-raw.mp4`, `/public/videos/pacing-edited.mp4`
- `/public/videos/sound-raw.mp4`, `/public/videos/sound-edited.mp4`

Each raw/edited pair should be the same duration (the player loops on the
shorter of the two and re-syncs any drift, but matched lengths look cleanest).
