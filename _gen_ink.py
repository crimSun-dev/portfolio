"""
Generates authentic sumi-e brush geometry as SVG path data.

A real brush stroke is a FILLED shape with variable width, not a stroked line:
  - wet, blunt entry where the loaded brush first touches
  - a swelling body as pressure peaks
  - a taper as the brush lifts
  - kasure (dry-brush split) at the tail where the ink runs out

Each stroke also emits a CENTERLINE path. app.js animates a thick stroke along
that centreline inside an SVG <mask>, so the filled brush shape is revealed in
the direction a brush would actually travel. That is the "ink being laid down"
effect — not a fade-in.
"""
import math, json, random

random.seed(7)


def noise(seed_pts, t):
    """Smooth pseudo-noise in [-1,1] by cosine-interpolating a fixed point set."""
    n = len(seed_pts)
    x = t * (n - 1)
    i = int(math.floor(x))
    f = x - i
    a = seed_pts[max(0, min(n - 1, i))]
    b = seed_pts[max(0, min(n - 1, i + 1))]
    f2 = (1 - math.cos(f * math.pi)) / 2
    return a * (1 - f2) + b * f2


def fmt(pts):
    d = "M" + " L".join("%.1f,%.1f" % p for p in pts)
    return d + " Z"


def line(pts):
    return "M" + " L".join("%.1f,%.1f" % p for p in pts)


def ribbon(centre, widths):
    """Build a filled outline from a centreline + per-point half-widths."""
    left, right = [], []
    n = len(centre)
    for i in range(n):
        x, y = centre[i]
        if i == 0:
            dx, dy = centre[1][0] - x, centre[1][1] - y
        elif i == n - 1:
            dx, dy = x - centre[-2][0], y - centre[-2][1]
        else:
            dx = centre[i + 1][0] - centre[i - 1][0]
            dy = centre[i + 1][1] - centre[i - 1][1]
        L = math.hypot(dx, dy) or 1.0
        nx, ny = -dy / L, dx / L
        w = widths[i]
        left.append((x + nx * w, y + ny * w))
        right.append((x - nx * w, y - ny * w))
    return fmt(left + right[::-1])


# ----------------------------------------------------------------- enso 円相
# Drawn counter-clockwise from lower-left, opening at the upper right.
def make_enso(N=150, R=200, cx=250, cy=250):
    # SVG angles are y-down: 0 = right, 90 = bottom, 270 = top.
    # Start at the upper right and travel clockwise, so the ~42 degree opening
    # lands back at the upper right where the composition wants the air.
    a0 = math.radians(335)
    a1 = math.radians(335 + 318)
    wob = [random.uniform(-1, 1) for _ in range(9)]
    wob2 = [random.uniform(-1, 1) for _ in range(13)]

    centre, widths = [], []
    for i in range(N):
        t = i / (N - 1)
        a = a0 + (a1 - a0) * t
        r = R + noise(wob, t) * 7.0 + math.sin(t * 5.1) * 3.0
        centre.append((cx + math.cos(a) * r, cy + math.sin(a) * r))

        # pressure curve: blunt wet entry, swell at 30%, long lift-off taper
        if t < 0.045:
            w = 15.5 + t * 90                      # brush lands and spreads
        elif t < 0.42:
            w = 19.5 + math.sin((t - 0.045) * 3.4) * 4.4
        else:
            k = min(1.0, max(0.0, (t - 0.42) / 0.58))
            w = 21.0 * (1 - k) ** 1.75 + 1.4       # lift
        w += noise(wob2, t) * 1.5
        widths.append(max(0.7, w))

    body = ribbon(centre, widths)

    # kasure: at the dry tail the brush splits into separate hairs
    hairs = []
    tail = int(N * 0.80)
    for k, off in enumerate((-6.0, 0.0, 5.2)):
        hc, hw = [], []
        for i in range(tail, N):
            t = (i - tail) / (N - tail - 1)
            x, y = centre[i]
            dx = centre[min(i + 1, N - 1)][0] - centre[i - 1][0]
            dy = centre[min(i + 1, N - 1)][1] - centre[i - 1][1]
            L = math.hypot(dx, dy) or 1.0
            nx, ny = -dy / L, dx / L
            sp = off * (0.35 + t * 1.5)
            hc.append((x + nx * sp, y + ny * sp))
            hw.append(max(0.35, (2.9 - k * 0.55) * max(0.0, 1 - t) ** 1.35))
        hairs.append(ribbon(hc, hw))

    return body, hairs, line(centre)


# ------------------------------------------------- horizontal strokes 一
def make_h(N=110, W=600, weight=1.0, dry=0.5, seed=3):
    random.seed(seed)
    wob = [random.uniform(-1, 1) for _ in range(7)]
    centre, widths = [], []
    for i in range(N):
        t = i / (N - 1)
        x = t * W
        y = 40 + noise(wob, t) * 3.2 * weight
        centre.append((x, y))
        if t < 0.04:
            w = 5 + t * 210 * weight
        elif t < 0.30:
            w = (12.5 + math.sin(t * 7) * 2.0) * weight
        else:
            k = min(1.0, max(0.0, (t - 0.30) / 0.70))
            w = (13.0 * (1 - k) ** (1.0 + dry * 1.8) + 0.8) * weight
        widths.append(max(0.4, w + noise(wob, t * 1.7) * 0.9 * weight))
    return ribbon(centre, widths), line(centre)


