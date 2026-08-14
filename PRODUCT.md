# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Static HTML/CSS/JS with GSAP for scroll-driven motion (user decision). No build step, no framework, no server runtime. Must deploy as a plain folder to GitHub Pages, Netlify, or Vercel without configuration.

## Users

**Primary:** technical recruiters, hiring managers, and engineering leads evaluating Draven Chen for a software engineering role. They arrive from a LinkedIn profile, a resume link, or a cold application, usually on desktop, usually skimming under time pressure with several other candidates open in adjacent tabs. Their job is to decide within roughly thirty seconds whether this candidate is worth a real conversation, and then to find the evidence that justifies that decision to someone else.

**Secondary:** indie game developers, collaborators, itch.io players, and potential publishers discovering crimSun Studios. They arrive from itch.io, Instagram, or word of mouth, often on mobile, and are evaluating whether the studio and its founder are worth following.

When a design decision can only serve one audience, the recruiter wins. crimSun is not a competing track — it is the differentiator that makes the recruiter remember this candidate over the other nine.

## Product Purpose

A single-page personal portfolio that converts a stranger into either a job interview or a studio follower. Success is measured by contact actions: an inbound recruiter email, a LinkedIn connection, a GitHub visit that leads to a real read of the code, or an itch.io play. The site must simultaneously prove engineering rigor (verifiable credentials, real repositories, shipped projects) and creative ambition (crimSun as a real studio with real published work), without the second undermining the credibility of the first.

## Positioning

Draven Chen is a Computer Science undergraduate who has already shipped commercial and public software under his own studio label — a Godot editor plugin sold as an asset, two WebGL games playable in-browser with no install. The claim a neighboring student portfolio cannot truthfully copy: *this candidate does not describe projects, he ships them, and you can play them in your browser right now without downloading anything.* The founder-of-crimSun framing is credible precisely because the artifacts exist and are public.

## Operating Context

- Recruiters evaluate on desktop, in a browser tab, in parallel with other candidates. Many will scan without scrolling to the bottom. Any critical proof buried below the fold is proof that does not exist.
- Secondary discovery is mobile-first, arriving from Instagram or itch.io links.
- The site is one URL with no login, no backend, and no analytics dependency. It must be entirely self-contained.
- All external destinations (GitHub, Credly, itch.io, LinkedIn, Instagram, YouTube) are off-site; the site's job is to route qualified attention to them, not to replace them.

## Capabilities and Constraints

- **Single page, scroll-driven.** No routing, no multi-page navigation.
- **The work is presented in aggregate, never project by project.** Draven's decision: the site routes to his GitHub profile, his academic-portfolio repo, and his itch.io page as whole destinations. It does not build a section, card, or case study for VERA AI, Sunnyside World, Tiny Swords, or any other individual project — he has far more work than the resume names, and per-project sections would both undersell the volume and go stale. Named projects may appear only as incidental evidence inside a destination's description, never as the structure.
- **Content is static and hand-curated, authored directly as markup.** No runtime API calls to GitHub, itch.io, or Instagram — the GitHub unauthenticated API is rate-limited per IP and would fail silently on a shared corporate network, and itch.io and Instagram have no usable public API. Because the site presents destinations rather than per-project listings, the content is small enough that a separate data file would be indirection without benefit; skills and destinations live in `index.html`. If per-item content ever returns, extract it to a data file first.
- **No fabricated content.** No invented testimonials, employers, metrics, client logos, awards, star counts, download numbers, or press. Every project claim traces to `Draven_Chen_Resume.docx` or a live public URL.
- **Motion is non-negotiable but must degrade.** `prefers-reduced-motion` must be honored, and the site must remain fully readable and navigable with JavaScript disabled or GSAP failed.
- **Images are large and unoptimized as delivered** (up to 2296×4080). They require resizing and modern-format conversion before ship; ffmpeg is available on this machine.

## Brand Commitments

