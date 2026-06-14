"""02 - 齐次坐标：为什么需要第四维 w"""
import numpy as np
import matplotlib.pyplot as plt
from common import setup_font; setup_font()

fig, axes = plt.subplots(1, 2, figsize=(12, 5))

# ---- 左图：2D平移无法用2×2矩阵表示 ----
ax = axes[0]
ax.set_xlim(-0.5, 5); ax.set_ylim(-0.5, 3.5)
ax.set_aspect('equal'); ax.axis('off')
ax.set_title('2D空间：平移不是线性变换', fontsize=12)

ax.scatter(1, 0, color='#3498db', s=120, zorder=5)
ax.text(1.1, 0.15, 'P = (1, 0)', fontsize=11, color='#3498db')
ax.scatter(3, 1, color='#e74c3c', s=120, zorder=5)
ax.text(3.1, 1.15, "P' = (3, 1)", fontsize=11, color='#e74c3c')
ax.annotate('', xy=(3, 1), xytext=(1, 0),
            arrowprops=dict(arrowstyle='->', color='#27ae60', lw=2.2))
ax.text(1.65, 0.85, '平移 (+2, +1)', color='#27ae60', fontsize=10)

ax.text(0.1, 2.5, '任意 2×2 矩阵 M：', fontsize=11, color='#2c3e50')
ax.text(0.1, 2.1, r'$M \cdot (1,\,0)^\top = (a,\,c)^\top \neq (3,\,1)^\top$', fontsize=12, color='#e74c3c')
ax.text(0.3, 1.8, '线性变换无法表示平移', color='#e74c3c', fontsize=11)

# ---- 右图：齐次坐标解决问题 ----
ax2 = axes[1]
ax2.axis('off')
ax2.set_title('齐次坐标：升到 3D 后平移变成矩阵乘法', fontsize=12)

ax2.text(0.05, 0.88,
         '3×3 平移矩阵（w=1 点）：\n'
         r'$T(t_x,t_y)\cdot(x,\,y,\,1)^\top = (x+t_x,\;y+t_y,\;1)^\top$',
         fontsize=12, transform=ax2.transAxes)

ax2.text(0.05, 0.42,
         r'$T(2,1)\cdot(1,\,0,\,1)^\top = (3,\,1,\,1)^\top$  (OK)',
         fontsize=12, transform=ax2.transAxes,
         bbox=dict(boxstyle='round,pad=0.4', facecolor='#d5f5e3', alpha=0.8))

ax2.text(0.05, 0.22, r'$w=1$：点（位置，受平移影响）', fontsize=11,
         color='#3498db', transform=ax2.transAxes)
ax2.text(0.05, 0.10, r'$w=0$：向量（方向，平移项消失）', fontsize=11,
         color='#e67e22', transform=ax2.transAxes)

fig.suptitle('齐次坐标：引入 w 分量，统一平移/旋转/投影为矩阵乘法', fontsize=13, y=1.01)
plt.tight_layout()
plt.savefig('../images/02_homogeneous_coords.png', dpi=150, bbox_inches='tight')
print('saved: ../images/02_homogeneous_coords.png')
