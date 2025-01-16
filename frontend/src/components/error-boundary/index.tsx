import { Component, ReactNode, useEffect } from "react";

import { useToast } from "@edifice-ui/react";
import { useTranslation } from "react-i18next";
import { Outlet } from "react-router-dom";

const ErrorToast = () => {
  const toast = useToast();
  const { t } = useTranslation("magneto");

  useEffect(() => {
    toast.error(t("explorer.shared.status.error"));
  }, [toast, t]);

  return null;
};

export class ErrorBoundary extends Component<
  { children?: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children?: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error("Caught error:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <>
          <ErrorToast />
          {this.props.children || <Outlet />}
        </>
      );
    }
    return this.props.children || <Outlet />;
  }
}
