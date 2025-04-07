import { createElement } from "react";

import { SvgIconTypeMap } from "@mui/material";
import { OverridableComponent } from "@mui/material/OverridableComponent";
import { renderToString } from "react-dom/server";

type MuiIconComponent = OverridableComponent<SvgIconTypeMap<object, "svg">> & {
  muiName: string;
};

export const getMuiIconPath = (IconComponent: MuiIconComponent): string => {
  try {
    // Render the icon component to string
    const svgString = renderToString(createElement(IconComponent, {}));

    // Create a temporary DOM element to parse the SVG
    const div = document.createElement("div");
    div.innerHTML = svgString;

    // Get the path element
    const pathElement = div.querySelector("path");
    if (!pathElement) {
      throw new Error("No path element found in SVG");
    }

    // Get the d attribute which contains the path data
    const pathData = pathElement.getAttribute("d");
    if (!pathData) {
      throw new Error("No path data found");
    }

    console.log(pathData);
    return pathData;
  } catch (error) {
    console.error("Error extracting path from MUI icon:", error);
    return "";
  }
};
