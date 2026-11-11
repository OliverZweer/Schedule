# 岁序日历 · 桌面版说明

桌面版是一个 **Electron 悬浮日历**：紧凑窗口、默认置顶、托盘常驻、开机启动，并内置了 Next.js 服务与页面资源，不要求用户另装 Node.js。

## Windows

### 安装

安装包位于桌面：

```
C:\Users\olive\Desktop\岁序日历-交付\Windows\岁序日历-0.1.0-Windows-x64.exe
```

1. 双击安装包。
2. 选择安装目录（默认当前用户目录，无需管理员权限）。
3. 安装完成后从桌面 / 开始菜单启动「岁序日历」。
4. 首次启动会自动注册开机启动，可在托盘菜单中关闭。
5.  installer 未做代码签名，Windows SmartScreen 可能提示「已保护你的电脑」：
   点击「更多信息」→「仍要运行」。这是未签名应用的正常提示。

### 使用

- 默认 **窗口置顶**，尺寸约 460×780，可拖动边缘调整大小。
- 关闭窗口不会退出应用，而是收进 **系统托盘**；点击托盘图标或按 `Ctrl+Shift+C` 显示 / 隐藏。
- 托盘菜单：
  - 显示 / 隐藏日历
  - 窗口置顶（可关闭）
  - 开机启动（可关闭）
  - 安装到手机 / 桌面（打开 PWA 安装指南）
  - 退出
- 通过右上角账户菜单登录同一账号，与网页版 / 手机端共用云端数据。
- 桌面版内置 Next.js standalone 服务，固定监听 `127.0.0.1:3210`；请勿让其他程序占用该端口。

### 日志

启动失败时查看：

```
%APPDATA%\岁序日历\server.log
```

### 从源码构建

要求 Node.js 20+。

```powershell
npm install
npm run build
node scripts/prepare-desktop.mjs
npx electron-builder --win
```

产物在 `release\`。

## macOS

**当前 Windows 机器无法生成 `.dmg` 安装包。** electron-builder 的 macOS 目标必须在
macOS 上构建（需要 Apple 的工具链与签名流程）。

已准备好 macOS 配置与 CI：

### 方式一：GitHub Actions（推荐）

仓库中提供 `.github/workflows/build-desktop.yml`：

1. 将项目推到 GitHub。
2. 在仓库 Settings → Secrets 配置：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Actions → Build desktop installers → Run workflow。
4. 下载 `desktop-macos-latest` artifact，内含 `.dmg`。

### 方式二：在 Mac 上构建

```bash
npm ci
npm run build
node scripts/prepare-desktop.mjs
npx electron-builder --mac
```

产物为 `release/岁序日历-0.1.0-macOS-x64.dmg` 与 `arm64.dmg`。

### macOS 注意事项

- 未签名 / 未公证的 DMG 会被 Gatekeeper 拦截。首次打开需右键 →「打开」，
  或执行 `xattr -dr com.apple.quarantine /Applications/岁序日历.app`。
- 要分发给其他用户并避免警告，需要 Apple Developer Program 证书并进行 notarization。
- 开机启动通过 `app.setLoginItemSettings` 注册，可在托盘菜单关闭。
- Intel 与 Apple Silicon 分别构建（工作流会分别产出 x64 / arm64）。

## 架构说明

- Electron 主进程：`electron/main.cjs`
- 生产环境自动启动内置的 Next.js standalone 服务器（`resources/app-server`），
  再加载 `http://127.0.0.1:3210`。
- 认证与日程数据仍由 Supabase 提供；桌面版不包含任何服务密钥。
- 版本号与安装包名由 `package.json` 的 `version` 与 `build` 配置决定。
