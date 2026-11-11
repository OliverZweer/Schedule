"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { getDayInfo } from "@/lib/calendar/lunar";
import { dateKey, weekdayFull } from "@/lib/date";
import { useAuth } from "./AuthProvider";

type Mode = "signin" | "signup";

const inputClass =
  "w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm text-ink outline-none transition placeholder:text-ink-faint/70 focus:border-accent/60 focus:ring-2 focus:ring-accent/10";

export function AuthScreen({ initialToday }: { initialToday: Date }) {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const dayInfo = getDayInfo(dateKey(initialToday));
  const dateLabel = `${initialToday.getFullYear()}年${initialToday.getMonth() + 1}月${initialToday.getDate()}日 · ${weekdayFull(initialToday)}`;

  const switchMode = (next: Mode) => {
    setMode(next);
    setError(null);
    setNotice(null);
    setConfirmPassword("");
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setNotice(null);

    if (!email.trim()) {
      setError("请输入邮箱");
      return;
    }
    if (password.length < 6) {
      setError("密码至少需要 6 位");
      return;
    }
    if (mode === "signup" && password !== confirmPassword) {
      setError("两次输入的密码不一致");
      return;
    }

    setSubmitting(true);
    try {
      if (mode === "signin") {
        const result = await signIn(email, password);
        if (result.error) setError(result.error);
      } else {
        const result = await signUp(email, password);
        if (result.error) {
          setError(result.error);
        } else if (result.needsConfirmation) {
          setNotice(
            "验证邮件已发送，请点击邮件中的链接完成注册，然后返回这里登录。",
          );
          setMode("signin");
          setPassword("");
          setConfirmPassword("");
        }
        // If the project has email confirmation disabled, the auth state
        // change immediately unlocks the calendar; no further action needed.
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-dvh bg-canvas">
      <aside className="relative hidden w-[46%] flex-col justify-between overflow-hidden bg-[#1f2228] p-10 text-white lg:flex xl:p-14">
        <div className="pointer-events-none absolute -right-32 -top-32 size-[420px] rounded-full bg-accent/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -left-24 size-[360px] rounded-full bg-term/10 blur-3xl" />

        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-accent font-serif text-xl leading-none shadow-lg">
              序
            </div>
            <div>
              <div className="text-sm font-semibold tracking-wide">岁序</div>
              <div className="text-[10px] tracking-[0.18em] text-white/40">
                PERSONAL CALENDAR
              </div>
            </div>
          </div>

          <h1 className="mt-16 font-serif text-4xl leading-[1.22] tracking-tight xl:text-5xl">
            把日子，
            <br />
            过成有迹可循的样子。
          </h1>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/55">
            公历、农历、法定节假日与跨天日程，集中在一个安静的地方。
          </p>

          <div className="mt-9 inline-flex flex-col rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 backdrop-blur">
            <span className="text-[11px] text-white/45">{dateLabel}</span>
            <span className="mt-1 text-sm font-medium">
              农历{dayInfo.lunarMonthLabel}月{dayInfo.lunarDayLabel} ·{" "}
              {dayInfo.ganzhiYear}年 · 属{dayInfo.zodiac}
            </span>
            {dayInfo.secondaryLabel && (
              <span className="mt-0.5 text-xs text-accent">
                {dayInfo.secondaryLabel}
              </span>
            )}
          </div>
        </div>

        <div className="relative">
          <ul className="space-y-2 text-xs text-white/50">
            <li>农历、二十四节气与传统节日</li>
            <li>国务院办公厅法定节假日与调休</li>
            <li>跨天日程、分类与颜色</li>
            <li>Supabase 云端同步，多端可用</li>
          </ul>
          <p className="mt-6 text-[10px] text-white/30">
            数据由 Row Level Security 隔离，仅你可见。
          </p>
        </div>
      </aside>

      <main className="flex flex-1 items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-[380px]">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <div className="grid size-9 place-items-center rounded-lg bg-accent font-serif text-lg leading-none text-white shadow-sm">
              序
            </div>
            <div>
              <div className="text-sm font-semibold">岁序 · 个人日历</div>
              <div className="mt-0.5 text-[10px] text-ink-faint">
                农历 · 节假日 · 云端日程
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-semibold tracking-tight">
            {mode === "signin" ? "登录你的日历" : "创建账户"}
          </h2>
          <p className="mt-1.5 text-xs leading-relaxed text-ink-soft">
            {mode === "signin"
              ? "使用邮箱继续，日程仅你自己可见。"
              : "注册后即可在电脑和手机上同步日程。"}
          </p>

          <div className="mb-5 mt-7 flex rounded-xl border border-line bg-surface-muted p-1">
            <button
              type="button"
              onClick={() => switchMode("signin")}
              className={cn(
                "flex-1 rounded-lg py-1.5 text-xs font-medium transition-colors",
                mode === "signin"
                  ? "bg-surface text-ink shadow-sm"
                  : "text-ink-faint hover:text-ink-soft",
              )}
            >
              登录
            </button>
            <button
              type="button"
              onClick={() => switchMode("signup")}
              className={cn(
                "flex-1 rounded-lg py-1.5 text-xs font-medium transition-colors",
                mode === "signup"
                  ? "bg-surface text-ink shadow-sm"
                  : "text-ink-faint hover:text-ink-soft",
              )}
            >
              注册
            </button>
          </div>

          <form onSubmit={submit} className="space-y-3.5">
            <div>
              <label
                htmlFor="auth-email"
                className="mb-1.5 block text-[11px] text-ink-soft"
              >
                邮箱
              </label>
              <input
                id="auth-email"
                type="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className={inputClass}
                required
              />
            </div>

            <div>
              <label
                htmlFor="auth-password"
                className="mb-1.5 block text-[11px] text-ink-soft"
              >
                密码
              </label>
              <input
                id="auth-password"
                type="password"
                autoComplete={
                  mode === "signin" ? "current-password" : "new-password"
                }
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="至少 6 位"
                className={inputClass}
                required
              />
            </div>

            {mode === "signup" && (
              <div>
                <label
                  htmlFor="auth-password-confirm"
                  className="mb-1.5 block text-[11px] text-ink-soft"
                >
                  确认密码
                </label>
                <input
                  id="auth-password-confirm"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(event.target.value)
                  }
                  placeholder="再次输入密码"
                  className={inputClass}
                  required
                />
              </div>
            )}

            {error && (
              <p className="rounded-lg bg-accent-soft px-3 py-2 text-[11px] leading-relaxed text-accent">
                {error}
              </p>
            )}
            {notice && (
              <p className="rounded-lg bg-term/10 px-3 py-2 text-[11px] leading-relaxed text-term">
                {notice}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-accent text-sm font-medium text-white shadow-sm transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting && <Loader2 size={15} className="animate-spin" />}
              {mode === "signin" ? "登录" : "创建账户"}
            </button>
          </form>

          {mode === "signup" && (
            <p className="mt-3 text-center text-[10px] leading-relaxed text-ink-faint">
              首次注册会向邮箱发送验证链接。
            </p>
          )}

          <button
            type="button"
            onClick={() =>
              switchMode(mode === "signin" ? "signup" : "signin")
            }
            className="mt-4 w-full text-center text-[11px] text-ink-faint transition-colors hover:text-ink"
          >
            {mode === "signin"
              ? "还没有账户？创建一个"
              : "已有账户？直接登录"}
          </button>

          <p className="mt-8 text-center text-[10px] text-ink-faint">
            <Link
              href="/install"
              className="underline underline-offset-2 transition-colors hover:text-ink"
            >
              安装到手机 / 桌面
            </Link>
          </p>
          <p className="mt-3 text-center text-[10px] text-ink-faint">
            阶段三 · 云端账户与数据库
          </p>
        </div>
      </main>
    </div>
  );
}
