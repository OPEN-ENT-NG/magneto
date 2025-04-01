import { Component, ReactNode, useEffect } from "react";

import { useToast } from "@edifice.io/react";
import { useTranslation } from "react-i18next";
import { Outlet } from "react-router-dom";

const ErrorToast = ({ errorMessage }: { errorMessage?: string }) => {
  const toast = useToast();
  const { t } = useTranslation("magneto");

  useEffect(() => {
    toast.error(errorMessage || t("explorer.shared.status.error"));
  }, [toast, t, errorMessage]);

  return null;
};

export class ErrorBoundary extends Component<
  { children?: ReactNode },
  { hasError: boolean; errorInfo?: Error }
> {
  constructor(props: { children?: ReactNode }) {
    super(props);
    this.state = {
      hasError: false,
      errorInfo: undefined,
    };
  }

  static getDerivedStateFromError(error: Error) {
    return {
      hasError: true,
      errorInfo: error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Logging multiple ways for comprehensive debugging
    console.error("Caught Error:", error);
    console.error("Error Details:", errorInfo);

    // Optional: Send error to your error tracking service
    // trackErrorToService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <>
          <ErrorToast errorMessage={this.state.errorInfo?.message} />
          {this.props.children || <Outlet />}
        </>
      );
    }
    return this.props.children || <Outlet />;
  }
}
