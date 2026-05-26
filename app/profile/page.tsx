import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardFooter } from "@/components/dashboard/dashboard-footer";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { verifySessionToken } from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/lib/auth-types";

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? verifySessionToken(token) : null;

  if (!session) {
    redirect("/auth");
  }

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <DashboardHeader user={session} />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)]/60 p-8 shadow-2xl shadow-black/20">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                User profile
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-100 sm:text-4xl">
                {session.fullName}
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-zinc-400">
                Welcome to your personal account page. Here you can review your login details, membership status, and access the dashboard after signing in.
              </p>
            </div>
            <div className="rounded-3xl border border-[var(--border)] bg-[var(--background)] p-6 text-sm text-zinc-300">
              <p className="font-semibold text-zinc-100">Profile summary</p>
              <dl className="mt-4 space-y-3 text-sm text-zinc-400">
                <div>
                  <dt className="font-medium text-zinc-300">Email</dt>
                  <dd className="mt-1 text-zinc-100">{session.email}</dd>
                </div>
                <div>
                  <dt className="font-medium text-zinc-300">Membership</dt>
                  <dd className="mt-1 text-zinc-100">{session.membershipStatus ?? "trial"}</dd>
                </div>
                <div>
                  <dt className="font-medium text-zinc-300">Trial ends</dt>
                  <dd className="mt-1 text-zinc-100">
                    {session.trialEndsAt ? new Date(session.trialEndsAt).toLocaleString() : "Not available"}
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-zinc-300">Account created</dt>
                  <dd className="mt-1 text-zinc-100">
                    {session.createdAt ? new Date(session.createdAt).toLocaleString() : "Not available"}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="mt-10 rounded-3xl border border-[var(--border)] bg-[var(--background)] p-6">
            <p className="text-sm text-zinc-400">
              Your account is linked to the dashboard. To view live gamma levels, TradingView charts, and all market data, return to the main dashboard.
            </p>
            <div className="mt-4">
              <a
                href="/"
                className="inline-flex items-center rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-[var(--accent-muted)]"
              >
                Go to dashboard
              </a>
            </div>
          </div>
        </div>
      </main>
      <DashboardFooter />
    </div>
  );
}
