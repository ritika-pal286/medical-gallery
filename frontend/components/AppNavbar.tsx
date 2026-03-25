"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSyncExternalStore } from "react";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/admin", label: "Admin" },
  { href: "/gallery", label: "Gallery" },
];

const subscribeToAuthChanges = (callback: () => void) => {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handler = () => callback();
  window.addEventListener("storage", handler);
  window.addEventListener("focus", handler);

  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener("focus", handler);
  };
};

const getAuthSnapshot = () => {
  if (typeof window === "undefined") {
    return false;
  }

  return Boolean(localStorage.getItem("token"));
};

export default function AppNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const isLoggedIn = useSyncExternalStore(subscribeToAuthChanges, getAuthSnapshot, () => false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-cyan-500" />
          <span className="text-sm font-semibold tracking-wide text-slate-900">
            Medical Gallery
          </span>
        </Link>

        <nav className="flex items-center gap-2">
          {navItems.map((item) => {
            const isActive =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {item.label}
              </Link>
            );
          })}

          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Logout
            </button>
          ) : (
            <Link
              href="/login"
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                pathname === "/login"
                  ? "bg-slate-900 text-white"
                  : "border border-slate-300 text-slate-700 hover:bg-slate-100"
              }`}
            >
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
