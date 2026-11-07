# Proposal: Web client tiles — k-nity media and CK Coaching Group

## Intent

The Web development row still shows the previous k-nity mark and walkthrough, and its second cell is an empty bay. Replace that k-nity media with the new mark and recording, and fill the row with a second client, CK Coaching Group, whose public URL is temporary.

## Scope

In scope:

- Point the existing k-nity tile at a processed mark and a processed recording from `assets/img/Neon Faceted K with Sparkle.png` and `assets/video/knity.mp4`.
- Add one tile in that same list for CK Coaching Group, using a processed mark and recording from `assets/img/ChatGPT Image 17 Oct 2026, 17_13_54.png` and `assets/video/ccg (1).mp4`, linking to `https://ajarin.org`.
- Make the two client tiles equal columns. Remove the "Bay 02 / More coming soon" cell from this list.
- Encode and export before any HTML reference. The page must not request the 100 MB masters or the raw PNGs.

Out of scope:

- Rewriting the k-nity sentence or `https://k-nity.com`.
- Rewriting the section line "Full-stack client work. Front end, back end, database, deploy."
- Inventing what CK Coaching Group does, where it is, or what stack it uses.
- A new heading, page, or route. This stays one tile inside Web development.
- Game tiles, Unity tiles, `assets/app.js` playback, and the unreferenced files `assets/img/file_0000000014688211a8373165042355c6.png`, `assets/video/2026-11-07 12-30-30.mp4`, and `assets/video/2026-11-07 12-31-43.mp4`.
- A site-wide `prefers-reduced-motion` change for video. The new tile uses the same muted, poster-backed tile the row already uses.

## Approach

Process each master with ffmpeg into the teaser contract the row already ships: a silent 720-wide H.264 MP4, a silent VP9 WebM, and a WebP poster. Export each mark to a small transparent WebP. Markup then matches the current k-nity tile, with the organization name as the visible title and the URL in one place.