- **Name:** crimSun / crimSun Studios. Lowercase `c`, capital `S` — always. Never "Crimsun", "CrimSun", or "Crim Sun".
- **Logo assets are binding and must be used as provided** (in `Images/`): a chibi mascot roundel with flame and black cat, a standalone flame mark, and a horizontal wordmark in both light and dark treatments. These are existing brand artifacts, not placeholders to be redrawn.
- **Palette derives from the existing logos** — crimson through blood-orange to solar gold, against void black. Dark by default. This is an existing brand fact, not a style choice being made here.
- **Personal name:** Draven Chen. Role framing: Software Engineer / Game Systems Programmer; founder of crimSun.
- **Voice:** confident, technical, and specific. Founder-who-codes, not a student applying. Never inflate — the artifacts carry the weight, the copy does not need to.

## Evidence on Hand

**Real, verifiable, and safe to cite:**

- `Draven_Chen_Resume.docx` — source of truth for every project and skill claim. Also to be converted to PDF and offered as a download.
- `Edit Skills - Credly.html` — saved Credly skills wallet, 31 verified skills.
- `Images/` — four photographs of Draven (Japan trip: street food, Tokyo station plaza, Dragon Ball store, Nintendo store) and four crimSun logo variants (chibi mascot roundel, flame mark, wordmark light, wordmark dark).
- **Shipped projects:** VERA AI (Godot editor plugin, commercial asset on itch.io), Sunnyside World (Unity 2D WebGL survival sandbox), Tiny Swords Last Stand (WebGL tower-defense prototype).
- **Open source:** `crimSun-chrome-mcp` (TypeScript, Model Context Protocol browser integration), `perangkat_it`, `academic-assignments-project-portfolio`.
- **crimSun Power Engine** — a universal power and levelling system (CR-compression, two-zone sigmoidal damage, five-tier ki combat) built as a static browser app and shipped inside this site at `crimsun-power-engine-itch/`. It is an ES-module build, so it requires HTTP; it will not run from a `file://` open. Reachable from the masthead scouter key and from The Work.
- **Education:** BS Computer Science, Southern New Hampshire University, in progress, graduating mid-2027. (Note: `Draven_Chen_Resume.docx` still says "Expected 2028" and needs correcting at source.)
- **Coursework passed (self-reported, not Credly-verified):** Calculus I, Calculus II, Calculus III, Differential Equations. Confirmed by Draven; must never carry the Credly seal.
- **Engines (resume-evidenced, not Credly-verified):** Unity (surfaced on the site), plus Godot and Unreal Engine with C++ and Blueprints per the résumé — the latter two are true and available to add but are not currently listed on the site.
- **Dragon Ball Sol** — a Unity prototype with a combat HUD, forms and ki values driven by the crimSun Power Engine. Source at `github.com/crimSun-dev/unity_dragonballsol_prototype`; play-mode capture shipped as a teaser tile.
- **Languages (resume-evidenced, not Credly-verified):** C++, C#, TypeScript, JavaScript, HTML, GDScript. These are real and confirmed by Draven, but they carry no third-party credential, so any surface listing them alongside Credly skills must visually distinguish the two. Never let the "31 verified" claim appear to cover them.
- **Skills (31 Credly-verified), priority order:** Python, Java, Computer Science, Algorithms, Computer Programming, Software Engineering, Software Design, Software Architecture, Systems Design, Web Development, Web Applications, APIs, Database Design, Database Administration, Database Development, SQL, Operating Systems, SDLC, Statistics, Statistical Probability, Statistical Sampling, Linear Algebra, Causal Inference, Data Presentation, Systems Thinking, Intel x86 Assembly.
- **Creator identity (two channels).** `FuseoN` (youtube.com/@fuseon8463) is the competitive Minecraft PvP archive — Build UHC, duels, DemocracyCraft faction warfare. `FuSon` (youtube.com/@itsFuSon) is the wider channel: reviews, livestreams, travel and food shorts. Real video IDs held so far: `oH3YOsGIun4`, `0ZyBtxCI4Go` (Pancasila, educational, non-PvP). More are expected; they are added to the `REELS` map at the top of `app.js` and need no other change.
- **Competitive record (self-reported by Draven):** #1 Build UHC daily streak at 101; #1 daily win streak at 51; #3 on the Build UHC ladder at 1,650 ELO; 3,097 W / 217 L for a 14.27 ratio; UHC duel level 210 with a 53-win run; peak specialist ELO 10,001. Screenshot evidence in `assets/proof/builduhc-elo.webp`.
- **DemocracyCraft figures are NOT self-reported** and must always be attributed to the server's own published history, never restated in Draven's voice: 250 → 550–600 daily joins in two weeks, ~200,000 views, 10,000 likes, subscriber base doubled to 5,000; server passed 100 concurrent players on 28 March 2021; third trailer 12 April 2021. Screenshot in `assets/proof/dc-impact.webp`.
- **Steam (steamcommunity.com/id/ITSFUSON):** 4 perfect games, 133 achievements in perfect games, Xenoverse 2 at 61/61, Z: Kakarot at 42/42, 95 games and 183 DLC owned. Screenshot in `assets/proof/steam-completionist.webp`.
- **Origin story facts:** first two projects were 8th-grade HTML school assignments in 2018, both still live at `crimsun-dev.github.io/first-ever-website/` and `/first-ever-webgroup-project/`. Every handle references the sun. Sun Wukong and Son Goku are the stated touchstones. Planet Minecraft uploads (`techthelazercore`) are nine years old.
- **Sponsorship interest (aspiration, never a claim of existing deals):** Nintendo, ROG, Razer, Logitech on hardware; Bandai and Banpresto on figures. Any surface must phrase this as something Draven wants, never as a partnership he has.
- **Location:** Bogor, West Java, Indonesia — remote-ready.
- **Email:** two addresses, both confirmed for public display as live mailto links. draven.chen1st@gmail.com is the direct/personal contact and stays primary; crimsun.studio1st@gmail.com is the crimSun studio address.
- **Links:** github.com/crimSun-dev · github.com/crimSun-dev/academic-assignments-project-portfolio · credly.com/users/draven-chen · instagram.com/crimsun.studio · crimsun-studios.itch.io · linkedin.com/in/draven-chen-151764357 · youtube.com/@itsFuSon · youtube.com/@fuseon8463

