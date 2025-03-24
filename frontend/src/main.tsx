import React from "react";

import "@edifice.io/bootstrap/dist/index.css";
import { ThemeProvider } from "@cgi-learning-hub/theme";
import { EdificeClientProvider, EdificeThemeProvider } from "@edifice.io/react";
import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { RouterProvider } from "react-router-dom";

import { MediaLibraryProvider } from "./providers/MediaLibraryProvider";
import { router } from "./routes";
import { setupStore } from "./store";
import "~/i18n";

const rootElement = document.getElementById("root");
const root = createRoot(rootElement!);

if (process.env.NODE_ENV !== "production") {
  import("@axe-core/react").then((axe) => {
    axe.default(React, root, 1000);
  });
}
const store = setupStore();

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error: unknown) => {
      if (error === "0090" || undefined) {
        if (!window.location.hash.includes("/pub/")) {
          window.location.replace("/auth/login");
        }
      }
    },
  }),
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5,
    },
  },
});

root.render(
  <QueryClientProvider client={queryClient}>
    <Provider store={store}>
      <EdificeClientProvider
        params={{
          app: "magneto",
        }}
      >
        <EdificeThemeProvider>
          <ThemeProvider themeId="crna">
            <MediaLibraryProvider>
              <RouterProvider router={router} />
            </MediaLibraryProvider>
          </ThemeProvider>
        </EdificeThemeProvider>
      </EdificeClientProvider>
    </Provider>
    <ReactQueryDevtools initialIsOpen={false} />
  </QueryClientProvider>,
);
