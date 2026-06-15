const pkg = require('../package.json');

export const usage = `
<h1>Koishi 插件：骰子 · GAMES101 3D 软件光栅化渲染器</h1>
<h2>🎯 插件版本：v${pkg.version}</h2>

<p>
  <a href="https://www.npmjs.com/package/koishi-plugin-dice-games101-3d-renderer" target="_blank">
    <img src="https://img.shields.io/npm/v/koishi-plugin-dice-games101-3d-renderer?style=flat-square" alt="npm version">
  </a>
  <a href="https://www.npmjs.com/package/koishi-plugin-dice-games101-3d-renderer" target="_blank">
    <img src="https://img.shields.io/npm/dm/koishi-plugin-dice-games101-3d-renderer?style=flat-square" alt="npm downloads">
  </a>
  <a href="https://github.com/VincentZyuApps/koishi-plugin-dice-games101-3d-renderer" target="_blank">
    <img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub">
  </a>
  <a href="https://gitee.com/vincent-zyu/koishi-plugin-dice-games101-3d-renderer" target="_blank">
    <img src="https://img.shields.io/badge/Gitee-C71D23?style=for-the-badge&logo=gitee&logoColor=white" alt="Gitee">
  </a>
  <a href="https://forum.koishi.xyz/t/topic/114514" target="_blank">
    <img src="https://img.shields.io/badge/Koishi%20Forum-114514-5546A3?style=for-the-badge&logo=https%3A%2F%2Fupload.wikimedia.org%2Fwikipedia%2Fcommons%2Ff%2Ff3%2FKoishi.js_Logo.png&logoColor=white" alt="Koishi Forum">
  </a>
  <a href="https://qm.qq.com/q/4vjto4V7Di" target="_blank">
    <img src="https://img.shields.io/badge/QQ群-1085190201-12B7F5?style=flat-square&logo=qq&logoColor=white" alt="QQ群">
  </a>
  <a href="https://opensource.org/licenses/MIT" target="_blank">
    <img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="License">
  </a>
  <a href="https://www.typescriptlang.org" target="_blank">
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript">
  </a>
</p>

<h2 style="color: #ff6600; font-weight: 900; font-size: 20px; margin: 20px 0;">🎲 整活+学习项目 — 从矩阵乘法到 PNG 编码全部从头实现，零 npm 依赖</h2>

<hr>

<h2>🚀 快速上手</h2>
<p>安装启用后，在聊天中发送以下指令：</p>
<pre><code>
dice                        # 随机角度摇一次骰子
dice 30 20 10               # 指定 Yaw=30° Pitch=20° Roll=10°
dice --axis                 # 显示骰子本地坐标轴
dice 45 0 0 --axis          # 正Yaw 45° + 坐标轴可视化
dice 0 90 0                 # 俯仰 90°（"鸟瞰"骰子顶部）
dice 67 67 67               # 🗿 神秘的 67° * 3
dice --ka 0.05 --kd 0.95    # 低环境光 + 强漫反射（高对比度）
dice --ks 2.0 -p 128        # 镜面高光 × 2 + 高锐度（闪亮效果）
dice -a --kd 0.5 --ks 0     # 坐标轴 + 纯 Lambert 漫反射（无高光）
dice --md-steps 0,6,7,8,9  # 📐 只看指定步骤的 LaTeX 推导（QQ Markdown）
</code></pre>
<p>插件会实时渲染一张可自定义尺寸（默认 400×400）的 3D 骰子图片，并返回渲染耗时与顶面点数。</p>

<h3>🎮 指令</h3>
<ul>
  <li><code>dice</code> — 无参数时使用 LCG 伪随机数生成随机角度</li>
  <li><code>dice &lt;yaw&gt; &lt;pitch&gt; &lt;roll&gt;</code> — 分别指定偏航角、俯仰角、翻滚角（单位：度）</li>
</ul>

<hr>

<h2>⚙️ 配置项</h2>

<table>
  <tr>
    <th>配置项</th>
    <th>类型</th>
    <th>默认值</th>
    <th>说明</th>
  </tr>
  <tr>
    <td><code>showRenderInfo</code></td>
    <td>boolean</td>
    <td><code>true</code></td>
    <td>显示渲染耗时、角度和顶面点数</td>
  </tr>
  <tr>
    <td><code>enableQuote</code></td>
    <td>boolean</td>
    <td><code>true</code></td>
    <td>是否引用触发消息</td>
  </tr>
  <tr>
    <td><code>width</code></td>
    <td>number</td>
    <td><code>400</code></td>
    <td>渲染图片宽度（像素，100-1000）</td>
  </tr>
  <tr>
    <td><code>height</code></td>
    <td>number</td>
    <td><code>400</code></td>
    <td>渲染图片高度（像素，100-1000）</td>
  </tr>
  <tr>
    <td><code>ambient</code></td>
    <td>number</td>
    <td><code>0.15</code></td>
    <td>环境光系数 k_a（<a href="https://en.wikipedia.org/wiki/Lambertian_reflectance" target="_blank">Lambert 模型</a>）</td>
  </tr>
  <tr>
    <td><code>diffuse</code></td>
    <td>number</td>
    <td><code>0.85</code></td>
    <td>漫反射系数 k_d（<a href="https://en.wikipedia.org/wiki/Lambertian_reflectance" target="_blank">Lambert 模型</a>）</td>
  </tr>
  <tr>
    <td><code>specular</code></td>
    <td>number</td>
    <td><code>0.6</code></td>
    <td>镜面高光系数 k_s（<a href="https://en.wikipedia.org/wiki/Blinn%E2%80%93Phong_reflection_model" target="_blank">Blinn-Phong 模型</a>）</td>
  </tr>
  <tr>
    <td><code>shininess</code></td>
    <td>number</td>
    <td><code>32</code></td>
    <td>高光锐度 p（<a href="https://en.wikipedia.org/wiki/Blinn%E2%80%93Phong_reflection_model" target="_blank">Blinn-Phong 模型</a>）</td>
  </tr>
  <tr>
    <td><code>diceCommandName</code></td>
    <td>string</td>
    <td><code>dice</code></td>
    <td>🎲 dice 指令名称</td>
  </tr>
  <tr>
    <td><code>showAxis</code></td>
    <td>boolean</td>
    <td><code>false</code></td>
    <td>渲染骰子本地坐标轴</td>
  </tr>
  <tr>
    <td><code>faceLabels</code></td>
    <td>array</td>
    <td><code>[10°:非常正对!, 20°:还挺正的, ...]</code></td>
    <td>🎯 正对镜头评价表</td>
  </tr>
  <tr>
    <td><code>enableQQMarkdown</code></td>
    <td>boolean</td>
    <td><code>true</code></td>
    <td>在 QQ 官方 Bot 平台发送 Markdown + 按钮消息</td>
  </tr>
  <tr>
    <td><code>diceMarkdownSteps</code></td>
    <td>string[]</td>
    <td><code>['1-rotation-matrices','6-normal-matrix','7-face-detection']</code></td>
    <td>📐 QQ Markdown 展示的 LaTeX 计算步骤</td>
  </tr>
  <tr>
    <td><code>qqMarkdownKeyboardJson</code></td>
    <td>string</td>
    <td><code>JSON</code></td>
    <td>📋 QQ Markdown 按钮 JSON 配置</td>
  </tr>
</table>

<hr>

<h2>🗺️ 渲染管线总览</h2>

<p>整个渲染过程不依赖任何图形库（Three.js or WebGL 等等），全部用 TypeScript 从头实现：</p>
<ol>
  <li><strong>随机角度生成</strong> — LCG 伪随机数生成偏航/俯仰/翻滚角度（或使用用户输入）</li>
  <li><strong>Model 旋转矩阵</strong> — Rz(roll)·Rx(pitch)·Ry(yaw) 三轴旋转合成</li>
  <li><strong>View 矩阵</strong> — lookAt(相机, 目标, 上方向) 构建相机正交基</li>
  <li><strong>透视投影矩阵</strong> — P(fov=45°, near=0.1, far=100) 视锥体 → 裁剪空间</li>
  <li><strong>MVP 顶点变换</strong> — P·V·M 将模型空间三角形顶点变换到裁剪空间</li>
  <li><strong>法线矩阵</strong> — (MV)\u207B\u1D40 保证非均匀缩放下法线方向正确</li>
  <li><strong>透视除法 + 视口变换</strong> — 齐次坐标 ÷ w → NDC → 屏幕像素</li>
  <li><strong>光栅化 + Z-Buffer</strong> — AABB 包围盒·边缘函数·重心坐标·深度测试</li>
  <li><strong>透视校正插值</strong> — 属性 / w 线性插值后通过 1/w 校正还原</li>
  <li><strong>片段着色 + PNG 输出</strong> — <a href="https://en.wikipedia.org/wiki/Lambertian_reflectance" target="_blank">Lambert 漫反射</a> + <a href="https://en.wikipedia.org/wiki/Blinn%E2%80%93Phong_reflection_model" target="_blank">Blinn-Phong 镜面高光</a> + 点数检测 → 手写 IDAT / zlib 压缩 → Base64 发送</li>
</ol>

<hr>

<h2>📦 依赖</h2>
<p>零图形库依赖。唯一外部依赖：Node.js 内置 <code>zlib</code>（PNG 压缩）+ Koishi 本体。</p>

<hr>

<h2>📚 参考</h2>
<ul>
  <li><a href="https://sites.cs.ucsb.edu/~lingqi/teaching/games101.html" target="_blank">GAMES101 课程主页</a></li>
  <li><a href="https://www.bilibili.com/video/BV1X7411F744" target="_blank">闫令琪老师 B 站课程</a></li>
</ul>

<hr>

`;
