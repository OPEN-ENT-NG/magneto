import { describe, expect, it } from "vitest";

import { canViewInOnlyOffice } from "./utils";

const DOCX_CONTENT_TYPE =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

const baseParams = {
  allowOnlyOfficeView: true,
  isExternalView: false,
  hasLoolOpenRight: true,
  providerContext: {
    provider: "OnlyOffice",
    capabilities: [{ "content-type": DOCX_CONTENT_TYPE, extension: "docx" }],
  },
  contentType: DOCX_CONTENT_TYPE,
  extension: "docx",
  canEdit: false,
  isEditDecisionPending: false,
  isDocumentAccessible: true,
};

describe("canViewInOnlyOffice", () => {
  it("returns true when every condition is met", () => {
    expect(canViewInOnlyOffice(baseParams)).toBe(true);
  });

  it.each([
    ["where the viewer is not allowed", { allowOnlyOfficeView: false }],
    ["in an external view", { isExternalView: true }],
    ["without the lool workflow right", { hasLoolOpenRight: false }],
    ["while the right is loading", { hasLoolOpenRight: undefined }],
    ["when the edit button is shown", { canEdit: true }],
    ["while the edit decision is pending", { isEditDecisionPending: true }],
    [
      "when the document is neither owned nor shared",
      { isDocumentAccessible: false },
    ],
    ["when lool is unavailable", { providerContext: null }],
    ["while the provider context is loading", { providerContext: undefined }],
    [
      "when the provider is not OnlyOffice",
      {
        providerContext: {
          ...baseParams.providerContext,
          provider: "LibreOfficeOnline",
        },
      },
    ],
    [
      "when the content-type is not supported",
      { providerContext: { provider: "OnlyOffice", capabilities: [] } },
    ],
    ["when the content-type is unknown", { contentType: undefined }],
    ["for a non office extension", { extension: "pdf" }],
  ])("returns false %s", (_, override) => {
    expect(canViewInOnlyOffice({ ...baseParams, ...override })).toBe(false);
  });
});
