import { css } from "@emotion/react";

export const folderTitleWrapper = (position: "start" | "middle" | "end") => css`
  box-sizing: border-box;
  width: 100%;
  display: flex;
  justify-content: ${position === "start"
    ? "flex-start"
    : position === "middle"
    ? "center"
    : "flex-end"};
`;

export const elementWrapper = css`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

export const SVGWrapper = css`
  width: 20px;
  height: 20px;
  color: #5b6472;
`;

export const textStyle = css`
  font-size: 20px;
  font-family: "roboto";
  line-height: 23px;
  color: #5b6472;
`;
