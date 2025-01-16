import { LoadingScreen, Layout, useOdeClient } from "@edifice-ui/react";
import { Outlet } from "react-router-dom";

import { ErrorBoundary } from "~/components/error-boundary";

function Root() {
  const { init } = useOdeClient();

  if (!init) {
    return <LoadingScreen position={false} />;
  }

  return init ? (
    <Layout>
      <ErrorBoundary>
        <Outlet />
      </ErrorBoundary>
    </Layout>
  ) : null;
}

export default Root;
