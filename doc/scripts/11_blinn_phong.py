"""11 - Blinn-Phong 镜面高光模型（基于 src/view/shader.ts）"""
import numpy as np
import matplotlib.pyplot as plt
from common import setup_font; setup_font()

fig, axes = plt.subplots(1, 3, figsize=(14, 5))

# ---- 左图：向量几何 ----
ax = axes[0]
ax.set_xlim(-0.3, 2.6); ax.set_ylim(-0.5, 2.3); ax.set_aspect('equal'); ax.axis('off')
ax.set_title('Blinn-Phong 向量几何', fontsize=11)

surface_x = np.array([0, 2.3])
ax.plot(surface_x, [0,0], color='#7f8c8d', lw=3)
ax.fill_between(surface_x, [-0.35,-0.35], [0,0], color='#ecf0f1')

origin = np.array([1.1, 0.0])
# 法线 n
n = np.array([0, 1.0])
ax.annotate('', xy=origin+n*1.3, xytext=origin, arrowprops=dict(arrowstyle='->', color='#2c3e50', lw=2.5))
ax.text(origin[0]+0.06, origin[1]+0.75, r'$\hat{n}$', fontsize=16, color='#2c3e50', fontweight='bold')

# 光源方向 l (45°)
l = np.array([np.cos(np.radians(135)), np.sin(np.radians(135))])
ax.annotate('', xy=origin+l*1.2, xytext=origin, arrowprops=dict(arrowstyle='->', color='#e67e22', lw=2.5))
ax.text(origin[0]+l[0]*0.65-0.1, l[1]*0.65+0.05, r'$\hat{l}$', fontsize=16, color='#e67e22', fontweight='bold')

# 视线方向 v (30° right)
v = np.array([np.cos(np.radians(60)), np.sin(np.radians(60))])
ax.annotate('', xy=origin+v*1.2, xytext=origin, arrowprops=dict(arrowstyle='->', color='#3498db', lw=2.5))
ax.text(origin[0]+v[0]*0.65+0.05, v[1]*0.65+0.05, r'$\hat{v}$', fontsize=16, color='#3498db', fontweight='bold')

# 半角向量 h = normalize(l + v)
h = (l + v) / np.linalg.norm(l + v)
ax.annotate('', xy=origin+h*1.2, xytext=origin, arrowprops=dict(arrowstyle='->', color='#8e44ad', lw=2.5, linestyle='--'))
ax.text(origin[0]+h[0]*0.7+0.05, h[1]*0.7+0.05, r'$\hat{h}$', fontsize=16, color='#8e44ad', fontweight='bold')

# n·h 角弧
theta_nh = np.arccos(np.dot(n, h))
arc = np.linspace(np.pi/2, np.pi/2-theta_nh, 20)
ax.plot(origin[0]+0.5*np.cos(arc), origin[1]+0.5*np.sin(arc), color='#8e44ad', lw=1.5)
ax.text(origin[0]-0.28, origin[1]+0.45, r'$\hat{n}\cdot\hat{h}$', fontsize=11, color='#8e44ad')
ax.text(0.1, 1.9,
        r'$L_s = k_s \cdot \max(0,\,\hat{n}\cdot\hat{h})^p$',
        fontsize=11, color='#8e44ad',
        bbox=dict(boxstyle='round,pad=0.3', facecolor='#f5eef8', alpha=0.9))
ax.text(0.1, 1.5, r'$\hat{h} = \mathrm{normalize}(\hat{l}+\hat{v})$', fontsize=10, color='#7f8c8d')

# ---- 中图：shininess 曲线 ----
ax2 = axes[1]
theta = np.linspace(0, np.pi/2, 200)
shininess_vals = [4, 16, 32, 64, 128]
cmap = plt.cm.plasma
for i, p in enumerate(shininess_vals):
    c = cmap(i / len(shininess_vals))
    ax2.plot(np.degrees(theta), np.maximum(0, np.cos(theta))**p,
             color=c, lw=2, label=f'p = {p}')
ax2.set_xlabel(r'$\hat{n}\cdot\hat{h}$ 夹角 θ (°)'); ax2.set_ylabel(r'$\max(0,\cos\theta)^p$')
ax2.set_title('shininess p 对高光集中度的影响', fontsize=11)
ax2.legend(fontsize=9); ax2.grid(True, alpha=0.3)
ax2.set_xlim(0, 90); ax2.set_ylim(0, 1.05)
ax2.set_xticks([0, 30, 60, 90])

# ---- 右图：各项贡献对比（以 θ=30° 为例） ----
ax3 = axes[2]
theta_arr = np.linspace(0, np.pi, 300)
ka, kd, ks, p = 0.15, 0.85, 0.6, 32
L_a = np.full_like(theta_arr, ka)
L_d = kd * np.maximum(0, np.cos(theta_arr))
# for specular, assume n·h ≈ cos(θ/2) (approximate)
L_s = ks * np.maximum(0, np.cos(theta_arr/2))**p
L_total = L_a + L_d + L_s

ax3.fill_between(np.degrees(theta_arr), 0, L_a, alpha=0.5, color='#3498db', label=r'$k_a$ 环境光')
ax3.fill_between(np.degrees(theta_arr), L_a, L_a+L_d, alpha=0.4, color='#e67e22', label=r'$k_d$ 漫反射')
ax3.fill_between(np.degrees(theta_arr), L_a+L_d, np.minimum(1.0, L_a+L_d+L_s), alpha=0.5, color='#8e44ad', label=r'$k_s$ 高光')
ax3.plot(np.degrees(theta_arr), np.minimum(1.0, L_total), color='#2c3e50', lw=2, label='总亮度 L')
ax3.set_xlabel('入射角 θ (°)'); ax3.set_ylabel('亮度 L')
ax3.set_title(f'三项贡献  $k_a$={ka} $k_d$={kd} $k_s$={ks} p={p}', fontsize=11)
ax3.legend(fontsize=8, loc='upper right'); ax3.grid(True, alpha=0.3)
ax3.set_xlim(0, 180); ax3.set_ylim(0, 1.1)
ax3.set_xticks([0, 45, 90, 135, 180])

fig.suptitle('完整 Blinn-Phong 模型：环境光 + 漫反射 + 镜面高光', fontsize=13, y=1.01)
plt.tight_layout()
plt.savefig('../images/11_blinn_phong.png', dpi=150, bbox_inches='tight')
print('saved: ../images/11_blinn_phong.png')
