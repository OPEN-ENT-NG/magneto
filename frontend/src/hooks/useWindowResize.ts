import { useRef, useState, useEffect } from "react";

export const useWindowResize = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [, forceUpdate] = useState({});
  useEffect(() => {
    const handleResize = () => {
      forceUpdate({});
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return ref;
};
