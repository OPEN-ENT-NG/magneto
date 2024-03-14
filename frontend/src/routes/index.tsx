import { createBrowserRouter } from "react-router-dom";

import Root from "~/app/root";
import ErrorPage from "~/components/page-error";
import "~/styles/index.scss";

const routes = [
  {
    path: "/",
    element: <Root />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        async lazy() {
          const { App } = await import("./app");
          return {
            Component: App,
          };
        },
      },
      {
        path: "info",
        async lazy() {
          const { App } = await import("./info");
          return {
            Component: App,
          };
        },
      },
      {
        path: "user",
        async lazy() {
          const { App } = await import("./user");
          return {
            Component: App,
          };
        },
      },
    ],
  },
];

export const router = createBrowserRouter(routes, {
  basename: import.meta.env.PROD ? "/todoapp" : "/",
});
