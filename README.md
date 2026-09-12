# ToonStar 🎨

> 人人都能成为自己的 IP 设计师
> Everyday Life → Personal IP → Creative Merchandise

上传一张「自己 / 宠物 / 物品 / 日常照片」，选择风格，生成专属 IP，并一键应用到贴纸、帆布袋、手机壳、杯垫等文创周边；无需设计基础，也能完成从灵感、生成、编辑到成品预览的完整创作流程。

---

## 🔗 在线体验

**Live Demo（GitHub Pages，永久可访问）：**
https://elliegu0523.github.io/TOONSTAR-TRAE-Hackathon/

> 支持手机 / 微信内置浏览器直接打开，375px 宽度无横向滚动。

---

## 📖 网页版本介绍（V2.0 · Hackathon MVP）

| 维度 | 说明 |
|------|------|
| 产品定位 | 从「追星周边设计工具」升级为「日常生活个人 IP 生成与文创设计平台」 |
| 一句话 Demo | 上传照片 → 选风格 → 生成 A/B/C 个 IP → 应用到文创周边 → 编辑保存导出 |
| UI 原则 | 保留奶油色背景、黄/蓝/粉/绿流程色、圆角卡片、顶部导航、进度条、编辑器结构，不做大改版 |
| 视觉风格 | 只使用 Flat Toon / Paper Cut / Soft Toy / Retro Graphic，不使用二次元 / Anime 视觉 |
| 技术目标 | 纯前端静态站，可直接在本地 / GitHub Pages / Netlify 运行 |

**一句话项目简介（可直接用于作品提交）：**

> ToonStar 是一个面向普通人的个人 IP 设计工具。用户只需上传自己、宠物、物品或生活照片，即可快速生成统一风格的专属 IP，并一键适配到贴纸、帆布袋、手机壳等文创周边。无需设计基础，也能完成从灵感、生成、编辑到成品预览的完整创作流程。

---

## 🧭 主流程（完整闭环）

```
Home → Upload → Style → Create IP → Scene → Products → Base Preview → Customize → Final → My ToonStars
```

每一步都可点击、状态共享、刷新不丢失。

---

## ✨ 功能特性（P0 MVP）

- **主体类型四选一**：Me / Pet / Object / Memory —— 日常万物皆可 IP 化
- **图片上传**：点击或拖拽上传，本地即时预览（JPG / PNG / WEBP）
- **IP DNA**：名称、关键词（最多 3 个）、主色、保留特征
- **风格选择**：Flat Toon / Paper Cut / Soft Toy / Retro Graphic（4 个既有风格单选）
- **A/B/C 方案生成**：一次生成 3 个方案并可选中，后续页面始终复用同一 `selectedIP`
- **场景选择**：Daily / Travel / Birthday / Cafe / Campus / Home + 自定义场景
- **文创商品多选**：6 大分类、20+ 商品，分类切换不丢已选，支持一键推荐组合
- **自动商品 Mockup**：同一 IP 自动适配贴纸 / 帆布袋 / 手机壳 / 杯垫等外形模板
- **编辑器**：拖拽、删除、置顶、Undo / Redo、文字 / 日期 / 地点、字体 / 字号 / 颜色 / 旋转、装饰元素、5 个布局模板
- **保存与导出**：localStorage 持久化（项目库 / 刷新恢复）、html2canvas 导出 PNG
- **失败回退**：AI 失败或超时（12s）自动使用本地 Demo 图，流程不中断
- **移动端适配**：375px 无横向滚动，微信内置浏览器可打开

---

## 💡 三个创新点

1. **Everyday IP** —— 输入不局限于人像，宠物、咖啡杯、旅行照、店铺产品都能成为 IP
2. **IP DNA** —— 生成前只填 4 个轻量字段，保证同一 IP 跨商品保持颜色、特征一致
3. **One-click Merch Adaptation** —— 一次勾选多个商品，同一 IP 自动适配到不同商品模板

---

## 🛠 技术栈

| 层 | 方案 |
|----|------|
| 前端 | HTML + CSS + Vanilla JS（单页应用，模块化） |
| 状态管理 | 单一 `projectState` + localStorage |
| 图片导出 | html2canvas（含纯 Canvas 兜底） |
| AI 接口 | Serverless Function（Netlify Functions）代理，API Key 仅存服务端环境变量 |
| 部署 | GitHub Pages（当前）/ Netlify（`netlify.toml` 已内置） |

---

## 📁 目录结构

```
TOONSTAR-TRAE-Hackathon/
├─ index.html                 # 入口 + 全部页面结构与样式
├─ assets/
│  └─ demo/                   # 3 张非二次元演示 IP 图（AI 回退用）
│     ├─ ip-a.png
│     ├─ ip-b.png
│     └─ ip-c.png
├─ js/
│  ├─ state.js                # 统一 projectState + localStorage 持久化
│  ├─ data.js                 # 主体类型 / 风格 / 场景 / 6 类商品 / 推荐
│  ├─ ai.js                   # generateIP 接口 + 12s 超时 + fallback
│  ├─ editor.js               # 编辑器（拖拽 / undo / redo / 导出 PNG）
│  └─ app.js                  # 路由 + 各页渲染与交互 + 商品 Mockup
├─ functions/
│  └─ generate-ip.js          # Netlify Serverless 代理（API Key 环境变量）
├─ netlify.toml               # Netlify 构建配置
├─ backup/
│  └─ toonstar-v6-original.html  # 原始 ToonStar 前端备份
└─ README.md
```

---

## 🚀 本地运行

```bash
# 方式一：任意静态服务器
npx serve .

# 方式二：Python
python -m http.server 8080
# 然后访问 http://localhost:8080

# 方式三：直接双击 index.html（AI 接口会回退到本地 Demo 图）
```

---

## ⚙️ AI 生成接口说明

只有「Create IP」这一步会调用真实 AI，通过 Serverless 代理，**API Key 绝不下发到浏览器**：

- 未配置 AI 时，接口自动返回「回退」，前端使用 `assets/demo/` 三张演示图。
- 配置真实 AI 时，在环境变量中设置：

```bash
IMAGE_PROVIDER   # fallback | openai | replicate
IMAGE_API_URL    # 上游生图接口地址
IMAGE_API_KEY    # 上游 API Key（仅服务端可见）
IMAGE_MODEL      # 可选，模型名
```

失败或超过 12 秒自动回退，保证现场演示稳定。

---

## ✅ 验收标准（完成度）

- 首页到最终页无死路，所有按钮可点
- 可上传真实照片并即时预览
- A/B/C 可选择，后续页面始终复用同一 IP
- 场景可切换、商品可多选不丢
- 最终至少展示 3 个商品同一 IP
- 编辑器文字 / 图片可拖拽，Undo / Redo / Delete 有效
- 可导出 PNG
- 项目可保存并在 My ToonStars 重新打开
- AI 失败不阻塞流程
- 375px 移动端无横向滚动、微信可打开