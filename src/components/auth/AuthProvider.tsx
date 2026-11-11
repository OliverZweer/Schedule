"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Session, SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

interface AuthResult {
  error: string | null;
}

interface SignUpResult extends AuthResult {
  needsConfirmation: boolean;
}

interface AuthContextValue {
  supabase: SupabaseClient;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (email: string, password: string) => Promise<SignUpResult>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function authErrorMessage(message: string): string {
  const known: [string, string][] = [
    ["Invalid login credentials", "邮箱或密码不正确"],
    ["Email not confirmed", "邮箱尚未确认，请先点击验证邮件中的链接"],
    ["User already registered", "该邮箱已注册，请直接登录"],
    ["Signups not allowed for this instance", "当前 Supabase 项目已关闭注册"],
    ["Password should be at least", "密码至少需要 6 位"],
    ["Unable to validate email address", "邮箱格式不正确"],
    ["Email rate limit exceeded", "邮件发送过于频繁，请稍后再试"],
    ["For security purposes, you can only request this after", "请求过于频繁，请稍后再试"],
  ];

  for (const [fragment, translated] of known) {
    if (message.includes(fragment)) return translated;
  }
  return message;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setLoading(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        setSession(nextSession);
        setLoading(false);
      },
    );

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, [supabase]);

  const signIn = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      return { error: error ? authErrorMessage(error.message) : null };
    },
    [supabase],
  );

  const signUp = useCallback(
    async (email: string, password: string): Promise<SignUpResult> => {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo:
            typeof window !== "undefined" ? window.location.origin : undefined,
        },
      });

      if (error) {
        return { error: authErrorMessage(error.message), needsConfirmation: false };
      }

      return { error: null, needsConfirmation: !data.session };
    },
    [supabase],
  );

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
  }, [supabase]);

  const value = useMemo<AuthContextValue>(
    () => ({ supabase, session, loading, signIn, signUp, signOut }),
    [supabase, session, loading, signIn, signUp, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
