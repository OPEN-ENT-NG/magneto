import { LoadingScreen, Layout, useOdeClient } from "@edifice-ui/react";
import { Outlet } from "react-router-dom";
function Root() {
  console.log("i am in root with outlet");

  const { init } = useOdeClient();
  console.log("init: ", init);

  if (!init) return <LoadingScreen position={false} />;

  return init ? (
    <Layout>
      <Outlet />
    </Layout>
  ) : null;
}

export default Root;
