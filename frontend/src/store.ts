import { combineReducers, configureStore } from "@reduxjs/toolkit";
import type { PreloadedState } from "@reduxjs/toolkit";

import { emptySplitApi } from "./services/api/emptySplitApi.service";
import { emptySplitDirectory } from "./services/api/emptySplitDirectory";
import { emptySplitWorkspace } from "./services/api/emptySplitWorkspace";

const rootReducer = combineReducers({
  [emptySplitApi.reducerPath]: emptySplitApi.reducer,
  [emptySplitWorkspace.reducerPath]: emptySplitWorkspace.reducer,
  [emptySplitDirectory.reducerPath]: emptySplitDirectory.reducer,
});

export const setupStore = (preloadedState?: PreloadedState<RootState>) => {
  return configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware()
        .concat(emptySplitApi.middleware)
        .concat(emptySplitWorkspace.middleware)
        .concat(emptySplitDirectory.middleware),
    preloadedState,
  });
};

export type RootState = ReturnType<typeof rootReducer>;
export type AppStore = ReturnType<typeof setupStore>;
export type AppDispatch = AppStore["dispatch"];
