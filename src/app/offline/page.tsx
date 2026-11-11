import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "离线 · 岁序日历",
};

export default function OfflinePage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-canvas px-6 text-center">
      <div className="grid size-12 place-items-center rounded-xl bg-accent font-serif text-2xl text-white shadow-sm">
        序
      </div>
      <h1 className="mt-6 text-xl font-semibold tracking-tight">
        当前处于离线状态
      </h1>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink-soft">
        已缓存的界面仍可打开；日程数据需要联网后才能读取与同步。恢复网络后重新加载即可。
      </p>
      <Link
        href="/"
        className="mt-6 rounded-xl bg-accent px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-accent/90"
      >
        重新连接
      </Link>
    </main>
  );
}
