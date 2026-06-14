"""03 - Yaw / Pitch / Roll 三轴旋转示意图"""
import numpy as np
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D
from common import setup_font; setup_font()

def draw_cube_edges(ax, R=np.eye(3), color='#3498db', alpha=0.35):
    """画一个旋转后的单位正方体骨架"""
    verts = np.array([[-1,-1,-1],[ 1,-1,-1],[ 1, 1,-1],[-1, 1,-1],
                      [-1,-1, 1],[ 1,-1, 1],[ 1, 1, 1],[-1, 1, 1]], dtype=float) * 0.4
    verts = verts @ R.T
    edges = [(0,1),(1,2),(2,3),(3,0),(4,5),(5,6),(6,7),(7,4),
             (0,4),(1,5),(2,6),(3,7)]
    for i,j in edges:
        ax.plot(*zip(verts[i], verts[j]), color=color, lw=1.2, alpha=alpha)

def arrow3(ax, start, end, color, lw=2.5):
    d = np.array(end) - np.array(start)
    ax.quiver(*start, *d, color=color, arrow_length_ratio=0.2, lw=lw)

configs = [
    ('Yaw（偏航）', 'Y 轴', np.array([0,1,0]), '#2ecc71', 45),
    ('Pitch（俯仰）', 'X 轴', np.array([1,0,0]), '#e74c3c', 30),
    ('Roll（翻滚）', 'Z 轴', np.array([0,0,1]), '#3498db', 60),
]

fig = plt.figure(figsize=(12, 4))
for i, (title, axis_name, axis, color, deg) in enumerate(configs):
    ax = fig.add_subplot(1, 3, i+1, projection='3d')
    draw_cube_edges(ax, color='#95a5a6')

    # 旋转后的骰子
    a = np.radians(deg)
    if i == 0:   R = np.array([[np.cos(a),0,np.sin(a)],[0,1,0],[-np.sin(a),0,np.cos(a)]])
    elif i == 1: R = np.array([[1,0,0],[0,np.cos(a),-np.sin(a)],[0,np.sin(a),np.cos(a)]])
    else:        R = np.array([[np.cos(a),-np.sin(a),0],[np.sin(a),np.cos(a),0],[0,0,1]])
    draw_cube_edges(ax, R=R, color=color, alpha=0.9)

    # 旋转轴箭头
    arrow3(ax, -axis*0.7, axis*0.7, color)
    ax.text(*(axis*0.8), axis_name, color=color, fontsize=10, fontweight='bold')

    # 弧形角度标注（简单模拟）
    theta = np.linspace(0, np.radians(deg), 30)
    if i == 0:   arc = np.column_stack([0.55*np.sin(theta), np.zeros(30), 0.55*np.cos(theta)])
    elif i == 1: arc = np.column_stack([np.zeros(30), -0.55*np.sin(theta), 0.55*np.cos(theta)])
    else:        arc = np.column_stack([0.55*np.cos(theta), 0.55*np.sin(theta), np.zeros(30)])
    ax.plot(arc[:,0], arc[:,1], arc[:,2], color=color, lw=1.5, ls='--', alpha=0.8)
    mid = arc[len(arc)//2]
    ax.text(mid[0]*1.25, mid[1]*1.25, mid[2]*1.25, f'{deg}°', color=color, fontsize=9)

    ax.set_xlim(-0.8,0.8); ax.set_ylim(-0.8,0.8); ax.set_zlim(-0.8,0.8)
    ax.set_xticks([]); ax.set_yticks([]); ax.set_zticks([])
    ax.set_box_aspect([1,1,1])
    ax.view_init(elev=20, azim=-50)
    ax.grid(False)
    ax.set_facecolor('#f8f9fa')
    ax.set_title(title, fontsize=12, pad=8)

fig.suptitle('Yaw / Pitch / Roll  骰子三轴旋转', fontsize=13, y=1.01)
plt.tight_layout()
plt.savefig('../images/03_yaw_pitch_roll.png', dpi=150, bbox_inches='tight')
print('saved: ../images/03_yaw_pitch_roll.png')
