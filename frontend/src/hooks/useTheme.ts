import { odeServices } from "@edifice.io/client";

export const useTheme = () => {
  const isTheme1d = async (): Promise<any> => {
    const res = (await odeServices.conf().getConf("")).theme.is1d;
    return res;
  };

  return { isTheme1d };
};
