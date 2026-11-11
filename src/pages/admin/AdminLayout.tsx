import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { CloseIcon, HamburgerMenuIcon, HexagonIcon } from "../../components/Icons";
import logo  from "../../assets/logo.png";
import { supabase } from "../../lib/supabaseClient";
import { useIdleLogout } from "./useIdleLogout";
import { ReviewCountProvider } from "./ReviewCountProvider";
import { useReviewCount } from "./reviewCountContext";

const navItems = [
  { to: "/admin", label: "Dashboard", end: true, showCount: false },
  { to: "/admin/orders", label: "Orders", end: false, showCount: false },
  { to: "/admin/products", label: "Products", end: false, showCount: false },
  { to: "/admin/review", label: "Review", end: false, showCount: true },
];

function AdminShell() {
  const { counts } = useReviewCount();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white">
        <div className="relative mx-auto flex max-w-7xl items-center justify-between gap-3 px-4">
          <div className="py-4 inline-flex shrink-0 items-center justify-self-start">
            <HexagonIcon className="h-6 w-6 text-orange-600" />
            <img src={logo} alt="wanmart" className="block h-5 w-auto " />
            <span className="ml-2 text-xs font-medium text-gray-500">Admin</span>
          </div>

          <nav className="hidden min-w-0 items-center gap-5 whitespace-nowrap text-sm md:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `inline-flex items-center py-5 border-b-2 ${
                    isActive
                      ? "border-orange-600 text-orange-600"
                      : "border-transparent text-gray-500 hover:text-gray-900"
                  }`
                }
              >
                {item.label}
                {item.showCount && counts && counts.total > 0 && (
                  <span className="ml-1.5 inline-flex min-w-5 items-center justify-center rounded-full bg-orange-600 px-1.5 py-0.5 text-xs font-medium leading-none text-white">
                    {counts.total > 99 ? "99+" : counts.total}
                    <span className="sr-only"> waiting for review</span>
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="hidden shrink-0 items-center gap-1 text-sm md:flex">
            <Link
              to="/"
              className="px-2 py-3 text-gray-500 hover:text-orange-600"
            >
              Store
            </Link>
            <button
              onClick={() => supabase.auth.signOut()}
              className="px-2 py-3 text-gray-500 hover:text-orange-600"
            >
              Sign out
            </button>
          </div>

          <button
            type="button"
            aria-label={isMenuOpen ? "Close admin menu" : "Open admin menu"}
            aria-expanded={isMenuOpen}
            aria-controls="admin-mobile-menu"
            onClick={() => setIsMenuOpen((open) => !open)}
            className="inline-flex h-10 w-10 items-center justify-center rounded text-gray-700 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 md:hidden"
          >
            {isMenuOpen ? (
              <CloseIcon className="h-5 w-5" />
            ) : (
              <HamburgerMenuIcon className="h-5 w-5" />
            )}
          </button>

          <nav
            id="admin-mobile-menu"
            aria-label="Admin navigation"
            aria-hidden={!isMenuOpen}
            className={`absolute left-0 right-0 top-full border-b border-gray-200 bg-white px-4 py-2 shadow-md md:hidden ${
              isMenuOpen ? "block" : "hidden"
            }`}
          >
            <ul className="flex flex-col text-sm">
              {navItems.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    onClick={() => setIsMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex min-h-11 items-center border-b border-gray-100 py-2 ${
                        isActive
                          ? "font-medium text-orange-600"
                          : "text-gray-700"
                      }`
                    }
                  >
                    {item.label}
                    {item.showCount && counts && counts.total > 0 && (
                      <span className="ml-1.5 inline-flex min-w-5 items-center justify-center rounded-full bg-orange-600 px-1.5 py-0.5 text-xs font-medium leading-none text-white">
                        {counts.total > 99 ? "99+" : counts.total}
                        <span className="sr-only"> waiting for review</span>
                      </span>
                    )}
                  </NavLink>
                </li>
              ))}
              <li>
                <Link
                  to="/"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex min-h-11 items-center border-b border-gray-100 py-2 text-gray-700"
                >
                  Store
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    void supabase.auth.signOut();
                  }}
                  className="flex min-h-11 w-full items-center py-2 text-left text-gray-700"
                >
                  Sign out
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
        <Outlet />
      </main>
    </div>
  );
}

export default function AdminLayout() {
  useIdleLogout();

  return (
    <ReviewCountProvider>
      <AdminShell />
    </ReviewCountProvider>
  );
}