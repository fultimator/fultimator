import { ToggleButton, ToggleButtonGroup, Tooltip } from "@mui/material";
import PhoneIphone from "@mui/icons-material/PhoneIphone";
import TabletMac from "@mui/icons-material/TabletMac";
import DesktopWindows from "@mui/icons-material/DesktopWindows";

export default function PreviewWidthToggle({ value, onChange, sx }) {
  return (
    <ToggleButtonGroup
      size="small"
      exclusive
      value={value}
      onChange={(_, next) => next && onChange(next)}
      aria-label="Preview width"
      sx={sx}
    >
      <ToggleButton value="phone" aria-label="Phone width">
        <Tooltip title="Phone">
          <PhoneIphone fontSize="small" />
        </Tooltip>
      </ToggleButton>
      <ToggleButton value="tablet" aria-label="Tablet width">
        <Tooltip title="Tablet">
          <TabletMac fontSize="small" />
        </Tooltip>
      </ToggleButton>
      <ToggleButton value="desktop" aria-label="Full width">
        <Tooltip title="Full width">
          <DesktopWindows fontSize="small" />
        </Tooltip>
      </ToggleButton>
    </ToggleButtonGroup>
  );
}
