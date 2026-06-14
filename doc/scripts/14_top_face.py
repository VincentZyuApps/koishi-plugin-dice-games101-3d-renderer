"""14 - 顶面判断：getTopFace 算法可视化（基于 src/models/dice.ts）"""
import numpy as np
import matplotlib.pyplot as plt
from common import setup_font; setup_font()

def Ry(a): return np.array([[np.cos(a),0,np.sin(a)],[0,1,0],[-np.sin(a),0,np.cos(a)]])
def Rx(a): return np.array([[1,0,0],[0,np.cos(a),-np.sin(a)],[0,np.sin(a),np.cos(a)]])

# 骰子6面初始法线 + 点数（来自 dice.ts）
FACES = [
    {'n': np.array([0,0, 1], float), 'val': 1, 'color': '#3498db',  'label': '+Z (1点)'},
    {'n': np.array([0,0,-1], float), 'val': 6, 'color': '#2980b9',  'label': '-Z (6点)'},
    {'n': np.array([0, 1, 0], float),'val': 2, 'color': '#2ecc71',  'label': '+Y (2点)'},
    {'n': np.array([0,-1, 0], float),'val': 5, 'color': '#27ae60',  'label': '-Y (5点)'},
    {'n': np.array([ 1,0, 0], float),'val': 3, 'color': '#e74c3c',  'label': '+X (3点)'},
    {'n': np.array([-1,0, 0], float),'val': 4, 'color': '#c0392b',  'label': '-X (4点)'},
]

# 施加旋转 yaw=40° pitch=25°
R = Rx(np.radians(25)) @ Ry(np.radians(40))
for f in FACES:
    f['rn'] = R @ f['n']

top_face = max(FACES, key=lambda f: f['rn'][1])

fig = plt.figure(figsize=(13, 5))

# ---- 左图：旋转后法线（3D） ----
ax = fig.add_subplot(1, 2, 1, projection='3d')

# 画一个简单的骰子骨架
cube_v = np.array([[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],
                   [-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]], float)*0.45
cube_e = [(0,1),(1,2),(2,3),(3,0),(4,5),(5,6),(6,7),(7,4),(0,4),(1,5),(2,6),(3,7)]
for a,b in cube_e:
    vr = cube_v @ R.T
    ax.plot(*zip(vr[a], vr[b]), color='#bdc3c7', lw=1, alpha=0.6)

# 法线箭头
for f in FACES:
    is_top = f is top_face
    lw = 3.5 if is_top else 1.8
    alpha = 1.0 if is_top else 0.6
    rn = f['rn']
    ax.quiver(0, 0, 0, rn[0], rn[1], rn[2],
              color=f['color'], lw=lw, alpha=alpha, arrow_length_ratio=0.15,
              length=0.75)
    offset = rn * 0.88
    ax.text(offset[0], offset[1], offset[2]+0.05,
            f"val={f['val']}", fontsize=8, color=f['color'],
            fontweight='bold' if is_top else 'normal')

# 标注最高Y
ax.quiver(0, 0, 0, 0, 1, 0, color='#f39c12', lw=2, linestyle='--',
          arrow_length_ratio=0.1, length=1.1, alpha=0.5)
ax.text(0.05, 1.12, 0, '世界 +Y\n(向上)', fontsize=8, color='#f39c12')

ax.set_xlim(-1,1); ax.set_ylim(-1,1); ax.set_zlim(-1,1)
ax.set_xticks([]); ax.set_yticks([]); ax.set_zticks([])
ax.set_box_aspect([1,1,1]); ax.view_init(elev=20, azim=-40)
ax.grid(False); ax.set_facecolor('#f8f9fa')
ax.set_title('旋转后各面法线（yaw=40° pitch=25°）', fontsize=10)

# ---- 右图：各面 Y 分量柱状图 ----
ax2 = fig.add_subplot(1, 2, 2)
face_labels = [f['label'] for f in FACES]
y_vals = [f['rn'][1] for f in FACES]
bar_colors = [('#f39c12' if f is top_face else f['color']) for f in FACES]
bars = ax2.bar(range(6), y_vals, color=bar_colors, edgecolor='#2c3e50', linewidth=0.8)
ax2.axhline(0, color='#7f8c8d', lw=1)
ax2.set_xticks(range(6))
ax2.set_xticklabels(face_labels, rotation=20, ha='right', fontsize=9)
ax2.set_ylabel(r'旋转后法线的 Y 分量  $M_{[1,:]}\cdot\hat{n}$')
ax2.set_title('顶面 = Y分量最大的面', fontsize=11)
ax2.grid(True, axis='y', alpha=0.3)

# 标注最大值
top_idx = next(i for i, f in enumerate(FACES) if f is top_face)
ax2.annotate(f'▲ 顶面：{top_face["val"]}点\n({top_face["label"]})',
             xy=(top_idx, top_face['rn'][1]),
             xytext=(top_idx+0.6, top_face['rn'][1]+0.08),
             fontsize=10, color='#f39c12', fontweight='bold',
             arrowprops=dict(arrowstyle='->', color='#f39c12', lw=1.5))

for i, (v, bar) in enumerate(zip(y_vals, bars)):
    ax2.text(bar.get_x()+bar.get_width()/2, v + 0.02*np.sign(v),
             f'{v:.2f}', ha='center', va='bottom' if v>=0 else 'top', fontsize=8)

fig.suptitle('顶面判断：getTopFace  取旋转后法线 Y 分量最大的面', fontsize=12, y=1.01)
plt.tight_layout()
plt.savefig('../images/14_top_face.png', dpi=150, bbox_inches='tight')
print('saved: ../images/14_top_face.png')
