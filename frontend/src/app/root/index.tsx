import { LoadingScreen, Layout, useEdificeClient } from "@edifice-ui/react";
import { Outlet } from "react-router-dom";
function Root() {
  const { init } = useEdificeClient();

  if (!init) return <LoadingScreen position={false} />;

  return init ? (
    <Layout>
      <Outlet />
    </Layout>
  ) : null;
}

export default Root;