# ------------------------------------------------------- seal ring 印
def make_seal_ring(N=120, R=96, cx=110, cy=110, t=9.0):
    random.seed(11)
    wob = [random.uniform(-1, 1) for _ in range(11)]
    outer, inner = [], []
    for i in range(N + 1):
        p = i / N
        a = p * math.tau - math.pi / 2
        j = noise(wob, p) * 3.4
        outer.append((cx + math.cos(a) * (R + j), cy + math.sin(a) * (R + j)))
        inner.append((cx + math.cos(a) * (R + j - t), cy + math.sin(a) * (R + j - t)))
    return "M" + " L".join("%.1f,%.1f" % p for p in outer) + " Z M" + \
           " L".join("%.1f,%.1f" % p for p in inner[::-1]) + " Z"


enso_body, enso_hairs, enso_line = make_enso()
h_heavy, h_heavy_l = make_h(weight=1.0, dry=0.35, seed=3)
h_mid,   h_mid_l   = make_h(weight=0.62, dry=0.6, seed=5)
h_light, h_light_l = make_h(weight=0.34, dry=0.95, seed=9)
h_rule,  h_rule_l  = make_h(weight=0.22, dry=0.8, seed=13)

data = {
    "enso": enso_body,
    "ensoHairs": enso_hairs,
    "ensoLine": enso_line,
    "heavy": h_heavy, "heavyLine": h_heavy_l,
    "mid": h_mid, "midLine": h_mid_l,
    "light": h_light, "lightLine": h_light_l,
    "rule": h_rule, "ruleLine": h_rule_l,
    "sealRing": make_seal_ring(),
}


# ---------------------------------------------- CSS-embeddable marks
# Small, self-contained brush shapes used as CSS backgrounds and masks, so
# every underline and wash on the page has a ragged ink edge instead of a
# geometric one. Kept short enough to live inside a data URI.

def compact(path_d):
    return path_d.replace(" L", "L").replace(" Z", "Z")


def svg_uri(path_d, w, h, fill="%23fff"):
    s = ("%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 {w} {h}' "
         "preserveAspectRatio='none'%3E%3Cpath fill='{f}' d='{d}'/%3E%3C/svg%3E")
    return s.format(w=w, h=h, f=fill, d=compact(path_d).replace("#", "%23"))


def make_underline(N=34, W=200, H=12):
    random.seed(21)
    wob = [random.uniform(-1, 1) for _ in range(6)]
    c, wd = [], []
    for i in range(N):
        t = i / (N - 1)
        c.append((t * W, H / 2 + noise(wob, t) * 1.15))
        if t < 0.06:
            w = 1.1 + t * 42
        else:
            k = min(1.0, max(0.0, (t - 0.06) / 0.94))
            w = 3.6 * (1 - k) ** 0.85 + 0.55
        wd.append(max(0.28, w + noise(wob, t * 2.1) * 0.32))
    return ribbon(c, wd)


def make_wash_edge(N=40, W=200, H=100):
    """A filled block whose right edge is a ragged, wet ink boundary."""
    random.seed(29)
    wob = [random.uniform(-1, 1) for _ in range(9)]
    wob2 = [random.uniform(-1, 1) for _ in range(17)]
    pts = [(0.0, 0.0)]
    for i in range(N + 1):
        t = i / N
        x = W - 9 + noise(wob, t) * 5.5 + noise(wob2, t) * 3.0
        pts.append((x, t * H))
    pts.append((0.0, H))
    return "M" + " L".join("%.1f,%.1f" % p for p in pts) + " Z"


def make_vertical(N=44, H=200, W=12):
    """Same brush, drawn downward — for the scroll stroke in the left margin."""
    random.seed(37)
    wob = [random.uniform(-1, 1) for _ in range(7)]
    c, wd = [], []
    for i in range(N):
        t = i / (N - 1)
        c.append((W / 2 + noise(wob, t) * 1.25, t * H))
        if t < 0.05:
            w = 1.2 + t * 52
        else:
            k = min(1.0, max(0.0, (t - 0.05) / 0.95))
            w = 3.9 * (1 - k) ** 0.7 + 0.6
        wd.append(max(0.3, w + noise(wob, t * 1.9) * 0.34))
    return ribbon(c, wd)


with open("assets/ink-vars.css", "w", encoding="utf8") as f:
    f.write("/* generated brush shapes for CSS — see _gen_ink.py */\n:root{\n")
    f.write("  --brush-underline:url(\"data:image/svg+xml,%s\");\n" % svg_uri(make_underline(), 200, 12))
    f.write("  --brush-wash:url(\"data:image/svg+xml,%s\");\n" % svg_uri(make_wash_edge(), 200, 100))
    f.write("  --brush-vertical:url(\"data:image/svg+xml,%s\");\n" % svg_uri(make_vertical(), 12, 200))
    f.write("}\n")
print("wrote assets/ink-vars.css")

with open("assets/ink.js", "w", encoding="utf8") as f:
    f.write("/* generated brush geometry — see _gen_ink.py */\nwindow.INK=")
    f.write(json.dumps(data, separators=(",", ":")))
    f.write(";\n")

print("wrote assets/ink.js")
for k, v in data.items():
    print("  %-11s %6d chars" % (k, len(v) if isinstance(v, str) else sum(map(len, v))))
