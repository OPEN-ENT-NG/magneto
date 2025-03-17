import { LoadingScreen, Layout, useEdificeClient } from "@edifice.io/react";
import { Outlet } from "react-router-dom";

import { ErrorBoundary } from "~/components/error-boundary";

function Root() {
  const { init } = useEdificeClient();
  if (window.location.hash.includes("/pub/"))
    return (
      <ErrorBoundary>
        <Outlet />
      </ErrorBoundary>
    );
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
