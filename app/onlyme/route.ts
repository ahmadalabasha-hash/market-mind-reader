import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import {
  createSessionCookie,
  createSessionToken,
  verifySessionToken,
} from "@/lib/auth";
import { fetchSignalsFromSheet, type SignalRow } from "@/lib/signals";
import { getAllUsers } from "@/lib/google-sheets";

const ONLYME_PASSWORD = "Farogah2004@123";
const ONLYME_COOKIE_NAME = "onlyme_auth";

const onlyMeUser = {
  email: "onlyme@onlyme.local",
  fullName: "Only Me",
  createdAt: new Date().toISOString(),
  trialEndsAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
  membershipStatus: "premium",
};

function escapeHtml(s: string) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderLoginForm(error?: string) {
  return `
    <!doctype html>
    <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width,initial-scale=1" />
      <title>Restricted Access</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <style>
        :root {
          --background: #0a0a0a;
          --surface: #141414;
          --border: #262626;
        }
        body {
          background: var(--background);
          color: #e4e4e7;
        }
      </style>
    </head>
    <body class="min-h-screen flex items-center justify-center">
      <div class="w-full max-w-md p-8">
        <div class="rounded-3xl border border-[var(--border)] bg-[var(--surface)]/60 p-8 shadow-2xl shadow-black/20">
          <div class="text-center mb-8">
            <h1 class="text-2xl font-semibold text-zinc-100 mb-2">Restricted Access</h1>
            <p class="text-sm text-zinc-400">Enter password to continue</p>
          </div>
          ${error ? `<div class="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm text-center">${escapeHtml(error)}</div>` : ''}
          <form method="POST" class="space-y-4">
            <div>
              <input 
                type="password" 
                name="password" 
                placeholder="Password" 
                required
                class="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--background)] text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
                autofocus
              />
            </div>
            <button 
              type="submit"
              class="w-full px-4 py-3 rounded-xl bg-zinc-100 text-zinc-900 font-medium hover:bg-zinc-200 transition-colors"
            >
              Access
            </button>
          </form>
        </div>
      </div>
    </body>
    </html>
  `;
}

function renderTierBadge(tier: string | undefined) {
  const tierStyles: Record<string, string> = {
    trial: 'bg-zinc-500/20 text-zinc-300 border-zinc-500/30',
    basic: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    pro: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    ultimate: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    none: 'bg-zinc-500/20 text-zinc-300 border-zinc-500/30',
  };
  const tierLabels: Record<string, string> = {
    trial: 'TRIAL',
    basic: 'BASIC',
    pro: 'PRO',
    ultimate: 'ULTIMATE',
    none: 'NONE',
  };
  const normalizedTier = (tier || 'trial').toLowerCase();
  const style = tierStyles[normalizedTier] || tierStyles.trial;
  const label = tierLabels[normalizedTier] || 'TRIAL';
  return `<span class="px-2 py-1 rounded-full text-xs border ${style}">${label}</span>`;
}

