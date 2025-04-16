import { FC, useState } from "react";

import { TextField, IconButton, Tooltip } from "@cgi-learning-hub/ui";
import CheckIcon from "@mui/icons-material/Check";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { InputAdornment } from "@mui/material";
import { useTranslation } from "react-i18next";

import {
  textFieldInputStyles,
  largerIconStyles,
  tooltipComponentsProps,
} from "./style";
import { TextFieldWithCopyButtonProps } from "./types";

export const TextFieldWithCopyButton: FC<TextFieldWithCopyButtonProps> = ({
  value,
  label = "Lien",
  readOnly = true,
  hasCopyButton = true,
  largerCopy = false,
  isMultiline = false,
}) => {
  const [copied, setCopied] = useState(false);
  const { t } = useTranslation("magneto");
  const handleCopy = () => {
    navigator.clipboard
      .writeText(value || "")
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((error) => {
        console.error("Failed to copy text: ", error);
      });
  };

  return (
    <TextField
      fullWidth
      multiline={isMultiline}
      label={label}
      value={value}
      sx={textFieldInputStyles}
      InputProps={{
        readOnly: readOnly,
        endAdornment:
          !hasCopyButton ||
          value === t("magneto.share.public.input.default") ? null : (
            <InputAdornment
              position="end"
              sx={largerCopy ? largerIconStyles : undefined}
            >
              <Tooltip
                placement="top"
                arrow={true}
                title={
                  copied
                    ? t("magneto.share.public.input.tooltip.copied")
                    : t("magneto.share.public.input.tooltip.copy")
                }
                componentsProps={tooltipComponentsProps}
              >
                <IconButton edge="end" onClick={handleCopy} disabled={false}>
                  {copied ? (
                    <CheckIcon color="success" />
                  ) : (
                    <ContentCopyIcon color="primary" />
                  )}
                </IconButton>
              </Tooltip>
            </InputAdornment>
          ),
      }}
    />
  );
};
