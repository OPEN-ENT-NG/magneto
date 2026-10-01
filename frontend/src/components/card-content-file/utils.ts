import { FILE_EXTENSION } from "~/core/enums/file-extension.enum";
import { LoolProviderContext } from "~/services/api";

export const ONLYOFFICE_PROVIDER = "OnlyOffice";

const OFFICE_EXTENSIONS: string[] = [
  FILE_EXTENSION.DOC,
  FILE_EXTENSION.DOCX,
  FILE_EXTENSION.PPT,
  FILE_EXTENSION.PPTX,
  FILE_EXTENSION.ODT,
  FILE_EXTENSION.ODP,
  FILE_EXTENSION.XLS,
  FILE_EXTENSION.XLSX,
  FILE_EXTENSION.ODS,
];

interface CanViewInOnlyOfficeParams {
  allowOnlyOfficeView: boolean;
  isExternalView: boolean;
  hasLoolOpenRight: boolean | undefined;
  providerContext: LoolProviderContext | null | undefined;
  contentType: string | undefined;
  extension: string;
  canEdit: boolean;
  // true while /canedit is loading or failed: the Edit button may still appear
  isEditDecisionPending: boolean;
  // lool only opens documents the user owns or that are explicitly shared with them,
  // which is what the workspace documents list (filter=all) contains
  isDocumentAccessible: boolean;
}

export const canViewInOnlyOffice = ({
  allowOnlyOfficeView,
  isExternalView,
  hasLoolOpenRight,
  providerContext,
  contentType,
  extension,
  canEdit,
  isEditDecisionPending,
  isDocumentAccessible,
}: CanViewInOnlyOfficeParams): boolean => {
  if (
    !allowOnlyOfficeView ||
    isExternalView ||
    canEdit ||
    isEditDecisionPending ||
    !isDocumentAccessible ||
    !hasLoolOpenRight ||
    !contentType ||
    providerContext?.provider !== ONLYOFFICE_PROVIDER ||
    !OFFICE_EXTENSIONS.includes(extension)
  )
    return false;
  return providerContext.capabilities.some(
    (capability) => capability["content-type"] === contentType,
  );
};