async function renderDashboard(users: any[], signals: SignalRow[]) {
  const userRows = users
    .map((u) => `
      <tr>
        <td>${escapeHtml(u.fullName || '')}</td>
        <td>${escapeHtml(u.email || '')}</td>
        <td><code class="text-xs bg-zinc-800 px-2 py-1 rounded">${escapeHtml(u.password || '')}</code></td>
        <td><code class="text-xs bg-zinc-800 px-2 py-1 rounded">${escapeHtml(u.passwordHash || '')}</code></td>
        <td><code class="text-xs bg-zinc-800 px-2 py-1 rounded">${escapeHtml(u.salt || '')}</code></td>
        <td>${escapeHtml(u.createdAt || '')}</td>
        <td>${escapeHtml(u.trialEndsAt || '')}</td>
        <td><span class="px-2 py-1 rounded-full text-xs ${u.membershipStatus === 'premium' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}">${escapeHtml(u.membershipStatus || '')}</span></td>
        <td>${renderTierBadge(u.subscriptionTier)}</td>
      </tr>
    `)
    .join('\n');

  return `
    <!doctype html>
    <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width,initial-scale=1" />
      <title>Market Signals Platform — Admin</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <style>
        :root {
          --background: #0a0a0a;
          --surface: #141414;
          --border: #262626;
          --accent: #f59e0b;
          --accent-muted: #d97706;
        }
        body {
          background: var(--background);
          color: #e4e4e7;
        }
      </style>
    </head>
    <body>
      <div class="flex min-h-full flex-1 flex-col">
        <!-- Header -->
        <header class="border-b border-[var(--border)] bg-[var(--surface)]/50 backdrop-blur-sm">
          <div class="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <div class="flex items-center justify-between">
              <div>
                <h1 class="text-xl font-semibold text-zinc-100">Market Signals Platform</h1>
                <p class="text-xs text-zinc-500">Admin Dashboard — User Management</p>
              </div>
              <div class="flex items-center gap-4">
                <span class="text-sm text-zinc-400">Admin Access</span>
                <a href="/" class="rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-2 text-sm text-zinc-300 hover:border-zinc-500">
                  View Live Site
                </a>
              </div>
            </div>
          </div>
        </header>

        <main class="min-h-0 flex-1">
          <div class="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <!-- Welcome Section -->
            <div class="rounded-3xl border border-[var(--border)] bg-[var(--surface)]/60 p-8 shadow-2xl shadow-black/20 mb-8">
              <div class="flex flex-col gap-4">
                <div>
                  <p class="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                    Admin access
                  </p>
                  <h2 class="mt-3 text-3xl font-semibold tracking-tight text-zinc-100 sm:text-4xl">
                    User Management Dashboard
                  </h2>
                  <p class="mt-2 max-w-2xl text-sm text-zinc-400">
                    This page shows all registered users with their credentials for customer support purposes.
                  </p>
                </div>
              </div>
            </div>

            <!-- Users Table -->
            <div class="rounded-3xl border border-[var(--border)] bg-[var(--surface)]/60 p-8 shadow-2xl shadow-black/20 mb-8">
              <div class="mb-6">
                <h3 class="text-lg font-semibold text-zinc-100 mb-2">All Registered Users</h3>
                <p class="text-sm text-zinc-400">Complete user database with credentials</p>
              </div>
              <div class="overflow-x-auto">
                <table class="w-full border-collapse">
                  <thead>
                    <tr class="border-b border-[var(--border)]">
                      <th class="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Full Name</th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Email</th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Password</th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Password Hash</th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Salt</th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Created At</th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Trial Ends At</th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Status</th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Plan</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${userRows}
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Signals Section -->
            <div class="rounded-3xl border border-[var(--border)] bg-[var(--surface)]/60 p-8 shadow-2xl shadow-black/20">
              <div class="mb-6">
                <h3 class="text-lg font-semibold text-zinc-100 mb-2">Recent Signals (${signals.length})</h3>
                <p class="text-sm text-zinc-400">Latest market signals from the system</p>
              </div>
              ${signals.length > 0 ? `
                <div class="space-y-3">
                  ${signals.slice(0, 5).map(s => `
                    <div class="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-4">
                      <div class="flex items-center justify-between">
                        <div>
                          <p class="font-medium text-zinc-100">${escapeHtml(s.symbol || 'N/A')}</p>
                          <p class="text-xs text-zinc-400">${escapeHtml(s.bias || 'N/A')} — Key Level: ${escapeHtml(String(s.keyLevel) || 'N/A')}</p>
                        </div>
                        <span class="text-xs text-zinc-500">${escapeHtml(s.date || '')}</span>
                      </div>
                    </div>
                  `).join('')}
                </div>
              ` : '<p class="text-sm text-zinc-500">No signals available</p>'}
            </div>
          </div>
        </main>

        <!-- Footer -->
        <footer class="border-t border-[var(--border)] bg-[var(--surface)]/50 backdrop-blur-sm">
          <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <p class="text-center text-xs text-zinc-500">
              © 2026 Market Signals Platform — Admin Access Only
            </p>
          </div>
        </footer>
      </div>
    </body>
    </html>
  `;
}

function getOnlyMeCookie(req: Request): string | undefined {
  const cookieHeader = req.headers.get('cookie');
  if (!cookieHeader) return undefined;
  
  const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
    const [name, value] = cookie.trim().split('=');
    acc[name] = value;
    return acc;
  }, {} as Record<string, string>);
  
  return cookies[ONLYME_COOKIE_NAME];
}

function createOnlyMeCookie(value: string) {
  const secure = process.env.NODE_ENV === "production" ? "Secure;" : "";
  return `${ONLYME_COOKIE_NAME}=${value}; Path=/onlyme; HttpOnly; ${secure} SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}`;
}

function clearOnlyMeCookie() {
  const secure = process.env.NODE_ENV === "production" ? "Secure;" : "";
  return `${ONLYME_COOKIE_NAME}=; Path=/onlyme; HttpOnly; ${secure} SameSite=Lax; Max-Age=0`;
}

export async function POST(req: Request) {
  const formData = await req.formData();
  const password = formData.get('password') as string;

  if (password === ONLYME_PASSWORD) {
    const token = createSessionToken(onlyMeUser);
    return NextResponse.redirect(new URL(req.url), {
      status: 303,
      headers: {
        'Set-Cookie': createOnlyMeCookie(token),
      },
    });
  }

  return new NextResponse(renderLoginForm('Incorrect password'), {
    status: 401,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

export async function GET(req: Request) {
  const url = new URL(req.url);

  // preserve bypass behavior when ?bypass=1 is present
  if (url.searchParams.get('bypass') === '1') {
    const token = createSessionToken(onlyMeUser);
    url.pathname = '/';
    return NextResponse.redirect(url, {
      headers: {
        'Set-Cookie': createSessionCookie(token),
      },
    });
  }

  // Check for authentication cookie
  const authCookie = getOnlyMeCookie(req);
  if (!authCookie || !verifySessionToken(authCookie)) {
    return new NextResponse(renderLoginForm(), {
      status: 401,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  let users: any[] = [];
  try {
    users = await getAllUsers();
  } catch (err) {
    console.error("Failed to fetch users:", err);
    users = [];
  }

  let signals: SignalRow[] = [];
  try {
    signals = await fetchSignalsFromSheet();
  } catch {
    signals = [];
  }

  const html = await renderDashboard(users, signals);
  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
