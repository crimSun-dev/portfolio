# Tasks

## 1. Media

- [x] 1.1 Encode `knity.mp4` to `assets/video/knity.mp4`, `knity.webm`, and poster `knity.webp`. Full 30.7s, 720 wide, 30fps, no audio.
- [x] 1.2 Encode `ccg (1).mp4` to `assets/video/ccg.mp4`, `ccg.webm`, and poster `ccg.webp` on the same settings. Full 26.8s.
- [x] 1.3 Export the K PNG to `assets/img/knity-mark.webp` and the C PNG to `assets/img/ccg-mark.webp`: transparent field, glyph and sparkle kept, 320px square.
- [x] 1.4 Videos 0.27–1.4 MB; marks 11 KB and 21 KB. K foot and sparkle opaque.

## 2. Markup and layout

- [x] 2.1 Retarget the k-nity `<video>` and `.tile-mark` at the new files. Href, title, caption, and `aria-label` unchanged.
- [x] 2.2 Replace the Bay 02 item with the CK Coaching Group link (`https://ajarin.org`, new tab, `rel="noopener"`, caption `ajarin.org` only, mark `alt=""`).
- [x] 2.3 Two equal columns via `.tiles.webdev`; narrow-breakpoint rule moved to the same selector so it still wins. Stylesheet query string bumped.

## 3. Remove the masters

- [x] 3.1 `web-01.*` removed. Masters moved out of `assets/` to `websites video teasers/masters/` (git-ignored) instead of deleted.
- [x] 3.2 `file_0000000014688211a8373165042355c6.png` untouched. The timestamped mp4s were no longer in `assets/video/`.

## 4. Check

- [x] 4.1 Headless Chrome at 1440px: both videos play in view, both marks above the picture, two 577px columns.
- [x] 4.2 At 600px the row is one column; both tiles are `<a>` elements in tab order.
- [x] 4.3 Requests include only `knity.*` / `ccg.*` derivatives and the two marks; no `web-01`, `ChatGPT Image`, `Neon Faceted`, or `ccg (1)` URL.
