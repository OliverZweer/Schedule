"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  LogOut,
  Plus,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { cn } from "@/lib/cn";
import type { CalendarView } from "@/lib/calendar/types";

const VIEW_OPTIONS: { value: CalendarView; label: string }[] = [
  { value: "month", label: "月" },
  { value: "week", label: "周" },
  { value: "day", label: "日" },
];

const iconButton =
  "grid size-8 place-items-center rounded-lg text-ink-soft transition-colors hover:bg-surface-muted hover:text-ink";

const todayButton =
  "shrink-0 rounded-lg border border-line px-2 py-1 text-[11px] font-medium text-ink-soft transition-colors hover:bg-surface-muted hover:text-ink sm:px-2.5 sm:text-xs";

function ViewSwitch({
  view,
  onChange,
  className,
}: {
  view: CalendarView;
  onChange: (view: CalendarView) => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex rounded-lg border border-line bg-surface-muted p-0.5",
        className,
      )}
    >
      {VIEW_OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            "rounded-md px-2 py-1 text-[11px] font-medium transition-colors sm:px-2.5 sm:text-xs",
            view === option.value
              ? "bg-surface text-ink shadow-sm"
              : "text-ink-faint hover:text-ink-soft",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function UserMenu() {
  const { session, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const email = session?.user.email ?? "";

  useEffect(() => {
    if (!open) return;
    const handleClick = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  if (!email) return null;

  const initial = email.slice(0, 1).toUpperCase();

  const handleSignOut = async () => {
    setOpen(false);
    try {
      await signOut();
    } catch (error) {
      console.error("退出登录失败", error);
    }
  };

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        type="button"
        aria-label="账户菜单"
        aria-expanded={open}
        title={email}
        onClick={() => setOpen((value) => !value)}
        className="grid size-8 place-items-center rounded-full bg-accent-soft text-[11px] font-semibold text-accent ring-1 ring-accent/20 transition hover:ring-accent/40"
      >
        {initial}
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-50 w-56 animate-fade-in overflow-hidden rounded-xl border border-line bg-surface shadow-xl">
          <div className="border-b border-line px-3 py-2.5">
            <div className="text-[10px] text-ink-faint">已登录</div>
            <div className="mt-0.5 truncate text-xs font-medium">{email}</div>
          </div>
          <Link
            href="/install"
            onClick={() => setOpen(false)}
            className="flex w-full items-center gap-2 border-b border-line px-3 py-2.5 text-left text-xs text-ink-soft transition-colors hover:bg-surface-muted hover:text-ink"
          >
            <Download size={13} />
            安装到手机 / 桌面
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-xs text-ink-soft transition-colors hover:bg-surface-muted hover:text-ink"
          >
            <LogOut size={13} />
            退出登录
          </button>
        </div>
      )}
    </div>
  );
}

interface CalendarHeaderProps {
  view: CalendarView;
  title: string;
  onViewChange: (view: CalendarView) => void;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onAdd: () => void;
}

export function CalendarHeader({
  view,
  title,
  onViewChange,
  onPrev,
  onNext,
  onToday,
  onAdd,
}: CalendarHeaderProps) {
  return (
    <header className="z-30 shrink-0 border-b border-line bg-surface/95 backdrop-blur">
      <div className="flex h-14 items-center gap-1.5 px-2.5 sm:h-16 sm:gap-2 sm:px-5">
        <div className="flex shrink-0 items-center gap-2.5">
          <div className="grid size-8 place-items-center rounded-lg bg-accent font-serif text-[17px] leading-none text-white shadow-sm">
            序
          </div>
          <div className="hidden leading-tight md:block">
            <div className="text-[13px] font-semibold tracking-tight">岁序</div>
            <div className="text-[10px] text-ink-faint">个人日历</div>
          </div>
        </div>

        <div className="ml-1 hidden h-6 w-px bg-line md:block" />

        <div className="hidden shrink-0 items-center sm:flex">
          <button type="button" onClick={onToday} className={todayButton}>
            今天
          </button>
          <button
            type="button"
            aria-label="上一页"
            onClick={onPrev}
            className={iconButton}
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            aria-label="下一页"
            onClick={onNext}
            className={iconButton}
          >
            <ChevronRight size={16} />
          </button>
        </div>

        <h1 className="ml-0.5 min-w-0 flex-1 truncate text-[15px] font-semibold tracking-tight sm:ml-2 sm:text-[17px]">
          {title}
        </h1>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <ViewSwitch
            view={view}
            onChange={onViewChange}
            className="hidden sm:flex"
          />

          <button
            type="button"
            onClick={onAdd}
            aria-label="新建日程"
            title="新建日程"
            className="flex h-8 items-center gap-1 rounded-lg bg-accent px-2 text-xs font-medium text-white shadow-sm transition-colors hover:bg-accent/90 sm:h-9 sm:px-3"
          >
            <Plus size={14} strokeWidth={2.5} />
            <span className="hidden sm:inline">新建日程</span>
          </button>

          <UserMenu />
        </div>
      </div>

      <div className="flex h-9 items-center gap-1 border-t border-line/70 px-2.5 sm:hidden">
        <button type="button" onClick={onToday} className={todayButton}>
          今天
        </button>
        <button
          type="button"
          aria-label="上一页"
          onClick={onPrev}
          className={iconButton}
        >
          <ChevronLeft size={15} />
        </button>
        <button
          type="button"
          aria-label="下一页"
          onClick={onNext}
          className={iconButton}
        >
          <ChevronRight size={15} />
        </button>
        <div className="ml-auto">
          <ViewSwitch view={view} onChange={onViewChange} />
        </div>
      </div>
    </header>
  );
}
