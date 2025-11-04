import { useEffect, useState } from "react";

import { ThemeProvider, ThemeProviderProps } from "@cgi-learning-hub/theme";

import { useTheme } from "~/hooks/useTheme";

export const ThemeWrapper: React.FC<{
  children: React.ReactNode;
  themePlatform: ThemeProviderProps["themeId"];
}> = ({ children, themePlatform }) => {
  const { isTheme1d } = useTheme();
  const [theme, setTheme] =
    useState<ThemeProviderProps["themeId"]>(themePlatform);

  useEffect(() => {
    isTheme1d().then((is1d: boolean) => {
      setTheme(is1d ? "ent1D" : themePlatform);
    });
  }, []);

  return <ThemeProvider themeId={theme ?? "default"}>{children}</ThemeProvider>;
};
