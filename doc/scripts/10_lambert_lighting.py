"""10 - Lambert 漫反射光照模型示意图"""
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from common import setup_font; setup_font()

fig, axes = plt.subplots(1, 2, figsize=(11, 5), gridspec_kw={'width_ratios': [0.618, 1]})

ax = axes[0]
ax.set_xlim(-0.3, 2.5); ax.set_ylim(-0.5, 2.2); ax.set_aspect('equal')

surface_x = np.array([0, 2.0])
ax.plot(surface_x, [0, 0], color='#7f8c8d', lw=3)
ax.fill_between(surface_x, [-0.4, -0.4], [0, 0], color='#ecf0f1')

ax.annotate('', xy=(1.0, 1.4), xytext=(1.0, 0),
            arrowprops=dict(arrowstyle='->', color='#2c3e50', lw=2.5))
ax.text(1.05, 0.8, r'$\hat{n}$', fontsize=16, color='#2c3e50', fontweight='bold')

theta = np.radians(40)
lx, ly = np.cos(theta+np.pi/2)*1.3, np.sin(theta+np.pi/2)*1.3
ax.annotate('', xy=(1.0+lx, 0+ly), xytext=(1.0, 0),
            arrowprops=dict(arrowstyle='->', color='#e67e22', lw=2.5))
ax.text(1.0+lx*0.55+0.05, ly*0.55+0.05, r'$\hat{l}$', fontsize=16, color='#e67e22', fontweight='bold')

arc_theta = np.linspace(np.pi/2, np.pi/2+theta, 30)
ax.plot(1.0+0.45*np.cos(arc_theta), 0.45*np.sin(arc_theta), color='#8e44ad', lw=1.5)
ax.text(1.0+0.38*np.cos(np.pi/2+theta/2)-0.12,
        0.38*np.sin(np.pi/2+theta/2)+0.05, r'$\theta$', fontsize=14, color='#8e44ad')

ax.text(0.05, 1.8,
        r'$L = k_a I_a + k_d \cdot \max(0,\, \hat{n}\cdot\hat{l}) \cdot I_d$',
        fontsize=12, color='#2c3e50',
        bbox=dict(boxstyle='round,pad=0.4', facecolor='#fef9e7', alpha=0.9))
ax.set_title('Lambert 光照  几何关系', fontsize=11); ax.axis('off')

ax2 = axes[1]
theta_arr = np.linspace(0, np.pi, 200)
ambient = 0.15
diffuse = 0.85 * np.maximum(0, np.cos(theta_arr))
total = ambient + diffuse

ax2.fill_between(np.degrees(theta_arr), 0, diffuse, alpha=0.4, color='#e67e22', label=r'$k_d \cdot \max(0,\cos\theta)$')
ax2.fill_between(np.degrees(theta_arr), 0, ambient, alpha=0.6, color='#3498db', label=r'$k_a I_a = 0.15$')
ax2.plot(np.degrees(theta_arr), total, color='#2c3e50', lw=2, label='total L')
ax2.axvline(90, color='#7f8c8d', lw=1, ls='--', alpha=0.7)
ax2.text(91, 0.5, '90°\n(切线方向)', fontsize=9, color='#7f8c8d')
ax2.set_xlabel('入射角 θ (°)'); ax2.set_ylabel('亮度 L')
ax2.set_xlim(0, 180); ax2.set_ylim(0, 1.1); ax2.set_xticks([0, 45, 90, 135, 180])
ax2.legend(fontsize=9, loc='upper right')
ax2.set_title(r'亮度随入射角变化  ($k_a$=0.15, $k_d$=0.85)', fontsize=11)
ax2.grid(True, alpha=0.3)

plt.suptitle('Lambert 漫反射光照模型', fontsize=13, y=1.01)
plt.tight_layout()
plt.savefig('../images/10_lambert_lighting.png', dpi=150, bbox_inches='tight')
print('saved: ../images/10_lambert_lighting.png')
