import Link from "next/link";

const links = [
  { label: "Documentation", href: "#" },
  { label: "Compliance", href: "#" },
  { label: "API status", href: "#" },
  { label: "Contact", href: "#" },
];

export function DashboardFooter() {
  return (
    <footer className="mt-auto border-t border-[var(--border)] bg-[var(--surface)]/20">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded border border-[var(--border)] bg-[var(--surface)] font-mono text-xs font-semibold text-[var(--accent)]">
                MS
              </span>
              <span className="text-sm font-semibold text-zinc-200">
                Market Signals
              </span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-zinc-500">
              Proprietary analytics and market structure research for
              institutional workflows. Past performance does not guarantee
              future results.
            </p>
          </div>
          <nav
            aria-label="Footer"
            className="flex flex-wrap gap-x-8 gap-y-3 font-mono text-xs uppercase tracking-[0.15em]"
          >
            {links.map((l, i) => (
              <Link
                key={`${l.label}-${i}`}
                href={l.href}
                className="text-zinc-500 transition-colors hover:text-zinc-300"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="mt-12 flex flex-col gap-3 border-t border-[var(--border)] pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-600">
            © {new Date().getFullYear()} Market Signals Platform
          </p>
          <p className="text-xs text-zinc-600">
            Market data provided by third parties. Use subject to terms.
          </p>
        </div>
      </div>
    </footer>
  );
}
