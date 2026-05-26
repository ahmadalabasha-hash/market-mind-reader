import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardFooter } from "@/components/dashboard/dashboard-footer";
import { verifySessionToken } from "@/lib/auth";
import { SESSION_COOKIE_NAME, getUserTier, hasUltimateAccess } from "@/lib/auth-types";

export default async function OptionsMasterPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? verifySessionToken(token) : null;

  if (!session) {
    redirect("/auth");
  }

  const userTier = getUserTier(session);
  const isSuperAdmin = session?.isSuperAdmin || false;

  // Check if user has Ultimate access
  if (!hasUltimateAccess(userTier, isSuperAdmin)) {
    redirect("/pricing");
  }

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <DashboardHeader user={session} />
      <main className="min-h-0 flex-1">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30">
                <svg className="w-8 h-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-zinc-100">Options Master</h1>
                <p className="text-sm text-zinc-400 mt-1">Advanced options strategies and picks</p>
              </div>
            </div>
          </div>

          {/* Placeholder Content */}
          <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-500/5 to-pink-500/5 p-12 text-center">
            <div className="flex flex-col items-center gap-6">
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-purple-500/10 border border-purple-500/30">
                <svg className="w-12 h-12 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-zinc-100 mb-2">Coming Soon</h2>
                <p className="text-zinc-400 max-w-md">
                  Advanced options strategies, gamma flip picks, and high-probability options contracts will be available here.
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm text-purple-400">
                <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                <span>Content will be added from Google Sheets</span>
              </div>
            </div>
          </div>
        </div>
      </main>
      <DashboardFooter />
    </div>
  );
}
