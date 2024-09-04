import { useState } from "react";

export const useToaster = () => {
  const [isToasterOpen, setIsToasterOpen] = useState<boolean>(false);

  const toasterDisplay = () => {
    setIsToasterOpen(!isToasterOpen);
  };

  return {
    toasterDisplay,
  };
};
