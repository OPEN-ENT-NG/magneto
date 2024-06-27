import { useState, useEffect } from "react";

function getWindowDimensions() {
  const { innerWidth: width, innerHeight: height } = window;
  return {
    width,
    height,
  };
}

export default function useWindowDimensions() {
  const [windowDimensions, setWindowDimensions] = useState(
    getWindowDimensions(),
  );

  useEffect(() => {
    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const adaptColumns = () => {
    let str = "";
    if (windowDimensions.width == 1024) {
      str = "9";
    } else if (windowDimensions.width < 1280) str = "6";
    else str = "9";
    return str;
  };

  return { windowDimensions, adaptColumns };
}
