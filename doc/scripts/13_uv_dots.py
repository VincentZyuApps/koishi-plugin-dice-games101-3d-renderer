"""13 - 骰子六面 UV 点数布局（来自 shader.ts DOT_PATTERNS）"""
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from common import setup_font; setup_font()

DOT_PATTERNS = {
    1: [(0.5, 0.5)],
    2: [(0.25, 0.75), (0.75, 0.25)],
    3: [(0.25, 0.75), (0.5, 0.5), (0.75, 0.25)],
    4: [(0.25, 0.25), (0.75, 0.25), (0.25, 0.75), (0.75, 0.75)],
    5: [(0.25, 0.25), (0.75, 0.25), (0.5, 0.5), (0.25, 0.75), (0.75, 0.75)],
    6: [(0.25, 0.2), (0.75, 0.2), (0.25, 0.5), (0.75, 0.5), (0.25, 0.8), (0.75, 0.8)],
}
R = 0.09
FACE_COLORS = ['#3498db', '#2ecc71', '#e74c3c', '#e74c3c', '#2ecc71', '#3498db']
AXIS_LABELS = ['+Z', '+Y', '+X', '-X', '-Y', '-Z']

fig, axes = plt.subplots(2, 3, figsize=(9, 6))
for i, ax in enumerate(axes.flat):
    face_id = i + 1
    ax.set_xlim(-0.05, 1.05); ax.set_ylim(-0.05, 1.05); ax.set_aspect('equal')
    ax.add_patch(patches.Rectangle((0,0), 1, 1, linewidth=2,
                                    edgecolor=FACE_COLORS[i], facecolor='#fdfefe'))
    for (cx, cy) in DOT_PATTERNS[face_id]:
        ax.add_patch(plt.Circle((cx, cy), R, color='#2c3e50', zorder=3))
        ax.plot(cx, cy, '+', color='#7f8c8d', ms=5, lw=0.7, zorder=4)
    for v in [0.25, 0.5, 0.75]:
        ax.axhline(v, color='#ecf0f1', lw=0.7, ls='--')
        ax.axvline(v, color='#ecf0f1', lw=0.7, ls='--')
    ax.set_xticks([0, 0.25, 0.5, 0.75, 1.0]); ax.set_yticks([0, 0.25, 0.5, 0.75, 1.0])
    ax.tick_params(labelsize=7)
    ax.set_title(f'面 {face_id} 点  ({AXIS_LABELS[i]} 面)',
                 fontsize=10, color=FACE_COLORS[i], fontweight='bold')
    ax.text(0.5, -0.01, 'u →', ha='center', va='top', fontsize=8, color='#7f8c8d',
            transform=ax.transData, clip_on=False)

fig.suptitle('骰子六面点数 UV 布局  (r = 0.09,  UV [0,1]²)', fontsize=13, y=1.01)
plt.tight_layout()
plt.savefig('../images/13_uv_dots.png', dpi=150, bbox_inches='tight')
print('saved: ../images/13_uv_dots.png')
