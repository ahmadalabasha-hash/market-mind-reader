import Link from "next/link";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* Header */}
      <div className="border-b border-[var(--border)] bg-[var(--surface)]/60">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <Link href="/" className="inline-block">
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">
              Market Signals
            </h1>
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-4xl font-semibold tracking-tight text-zinc-100 sm:text-5xl">
            Choose Your Plan
          </h2>
          <p className="mt-4 max-w-2xl text-lg text-zinc-400">
            Institutional-grade market intelligence and trading signals. Select the plan that fits your trading needs.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* Basic Plan */}
          <div className="relative rounded-2xl border border-[var(--border)] bg-[var(--surface)]/60 p-8 transition-all duration-300 hover:border-[var(--accent)] hover:shadow-2xl hover:shadow-[var(--accent)]/10">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-zinc-100">Basic Plan</h3>
              <p className="mt-2 text-4xl font-bold text-zinc-100">
                $400<span className="text-lg font-normal text-zinc-400">/month</span>
              </p>
            </div>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm text-zinc-300">
                <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--bull)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                All signals for: SPY, SPX, NQ, ES, QQQ
              </li>
              <li className="flex items-start gap-3 text-sm text-zinc-300">
                <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--bull)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Real-time market index alerts
              </li>
              <li className="flex items-start gap-3 text-sm text-zinc-300">
                <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--bull)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Entry/exit signals for major indices
              </li>
            </ul>
            <div className="mt-8 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <a
                  href="https://paypal.me/marketsignals"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl bg-[#0070ba] px-4 py-3 text-center text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#005ea6]"
                >
                  Pay with PayPal
                </a>
                <a
                  href="https://revolut.me/oweisxya2?currency=USD&amount=40000¬e="
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl bg-gradient-to-r from-[#000000] to-[#007cba] px-4 py-3 text-center text-sm font-semibold text-white transition-colors duration-200 hover:from-[#007cba] hover:to-[#000000]"
                >
                  Pay with Revolut
                </a>
              </div>
              <Link
                href="/auth?tier=basic"
                className="block w-full rounded-xl border border-zinc-600 bg-zinc-800/50 px-4 py-3 text-center text-sm font-semibold text-zinc-200 transition-all hover:bg-zinc-700 hover:text-white"
              >
                Create Account (Basic)
              </Link>
            </div>
          </div>

          {/* Pro Plan - Most Popular */}
          <div className="relative rounded-2xl border-2 border-[var(--accent)] bg-[var(--surface)]/60 p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-[var(--accent)]/20">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <span className="rounded-full bg-[var(--accent)] px-4 py-1 text-xs font-semibold text-black">
                Most Popular
              </span>
            </div>
            <div className="mb-6 pt-2">
              <h3 className="text-xl font-semibold text-zinc-100">Pro Plan</h3>
              <p className="mt-2 text-4xl font-bold text-zinc-100">
                $800<span className="text-lg font-normal text-zinc-400">/month</span>
              </p>
            </div>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm text-zinc-300">
                <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--bull)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Everything from Market Indices Signals
              </li>
              <li className="flex items-start gap-3 text-sm text-zinc-300">
                <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--bull)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                PLUS signals for most traded stocks
              </li>
              <li className="flex items-start gap-3 text-sm text-zinc-300">
                <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--bull)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Individual stock alerts and recommendations
              </li>
            </ul>
            <div className="mt-8 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <a
                  href="https://paypal.me/marketsignals"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl bg-[#0070ba] px-4 py-3 text-center text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#005ea6]"
                >
                  Pay with PayPal
                </a>
                <a
                  href="https://revolut.me/oweisxya2?currency=USD&amount=80000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl bg-gradient-to-r from-[#000000] to-[#007cba] px-4 py-3 text-center text-sm font-semibold text-white transition-colors duration-200 hover:from-[#007cba] hover:to-[#000000]"
                >
                  Pay with Revolut
                </a>
              </div>
              <Link
                href="/auth?tier=pro"
                className="block w-full rounded-xl border border-zinc-600 bg-zinc-800/50 px-4 py-3 text-center text-sm font-semibold text-zinc-200 transition-all hover:bg-zinc-700 hover:text-white"
              >
                Create Account (Pro)
              </Link>
            </div>
          </div>

          {/* Enterprise Plan */}
          <div className="relative rounded-2xl border border-[var(--border)] bg-[var(--surface)]/60 p-8 transition-all duration-300 hover:border-[var(--accent)] hover:shadow-2xl hover:shadow-[var(--accent)]/10">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-zinc-100">Enterprise - Custom & Options</h3>
              <p className="mt-2 text-4xl font-bold text-zinc-100">
                $1,500<span className="text-lg font-normal text-zinc-400">/month</span>
              </p>
            </div>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm text-zinc-300">
                <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--bull)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Everything from Market Indices & Stocks plans
              </li>
              <li className="flex items-start gap-3 text-sm text-zinc-300">
                <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--bull)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                PLUS custom TradingView indicator integration
              </li>
              <li className="flex items-start gap-3 text-sm text-zinc-300">
                <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--bull)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                PLUS options selection based on signals
              </li>
              <li className="flex items-start gap-3 text-sm text-zinc-300">
                <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--bull)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                PLUS Gamma options flip strategy alerts
              </li>
            </ul>
            <div className="mt-8 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <a
                  href="https://paypal.me/marketsignals"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl bg-[#0070ba] px-4 py-3 text-center text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#005ea6]"
                >
                  Pay with PayPal
                </a>
                <a
                  href="https://revolut.me/oweisxya2?currency=USD&amount=150000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl bg-gradient-to-r from-[#000000] to-[#007cba] px-4 py-3 text-center text-sm font-semibold text-white transition-colors duration-200 hover:from-[#007cba] hover:to-[#000000]"
                >
                  Pay with Revolut
                </a>
              </div>
              <Link
                href="/auth?tier=ultimate"
                className="block w-full rounded-xl border border-amber-500/50 bg-gradient-to-r from-amber-500/10 to-orange-500/10 px-4 py-3 text-center text-sm font-semibold text-amber-200 transition-all hover:bg-amber-500/20 hover:text-amber-100"
              >
                Create Account (Ultimate)
              </Link>
              <a
                href="mailto:stureplanet307@gmail.com?subject=Enterprise Plan Inquiry - Custom TradingView Integration & Gamma Options Flip Strategy"
                className="block w-full rounded-xl border border-[var(--border)] px-6 py-3 text-center text-sm font-semibold text-zinc-300 transition-colors duration-200 hover:bg-[var(--surface-elevated)] hover:text-zinc-100"
              >
                Contact Support
              </a>
              <p className="text-center text-xs text-zinc-500">
                Contact support for custom TradingView indicator setup and Gamma options flip strategy alerts
              </p>
            </div>
          </div>
        </div>

        {/* Contact Support Section */}
        <div className="mt-16 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/60 p-8 text-center">
          <h3 className="text-xl font-semibold text-zinc-100">Need Help Choosing?</h3>
          <p className="mt-2 text-sm text-zinc-400">
            Contact our support team for personalized recommendations or custom enterprise solutions.
          </p>
          <a
            href="mailto:stureplanet307@gmail.com?subject=Pricing Plan Inquiry"
            className="mt-6 inline-block rounded-xl bg-[var(--accent)] px-8 py-3 text-sm font-semibold text-black transition-colors duration-200 hover:bg-[var(--accent-muted)]"
          >
            Contact Support
          </a>
        </div>

        {/* Payment Information */}
        <div className="mt-12 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/60 p-6">
          <h4 className="text-sm font-semibold text-zinc-100">Payment Information</h4>
          <p className="mt-2 text-xs text-zinc-400">
            Payments are processed securely through PayPal or Revolut. You will be redirected to complete your subscription.
          </p>
          <div className="mt-4 space-y-1 text-xs text-zinc-500">
            <p>PayPal.Me: <a href="https://paypal.me/marketsignals" target="_blank" rel="noopener noreferrer" className="text-[#0070ba] hover:underline">paypal.me/marketsignals</a></p>
            <p>Revolut: <a href="https://revolut.me/oweisxya2" target="_blank" rel="noopener noreferrer" className="text-[#007cba] hover:underline">revolut.me/oweisxya2</a></p>
            <p>Email: <a href="mailto:stureplanet307@gmail.com" className="text-[#0070ba] hover:underline">stureplanet307@gmail.com</a></p>
          </div>
          <div className="mt-4 rounded-xl bg-[var(--surface-elevated)] p-3">
            <p className="text-xs text-zinc-300">
              💳 Revolut payments: Non-Revolut users may need to create a free account for payments over ~$320
            </p>
          </div>
        </div>
      </div>

      {/* 
        ============================================================
        PAYPAL QUESTIONS & ANSWERS
        ============================================================
        
        Q1: Can PayPal.Me links have preset amounts, or do users need to type it manually?
        A1: PayPal.Me links CAN have preset amounts using the following URL format:
            https://paypal.me/username/amount
            For example: https://paypal.me/marketsignals/400 would preset $400
            However, this only works for one-time payments, NOT recurring subscriptions.
            For your use case, users would need to manually enter the amount each month
            or you would need to send them a PayPal invoice/request each billing cycle.
        
        Q2: For recurring monthly subscriptions, do I need a PayPal Business account or can personal account handle this?
        A2: For TRUE recurring subscriptions (automatic monthly billing), you NEED a PayPal Business account
            with PayPal Subscription buttons or PayPal Checkout with recurring billing enabled.
            Personal PayPal accounts DO NOT support automatic recurring subscriptions.
            With a personal account, you would need to manually send payment requests each month
            or rely on users to remember to pay manually each billing cycle.
        
        Q3: What's the best workaround for subscriptions with a personal PayPal account?
        A3: Several workarounds for personal PayPal accounts:
            a) Manual monthly invoices: Send PayPal Money Requests/Invoices to each subscriber at the start of each billing cycle
            b) Calendar reminders: Set up automated email reminders for users to pay manually each month
            c) Use a third-party subscription management tool that integrates with PayPal (like Paddle, Stripe, etc.)
            d) Upgrade to PayPal Business account (recommended for serious subscription business):
               - Allows automatic recurring billing
               - Better professional appearance
               - Access to PayPal Subscription API
               - Better analytics and reporting
               - Can create subscription buttons with fixed amounts and billing cycles
            e) For now, the simplest approach: Link to PayPal.Me and instruct users to:
               - Pay the monthly amount manually
               - Set up a recurring payment in their PayPal account (if they choose to)
               - You track payments manually and grant access accordingly
      */}
    </div>
  );
}
