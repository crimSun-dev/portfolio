# Design

<!-- impeccable:design-schema 1 -->

This file records the visual system **as it exists in the code**, not as it was
intended. Where a file disagrees with the direction contract at the top of
`index.html` or with `PRODUCT.md`, the code is treated as the truth and the
disagreement is written down under [Known drift](#known-drift).

Files that define this surface:

| File | Role |
| --- | --- |
| `index.html` | Structure, copy, the direction contract (HTML comment, lines 25–32) |
| `assets/style.css` | Every token, component and responsive rule. 678 lines. |
| `assets/ink-vars.css` | **Generated.** Three brush shapes as CSS custom properties. |
| `assets/ink.js` | **Generated.** `window.INK` — 11 SVG path strings / arrays. |
| `assets/app.js` | Mark assembly, the hero timeline, scroll behaviour, the cursor. |
| `assets/hud.js` | The instrument rig (SVG) and the atmosphere field (canvas). |
| `_gen_ink.py` | Source of all brush geometry. Writes the two generated files. |

`ink-vars.css` and `ink.js` are build output. **Never hand-edit them.**

> ⚠️ **This document is partially stale.** Sections below `## Atmosphere` were
> written against the earlier sumi-e world and have not been re-derived since the
> surface was rebuilt as the crimSun command interface. Specifically: the display
> face is now **Michroma**, not Zen Old Mincho; the accent ramp is the flame ramp
> (`--crim` / `--ember` / `--solar`), not hanko vermilion; the masthead carries a
> **scouter**; and the page has gained a photo slideshow, video teaser tiles, a
> Ravey gallery with a lightbox, and this atmosphere field. **Rule 1 below ("no
> glow, grain only") has been deliberately superseded** by the brief-pinned HUD
> direction. Re-run the documenter before trusting anything past this banner.
> The `## Atmosphere` section immediately below is current.

---

## Atmosphere

*A living solar-circuit under a command deck.* The void is not empty black; it
is an instrument substrate. Four fixed, `pointer-events:none`, `aria-hidden`
layers sit under `main` and the masthead, all below `z-index: 3`.

| Layer | Element | z | Cost |
| --- | --- | --- | --- |
| Solar-circuit field | `canvas.field` | 0 | canvas, ~28fps ceiling |
| Deep heat | `.veil` | 0 | CSS radials, 34s drift |
| Instrument sweep | `.scan` | 1 | CSS translate, 11s |
| Paper tooth | `.grain` | 2 | CSS `steps(1)`, >900px only |

### The field, back to front

Built in `assets/hud.js`. One canvas, one `requestAnimationFrame`.

1. **Circuit substrate.** Sparse PCB traces walked on a 26px grid — orthogonal
   runs with a ~26% chance of a 45° elbow, terminated by pads, with a via ring
   on roughly 40% of runs. Run count scales with viewport area, clamped to
   10–46. Rendered **once per resize into an offscreen buffer**, so it costs a
   single `drawImage` per frame, not a redraw.
2. **Lava buoyancy.** 3–6 blobs, radius 190–420px, rising at 0.055–0.13px/frame
   with a sinusoidal lateral drift. Drawn from **one cached radial sprite**
   under `globalCompositeOperation: 'lighter'`, so overlapping blobs merge like
   a lava lamp without metaballs and without a per-frame gradient allocation.
3. **Plasma filaments.** Five slowly rotating gradient threads, transparent at
   both ends.
4. **Charge and embers.** Every 2.2–5.8s one charge fires along a **real trace
   polyline** from the substrate — a six-segment crimson tail behind a solar
   head with a plasma core. Maximum three in flight. Plus up to 52 rising motes.

### The quiet zone

After every frame, a `destination-out` linear gradient removes **60% of alpha
through the centre column, tapering to 0% at both edges**. Density is therefore
always lowest where content reads and highest in the empty margins — no scroll
tracking required, correct at every scroll position.

### Opacity budget

Change these deliberately; they are the reason text still wins.

| Constant | Value | Applies to |
| --- | --- | --- |
| `A_TRACE` | `0.075` | circuit trace stroke |
| `A_PAD` | `0.13` | pads and via rings |
| `A_BLOB` | `0.052` | each lava blob (additive) |
| `A_FIL` | `0.05` | filament midpoint |
| `A_MOTE` | `0.5` | ember peak, on sub-2px dots |
| `.field` | `opacity .9` | whole canvas (`.55` ≤900px, `.6` reduced-motion) |

**Palette lock: the flame ramp only.** `#FF2E1F` → `#FF7A16` → `#FFC21A`, with
`#FFF0D6` permitted at charge-head cores. No other hue may enter this layer.
**No `filter: blur()`** anywhere in the field — depth comes from opacity, the
additive sprite, grain and the quiet-zone mask, never from glow fog.

### Degradation

- `prefers-reduced-motion: reduce` **or** ≤900px → the substrate is painted
  **once**, the quiet zone is applied, and no loop starts. Phones get the
  circuit world with zero animation cost.
- `document.hidden` → the loop stops and resumes with a reset clock.
- Resize → debounced 200ms, substrate rebuilt, bodies reseeded.
- No JS → no canvas content. The page is unaffected; the field is decoration.

---

## Visual world

Sumi-e (Japanese ink painting) laid over urushi lacquerware. The page is a
black lacquer ground `#0A0A0C` carrying shell-white ink `#F2EDE4`, one hanko
vermilion `#E0231F`, and ember gold `#FFB020` on the wet edge of a stroke. The
composition is governed by *ma* — negative space is the subject, not the
leftover, which is why `.band` carries `clamp(96px, 15vh, 190px)` of vertical
padding and the hero holds a single figure against `min-height:100svh` of
emptiness. Every mark on the page is authored brush geometry from `_gen_ink.py`
— a filled variable-width ribbon with a wet blunt entry, a swelling body, a
lift-off taper and a *kasure* (dry-brush) split at the tail — never a `border`,
never a `border-radius`, never a stroked line pretending to be a stroke.

**It refuses**, explicitly and by construction:

- **Glow.** There is no `filter: blur()`, no `text-shadow`, and no coloured
  `box-shadow` anywhere in `style.css`. Depth is produced by `.grain` — a
  180×180 `feTurbulence` fractalNoise tile at `opacity:.05` with
  `mix-blend-mode:overlay` — and by an *inset* darkening vignette on
  `.portrait::before`. Grain, never glow.
- **The category default.** No neon accent, no card grid, no per-project
  tiles. `PRODUCT.md` forbids project-by-project structure; the work is four
  `.dests` rows pointing at whole destinations.
- **Cream washi softness.** The material is taken at its saturated end —
  black lacquer and vermilion — not at its papery, beige end.

**Seed key: `ac98927f`.** (Contract line 30: *"Sumi-e; candidate 3 of the
re-derived grounded list; seed key ac98927f."*) That key identifies the
direction, not the geometry — the geometry seeds are separate integers inside
`_gen_ink.py` and are documented under [The brush system](#the-brush-system).

---

## Color

Every token from `:root` in `assets/style.css` lines 8–21. Contrast measured
against the page ground `--sumi #0A0A0C` using the WCAG 2.x relative-luminance
formula.

| Token | Hex | vs `#0A0A0C` | Permitted use |
| --- | --- | --- | --- |
| `--sumi` | `#0A0A0C` | 1.00:1 | The ground. `html`, `body`, `theme-color`. |
| `--sumi-deep` | `#050506` | 1.03:1 | Recessed plates only — `.portrait` backing, `.frame`, `::-webkit-scrollbar-track`. Never text. |
| `--sumi-rise` | `#121114` | 1.05:1 | **Declared and never consumed.** See [Known drift](#known-drift). |
| `--ink` | `#F2EDE4` | **16.96:1** | Gofun shell-white. Default `body` colour. All display type, `.lede`, `.role`, hover states. Any size, any weight. |
| `--ink-2` | `#A8A29B` | **7.82:1** | Secondary prose — `.fact`, `.body`, `.tier li`, `.dests p`, `.mast-nav a` rest state, `.mast-cv`. Any size. |
| `--ink-3` | `#8D867E` | **5.50:1** | The smallest text on the page still clears AA. `.head-note`, `.status`, `.url` (12.5px), `.frame figcaption span` (10.5px), `.mail-tag` (11.5px), `.cue` (11px), `.foot` (12.5px). Any size. |
| `--ink-4` | `#6E6862` | **3.60:1** | **Large text only, or non-text.** Below the 4.5:1 normal-text floor. In the shipped code it is used for **non-text only**: `scrollbar-color` thumb (l.83, l.86) and the `.copy:hover` border (l.509). Keep it that way. |
| `--hairline` | `#34302D` | 1.51:1 | **Never text, ever.** Borders and rules only: `.copy` border, `.foot` border-top, mobile `.mast-nav` border-top. |
| `--shu` | `#E0231F` | **4.17:1** | Hanko vermilion. **Fills and large text only.** Fills: `.act-1`, `.skip`, `::selection`, `.seal .mark`, `.mast-seal .mark`, `.v`, `.frame::before` registration corners, `.progress span`, `.brush-cursor i`, `.rule` path fill, tier-1 `.tier-mark`. Large text: `h1.display .ln:last-child` ("Chen", `clamp(52px,8.4vw,124px)`). Also the `:focus-visible` outline (4.17:1 clears the 3:1 non-text floor). |
| `--shu-lit` | `#FF6B5E` | **7.08:1** | **The small-text vermilion.** Every vermilion word under 24px uses this, not `--shu`: `.links a:hover`, `.tier-foot a:hover`, `.dests a:hover h3`, `.copy.is-done`. |
| `--shu-deep` | `#A81410` | 2.61:1 | Pressed/darkened fill only — `.act-1:hover` background. White on it measures **8.05:1**. Never a text colour on the ground. |
| `--ember` | `#FFB020` | **10.82:1** | The wet tip. Two consumers only (see drift): the `.status .wetdot` bead and the last 12% of the `.progress span` gradient. |

Composite pairs worth knowing:

- `#fff` on `--shu` (`.act-1`, `.skip`, `::selection`) = **4.74:1** — clears AA
  normal text at the 14.5px these use.
- `#fff` on `--shu-deep` (`.act-1:hover`) = **8.05:1**.
- `--ink` on `--sumi-deep` (text over `.frame`) = **17.47:1**.

### Colour strategy

Restrained on purpose. **One ground, one ink, one accent, one ember.** Black
lacquer carries white ink; vermilion is the single accent and it is rationed —
it marks the surname, the seal, the verification square, the active nav item,
the progress fill and the focus ring, and nothing else. Ember gold is meant to
appear at exactly one point on the page: the wet leading edge of the scroll
stroke. In the shipped CSS it appears at two (`.status .wetdot` is the second);
that is recorded as drift below. There is no fifth hue. Do not introduce one.

---

## Typography

Two families, loaded from Google Fonts with `display=swap` (`index.html` l.18):

| Family | Token | Weights loaded | Where |
| --- | --- | --- | --- |
| **Zen Old Mincho** (serif) | `--f-disp` | 400, 600, 900 | `.display` headings (900), `.lede`, `.mail`, `.mast-seal span`, `.tier h3`, `.dests h3`, `.frame figcaption b`, `.foot span:first-child` (all 600 or 400) |
| **Zen Kaku Gothic New** (sans) | `--f-text` | 300, 400, 500, 700 | `body` default at weight **300**, all prose, all UI chrome, `.mail-tag`, `.copy` |

Fallbacks are `'Times New Roman', serif` and `system-ui, sans-serif`. Body
metrics: `16px / 1.75`, dropping to `15.5px` below 720px.

### The scales, as written

| Role | Selector | Value |
| --- | --- | --- |
| h1 | `h1.display` | `clamp(52px, 8.4vw, 124px)` |
| h2 (bands) | `.head h2.display` | `clamp(38px, 5.6vw, 84px)` |
| h2 (contact) | `.contact h2.display` | `clamp(40px, 6.4vw, 96px)` |
| h3 (work rows) | `.dests h3` | `clamp(24px, 3vw, 40px)` |
| h3 (tiers) | `.tier h3` | `19px` — fixed, does not scale |
| Display lede | `.lede` | `clamp(21px, 2.5vw, 32px)` |
| Email addresses | `.mail` | `clamp(17px, 2.6vw, 34px)` |
| Body | `body` | `16px` → `15.5px` ≤720px |
| Body (hero fact) | `.fact` | `clamp(14.5px, 1.35vw, 16.5px)` |
| Body (studio) | `.body` | `15.5px` fixed |
| Role line | `.role` | `clamp(15px, 1.5vw, 18px)` |
| Small | `.head-note`, `.tier-foot` | `14px` |
| Small | `.status` | `13px` |
| Smallest | `.url`, `.foot`, `.copy` | `12.5px` |
| Smallest | `.mail-tag` | `11.5px` · `.cue` `11px` · `.frame figcaption span` `10.5px` |

All `.display` type is `font-weight:900`, `line-height:.92`,
`letter-spacing:-.015em`, `margin:0`. `h1,h2,h3,.lede` get `text-wrap:balance`;
`p,li,figcaption` get `text-wrap:pretty`.

Only three sizes fall below 12.5px and all three are `--ink-3` at 5.50:1, so
the page has no text below AA.

### The word-cell reveal mechanism

Two different cell structures, for two different jobs:

**`.ln` — line cells (h1 only, authored in HTML).**
`index.html` l.69 ships `<span class="ln">Draven</span> <span class="ln">Chen</span>`.
CSS gives `h1.display .ln{display:block;overflow:hidden}` and
`h1.display .ln>i{display:block}`. `app.js` (l.166–172) wraps each `.ln`'s text
in an `<i>` and sets `yPercent: 112`. The timeline slides them back to 0.

**`.w` — word cells (h2 only, generated by JS).**
`splitWords()` (`app.js` l.149–164) splits an `h2.display` on whitespace,
rebuilds it as `<span class="w"><i>word</i></span>` separated by real text
nodes (so word spacing and copy-paste still work), and returns the inner `<i>`
elements. CSS: `.display .w{display:inline-block;overflow:hidden;vertical-align:bottom}`,
`.display .w>i{display:inline-block;font-style:normal}`. The scroll trigger
animates `yPercent: 108 → 0`.

In both cases **the cell clips and the inner element travels**. This is the
"ink soaks up into place" motion — no opacity fade on the glyph itself.

### Descender-clipping compensation

`overflow:hidden` on a text cell cuts the descenders of `g j p q y`. `.w`
compensates:

```css
.display .w{ padding-bottom:.15em; margin-bottom:-.15em; }
```

The padding pushes the clip boundary 0.15em below the baseline; the equal
negative margin removes that space from layout, so line rhythm is unchanged.
`vertical-align:bottom` keeps the inline-block sitting on the correct line.

**`h1.display .ln` has no such compensation.** It is safe today only because
"Draven Chen" contains no descenders. If the h1 copy ever changes to a word
with a descender, add the same `padding-bottom/margin-bottom` pair to
`h1.display .ln` or it will clip.

---

## The brush system

This is the heart of the surface. Everything that reads as "a mark" on this
page — the enso, every rule, every tier tick, every link underline, the row
wash, the progress stroke and the cursor — is geometry emitted by
`_gen_ink.py`. Nothing is a `border`, a `linear-gradient` bar, or a
`border-radius`.

### 1. How `_gen_ink.py` builds a stroke

A real brush stroke is a **filled shape with variable width**, not a stroked
line. The pipeline is always the same four steps:

**a. A centreline.** A list of `(x, y)` points sampled over a parameter
`t ∈ [0,1]`. The path is perturbed by `noise(seed_pts, t)` (l.20–29), a smooth
pseudo-noise built by cosine-interpolating a small fixed array of random values
— deterministic, C¹-smooth, and cheap. The enso adds a second wobble term
`math.sin(t * 5.1) * 3.0` on the radius so the circle is never true.

**b. A per-point half-width, from a pressure curve.** Every generator writes
the same three-phase profile (`make_enso` l.77–86 is the canonical one):

```python
if t < 0.045:                       # wet blunt entry
    w = 15.5 + t * 90               #   the loaded brush lands and spreads fast
elif t < 0.42:                      # swelling body
    w = 19.5 + math.sin((t - 0.045) * 3.4) * 4.4
else:                               # lift-off taper
    k = (t - 0.42) / 0.58
    w = 21.0 * (1 - k) ** 1.75 + 1.4
w += noise(wob2, t) * 1.5           # tooth of the paper
```

The exponent on `(1 - k)` is the **dryness control**. `make_h` exposes it as
the `dry` parameter: `w = (13.0 * (1 - k) ** (1.0 + dry * 1.8) + 0.8) * weight`.
A higher `dry` makes the taper collapse earlier and harder — a thirstier brush.

**c. Ribbon outline.** `ribbon(centre, widths)` (l.41–59) walks the centreline,
computes the unit normal `(-dy/L, dx/L)` from a central difference (forward
difference at the first point, backward at the last), offsets by `±w`, and
emits `left + reversed(right)` as one closed `M … L … Z` polygon. **`widths`
holds half-widths** — the rendered stroke is `2w` wide.

**d. Kasure — the dry-brush split.** `make_enso` l.90–105. From `t = 0.80` to
the end, three additional thin ribbons are generated on lateral offsets
`(-6.0, 0.0, +5.2)`, each scaled by `off * (0.35 + t * 1.5)` so the hairs *fan
apart* as the brush runs out of ink, with widths
`(2.9 - k*0.55) * (1 - t)**1.35` that vanish at the tip. These become
`INK.ensoHairs` and render at `.ink-svg .hair{opacity:.86}` — slightly lighter
than the body, because a split hair carries less ink.

Only the enso has kasure hairs. The horizontal strokes get their dryness from
the taper exponent alone.

### 2. The mask-sweep reveal

The single most important mechanism on the page. `app.js` `buildMark()`
(l.41–76) constructs, per mark:

```
<svg class="ink-svg" viewBox="0 0 W H" preserveAspectRatio="…">
  <defs>
    <mask id="inkmN" maskUnits="userSpaceOnUse">
      <path d="{INK[kind+'Line']}"  ← the CENTRELINE
            stroke="#fff" stroke-width="{c[2]}"
            stroke-linecap="round" stroke-linejoin="round" fill="none"
            pathLength="1" stroke-dasharray="1 1.02"
            data-mask-stroke  style="stroke-dashoffset:1">
    </mask>
  </defs>
  <g mask="url(#inkmN)">
    <path d="{INK[kind]}"/>            ← the filled variable-width body
    <path class="hair" …/>             ← kasure hairs, enso only
  </g>
</svg>
```

Why each piece matters:

- **`pathLength="1"`** re-normalises the path's intrinsic length to 1, so the
  dash numbers are geometry-independent. A new mark of any length animates over
  the same 0→1 range with no retuning.
- **`stroke-dasharray="1 1.02"`** — one dash exactly as long as the path,
  followed by a gap *slightly longer than the path*. The over-long gap
  guarantees the repeating dash pattern can never wrap around and bleed a
  second dash in at the far end.
- **`strokeDashoffset: 1 → 0`** walks the dash onto the path from its start
  point. Because the mask is white-on-transparent, the filled body underneath is
  revealed **in the direction the brush travels**. It is not a fade, not a wipe,
  not a `clip-path` rectangle — it follows the curve.
- **`stroke-width` (the third `VB` number)** must be wide enough to fully clear
  the widest part of the ribbon *plus* any kasure hairs, or the mask will shave
  the edges of its own mark.
- **`stroke-linecap="round"`** gives the advancing edge a blunt, wet leading
  boundary instead of a guillotine cut.
- **`style.strokeDashoffset = animate ? '1' : '0'`** (l.60) — the mark is
  written to the DOM already-complete when motion is off. The reveal is opt-in,
  not opt-out.
- **`data-mask-stroke`** exists purely so the reduced-motion stylesheet can
  reach it: `.ink-svg [data-mask-stroke]{stroke-dashoffset:0!important}`
  (style.css l.672).

CSS fills the revealed body: `.ink-svg path{fill:var(--ink)}` by default,
overridden per context (`.rule .ink-svg path{fill:var(--shu)}`,
`.tier:nth-child(1) .tier-mark .ink-svg path{fill:var(--shu)}`,
`.tier:nth-child(3) … {fill:var(--ink-3)}`, `.seal .seal-ring path{fill:var(--shu)}`).

**Mask region caveat.** The `<mask>` sets `maskUnits="userSpaceOnUse"` but
leaves `x/y/width/height` at their SVG defaults of `-10% / -10% / 120% / 120%`.
Any geometry that strays beyond ~110% of the declared viewBox will be clipped
by the mask region even though `.ink-svg` sets `overflow:visible`. Keep new
geometry inside its viewBox.

### 3. The generated CSS custom properties

`_gen_ink.py` l.226–232 writes `assets/ink-vars.css`, a `:root` block with
three data-URI SVGs. These exist because CSS masks cannot reference an inline
`<svg>` cheaply, and because underlines/washes must have a ragged ink edge
rather than a geometric one. Each is `preserveAspectRatio='none'`, so it
stretches to whatever box it is applied to.

| Property | Source fn | viewBox | Consumed by |
| --- | --- | --- | --- |
| `--brush-underline` | `make_underline()` | `0 0 200 12` | `.mast-nav a::after`, `.links a::after`, `.tier-foot a::after`, `.social a::after` (shared rule, style.css l.113); `.cue::after` (the ink bead); `.dests a::after` (the hover arrow-mark); `.mail::after`; `.brush-cursor i` |
| `--brush-wash` | `make_wash_edge()` | `0 0 200 100` | `.dests .wash` only — the vermilion soak behind a hovered work row |
| `--brush-vertical` | `make_vertical()` | `0 0 12 200` | `.progress::before` (the dry channel, `--ink` at `.11`) and `.progress span` (the vermilion→ember fill) |

Every one of these is applied as **both** `-webkit-mask` and `mask`, always in
the form `var(--brush-…) <position>/100% 100% no-repeat`, over a solid
`background` that supplies the colour. The mask carries the shape; the
background carries the ink. Never invert that.

`make_wash_edge()` is structurally different from the others: it is not a
ribbon at all but a filled rectangle whose **right edge only** is ragged
(`x = W - 9 + noise(wob,t)*5.5 + noise(wob2,t)*3.0`, two noise fields summed for
a wetter, less periodic boundary). Combined with
`transform:scaleX(0) → scaleX(1)` over `.72s var(--ease)`, the wash reads as ink
soaking rightward with a wet leading edge, not as a geometric bar wiping in.

### 4. The `VB` table in `app.js`

```js
var VB = {
  enso:  [500, 500, 92, 'xMidYMid meet'],
  heavy: [600, 80, 64, 'none'],
  mid:   [600, 80, 64, 'none'],
  light: [600, 80, 64, 'none'],
  rule:  [600, 80, 64, 'none']
};
```

`[viewBoxWidth, viewBoxHeight, sweepStrokeWidth, preserveAspectRatio]`.

- **`500 × 500` for the enso** matches `make_enso(R=200, cx=250, cy=250)` — the
  circle spans 50…450 with ~±10 of wobble, leaving comfortable margin.
- **`600 × 80` for every horizontal** matches `make_h(W=600)` with the
  centreline at `y = 40 ± 3.2`. The 80-unit height is generous headroom for a
  stroke that is at most ~27 units thick.
- **`92` and `64` are mask sweep widths, not visual widths.** The enso ribbon
  peaks near 21 half-width (≈43 full) and the kasure hairs fan a further ±11,
  so 92 clears everything. The heaviest horizontal peaks near 13 half-width
  (≈27 full), so 64 clears it with room for a lighter `weight` to be raised
  later. **When you add geometry, raise the sweep width, don't trim the mark.**
- **`'xMidYMid meet'` for the enso** preserves the aspect ratio — a squashed
  enso is not an enso. Its host `.enso-stage` is locked to `aspect-ratio:1`.
- **`'none'` for the horizontals** lets a 600×80 stroke stretch into any box:
  a `.rule` (`min(300px,52%) × 22px`) or a `.tier-mark` (`100% × 26px`). This is
  why one generated shape serves many widths.

Unknown kinds fall back to `VB.rule` (`var c = VB[kind] || VB.rule`), so a typo
in `data-ink` yields a horizontal rule rather than an exception.

### 5. Mark inventory as shipped

Nine `[data-ink]` hosts in `index.html`:

| Kind | Count | Hosts |
| --- | --- | --- |
| `enso` | 1 | `.hero .enso` |
| `rule` | 1 | `.hero .rule` |
| `mid` | 5 | `#studio .rule`, `#craft .rule`, `#work .rule`, `#contact .rule`, `.tier:nth-child(2) .tier-mark` |
| `heavy` | 1 | `.tier:nth-child(1) .tier-mark` |
| `light` | 1 | `.tier:nth-child(3) .tier-mark` |

The three tier weights are a *semantic* ladder: Core is the heaviest stroke in
vermilion, Engineering is mid-weight in white, Foundations is the driest stroke
in `--ink-3`. Stroke weight encodes depth of knowledge. Preserve that mapping.

`.contact .rule .ink-svg{transform:scaleX(-1)}` mirrors the closing rule so its
wet entry sits on the right — the page opens with a stroke travelling right and
closes with one travelling left.

### 6. HOW TO ADD A NEW MARK

Follow this exactly. Steps 1–3 are Python; 4–5 are the front end; 6 is
non-negotiable.

1. **Pick an unused random seed.** In use today: module-level `7` (enso),
   `3` (heavy), `5` (mid), `9` (light), `13` (rule), `11` (seal ring),
   `21` (underline), `29` (wash), `37` (vertical). Reusing one produces a
   near-duplicate mark.

2. **Write a generator that returns `(ribbon_path, centreline_path)`.** Model it
   on `make_h` — reseed with `random.seed(seed)` as the *first* line of the
   function so it is independent of call order, sample a centreline, build the
   three-phase width profile, and return `ribbon(centre, widths), line(centre)`.
   The centreline return is mandatory: without it the mark cannot be revealed.

   > **Fragility:** `make_enso()` is the one generator that does **not** reseed;
   > it consumes the module-level `random.seed(7)` stream and is called first at
   > l.146. Inserting any `random.*` call above that line silently redraws the
   > enso. If you add a generator, call it *after* line 146 or reseed it.

3. **Register it in the `data` dict** (l.152–161) as two keys —
   `"<kind>": body` and `"<kind>Line": centreline`. The naming is load-bearing:
   `app.js` l.54 looks up `kind + 'Line'` (with a hardcoded special case mapping
   `enso → ensoLine`).

4. **Add a `VB` entry in `app.js`** with the viewBox that matches your
   generator's coordinate space and a sweep `stroke-width` at least ~2.5× the
   maximum half-width you wrote. Use `'none'` unless the shape must not distort.

5. **Add `data-ink="<kind>"` to a host element** in `index.html`. The host must
   be `aria-hidden="true"` — these are decoration and carry no meaning. Give it
   a size in CSS (the SVG fills `width:100%;height:100%`). Set its fill with a
   selector more specific than `.ink-svg path`.

6. **Regenerate.** From the project root:

   ```
   python _gen_ink.py
   ```

   This rewrites **both** `assets/ink-vars.css` and `assets/ink.js` and prints a
   character-count table per key. Commit both generated files. Editing them by
   hand guarantees the next regeneration silently reverts your work.

If your new mark is a CSS mask rather than an SVG mark, skip steps 3–5 and
instead add a `svg_uri(...)` line inside the `with open("assets/ink-vars.css")`
block (l.226–231), keeping the path short enough to live comfortably in a data
URI — `compact()` already strips the spaces.

---

## Components

### `.masthead`

Fixed, `z-index:20`, `display:flex; justify-content:space-between`, padded
`18px var(--gut)`. Three children: `.mast-seal` (flame mark + wordmark, links
to `#hero`), `.mast-nav` (four section links), `.mast-cv` (résumé download,
bordered).

- **States.** `.is-stuck` is toggled by `app.js` at `scroll() > 80`: background
  becomes `rgba(10,10,12,.86)` with `backdrop-filter:blur(14px)`, padding
  tightens to `11px`, and a `1px solid rgba(242,237,228,.07)` bottom border
  appears. Both background and padding transition over `.4s var(--ease)`.
- **Mobile transformation (≤720px).** `.mast-nav` leaves the masthead entirely
  and becomes a fixed bottom bar: `position:fixed; bottom:0; z-index:30`,
  `height:calc(54px + env(safe-area-inset-bottom))`, `rgba(10,10,12,.9)` +
  `blur(16px)`, `border-top:1px solid var(--hairline)`, links at `flex:1` /
  `min-height:54px` / `12.5px`, with the brush underline re-centred
  (`left:24%; width:52%; bottom:11px`). `.foot` gains
  `padding-bottom:calc(80px + env(safe-area-inset-bottom))` so the bar never
  covers the footer. Navigation moves into the thumb zone rather than
  collapsing into a hamburger.
- **Constraints.** `section[id]{scroll-margin-top:64px}` exists so the fixed
  bar never lands on a heading after an anchor jump — if masthead height
  changes, that number must change with it. `.mast-nav a` and `.mast-cv` both
  carry `min-height:44px`. `.mast-seal` does **not** (see drift).

### Section tree

```
body
├── .skip                          → #main
├── .progress  (z 15)              fixed left margin, desktop >1240px only
├── .brush-cursor (z 40)           pointer:fine only
├── .grain (z 9)                   >900px only
├── header.masthead (z 20)
├── main#main[tabindex="-1"]
│   ├── section.hero#hero          .hero-grid → .enso-stage + .hero-text ; .cue
│   ├── section.band.studio#studio → .wrap > .head + .studio-grid
│   ├── section.band.craft#craft   → .wrap > .head + .tiers + .tier-foot
│   ├── section.band.work#work     → .wrap > .head + ul.dests
│   └── section.band.contact#contact → .wrap (centred flex column)
└── footer.foot
```

`.band` = `padding: clamp(96px,15vh,190px) var(--gut)`. `.wrap` =
`max-width:1180px; margin:0 auto; position:relative`. `.head` =
`margin-bottom: clamp(46px,7vh,92px)`. `--gut: clamp(20px, 5vw, 84px)` is the
single horizontal rhythm for the whole page.

### `.enso-stage` / `.portrait`

`.enso-stage` is `position:relative; aspect-ratio:1; max-width:520px`
(→ `min(400px,74vw)` ≤1000px, `min(320px,80vw)` ≤720px). It stacks three
layers: `.portrait` at `inset:13%` with `border-radius:50%`, the `.enso` SVG at
`z-index:3`, and `.seal-hero` at `z-index:4`.

- The portrait is graded to ink: `filter:grayscale(1) contrast(1.3) brightness(.72)`,
  a `196deg` vermilion→sumi `linear-gradient` at `mix-blend-mode:multiply`
  (`::after`), and an **inset** `box-shadow:inset 0 0 70px 18px rgba(5,5,6,.92)`
  vignette (`::before`, `z-index:2`) that dissolves the photo's edge into the
  ground. `object-position:50% 20%` keeps the face high in the frame.
- **`.portrait{opacity:0}` in CSS.** It is revealed by `app.js` (either by the
  timeline or by the `if (!animate)` static path at l.136). This is one of only
  two elements on the page that depend on JS to become visible.
- **Constraint.** The portrait is a *circle inside a circle* — its `inset:13%`
  is tuned against the enso's `R=200/cx=250` geometry. Changing either without
  the other breaks the nesting.

### `.seal` (+ ring, `.mark`, `.spread`)

The hanko. `88px` square (`64px` ≤720px), `position:relative`, `opacity:0` by
default. Two instances carry `[data-seal]`: `.seal-hero`
(`position:absolute; right:2%; bottom:6%; z-index:4` inside `.enso-stage`) and
`.seal-end` (in the contact band, `margin-bottom: clamp(34px,6vh,58px)`).

`app.js` l.93–107 builds each seal:

1. If `INK.sealRing` exists, prepend an `<svg class="ink-svg seal-ring">` with
   `viewBox="0 0 220 220"` and `fill-rule="evenodd"` — `make_seal_ring()`
   emits an outer and a reversed inner polygon in one `d`, so evenodd carves
   the annulus. Positioned by inline style to `inset:-13%; width:126%;
   height:126%`. The host gains `.has-ring`.
2. Always append `<span class="spread">`.

- **`.seal .mark`** — `inset:19%`, `background:var(--shu)`, masked by
  `url(img/flame.png) center/contain`. The flame PNG is used as a **mask, not
  an image**, so the brand mark always renders in exactly `--shu` and never
  brings its own colour onto the page. `.mast-seal .mark` is the same technique
  at `19px`.
- **`.spread`** — `inset:-13%`, `2px solid var(--shu)`, `opacity:0`. Animated
  only by `stamp()`: ink pushing outward the instant the stone touches paper.
- **Fallback.** `.seal:not(.has-ring)::after` draws a `2.5px solid var(--shu)`
  square at `inset:-13%`, `opacity:.82`. If `ink.js` fails to load the seal is
  still a seal — a square hanko border — not a missing element.
- **Constraints.** Both seals are `aria-hidden="true"`; they carry no
  information. Both are hidden in print. `.seal-end` is additionally
  `G.set(..., {opacity:0})`'d by JS and only restored by its ScrollTrigger.

### `.act` / `.act-1`

`display:inline-flex; align-items:center; padding:13px 30px; font-size:14.5px`
with a `1px solid rgba(242,237,228,.2)` border, inside `.acts`
(`display:flex; gap:14px; flex-wrap:wrap`).

- `.act` hover: `border-color:var(--ink)`, `background:rgba(242,237,228,.05)`.
- `.act-1` is the single primary: solid `--shu` with `#fff` (4.74:1); hover
  drops to `--shu-deep` (8.05:1). There is **one** `.act-1` on the page.
- ≤720px: `.acts{width:100%}` and `.act{flex:1; justify-content:center;
  padding:14px 18px}` — the two buttons split the row.
- **Constraint.** `.acts` and the sibling `.status` are the recruiter's
  destination and are **never animated** — no `opacity:0` in CSS, never touched
  by the timeline. They are live in the first painted frame.

### `.frame`

A print mount for the two brand marks. `background:var(--sumi-deep)`, `1px
solid rgba(242,237,228,.13)`, `padding:13px 13px 0`.

- **Registration corners.** `.frame::before` at `inset:6px`, `z-index:3`,
  `opacity:.5`, composed of **eight** `linear-gradient(var(--shu),var(--shu))`
  backgrounds — a `13px × 1.5px` horizontal and a `1.5px × 13px` vertical at
  each of the four corners. Not a border; four printer's crop marks.
- **`.frame-plate`** — `overflow:hidden; background:#000;` with a
  `rgba(242,237,228,.09)` hairline. Images are the binding brand assets
  (`mascot.webp`, `wordmark-dark.webp`), `loading="lazy"` with intrinsic
  `width`/`height` so they reserve space.
- **Caption plate.** `figcaption` is a baseline-aligned `space-between` flex
  row: `b` in mincho 600 / 14.5px / `--ink-2`, `span` in 10.5px /
  `letter-spacing:.19em` / uppercase / `--ink-3`.
- **States.** Hover raises the whole frame `translateY(-3px)`, brightens the
  border to `.26`, takes the registration corners to full opacity, and scales
  the plate image to `1.035` over `1s var(--ease)`. The image scales *inside*
  the clipped plate; the frame itself never scales.
- **Layout.** `.studio-marks` is a 1-column grid, becoming `1fr 1fr` between
  721px and 1000px, and back to 1 column ≤720px.

### `.tier` and the `.v` verification seal

`.tiers` is `repeat(auto-fit, minmax(220px, 1fr))` with
`gap: clamp(30px,4.5vw,64px)`, collapsing to one column ≤720px. Each `.tier`
opens with a `.tier-mark` (`height:26px; width:100%; margin-bottom:20px`).

The three tiers are differentiated on **three axes at once** — stroke weight,
type size, and ink value:

| Tier | `data-ink` | `.tier-mark` fill | `li` size | `li` colour |
| --- | --- | --- | --- | --- |
| 1 Core | `heavy` | `--shu` | `17px` | `--ink` |
| 2 Engineering | `mid` | `--ink` | `14.5px` | `--ink-2` |
| 3 Foundations | `light` | `--ink-3` | `13.5px` | `--ink-3` |

These are all `:nth-child()` rules — **reordering the `.tier` divs re-skins
them.** List items carry `border-bottom:1px solid rgba(242,237,228,.055)`,
removed on `:last-child`.

**`.v`** is the Credly verification seal: a `6px × 6px` `--shu` square,
`display:inline-block`, `margin-left:6px`, `vertical-align:.06em`,
`transform:rotate(-6deg)` — a stamp pressed slightly off-square. In the DOM it
is `<i class="v" role="img" aria-label="Credly verified"></i>`, so screen
readers announce it. `.head-note .v` narrows to `margin:0 1px` because it
appears there as an inline legend inside a sentence.

**The `.v` is a truth claim.** It appears on exactly the 20 skills that carry a
Credly credential; C++, C#, TypeScript, JavaScript and HTML in the Core tier
deliberately carry none, and `.tier-foot` accounts for the remaining
credentials in prose with a link out.

### `.dests` rows and `.wash`

`ul.dests` is bordered top and bottom with `rgba(242,237,228,.1)`; each `li`
carries a bottom hairline. Each `a` is
`display:grid; grid-template-columns:minmax(180px,.5fr) minmax(240px,1fr);
align-items:baseline; padding:clamp(26px,4vh,44px) 8px` — collapsing to one
column ≤1000px. Content: `h3` (mincho 600, `clamp(24px,3vw,40px)`), `p`
(`--ink-2`, `max-width:52ch`), `.url` (12.5px, `--ink-3`,
`word-break:break-all`).

- **`.wash`** — `position:absolute; inset:0; background:rgba(224,35,31,.11)`,
  masked by `--brush-wash`, `transform:scaleX(0)` → `scaleX(1)` over
  `.72s var(--ease)` from `transform-origin:left`. The ragged mask edge is what
  makes it read as ink soaking rather than a rectangle wiping.
- **`a::after`** — a `26px × 7px` `--shu` mark using `--brush-underline`,
  fading in and sliding `translate(-14px) → translate(0)` on hover.
- Hover/focus also takes `h3` to `--shu-lit` (7.08:1).
- **Constraint.** All three hover effects are duplicated on `:focus-visible`.
  `h3`, `p` and `.url` all carry `position:relative` so they paint above the
  absolutely positioned wash. A new child element inside a `.dests a` needs
  `position:relative` or the wash will cover it.

### `.mail`, `.mail-tag`, `.copy`

`.mails` is a centred flex column with `gap: clamp(18px,3vh,30px)`. Each
`.mail` is itself a centred flex column: the `.mail-tag` label
(11.5px, `letter-spacing:.2em`, uppercase, `--ink-3`) sits **above** the
address, which is mincho 400 at `clamp(17px,2.6vw,34px)`.

- **`.mail::after`** is a full-width `--brush-underline` mask at
  `opacity:.3; transform:scaleX(.3)` at rest, going to `scaleX(1)` / `opacity:1`
  on hover or focus. The underline is *partially drawn* at rest — a stroke
  waiting to be completed.
- **`.copy`** exists because a `mailto:` is not a contact path on a locked-down
  corporate machine. `<button type="button" class="copy" data-copy="…">`, styled
  `1px solid var(--hairline)`, `min-height:44px`, `12.5px`, `--ink-3`. On click
  it writes to `navigator.clipboard`, swaps its label to "Copied", adds
  `.is-done` (`border-color:var(--shu); color:var(--shu-lit)`), and restores
  after 2200ms. If the Clipboard API is unavailable it falls back to printing
  the raw address into the button so it can be selected by hand.
- **Constraint.** The copy handler is wired at `app.js` l.113, **before** the
  `if (!animate) return;` gate at l.135. Functional behaviour must never sit
  behind the animation gate.

### `.progress`

One vertical brush stroke down the left margin, serving as the scroll
indicator. `position:fixed; left:max(14px, calc(var(--gut) * .34));
top:22vh; bottom:22vh; width:7px; z-index:15; pointer-events:none`.

- `::before` is the dry channel: `--ink` at `opacity:.11`, masked by
  `--brush-vertical`.
- `span` is the fill: `linear-gradient(to bottom, var(--shu) 0%, var(--shu) 88%,
  var(--ember) 100%)` — vermilion body, ember only in the last 12%, because the
  leading edge of a stroke is still wet. Masked by the same
  `--brush-vertical`, `transform-origin:top`, driven by
  `G.set(progFill, {scaleY: self.progress})`.
- **States.** `opacity:0` until `.is-live`, added when `scroll() > 240`.
- **Constraints.** `display:none` at ≤1240px (it would collide with content)
  and under `prefers-reduced-motion`. It is `aria-hidden="true"` and duplicates
  no information.

### `.brush-cursor`

`display:none` by default; only enabled inside
`@media (hover:hover) and (pointer:fine)`. `position:fixed; z-index:40;
pointer-events:none`, `opacity:0` until `.is-live` (added on the first
`mousemove`, removed on `document mouseleave`).

The tip `i` is a `26px × 9px` `--shu` block masked by **`--brush-underline`** —
the same authored mark used for every underline on the page, not a circle.
`app.js` l.335–349 runs a rAF loop that lerps toward the pointer at `0.22`,
derives `speed` (clamped to 46), sets `ang = atan2(dy,dx)` only above a
`0.7` threshold (so a resting tip does not spin), and eases `stretch` toward
`1 + speed/15`. The transform is
`translate3d(x,y,0) rotate(ang) scale(stretch, 1/sqrt(stretch))` — area-ish
preserving, so a fast tip stretches thin the way a loaded brush drags.

`.is-touching` (delegated `mouseover`/`mouseout` on `a, button` — one pair of
listeners, not two per link) swaps the tip to `--ink`.

**Constraints.** Never appears on touch. Killed outright by
`prefers-reduced-motion`. Purely decorative — nothing depends on it.

### `.grain`

`position:fixed`, oversized by 60px on every side, `z-index:9`,
`pointer-events:none`, `opacity:.05`, `mix-blend-mode:overlay`. Background is
an inline `feTurbulence type='fractalNoise' baseFrequency='.82' numOctaves='4'`
tile at 180×180. `animation: tooth 1.1s steps(1) infinite` jumps it between
five translate positions — `steps(1)` means it *snaps*, like film grain, rather
than sliding. The oversize is what keeps the edges from ever entering frame.

**Constraints.** `display:none` ≤900px — a fixed full-viewport blend layer is
the single most expensive thing a phone can be asked to composite every frame.
Under reduced motion it keeps its texture but loses `animation`. Hidden in
print. This layer is the entire depth budget of the page; it is what stands in
for glow.

### `.cue`

`position:absolute; left:var(--gut); bottom:34px`, an anchor to `#studio`.
11px uppercase `letter-spacing:.22em` in `--ink-3`, followed by a `52px × 7px`
`--brush-underline` mark that pulses `scaleX(.42) → scaleX(1)` on a `3.1s`
`bead` keyframe — a bead of ink running down the stroke. Hover takes the text
to `--ink-2` and the bead to `--shu`.

**Constraints.** `display:none` ≤1000px. It is the only element whose motion is
a CSS keyframe rather than GSAP, apart from `.grain` and `.wetdot`.

### `.foot`

`display:flex; justify-content:space-between; flex-wrap:wrap`, padded
`26px var(--gut) calc(26px + env(safe-area-inset-bottom))`,
`border-top:1px solid var(--hairline)`, `12.5px` `--ink-3`. The first span
("crimSun") is mincho 600 in `--ink-2`. Gains
`padding-bottom:calc(80px + env(safe-area-inset-bottom))` ≤720px to clear the
bottom nav bar.

---

## Motion

### The one authored moment

The hero load. One GSAP timeline (`app.js` l.195–215), default ease
`power3.out`, roughly 2.1s end to end. Positions are absolute timeline seconds:

| t | Target | Change | Duration / ease |
| --- | --- | --- | --- |
| `0.10` | enso mask sweep | `strokeDashoffset 1 → 0` | `1.15` `power2.out` |
| `0.12` | `h1.display .ln>i` | `yPercent 112 → 0`, stagger `.08` | `0.8` `power3.out` |
| `0.55` | `.hero .portrait` | `opacity 0 → 1` | `1.2` `power2.out` |
| `0.55` | `.hero .portrait img` | `scale 1.14 → 1` | `1.9` `power2.out` |
| `0.55` | `.hero .role, .hero .fact` | `opacity 0 → 1`, `y 14 → 0`, stagger `.09` | `0.7` `power3.out` |
| `0.62` | `.hero .rule` mask sweep | `strokeDashoffset 1 → 0` | `0.7` `power2.out` |
| `1.15` | `.seal-hero` | `stamp(el, -4)` | see below |
| `1.40` | `.cue` | `opacity 0 → 1` | `0.7` |

The reveal order is a priority statement, and `app.js` l.191–193 says so
outright: the name, the shipped-work line, the two links and open-to-work are
what the recruiter came for. **The enso is the reward, not the toll** — it
starts first but the h1 lands 0.02s later and finishes long before it.

### `.acts` and `.status` never animate

They have no `opacity:0` in CSS and appear in no GSAP selector. They are
painted in the first frame and stay. This is deliberate and it is the strictest
motion rule on the page: the primary conversion path is never gated behind a
tween, a scroll trigger, a font load or a CDN.

`.status .wetdot` has a CSS `wet` keyframe (3.4s pulse) but the text beside it
is static from frame one.

### `fromTo` + `immediateRender:false`

The scroll-reveal batch (`app.js` l.257–269) selects
`.head-note, .lede, .body, .links, .studio-marks figure, .tier h3, .tier ul,
.tier-foot, .dests li, .mail, .copy-note, .social` and animates
`{opacity:0, y:26} → {opacity:1, y:0}` with `immediateRender:false`.

**Why it matters:** with `immediateRender:false`, GSAP does not apply the
`from` state at setup time. Content stays in its natural, visible DOM state
until the ScrollTrigger actually fires. If GSAP's CDN is blocked, if
ScrollTrigger fails to register, if a trigger never fires because of an unusual
viewport — **nothing is hidden**. The DOM's visible state is the fallback,
rather than something JS has to remember to restore. Nothing on this page may
be visible *only after* a scroll trigger fires. That is also a `PRODUCT.md`
requirement.

The same reasoning drives the whole file's shape: `var animate = !!G && !reduce`,
and every GSAP-dependent block is guarded (`if (ensoSweep)`, `if (!ST) return`,
`if (heroSeal)`). Marks and the copy button are built *before* the
`if (!animate) return` gate at l.135–138; that gate's job is to force
`.portrait` and `.seal` to `opacity:1` and stop.

### The stamp: `power4.out`, not `back.out`

```js
tl.fromTo(target,
  { opacity: 0, scale: 1.55, rotate: rot * 3.2 },
  { opacity: 1, scale: 1, rotate: rot, duration: 0.34, ease: 'power4.out' });
```

A stone seal lands with weight and stops. `back.out` would overshoot and
rebound, which reads as rubber — the wrong material entirely. `power4.out` is
near-instant deceleration: fast approach, dead stop. The over-rotation
(`rot * 3.2 → rot`, so `-12.8° → -4°` for the hero and `9.6° → 3°` for the end
seal) is the hand settling, and the final rotation is deliberately *not* zero —
a hand-pressed seal is never square to the page.

The `.spread` ring follows at `-=0.30` (overlapping the landing):
`{opacity:.85, scale:.82} → {opacity:0, scale:1.55}` over `0.9s power2.out` —
ink pushing outward at the moment of contact.

### Scroll motion

- **Parallax.** `.enso-stage` → `yPercent:-13, rotate:7` and `.hero-text` →
  `yPercent:9`, both `ease:'none'` with `scrub:1.1` across the hero. The paper
  drifts under the brush; the rotation is what sells it as a physical sheet.
- **Band marks.** Per `.band`, a `once:true` trigger at `top 78%` draws every
  `[data-ink]` sweep in that band, staggered `i * .14`.
- **Band headings.** `splitWords()` then `yPercent:108 → 0`, `stagger:.085`,
  `power3.out`, at `top 76%`, `once:true`. Note l.246–247: a blur here would
  smear against the cell's razor clip edge instead of soaking, so **there is no
  blur** — the mask does the work.
- **Content rise.** The `immediateRender:false` batch at `top 74%`,
  `once:true`, `stagger:.07`.
- **End seal.** `stamp(endSeal, 3)` at `.contact top 66%`, `once:true`.

Every scroll reveal is `once:true`. Nothing re-animates on scroll-up.

### Reduced-motion contract

`style.css` l.668–677 plus the `reduce` branch in `app.js`:

- `html{scroll-behavior:auto}` — smooth scroll is motion too.
- All transitions and animations forced to `.01ms`.
- `.portrait, .seal` forced to `opacity:1; transform:none`.
- `.ink-svg [data-mask-stroke]{stroke-dashoffset:0}` — every brush mark renders
  complete, immediately. This is the counterpart to `app.js` l.60, which
  already writes `strokeDashoffset:0` when `animate` is false. Belt and braces:
  the mark is correct even if the JS path is skipped.
- `.display .w>i{transform:none}` — word cells sit at rest.
- `.grain{animation:none}` — texture kept, drift removed.
- `.brush-cursor{display:none!important}` and `.progress{display:none}`.
- In JS, `animate === false` means the hero timeline, all ScrollTriggers, all
  parallax and the entire cursor block never execute.

The page under reduced motion is complete, legible and identical in content.

### Deliberately NOT animated

- `.acts`, `.status`, and everything inside them.
- The masthead's contents (only its own background/padding transition).
- `h2` colour, `.tier` list contents beyond the batch fade, `.foot`.
- Anything on scroll-up.
- The `.v` verification squares — a truth marker does not perform.
- Nothing anywhere uses `filter: blur()`. Nothing uses a glow.

---

## Accessibility contract

- **Contrast floor.** No text token below **5.50:1** is used for text.
  `--ink-4` (3.60:1) and `--hairline` (1.51:1) are non-text only. `--shu`
  (4.17:1) is fills and large text; `--shu-lit` (7.08:1) is the small-text
  vermilion. White on `--shu` = 4.74:1, on `--shu-deep` = 8.05:1. The
  `:focus-visible` outline in `--shu` clears the 3:1 non-text floor.
- **44px minimum tap targets.** Explicit `min-height:44px` on `.mast-nav a`,
  `.mast-cv`, `.links a`, `.tier-foot a`, `.social a`, `.copy`. `.act` computes
  to ~51px from padding; `.dests a` to well over 70px; `.skip` to ~46px. Mobile
  `.mast-nav a` is raised to `min-height:54px`. (Two exceptions are recorded
  under drift.)
- **New-tab announcements.** Every `target="_blank"` link carries
  `<span class="sr"> (opens in a new tab)</span>`. `.sr` is the standard
  1px-clip visually-hidden pattern (`style.css` l.74–77). All 15 external links
  in `index.html` have one; `rel="noopener"` is on every one of them. The two
  `download` résumé links correctly do **not** get the announcement.
- **`aria-current` on nav.** `app.js` l.298–311 creates a ScrollTrigger per
  `section[id]` spanning `top 50%` → `bottom 50%`; on activation it sets
  `aria-current="true"` on the matching `.mast-nav a` and **removes** it from
  the others, alongside the visual `.is-here` class (which turns the brush
  underline vermilion and takes the label to `--ink`). Position is never
  signalled by colour alone.
- **`:focus-visible`.** One global rule: `2px solid var(--shu)` with
  `outline-offset:3px`. Every hover state in the file is duplicated on
  `:focus-visible` — `.mast-nav a`, `.social a`, `.links a`, `.tier-foot a`,
  `.mail`, `.copy`, `.dests a` (wash, arrow-mark and `h3` colour all included).
  No component has a hover affordance a keyboard user cannot reach.
- **Skip link.** `<a class="skip" href="#main">` is the first element in
  `<body>`, parked at `left:-9999px` and brought to `left:10px; top:10px` on
  `:focus`. It targets `<main id="main" tabindex="-1">`, so focus actually
  moves; `#main:focus{outline:none}` suppresses the ring on a container that
  the user did not tab to.
- **Print stylesheet** (`style.css` l.647–666). A recruiter who prints or PDFs
  this must not get black paper. It hides `.grain, .progress, .brush-cursor,
  .masthead, .cue, .enso, .seal, .ink-svg`; forces `#fff` paper and `#111` ink;
  strips every `opacity`, `transform`, `filter`, `animation`, `transition` and
  `background-image`; flattens `.hero-grid, .studio-grid, .tiers` to `display:block`;
  fixes display type to `22pt`; sets `.band{break-inside:avoid}`; and expands
  external URLs via `a[href^="http"]::after{content:" (" attr(href) ")"}`. It
  hides `.copy-note` (a clipboard button on paper is noise) and `.sr` (so the
  expanded URLs don't collide with "(opens in a new tab)").
- **Semantics.** All decoration is `aria-hidden="true"`: `.progress`,
  `.brush-cursor`, `.grain`, every `[data-ink]` host, every `[data-seal]`,
  `.wetdot`, `.wash`, `.mast-seal .mark`. Generated SVGs get `aria-hidden` and
  `focusable="false"`. The `.v` squares are the exception — they are
  `role="img" aria-label="Credly verified"` because they carry meaning.
- **Images.** The portrait, mascot and wordmark all carry descriptive `alt`
  text and intrinsic `width`/`height`. The portrait is `fetchpriority="high"`
  and preloaded; the two brand marks are `loading="lazy"`.

---

## Rules for extending this surface

1. **No glow. Grain only.** No `text-shadow`, no coloured `box-shadow`, no
   `filter: blur()`, no neon halo on any mark. Depth comes from `.grain`, from
   *inset* vignettes, and from ink value. If a new element needs to feel lit,
   it is wrong for this world.

2. **Where a brush mark belongs, use a brush mark.** No `border-radius` circles,
   no `linear-gradient` bars pretending to be strokes, no icon fonts, no
   `border-bottom` link underlines. Rules, ticks, underlines, washes and the
   progress indicator all come from `_gen_ink.py`. Adding a mark means adding a
   generator and re-running the script — see
   [HOW TO ADD A NEW MARK](#6-how-to-add-a-new-mark). The only sanctioned
   geometric primitives are the `.v` verification square, the `.spread` ring,
   the `.seal:not(.has-ring)` fallback border and the `.frame` registration
   corners — all of which are *hanko/printer's-mark* vocabulary, not
   soft-UI vocabulary.

3. **Never hand-edit `assets/ink.js` or `assets/ink-vars.css`.** Change
   `_gen_ink.py`, run `python _gen_ink.py`, commit both outputs. Reuse of an
   existing random seed produces a near-duplicate mark; new generators must
   reseed on their first line and be called after `make_enso()` at l.146.

4. **The seal stamps sparingly.** Two `[data-seal]` marks exist — the hero and
   the close. That is the ceiling. A hanko that appears everywhere is a
   watermark, not a seal. Do not add a third, and do not use `stamp()` on
   anything that is not a seal.

5. **Every new link needs a 44px target and a new-tab announcement.** Any
   `target="_blank"` anchor must carry `rel="noopener"` and
   `<span class="sr"> (opens in a new tab)</span>`. Any interactive element must
   reach 44px of height by `min-height` or padding, and every hover state must
   be duplicated on `:focus-visible`.

6. **Content must survive JS failure.** No text may be hidden by CSS and
   revealed only by JavaScript. Scroll-in animations use `fromTo` with
   `immediateRender:false`. Functional behaviour (clipboard, mark construction)
   is wired **above** the `if (!animate) return` gate at `app.js` l.135. Nothing
   new may be added below that gate unless it is purely decorative.

7. **The Credly seal marks only verified credentials.** `.v` may be applied to
   a skill if and only if a live Credly badge backs it. `PRODUCT.md` is explicit:
   the "31 verified" claim must never appear to cover the resume-evidenced
   languages (C++, C#, TypeScript, JavaScript, HTML, GDScript). The same rule
   generalises: no fabricated metrics, testimonials, employers, star counts or
   awards anywhere on this surface.

8. **Vermilion stays rationed, and small vermilion text uses `--shu-lit`.**
   `--shu` for fills and text ≥24px (or ≥18.66px bold) only. Below that,
   `--shu-lit`. Do not introduce a fifth hue; do not spend `--ember` on anything
   that is not a wet leading edge.

9. **The recruiter's first frame is untouchable.** `.acts` and `.status` are
   never given an `opacity:0`, never added to a GSAP selector, never gated
   behind a scroll trigger. The hero timeline may be re-tuned; the priority
   order (name → rule → role/fact → seal) may not be inverted so that the
   decoration lands before the claim.

10. **Ma is a load-bearing material.** `--gut`, `.band` padding and `.head`
    margin are the page's rhythm. Do not compress them to fit more content;
    remove content instead. Density is the one thing this surface cannot absorb.

---

## Known drift

Recorded honestly. Each entry is code-vs-intent, and the code is the truth.

### 1. The enso opens at the bottom, not the upper right — and travels clockwise

The direction contract (l.29) says *"an enso draws itself in one white stroke,
**open at the upper right**"*, and `_gen_ink.py` l.63 says *"Drawn
**counter-clockwise** from lower-left, opening at the **upper right**."*
Neither is what the geometry does.

`make_enso` sweeps `a0 = 130°` to `a1 = 448°` using
`(cx + cos(a)·r, cy + sin(a)·r)`. Because SVG's y-axis points **down**,
increasing angle traces **clockwise on screen**. Measured from the shipped
`INK.ensoLine` in a 500×500 viewBox:

| Point | Coordinate | On screen |
| --- | --- | --- |
| start (t=0) | `(123.0, 401.3)` | bottom-left |
| t=0.25 | `(70.7, 150.7)` | top-left |
| t=0.50 | `(319.4, 60.1)` | top-right |
| t=0.75 | `(439.5, 280.1)` | mid-right |
| end (t=1) | `(256.7, 440.6)` | bottom-centre |

The 42° opening spans a **139px chord across the bottom** of the circle,
between bottom-centre and bottom-left (roughly 5–7 o'clock). The stroke is
lower-left → left → **top** → right → bottom: clockwise.

This is not a defect — a bottom-opening enso is entirely canonical — but the
contract and the Python docstring both describe a mark the code does not draw.
**If you edit `a0`/`a1`, know that you are moving the opening, and fix both
comments while you are there.**

### 2. The hero seal is not at the stroke's tail

The contract (l.29): *"The crimSun seal stamps at the stroke's tail."* The tail
lands at `(256.7, 440.6)` — **51% across, 88% down** the stage. `.seal-hero` is
positioned `right:2%; bottom:6%`, putting its box at roughly **79–96% across,
76–94% down**. The seal sits to the lower-right of the tail, offset by about a
third of the stage width. Visually it still closes the composition; it is not
where the ink runs out.

### 3. `--ember` is used at two points, not one

The contract (l.27) names ember gold as *"on the wet tip of the scroll stroke"*
— singular. In the code it appears twice:

- `style.css` l.552 — `.progress span` gradient, last 12%. **Intended.**
- `style.css` l.283 — `.status .wetdot`, a `7px` `border-radius:50%` bead
  beside "Open to software engineering roles", pulsing on a 3.4s keyframe.

The `.wetdot` is a second, unaccounted ember point *and* a rounded-geometry
mark in a system that otherwise refuses them (rule 2 above). It is defensible
as a bead of wet ink and it draws the eye to the availability line, which is
strategically correct — but it is drift, and anyone reading the contract will
be surprised to find it.

### 4. There are two seals; the contract describes one

`[data-seal]` matches exactly two elements: `.seal-hero` (`index.html` l.65) and
`.seal-end` (l.222). The contract only narrates the hero stamp. The second is
not a contradiction — the story arc *"stamps at the stroke's tail … leaves
through an email address"* is served by closing the page with the same mark —
but it is undocumented in the contract. A third static instance of the flame
(`.mast-seal .mark`, 19px, masked, never stamped) also exists in the masthead.
Two `[data-seal]` is the documented ceiling.

### 5. `--sumi-rise: #121114` is declared and never used

`style.css` l.10. Zero consumers across HTML, CSS and JS. Either find it a job
(a raised surface between `--sumi` and `--sumi-deep` would be the obvious one)
or delete it. Leaving it invites someone to assume a three-step ground scale
exists when the page only ships two.

### 6. `[data-rise]` in the reduced-motion block matches nothing

`style.css` l.671:
`.portrait,.seal,[data-rise]{opacity:1!important;transform:none!important}`.
No element in `index.html` has a `data-rise` attribute and `app.js` never adds
one — the rise batch is selected by an explicit selector list
(`app.js` l.257–260). The guard is dead. **This is a real gap**: if the
`immediateRender:false` convention were ever dropped from that batch, reduced
motion would not catch it. Either add `data-rise` to those elements and select
on it, or mirror the actual selector list into the reduced-motion rule.

### 7. The heading word-cell reveal lacks `immediateRender:false`

`app.js` l.248–252 animates the split `h2` cells `{yPercent:108} → {yPercent:0}`
**without** `immediateRender:false`, unlike the `.rise` batch 15 lines below it
which carries the guard and the comment explaining why. GSAP applies the `from`
state at setup, so between page load and the trigger firing the band headings
sit 108% below their cells. In practice this is safe — `splitWords()` and the
tween only run when `animate` is true, and the triggers do fire — but it is the
one scroll reveal that does not follow the stated convention.

Related: `G.set(endSeal, {opacity:0})` at l.274 is a hard `set`, not a `fromTo`.
If its trigger never fires, `.seal-end` stays invisible permanently. Acceptable
only because it is `aria-hidden` decoration.

### 8. `.portrait` and `.seal` start at `opacity:0` in CSS

`style.css` l.211 and l.232. They are the only two elements on the page whose
visibility depends on JavaScript running. `app.js` covers the two expected
failure modes (`if (!animate)` at l.135 sets them to 1, and reduced motion
forces them via `!important`), but if `assets/app.js` itself fails to load or
throws before l.135, the hero shows an empty circle and no seal.

All *text* survives — `PRODUCT.md`'s "content must survive JavaScript failure"
is met in substance — but the hero imagery does not. The safer construction is
CSS-visible-by-default plus a JS-added `.is-animating` class on `<html>`.

### 9. Two interactive targets fall under 44px

- **`.mast-seal`** (`style.css` l.142) — the back-to-top link in the masthead.
  `display:flex; align-items:center; gap:10px` with no `min-height` and no
  padding; it computes to roughly **28px** tall (a 19px mark beside a 16px
  label at line-height 1.75). Below the 44px floor stated in rule 5 and honoured
  by every other link on the page.
- **`.cue`** (`style.css` l.291) — ~19px of text plus a 7px mark. Mitigated by
  `display:none` ≤1000px, so it is desktop-pointer-only, but still small.

### 10. `.mail:hover` can drop below AA in a narrow viewport band

`.mail:hover{color:var(--shu)}` (l.494) at `font-size:clamp(17px,2.6vw,34px)`.
`--shu` is 4.17:1 — fine as large text (≥24px), which requires a viewport of
about **923px** or wider for `2.6vw` to reach 24px. Between roughly 654px and
923px with a fine pointer, a hovered address renders at 17–24px in a 4.17:1
vermilion, under the 4.5:1 normal-text floor. Everywhere else on the page,
small vermilion text correctly uses `--shu-lit`. **Fix by swapping
`.mail:hover` to `--shu-lit`,** which is what the stated colour rule requires.

### 11. `PRODUCT.md` asks for a data layer that does not exist

*"Project, repository, and skill data lives in a local data file … structured so
a live-fetch source could replace it later without touching the UI."*
(`PRODUCT.md`, Capabilities and Constraints.) All content is hand-authored
directly in `index.html` — the four `.dests` rows, the twenty `.v`-marked
skills, both email addresses and all seven social links are literal markup.
There is no data file and no separation between content and UI.

This is a deliberate-looking simplification consistent with "no build step, no
framework", and it costs nothing today at this content volume. It is recorded
because the constraint was written down and is not met: swapping in a live
source later means rewriting the markup.

### 12. Structural leftovers in `style.css`

- The `/* ===== REDUCED MOTION ===== */` banner sits at l.642–643 with **no
  rules under it**; the actual `@media (prefers-reduced-motion:reduce)` block is
  at l.668, *after* the print block. A reader scanning by section headers will
  conclude reduced motion is unimplemented.
- `.display .w>i{… filter:none!important}` in that block guards a blur that was
  removed (`app.js` l.246–247 explains why it was removed). Harmless, but
  vestigial.
- `app.js` carries two consecutive banner comments for one block —
  `/* ==== brush cursor ==== */` (l.313) immediately followed by
  `/* ==== the brush tip ==== */` (l.315).
