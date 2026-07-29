# goboard-sdk 本地联调

本项目通过 npm 依赖 [`goboard-sdk`](https://www.npmjs.com/package/goboard-sdk)。需要改 SDK 源码并在本仓库联调时，用本地 `file:` 指向 SDK 仓库；联调结束再切回 npm 版本。

当前状态：**npm 发版**（`goboard-sdk@0.2.1`）。

## 切到本地联调

1. 确保本机存在 SDK 仓库，且已构建 `dist`：

```bash
cd /path/to/goboard-sdk
pnpm build
```

2. 修改本仓库 `package.json`：

```json
"goboard-sdk": "file:../../remake/goboard-sdk"
```

路径按本机 `go-3d` 与 `goboard-sdk` 的相对位置调整。

3. 重新安装：

```bash
nvm use 20 && yarn install
```

之后改 SDK 源码需重新 `pnpm build`，本仓库才能吃到最新产物（必要时再 `yarn install` 刷新链接）。

## 切回 npm 发版

```bash
nvm use 20 && yarn add goboard-sdk@0.2.1
```

升级到更新版本时改为目标版本号，例如 `yarn add goboard-sdk@latest`。
