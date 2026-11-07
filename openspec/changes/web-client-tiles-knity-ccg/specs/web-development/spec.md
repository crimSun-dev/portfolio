# Delta spec: `specs/web-development/spec.md`

## ADDED Requirements

### Requirement: CK Coaching Group tile

The Web development list MUST include a second client tile named CK Coaching Group. The tile MUST link to `https://ajarin.org` in a new tab with `rel="noopener"`. The visible title MUST be the organization name. The host MUST appear only as the link target and, if shown, as a single locator string in the caption.

#### Scenario: Tile is present and named

- GIVEN the Web development list
- WHEN the page is read
- THEN a link titled CK Coaching Group is present
- AND its href is `https://ajarin.org`
- AND the title text is CK Coaching Group

#### Scenario: Caption states only the supplied facts

- GIVEN no description of the client was supplied beyond the name and the current host
- WHEN the caption is rendered
- THEN it contains no claim about services, stack, location, team, or results
- AND the only host string it may contain is `ajarin.org`

#### Scenario: Later domain change is a single edit

- GIVEN the public URL is expected to change
- WHEN that URL is updated
- THEN the href and the locator string are the only strings that change
- AND the visible title stays CK Coaching Group

### Requirement: Delivered media budget

A Web development tile MUST NOT reference a source recording or a source PNG. Each tile MUST use a silent MP4, a silent WebM, and a WebP poster, plus a transparent WebP mark. Referenced recordings MUST stay in the same size class as the current teaser clips (hundreds of kilobytes to a few megabytes for the full take).

#### Scenario: Masters are not requested

- GIVEN the processed files exist
- WHEN the document is loaded
- THEN no request URL contains `ccg (1).mp4`, `Neon Faceted K with Sparkle.png`, or `ChatGPT Image`
- AND no referenced video is the 1080p 60fps master

#### Scenario: Poster stands in before playback

- GIVEN a tile video with `preload="none"`
- WHEN the tile has not yet played
- THEN the WebP poster is the visible frame
- AND the mark remains visible above the video

## MODIFIED Requirements

### Requirement: k-nity media

The k-nity tile MUST keep `https://k-nity.com`, the visible title `k-nity.com`, and the existing caption. Its mark and its recording MUST be the processed derivatives of the newly supplied K mark and `knity.mp4`. (Previously: `assets/img/knity-mark.webp` and `assets/video/web-01.{mp4,webm,webp}`.)

#### Scenario: Identity unchanged, media replaced

- GIVEN the k-nity tile
- WHEN the page is read
- THEN the link target, title, and caption are unchanged
- AND the video sources and the mark `src` point at the new processed files
- AND the previous `web-01` files are no longer referenced

### Requirement: Web development row layout

The Web development list MUST show two equal client tiles at the desktop width, and one column at the existing narrow breakpoint. (Previously: one client tile beside a narrower "Bay 02 / More coming soon" cell.)

#### Scenario: Placeholder bay is gone from this list

- GIVEN the Web development list
- WHEN the list is read
- THEN it contains the k-nity tile and the CK Coaching Group tile
- AND it contains no "More coming soon" bay

## REMOVED Requirements

### Requirement: Web development Bay 02

The placeholder cell in this list is removed because the second cell is now a real client. The "More coming soon" bays in Running builds and Unity are unchanged.
