"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Download,
  Monitor,
  Share,
  Smartphone,
} from "lucide-react";
import { cn } from "@/lib/cn";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

type Platform = "ios" | "android" | "desktop" | "unknown";

const STEPS = {
  ios: [
    "用 Safari 打开本页（不要用微信内置浏览器或 Chrome）。",
    "点击底部工具栏的「分享」按钮。",
    "在菜单中选择「添加到主屏幕」。",
    "名称保持「岁序」，点击「添加」。",
    "从主屏幕启动，即为独立全屏应用。",
  ],
  android: [
    "用 Chrome 打开本页。",
    "点击右上角的「⋮」菜单。",
    "选择「安装应用」或「添加到主屏幕」。",
    "确认安装，从主屏幕启动。",
  ],
  desktop: [
    "使用 Chrome 或 Edge 打开本页。",
    "点击地址栏右侧的安装图标。",
    "或打开浏览器菜单 → 应用 → 安装此站点。",
    "安装后可创建桌面快捷方式，以独立窗口运行。",
  ],
} as const;

function StepList({ steps }: { steps: readonly string[] }) {
  return (
    <ol className="mt-4 space-y-2.5">
      {steps.map((step, index) => (
        <li key={step} className="flex gap-2.5 text-xs leading-relaxed text-ink-soft">
          <span className="mt-[1px] grid size-5 shrink-0 place-items-center rounded-full bg-accent-soft text-[10px] font-semibold text-accent">
            {index + 1}
          </span>
          <span>{step}</span>
        </li>
      ))}
    </ol>
  );
}

export function InstallGuide() {
  const [promptEvent, setPromptEvent] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [platform, setPlatform] = useState<Platform>("unknown");

  useEffect(() => {
    const handlePrompt = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as BeforeInstallPromptEvent);
    };
    const handleInstalled = () => setInstalled(true);
    window.addEventListener("beforeinstallprompt", handlePrompt);
    window.addEventListener("appinstalled", handleInstalled);

    // Defer the platform read so the first paint stays hydration-safe and
    // we don't call setState synchronously inside the effect.
    const timer = window.setTimeout(() => {
      const userAgent = navigator.userAgent;
      const isIOS =
        /iPad|iPhone|iPod/.test(userAgent) ||
        (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
      const isAndroid = /Android/i.test(userAgent);
      setPlatform(isIOS ? "ios" : isAndroid ? "android" : "desktop");
      setInstalled(
        window.matchMedia("(display-mode: standalone)").matches ||
          (navigator as Navigator & { standalone?: boolean }).standalone ===
            true,
      );
    }, 0);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("beforeinstallprompt", handlePrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  const install = async () => {
    if (!promptEvent) return;
    await promptEvent.prompt();
    const choice = await promptEvent.userChoice;
    if (choice.outcome === "accepted") setInstalled(true);
    setPromptEvent(null);
  };

  const hint =
    platform === "ios"
      ? "iPhone / iPad 请使用 Safari 的分享菜单安装"
      : platform === "android"
        ? "Android 请使用 Chrome 菜单中的「安装应用」"
        : "Chrome / Edge 可点击地址栏右侧的安装图标";

  return (
    <>
      <section className="mt-9 overflow-hidden rounded-3xl border border-line bg-surface">
        <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-2.5 py-1 text-[10px] font-medium text-accent">
              <Download size={11} />
              无需应用商店
            </div>
            <h1 className="mt-3 font-serif text-3xl leading-tight tracking-tight sm:text-4xl">
              把岁序装到设备上
            </h1>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-soft">
              安装后会以独立全屏窗口运行，拥有自己的图标，不再显示浏览器地址栏。
            </p>
          </div>
          <div className="grid size-20 shrink-0 place-items-center rounded-3xl bg-accent font-serif text-4xl text-white shadow-lg">
            序
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-line bg-surface-muted/50 px-6 py-4 sm:px-8">
          <button
            type="button"
            onClick={install}
            disabled={!promptEvent || installed}
            className={cn(
              "flex h-10 items-center gap-2 rounded-xl px-4 text-xs font-medium transition",
              installed
                ? "bg-term/10 text-term"
                : "bg-accent text-white shadow-sm hover:bg-accent/90",
              !promptEvent && !installed && "cursor-not-allowed opacity-55",
            )}
          >
            {installed ? (
              <>
                <CheckCircle2 size={14} /> 已安装
              </>
            ) : (
              <>
                <Download size={14} /> 安装到当前设备
              </>
            )}
          </button>
          <span className="text-[11px] text-ink-faint">{hint}</span>
        </div>
      </section>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <section
          className={cn(
            "rounded-2xl border border-line bg-surface p-5",
            platform === "ios" && "ring-2 ring-accent/25",
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Smartphone size={15} className="text-accent" />
              iPhone / iPad
            </div>
            {platform === "ios" && (
              <span className="rounded bg-accent-soft px-1.5 py-0.5 text-[9px] font-medium text-accent">
                当前设备
              </span>
            )}
          </div>
          <p className="mt-1 text-[10px] text-ink-faint">Safari · iOS 16.4+</p>
          <StepList steps={STEPS.ios} />
        </section>

        <section
          className={cn(
            "rounded-2xl border border-line bg-surface p-5",
            platform === "android" && "ring-2 ring-accent/25",
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Smartphone size={15} className="text-term" />
              Android
            </div>
            {platform === "android" && (
              <span className="rounded bg-accent-soft px-1.5 py-0.5 text-[9px] font-medium text-accent">
                当前设备
              </span>
            )}
          </div>
          <p className="mt-1 text-[10px] text-ink-faint">Chrome · Android 8+</p>
          <StepList steps={STEPS.android} />
        </section>

        <section
          className={cn(
            "rounded-2xl border border-line bg-surface p-5",
            platform === "desktop" && "ring-2 ring-accent/25",
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Monitor size={15} className="text-ink-soft" />
              电脑
            </div>
            {platform === "desktop" && (
              <span className="rounded bg-accent-soft px-1.5 py-0.5 text-[9px] font-medium text-accent">
                当前设备
              </span>
            )}
          </div>
          <p className="mt-1 text-[10px] text-ink-faint">Chrome / Edge</p>
          <StepList steps={STEPS.desktop} />
        </section>
      </div>

      <div className="mt-4 rounded-2xl border border-dashed border-line bg-surface-muted/50 p-5 text-[11px] leading-relaxed text-ink-soft">
        <div className="flex items-center gap-2 font-medium text-ink">
          <Share size={13} />
          安装前请注意
        </div>
        <ul className="mt-2 space-y-1.5 text-ink-faint">
          <li>· 安装需要 HTTPS 域名。本地开发只有 localhost / 127.0.0.1 例外，手机不能直接访问电脑的 localhost。</li>
          <li>· iOS 只允许通过 Safari 安装 PWA，不提供 .ipa 下载；Android 的 PWA 也不需要 .apk。</li>
          <li>· 如果看不到安装入口，请确认不是微信/QQ 内置浏览器，并尝试刷新页面。</li>
        </ul>
      </div>
    </>
  );
}
