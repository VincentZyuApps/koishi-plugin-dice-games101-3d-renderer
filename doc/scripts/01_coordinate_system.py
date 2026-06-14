"""01 - 坐标系示意图（含相机位置与视线方向）"""

import numpy as np
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d.art3d import Poly3DCollection
from common import setup_font

setup_font()

fig = plt.figure(figsize=(7, 6))
ax = fig.add_subplot(111, projection="3d")

origin = np.array([0, 0, 0])
axes = {
    "X": ([0, 1.5], [0, 0], [0, 0]),
    "Y": ([0, 0], [0, 1.5], [0, 0]),
    "Z": ([0, 0], [0, 0], [0, 1.5]),
}
colors = {"X": "#e74c3c", "Y": "#2ecc71", "Z": "#3498db"}

for name, (xs, ys, zs) in axes.items():
    ax.quiver(
        *origin,
        xs[1],
        ys[1],
        zs[1],
        color=colors[name],
        arrow_length_ratio=0.15,
        linewidth=2.5,
    )
    ax.text(
        xs[1] * 1.1,
        ys[1] * 1.1,
        zs[1] * 1.1,
        f"+{name}",
        color=colors[name],
        fontsize=13,
        fontweight="bold",
    )

# 负半轴（虚线）
neg_axes = {"X": (-1.2, 0, 0), "Y": (0, -1.2, 0), "Z": (0, 0, -1.2)}
for name, (dx, dy, dz) in neg_axes.items():
    ax.quiver(
        0,
        0,
        0,
        dx,
        dy,
        dz,
        color=colors[name],
        arrow_length_ratio=0.15,
        linewidth=1.5,
        linestyle="--",
        alpha=0.5,
    )
    ax.text(
        dx * 1.15,
        dy * 1.15,
        dz * 1.15,
        f"-{name}",
        color=colors[name],
        fontsize=11,
        alpha=0.7,
    )

# 相机位置 (0,0,3)
cam = np.array([0, 0, 3])
ax.scatter(*cam, color="#e67e22", s=120, zorder=5)
ax.text(0.1, 0.1, 3.15, "eye (0,0,3)", color="#e67e22", fontsize=11)

# 视线方向：从相机到原点的箭头
ax.quiver(
    *cam,
    0,
    0,
    -1.5,
    color="#e67e22",
    arrow_length_ratio=0.2,
    linewidth=2,
    linestyle="--",
)
ax.text(-0.6, 0, 2.2, "view (-Z)", color="#e67e22", fontsize=10)

# 原点
ax.scatter(0, 0, 0, color="#2c3e50", s=60, zorder=5)
ax.text(0.05, 0.05, 0.05, "(0,0,0)", color="#2c3e50", fontsize=9)

ax.set_xlim(-1.5, 1.8)
ax.set_ylim(-1.5, 1.8)
ax.set_zlim(-0.8, 2.8)
ax.set_xlabel("")
ax.set_ylabel("")
ax.set_zlabel("")
ax.set_xticks([])
ax.set_yticks([])
ax.set_zticks([])
ax.set_box_aspect([1, 1, 1.5])
ax.view_init(elev=20, azim=-60)
ax.grid(False)
ax.set_facecolor("#f8f9fa")
ax.set_title("坐标系  |  Camera at (0,0,3) looking toward -Z", fontsize=12, pad=12)

plt.tight_layout()
plt.savefig("../images/01_coordinate_system.png", dpi=150, bbox_inches="tight")
print("saved: ../images/01_coordinate_system.png")
