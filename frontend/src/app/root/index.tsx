import { LoadingScreen, Layout, useEdificeClient } from "@edifice.io/react";
import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";

import { mainStyle } from "./style";
import { ErrorBoundary } from "~/components/error-boundary";

function Root() {
  const { init } = useEdificeClient();
  if (window.location.hash.includes("/pub/"))
    return (
      <>
        <header
          className="header no-1d"
          style={{ backgroundColor: "red", height: "52px" }}
        ></header>
        <Box sx={mainStyle}>
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </Box>
      </>
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
