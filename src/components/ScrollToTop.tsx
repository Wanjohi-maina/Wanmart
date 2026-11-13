import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // Let links with a #section scroll to that section instead.
    if (!hash) window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
}