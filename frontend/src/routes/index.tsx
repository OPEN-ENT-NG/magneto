import { QueryClient } from "@tanstack/react-query";
import { createHashRouter, RouteObject } from "react-router-dom";

import Root from "~/app/root";
import "~/styles/index.scss";

const routes = (queryClient: QueryClient): RouteObject[] => [
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
    id: "public-portal",
    path: "/pub/:slug",
    async lazy() {
      const { Component, loader } = await import("./public-portal");
      return {
        loader: loader(queryClient),
        Component,
      };
    },
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

export const router = (queryClient: QueryClient) =>
  createHashRouter(routes(queryClient));
