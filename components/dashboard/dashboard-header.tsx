import Link from "next/link";
import { LogoutButton } from "./logout-button";

const nav = [
  { id: "charts", label: "Charts", href: "#charts" },
  { id: "signals", label: "Signals", href: "/signals" },
  { id: "options", label: "IV Ranking", href: "/options" },
  { id: "gex", label: "GEX Deep Knowledge", href: "/gex-levels-deep-knowledge" },
];

type DashboardHeaderProps = {
  user?: {
    fullName: string;
    email: string;
  };
};

export function DashboardHeader({ user }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--background)]/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-6 px-4 sm:h-16 sm:px-6 lg:px-8">
        <Link href="/" className="group flex shrink-0 items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded border border-[var(--border)] bg-[var(--surface)] font-mono text-xs font-semibold tracking-tighter text-[var(--accent)] transition-colors group-hover:border-[var(--accent)]/35">
            MS
          </span>
          <div className="flex flex-col leading-none">
            <span className="text-sm font-semibold tracking-tight text-zinc-100">
              Market Signals
            </span>
            <span className="hidden font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500 sm:block">
              Terminal
            </span>
          </div>
        </Link>

        <nav
          aria-label="Primary"
          className="hidden items-center gap-1 md:flex"
        >
          {nav.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm text-zinc-400 transition-colors hover:bg-white/[0.04] hover:text-zinc-200"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <span className="hidden font-mono text-[11px] text-zinc-500 lg:inline">
            <span className="text-emerald-500/90">●</span> LIVE
          </span>
          {user ? (
            <>
              <span className="hidden rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-zinc-300 sm:inline">
                Hi, {user.fullName.split(" ")[0]}
              </span>
              <Link
                href="/profile"
                className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs font-medium text-zinc-300 transition-all hover:border-zinc-600 hover:bg-[var(--surface-elevated)] sm:px-4 sm:text-sm"
              >
                Profile
              </Link>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link
                href="/auth"
                className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs font-medium text-zinc-300 transition-all hover:border-zinc-600 hover:bg-[var(--surface-elevated)] sm:px-4 sm:text-sm"
              >
                Sign in
              </Link>
              <Link
                href="/auth"
                className="rounded-md bg-[var(--accent-muted)] px-3 py-1.5 text-xs font-medium text-[var(--accent)] ring-1 ring-[var(--accent)]/25 transition-all hover:bg-[var(--accent)]/20 sm:px-4 sm:text-sm"
              >
                Get access
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="border-t border-[var(--border)] md:hidden">
        <nav
          aria-label="Primary mobile"
          className="-mx-px flex gap-0 overflow-x-auto px-4 py-2"
        >
          {nav.map((item) => (
            <Link
              key={`m-${item.id}`}
              href={item.href}
              className="shrink-0 rounded-md px-4 py-2 font-mono text-[11px] uppercase tracking-[0.12em] text-zinc-400 transition-colors first:pl-0 hover:text-zinc-200"
            >
              {item.label}
            </Link>
          ))}
          {user ? (
            <Link
              href="/profile"
              className="shrink-0 rounded-md px-4 py-2 font-mono text-[11px] uppercase tracking-[0.12em] text-zinc-400 transition-colors hover:text-zinc-200"
            >
              Profile
            </Link>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
