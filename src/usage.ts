const pkg = require('../package.json')

const detailsStyle = 'margin:10px 0;border:1px solid var(--k-color-border, #909399);border-radius:8px;background:var(--k-card-bg, transparent);color:var(--k-text-dark, inherit);overflow:hidden;box-shadow:var(--k-card-shadow, 0 1px 3px rgb(0 0 0 / 12%));transition:var(--color-transition, border-color .2s ease, background-color .2s ease)'
const summaryStyle = 'padding:9px 12px;background:var(--k-hover-bg, rgba(127, 127, 127, .12));color:var(--k-text-dark, inherit);cursor:pointer;user-select:none'
const detailsBodyStyle = 'padding:6px 14px 12px;border-top:1px solid var(--k-color-divider, rgba(127, 127, 127, .28));background:var(--k-card-bg, transparent);color:var(--k-text-dark, inherit)'

const KOISHI_LOGO_BASE64 = 'data%3Aimage%2Fpng%3Bbase64%2CiVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAABU0lEQVR42p2UQSsFYRSGnxnqLuytKWKpKFkQNsS%2FsOHPWPADLCmxU5S7UzYWNrJR7lYiRF2FeWzOMKZ7mXHqNNP5vvP2nu%2B850CY2lP4X1K31ZbaDm%2BpO%2Bpyp5wfAXVEPfRvO1JHf4AVQGbUh7j4EZ4VkrNCXPVRnf3CUBN1SH2KC28VGOV3ntRhNclZHdcAKYM11QR1oVBOXctzFlNgBTC8qmXxPQEegbVeYApIgJT6tg%2F0AdMp0B%2FBpCabK2AAmAAa%2F2GRBft1oBFPkqTAba7LCiAfQC9wClwAY1HJHepuiO29Yrsf1Dn1uiDU3RTYCtTkl1Leg8k9MB4NGgReI28rV3azgyCz0og01Xl1Uz1QX8uCTELm3UbkTF1VJ9Wr0tn3iBSGdjYG0XivE3VN3VD31PM4a3cc2tIGGI0VkTO7rLxGuiy25ejmjfqsvkSXui62TxaK03td4FXTAAAAAElFTkSuQmCC'

