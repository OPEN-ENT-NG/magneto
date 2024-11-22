import { SxProps } from "@mui/material";

export const bodyModalWrapper: SxProps = {
  display: "flex",
  flexDirection: "column",
  gap: "3rem",
};

export const autocompleteStyles = {
  "& .MuiAutocomplete-input": {
    fontSize: "1.6rem",
  },
  "& .MuiAutocomplete-listbox": {
    fontSize: "1.6rem",
  },
  "& .MuiAutocomplete-clearIndicator .MuiSvgIcon-root": {
    fontSize: "2rem",
  },
  "& .MuiAutocomplete-popupIndicator .MuiSvgIcon-root": {
    fontSize: "2rem",
  },
};

export const autocompleteInputStyles = {
  fontSize: "1.6rem",
};

export const autocompleteLabelStyles = {
  background: "white",
  paddingRight: "7px",
  fontSize: "1.6rem",
};

export const autocompleteOptionStyles = {
  fontSize: "1.6rem",
};
