import { createHashRouter } from "react-router-dom";

import Root from "~/app/root";
import "~/styles/index.scss";

const routes = [
  {
    path: "/",
    element: <Root />,
    children: [
      {
        index: true,
        async lazy() {
          const { App } = await import("./app");
          return { Component: App };
        },
      },
    ],
  },
  {
    path: "info",
    element: <Root />,
    children: [
      {
        index: true,
        async lazy() {
          const { App } = await import("./info");
          return { Component: App };
        },
      },
    ],
  },
  {
    path: "/user",
    element: <Root />,
    children: [
      {
        index: true,
        async lazy() {
          const { App } = await import("./user");
          return { Component: App };
        },
      },
    ],
  },
  {
    path: "/board/:id",
    element: <Root />,
    children: [
      {
        path: "view",
        async lazy() {
          const { App } = await import("./board");
          return { Component: App };
        },
      },
      {
        path: "read",
        async lazy() {
          const { App } = await import("./read");
          return { Component: App };
        },
      },
    ],
  },
  {
    path: "/pub/:id",
    element: <Root />,
    children: [
      {
        index: true,
        async lazy() {
          const { App } = await import("./board-public");
          return { Component: App };
        },
      },
      {
        path: "read",
        async lazy() {
          const { App } = await import("./read-public");
          return { Component: App };
        },
      },
    ],
  },
];

export const router = createHashRouter(routes);
