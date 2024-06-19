import { useToast } from "@edifice-ui/react";

interface UsePredefinedToastsProps {
  func: (...args: any[]) => Promise<any>;
  parameter?: any;
  successMessage?: string;
  failureMessage?: string;
}

export const usePredefinedToasts = ({
  func,
  parameter,
  successMessage,
  failureMessage,
}: UsePredefinedToastsProps) => {
  const toast = useToast();

  const executeFunction = async () => {
    try {
      await func(parameter);
      toast.success(successMessage || "Operation successful!");
    } catch (error) {
      toast.error(failureMessage || "Operation failed!");
    }
  };

  return executeFunction;
};
