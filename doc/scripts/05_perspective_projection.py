"""05 - 透视投影视锥体（Frustum）示意图"""
import numpy as np
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d.art3d import Poly3DCollection
from common import setup_font; setup_font()

def frustum_faces(fov_deg, aspect, near, far):
    fov = np.radians(fov_deg / 2)
    hn, wn = near * np.tan(fov), near * np.tan(fov) * aspect
    hf, wf = far  * np.tan(fov), far  * np.tan(fov) * aspect
    n = [[-wn,-hn,near],[wn,-hn,near],[wn,hn,near],[-wn,hn,near]]
    f = [[-wf,-hf,far], [wf,-hf,far], [wf,hf,far], [-wf,hf,far]]
    return np.array(n), np.array(f)

fig = plt.figure(figsize=(8, 5))
ax = fig.add_subplot(111, projection='3d')

near, far, fov = 0.5, 3.5, 45
n, f = frustum_faces(fov, 1.0, near, far)

faces = [
    [n[0],n[1],n[2],n[3]],
    [f[0],f[1],f[2],f[3]],
    [n[0],n[1],f[1],f[0]],
    [n[2],n[3],f[3],f[2]],
    [n[0],n[3],f[3],f[0]],
    [n[1],n[2],f[2],f[1]],
]
poly = Poly3DCollection(faces, alpha=0.12, facecolor='#3498db', edgecolor='#2980b9', linewidth=0.8)
ax.add_collection3d(poly)

eye = np.array([0, 0, 0])
for v in f:
    ax.plot([0, v[0]], [0, v[1]], [0, v[2]], color='#2980b9', lw=0.8, alpha=0.5)

ax.scatter(0, 0, 0, color='#e67e22', s=80, zorder=5)
ax.text(0, 0, -0.3, 'eye', color='#e67e22', fontsize=11, fontweight='bold')
ax.quiver(0, 0, 0, 0, 0, far+0.3, color='#e74c3c', arrow_length_ratio=0.06, lw=1.5)
ax.text(0, 0.05, far+0.5, '-Z (view)', color='#e74c3c', fontsize=10)
ax.text(0, n[3][1]+0.1, near, f'near={near}', color='#27ae60', fontsize=9)
ax.text(0, f[3][1]+0.1, far,  f'far={far}',   color='#8e44ad', fontsize=9)
ax.plot(np.zeros(30), np.zeros(30), np.linspace(0, near, 30), 'k--', lw=1, alpha=0.4)
ax.text(-0.05, n[3][1]*0.55, near*0.5, f'fov/2={fov//2}°', fontsize=9, color='#7f8c8d')

ax.set_xlabel('X'); ax.set_ylabel('Y'); ax.set_zlabel('Z (depth)')
ax.set_xlim(-2, 2); ax.set_ylim(-2, 2); ax.set_zlim(-0.5, 4.5)
ax.view_init(elev=18, azim=-55)
ax.set_title(f'透视视锥体  fov={fov}°  near={near}  far={far}', fontsize=12, pad=10)

plt.tight_layout()
plt.savefig('../images/05_perspective_projection.png', dpi=150, bbox_inches='tight')
print('saved: ../images/05_perspective_projection.png')
