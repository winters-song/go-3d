# Go 3D — 沉浸式围棋三维场景

在日式和室中落子对弈，于榻榻米与庭园之间复盘棋谱。本项目基于 **Next.js**、**Three.js** 与 **React Three Fiber** 构建，将传统围棋与高品质 3D 渲染结合，提供可交互的棋盘、棋谱回放与多场景切换体验。

![围棋 3D 场景预览](./screenshot.jpg)

## 场景概览

主场景还原了一间典型的日式和室（Washitsu）：

- **榻榻米地面**与木质立柱，营造安静对弈氛围
- **障子门**外是绿意盎然的庭园，远处石灯笼点缀景深
- 中央摆放传统**木制围棋盘**，黑白棋子带有真实材质与阴影
- **HDR 环境光**与柔和阴影，让室内与室外光线自然过渡

底部工具栏显示当前手数（如「第 4 步」），支持棋谱逐步前进、后退与跳转；右侧提供音效、视角锁定、全屏、俯视等快捷操作。

## 主要功能

- **3D 围棋盘** — 19 路棋盘，支持落子、提子与棋形展示
- **棋谱回放** — 加载 SGF 文件，支持逐步/跳步浏览与分支变化
- **场景切换** — 多套 3D 场景（和室、公司会议室、日落户外等）
- **相机控制** — 自由旋转、俯视、锁定视角、全屏模式
- **音效** — 落子音效，可一键开关
- **KataGo 集成** — 对接 KataGo 引擎进行 AI 分析（见 `KataGoService`）
- **后端通信** — 基于 iframe + `postMessage` 的跨页面消息通道，便于嵌入与扩展

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Next.js 15、React 19 |
| 3D 渲染 | Three.js、@react-three/fiber、@react-three/drei |
| 后处理 | @react-three/postprocessing |
| 状态管理 | Redux Toolkit |
| 样式 | Tailwind CSS 4 |
| 模型 | GLB / Draco 压缩模型 |

## 快速开始

### 环境要求

- Node.js 18+
- Yarn 或 npm

### 安装与运行

```bash
# 安装依赖
yarn install

# 启动开发服务器
yarn dev
```

浏览器访问 [http://localhost:3000](http://localhost:3000) 即可进入主场景。

### 其他命令

```bash
yarn build    # 生产构建
yarn start    # 启动生产服务
yarn lint     # 代码检查
```

## 页面路由

| 路径 | 说明 |
|------|------|
| `/` | 主场景 — 日式和室围棋对弈 |
| `/zen` | 与主场景相同（禅意和室） |
| `/company` | 公司会议室场景 |
| `/sunset` | 日落户外场景 |
| `/preview` | 3D 模型预览工具 |
| `/backend` | 后端逻辑 iframe 页面 |
| `/test-backend` | 后端通信测试页 |

## 项目结构

```
src/
├── app/                    # Next.js 页面路由
│   ├── page.tsx            # 主场景入口
│   ├── company/            # 会议室场景
│   ├── sunset/             # 日落场景
│   └── api/                # API 路由（对局、落子等）
├── components/
│   ├── go/                 # 围棋逻辑（棋盘、棋谱、播放器）
│   ├── models/             # 3D 模型组件（房间、棋盘、棋子）
│   └── ui/                 # 界面（底栏、侧栏、导航按钮）
├── services/
│   ├── BackendCommunication.ts  # iframe 消息通信
│   └── KataGoService.ts         # KataGo 引擎对接
├── store/                  # Redux 状态（相机等）
└── tools/                  # 模型转换与处理工具

public/
├── glb/                    # 3D 场景模型（Draco 压缩）
├── draco/                  # Draco 解码器
└── hdri/                   # HDR 环境贴图
```

## 模型压缩

使用 `gltf-pipeline` 对 GLB 模型进行 Draco 压缩，减小加载体积：

```bash
gltf-pipeline -i public/glb/room-baked.glb -o public/glb/room-baked.draco.glb --draco.compressionLevel=7
gltf-pipeline -i public/glb/company.glb -o public/glb/company.draco.glb --draco.compressionLevel=7
```

## 棋谱使用

1. 点击右侧栏的「打开文件」图标
2. 选择 `.sgf` 棋谱文件
3. 使用底部导航按钮逐步浏览，或跳转至开局/终局

## 后端通信

应用通过隐藏 iframe 与 `/backend` 页面进行 `postMessage` 通信，支持模型状态查询、落子、音效、相机与环境更新等消息类型。详细 API 见 [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)。

```typescript
import { backendComm } from '@/services/BackendCommunication'

// 发送落子
await backendComm.sendGameMove({ col: 3, row: 3, color: 1 })

// 监听模型更新
backendComm.on('model_update', (data) => {
  console.log('模型已更新:', data)
})
```

## 许可证

本项目为私有学习项目（`private: true`）。
