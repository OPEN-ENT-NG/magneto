import { FC } from "react";

import { Radio, RadioProps } from "@mui/material";

import { BpCheckedIcon, BpIcon } from "./style";

export const StyledRadio: FC<RadioProps> = (props: RadioProps) => (
  <Radio
    disableRipple
    color="default"
    checkedIcon={<BpCheckedIcon />}
    icon={<BpIcon />}
    {...props}
  />
);
