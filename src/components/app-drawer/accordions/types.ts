import type { Theme } from "@mui/material";
import type { ThemeCustomization } from "../../../themes/themeCustomization";

export interface AccordionProps {
  getProfileHighlightSx: (
    profiles: string[],
  ) => Record<string, string | number>;
  getAccordionSummarySx: (
    name: string,
  ) => (theme: Theme) => Record<string, string | number | boolean>;
  isAccordionActive: (name: string) => boolean;
  tempSliderValues: Record<string, number>;
  createSliderHandler: (key: keyof ThemeCustomization) => {
    onChange: (event: Event, value: number | number[]) => void;
    onChangeCommitted: (
      event: React.SyntheticEvent | Event,
      value: number | number[],
    ) => void;
  };
}
