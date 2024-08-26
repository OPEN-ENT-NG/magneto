import { useCallback } from "react";

import { useToast } from "@edifice-ui/react";

interface UsePredefinedToastsProps {
  func: (...args: any[]) => Promise<any>;
  successMessage?: string;
  failureMessage?: string;
}

export const usePredefinedToasts = ({
  func,
  successMessage,
  failureMessage,
}: UsePredefinedToastsProps) => {
  const toast = useToast();

  const executeFunction = useCallback(
    async (parameter: any) => {
      try {
        await func(parameter);
        toast.success(successMessage || "Operation successful!");
      } catch (error) {
        toast.error(failureMessage || "Operation failed!");
      }
    },
    [func, successMessage, failureMessage, toast],
  );

  return executeFunction;
};
