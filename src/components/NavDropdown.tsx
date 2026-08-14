import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useCategories } from "../hooks/useCategories";

type NavDropdownProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function NavDropdown({ isOpen, onClose }: NavDropdownProps) {
  const [openCategory, setOpenCategory] = useState<string | null>(null); // State to track which category is currently expanded in the dropdown menu. It can be a string (category ID) or null if no category is expanded.
  const { parents, getChildren } = useCategories(); // Custom hook to fetch parent categories and a function to get child categories based on a parent ID

  useEffect(() => {
    if (!isOpen) {
      setOpenCategory(null); // Reset the openCategory state to null when the dropdown menu is closed, collapsing any expanded category.
    }
  }, [isOpen]);

  function toggleCategory(categoryId: string) {
    setOpenCategory((current) => (current === categoryId ? null : categoryId));
  } // Function to toggle the expanded state of a category. If the clicked category is already expanded, it collapses it (sets openCategory to null). Otherwise, it expands the clicked category (sets openCategory to the clicked category's ID).

  return (
    <>
      <button // This button acts as an overlay that covers the left portion of the screen when the dropdown menu is open. Clicking it will close the menu.
        type="button"
        aria-label="Close menu"
        onClick={onClose}
        className={`fixed bottom-0 left-0 top-0 z-10 w-1/5 bg-slate-300/40 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <nav
        aria-hidden={!isOpen}
        className={`fixed right-0 top-0 z-20 h-screen w-4/5 bg-white px-5 pb-6 pt-16 shadow-lg transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <ul className="flex flex-col gap-4">
          {parents.map((parent) => {
            const children = getChildren(parent.id); // Get the child categories for the current parent category using the getChildren function from the useCategories hook
            return (
              <li key={parent.id}>
                <div className="flex w-full items-center justify-between">
                  <Link
                    to={`/category/${parent.slug}`}
                    onClick={onClose}
                    className="font-medium text-gray-800"
                  >
                    {parent.name}
                  </Link>
                  <button
                    type="button"
                    onClick={() => toggleCategory(parent.id)} // Toggle the expanded state of the current parent category when the button is clicked. If the category is already expanded, it will collapse it; otherwise, it will expand it.
                    aria-label={`Toggle ${parent.name} subcategories`}
                    className="px-2 text-gray-500"
                  >
                    {openCategory === parent.id ? "-" : "+"}{" "}
                    {/* Display a '-' sign if the current parent category is expanded (openCategory matches the parent ID), otherwise display a '+' sign to indicate that it can be expanded. */}
                  </button>
                </div>

                {openCategory === parent.id && ( // If the current parent category is expanded, render the list of child categories as links. Each child category is displayed as a link that navigates to its respective category page.
                  <ul className="mt-2 flex flex-col gap-2 pl-4">
                    {children.map((child) => (
                      <li key={child.id}>
                        <Link
                          to={`/category/${child.slug}`}
                          onClick={onClose}
                          className="text-sm text-gray-600"
                        >
                          {child.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
