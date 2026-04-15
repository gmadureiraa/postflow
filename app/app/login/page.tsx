"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, continueAsGuest } =
    useAuth();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const fn = mode === "signin" ? signInWithEmail : signUpWithEmail;
    const result = await fn(email, password);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      if (mode === "signup") {
        setSuccess("Check your email to confirm your account.");
        setLoading(false);
      } else {
        router.push("/app");
      }
    }
  }

  function handleGuest() {
    continueAsGuest();
    router.push("/app/onboarding");
  }

  return (
    <div className="flex min-h-screen">
      {/* Left: Form */}
      <div className="flex flex-1 items-center justify-center px-6 py-12 gradient-mesh">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <div className="mb-8">
            <div className="flex items-center gap-2.5 mb-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/postflow-icon.png"
                alt="PostFlow"
                className="w-10 h-10 rounded-xl shadow-sm"
              />
              <span className="text-lg font-semibold text-zinc-900 tracking-tight">PostFlow</span>
            </div>
            <h1
              className="text-4xl font-bold text-zinc-900 mb-2"
              style={{ fontFamily: "'DM Serif Display', serif" }}
            >
              Welcome to PostFlow
            </h1>
            <p className="text-zinc-500 text-base">
              Create stunning carousels for social media in seconds.
            </p>
          </div>

          {/* Guest mode — prominent */}
          <button
            onClick={handleGuest}
            className="btn-scale flex w-full items-center justify-between rounded-2xl border-2 border-dashed border-[#7C3AED]/30 bg-[#7C3AED]/[0.03] px-5 py-4 text-left transition-all hover:border-[#7C3AED]/60 hover:bg-[#7C3AED]/[0.06] mb-5 group"
          >
            <div>
              <p className="text-sm font-semibold text-zinc-800">Try without an account</p>
              <p className="text-xs text-zinc-500 mt-0.5">Start creating carousels instantly</p>
            </div>
            <ArrowRight size={18} className="text-[#7C3AED] opacity-50 group-hover:opacity-100 transition-opacity" />
          </button>

          {/* Divider */}
          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-zinc-200" />
            <span className="text-xs text-zinc-400 uppercase tracking-wider">or sign in</span>
            <div className="h-px flex-1 bg-zinc-200" />
          </div>

          {/* Google Sign In */}
          <button
            onClick={signInWithGoogle}
            className="btn-scale flex w-full items-center justify-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3.5 text-sm font-medium text-zinc-700 shadow-sm transition-all hover:bg-zinc-50 hover:border-zinc-300 hover:shadow-md"
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-zinc-200" />
            <span className="text-xs text-zinc-400 uppercase tracking-wider">or</span>
            <div className="h-px flex-1 bg-zinc-200" />
          </div>

          {/* Email Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition-all focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition-all focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20"
                placeholder="Your password"
                minLength={6}
              />
            </div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: -8, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -8, height: 0 }}
                  className="overflow-hidden"
                >
                  <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-2.5 flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                    {error}
                  </p>
                </motion.div>
              )}
              {success && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: -8, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -8, height: 0 }}
                  className="overflow-hidden"
                >
                  <p className="text-sm text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-lg px-4 py-2.5 flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                    {success}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading}
              className="btn-scale w-full rounded-xl bg-[#7C3AED] px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#6D28D9] hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? "Loading..."
                : mode === "signin"
                ? "Sign In"
                : "Create Account"}
            </button>
          </form>

          {/* Toggle mode */}
          <p className="mt-4 text-center text-sm text-zinc-500">
            {mode === "signin" ? (
              <>
                Don&apos;t have an account?{" "}
                <button
                  onClick={() => {
                    setMode("signup");
                    setError("");
                    setSuccess("");
                  }}
                  className="font-medium text-[#7C3AED] hover:text-[#6D28D9]"
                >
                  Sign Up
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  onClick={() => {
                    setMode("signin");
                    setError("");
                    setSuccess("");
                  }}
                  className="font-medium text-[#7C3AED] hover:text-[#6D28D9]"
                >
                  Sign In
                </button>
              </>
            )}
          </p>
        </motion.div>
      </div>

      {/* Right: Carousel mockup decoration */}
      <div className="hidden lg:flex flex-1 items-center justify-center bg-gradient-to-br from-[#7C3AED]/5 to-[#7C3AED]/10 p-12 relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-20 right-20 w-64 h-64 rounded-full bg-[#7C3AED]/5 blur-3xl" />
        <div className="absolute bottom-20 left-20 w-48 h-48 rounded-full bg-[#7C3AED]/8 blur-3xl" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="w-full max-w-sm relative z-10"
        >
          {/* Fake carousel mockup */}
          <div className="space-y-4">
            {[
              { text: "Your best ideas deserve a beautiful format.", accent: true },
              { text: "Turn threads, articles, and ideas into carousels.", accent: false },
              { text: "Share on Instagram, LinkedIn, Twitter. One click.", accent: false },
            ].map((slide, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 + i * 0.15 }}
                className={`card-lift rounded-2xl p-6 shadow-sm border ${
                  slide.accent
                    ? "bg-[#7C3AED] text-white border-[#7C3AED]"
                    : "bg-white text-zinc-700 border-zinc-100"
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={`w-8 h-8 rounded-full ${
                      slide.accent ? "bg-white/20" : "bg-zinc-100"
                    }`}
                  />
                  <div>
                    <div
                      className={`h-2.5 w-20 rounded ${
                        slide.accent ? "bg-white/30" : "bg-zinc-200"
                      }`}
                    />
                    <div
                      className={`h-2 w-14 rounded mt-1 ${
                        slide.accent ? "bg-white/20" : "bg-zinc-100"
                      }`}
                    />
                  </div>
                </div>
                <p
                  className="text-sm font-medium leading-relaxed"
                  style={{ fontFamily: "'DM Serif Display', serif" }}
                >
                  {slide.text}
                </p>
              </motion.div>
            ))}
          </div>
          <p className="mt-6 text-center text-xs text-zinc-400">
            PostFlow Carousel Preview
          </p>
        </motion.div>
      </div>
    </div>
  );
}
