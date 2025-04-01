import React from "react";

import { Box, Typography, Stack } from "@mui/material";
import { useTranslation } from "react-i18next";

import { boxEmptyState, contentEmptyState, titleEmptyState } from "./style";
import { EmptyStateMagneto } from "../SVG/EmptyStateMagneto";

interface EmptyStatePublicProps {
  title: string;
  description?: string;
}

export const EmptyStatePublic: React.FC<EmptyStatePublicProps> = ({
  title,
  description,
}) => {
  const { t } = useTranslation();

  return (
    <Box sx={boxEmptyState}>
      <Box width="35%">
        <EmptyStateMagneto />
      </Box>
      <Stack spacing={1} sx={{ padding: 2 }}>
        <Typography variant="h4" sx={titleEmptyState}>
          {t(title)}
        </Typography>
        {description && (
          <Typography variant="body1" sx={contentEmptyState}>
            {t(description)}
          </Typography>
        )}
      </Stack>
    </Box>
  );
};
