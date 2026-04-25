import { useState } from "react";
import {
  Box,
  Card,
  Checkbox,
  FormControlLabel,
  Grid,
  IconButton,
  Paper,
  Popover,
  Stack,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import EditableImage from "../../EditableImage";
import { useTranslate } from "../../../translation/translate";
import {
  getImageBackground,
  isImageMode,
  HEADER_MIN_HEIGHT,
  IMAGE_COL_MIN_HEIGHT,
} from "./core-utils";

function ImageInfoIcon({ text }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [anchorEl, setAnchorEl] = useState(null);
  if (!text) return null;
  if (isMobile) {
    return (
      <>
        <IconButton
          size="small"
          onClick={(e) => setAnchorEl(e.currentTarget)}
          sx={{ ml: 0.5 }}
        >
          <InfoOutlinedIcon fontSize="inherit" />
        </IconButton>
        <Popover
          open={Boolean(anchorEl)}
          anchorEl={anchorEl}
          onClose={() => setAnchorEl(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          transformOrigin={{ vertical: "top", horizontal: "left" }}
        >
          <Typography sx={{ p: 1.25, maxWidth: 260, fontSize: "0.8rem" }}>
            {text}
          </Typography>
        </Popover>
      </>
    );
  }
  return (
    <Tooltip title={text} placement="top" arrow>
      <IconButton size="small" sx={{ ml: 0.5 }}>
        <InfoOutlinedIcon fontSize="inherit" />
      </IconButton>
    </Tooltip>
  );
}

export function ImageToggleRow({
  showImageToggle,
  imageMode,
  imageVisible,
  setImageVisible,
  showImageTempInfo,
  imageTempInfoText,
  actionContent,
}) {
  const { t } = useTranslate();
  const shouldShowToggle = showImageToggle && imageMode === "slot";
  if (!shouldShowToggle && !actionContent) return null;
  return (
    <Paper
      variant="outlined"
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 1,
        px: 1,
        py: 0.25,
        borderTop: 0,
        borderRadius: "0 0 4px 4px",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", minHeight: 32 }}>
        {actionContent}
      </Box>
      {shouldShowToggle && (
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <FormControlLabel
            sx={{ mr: 0 }}
            control={
              <Checkbox
                checked={imageVisible}
                onChange={(e) => setImageVisible(e.target.checked)}
              />
            }
            label={t("Add Image")}
          />
          {showImageTempInfo && <ImageInfoIcon text={imageTempInfoText} />}
        </Box>
      )}
    </Paper>
  );
}

export function CardWrapper({ showCard, id, children }) {
  if (!showCard) return children;
  return (
    <Card id={id} elevation={1}>
      {children}
    </Card>
  );
}

export function HeaderSpacer({ imageMode, imageSize, imageVisible }) {
  if (!isImageMode(imageMode) || !imageVisible) return null;
  return (
    <Grid
      sx={{
        flex: `0 0 ${imageSize}px`,
        minWidth: `${imageSize}px`,
        minHeight: HEADER_MIN_HEIGHT,
      }}
    />
  );
}

export function RowsWithOptionalImage({
  imageMode,
  imageSize,
  imageVisible,
  imageSlot,
  customTheme,
  children,
}) {
  if (!isImageMode(imageMode) || !imageVisible) return children;
  return (
    <Grid
      container
      sx={{ alignItems: "stretch", minHeight: IMAGE_COL_MIN_HEIGHT }}
    >
      <Grid
        sx={{
          flex: `0 0 ${imageSize}px`,
          width: `${imageSize}px`,
          background: getImageBackground(customTheme),
          borderRight: `1px solid ${customTheme.secondary}`,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          overflow: "hidden",
          alignSelf: "stretch",
        }}
      >
        {imageSlot ?? <EditableImage size={imageSize} />}
      </Grid>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          flexShrink: 1,
          flexBasis: 0,
          minWidth: 0,
        }}
      >
        {children}
      </Box>
    </Grid>
  );
}

export function CardContentWrapper({
  showCard,
  id,
  showImageToggle,
  imageMode,
  imageVisible,
  setImageVisible,
  showImageTempInfo,
  imageTempInfoText,
  actionContent,
  children,
}) {
  return (
    <Stack>
      <CardWrapper showCard={showCard} id={id}>
        <Stack>{children}</Stack>
      </CardWrapper>
      <ImageToggleRow
        showImageToggle={showImageToggle}
        imageMode={imageMode}
        imageVisible={imageVisible}
        setImageVisible={setImageVisible}
        showImageTempInfo={showImageTempInfo}
        imageTempInfoText={imageTempInfoText}
        actionContent={actionContent}
      />
    </Stack>
  );
}
