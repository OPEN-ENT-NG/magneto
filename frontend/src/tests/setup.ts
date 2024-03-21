import { cleanup } from "@testing-library/react";
import { expect, afterEach } from "vitest";
import { vi } from "vitest";
import * as matchers from "vitest-dom/matchers";

export * from "react-router-dom";

export const useRouteError = vi.fn(() => ({
  error: null,
  setError: vi.fn(),
}));
// extends Vitest's expect method with methods from react-testing-library
expect.extend(matchers);

// runs a cleanup after each test case
afterEach(() => {
  cleanup();
});
