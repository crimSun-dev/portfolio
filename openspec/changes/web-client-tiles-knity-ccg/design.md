# Design: Web client tiles — k-nity media and CK Coaching Group

## Technical Approach

ffmpeg, already available on this machine, produces the ship files. HTML stays hand-authored in `index.html`. No build step and no new dependency. `assets/app.js` already plays every `.tile video` when the tile is in view and leaves the poster up until then, so playback code stays as it is.

Measured sources, 7 Nov 2026:

| File | Profile | Size |
|---|---|---|
| `assets/video/knity.mp4` (master) | 1920×1080, 60fps, AAC, 30.7s | 115,180,214 bytes |
| `assets/video/ccg (1).mp4` (master) | 1920×1080, 60fps, AAC, 26.8s | 100,738,134 bytes |
| `assets/video/web-01.mp4` (previous live clip) | 720×406, 30fps, no audio, 8.5s | 248,109 bytes |

Delivered, 7 Nov 2026 (720×406, 30fps, no audio, full duration):

| File | Size |
|---|---|
| `assets/video/knity.mp4` (H.264, CRF 27, faststart) | 1,393,941 bytes |
| `assets/video/knity.webm` (VP9, CRF 38) | 949,398 bytes |
| `assets/video/knity.webp` (poster, frame at 1.5s) | 12,632 bytes |
| `assets/video/ccg.mp4` | 338,891 bytes |
| `assets/video/ccg.webm` | 272,327 bytes |
| `assets/video/ccg.webp` | 7,454 bytes |
| `assets/img/knity-mark.webp` (320×320, alpha) | 10,984 bytes |
| `assets/img/ccg-mark.webp` (320×320, alpha) | 21,412 bytes |

Marks: alpha thresholded at 128, morphologically opened, small components dropped, edge feathered, cropped to the glyph and padded to a square. The colored speckle in the black field falls out at the threshold; the K's blue foot and the sparkle stay opaque.

## Architecture Decisions

### Decision: Process masters before they are referenced

The two masters are about 400 times the previous k-nity clip; that measurement is the reason to encode. A CSS scale on a 110 MB file would leave the download intact, and ffmpeg is already on the machine (PRODUCT.md forbids a build step).

(Rejected: pointing `<source>` at `knity.mp4` and `ccg (1).mp4` — roughly 200 MB of 60fps video with audio, and a filename containing a space.)

### Decision: Organization name is the title; the host is the href

"CK Coaching Group" is the bold title and `https://ajarin.org` the href, because the host is temporary. One caption locator, `ajarin.org`, sits under the title and changes in the same edit as the href.

### Decision: No client sentence for CK Coaching Group

PRODUCT.md forbids claims that do not trace to the résumé or a supplied fact. The supplied facts are the name and `ajarin.org`.

### Decision: Mark is decorative; the link name carries the identity

`alt=""` on both marks; the title in the tile foot names the client. The video keeps one `aria-label` ("Walkthrough of k-nity.com…" unchanged; "Recording of the CK Coaching Group site" for the new tile).

### Decision: Two equal columns, bay removed from this list

`.webdev` becomes `repeat(2, minmax(0,1fr))`. **Found during apply:** the later `.tiles{grid-template-columns:repeat(auto-fit,…)}` rule has the same specificity and was silently overriding `.webdev`. Both the desktop rule and the existing narrow-breakpoint rule are now `.tiles.webdev`, so the intended tracks apply and the breakpoint still stacks the row to one column. The cascade otherwise stays desktop-first.

### Decision: Masters leave the site tree, not the machine

GitHub Pages deploys what is committed. The masters are moved to `websites video teasers/masters/` (now in `.gitignore`, like `Game video teasers/`) rather than deleted, so they can be re-encoded later. `web-01.*` is removed with `git rm` and stays recoverable from history.

## File Changes

- `index.html` — k-nity sources and mark; new CK Coaching Group item; Bay 02 removed; stylesheet `?v=20261107`
- `assets/style.css` — `.tiles.webdev` columns (desktop and narrow) and the comment above
- `assets/img/knity-mark.webp` (replaced), `assets/img/ccg-mark.webp` (new)
- `assets/video/knity.{mp4,webm,webp}`, `assets/video/ccg.{mp4,webm,webp}` (new)
- `assets/video/web-01.{mp4,webm,webp}` (deleted)
- `.gitignore` — `websites video teasers/`
