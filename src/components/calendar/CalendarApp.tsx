"use client";

import { AuthProvider, useAuth } from "@/components/auth/AuthProvider";
import { AuthScreen } from "@/components/auth/AuthScreen";
import { CalendarWorkspace } from "./CalendarWorkspace";

function AuthGate({ initialToday }: { initialToday: Date }) {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-canvas">
        <div className="grid size-12 place-items-center rounded-xl bg-accent font-serif text-2xl text-white shadow-sm">
          序
        </div>
        <div className="text-xs tracking-wide text-ink-faint">正在连接…</div>
      </div>
    );
  }

  if (!session) {
    return <AuthScreen initialToday={initialToday} />;
  }

  return <CalendarWorkspace initialToday={initialToday} />;
}

export function CalendarApp({ initialToday }: { initialToday: Date }) {
  return (
    <AuthProvider>
      <AuthGate initialToday={initialToday} />
    </AuthProvider>
  );
}
