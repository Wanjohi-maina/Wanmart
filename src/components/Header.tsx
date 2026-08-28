import { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";
import {
  HexagonIcon,
  SearchIcon,
  CartIcon,
  HamburgerMenuIcon,
  CloseIcon,
} from "./Icons";
import NavDropdown from "./NavDropdown";
import SearchOverlay from "./SearchOverlay";
import { useCart } from "../context/CartContext";
import DesktopNav from "./DesktopNav";

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
    <div className="fixed top-0 left-0 right-0 z-40 border-b border-gray-200 bg-white">
      <header className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-[1fr_auto_1fr] items-center gap-6 p-4">
        <Link to="/" className="inline-flex shrink-0 items-center justify-self-start">
          <HexagonIcon className="h-6 w-6 text-orange-500" />
          <img src={logo} alt="wanmart" className="block h-5 w-auto " />
        </Link>

        <DesktopNav/>

        <nav className="flex items-center gap-4 justify-self-end">
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
            className="relative z-30 md:hidden"
          >
            <HamburgerMenuIcon
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
    </div>
  );
}
