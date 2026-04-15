"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Crown,
  Trash2,
  Save,
  AlertTriangle,
} from "lucide-react";

export default function SettingsPage() {
  const { profile, updateProfile, signOut, isGuest } = useAuth();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [name, setName] = useState(profile?.name || "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || "");
  const [twitterHandle, setTwitterHandle] = useState(profile?.twitter_handle || "");
  const [instagramHandle, setInstagramHandle] = useState(profile?.instagram_handle || "");
  const [linkedinUrl, setLinkedinUrl] = useState(profile?.linkedin_url || "");
  const [niche, setNiche] = useState<string[]>(profile?.niche || []);
  const [tone, setTone] = useState(profile?.tone || "professional");
  const [language, setLanguage] = useState(profile?.language || "pt-br");
  const [carouselStyle, setCarouselStyle] = useState(profile?.carousel_style || "white");

  const NICHES = ["Marketing", "Tech", "Crypto", "Fitness", "Business", "Education", "Design", "Other"];
  const TONES = [
    { value: "professional", label: "Professional" },
    { value: "casual", label: "Casual" },
    { value: "provocative", label: "Provocative" },
    { value: "educational", label: "Educational" },
  ];

  function toggleNiche(n: string) {
    if (niche.includes(n)) {
      setNiche(niche.filter((x) => x !== n));
    } else {
      setNiche([...niche, n]);
    }
  }

  async function handleSave() {
    setSaving(true);
    await updateProfile({
      name,
      avatar_url: avatarUrl,
      twitter_handle: twitterHandle,
      instagram_handle: instagramHandle,
      linkedin_url: linkedinUrl,
      niche,
      tone,
      language,
      carousel_style: carouselStyle,
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleDeleteAccount() {
    if (isGuest) {
      localStorage.removeItem("postflow_guest");
      localStorage.removeItem("postflow_guest_profile");
      localStorage.removeItem("postflow_onboarding");
      localStorage.removeItem("postflow_carousels");
      localStorage.removeItem("postflow-draft");
      await signOut();
    } else {
      await signOut();
    }
  }

  const plan = profile?.plan ?? "free";

  return (
    <div className="mx-auto max-w-2xl">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1
          className="text-3xl font-bold text-zinc-900 mb-1"
          style={{ fontFamily: "'DM Serif Display', serif" }}
        >
          Settings
        </h1>
        <p className="text-zinc-500 mb-8">
          Manage your profile, preferences, and account.
        </p>
      </motion.div>

      <div className="space-y-8">
        {/* Profile Section */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="rounded-2xl border border-zinc-200 bg-white p-6"
        >
          <h2 className="text-base font-semibold text-zinc-900 mb-4 flex items-center gap-2">
            <User size={18} className="text-[#7C3AED]" />
            Profile
          </h2>

          <div className="flex items-center gap-4 mb-5">
            <div className="relative">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className="h-16 w-16 rounded-full object-cover ring-2 ring-zinc-100"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#7C3AED] to-[#8B5CF6] text-white text-lg font-bold">
                  {name?.[0]?.toUpperCase() || "U"}
                </div>
              )}
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-zinc-500 mb-1">Photo URL</label>
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none transition-all focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20"
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition-all focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">Email</label>
              <div className="flex items-center gap-2 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-500">
                <Mail size={14} />
                {profile?.email || (isGuest ? "Guest mode" : "Not set")}
              </div>
            </div>
          </div>
        </motion.section>

        {/* Social Handles */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="rounded-2xl border border-zinc-200 bg-white p-6"
        >
          <h2 className="text-base font-semibold text-zinc-900 mb-4">Social Handles</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">Twitter / X</label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                </div>
                <input
                  type="text"
                  value={twitterHandle}
                  onChange={(e) => setTwitterHandle(e.target.value.replace(/^@/, ""))}
                  className="w-full rounded-xl border border-zinc-200 bg-white pl-10 pr-4 py-3 text-sm text-zinc-900 outline-none transition-all focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20"
                  placeholder="yourhandle"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">Instagram</label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
                </div>
                <input
                  type="text"
                  value={instagramHandle}
                  onChange={(e) => setInstagramHandle(e.target.value.replace(/^@/, ""))}
                  className="w-full rounded-xl border border-zinc-200 bg-white pl-10 pr-4 py-3 text-sm text-zinc-900 outline-none transition-all focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20"
                  placeholder="yourhandle"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">LinkedIn</label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                </div>
                <input
                  type="url"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-white pl-10 pr-4 py-3 text-sm text-zinc-900 outline-none transition-all focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20"
                  placeholder="https://linkedin.com/in/..."
                />
              </div>
            </div>
          </div>
        </motion.section>

        {/* Preferences */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="rounded-2xl border border-zinc-200 bg-white p-6"
        >
          <h2 className="text-base font-semibold text-zinc-900 mb-4">Preferences</h2>

          {/* Niche */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-zinc-700 mb-2">Niche</label>
            <div className="flex flex-wrap gap-2">
              {NICHES.map((n) => (
                <button
                  key={n}
                  onClick={() => toggleNiche(n)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                    niche.includes(n)
                      ? "bg-[#7C3AED] text-white shadow-sm"
                      : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Tone */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-zinc-700 mb-2">Tone</label>
            <div className="flex flex-wrap gap-2">
              {TONES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setTone(t.value)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                    tone === t.value
                      ? "bg-[#7C3AED] text-white shadow-sm"
                      : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Language & Style */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition-all focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20"
              >
                <option value="pt-br">Portugues (BR)</option>
                <option value="en">English</option>
                <option value="es">Espanol</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">Default Style</label>
              <select
                value={carouselStyle}
                onChange={(e) => setCarouselStyle(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition-all focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20"
              >
                <option value="white">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>
          </div>
        </motion.section>

        {/* Subscription */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="rounded-2xl border border-zinc-200 bg-white p-6"
        >
          <h2 className="text-base font-semibold text-zinc-900 mb-4 flex items-center gap-2">
            <Crown size={18} className="text-[#7C3AED]" />
            Subscription
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-900">
                Current plan: <span className="text-[#7C3AED] font-bold">{plan.charAt(0).toUpperCase() + plan.slice(1)}</span>
              </p>
              <p className="text-xs text-zinc-500 mt-0.5">
                {plan === "free" ? "3 carousels per month" : plan === "pro" ? "30 carousels per month" : "Unlimited carousels"}
              </p>
            </div>
            {plan === "free" && (
              <button className="btn-scale rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:shadow-md hover:shadow-purple-500/20">
                Upgrade to Pro
              </button>
            )}
          </div>
        </motion.section>

        {/* Save button */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
        >
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-scale w-full rounded-xl bg-[#7C3AED] py-3.5 text-sm font-semibold text-white transition-all hover:bg-[#6D28D9] hover:shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Save size={16} />
            {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
          </button>
        </motion.div>

        {/* Danger Zone */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="rounded-2xl border border-red-200 bg-red-50/50 p-6"
        >
          <h2 className="text-base font-semibold text-red-700 mb-2 flex items-center gap-2">
            <AlertTriangle size={18} />
            Danger Zone
          </h2>
          <p className="text-sm text-red-600/80 mb-4">
            This action is irreversible. All your data will be permanently deleted.
          </p>

          <AnimatePresence>
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-2 rounded-xl border border-red-300 bg-white px-4 py-2.5 text-sm font-medium text-red-600 transition-all hover:bg-red-50"
              >
                <Trash2 size={14} />
                Delete Account
              </button>
            ) : (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleDeleteAccount}
                    className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-red-700"
                  >
                    <Trash2 size={14} />
                    Yes, delete my account
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-600 transition-all hover:bg-zinc-50"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>
      </div>
    </div>
  );
}
