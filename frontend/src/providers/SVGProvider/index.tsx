import {
  FC,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { usePaths } from "@edifice-ui/react";

import { SVGContextType, SVGProviderProps } from "./types";
const SVGContext = createContext<SVGContextType | null>(null);

export const useSVG = () => {
  const context = useContext(SVGContext);
  if (!context) {
    throw new Error("useSVG must be used within a SVGProvider");
  }
  return context;
};

export const SVGProvider: FC<SVGProviderProps> = ({ children }) => {
  const [svgDoc, setSvgDoc] = useState<Document>(new Document());
  const [, iconPath] = usePaths();

  const fetchSvgDoc = async () => {
    try {
      const response = await fetch(`${iconPath}/apps.svg`);
      const svgText = await response.text();
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(svgText, "image/svg+xml");
      setSvgDoc(svgDoc);
    } catch (error) {
      console.error("Erreur lors du fetch du SVG:", error);
    }
  };

  useEffect(() => {
    fetchSvgDoc();
  }, [iconPath]);

  const value = useMemo<SVGContextType>(
    () => ({
      svgDoc,
    }),
    [svgDoc],
  );

  return <SVGContext.Provider value={value}>{children}</SVGContext.Provider>;
};
