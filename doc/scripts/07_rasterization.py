"""07 - 光栅化：AABB 包围盒 + 边缘函数 + 重心坐标"""
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from common import setup_font; setup_font()

fig, axes = plt.subplots(1, 2, figsize=(11, 5))

ax = axes[0]
A, B, C = np.array([1.5, 6.0]), np.array([7.0, 1.5]), np.array([8.5, 7.5])
tri = plt.Polygon([A, B, C], fill=False, edgecolor='#2c3e50', lw=2.5, zorder=3)
ax.add_patch(tri)

xmin, xmax = int(np.floor(min(A[0],B[0],C[0]))), int(np.ceil(max(A[0],B[0],C[0])))
ymin, ymax = int(np.floor(min(A[1],B[1],C[1]))), int(np.ceil(max(A[1],B[1],C[1])))

def edge(P, Q, pt): return (Q[0]-P[0])*(pt[1]-P[1]) - (Q[1]-P[1])*(pt[0]-P[0])
def inside(pt):
    return edge(A,B,pt)>=0 and edge(B,C,pt)>=0 and edge(C,A,pt)>=0

for x in range(0, 10):
    for y in range(0, 10):
        p = np.array([x+0.5, y+0.5])
        color = '#e74c3c' if inside(p) else '#bdc3c7'
        ax.scatter(p[0], p[1], color=color, s=35, zorder=2)

rect = patches.Rectangle((xmin, ymin), xmax-xmin, ymax-ymin,
                           linewidth=1.5, edgecolor='#3498db', facecolor='#ebf5fb', alpha=0.3, zorder=1)
ax.add_patch(rect)
ax.text(xmin+0.05, ymax+0.2, 'AABB', color='#3498db', fontsize=10)

for pt, name in [(A,'A'),(B,'B'),(C,'C')]:
    ax.scatter(*pt, color='#2c3e50', s=60, zorder=4)
    ax.text(pt[0]+0.1, pt[1]+0.2, name, fontsize=12, fontweight='bold')

ax.set_xlim(0, 10); ax.set_ylim(0, 10)
ax.set_aspect('equal'); ax.set_title('AABB 包围盒 + 边缘函数判内外', fontsize=11)
ax.set_xlabel('screen x'); ax.set_ylabel('screen y')

ax2 = axes[1]
tri2 = plt.Polygon([A, B, C], facecolor='#fef9e7', edgecolor='#2c3e50', lw=2.5, zorder=1)
ax2.add_patch(tri2)

P = np.array([5.5, 5.0])
eAB = edge(A,B,B+np.array([0,0.001]));  alpha = edge(B,C,P) / edge(B,C,A)
eBC = edge(B,C,C+np.array([0,0.001]));  beta  = edge(C,A,P) / edge(C,A,B)
gamma = 1 - alpha - beta

ax2.scatter(*P, color='#e74c3c', s=80, zorder=5)
ax2.text(P[0]+0.15, P[1]+0.2, f'P', fontsize=12, fontweight='bold', color='#e74c3c')

for pt, name, val, color in [(A,'A',alpha,'#e74c3c'),(B,'B',beta,'#2ecc71'),(C,'C',gamma,'#3498db')]:
    ax2.plot([P[0],pt[0]], [P[1],pt[1]], '--', color=color, lw=1.2, alpha=0.7)
    ax2.scatter(*pt, color='#2c3e50', s=60, zorder=4)
    ax2.text(pt[0]+0.1, pt[1]+0.2, f'{name}', fontsize=12, fontweight='bold')
    mid = (P + pt) / 2
    ax2.text(mid[0]+0.1, mid[1], f'{"αβγ"[["A","B","C"].index(name)]}={val:.2f}',
             fontsize=9, color=color)

ax2.text(1.5, 0.5, f'α+β+γ = {alpha+beta+gamma:.2f} = 1', fontsize=10,
         color='#7f8c8d', style='italic')

ax2.set_xlim(0, 10); ax2.set_ylim(0, 10)
ax2.set_aspect('equal'); ax2.set_title('重心坐标  α·A + β·B + γ·C = P', fontsize=11)
ax2.set_xlabel('screen x'); ax2.set_ylabel('screen y')

plt.suptitle('光栅化核心：AABB 遍历 + 重心坐标插值', fontsize=13, y=1.01)
plt.tight_layout()
plt.savefig('../images/07_rasterization.png', dpi=150, bbox_inches='tight')
print('saved: ../images/07_rasterization.png')
