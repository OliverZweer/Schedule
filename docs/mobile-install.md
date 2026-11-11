# 岁序日历 · iOS / Android 安装指南

岁序使用 **PWA（渐进式 Web 应用）** 方式安装，不通过 App Store 或应用商店。

> **重要前提**：安装必须通过 **HTTPS 域名** 访问。浏览器只允许安全来源注册 Service Worker。
> 本地 `localhost` / `127.0.0.1` 是例外，但手机无法用电脑的 localhost 访问。
> 因此手机安装需要先完成第 6 阶段的公网部署（Vercel / Cloudflare 等），拿到 `https://` 网址后即可安装。

## 安装文件

安装所需的文件已经内置于 Web 应用：

| 文件 | 作用 |
| --- | --- |
| `/manifest.webmanifest` | 应用名称、图标、主题色、standalone 显示模式 |
| `/sw.js` | Service Worker，缓存应用外壳、支持离线打开 |
| `/icons/icon-192.png`、`/icons/icon-512.png` | 主屏幕图标 |
| `/icons/icon-maskable-512.png` | Android 自适应图标 |
| `/icons/apple-touch-icon.png` | iOS 主屏幕图标 |

在线查看图文安装页：部署后访问 `https://你的域名/install`。

## iPhone / iPad（Safari）

要求：iOS / iPadOS 16.4 及以上。

1. 使用 **Safari** 打开部署后的网址。
   - 不要使用微信、QQ、抖音等内置浏览器。
   - iOS 上的 Chrome / Edge 也不能安装 PWA，必须用 Safari。
2. 点击 Safari 底部工具栏的 **「分享」** 按钮（方框向上箭头）。
3. 在菜单中选择 **「添加到主屏幕」**。
4. 名称保持「岁序」，点击右上角 **「添加」**。
5. 回到主屏幕，点击「岁序」图标启动。
   - 启动后没有地址栏，显示为独立全屏应用。

## Android（Chrome）

要求：Android 8 及以上，Chrome 浏览器。

1. 使用 **Chrome** 打开部署后的网址。
2. 点击右上角 **「⋮」** 菜单。
3. 选择 **「安装应用」** 或 **「添加到主屏幕」**。
   - 如果浏览器地址栏出现安装图标，也可以直接点击。
4. 确认安装，从主屏幕启动。

部分国产浏览器（小米、华为、UC 等）可能不支持 PWA 安装，请改用 Chrome。

## 电脑（Chrome / Edge）

1. 用 Chrome 或 Edge 打开部署后的网址。
2. 点击地址栏右侧的 **安装图标**。
3. 或打开浏览器菜单 → **应用** → **安装此站点**。
4. 安装后可从桌面快捷方式以独立窗口启动。

## 安装后验证

- 打开后应 **没有浏览器地址栏**。
- 应用切换器中显示独立图标。
- 在应用内的「账户菜单 → 安装到手机 / 桌面」可再次查看本指南。

## 常见问题

**看不到「添加到主屏幕」**
- 确认使用的是 Safari（iOS）或 Chrome（Android）。
- 确认网址是 `https://` 开头，且不是微信内置浏览器。
- 刷新页面后重试；iOS 需要先滚动页面让分享按钮出现。

**安装后仍是浏览器页面**
- 说明只是添加了书签，不是 PWA 安装。请删除书签，按上面的步骤重新添加到主屏幕。
- iOS 必须从 Safari 的分享菜单进入，不能从「书签」进入。

**离线时能做什么**
- 应用界面（外壳）会由 Service Worker 缓存，可在离线时打开。
- 日程数据的离线读取与待同步队列属于阶段 5 的功能；当前离线时无法读取云端日程。

**需要 APK / IPA 吗**
- PWA 不需要 APK 或 IPA，也不能从网页直接安装 `.ipa`。
- 如果需要原生安装包，需要额外条件：
  - iOS：Apple Developer Program（年费）、macOS + Xcode、签名与 TestFlight/App Store 审核。
  - Android：Android Studio / SDK、签名证书、Google Play 或侧载分发。
- 本项目当前采用 PWA 方案，未生成原生 APK/IPA。
