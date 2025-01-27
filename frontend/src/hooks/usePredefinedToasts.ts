import { useCallback } from "react";

import { useToast } from "@edifice.io/react";

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
      } catch {
        toast.error(failureMessage || "Operation failed!");
      }
    },
    [func, successMessage, failureMessage, toast],
  );

  return executeFunction;
};