export const usage = `
<h1>Koishi 插件：骰子 · GAMES101 3D 软件光栅化渲染器</h1>
<h2>🎯 插件版本：v${pkg.version}</h2>

<p>
  <a href="https://www.npmjs.com/package/koishi-plugin-dice-games101-3d-renderer" target="_blank">
    <img src="https://img.shields.io/npm/v/koishi-plugin-dice-games101-3d-renderer?style=flat-square&logo=npm" alt="npm version">
  </a>
  <a href="https://npm-stat.com/charts.html?package=koishi-plugin-dice-games101-3d-renderer" target="_blank">
    <img src="https://img.shields.io/npm/dm/koishi-plugin-dice-games101-3d-renderer?style=flat-square&logo=npm" alt="npm downloads">
  </a>
  <br>
  <a href="https://github.com/VincentZyuApps/koishi-plugin-dice-games101-3d-renderer" target="_blank">
    <img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub">
  </a>
  <a href="https://gitee.com/vincent-zyu/koishi-plugin-dice-games101-3d-renderer" target="_blank">
    <img src="https://img.shields.io/badge/Gitee-C71D23?style=for-the-badge&logo=gitee&logoColor=white" alt="Gitee">
  </a>
  <br>
  <a href="https://forum.koishi.xyz/t/topic/12603" target="_blank">
    <img src="https://img.shields.io/badge/Koishi%20Forum-12603-5546A3?style=for-the-badge&logo=${KOISHI_LOGO_BASE64}&logoColor=white" alt="Koishi Forum">
  </a>
  <a href="https://qm.qq.com/q/ZHj33L5cuC" target="_blank">
    <img src="https://img.shields.io/badge/QQ群-1085190201-12B7F5?style=flat-square&logo=qq&logoColor=white" alt="QQ群">
  </a>
  <br>
  <a href="https://opensource.org/licenses/MIT" target="_blank">
    <img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="License">
  </a>
  <a href="https://www.typescriptlang.org" target="_blank">
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript">
  </a>
</p>

<h2>💬 交流反馈</h2>
<p>🐛 Bug 反馈 / 💡 建议 / 👨‍💻 插件开发交流，欢迎加群：</p>
<p><del>💬 插件使用问题 / 🐛 Bug反馈 / 👨‍💻 插件开发交流，欢迎加入QQ群：<b>259248174</b>   🎉（这个群G了）</del></p> 
<p>💬 插件使用问题 / 🐛 Bug反馈 / 👨‍💻 插件开发交流，欢迎加入QQ群：<b>1085190201</b> 🎉</p>
<p>💡 在群里直接艾特我，回复的更快哦~ ✨</p>

<blockquote style="margin: 14px 0; padding: 12px 16px; border-left: 6px solid #ff6600; border-radius: 8px; background: rgba(255, 102, 0, 0.12); color: inherit; line-height: 1.6; box-shadow: 0 1px 4px rgba(0,0,0,0.06);">
  <b style="color: #ff6600; font-size: 16px;">🎲 零图形库依赖的纯手写 3D 软件渲染引擎</b><br>
  从四维齐次矩阵乘法、透视裁剪、Z-Buffer 扫描线算法到 PNG 二进制 Chunk 与 deflate 压缩，全部使用 TypeScript 从零实现！
</blockquote>

<details style="${detailsStyle}">
<summary style="${summaryStyle}"><b style="color: #ff6600;">🚀 快速上手与常用掷骰指令</b></summary>
<div style="${detailsBodyStyle}">
  <p>在聊天中发送 <code>dice</code> 即可随机角度掷骰；也支持精确指定三轴欧拉角与光照着色参数：</p>
  <div style="margin: 8px 0; padding: 10px 14px; border-radius: 6px; background: rgba(255, 102, 0, 0.08); border-left: 4px solid #ff6600;">
    <pre style="margin: 0; background: transparent; padding: 0;"><code>dice                        # 随机角度掷骰
dice 30 20 10               # 指定偏航 Yaw=30°、俯仰 Pitch=20°、翻滚 Roll=10°
dice --axis                 # 渲染并显示骰子本地坐标三色基向量（RGB: XYZ）
dice 45 0 0 --axis          # 水平旋转 45° 并附加坐标轴可视化
dice 0 90 0                 # 俯仰 90°（完全正对顶面鸟瞰）
dice 67 67 67               # 🗿 神秘的 67° 特殊视点
dice --ka 0.05 --kd 0.95    # 极低环境光 + 强漫反射（高明暗反差效果）
dice --ks 2.0 -p 128        # 强镜面高光 × 2 + 高锐度（珠光反光感）
dice -a --kd 0.5 --ks 0     # 坐标轴 + 纯 Lambert 漫反射（柔和无高光）
dice --md-steps 0,6,7,8,9  # 📐 QQ 官方 Markdown 仅展示指定步骤的 LaTeX 推导</code></pre>
  </div>
</div>
</details>

<details style="${detailsStyle}">
<summary style="${summaryStyle}"><b style="color: #0ea5e9;">⚙️ 渲染器配置项总览（尺寸/着色/按钮）</b></summary>
<div style="${detailsBodyStyle}">
  <div style="margin: 8px 0; padding: 10px 14px; border-radius: 6px; background: rgba(14, 165, 233, 0.08); border-left: 4px solid #0ea5e9; overflow-x: auto;">
    <table style="width: 100%; border-collapse: collapse;">
      <thead>
        <tr style="border-bottom: 2px solid var(--k-color-divider, #ccc);">
          <th style="padding: 6px; text-align: left;">配置项</th>
          <th style="padding: 6px; text-align: left;">类型</th>
          <th style="padding: 6px; text-align: left;">默认值</th>
          <th style="padding: 6px; text-align: left;">说明</th>
        </tr>
      </thead>
      <tbody>
        <tr style="border-bottom: 1px solid var(--k-color-divider, #eee);">
          <td style="padding: 6px;"><code>showRenderInfo</code></td>
          <td style="padding: 6px;">boolean</td>
          <td style="padding: 6px;"><code>true</code></td>
          <td style="padding: 6px;">输出文本包含毫秒级渲染耗时、旋转角与点数</td>
        </tr>
        <tr style="border-bottom: 1px solid var(--k-color-divider, #eee);">
          <td style="padding: 6px;"><code>enableQuote</code></td>
          <td style="padding: 6px;">boolean</td>
          <td style="padding: 6px;"><code>true</code></td>
          <td style="padding: 6px;">是否引用触发指令的原消息</td>
        </tr>
        <tr style="border-bottom: 1px solid var(--k-color-divider, #eee);">
          <td style="padding: 6px;"><code>width / height</code></td>
          <td style="padding: 6px;">number</td>
          <td style="padding: 6px;"><code>400 × 400</code></td>
          <td style="padding: 6px;">输出图片分辨率（推荐 200~800 像素）</td>
        </tr>
        <tr style="border-bottom: 1px solid var(--k-color-divider, #eee);">
          <td style="padding: 6px;"><code>ambient (k_a)</code></td>
          <td style="padding: 6px;">number</td>
          <td style="padding: 6px;"><code>0.15</code></td>
          <td style="padding: 6px;">环境光系数（Lambert 光照模型）</td>
        </tr>
        <tr style="border-bottom: 1px solid var(--k-color-divider, #eee);">
          <td style="padding: 6px;"><code>diffuse (k_d)</code></td>
          <td style="padding: 6px;">number</td>
          <td style="padding: 6px;"><code>0.85</code></td>
          <td style="padding: 6px;">漫反射系数（Lambert 光照模型）</td>
        </tr>
        <tr style="border-bottom: 1px solid var(--k-color-divider, #eee);">
          <td style="padding: 6px;"><code>specular (k_s)</code></td>
          <td style="padding: 6px;">number</td>
          <td style="padding: 6px;"><code>0.6</code></td>
          <td style="padding: 6px;">镜面高光系数（Blinn-Phong 模型）</td>
        </tr>
        <tr style="border-bottom: 1px solid var(--k-color-divider, #eee);">
          <td style="padding: 6px;"><code>shininess (p)</code></td>
          <td style="padding: 6px;">number</td>
          <td style="padding: 6px;"><code>32</code></td>
          <td style="padding: 6px;">高光反光锐度指数（Blinn-Phong 模型）</td>
        </tr>
        <tr style="border-bottom: 1px solid var(--k-color-divider, #eee);">
          <td style="padding: 6px;"><code>showAxis</code></td>
          <td style="padding: 6px;">boolean</td>
          <td style="padding: 6px;"><code>false</code></td>
          <td style="padding: 6px;">默认是否渲染本地局部坐标系红绿蓝轴向量</td>
        </tr>
        <tr>
          <td style="padding: 6px;"><code>enableQQMarkdown</code></td>
          <td style="padding: 6px;">boolean</td>
          <td style="padding: 6px;"><code>true</code></td>
          <td style="padding: 6px;">在 QQ 官方 Bot 平台输出数学步骤 Markdown 与操作按钮</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
</details>

<details style="${detailsStyle}">
<summary style="${summaryStyle}"><b style="color: #10b981;">🗺️ 从零手写 3D 渲染管线 10 大核心步骤</b></summary>
<div style="${detailsBodyStyle}">
  <p>渲染器完全采用纯算法模拟 GPU 光栅化流水线：</p>
  <div style="margin: 8px 0; padding: 10px 14px; border-radius: 6px; background: rgba(16, 185, 129, 0.08); border-left: 4px solid #10b981;">
    <ol style="margin: 4px 0; padding-left: 20px; line-height: 1.7;">
      <li><b>随机角度生成：</b>采用标准线性同余伪随机数生成器（LCG）确定三轴姿态。</li>
      <li><b>Model 变换矩阵：</b>按 Rz(roll) · Rx(pitch) · Ry(yaw) 正确连乘合成旋转矩阵。</li>
      <li><b>View 视图矩阵：</b>通过 lookAt(相机位置, 目标点, 上方向向量) 构建标准相机正交基。</li>
      <li><b>透视投影矩阵 (P)：</b>根据 FOV=45°、近截面 0.1、远截面 100 构建视锥体齐次投影。</li>
      <li><b>MVP 顶点变换：</b>对每个立方体表面三角面顶点执行 P · V · M 投影映射。</li>
      <li><b>法线逆转置矩阵：</b>利用 (MV)⁻ᵀ 修正变换，保证非均匀缩放下的法向量正交性。</li>
      <li><b>透视除法与视口变换：</b>将齐次坐标 (x/w, y/w) 转换到 NDC 标准化设备坐标并映射至像素栅格。</li>
      <li><b>光栅化与深度测试 (Z-Buffer)：</b>计算 AABB 包围盒，利用边缘函数重心坐标进行逐像素深度比较。</li>
      <li><b>透视校正属性插值：</b>属性值除以 w 进行屏幕空间线性插值，再乘以 1/(1/w) 真实恢复 3D 空间属性。</li>
      <li><b>Blinn-Phong 着色与 PNG 编码：</b>计算半角向量高光 + Lambert 漫反射 + 点数判定，最终通过 zlib 压缩输出 Base64 PNG。</li>
    </ol>
  </div>
</div>
</details>

<details style="${detailsStyle}">
<summary style="${summaryStyle}"><b style="color: #8b5cf6;">📐 QQ 官方 Markdown 与数学推导步骤</b></summary>
<div style="${detailsBodyStyle}">
  <p>在 QQ 官方 Bot 环境中，插件支持下发详尽的数学矩阵推导看板：</p>
  <div style="margin: 8px 0; padding: 10px 14px; border-radius: 6px; background: rgba(139, 92, 246, 0.08); border-left: 4px solid #8b5cf6;">
    <p><b>📐 LaTeX 数学步骤控制：</b>通过配置项 <code>diceMarkdownSteps</code> 或指令参数 <code>--md-steps 1,6,7</code> 可自由选择输出的矩阵推导公式，包含旋转矩阵展开、法线矩阵求解与顶面夹角点数判别。</p>
    <p><b>🎮 交互式内联按钮：</b>内置 [🎲 重新投掷]、[📐 俯仰 90° 鸟瞰]、[🌐 开启坐标轴] 等快捷交互按钮，群友可直接点按体验变换。</p>
  </div>
</div>
</details>

<details style="${detailsStyle}">
<summary style="${summaryStyle}"><b style="color: #ec4899;">📚 课程参考与理论来源</b></summary>
<div style="${detailsBodyStyle}">
  <div style="margin: 8px 0; padding: 10px 14px; border-radius: 6px; background: rgba(236, 72, 153, 0.08); border-left: 4px solid #ec4899;">
    <p style="margin: 4px 0;">特别鸣谢加州大学圣塔芭芭拉分校（UCSB）闫令琪老师的经典图形学课程：</p>
    <ul style="margin: 4px 0; padding-left: 18px;">
      <li>🎓 <a href="https://sites.cs.ucsb.edu/~lingqi/teaching/games101.html" target="_blank" style="color: #ec4899; font-weight: bold;">GAMES101 课程主页：现代计算机图形学入门</a></li>
      <li>📺 <a href="https://www.bilibili.com/video/BV1X7411F744" target="_blank" style="color: #0ea5e9; font-weight: bold;">闫令琪老师 B 站官方精选公开课</a></li>
    </ul>
  </div>
</div>
</details>
`
