"""04 - MVP 变换四阶段：模型空间 → View空间 → NDC → 屏幕"""
import numpy as np
import matplotlib.pyplot as plt
from common import setup_font; setup_font()

def cube_edges():
    v = np.array([[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],
                  [-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]], dtype=float)*0.5
    e = [(0,1),(1,2),(2,3),(3,0),(4,5),(5,6),(6,7),(7,4),(0,4),(1,5),(2,6),(3,7)]
    return v, e

def Ry(a): return np.array([[np.cos(a),0,np.sin(a)],[0,1,0],[-np.sin(a),0,np.cos(a)]])
def Rx(a): return np.array([[1,0,0],[0,np.cos(a),-np.sin(a)],[0,np.sin(a),np.cos(a)]])

verts, edges = cube_edges()
R = Rx(np.radians(20)) @ Ry(np.radians(35))
rv = verts @ R.T  # rotated

stages = [
    ('① Model 空间\n本地坐标 [-0.5, 0.5]³', verts,  '#3498db'),
    ('② View 空间\n相机在原点，骰子旋转后', rv,     '#2ecc71'),
    ('③ NDC\n透视投影后 [-1, 1]³',  rv * np.array([0.55, 0.55, 0.4]), '#e67e22'),
    ('④ 屏幕像素\n视口变换 [0, W]×[0, H]', rv * np.array([0.55, -0.55, 0.0]), '#e74c3c'),
]

fig = plt.figure(figsize=(14, 4))
for i, (title, v, color) in enumerate(stages):
    ax = fig.add_subplot(1, 4, i+1, projection='3d')
    for a, b in edges:
        ax.plot(*zip(v[a], v[b]), color=color, lw=1.8, alpha=0.85)
    ax.set_xlim(-0.9,0.9); ax.set_ylim(-0.9,0.9); ax.set_zlim(-0.9,0.9)
    ax.set_xticks([]); ax.set_yticks([]); ax.set_zticks([])
    ax.set_box_aspect([1,1,1])
    ax.view_init(elev=18, azim=-50)
    ax.grid(False); ax.set_facecolor('#f8f9fa')
    ax.set_title(title, fontsize=9.5, pad=6, color=color)

# 矩阵标签
for j, (lbl, x) in enumerate([('Model\n矩阵', 0.265), ('View\n矩阵', 0.49), ('Projection\n矩阵', 0.715)]):
    fig.text(x, 0.48, f'→\n{lbl}', ha='center', va='center', fontsize=8.5, color='#7f8c8d')

fig.suptitle('MVP 变换四阶段', fontsize=13, y=1.01)
plt.tight_layout()
plt.savefig('../images/04_mvp_stages.png', dpi=150, bbox_inches='tight')
print('saved: ../images/04_mvp_stages.png')
