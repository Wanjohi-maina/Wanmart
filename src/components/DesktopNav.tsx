import { Link } from "react-router-dom";
import { useCategories } from "../hooks/useCategories";

export default function DesktopNav() {
  const { parents, getChildren } = useCategories();

  return (
    <nav className="hidden md:flex items-center gap-6">
      {parents.map((parent) => {
        const children = getChildren(parent.id);
        return (
          <div key={parent.id} className="group relative">
            <Link
              to={`/category/${parent.slug}`}
              className="text-base font-medium text-gray-800 hover:text-gray-950 py-2"
            >
              {parent.name}
            </Link>

            {children.length > 0 && (
              <div className="invisible absolute left-0 top-full pt-4 opacity-0 transition-opacity duration-150 group-hover:visible group-hover:opacity-100">  
              <div className="min-w-[180px] rounded-md border border-gray-200 bg-white py-2 shadow-lg">
                {children.map((child) => (
                  <Link
                    key={child.id}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    to={`/category/${child.slug}`}
                  >
                    {child.name}
                  </Link>
                ))}
              </div>
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}
