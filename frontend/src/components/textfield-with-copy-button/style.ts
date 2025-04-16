export const textFieldInputStyles = {
  "& .MuiInputBase-input": {
    fontSize: "1.6rem",
    lineHeight: "2.4rem",
  },
  "& .MuiInputLabel-root": {
    fontSize: "1.6rem",
    backgroundColor: "white",
  },
};

export const largerIconStyles = {
  "& .MuiSvgIcon-root": {
    fontSize: "2rem",
  },
};

export const tooltipComponentsProps = {
  tooltip: {
    sx: {
      fontSize: "1.2rem",
    },
  },
};

// types.ts
export interface TextFieldWithCopyButtonProps {
  value: string;
  label?: string;
  readOnly?: boolean;
  hasCopyButton?: boolean;
  enableLargerIconSize?: boolean;
  isMultiline?: boolean;
}
