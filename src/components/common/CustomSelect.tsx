import React from "react";
import { Select, SelectProps } from "@mui/material";

type CustomSelectProps = SelectProps & { readOnly?: boolean };

const CustomSelect: React.FC<CustomSelectProps> = ({
  readOnly = false,
  onOpen,
  children,
  sx,
  ...props
}) => {
  const readOnlySx = readOnly
    ? {
        pointerEvents: "none",
        "& .MuiSelect-icon": { display: "none" },
        ...((sx as object) ?? {}),
      }
    : sx;

  return (
    <Select {...props} onOpen={readOnly ? undefined : onOpen} sx={readOnlySx}>
      {children}
    </Select>
  );
};

export default CustomSelect;
