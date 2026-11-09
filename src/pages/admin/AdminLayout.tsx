import { Link, NavLink, Outlet } from "react-router-dom";
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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4">
          <nav className="flex min-w-0 items-center gap-5 overflow-x-auto whitespace-nowrap text-sm">
            <span className="py-3 font-semibold text-gray-900">Admin</span>

            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `inline-flex items-center py-3 border-b-2 ${
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

          <div className="flex shrink-0 items-center gap-1 text-sm">
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