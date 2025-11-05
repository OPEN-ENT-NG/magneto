import { useEffect, useState } from "react";

import { odeServices } from "@edifice.io/client";

// Cache en dehors du composant
let cachedIsTheme1D: boolean | null = null;

export const useTheme = () => {
  const [isTheme1D, setIsTheme1D] = useState(cachedIsTheme1D ?? false);

  useEffect(() => {
    if (cachedIsTheme1D !== null) {
      return;
    }

    const getIsTheme1D = async (): Promise<void> => {
      const res = (await odeServices.conf().getConf("")).theme.is1d;
      cachedIsTheme1D = res;
      setIsTheme1D(res);
    };

    void getIsTheme1D();
  }, []);

  return { isTheme1D };
};
