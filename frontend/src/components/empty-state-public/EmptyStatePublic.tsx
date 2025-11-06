import React from "react";

import { Box, Typography, Stack } from "@mui/material";
import { useTranslation } from "react-i18next";

import { boxEmptyState, contentEmptyState, titleEmptyState } from "./style";
import { EmptyStateMagneto } from "../SVG/EmptyStateMagneto";
import { useTheme } from "~/hooks/useTheme";

interface EmptyStatePublicProps {
  title: string;
  description?: string;
}

export const EmptyStatePublic: React.FC<EmptyStatePublicProps> = ({
  title,
  description,
}) => {
  const { t } = useTranslation();
  const { isTheme1D } = useTheme();

  return (
    <Box sx={boxEmptyState}>
      <Box width="35%">
        <EmptyStateMagneto />
      </Box>
      <Stack spacing={1} sx={{ padding: 2 }}>
        <Typography variant="h4" sx={titleEmptyState(isTheme1D)}>
          {t(title)}
        </Typography>
        {description && (
          <Typography variant="body1" sx={contentEmptyState(isTheme1D)}>
            {t(description)}
          </Typography>
        )}
      </Stack>
    </Box>
  );
};
