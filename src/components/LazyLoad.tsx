import React, { useState, useEffect, useRef } from 'react';

interface LazyLoadProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  rootMargin?: string;
  minHeight?: string;
}

export function LazyLoad({ children, fallback, rootMargin = '400px', minHeight = '200px' }: LazyLoadProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.disconnect();
      }
    }, { rootMargin });

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [rootMargin]);

  if (!isVisible) {
    return <div ref={ref} style={{ minHeight }}>{fallback}</div>;
  }

  return <div ref={ref}>{children}</div>;
}
