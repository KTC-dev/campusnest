import { ReactNode, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";

type BottomNavItem = {
  label: string;
  to: string;
  icon: ReactNode;
};

type BottomNavProps = {
  items: BottomNavItem[];
};

function getActiveIndex(pathname: string, items: BottomNavItem[]): number {
  let bestMatch = -1;
  let bestMatchLength = 0;

  items.forEach((item, index) => {
    const itemTo = item.to;
    if (pathname === itemTo) {
      if (itemTo.length > bestMatchLength) {
        bestMatch = index;
        bestMatchLength = itemTo.length;
      }
    } else if (itemTo !== "/" && pathname.startsWith(itemTo + "/")) {
      if (itemTo.length > bestMatchLength) {
        bestMatch = index;
        bestMatchLength = itemTo.length;
      }
    }
  });

  return bestMatch;
}

const IconHome = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const IconBrowse = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

const IconRoommates = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const IconMessages = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const IconProfile = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const IconAddProperty = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5v14M5 12h14" />
  </svg>
);

const IconProperties = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="2" width="16" height="20" rx="2" />
    <path d="M9 22v-4h6v4" />
    <path d="M8 6h.01" />
    <path d="M16 6h.01" />
    <path d="M12 6h.01" />
    <path d="M12 10h.01" />
    <path d="M12 14h.01" />
  </svg>
);

export {
  IconHome,
  IconBrowse,
  IconRoommates,
  IconMessages,
  IconProfile,
  IconAddProperty,
  IconProperties,
};

export function BottomNav({ items }: BottomNavProps) {
  const location = useLocation();
  const [activeIndex, setActiveIndex] = useState(0);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  useLayoutEffect(() => {
    const idx = getActiveIndex(location.pathname, items);
    if (idx !== -1) {
      setActiveIndex(idx);
    }
  }, [location.pathname, items]);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const activeEl = itemRefs.current[activeIndex];
    if (container && activeEl) {
      setIndicator({
        left: activeEl.offsetLeft,
        width: activeEl.offsetWidth,
      });
    }
  }, [activeIndex]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateIndicator = () => {
      const activeEl = itemRefs.current[activeIndex];
      if (activeEl) {
        setIndicator({
          left: activeEl.offsetLeft,
          width: activeEl.offsetWidth,
        });
      }
    };

    const observer = new ResizeObserver(updateIndicator);
    observer.observe(container);
    return () => observer.disconnect();
  }, [activeIndex]);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-[env(safe-area-inset-bottom)]">
      <div
        ref={containerRef}
        className="relative flex items-center gap-1 rounded-[28px] border border-border bg-white/80 px-2 py-2 shadow-premium backdrop-blur-xl"
      >
        <div
          className="absolute rounded-[20px] bg-primary-600 shadow-premium transition-all duration-200 ease-out"
          style={{
            left: indicator.left,
            width: indicator.width,
            top: 8,
            bottom: 8,
          }}
          aria-hidden="true"
        />
        {items.map((item, index) => {
          const active = index === activeIndex;
          return (
            <Link
              key={item.label}
              ref={(el) => {
                itemRefs.current[index] = el;
              }}
              to={item.to}
              aria-label={item.label}
              className={`
                relative z-10 flex min-h-[48px] min-w-[48px] flex-col items-center justify-center
                rounded-2xl px-3 py-2 text-[11px] font-semibold
                transition-all duration-200 ease-out
                ${active ? "text-white" : "text-text-secondary hover:bg-cream-100 active:bg-cream-100"}
              `}
            >
              <span className={`transition-transform duration-200 ${active ? "scale-110" : "scale-100"}`}>
                {item.icon}
              </span>
              <span className="mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
