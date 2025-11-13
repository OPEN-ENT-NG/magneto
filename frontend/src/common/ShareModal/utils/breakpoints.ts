import { useEffect, useState } from "react";

export const breakpoints = {
  xs: 0,
  sm: 600,
  md: 960,
  mdcomment: 1360,
  lg: 1280,
  xl: 1920,
};

export const mediaQueries = {
  xs: `@media (max-width: ${breakpoints.xs}px)`,
  sm: `@media (max-width: ${breakpoints.sm}px)`,
  md: `@media (max-width: ${breakpoints.md}px)`,
  mdcomment: `@media (max-width: ${breakpoints.mdcomment}px)`,
  lg: `@media (max-width: ${breakpoints.lg}px)`,
  xl: `@media (max-width: ${breakpoints.xl}px)`,
};

export const useCustomMediaQuery = (breakpoint: keyof typeof breakpoints) => {
  const [matches, setMatches] = useState(
    window.matchMedia(`(max-width: ${breakpoints[breakpoint]}px)`).matches,
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia(
      `(max-width: ${breakpoints[breakpoint]}px)`,
    );
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, [breakpoint]);

  return matches;
};
