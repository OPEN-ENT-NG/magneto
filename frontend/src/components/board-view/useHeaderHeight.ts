import { useState, useEffect } from "react";

export const useHeaderHeight = () => {
  const [headerHeight, setHeaderHeight] = useState(127);

  useEffect(() => {
    const updateHeaderHeight = () => {
      const header = document.querySelector(".header-view");
      if (header) {
        setHeaderHeight(header.clientHeight);
      }
    };

    updateHeaderHeight();
    window.addEventListener("resize", updateHeaderHeight);

    return () => {
      window.removeEventListener("resize", updateHeaderHeight);
    };
  }, []);

  return headerHeight;
};
