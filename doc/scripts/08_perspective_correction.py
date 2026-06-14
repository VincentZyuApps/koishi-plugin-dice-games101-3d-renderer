"""08 - 透视校正插值 vs 线性插值对比"""
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from common import setup_font; setup_font()

fig, axes = plt.subplots(1, 2, figsize=(11, 5))

def draw_grid_trap(ax, correct=False):
    ax.set_xlim(-1.2, 1.2); ax.set_ylim(-1.3, 1.3)
    trap_x = [-1, 1, 0.35, -0.35]
    trap_y = [-1, -1, 1, 1]
    ax.fill(trap_x, trap_y, color='#ecf0f1', zorder=0)
    ax.plot(trap_x + [trap_x[0]], trap_y + [trap_y[0]], 'k-', lw=1.5)

    lines = 8
    for i in range(1, lines):
        t = i / lines
        x_left  = -1.0 + t * (1 - (-1.0)) * 0.65
        x_right =  1.0 - t * (1 - (-1.0)) * 0.65
        if correct:
            w_near, w_far = 1.0, 4.0
            t_corrected = (t / w_near) / (t / w_near + (1-t) / w_far)
        else:
            t_corrected = t
        y = -1.0 + t_corrected * 2.0
        ax.plot([x_left, x_right], [y, y], color='#2c3e50', lw=1.2, alpha=0.8)

    for i in range(1, lines):
        t = i / lines
        for j in range(1, 3):
            frac = j / 3
            x_bot = -1.0 + frac * 2.0
            x_top = -0.35 + frac * 0.7
            ax.plot([x_bot, x_top], [-1, 1], color='#2c3e50', lw=1.0, alpha=0.5)

    ax.text(-1.15, -1.0, 'near\n(w=1)', fontsize=9, color='#e67e22', va='center')
    ax.text(-1.15,  1.0, 'far\n(w=4)',  fontsize=9, color='#8e44ad', va='center')
    ax.axis('off')

axes[0].set_title('线性插值\n格子均匀但透视感错误', fontsize=11, color='#e74c3c')
draw_grid_trap(axes[0], correct=False)

axes[1].set_title('透视校正插值\n近端格子更大，符合真实透视', fontsize=11, color='#27ae60')
draw_grid_trap(axes[1], correct=True)

for ax, label, color in [(axes[0], r'$f_P = \alpha f_0 + \beta f_1$  (线性)', '#e74c3c'),
                          (axes[1], r'$f_P = \frac{\alpha f_0/w_0 + \beta f_1/w_1}{\alpha/w_0 + \beta/w_1}$  (透视校正)', '#27ae60')]:
    ax.text(0, -1.15, label, ha='center', fontsize=10, color=color,
            bbox=dict(boxstyle='round,pad=0.3', facecolor='white', alpha=0.85))

fig.suptitle('透视校正插值 vs 线性插值', fontsize=13, y=1.01)
plt.tight_layout()
plt.savefig('../images/08_perspective_correction.png', dpi=150, bbox_inches='tight')
print('saved: ../images/08_perspective_correction.png')
