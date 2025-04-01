import { LoadingScreen, Layout, useEdificeClient } from "@edifice.io/react";
import { Outlet } from "react-router-dom";

import { ErrorBoundary } from "~/components/error-boundary";
import PublicLayout from "~/components/public-layout/PublicLayout";

function Root() {
  console.log("in root");
  const { init } = useEdificeClient();
  console.log("in root");
  if (window.location.hash.includes("/pub/"))
    return (
      <PublicLayout>
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </PublicLayout>
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
