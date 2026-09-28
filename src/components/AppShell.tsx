import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { CITIES, ROADS } from "@/data/mockData";
import { useAlerts } from "@/state/alertsStore";
import { supabase } from "@/integrations/supabase/client";

import {
  Activity,
  AlertTriangle,
  Bell,
  BarChart3,
  Boxes,
  Brain,
  ClipboardList,
  Globe2,
  LayoutDashboard,
  LogOut,
  Menu,
  Route as RouteIcon,
  Search,
  ShieldCheck,
  FlaskConical,
  X,
  Layers,
} from "lucide-react";

const NAV = [
  { to: "/engine", label: "Tri-Modal Engine", icon: Layers },
  { to: "/", label: "Command Center", icon: LayoutDashboard },
  { to: "/digital-twin", label: "Digital Twin", icon: Globe2 },
  { to: "/risk-prediction", label: "Risk Prediction", icon: Brain },
  { to: "/route-optimizer", label: "Route Optimizer", icon: RouteIcon },
  { to: "/what-if", label: "What-If Simulation", icon: FlaskConical },
  { to: "/logistics", label: "Logistics", icon: Boxes },
  { to: "/field-reporting", label: "Field Reporting", icon: ClipboardList },
  { to: "/alerts", label: "Alerts", icon: AlertTriangle },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
] as const;

interface Suggestion {
  key: string;
  label: string;
  sub: string;
  query: string;
}

