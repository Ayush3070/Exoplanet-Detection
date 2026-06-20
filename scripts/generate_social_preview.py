#!/usr/bin/env python3
"""Generate a social preview image for the GitHub repository."""
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from pathlib import Path

out = Path(__file__).resolve().parent.parent / ".github" / "social-preview.png"
out.parent.mkdir(parents=True, exist_ok=True)

fig, ax = plt.subplots(figsize=(1280 / 100, 640 / 100), dpi=100)
fig.patch.set_facecolor("#0a0a0a")
ax.set_xlim(0, 1280)
ax.set_ylim(0, 640)
ax.axis("off")

center = 640, 320

circle = mpatches.Circle(center, 180, color="#111111", zorder=1)
ax.add_patch(circle)

for r, alpha in [(140, 0.03), (100, 0.06), (60, 0.1)]:
    c = mpatches.Circle(center, r, color="#89AACC", alpha=alpha, zorder=0)
    ax.add_patch(c)

dot_positions = [
    (520, 260), (640, 240), (760, 280),
    (580, 380), (700, 360), (640, 420),
    (490, 330), (790, 310), (550, 220),
    (730, 230), (610, 460), (670, 200),
]
for x, y in dot_positions:
    d = mpatches.Circle((x, y), 2.5, color="#89AACC", alpha=0.7, zorder=2)
    ax.add_patch(d)

ax.text(640, 240, "Exoplanet", fontsize=52, color="#F5F5F5",
        fontfamily="serif", fontstyle="italic",
        ha="center", va="center", zorder=3)
ax.text(640, 290, "Detector", fontsize=52, color="#F5F5F5",
        fontfamily="serif", fontstyle="italic",
        ha="center", va="center", zorder=3)

ax.text(640, 370, "ML Pipeline  ·  Transit Method  ·  React Portfolio",
        fontsize=14, color="#878787",
        ha="center", va="center", zorder=3,
        fontfamily="sans-serif")

ax.text(640, 410, "github.com/Ayush3070/Exoplanet-Detection",
        fontsize=11, color="#555555",
        ha="center", va="center", zorder=3,
        fontfamily="sans-serif")

plt.savefig(out, dpi=100, bbox_inches="tight", pad_inches=0, facecolor="#0a0a0a")
print(f"Saved: {out}")
