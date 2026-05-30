import React, { useCallback } from "react";
import { Add, Remove } from "@mui/icons-material";
import {
  FormControl,
  Grid,
  IconButton,
  TextField,
  useTheme,
  Paper,
  Button,
  InputAdornment,
  Snackbar,
} from "@mui/material";
import { useTranslate } from "/src/translation/translate";
import CustomTextarea from "/src/components/common/CustomTextarea";
import CustomHeader from "/src/components/common/CustomHeader";
import ExpIcon from "/src/components/svgs/exp.svg?react";
import ExpDisabledIcon from "/src/components/svgs/exp_disabled.svg?react";
import { Code } from "@mui/icons-material";

const zenitIcon = "/assets/icons/resources/zenit.png";
const fpBorderlessIcon = "/assets/icons/resources/fp_borderless.png";

export default function EditPlayerBasics({
  player,
  setPlayer,
  updateMaxStats,
  isEditMode,
  advancement,
  onLevelUpRequest,
}) {
  const { t } = useTranslate();
  const theme = useTheme();
  const secondary = theme.palette.secondary.main;

  const [imgUrlTemp, setImgUrlTemp] = React.useState(player.info.imgurl);

  const [isImageError, setIsImageError] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");
  const [open, setOpen] = React.useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  const onChange = useCallback(
    (key) => (e) => {
      setPlayer((prevState) => ({
        ...prevState,
        [key]: e.target.value,
      }));
    },
    [setPlayer],
  );

  const onChangeInfo = useCallback(
    (key) => (value) => {
      setPlayer((prevState) => ({
        ...prevState,
        info: {
          ...prevState.info,
          [key]: value,
        },
      }));
    },
    [setPlayer],
  );

  const checkImageSize = useCallback(async (imageUrl) => {
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        setIsImageError(true);
        setErrorMessage(
          `Failed to fetch image: ${response.status} ${response.statusText}`,
        );
        throw new Error(
          `Failed to fetch image: ${response.status} ${response.statusText}`,
        );
      }
      const blob = await response.blob();
      if (blob.size > 5 * 1024 * 1024) {
        // 5MB
        setIsImageError(true);
        setErrorMessage("Error: Image size is too large, max 5MB");
        return false;
      } else {
        setIsImageError(false);
        setErrorMessage("");
        return true;
      }
    } catch (error) {
      console.error("Error: ", error);
      setIsImageError(true);
      setErrorMessage(`Error: ${error.message}`);
    }
  }, []);

  return (
    <Paper
      elevation={3}
      sx={{
        p: "15px",
        borderRadius: "8px",
        border: "2px solid",
        borderColor: secondary,
      }}
    >
      <Grid container spacing={2}>
        <Grid size={12}>
          <CustomHeader
            type="top"
            headerText={t("Basic Information")}
            addItem={() => console.log(player)}
            icon={Code}
            customTooltip="Console.log Player Object"
          />
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 4,
          }}
        >
          <FormControl variant="standard" fullWidth>
            <TextField
              id="name"
              label={t("Name") + ":"}
              value={player.name}
              onChange={onChange("name")}
              slotProps={{
                input: {
                  readOnly: !isEditMode,
                },

                htmlInput: { maxLength: 50 },
              }}
            />
          </FormControl>
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 4,
          }}
        >
          <FormControl variant="standard" fullWidth>
            <TextField
              id="pronouns"
              label={t("Pronouns") + ":"}
              value={player.info.pronouns}
              onChange={(e) => onChangeInfo("pronouns")(e.target.value)}
              slotProps={{
                input: {
                  readOnly: !isEditMode,
                },

                htmlInput: { maxLength: 15 },
              }}
            />
          </FormControl>
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 4,
          }}
        >
          <EditPlayerLevel
            player={player}
            setPlayer={setPlayer}
            isEditMode={isEditMode}
            updateMaxStats={updateMaxStats}
            advancement={advancement}
          />
        </Grid>
        <Grid size={12}>
          <FormControl variant="standard" fullWidth>
            <CustomTextarea
              id="description"
              label={t("Description") + ":"}
              value={player.info.description}
              onChange={(e) => onChangeInfo("description")(e.target.value)}
              readOnly={!isEditMode}
              maxRows={10}
              maxLength={5000}
            />
          </FormControl>
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 4,
          }}
        >
          <FormControl variant="standard" fullWidth>
            <TextField
              id="fabulapoints"
              label={t("Fabula Points") + ":"}
              value={player.info.fabulapoints.toString()}
              onChange={(e) => {
                const value = e.target.value;
                if (
                  value === "" ||
                  (/^\d+$/.test(value) && +value >= 0 && +value <= 9999)
                ) {
                  onChangeInfo("fabulapoints")(
                    value === "" ? 0 : parseInt(value, 10),
                  );
                }
              }}
              onBlur={(e) => {
                let value = parseInt(e.target.value, 10);
                if (isNaN(value) || value < 0) {
                  value = 0;
                } else if (value > 9999) {
                  value = 9999;
                }
                onChangeInfo("fabulapoints")(value);
              }}
              type="number"
              slotProps={{
                input: {
                  readOnly: !isEditMode,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton>
                        <img
                          src={fpBorderlessIcon}
                          alt="FP"
                          style={{
                            width: "36px",
                            height: "26px",
                            objectFit: "contain",
                          }}
                        />
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
          </FormControl>
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 4,
          }}
        >
          <FormControl variant="standard" fullWidth>
            <TextField
              id="exp"
              label={t("Exp") + ":"}
              value={player.info.exp.toString()}
              onChange={(e) => {
                const value = e.target.value;
                if (
                  value === "" ||
                  (/^\d+$/.test(value) && +value >= 0 && +value <= 9999)
                ) {
                  onChangeInfo("exp")(value === "" ? 0 : parseInt(value, 10));
                }
              }}
              onBlur={(e) => {
                let value = parseInt(e.target.value, 10);
                if (isNaN(value) || value < 0) {
                  value = 0;
                }
                onChangeInfo("exp")(value);
              }}
              type="number"
              slotProps={{
                input: {
                  readOnly: !isEditMode,
                  endAdornment: (
                    <ExpAdornment
                      exp={player.info.exp}
                      onLevelUpRequest={onLevelUpRequest}
                    />
                  ),
                },
              }}
            />
          </FormControl>
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 4,
          }}
        >
          <FormControl variant="standard" fullWidth>
            <TextField
              id="zenit"
              label={t("Zenit") + ":"}
              value={player.info.zenit.toString()}
              onChange={(e) => {
                const value = e.target.value;
                if (
                  value === "" ||
                  (/^\d+$/.test(value) && +value >= 0 && +value <= 99999999)
                ) {
                  onChangeInfo("zenit")(value === "" ? 0 : parseInt(value, 10));
                }
              }}
              type="number"
              slotProps={{
                input: {
                  readOnly: !isEditMode,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton>
                        <img
                          src={zenitIcon}
                          alt="Zenit"
                          style={{ width: "28px", height: "28px" }}
                        />
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
          </FormControl>
        </Grid>
        {isEditMode ? (
          <>
            <Grid
              size={{
                xs: 12,
                sm: 8,
              }}
            >
              <TextField
                id="imgurl"
                label={t("Image URL") + ":"}
                value={imgUrlTemp}
                onChange={(e) => {
                  setImgUrlTemp(e.target.value);
                  setIsImageError(false);
                  setErrorMessage("");
                }}
                fullWidth
                error={imgUrlTemp.length > 0 && isImageError}
                helperText={
                  isImageError && imgUrlTemp.length > 0 ? errorMessage : null
                }
              />
            </Grid>
            <Grid
              size={{
                xs: 6,
                sm: 2,
              }}
            >
              <Button
                variant="contained"
                onClick={() => {
                  checkImageSize(imgUrlTemp).then((result) => {
                    if (result) {
                      setPlayer((prevState) => {
                        const newState = { ...prevState };
                        newState.info.imgurl = imgUrlTemp;
                        return newState;
                      });
                      setOpen(true);
                    } else {
                      console.log("Error on uploading image");
                    }
                  });
                }}
                sx={{ height: "56px", width: "100%" }}
              >
                {t("Update Image")}
              </Button>
              <Snackbar
                open={open}
                autoHideDuration={3000}
                onClose={handleClose}
                message={t("Image uploaded successfully!")}
              />
            </Grid>
            <Grid
              size={{
                xs: 6,
                sm: 2,
              }}
            >
              <Button
                variant="outlined"
                onClick={() => {
                  setImgUrlTemp("");
                  setIsImageError(false);
                  setErrorMessage("");
                  setPlayer((prevState) => {
                    const newState = { ...prevState };
                    newState.info.imgurl = "";
                    return newState;
                  });
                }}
                sx={{ height: "56px", width: "100%" }}
              >
                {t("Remove Image")}
              </Button>
            </Grid>
          </>
        ) : null}
      </Grid>
    </Paper>
  );
}

function EditPlayerLevel({
  player,
  setPlayer,
  isEditMode,
  updateMaxStats,
  advancement,
}) {
  const { t } = useTranslate();
  const MIN_LEVEL = 5;
  const MAX_LEVEL = 50;
  const [levelInput, setLevelInput] = React.useState(String(player.lvl ?? ""));

  React.useEffect(() => {
    setLevelInput(String(player.lvl ?? ""));
  }, [player.lvl]);

  const normalizeLevel = React.useCallback(
    (value) => {
      const parsed = Number(value);
      if (!Number.isFinite(parsed)) return player.lvl;
      return Math.min(MAX_LEVEL, Math.max(MIN_LEVEL, Math.round(parsed)));
    },
    [player.lvl],
  );

  const commitLevel = React.useCallback(() => {
    if (!isEditMode || advancement) {
      setLevelInput(String(player.lvl ?? ""));
      return;
    }
    const next = normalizeLevel(levelInput);
    setLevelInput(String(next));
    setPlayer((prevState) => ({ ...prevState, lvl: next }));
    updateMaxStats();
  }, [
    advancement,
    isEditMode,
    levelInput,
    normalizeLevel,
    player.lvl,
    setPlayer,
    updateMaxStats,
  ]);

  const onRaiseLevel = () => {
    setPlayer((prevState) => {
      if (prevState.lvl >= MAX_LEVEL) return prevState;
      return { ...prevState, lvl: prevState.lvl + 1 };
    });
    updateMaxStats();
  };

  const onLowerLevel = () => {
    setPlayer((prevState) => {
      if (prevState.lvl <= MIN_LEVEL) return prevState;
      return { ...prevState, lvl: prevState.lvl - 1 };
    });
    updateMaxStats();
  };

  return (
    <FormControl variant="standard" fullWidth>
      <TextField
        id="level"
        label={t("Level") + ":"}
        sx={{ width: "100%" }}
        value={levelInput}
        type="number"
        onChange={(e) => setLevelInput(e.target.value)}
        onBlur={commitLevel}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            commitLevel();
          }
        }}
        slotProps={{
          htmlInput: {
            min: MIN_LEVEL,
            max: MAX_LEVEL,
            step: 1,
          },
          input: {
            readOnly: !isEditMode || advancement,
            startAdornment: (
              <IconButton
                aria-label="decrease level"
                edge="start"
                onClick={onLowerLevel}
                disabled={!isEditMode}
              >
                <Remove />
              </IconButton>
            ),
            endAdornment: (
              <IconButton
                aria-label="increase level"
                edge="end"
                onClick={onRaiseLevel}
                disabled={!isEditMode || advancement}
              >
                <Add />
              </IconButton>
            ),
          },
        }}
      />
    </FormControl>
  );
}

function ExpAdornment({ exp, onLevelUpRequest }) {
  const canLevelUp = exp >= 10;

  return (
    <InputAdornment position="end">
      <IconButton
        onClick={onLevelUpRequest}
        disabled={!canLevelUp}
        sx={{
          animation: canLevelUp ? "flash 1s infinite" : "none",
        }}
      >
        {canLevelUp ? (
          <ExpIcon style={{ width: "28px", height: "28px" }} />
        ) : (
          <ExpDisabledIcon style={{ width: "28px", height: "28px" }} />
        )}
      </IconButton>
    </InputAdornment>
  );
}
