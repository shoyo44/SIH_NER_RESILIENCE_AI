import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

import { ShieldCheck, Loader2 } from "lucide-react";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Sign in — NER-RESILIENCE AI" },
      {
        name: "description",
        content:
          "Secure access to the NER-RESILIENCE AI predictive logistics resilience command center.",
      },
      { property: "og:title", content: "Sign in — NER-RESILIENCE AI" },
      {
        property: "og:description",
        content: "Secure operator access to the Northeast India logistics resilience engine.",
      },
    ],
  }),
  component: AuthPage,
});

type Mode = "password" | "otp";

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("password");
  const [signUp, setSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [code, setCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) void navigate({ to: "/engine", replace: true });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) void navigate({ to: "/engine", replace: true });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    setErr(null);
    setMsg(null);
    try {
      await fn();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const submitPassword = (e: React.FormEvent) => {
    e.preventDefault();
    void run(async () => {
      if (signUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: fullName },
          },
        });
        if (error) throw error;
        if (!data.session) setMsg("Check your email to confirm your account, then sign in.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    });
  };

  const sendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    void run(async () => {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: window.location.origin },
      });
      if (error) throw error;
      setOtpSent(true);
      setMsg("We emailed you a 6-digit code.");
    });
  };

  const verifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    void run(async () => {
      const { error } = await supabase.auth.verifyOtp({ email, token: code, type: "email" });
      if (error) throw error;
    });
  };

  const google = () =>
    void run(async () => {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: window.location.origin },
      });
      if (error) throw error;
    });

  const field =
    "w-full rounded-lg border border-border bg-secondary/50 px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/60";

  return (
    <main className="grid min-h-screen place-items-center bg-background px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center gap-3">
          <div className="accent-bar grid size-11 place-items-center rounded-lg">
            <ShieldCheck className="size-6 text-primary-foreground" />
          </div>
          <div className="leading-tight">
            <h1 className="font-display text-base font-bold tracking-[0.16em] text-foreground">
              NER-RESILIENCE AI
            </h1>
            <p className="text-[10px] tracking-wider text-muted-foreground uppercase">
              Secure operator access
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card/90 p-5 shadow-2xl backdrop-blur-xl">
          <div className="mb-4 grid grid-cols-2 gap-1 rounded-lg border border-border p-1">
            {(["password", "otp"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMode(m);
                  setErr(null);
                  setMsg(null);
                }}
                className={`rounded-md px-3 py-2 text-xs font-semibold tracking-wider uppercase transition-colors ${
                  mode === m
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {m === "password" ? "Password" : "Email OTP"}
              </button>
            ))}
          </div>

          {mode === "password" ? (
            <form onSubmit={submitPassword} className="space-y-3">
              {signUp && (
                <input
                  className={field}
                  placeholder="Full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  autoComplete="name"
                />
              )}
              <input
                className={field}
                type="email"
                required
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
              <input
                className={field}
                type="password"
                required
                minLength={6}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={signUp ? "new-password" : "current-password"}
              />
              <button
                type="submit"
                disabled={busy}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold tracking-wider text-primary-foreground uppercase disabled:opacity-60"
              >
                {busy && <Loader2 className="size-4 animate-spin" />}
                {signUp ? "Create account" : "Sign in"}
              </button>
              <button
                type="button"
                onClick={() => setSignUp((v) => !v)}
                className="w-full text-center text-xs text-muted-foreground hover:text-foreground"
              >
                {signUp ? "Already have an account? Sign in" : "New operator? Create an account"}
              </button>
            </form>
          ) : (
            <form onSubmit={otpSent ? verifyOtp : sendOtp} className="space-y-3">
              <input
                className={field}
                type="email"
                required
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
              {otpSent && (
                <input
                  className={`${field} tracking-[0.4em]`}
                  inputMode="numeric"
                  required
                  maxLength={6}
                  placeholder="000000"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  autoComplete="one-time-code"
                />
              )}
              <button
                type="submit"
                disabled={busy}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold tracking-wider text-primary-foreground uppercase disabled:opacity-60"
              >
                {busy && <Loader2 className="size-4 animate-spin" />}
                {otpSent ? "Verify code" : "Send code"}
              </button>
              {otpSent && (
                <button
                  type="button"
                  onClick={() => {
                    setOtpSent(false);
                    setCode("");
                  }}
                  className="w-full text-center text-xs text-muted-foreground hover:text-foreground"
                >
                  Use a different email
                </button>
              )}
            </form>
          )}

          <div className="my-4 flex items-center gap-3">
            <span className="h-px flex-1 bg-border" />
            <span className="text-[10px] tracking-widest text-muted-foreground uppercase">or</span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <button
            onClick={google}
            disabled={busy}
            className="w-full rounded-lg border border-border bg-secondary/50 px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-secondary disabled:opacity-60"
          >
            Continue with Google
          </button>

          {err && <p className="mt-3 text-xs text-destructive">{err}</p>}
          {msg && <p className="mt-3 text-xs text-safe">{msg}</p>}
        </div>

        <p className="mt-4 text-center text-[10px] tracking-wider text-muted-foreground uppercase">
          Simulated data · SIH 2026 · Tickle Trackers
        </p>
      </div>
    </main>
  );
}
