# 岁序 · 个人日历

面向中文用户的个人日历应用：公历 + 农历 + 法定节假日、跨天日程、云端同步与 PWA 安装。当前处于分阶段开发中，**尚未部署上线**。

## 当前进度

### 阶段一 · 项目初始化与静态日历（已完成）

- Next.js 16（App Router）+ React 19 + TypeScript + Tailwind CSS 4
- 月视图：固定六周网格、周一开头、上下月日期延伸、当前日期标记
- 周视图：全天行 + 24 小时时间轴、当前时间指示线、重叠日程并排布局
- 日视图：全天日程 + 时间轴
- 月/周/日切换、上一页/下一页、返回今天
- 跨天日程在同一周内连续显示，跨周自动分段并保留「延续」圆角
- 日程详情面板：桌面端右侧常驻，移动端底部抽屉
- 新建 / 编辑 / 删除日程（阶段一为内存数据，刷新后重置）
- 学习 / 工作 / 生活 / 会议 / 其他分类与颜色过滤
- 响应式：桌面侧边栏、手机紧凑头部与点状日程标记

### 阶段二 · 日期系统（已完成）

- 接入 `lunar-javascript`：农历月日、闰月（如 2025 年闰六月）、干支纪年、生肖
- 二十四节气：立春、清明、冬至等按库计算，不写死日期
- 传统节日：除夕、春节、元宵、龙抬头、端午、七夕、中秋、重阳、腊八等
- 法定节假日与调休：独立的数据文件 `src/data/holidays/2025.json`、`2026.json`、`2027.json`
- 月视图每格显示：公历日、农历日/月（初一显示月份）、节日或节气、`休` / `班` 标识
- 日视图与详情面板显示完整农历、干支生肖、节气/节日、法定节假日说明
- 未收录年份（如 2028）明确提示「安排尚未收录」，不猜测、不补数据

### 阶段三 · 云端数据库与 CRUD（已完成并验证）

- Supabase Auth：邮箱注册、登录、退出；未登录不渲染日历
- `profiles` / `events` 表、UUID 主键、RLS 按 `auth.uid()` 隔离
- `events.version` 乐观并发：多设备同时修改时提示冲突而不是静默覆盖
- 云端加载、创建、编辑、删除；同步状态、最近同步时间、失败重试
- 完整 SQL 迁移：`supabase/migrations/20261111100000_init.sql`
- 已通过真实项目验证：
  - RLS 12/12：匿名读取拒绝，跨账号读取 / 修改 / 删除 / 伪造插入均被拒绝
  - 界面登录、注册、退出、单日与跨周日程、编辑、删除
  - 真实云端跨月（11/29–12/2）与跨年（12/30–1/2）日程显示
  - `version` 递增与过期版本更新拒绝

### 阶段四 · 实时同步、PWA 与桌面版（主要部分完成）

- **Supabase Realtime**：两个独立浏览器登录同一账号，新增 / 修改 / 删除在另一侧即时出现
- **PWA**：`app/manifest.ts`、`public/sw.js`、192/512/maskable/Apple 图标、`/install` 安装页
- 安装页区分 iPhone/iPad、Android、电脑，并明确说明 HTTPS 要求与「不是 APK/IPA」
- **桌面版**：Electron 悬浮窗口（默认置顶）、托盘、`Ctrl+Shift+C`、开机启动
- 桌面版内置 Next.js standalone 服务，不要求用户另装 Node.js
- Windows NSIS 安装包已生成，并复制到桌面交付目录
- macOS DMG 构建配置与 GitHub Actions 工作流已准备；Windows 无法直接产出 DMG
- 尚未完成：离线日程缓存与待同步队列、密码修改、ICS 导出、设置页、公网部署

### 尚未实现（后续阶段）

| 阶段 | 内容 | 状态 |
| --- | --- | --- |
| 四 | 实时同步、PWA、桌面版 | 已完成主要部分 |
| 五 | 离线缓存与队列、设置页、密码修改、ICS 导出 | 未开始 |
| 六 | 公网部署、手机安装、生产验证 | 未开始 |

## 技术栈

- **框架**：Next.js 16.4（App Router、Turbopack）、React 19、TypeScript
- **样式**：Tailwind CSS 4（设计令牌位于 `src/app/globals.css`）
- **日期**：date-fns；所有日期键统一为 `yyyy-MM-dd`，默认时区 `Asia/Shanghai`
- **农历**：`lunar-javascript`（闰月返回负数月份；节气/节日由库计算）
- **后端**：Supabase PostgreSQL / Auth / Realtime
- **PWA**：Web App Manifest + 手写 Service Worker
- **桌面版**：Electron 45 + electron-builder（内置 Next.js standalone）
- **测试**：Vitest；Playwright Core 用于本地 UI / 实时同步 / 桌面端验证

