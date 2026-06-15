"""05 - 透视投影视锥体（Frustum）三视图"""

import numpy as np
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d.art3d import Poly3DCollection
from common import setup_font

setup_font()


def frustum_faces(fov_deg, aspect, near, far):
    fov = np.radians(fov_deg / 2)
    hn, wn = near * np.tan(fov), near * np.tan(fov) * aspect
    hf, wf = far * np.tan(fov), far * np.tan(fov) * aspect
    n = [[-wn, -hn, near], [wn, -hn, near], [wn, hn, near], [-wn, hn, near]]
    f = [[-wf, -hf, far], [wf, -hf, far], [wf, hf, far], [-wf, hf, far]]
    return np.array(n), np.array(f)


def rot_x(pts, deg):
    rad = np.radians(deg)
    c, s = np.cos(rad), np.sin(rad)
    R = np.array([[1, 0, 0], [0, c, -s], [0, s, c]])
    return np.array([R @ p for p in pts])


def rot_y(pts, deg):
    rad = np.radians(deg)
    c, s = np.cos(rad), np.sin(rad)
    R = np.array([[c, 0, s], [0, 1, 0], [-s, 0, c]])
    return np.array([R @ p for p in pts])


def draw_frustum(ax, n, f, view_label, view_color, offset):
    ox, oy, oz = offset
    faces = [
        [n[0], n[1], n[2], n[3]],
        [f[0], f[1], f[2], f[3]],
        [n[0], n[1], f[1], f[0]],
        [n[2], n[3], f[3], f[2]],
        [n[0], n[3], f[3], f[0]],
        [n[1], n[2], f[2], f[1]],
    ]
    poly = Poly3DCollection(
        faces, alpha=0.12, facecolor="#3498db", edgecolor="#2980b9", linewidth=0.8
    )
    ax.add_collection3d(poly)

    for v in f:
        ax.plot([ox, v[0]], [oy, v[1]], [oz, v[2]], color="#2980b9", lw=0.8, alpha=0.5)

    ax.scatter(ox, oy, oz, color="#e67e22", s=80, zorder=5)
    ax.text(ox, oy, oz - 0.4, "eye", color="#e67e22", fontsize=10, fontweight="bold")

    axis_len = 0.7
    ax.quiver(
        ox, oy, oz, axis_len, 0, 0, color="#e74c3c", arrow_length_ratio=0.15, lw=1.8
    )
    ax.quiver(
        ox, oy, oz, 0, axis_len, 0, color="#27ae60", arrow_length_ratio=0.15, lw=1.8
    )
    ax.quiver(
        ox, oy, oz, 0, 0, axis_len, color="#3498db", arrow_length_ratio=0.15, lw=1.8
    )

    mid_far = np.mean(f, axis=0)
    vdir = mid_far / np.linalg.norm(mid_far)
    vlen = far + 0.5
    ax.quiver(
        ox,
        oy,
        oz,
        vdir[0] * vlen,
        vdir[1] * vlen,
        vdir[2] * vlen,
        color=view_color,
        arrow_length_ratio=0.06,
        lw=1.8,
    )
    tip = np.array([ox, oy, oz]) + vdir * (vlen + 0.25)
    ax.text(
        tip[0],
        tip[1],
        tip[2],
        view_label,
        color=view_color,
        fontsize=11,
        fontweight="bold",
    )

    cn = np.mean(n, axis=0)
    cf = np.mean(f, axis=0)
    ax.text(
        cn[0] + 0.08, cn[1] - 0.08, cn[2], f"near={near}", color="#27ae60", fontsize=9
    )
    ax.text(
        cf[0] + 0.08, cf[1] - 0.08, cf[2], f"far={far}", color="#8e44ad", fontsize=9
    )


near, far, fov = 0.5, 3.5, 45
n_base, f_base = frustum_faces(fov, 1.0, near, far)

configs = [
    {
        "rot": lambda p: rot_x(p, -90),
        "offset": np.array([0, -1.5, 0]),
        "label": "+Y (view)",
        "color": "#27ae60",
        "elev": 20,
        "azim": -70,
        "title": "View → +Y",
    },
    {
        "rot": lambda p: rot_y(p, 90),
        "offset": np.array([-1.5, 0, 0]),
        "label": "+X (view)",
        "color": "#e74c3c",
        "elev": 18,
        "azim": -110,
        "title": "View → +X",
    },
    {
        "rot": lambda p: rot_y(p, 180),
        "offset": np.array([0, 0, 1.5]),
        "label": "-Z (view)",
        "color": "#3498db",
        "elev": 18,
        "azim": -55,
        "title": "View → −Z",
    },
]

fig, axes = plt.subplots(3, 1, figsize=(8, 20), subplot_kw={"projection": "3d"})

for ax, cfg in zip(axes, configs):
    n = cfg["rot"](n_base) + cfg["offset"]
    f = cfg["rot"](f_base) + cfg["offset"]
    draw_frustum(ax, n, f, cfg["label"], cfg["color"], cfg["offset"])
    ax.view_init(elev=cfg["elev"], azim=cfg["azim"])
    ax.set_title(cfg["title"], fontsize=11, pad=10)
    ax.set_xlabel("X")
    ax.set_ylabel("Y")
    ax.set_zlabel("Z")
    ax.set_xlim(-2.5, 2.5)
    ax.set_ylim(-2.5, 2.5)
    ax.set_zlim(-2.5, 2.5)

fig.suptitle(
    f"透视视锥体三视图  fov={fov}°  near={near}  far={far}", fontsize=13, y=0.995
)
plt.tight_layout()
plt.savefig("../images/05_perspective_projection.png", dpi=150, bbox_inches="tight")
print("saved: ../images/05_perspective_projection.png")