**Explicitly absent — must never be invented:** professional employment history, internships, testimonials, references, client work, download or star counts, revenue figures, team members, awards, press coverage, and any studio staff beyond Draven himself.

## Product Principles

1. **Proof over assertion.** Every claim on this page must be one click from a live artifact — a repo, a playable build, a Credly badge, a resume line. Where no artifact exists, the claim does not exist.
2. **The recruiter's thirty seconds are sacred.** Name, role, credibility, and a path to contact must land in the first viewport. Everything below the fold is for the visitor who has already decided to keep reading.
3. **crimSun is evidence, not decoration.** The studio earns its place by proving Draven ships independently and finishes things — not by making the site look like a game.
4. **Ambition without inflation.** The voice can be bold about what Draven intends to build; it must be exact about what he has already built. A student who oversells reads as a student. A student who undersells shipped work reads as a hire.
5. **Motion serves comprehension.** Animation directs the eye through the argument and rewards the scroll. Any motion that delays reading, blocks interaction, or cannot be turned off is a defect.

## Accessibility & Inclusion

- `prefers-reduced-motion` must be fully honored — the site remains complete and legible with all motion suppressed.
- Full keyboard navigability with visible focus states; every external link reachable and announced.
- WCAG AA contrast minimum for all body and interface text, including text over the dark background and over any image treatment.
- Content must survive JavaScript failure: no text that only exists after a scroll-trigger fires.