## 本地运行

要求 Node.js 20+（开发环境使用 Node 24）。

```bash
npm install
npm run dev        # http://localhost:3000
npm run lint       # ESLint
npm test           # Vitest
npm run build      # 生产构建（同时生成 standalone 服务器）
npm start          # 运行生产构建
npm run desktop:dev    # Electron 开发窗口（需先 npm run dev）
npm run desktop:build  # Windows 安装包，输出到 release/
npm run desktop:build:mac # macOS DMG，必须在 macOS 上运行
npm run icons          # 重新生成 PWA / 桌面图标
```

### Supabase 配置

1. 复制环境变量模板并填入项目信息：

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

只使用 anon / publishable key。`service_role` key 不得出现在前端或仓库中。

2. 在 Supabase Dashboard → SQL Editor 中执行
   `supabase/migrations/20261111100000_init.sql`（整段执行一次）。

3. Authentication → URL Configuration：
   - Site URL：开发环境填 `http://localhost:3000`
   - Redirect URLs：加入 `http://localhost:3000/**`（生产环境换成正式域名）

4. 邮箱确认：默认开启。开发阶段可在 Authentication → Providers → Email
   关闭「Confirm email」以便立即登录；**上线前应重新开启**。开启时注册后需点击
   验证邮件中的链接。

5. 启动：

```bash
npm run dev
```

迁移执行后，首次注册会自动创建 `profiles` 记录；所有日程读写都经过 RLS。

## 桌面版（Windows / macOS）

Windows 安装包（构建后）：

```
release/岁序日历-0.1.0-Windows-x64.exe
```

