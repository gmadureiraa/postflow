"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import {
  LayoutDashboard,
  PlusCircle,
  FolderOpen,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import Link from "next/link";

const NAV_ITEMS = [
  { href: "/app", label: "Dashboard", icon: LayoutDashboard },
  { href: "/app/create", label: "Create", icon: PlusCircle },
  { href: "/app/carousels", label: "My Carousels", icon: FolderOpen },
  { href: "/app/settings", label: "Settings", icon: Settings },
];

function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const { profile, loading, user, isGuest } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    const isLoginPage = pathname === "/app/login";
    const isOnboardingPage = pathname === "/app/onboarding";
    const isAuthenticated = !!user || isGuest;

    // Not authenticated and not on login page -> go to login
    if (!isAuthenticated && !isLoginPage) {
      router.push("/app/login");
      return;
    }

    // Authenticated but onboarding not complete and not on onboarding page
    if (
      isAuthenticated &&
      profile &&
      !profile.onboarding_completed &&
      !isOnboardingPage &&
      !isLoginPage
    ) {
      router.push("/app/onboarding");
      return;
    }
  }, [loading, user, isGuest, profile, pathname, router]);

  return <>{children}</>;
}

function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { profile, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Don't show app shell on login/onboarding
  const isFullscreenPage =
    pathname === "/app/login" || pathname === "/app/onboarding";

  if (isFullscreenPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-zinc-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-zinc-200 bg-white transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-zinc-100 px-6">
          <Link href="/app" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#7C3AED]">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="text-lg font-semibold tracking-tight text-zinc-900">
              PostFlow
            </span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-zinc-400 hover:text-zinc-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                  active
                    ? "bg-[#7C3AED]/10 text-[#7C3AED]"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                }`}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* User info */}
        <div className="border-t border-zinc-100 p-4">
          <div className="flex items-center gap-3 mb-3">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt=""
                className="h-9 w-9 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#7C3AED]/10 text-[#7C3AED] text-sm font-semibold">
                {profile?.name?.[0]?.toUpperCase() || "U"}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-900 truncate">
                {profile?.name || "User"}
              </p>
              <p className="text-xs text-zinc-500 truncate">
                {profile?.plan === "free" ? "Free Plan" : profile?.plan === "pro" ? "Pro Plan" : "Business"}
              </p>
            </div>
          </div>
          <button
            onClick={signOut}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Mobile header */}
        <header className="flex h-16 items-center justify-between border-b border-zinc-200 bg-white px-4 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-zinc-600 hover:text-zinc-900"
          >
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#7C3AED]">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-zinc-900">PostFlow</span>
          </div>
          <div className="w-6" />
        </header>

        <main className="flex-1 p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <OnboardingGuard>
        <AppShell>{children}</AppShell>
      </OnboardingGuard>
    </AuthProvider>
  );
}
