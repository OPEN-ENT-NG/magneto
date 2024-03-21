import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import { App } from "~/routes/user/index.tsx";

describe("App user Test", () => {
  it("Rendering User index component page should render", () => {
    // Render your component within a BrowserRouter since we have <Link> attribute
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>,
    );
    expect(screen.getByText("coucou je suis user")).toBeInTheDocument();
  });
});
