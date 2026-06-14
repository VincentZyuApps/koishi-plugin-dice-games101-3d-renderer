"""12 - 法线变换矩阵 (M^-1)^T 几何可视化"""
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from common import setup_font; setup_font()

def draw_surface(ax, verts, normal_start, normal_dir, color, label_normal, title):
    tri = plt.Polygon(verts, facecolor=color, edgecolor='#2c3e50', lw=1.8, alpha=0.6, zorder=2)
    ax.add_patch(tri)
    ax.annotate('', xy=normal_start + normal_dir,
                xytext=normal_start,
                arrowprops=dict(arrowstyle='->', color='#e74c3c', lw=2.5))
    ax.text(*(normal_start + normal_dir*1.15), label_normal,
            color='#e74c3c', fontsize=14, fontweight='bold', ha='center')
    ax.set_title(title, fontsize=10, wrap=True)
    ax.set_aspect('equal'); ax.axis('off')

fig, axes = plt.subplots(1, 3, figsize=(12, 4.5))

v0 = np.array([[0,0],[2,2],[0,2]], dtype=float)
t_orig = np.array([1.0,1.0]) / np.sqrt(2)
n_orig = np.array([-1.0,1.0]) / np.sqrt(2)

ax = axes[0]
ax.cla(); ax.set_xlim(-0.5, 2.8); ax.set_ylim(-0.5, 2.8)
draw_surface(ax, v0, np.array([0.8,1.0]), n_orig*0.9,
             '#aed6f1', r'$\hat{n}$', '原始：法线 ⊥ 表面')
ax.annotate('', xy=(2.0,2.0), xytext=(0,0),
            arrowprops=dict(arrowstyle='->', color='#2c3e50', lw=1.5, alpha=0.5))
ax.text(1.2, 0.8, r'$\hat{t}$', ha='center', color='#2c3e50', fontsize=11)

M = np.diag([2.5, 1.0])
v1 = (M @ v0.T).T
t1_wrong = (M @ t_orig); t1_wrong /= np.linalg.norm(t1_wrong)
n1_wrong = (M @ n_orig); n1_wrong /= np.linalg.norm(n1_wrong)
n1_correct = (np.linalg.inv(M).T @ n_orig); n1_correct /= np.linalg.norm(n1_correct)

ax2 = axes[1]
ax2.set_xlim(-0.5, 5.5); ax2.set_ylim(-0.5, 2.8)
draw_surface(ax2, v1, np.array([1.8, 1.0]), n1_wrong*0.9,
             '#fadbd8', r'$M\hat{n}$', f'直接用 M：法线偏移\n(不再⊥表面!)')
ax2.annotate('', xy=(v1[1][0], v1[1][1]), xytext=(v1[0][0], v1[0][1]),
            arrowprops=dict(arrowstyle='->', color='#2c3e50', lw=1.5, alpha=0.5))
ax2.text(2.0, 0.8, r'$M\hat{t}$', ha='center', color='#2c3e50', fontsize=11)
dot = np.dot(t1_wrong, n1_wrong)
ax2.text(1.8, 2.5, f'n·t = {dot:.2f} ≠ 0  ❌', color='#e74c3c', fontsize=10,
         bbox=dict(boxstyle='round', facecolor='#fadbd8', alpha=0.8))

ax3 = axes[2]
ax3.set_xlim(-0.5, 5.5); ax3.set_ylim(-0.5, 2.8)
draw_surface(ax3, v1, np.array([1.8, 1.0]), n1_correct*0.9,
             '#d5f5e3', r'$(M^{-1})^T\hat{n}$', r'用 $(M^{-1})^T$：法线正确' + '\n(仍⊥表面)')
ax3.annotate('', xy=(v1[1][0], v1[1][1]), xytext=(v1[0][0], v1[0][1]),
            arrowprops=dict(arrowstyle='->', color='#2c3e50', lw=1.5, alpha=0.5))
ax3.text(2.0, 0.8, r'$M\hat{t}$', ha='center', color='#2c3e50', fontsize=11)
dot2 = np.dot(t1_wrong, n1_correct)
ax3.text(1.5, 2.5, f'n·t = {dot2:.2f} ≈ 0  ✓', color='#27ae60', fontsize=10,
         bbox=dict(boxstyle='round', facecolor='#d5f5e3', alpha=0.8))

fig.suptitle(r'法线变换矩阵：非均匀缩放时需用 $(M^{-1})^T$ 而非 $M$', fontsize=12, y=1.02)
plt.tight_layout()
plt.savefig('../images/12_normal_matrix.png', dpi=150, bbox_inches='tight')
print('saved: ../images/12_normal_matrix.png')
