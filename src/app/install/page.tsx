import type { Metadata } from "next";
import Link from "next/link";
import { InstallGuide } from "@/components/pwa/InstallGuide";

export const metadata: Metadata = {
  title: "安装岁序 · 个人日历",
  description: "将岁序安装到 iPhone、iPad、Android 或电脑桌面。",
};

export default function InstallPage() {
  return (
    <main className="min-h-dvh bg-canvas">
      <div className="mx-auto max-w-3xl px-5 py-8 sm:px-8 sm:py-10">
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="grid size-9 place-items-center rounded-lg bg-accent font-serif text-lg leading-none text-white shadow-sm">
              序
            </div>
            <div>
              <div className="text-sm font-semibold tracking-tight">
                岁序 · 个人日历
              </div>
              <div className="text-[10px] text-ink-faint">安装指南</div>
            </div>
          </Link>
          <Link
            href="/"
            className="rounded-lg border border-line px-2.5 py-1.5 text-[11px] text-ink-soft transition-colors hover:bg-surface-muted hover:text-ink"
          >
            返回日历
          </Link>
        </div>

        <InstallGuide />

        <p className="mt-8 text-center text-[10px] leading-relaxed text-ink-faint">
          安装文件由 Web App Manifest、Service Worker 与 192/512 图标组成，
          部署到 HTTPS 域名后即可在 iOS、Android 与桌面浏览器安装。
        </p>
      </div>
    </main>
  );
}
