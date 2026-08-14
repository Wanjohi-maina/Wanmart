import { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";
import {
  HexagonIcon,
  SearchIcon,
  CartIcon,
  MenuIcon,
  CloseIcon,
} from "./Icons";
import NavDropdown from "./NavDropdown";
import SearchOverlay from "./SearchOverlay";
import { useCart } from "../context/CartContext";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const { totalItems } = useCart();

  function toggleMenu() {
    setIsMenuOpen((prevOpen) => !prevOpen);
  }

  function toggleSearch() {
    setIsSearchOpen((prevOpen) => !prevOpen);
  }

  return (
    <>
      <header className="flex items-center border-b border-gray-200 p-4">
        <Link to="/" className="inline-flex shrink-0 items-center">
          <HexagonIcon className="h-6 w-6 text-orange-500" />
          <img src={logo} alt="wanmart" className="block h-5 w-auto " />
        </Link>
        <nav className="flex ml-auto items-center gap-4">
          <button
            type="button"
            aria-label="Open search bar"
            onClick={toggleSearch}
          >
            <SearchIcon className="w-5 h-5" />
          </button>
          <Link to="/cart" className="relative" aria-label="View cart">
            <CartIcon className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 flex items-center justify-center bg-gray-900 text-white text-xs rounded-full h-4 w-4">
                {totalItems}
              </span>
            )}
          </Link>

          <button
            type="button"
            onClick={toggleMenu}
            aria-label="Toggle menu"
            className="relative z-30"
          >
            <MenuIcon
              className={`w-5 h-5 ${isMenuOpen ? "hidden" : "block"}`}
            />
            <CloseIcon
              className={`w-5 h-5 ${isMenuOpen ? "block" : "hidden"}`}
            />
          </button>
        </nav>
      </header>

      <NavDropdown isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      <SearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
}
