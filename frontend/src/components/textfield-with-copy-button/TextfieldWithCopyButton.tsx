import { FC, useState } from "react";

import CheckIcon from "@mui/icons-material/Check";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { TextField, InputAdornment, IconButton, Tooltip } from "@mui/material";
import { useTranslation } from "react-i18next";

import { TextFieldWithCopyButtonProps } from "./types";
import { typographyStyle } from "~/common/ShareModal/style";

export const TextFieldWithCopyButton: FC<TextFieldWithCopyButtonProps> = ({
  value,
  label = "Lien",
  disabled = true,
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
      disabled={disabled}
      label={label}
      value={value}
      InputProps={{
        style: typographyStyle,
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
                  {copied ? <CheckIcon color="success" /> : <ContentCopyIcon />}
                </IconButton>
              </Tooltip>
            </InputAdornment>
          ),
      }}
    />
  );
};
