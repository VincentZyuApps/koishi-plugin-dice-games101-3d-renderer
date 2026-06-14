"""06 - 透视除法与视口变换：NDC → 屏幕像素"""
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from common import setup_font; setup_font()

fig, axes = plt.subplots(1, 3, figsize=(12, 5))

# ---- 左图：NDC空间 [-1,1]² ----
ax = axes[0]
ax.set_xlim(-1.6, 1.6); ax.set_ylim(-1.6, 1.6); ax.set_aspect('equal')
ax.add_patch(patches.Rectangle((-1,-1), 2, 2, lw=2, edgecolor='#3498db', facecolor='#ebf5fb', alpha=0.5))
ax.axhline(0, color='#bdc3c7', lw=0.8, ls='--')
ax.axvline(0, color='#bdc3c7', lw=0.8, ls='--')
ax.annotate('', xy=(1.4,0), xytext=(0,0), arrowprops=dict(arrowstyle='->', color='#e74c3c', lw=2))
ax.annotate('', xy=(0,1.4), xytext=(0,0), arrowprops=dict(arrowstyle='->', color='#2ecc71', lw=2))
ax.text(1.42, 0.05, 'x', fontsize=13, color='#e74c3c', fontweight='bold')
ax.text(0.06, 1.42, 'y ↑', fontsize=13, color='#2ecc71', fontweight='bold')
for x,y,lb in [(-1,-1,'(-1,-1)'),(1,-1,'(1,-1)'),(1,1,'(1,1)'),(-1,1,'(-1,1)')]:
    ax.scatter(x, y, color='#2c3e50', s=40, zorder=5)
    ax.text(x+0.05, y+0.08, lb, fontsize=8)
ax.set_title('NDC 空间\n[-1, 1]²  Y 轴向上', fontsize=11)
ax.set_xticks([-1,0,1]); ax.set_yticks([-1,0,1])

# ---- 中图：公式 ----
ax2 = axes[1]
ax2.axis('off'); ax2.set_title('视口变换公式', fontsize=11)
for y_pos, formula in [(0.72, r'$x_s = \dfrac{x_\mathrm{NDC}+1}{2} \cdot W$'),
                        (0.38, r'$y_s = \dfrac{1 - y_\mathrm{NDC}}{2} \cdot H$')]:
    ax2.text(0.5, y_pos, formula, ha='center', fontsize=14, transform=ax2.transAxes,
             bbox=dict(boxstyle='round,pad=0.5', facecolor='#fef9e7', alpha=0.9))
ax2.text(0.5, 0.15, 'Y 轴翻转\n屏幕左上角为原点', ha='center', fontsize=10,
         color='#e74c3c', transform=ax2.transAxes)

# ---- 右图：屏幕空间 [0,W]×[0,H] ----
W, H = 400, 400
ax3 = axes[2]
ax3.set_xlim(-50, W+50); ax3.set_ylim(H+50, -50); ax3.set_aspect('equal')
ax3.add_patch(patches.Rectangle((0,0), W, H, lw=2, edgecolor='#e74c3c', facecolor='#fdedec', alpha=0.5))
ax3.annotate('', xy=(W*0.85,0), xytext=(0,0), arrowprops=dict(arrowstyle='->', color='#e74c3c', lw=2))
ax3.annotate('', xy=(0,H*0.85), xytext=(0,0), arrowprops=dict(arrowstyle='->', color='#2ecc71', lw=2))
ax3.text(W*0.87, -12, 'x', fontsize=13, color='#e74c3c', fontweight='bold')
ax3.text(8, H*0.87, 'y ↓', fontsize=13, color='#2ecc71', fontweight='bold')
for x,y,lb in [(0,0,'(0,0)'),(W,0,'(W,0)'),(W,H,'(W,H)'),(0,H,'(0,H)')]:
    ax3.scatter(x, y, color='#2c3e50', s=40, zorder=5)
    ax3.text(x+6, y+18, lb, fontsize=8)
ax3.set_title(f'屏幕空间\n[0, {W}] × [0, {H}]  Y 轴向下', fontsize=11)
ax3.set_xticks([0, W//2, W]); ax3.set_yticks([0, H//2, H])

fig.suptitle('透视除法与视口变换', fontsize=13, y=1.01)
plt.tight_layout()
plt.savefig('../images/06_viewport_transform.png', dpi=150, bbox_inches='tight')
print('saved: ../images/06_viewport_transform.png')