交付副本位于 `C:\Users\olive\Desktop\岁序日历-交付\Windows\`。

- 悬浮窗口、默认置顶、系统托盘、开机启动、`Ctrl+Shift+C` 显示 / 隐藏
- 内置 Next.js standalone 服务，固定监听 `127.0.0.1:3210`
- 安装包未签名：SmartScreen 需「更多信息 → 仍要运行」
- macOS `.dmg` 必须在 macOS / GitHub Actions 上构建，Windows 无法直接产出；
  配置见 `docs/desktop.md` 与 `.github/workflows/build-desktop.yml`
- 构建：`npm run build && node scripts/prepare-desktop.mjs && npx electron-builder --win`

## PWA 与移动端

- 安装页：`/install`（无需登录）
- 资源：`/manifest.webmanifest`、`/sw.js`、`/icons/*`
- iOS：Safari → 分享 → 添加到主屏幕
- Android：Chrome → 菜单 → 安装应用 / 添加到主屏幕
- 安装需要 HTTPS 域名；当前尚未部署，详细步骤见 `docs/mobile-install.md`
- 不提供 APK / IPA：PWA 不从应用商店安装，iOS 也不允许网页直接安装 `.ipa`

## 目录结构

```
electron/
  main.cjs              # 悬浮窗口、托盘、开机启动、内置服务器
.github/workflows/
  build-desktop.yml     # Windows / macOS 安装包 CI
docs/
  desktop.md            # Windows / macOS 桌面版说明
  mobile-install.md     # iOS / Android PWA 安装教程
scripts/
  build-holidays.mjs    # 根据官方通知生成并校验年度节假日 JSON
  generate-icons.mjs    # 生成 PWA / 桌面图标
  prepare-desktop.mjs   # 复制 standalone 静态资源
  after-pack.cjs        # 把 standalone node_modules 注入安装包
build/
  icon.png icon.ico tray.png
public/
  sw.js                 # Service Worker（应用外壳缓存）
  icons/                # 192 / 512 / maskable / Apple 图标
supabase/
  migrations/
    20261111100000_init.sql # profiles/events、RLS、触发器、Realtime
src/
  app/
    manifest.ts         # Web App Manifest
    install/page.tsx    # 安装指南
    offline/page.tsx    # 离线兜底页
    layout.tsx          # 全局布局、PWA 元数据、SW 注册
    page.tsx            # 服务端计算上海时区“今天”，动态渲染
    globals.css         # 设计令牌、浅色/深色变量、动画
  components/
    auth/
      AuthProvider.tsx  # Supabase 会话、登录/注册/退出
      AuthScreen.tsx    # 登录与注册界面
    calendar/
      CalendarApp.tsx   # AuthProvider + 登录门禁
      CalendarWorkspace.tsx # 日历状态编排与三视图切换
      CalendarHeader.tsx  # 顶栏、导航、账户菜单
      MonthView.tsx       # 月视图、农历/节日、跨天事件条
      WeekView.tsx        # 周视图（全天行 + 时间轴）
      DayView.tsx         # 日视图
      DayPanel.tsx        # 桌面详情栏 / 移动端底部抽屉
      DayMeta.tsx         # 农历信息与休/班标签
      EventDialog.tsx     # 新建与编辑表单
      Sidebar.tsx         # 迷你月历、分类过滤、同步状态
    pwa/
      InstallGuide.tsx    # 平台识别与安装说明
      ServiceWorkerRegister.tsx
  data/holidays/
    2025.json 2026.json 2027.json # 版本化法定节假日数据
  lib/
    date.ts             # 时区、日期键、网格与格式化
    calendar/
      types.ts          # 日程 / 分类 / 视图类型
      categories.ts     # 预设分类与颜色
      layout.ts         # 跨天分段、泳道分配、重叠布局
      lunar.ts          # 农历、节气、节日、日期展示优先级
      holidays.ts       # 节假日数据索引与查询
      events-repo.ts    # events 表读写与行/模型映射
      use-cloud-events.ts # 云端加载、CRUD、Realtime、同步状态
    supabase/
      client.ts         # 浏览器客户端（仅 anon key）
      server.ts         # 服务端客户端（预留）
  types/
    lunar-javascript.d.ts # 农历库最小类型声明
```

## 法定节假日数据

数据依据国务院办公厅年度通知录入，**不使用农历推算，也不依赖第三方节假日 API**：

| 年份 | 通知文号 | 发布日期 | 来源 |
| --- | --- | --- | --- |
| 2025 | 国办发明电〔2024〕12号 | 2024-11-12 | [中国政府网](https://www.gov.cn/zhengce/zhengceku/202411/content_6986383.htm) |
| 2026 | 国办发明电〔2025〕7号 | 2025-11-04 | [中国政府网](https://www.gov.cn/zhengce/zhengceku/202511/content_7047091.htm) |
| 2027 | 国办发明电〔2026〕10号 | 2026-11-05 | [中国政府网](https://www.gov.cn/zhengce/content/202611/content_7085101.htm) |

每个日期包含：

- `isHoliday`：当天是否放假（含周末与调休形成的假期）
- `isStatutory`：当天是否为《全国年节及纪念日放假办法》规定的法定节假日
- `isMakeupWorkday`：当天是否为调休上班日
- `name` / `note`：假期名称与说明

### 新增一年

1. 在 `scripts/build-holidays.mjs` 的 `YEARS` 中加入该国办通知的假期区间、法定日、调休日与文号；
2. 运行 `node scripts/build-holidays.mjs` 生成 JSON；
3. 在 `src/lib/calendar/holidays.ts` 中导入新 JSON 并加入 `YEARS`；
4. 运行 `npm test`，补充该年份的关键日期测试。

未公布年份不要编造数据。应用会在未收录年份显示明确提示。

## 关键设计约定

- **周起始日**：周一。月视图固定显示 6 周，保证月份切换时高度稳定。
- **跨天日程**：按周切片渲染，用 `continuesBefore/After` 决定圆角，跨月、跨年由日期字符串比较自然处理。
- **时间日程**：编辑器限制为当天；跨天安排必须使用「全天」。这是有意的数据模型约束，避免「开始/结束时间 + 多日」产生歧义。
- **时区**：服务端用 `Intl.DateTimeFormat` 计算 `Asia/Shanghai` 的当天，避免设备时区导致首屏与 hydration 不一致。
- **展示优先级**：传统节日 > 节气 > 重要公历节日；农历日期始终显示在第一行，节日/节气显示在第二行。
- **安全**：浏览器仅使用 anon key；所有私人数据经 RLS 按 `auth.uid()` 隔离；`service_role` key 不得出现在前端或仓库中。

## 测试

```bash
npm test   # 32 项单元测试
```

覆盖：上海时区跨日、六周网格、周一起始、跨月/跨年事件分段、泳道与重叠布局、闰六月起止、除夕/春节/元宵/端午/中秋/重阳、立春/清明/冬至节气、2025–2027 节假日与调休完整性、未收录年份、数据库行与前端日程模型的双向映射。

### 手动端到端验证

- **实时同步**：两个独立浏览器上下文登录同一账号，新增 / 修改 / 删除均即时同步
- **PWA**：Manifest 返回 200、3 个图标可访问、Service Worker 注册成功、安装页 390px 无横向溢出
- **桌面版**：打包后的 exe 登录并加载日历；内置服务器监听 `127.0.0.1:3210`
- **Windows 安装包**：NSIS 构建成功，约 120 MB，未签名

## 下一步

阶段五：离线日程缓存与待同步队列、设置页、密码修改、ICS 导出。阶段六：公网部署后生成手机安装入口与二维码。
