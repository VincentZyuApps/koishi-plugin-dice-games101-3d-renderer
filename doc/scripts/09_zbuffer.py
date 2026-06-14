"""09 - Z-buffer 深度测试示意图"""
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.colors import Normalize
from matplotlib.cm import ScalarMappable
from common import setup_font; setup_font()

fig, axes = plt.subplots(1, 3, figsize=(13, 4.5))

W = 120

def tri_depth(x_arr, apex_x, base_z, tip_z, half_w):
    t = np.clip(1 - np.abs(x_arr - apex_x) / half_w, 0, 1)
    return base_z + (tip_z - base_z) * t

xs = np.linspace(0, 1, W)
z_red  = tri_depth(xs, 0.35, 0.9, 0.3, 0.45)
z_blue = tri_depth(xs, 0.65, 0.8, 0.4, 0.40)
z_buf = np.minimum(z_red, z_blue)
red_visible  = z_red  <= z_blue + 1e-6
blue_visible = z_blue <  z_red

ax = axes[0]
ax.plot(xs, 1-z_red,  color='#e74c3c', lw=2.5, label='红色三角形')
ax.plot(xs, 1-z_blue, color='#3498db', lw=2.5, label='蓝色三角形')
ax.fill_between(xs, 0, 1-z_red,  alpha=0.15, color='#e74c3c')
ax.fill_between(xs, 0, 1-z_blue, alpha=0.15, color='#3498db')
ax.set_xlabel('屏幕 x'); ax.set_ylabel('1 − z  (越高越近)')
ax.set_title('侧视：两三角形深度', fontsize=11)
ax.legend(fontsize=9); ax.grid(True, alpha=0.3)
ax.set_xlim(0, 1); ax.set_ylim(0, 1)

ax2 = axes[1]
cmap = plt.cm.viridis_r
img = np.tile(z_buf, (50, 1))
ax2.imshow(img, aspect='auto', cmap=cmap, vmin=0.2, vmax=1.0, origin='lower', extent=[0,1,0,1])
ax2.set_xlabel('屏幕 x'); ax2.set_yticks([])
ax2.set_title('Z-buffer（深色=更近）', fontsize=11)
fig.colorbar(ScalarMappable(norm=Normalize(0.2,1.0), cmap=cmap),
             ax=ax2, fraction=0.046, pad=0.04, label='深度 z')

ax3 = axes[2]
colors = np.zeros((50, W, 3))
colors[:, red_visible]  = [0.91, 0.30, 0.24]
colors[:, blue_visible] = [0.20, 0.60, 0.86]
ax3.imshow(colors, aspect='auto', origin='lower', extent=[0,1,0,1])
ax3.set_xlabel('屏幕 x'); ax3.set_yticks([])
ax3.set_title('最终渲染（Z-test 后）', fontsize=11)
ax3.legend(handles=[mpatches.Patch(color='#e74c3c', label='红色可见'),
                    mpatches.Patch(color='#3498db', label='蓝色可见')], fontsize=9, loc='upper center')

fig.suptitle('Z-buffer 深度测试：z < depthBuffer[x] 则写入', fontsize=12, y=1.01)
plt.tight_layout()
plt.savefig('../images/09_zbuffer.png', dpi=150, bbox_inches='tight')
print('saved: ../images/09_zbuffer.png')
