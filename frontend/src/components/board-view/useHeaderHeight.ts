import { useState, useEffect } from "react";

export const useHeaderHeight = () => {
  const [headerHeight, setHeaderHeight] = useState(0);

  useEffect(() => {
    const updateHeaderHeight = () => {
      const header = document.querySelector(".header-view");
      if (header) {
        setHeaderHeight(header.clientHeight);
      }
      const headerEdifice = document.querySelector(
        "#root > .header:first-of-type",
      );
      if (headerEdifice) {
        setHeaderHeight(
          (headerHeight) => headerHeight + headerEdifice.clientHeight,
        );
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
