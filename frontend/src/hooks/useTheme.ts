import { useEffect, useState } from "react";

import { odeServices } from "@edifice.io/client";

export const useTheme = () => {
  const [isTheme1D, setIsTheme1D] = useState(false);

  useEffect(() => {
    const getIsTheme1D = async (): Promise<void> => {
      const res = (await odeServices.conf().getConf("")).theme.is1d;
      setIsTheme1D(res);
    };

    void getIsTheme1D();
  }, []);

  return { isTheme1D };
};
