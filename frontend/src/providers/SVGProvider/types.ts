import { ReactNode } from "react";

export interface SVGProviderProps {
  children: ReactNode;
}

export type SVGContextType = {
  svgDoc: Document;
};
