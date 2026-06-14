# doc/scripts — 文档配图生成脚本

## 安装依赖

```bash
uv venv --python 3.13
uv pip install matplotlib numpy
```

## 生成所有图片

```bash
uv run 01_coordinate_system.py
uv run 02_homogeneous_coords.py
uv run 03_yaw_pitch_roll.py
uv run 04_mvp_stages.py
uv run 05_perspective_projection.py
uv run 06_viewport_transform.py
uv run 07_rasterization.py
uv run 08_perspective_correction.py
uv run 09_zbuffer.py
uv run 10_lambert_lighting.py
uv run 11_blinn_phong.py
uv run 12_normal_matrix.py
uv run 13_uv_dots.py
uv run 14_top_face.py
```

图片统一输出到 `../images/`。
