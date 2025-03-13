import { FC, useState } from "react";

import { TextField, IconButton, Tooltip } from "@cgi-learning-hub/ui";
import CheckIcon from "@mui/icons-material/Check";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { InputAdornment } from "@mui/material";
import { useTranslation } from "react-i18next";

import { TextFieldWithCopyButtonProps } from "./types";

export const TextFieldWithCopyButton: FC<TextFieldWithCopyButtonProps> = ({
  value,
  label = "Lien",
  readOnly = true,
  hasCopyButton = true,
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
      label={label}
      value={value}
      sx={{
        "& .MuiInputBase-input": {
          fontSize: "1.6rem", // Larger font size for the input value
        },
        "& .MuiInputLabel-root": {
          fontSize: "1.6rem",
          backgroundColor: "white",
        },
      }}
      InputProps={{
        readOnly: readOnly,
        endAdornment:
          !hasCopyButton ||
          value === t("magneto.share.public.input.default") ? null : (
            <InputAdornment position="end">
              <Tooltip
                title={
                  copied
                    ? t("magneto.share.public.input.tooltip.copied")
                    : t("magneto.share.public.input.tooltip.copy")
                }
              >
                <IconButton edge="end" onClick={handleCopy} disabled={!value}>
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
