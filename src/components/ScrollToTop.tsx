import { useEffect } from "react";

export default function ScrollToTop() {
  useEffect(() => {
    const handleScroll = () => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "instant",
      });
    };

    // Astro View Transitions event
    document.addEventListener('astro:after-navigation', handleScroll);
    
    // Initial load
    handleScroll();

    return () => document.removeEventListener('astro:after-navigation', handleScroll);
  }, []);

  return null;
}
