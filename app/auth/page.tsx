"use client";

import { type FormEvent, useEffect, useMemo, useState, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import * as THREE from "three";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type SubscriptionTier = "trial" | "basic" | "pro" | "ultimate";

// Main export with Suspense wrapper
export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
        <div className="w-full max-w-md text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 mb-4 animate-pulse">
            <svg className="w-8 h-8 text-zinc-950" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <p className="text-zinc-400">Loading...</p>
        </div>
      </div>
    }>
      <AuthPageContent />
    </Suspense>
  );
}

// Inner component that uses useSearchParams
function AuthPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [subscriptionTier, setSubscriptionTier] = useState<SubscriptionTier>("trial");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [trialExpired, setTrialExpired] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sheetsConfigured, setSheetsConfigured] = useState<boolean | null>(null);
  const [configLoaded, setConfigLoaded] = useState(false);
  const action = useMemo(() => (mode === "login" ? "login" : "signup"), [mode]);
  const heading = mode === "login" ? "Welcome back" : "Create your account";
  const subheading = mode === "login" ? "Sign in to access your dashboard" : "Start your free trial today";
  const submitLabel = mode === "login" ? "Sign in" : "Get started";

  // Tier display names
  const tierNames: Record<SubscriptionTier, string> = {
    trial: "Free Trial",
    basic: "Basic ($400/month)",
    pro: "Pro ($800/month)",
    ultimate: "Ultimate ($1500/month)",
  };

  // Read tier from URL params
  useEffect(() => {
    const tier = searchParams.get("tier") as SubscriptionTier;
    if (tier && ["trial", "basic", "pro", "ultimate"].includes(tier)) {
      setSubscriptionTier(tier);
      setMode("signup");
    }
  }, [searchParams]);

  useEffect(() => {
    async function loadConfig() {
      try {
        const response = await fetch("/api/auth/config");
        const result = await response.json();
        setSheetsConfigured(result?.sheetsConfigured ?? false);
      } catch {
        setSheetsConfigured(false);
      } finally {
        setConfigLoaded(true);
      }
    }

    loadConfig();
  }, []);

  useEffect(() => {
    if (searchParams.get("trialExpired") === "true") {
      setTrialExpired(true);
      setError("Your trial period has ended. To continue using the website, you need to continue your subscription and add a payment method.");
    }
  }, [searchParams]);

  // Three.js 3D Background Animation
  useEffect(() => {
    const container = document.getElementById('three-container');
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // Create floating particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 700;
    const posArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 15;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.02,
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.8,
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // Create floating geometric shapes
    interface AnimatedShape {
      mesh: THREE.Mesh;
      rotationSpeed: { x: number; y: number };
      floatSpeed: number;
    }
    const shapes: AnimatedShape[] = [];
    const geometries = [
      new THREE.IcosahedronGeometry(0.3, 0),
      new THREE.OctahedronGeometry(0.25, 0),
      new THREE.TetrahedronGeometry(0.3, 0),
    ];

    for (let i = 0; i < 15; i++) {
      const geometry = geometries[Math.floor(Math.random() * geometries.length)];
      const material = new THREE.MeshBasicMaterial({
        color: Math.random() > 0.5 ? 0xf59e0b : 0xf97316,
        wireframe: true,
        transparent: true,
        opacity: 0.3,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 5
      );
      mesh.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      scene.add(mesh);
      shapes.push({
        mesh,
        rotationSpeed: {
          x: (Math.random() - 0.5) * 0.01,
          y: (Math.random() - 0.5) * 0.01,
        },
        floatSpeed: (Math.random() - 0.5) * 0.002,
      });
    }

    camera.position.z = 5;

    // Mouse interaction
    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      mouseX = (event.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('mousemove', handleMouseMove);

    const animate = () => {
      requestAnimationFrame(animate);

      particlesMesh.rotation.y += 0.001;
      particlesMesh.rotation.x += 0.0005;

      shapes.forEach((shape) => {
        shape.mesh.rotation.x += shape.rotationSpeed.x;
        shape.mesh.rotation.y += shape.rotationSpeed.y;
        shape.mesh.position.y += shape.floatSpeed;

        if (shape.mesh.position.y > 5) shape.mesh.position.y = -5;
        if (shape.mesh.position.y < -5) shape.mesh.position.y = 5;
      });

      camera.position.x += (mouseX * 0.5 - camera.position.x) * 0.05;
      camera.position.y += (mouseY * 0.5 - camera.position.y) * 0.05;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!emailPattern.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (mode === "signup" && fullName.trim().length < 2) {
      setError("Please enter your full name.");
      return;
    }

    setBusy(true);
    try {
      const endpoint = mode === "signup" ? "/api/auth/signup" : "/api/auth/login";
      const body = mode === "signup"
        ? JSON.stringify({ fullName, email, password, subscriptionTier })
        : JSON.stringify({ email, password });
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body,
      });

      const result = await response.json();
      if (!response.ok) {
        if (result?.trialExpired) {
          setTrialExpired(true);
          setError(result?.error || "Your trial period has ended.");
        } else {
          setError(result?.error || "Something went wrong. Please try again.");
        }
        return;
      }

      // Use the redirect URL from the response, default to "/"
      router.push(result.redirectUrl || "/");
    } catch (err) {
      setError("Unable to connect with the server. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div id="three-container" className="absolute inset-0 pointer-events-none" />
      <div className="w-full max-w-md relative z-10">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 mb-4 shadow-2xl shadow-amber-500/30 animate-pulse hover:scale-110 transition-transform duration-300">
            <svg className="w-10 h-10 text-zinc-950" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 tracking-tight mb-2">Market Signals</h1>
          <p className="text-sm text-zinc-400 mt-1">Premium Trading Intelligence</p>
        </div>

        {/* Main Card */}
        <div className="rounded-3xl border border-zinc-800/50 bg-zinc-900/70 backdrop-blur-2xl p-8 shadow-2xl shadow-black/50 ring-1 ring-white/5">
          {/* Mode Toggle */}
          <div className="flex gap-2 p-1 rounded-2xl bg-zinc-800/50 mb-8">
            <button
              type="button"
              onClick={() => { setMode("login"); setError(null); setTrialExpired(false); }}
              className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                mode === "login"
                  ? "bg-gradient-to-r from-amber-400 to-orange-500 text-zinc-950 shadow-lg shadow-amber-500/20"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => { setMode("signup"); setError(null); setTrialExpired(false); }}
              className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                mode === "signup"
                  ? "bg-gradient-to-r from-amber-400 to-orange-500 text-zinc-950 shadow-lg shadow-amber-500/20"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Sign up
            </button>
          </div>

          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-zinc-100">{heading}</h2>
            <p className="text-sm text-zinc-400 mt-1">{subheading}</p>
            {mode === "signup" && subscriptionTier !== "trial" && (
              <div className="mt-3 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-400/20 to-orange-500/20 border border-amber-500/30 px-3 py-1.5 animate-pulse">
                <span className="text-xs font-medium text-amber-300">Selected Plan:</span>
                <span className="text-xs font-semibold text-amber-100">{tierNames[subscriptionTier]}</span>
              </div>
            )}
          </div>

          {/* Subscription Tier Selector - only show in signup mode */}
          {mode === "signup" && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-zinc-300 mb-3">Choose your plan</label>
              <div className="space-y-2">
                {([
                  { tier: "trial", name: "Free Trial", price: "1 day free", desc: "Try before you buy" },
                  { tier: "basic", name: "Basic", price: "$400/month", desc: "Market Indices Signals (SPY, SPX, NQ, ES, QQQ)" },
                  { tier: "pro", name: "Pro", price: "$800/month", desc: "Basic + Stocks Trading Signals" },
                  { tier: "ultimate", name: "Ultimate", price: "$1500/month", desc: "Pro + Gamma Levels + Options Master + Discord" },
                ] as const).map((plan) => (
                  <label
                    key={plan.tier}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all hover:scale-[1.02] ${
                      subscriptionTier === plan.tier
                        ? "border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/10"
                        : "border-zinc-700 bg-zinc-800/30 hover:border-zinc-600 hover:bg-zinc-800/50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="tier"
                      value={plan.tier}
                      checked={subscriptionTier === plan.tier}
                      onChange={(e) => setSubscriptionTier(e.target.value as SubscriptionTier)}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      subscriptionTier === plan.tier ? "border-amber-400" : "border-zinc-500"
                    }`}>
                      {subscriptionTier === plan.tier && (
                        <div className="w-2 h-2 rounded-full bg-amber-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-semibold ${subscriptionTier === plan.tier ? "text-amber-100" : "text-zinc-200"}`}>
                          {plan.name}
                        </span>
                        <span className="text-xs font-medium text-zinc-400">{plan.price}</span>
                      </div>
                      <p className="text-xs text-zinc-500">{plan.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}


          {trialExpired ? (
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-5 mb-6">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="font-medium text-rose-100">Trial Period Ended</p>
                  <p className="text-xs text-rose-200/80 mt-1">To continue, please renew your subscription and add a payment method.</p>
                </div>
              </div>
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === "signup" && (
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Full name</label>
                <input
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  placeholder="Jane Doe"
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-800/50 px-4 py-3 text-base text-zinc-100 placeholder-zinc-500 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all hover:border-zinc-600"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@gmail.com"
                className="w-full rounded-xl border border-zinc-700 bg-zinc-800/50 px-4 py-3 text-base text-zinc-100 placeholder-zinc-500 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all hover:border-zinc-600"
              />
              <p className="text-xs text-zinc-500 mt-1.5">Gmail addresses only</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Minimum 8 characters"
                className="w-full rounded-xl border border-zinc-700 bg-zinc-800/50 px-4 py-3 text-base text-zinc-100 placeholder-zinc-500 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all hover:border-zinc-600"
              />
            </div>

            {error && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
              </div>
            )}

            {message && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {message}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-6 py-3.5 text-sm font-semibold text-zinc-950 transition-all hover:from-amber-500 hover:to-orange-600 hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30"
            >
              {busy ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                submitLabel
              )}
            </button>

            <div className="text-center pt-2">
              <p className="text-sm text-zinc-400">
                {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
                <button
                  type="button"
                  className="font-medium text-amber-400 hover:text-amber-300 transition-colors"
                  onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(null); setTrialExpired(false); }}
                >
                  {mode === "login" ? "Sign up free" : "Sign in"}
                </button>
              </p>
            </div>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-zinc-500 mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
