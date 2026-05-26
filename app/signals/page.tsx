import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardFooter } from "@/components/dashboard/dashboard-footer";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { SignalsTerminal } from "@/components/signals/signals-terminal";
import { fetchSignalsFromSheet, type SignalRow } from "@/lib/signals";
import { verifySessionToken } from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/lib/auth-types";

export default async function SignalsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? verifySessionToken(token) : null;

  if (!session) {
    redirect("/auth");
  }

  const params = await searchParams;
  let signals: SignalRow[] = [];
  try {
    signals = await fetchSignalsFromSheet();
  } catch {
    signals = [];
  }

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <DashboardHeader user={session} />
      <main className="min-h-0 flex-1">
        <SignalsTerminal signals={signals} initialQuery={params.q} />
      </main>
      <DashboardFooter />
    </div>
  );
}
