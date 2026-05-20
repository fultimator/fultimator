import React, { useCallback, useState } from "react";
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
} from "@mui/material";
import { useTranslate } from "../../../translation/translate";
import CustomTextarea from "../../common/CustomTextarea";
import CustomHeader from "../../common/CustomHeader";
import ZenitIcon from "../../svgs/zenit.svg?react";
import ExpIcon from "../../svgs/exp.svg?react";
import ExpDisabledIcon from "../../svgs/exp_disabled.svg?react";
import FabulaIcon from "../../svgs/fabula.svg?react";
import { Code } from "@mui/icons-material";
import ReactMarkdown from "react-markdown";
import Confetti from "react-confetti";
import useLevelUpFlow from "../common/hooks/useLevelUpFlow";
import {
  canLevelUpFromExp as canLevelUpFromExpCheck,
  applyExpLevelUp,
} from "../common/levelUpLogic";

export default function EditPlayerBasics({
  player,
  setPlayer,
  updateMaxStats,
  isEditMode,
  advancement,
}) {
  const { t } = useTranslate();
  const theme = useTheme();
  const secondary = theme.palette.secondary.main;

  const [imgUrlTemp, setImgUrlTemp] = React.useState(player.info.imgurl);

  const [isImageError, setIsImageError] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");
  const [open, setOpen] = React.useState(false);

  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiSize, setConfettiSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });

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

  const handleLevelUp = () => {
    setShowConfetti(true);
  };

  const handleCloseLevelUp = () => {
    setShowConfetti(false);
  };

  React.useEffect(() => {
    const onResize = () =>
      setConfettiSize({ width: window.innerWidth, height: window.innerHeight });
    onResize();
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
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
                        <FabulaIcon style={{ width: "28px", height: "28px" }} />
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
                      isEditMode={isEditMode}
                      player={player}
                      setPlayer={setPlayer}
                      onLevelUp={handleLevelUp}
                      onCloseLevelUp={handleCloseLevelUp}
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
                        <ZenitIcon style={{ width: "28px", height: "28px" }} />
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
      {showConfetti && (
        <Confetti
          width={confettiSize.width}
          height={confettiSize.height}
          style={{ position: "fixed", top: 0, left: 0, pointerEvents: "none" }}
        />
      )}
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

function ExpAdornment({
  exp,
  isEditMode,
  player,
  setPlayer,
  onLevelUp,
  onCloseLevelUp,
}) {
  const {
    levelUpDialogOpen,
    levelUpCelebrationOpen,
    openLevelUpDialog,
    closeLevelUpDialog,
    closeCelebration,
    confirmLevelUp,
  } = useLevelUpFlow();
  const { t } = useTranslate();

  const handleExpClick = () => {
    if (canLevelUpFromExpCheck(player) && isEditMode) {
      openLevelUpDialog();
    }
  };

  const handleLevelUpConfirm = () =>
    confirmLevelUp(() => {
      if (!canLevelUpFromExpCheck(player)) return false;
      setPlayer((prevPlayer) => applyExpLevelUp(prevPlayer));
      onLevelUp();
      return true;
    });

  const handleClose = () => {
    closeLevelUpDialog();
    closeCelebration();
    onCloseLevelUp();
  };

  return (
    <>
      <InputAdornment position="end">
        <IconButton
          onClick={handleExpClick}
          sx={{
            animation: exp >= 10 ? "flash 1s infinite" : "none",
            cursor: exp >= 10 && isEditMode ? "pointer" : "default",
          }}
          disabled={!isEditMode}
        >
          {exp >= 10 ? (
            <ExpIcon
              style={{
                width: "28px",
                height: "28px",
                color: "gold",
              }}
            />
          ) : (
            <ExpDisabledIcon
              style={{
                width: "28px",
                height: "28px",
                color: "gray",
              }}
            />
          )}
        </IconButton>
      </InputAdornment>
      <Dialog
        open={levelUpDialogOpen}
        onClose={handleClose}
        slotProps={{
          paper: {
            sx: {
              width: "80%",
              maxWidth: "md",
            },
          },
        }}
      >
        <DialogTitle variant="h3" sx={{ fontWeight: "bold" }}>
          {t("Level Up Confirmation")}
        </DialogTitle>
        <DialogContent>
          <p>{t("Do you want to use 10 EXP to level up?")}</p>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={handleClose} color="error">
            {t("Cancel")}
          </Button>
          <Button
            variant="contained"
            onClick={handleLevelUpConfirm}
            color="primary"
          >
            {t("Level Up")}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={levelUpCelebrationOpen}
        onClose={handleClose}
        slotProps={{
          paper: {
            sx: {
              width: "80%",
              maxWidth: "lg",
            },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: "bold", fontSize: "1.5rem" }}>
          {t("New Level Reached!")}
        </DialogTitle>
        <DialogContent>
          <ul>
            <li>
              <ReactMarkdown>
                {t(
                  "You may change your character's **Identity** and/or **Theme**.",
                )}
              </ReactMarkdown>
            </li>
            <li>
              <ReactMarkdown>
                {t(
                  "Your maximum **Hit Points** and **Mind Points** has increased by **one** point each. Note that this does **not** affect your current Hit Points and Mind Points.",
                )}
              </ReactMarkdown>
            </li>
            {(player.lvl === 20 || player.lvl === 40) && (
              <li>
                <ReactMarkdown>
                  {t("You reached LVL") +
                    " **" +
                    player.lvl +
                    "**. " +
                    t(
                      "You may choose one of your **Attributes** and increase its base die size by one step, up to a maximum of **d12**.",
                    )}
                </ReactMarkdown>
              </li>
            )}
            <li>
              <ReactMarkdown>
                {t(
                  "You may increase the level of one of your character's Classes by one, or you gain your first level in a Class you didn't already have.",
                )}
              </ReactMarkdown>
            </li>
          </ul>

          <Typography>
            {t(
              "There are, however, two important limitations when leveling up:",
            )}
          </Typography>
          <ul>
            <li>
              <ReactMarkdown>
                {t(
                  "You can never have more than ten levels in a Class. Once you put the tenth level in a Class, that Class has been **mastered** (which grants you a **Heroic Skill**) and you can no longer invest levels into it.",
                )}
              </ReactMarkdown>
            </li>
            <li>
              <ReactMarkdown>
                {t(
                  player?.settings?.optionalRules?.technospheres
                    ? "You can never have more than **three non-mastered innate Classes**. To diversify further, master an innate Class first, or invest levels into a Mnemosphere Class instead."
                    : "You can never have more than **three non-mastered Classes**. If you want to further diversify your character, you must first master some of the Classes you acquired.",
                )}
              </ReactMarkdown>
            </li>
          </ul>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={handleClose} color="primary">
            {t("OK")}
          </Button>
        </DialogActions>
      </Dialog>
      <style>
        {`
          @keyframes flash {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
          }
        `}
      </style>
    </>
  );
}
