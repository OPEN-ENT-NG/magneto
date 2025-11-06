import { useEffect, useState } from "react";

import { ThemeProvider, ThemeProviderProps } from "@cgi-learning-hub/theme";

import { useTheme } from "~/hooks/useTheme";

export const ThemeWrapper: React.FC<{
  children: React.ReactNode;
  themePlatform: ThemeProviderProps["themeId"];
}> = ({ children, themePlatform }) => {
  const { isTheme1D } = useTheme();
  const [theme, setTheme] =
    useState<ThemeProviderProps["themeId"]>(themePlatform);

  useEffect(() => {
    setTheme(isTheme1D ? "ent1D" : themePlatform);
  }, [isTheme1D, themePlatform]);

  return <ThemeProvider themeId={theme ?? "default"}>{children}</ThemeProvider>;
};
