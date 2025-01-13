// vite.config.ts
import {
  defineConfig,
  loadEnv,
} from "file:///home/node/app/node_modules/.pnpm/vite@4.4.11_@types+node@20.8.5_sass@1.69.5/node_modules/vite/dist/node/index.js";
import react from "file:///home/node/app/node_modules/.pnpm/@vitejs+plugin-react@4.1.0_vite@4.4.11/node_modules/@vitejs/plugin-react/dist/index.mjs";
import tsconfigPaths from "file:///home/node/app/node_modules/.pnpm/vite-tsconfig-paths@4.2.1_typescript@5.2.2_vite@4.4.11/node_modules/vite-tsconfig-paths/dist/index.mjs";
var vite_config_default = ({ mode }) => {
  const envFile = loadEnv(mode, process.cwd());
  const envs = { ...process.env, ...envFile };
  const hasEnvFile = Object.keys(envFile).length;
  const headers = hasEnvFile
    ? {
        "set-cookie": [
          `oneSessionId=${envs.VITE_ONE_SESSION_ID}`,
          `XSRF-TOKEN=${envs.VITE_XSRF_TOKEN}`,
        ],
        "Cache-Control": "public, max-age=300",
      }
    : {};
  const proxyObj = hasEnvFile
    ? {
        target: envs.VITE_RECETTE,
        changeOrigin: true,
        headers: {
          cookie: `oneSessionId=${envs.VITE_ONE_SESSION_ID};authenticated=true; XSRF-TOKEN=${envs.VITE_XSRF_TOKEN}`,
        },
      }
    : {
        target: envs.VITE_LOCALHOST || "http://localhost:8090",
        changeOrigin: false,
      };
  const proxy = {
    "/applications-list": proxyObj,
    "/conf/public": proxyObj,
    "^/(?=help-1d|help-2d)": proxyObj,
    "^/(?=assets)": proxyObj,
    "^/(?=theme|locale|i18n|skin)": proxyObj,
    "^/(?=auth|appregistry|cas|userbook|directory|communication|conversation|portal|session|timeline|workspace|infra)":
      proxyObj,
    "/blog": proxyObj,
    "/explorer": proxyObj,
    todoapp: proxyObj,
    "/magneto": proxyObj,
  };
  const base = mode === "production" ? "/magneto" : "";
  const build = {
    assetsDir: "public",
    rollupOptions: {
      external: ["@edifice.io/client"],
      output: {
        manualChunks: {
          react: [
            "react",
            "react-router-dom",
            "react-dom",
            "react-error-boundary",
            "react-hook-form",
            "react-hot-toast",
          ],
        },
        paths: {
          "@edifice.io/client": "/assets/js/@edifice.io/client/index.js",
        },
      },
    },
  };
  const plugins = [react(), tsconfigPaths()];
  const server = {
    proxy,
    host: "0.0.0.0",
    port: 4200,
    headers,
    open: true,
    strictPort: true,
  };
  const test = {
    globals: true,
    environment: "happy-dom",
    setupFiles: "./src/tests/setup.ts",
  };
  return defineConfig({
    base,
    build,
    plugins,
    server,
    test,
  });
};
export { vite_config_default as default };
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9ub2RlL2FwcFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL2hvbWUvbm9kZS9hcHAvdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2hvbWUvbm9kZS9hcHAvdml0ZS5jb25maWcudHNcIjsvLy8gPHJlZmVyZW5jZSB0eXBlcz1cInZpdGVzdFwiIC8+XG5cbmltcG9ydCB7IGRlZmluZUNvbmZpZywgbG9hZEVudiB9IGZyb20gXCJ2aXRlXCI7XG5pbXBvcnQgcmVhY3QgZnJvbSBcIkB2aXRlanMvcGx1Z2luLXJlYWN0XCI7XG5pbXBvcnQgdHNjb25maWdQYXRocyBmcm9tIFwidml0ZS10c2NvbmZpZy1wYXRoc1wiO1xuXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xuZXhwb3J0IGRlZmF1bHQgKHsgbW9kZSB9OiB7IG1vZGU6IHN0cmluZyB9KSA9PiB7XG4gIC8vIENoZWNraW5nIGVudmlyb25lbWVudCBmaWxlc1xuICBjb25zdCBlbnZGaWxlID0gbG9hZEVudihtb2RlLCBwcm9jZXNzLmN3ZCgpKTtcbiAgY29uc3QgZW52cyA9IHsgLi4ucHJvY2Vzcy5lbnYsIC4uLmVudkZpbGUgfTtcbiAgY29uc3QgaGFzRW52RmlsZSA9IE9iamVjdC5rZXlzKGVudkZpbGUpLmxlbmd0aDtcblxuICAvLyBQcm94eSB2YXJpYWJsZXNcbiAgY29uc3QgaGVhZGVycyA9IGhhc0VudkZpbGVcbiAgICA/IHtcbiAgICAgICAgXCJzZXQtY29va2llXCI6IFtcbiAgICAgICAgICBgb25lU2Vzc2lvbklkPSR7ZW52cy5WSVRFX09ORV9TRVNTSU9OX0lEfWAsXG4gICAgICAgICAgYFhTUkYtVE9LRU49JHtlbnZzLlZJVEVfWFNSRl9UT0tFTn1gLFxuICAgICAgICBdLFxuICAgICAgICBcIkNhY2hlLUNvbnRyb2xcIjogXCJwdWJsaWMsIG1heC1hZ2U9MzAwXCIsXG4gICAgICB9XG4gICAgOiB7fTtcblxuICBjb25zdCBwcm94eU9iaiA9IGhhc0VudkZpbGVcbiAgICA/IHtcbiAgICAgICAgdGFyZ2V0OiBlbnZzLlZJVEVfUkVDRVRURSxcbiAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxuICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgY29va2llOiBgb25lU2Vzc2lvbklkPSR7ZW52cy5WSVRFX09ORV9TRVNTSU9OX0lEfTthdXRoZW50aWNhdGVkPXRydWU7IFhTUkYtVE9LRU49JHtlbnZzLlZJVEVfWFNSRl9UT0tFTn1gLFxuICAgICAgICB9LFxuICAgICAgfVxuICAgIDoge1xuICAgICAgICB0YXJnZXQ6IGVudnMuVklURV9MT0NBTEhPU1QgfHwgXCJodHRwOi8vbG9jYWxob3N0OjgwOTBcIixcbiAgICAgICAgY2hhbmdlT3JpZ2luOiBmYWxzZSxcbiAgICAgIH07XG5cbiAgY29uc3QgcHJveHkgPSB7XG4gICAgXCIvYXBwbGljYXRpb25zLWxpc3RcIjogcHJveHlPYmosXG4gICAgXCIvY29uZi9wdWJsaWNcIjogcHJveHlPYmosXG4gICAgXCJeLyg/PWhlbHAtMWR8aGVscC0yZClcIjogcHJveHlPYmosXG4gICAgXCJeLyg/PWFzc2V0cylcIjogcHJveHlPYmosXG4gICAgXCJeLyg/PXRoZW1lfGxvY2FsZXxpMThufHNraW4pXCI6IHByb3h5T2JqLFxuICAgIFwiXi8oPz1hdXRofGFwcHJlZ2lzdHJ5fGNhc3x1c2VyYm9va3xkaXJlY3Rvcnl8Y29tbXVuaWNhdGlvbnxjb252ZXJzYXRpb258cG9ydGFsfHNlc3Npb258dGltZWxpbmV8d29ya3NwYWNlfGluZnJhKVwiOlxuICAgICAgcHJveHlPYmosXG4gICAgXCIvYmxvZ1wiOiBwcm94eU9iaixcbiAgICBcIi9leHBsb3JlclwiOiBwcm94eU9iaixcbiAgICBcInRvZG9hcHBcIjogcHJveHlPYmosXG4gICAgXCIvbWFnbmV0b1wiOiBwcm94eU9iaixcbiAgfTtcblxuICBjb25zdCBiYXNlID0gbW9kZSA9PT0gXCJwcm9kdWN0aW9uXCIgPyBcIi9tYWduZXRvXCIgOiBcIlwiO1xuXG4gIGNvbnN0IGJ1aWxkID0ge1xuICAgIGFzc2V0c0RpcjogXCJwdWJsaWNcIixcbiAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICBleHRlcm5hbDogW1wiZWRpZmljZS10cy1jbGllbnRcIl0sXG4gICAgICBvdXRwdXQ6IHtcbiAgICAgICAgbWFudWFsQ2h1bmtzOiB7XG4gICAgICAgICAgcmVhY3Q6IFtcbiAgICAgICAgICAgIFwicmVhY3RcIixcbiAgICAgICAgICAgIFwicmVhY3Qtcm91dGVyLWRvbVwiLFxuICAgICAgICAgICAgXCJyZWFjdC1kb21cIixcbiAgICAgICAgICAgIFwicmVhY3QtZXJyb3ItYm91bmRhcnlcIixcbiAgICAgICAgICAgIFwicmVhY3QtaG9vay1mb3JtXCIsXG4gICAgICAgICAgICBcInJlYWN0LWhvdC10b2FzdFwiLFxuICAgICAgICAgIF1cbiAgICAgICAgfSxcbiAgICAgICAgcGF0aHM6IHtcbiAgICAgICAgICBcImVkaWZpY2UtdHMtY2xpZW50XCI6IFwiL2Fzc2V0cy9qcy9lZGlmaWNlLXRzLWNsaWVudC9pbmRleC5qc1wiLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICB9O1xuXG4gIGNvbnN0IHBsdWdpbnMgPSBbcmVhY3QoKSwgdHNjb25maWdQYXRocygpXTtcblxuICBjb25zdCBzZXJ2ZXIgPSB7XG4gICAgcHJveHksXG4gICAgaG9zdDogXCIwLjAuMC4wXCIsXG4gICAgcG9ydDogNDIwMCxcbiAgICBoZWFkZXJzLFxuICAgIG9wZW46IHRydWUsXG4gICAgc3RyaWN0UG9ydDogdHJ1ZVxuICB9O1xuXG4gIGNvbnN0IHRlc3QgPSB7XG4gICAgZ2xvYmFsczogdHJ1ZSxcbiAgICBlbnZpcm9ubWVudDogJ2hhcHB5LWRvbScsXG4gICAgc2V0dXBGaWxlczogJy4vc3JjL3Rlc3RzL3NldHVwLnRzJyxcbiAgfTtcblxuICByZXR1cm4gZGVmaW5lQ29uZmlnKHtcbiAgICBiYXNlLFxuICAgIGJ1aWxkLFxuICAgIHBsdWdpbnMsXG4gICAgc2VydmVyLFxuICAgIHRlc3RcbiAgfSk7XG59O1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUVBLFNBQVMsY0FBYyxlQUFlO0FBQ3RDLE9BQU8sV0FBVztBQUNsQixPQUFPLG1CQUFtQjtBQUcxQixJQUFPLHNCQUFRLENBQUMsRUFBRSxLQUFLLE1BQXdCO0FBRTdDLFFBQU0sVUFBVSxRQUFRLE1BQU0sUUFBUSxJQUFJLENBQUM7QUFDM0MsUUFBTSxPQUFPLEVBQUUsR0FBRyxRQUFRLEtBQUssR0FBRyxRQUFRO0FBQzFDLFFBQU0sYUFBYSxPQUFPLEtBQUssT0FBTyxFQUFFO0FBR3hDLFFBQU0sVUFBVSxhQUNaO0FBQUEsSUFDRSxjQUFjO0FBQUEsTUFDWixnQkFBZ0IsS0FBSyxtQkFBbUI7QUFBQSxNQUN4QyxjQUFjLEtBQUssZUFBZTtBQUFBLElBQ3BDO0FBQUEsSUFDQSxpQkFBaUI7QUFBQSxFQUNuQixJQUNBLENBQUM7QUFFTCxRQUFNLFdBQVcsYUFDYjtBQUFBLElBQ0UsUUFBUSxLQUFLO0FBQUEsSUFDYixjQUFjO0FBQUEsSUFDZCxTQUFTO0FBQUEsTUFDUCxRQUFRLGdCQUFnQixLQUFLLG1CQUFtQixtQ0FBbUMsS0FBSyxlQUFlO0FBQUEsSUFDekc7QUFBQSxFQUNGLElBQ0E7QUFBQSxJQUNFLFFBQVEsS0FBSyxrQkFBa0I7QUFBQSxJQUMvQixjQUFjO0FBQUEsRUFDaEI7QUFFSixRQUFNLFFBQVE7QUFBQSxJQUNaLHNCQUFzQjtBQUFBLElBQ3RCLGdCQUFnQjtBQUFBLElBQ2hCLHlCQUF5QjtBQUFBLElBQ3pCLGdCQUFnQjtBQUFBLElBQ2hCLGdDQUFnQztBQUFBLElBQ2hDLG9IQUNFO0FBQUEsSUFDRixTQUFTO0FBQUEsSUFDVCxhQUFhO0FBQUEsSUFDYixXQUFXO0FBQUEsSUFDWCxZQUFZO0FBQUEsRUFDZDtBQUVBLFFBQU0sT0FBTyxTQUFTLGVBQWUsYUFBYTtBQUVsRCxRQUFNLFFBQVE7QUFBQSxJQUNaLFdBQVc7QUFBQSxJQUNYLGVBQWU7QUFBQSxNQUNiLFVBQVUsQ0FBQyxtQkFBbUI7QUFBQSxNQUM5QixRQUFRO0FBQUEsUUFDTixjQUFjO0FBQUEsVUFDWixPQUFPO0FBQUEsWUFDTDtBQUFBLFlBQ0E7QUFBQSxZQUNBO0FBQUEsWUFDQTtBQUFBLFlBQ0E7QUFBQSxZQUNBO0FBQUEsVUFDRjtBQUFBLFFBQ0Y7QUFBQSxRQUNBLE9BQU87QUFBQSxVQUNMLHFCQUFxQjtBQUFBLFFBQ3ZCO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBRUEsUUFBTSxVQUFVLENBQUMsTUFBTSxHQUFHLGNBQWMsQ0FBQztBQUV6QyxRQUFNLFNBQVM7QUFBQSxJQUNiO0FBQUEsSUFDQSxNQUFNO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTjtBQUFBLElBQ0EsTUFBTTtBQUFBLElBQ04sWUFBWTtBQUFBLEVBQ2Q7QUFFQSxRQUFNLE9BQU87QUFBQSxJQUNYLFNBQVM7QUFBQSxJQUNULGFBQWE7QUFBQSxJQUNiLFlBQVk7QUFBQSxFQUNkO0FBRUEsU0FBTyxhQUFhO0FBQUEsSUFDbEI7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsRUFDRixDQUFDO0FBQ0g7IiwKICAibmFtZXMiOiBbXQp9Cg==