export default function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("Control Officer");
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const alerts = useAlerts();
  const unread = alerts.filter((a) => a.status === "ACTIVE").length;

  useEffect(() => {
    void supabase.auth.getUser().then(({ data }) => {
      const u = data.user;
      if (!u) return;
      setEmail(u.email ?? "");
      const name = (u.user_metadata?.["full_name"] as string | undefined) ?? u.email ?? "Operator";
      setDisplayName(name);
    });
  }, []);

  const initials =
    displayName
      .split(/\s+/)
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "OP";

  const signOut = async () => {
    setUserOpen(false);
    await supabase.auth.signOut();
    void navigate({ to: "/auth", replace: true });
  };

  const suggestions = useMemo<Suggestion[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const cities: Suggestion[] = CITIES.filter((c) => c.name.toLowerCase().includes(q)).map((c) => ({
      key: `city-${c.id}`,
      label: c.name,
      sub: c.hubType ? `${c.state} · ${c.hubType}` : c.state,
      query: c.name,
    }));
    const roads: Suggestion[] = ROADS.filter(
      (r) => r.name.toLowerCase().includes(q) || r.highway.toLowerCase().includes(q),
    ).map((r) => ({
      key: `road-${r.id}`,
      label: r.name,
      sub: `${r.highway} · risk ${r.risk}%`,
      query: r.name,
    }));
    return [...cities, ...roads].slice(0, 7);
  }, [query]);

  const jump = (q: string) => {
    const term = q.trim();
    if (!term) return;
    setQuery(term);
    setFocused(false);
    void navigate({ to: "/", search: { q: term } });
  };


  return (
    <div className="min-h-screen">
      {/* Top bar */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/85 backdrop-blur-xl">
        <div className="flex h-16 items-center gap-3 px-3 sm:px-5">
          <button
            className="rounded-md border border-border p-2 text-muted-foreground lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle navigation"
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>

          <div className="flex items-center gap-2.5">
            <div className="accent-bar grid size-9 place-items-center rounded-lg">
              <ShieldCheck className="size-5 text-primary-foreground" />
            </div>
            <div className="leading-tight">
              <p className="font-display text-sm font-bold tracking-[0.16em] text-foreground">
                NER-RESILIENCE AI
              </p>
              <p className="text-[10px] tracking-wider text-muted-foreground uppercase">
                Predictive Logistics Resilience Engine
              </p>
            </div>
          </div>

          <div className="relative ml-4 hidden max-w-sm flex-1 md:block">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                jump(suggestions[0]?.query ?? query);
              }}
              className="flex items-center gap-2 rounded-lg border border-border bg-secondary/50 px-3 py-2"
            >
              <Search className="size-4 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setTimeout(() => setFocused(false), 150)}
                placeholder="Search cities or corridors…"
                className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="text-muted-foreground hover:text-foreground"
                  aria-label="Clear search"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </form>
            {focused && suggestions.length > 0 && (
              <ul className="absolute top-full left-0 z-50 mt-2 w-full overflow-hidden rounded-lg border border-border bg-card shadow-xl">
                {suggestions.map((s) => (
                  <li key={s.key}>
                    <button
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => jump(s.query)}
                      className="block w-full px-3 py-2 text-left hover:bg-secondary/70"
                    >
                      <span className="block text-sm text-foreground">{s.label}</span>
                      <span className="text-[11px] text-muted-foreground">{s.sub}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>


          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <span className="hidden items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs text-muted-foreground sm:inline-flex">
              <Globe2 className="size-3.5 text-primary" /> Northeast Region
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-md border border-safe/40 bg-safe/10 px-2.5 py-1.5 text-[10px] font-semibold tracking-wider text-safe">
              <span className="size-1.5 animate-pulse rounded-full bg-safe" /> SYSTEM OPERATIONAL
            </span>
            <div className="relative">
              <button
                onClick={() => setBellOpen((v) => !v)}
                aria-label="Notifications"
                className="relative rounded-md border border-border p-2 text-muted-foreground hover:text-foreground"
              >
                <Bell className="size-4" />
                {unread > 0 && (
                  <span className="absolute -top-1 -right-1 grid size-4 place-items-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground">
                    {unread}
                  </span>
                )}
              </button>
              {bellOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setBellOpen(false)} />
                  <div className="absolute top-full right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
                    <div className="flex items-center justify-between border-b border-border px-3 py-2">
                      <p className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
                        Latest Alerts · Simulated
                      </p>
                      <button
                        onClick={() => setBellOpen(false)}
                        className="text-muted-foreground hover:text-foreground"
                        aria-label="Close notifications"
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>
                    <ul className="max-h-80 overflow-y-auto">
                      {alerts.slice(0, 5).map((a) => (
                        <li key={a.id}>
                          <Link
                            to="/alerts"
                            onClick={() => setBellOpen(false)}
                            className="block border-b border-border/60 px-3 py-2.5 hover:bg-secondary/60"
                          >
                            <span className="flex items-center gap-2">
                              <span
                                className={`rounded px-1.5 py-0.5 text-[9px] font-bold tracking-wider ${
                                  a.severity === "CRITICAL"
                                    ? "bg-critical/20 text-critical"
                                    : a.severity === "HIGH"
                                      ? "bg-highrisk/20 text-highrisk"
                                      : "bg-moderate/20 text-moderate"
                                }`}
                              >
                                {a.severity}
                              </span>
                              <span className="text-[10px] text-muted-foreground">{a.status}</span>
                              <span className="ml-auto text-[10px] text-muted-foreground">
                                {a.time}
                              </span>
                            </span>
                            <span className="mt-1 block text-xs font-semibold text-foreground">
                              {a.title}
                            </span>
                            <span className="text-[11px] text-muted-foreground">{a.location}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                    <Link
                      to="/alerts"
                      onClick={() => setBellOpen(false)}
                      className="block px-3 py-2.5 text-center text-[11px] font-bold tracking-widest text-primary uppercase hover:bg-secondary/60"
                    >
                      View all alerts
                    </Link>
                  </div>
                </>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => setUserOpen((v) => !v)}
                className="flex items-center gap-2 rounded-md border border-border px-2 py-1.5"
              >
                <span className="grid size-6 place-items-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">
                  {initials}
                </span>
                <span className="hidden max-w-[10rem] truncate text-xs text-muted-foreground sm:inline">
                  {displayName}
                </span>
              </button>
              {userOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setUserOpen(false)} />
                  <div className="absolute top-full right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
                    <div className="border-b border-border px-3 py-2.5">
                      <p className="truncate text-xs font-semibold text-foreground">{displayName}</p>
                      <p className="truncate text-[11px] text-muted-foreground">{email}</p>
                    </div>
                    <button
                      onClick={signOut}
                      className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-xs text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                    >
                      <LogOut className="size-3.5" /> Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`fixed top-16 bottom-0 z-40 w-64 shrink-0 overflow-y-auto border-r border-border bg-card/90 backdrop-blur-xl transition-transform lg:sticky lg:translate-x-0 ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <nav className="space-y-1 p-3">
            {NAV.map(({ to, label, icon: Icon }) => {
              const active = pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                    active
                      ? "border border-primary/30 bg-primary/12 font-semibold text-primary"
                      : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                  }`}
                >
                  <Icon className="size-4" />
                  {label}
                </Link>
              );
            })}
          </nav>
          <div className="mx-3 mb-4 rounded-lg border border-border bg-secondary/40 p-3">
            <p className="flex items-center gap-1.5 text-[10px] font-semibold tracking-widest text-primary uppercase">
              <Activity className="size-3.5" /> Live Model
            </p>
            <p className="mt-1.5 text-xs text-muted-foreground">
              NER-Resilience v2.1 · confidence 87% · refreshed 2 min ago.
            </p>
            <p className="mt-2 text-[10px] tracking-wider text-muted-foreground uppercase">
              Simulated data · SIH 2026 · Tickle Trackers
            </p>
          </div>
        </aside>

        {open && (
          <div
            className="fixed inset-0 top-16 z-30 bg-background/70 lg:hidden"
            onClick={() => setOpen(false)}
          />
        )}

        <main className="min-w-0 flex-1 p-3 sm:p-5">{children}</main>
      </div>
    </div>
  );
}
