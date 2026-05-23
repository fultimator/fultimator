import React, { useMemo, useState } from "react";
import {
  Box,
  Button,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Popover,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { Casino } from "@mui/icons-material";
import { t } from "../../../translation/translate";
import {
  CheckAttributeIcon,
  CheckGroupIcon,
  CheckOpenIcon,
  CheckOpposedIcon,
} from "../../icons";

const StandardRollsSection = ({ selectedNPC, calcAttr, handleRoll }) => {
  const attributes = useMemo(
    () => [
      {
        label: "DEX",
        value: calcAttr("Slow", "Enraged", "dexterity", selectedNPC),
      },
      {
        label: "INS",
        value: calcAttr("Dazed", "Enraged", "insight", selectedNPC),
      },
      {
        label: "MIG",
        value: calcAttr("Weak", "Poisoned", "might", selectedNPC),
      },
      {
        label: "WLP",
        value: calcAttr("Shaken", "Poisoned", "will", selectedNPC),
      },
    ],
    [calcAttr, selectedNPC],
  );

  const [selectedAttr1, setSelectedAttr1] = useState(attributes[0].label);
  const [selectedAttr2, setSelectedAttr2] = useState(attributes[1].label);
  const [modifier, setModifier] = useState(0);
  const [quickCheckAnchorEl, setQuickCheckAnchorEl] = useState(null);
  const [quickCheckKind, setQuickCheckKind] = useState("open");
  const [quickCheckDifficultyMode, setQuickCheckDifficultyMode] =
    useState("preset");
  const [quickCheckDifficulty, setQuickCheckDifficulty] = useState(10);
  const [quickCheckCustomDifficulty, setQuickCheckCustomDifficulty] =
    useState("");

  const isQuickCheckPopoverOpen = Boolean(quickCheckAnchorEl);

  const quickCheckSx = {
    borderRadius: 1.2,
    px: 0.9,
    py: 0.7,
    justifyContent: "center",
    alignItems: "center",
    color: "text.primary",
    border: "1px solid",
    borderColor: "divider",
    backgroundColor: "background.paper",
    width: "100%",
    minHeight: 82,
    "&:hover": {
      backgroundColor: "action.hover",
    },
  };

  const openQuickCheckPopover = (event, kind) => {
    setQuickCheckKind(kind);
    setQuickCheckAnchorEl(event.currentTarget);
  };

  const closeQuickCheckPopover = () => {
    setQuickCheckAnchorEl(null);
  };

  const submitQuickCheck = () => {
    const parsedCustomDl = Number.parseInt(quickCheckCustomDifficulty, 10);
    const resolvedDifficulty =
      quickCheckKind === "attribute"
        ? quickCheckDifficultyMode === "custom"
          ? Number.isFinite(parsedCustomDl)
            ? parsedCustomDl
            : undefined
          : quickCheckDifficulty
        : undefined;

    handleRoll(
      attributes.find((attr) => attr.label === selectedAttr1).value,
      attributes.find((attr) => attr.label === selectedAttr2).value,
      selectedAttr1,
      selectedAttr2,
      Number(modifier) || 0,
      quickCheckKind,
      resolvedDifficulty,
    );
    closeQuickCheckPopover();
  };

  const quickCheckButtons = [
    { key: "group", title: "Group Check", icon: <CheckGroupIcon size="2.1em" />, l1: "Group", l2: "Check" },
    { key: "attribute", title: "Attribute Check", icon: <CheckAttributeIcon size="2.1em" />, l1: "Attribute", l2: "Check" },
    { key: "open", title: "Open Check", icon: <CheckOpenIcon size="2.1em" />, l1: "Open", l2: "Check" },
    { key: "opposed", title: "Opposed Check", icon: <CheckOpposedIcon size="2.1em" />, l1: "Opposed", l2: "Check" },
  ];

  return (
    <>
      <Box sx={{ py: 1, px: 1.25 }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(4, minmax(0,1fr))" },
            gap: 1,
          }}
        >
          {quickCheckButtons.map((item) => (
            <Tooltip key={item.key} title={item.title}>
              <IconButton
                size="small"
                onClick={(e) => openQuickCheckPopover(e, item.key)}
                sx={quickCheckSx}
              >
                <Box
                  sx={{
                    display: "inline-flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 0.35,
                    textAlign: "center",
                  }}
                >
                  <Box sx={{ display: "inline-flex" }}>{item.icon}</Box>
                  <Typography
                    variant="caption"
                    sx={{ lineHeight: 1.05, fontWeight: 700 }}
                  >
                    {t(item.l1)}
                    <br />
                    {t(item.l2)}
                  </Typography>
                </Box>
              </IconButton>
            </Tooltip>
          ))}
        </Box>
      </Box>

      <Popover
        open={isQuickCheckPopoverOpen}
        anchorEl={quickCheckAnchorEl}
        onClose={closeQuickCheckPopover}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        transformOrigin={{ vertical: "bottom", horizontal: "center" }}
        slotProps={{
          paper: {
            sx: {
              overflow: "visible",
              mb: 0.5,
              "&::after": {
                content: '""',
                display: "block",
                position: "absolute",
                bottom: 0,
                left: "50%",
                width: 12,
                height: 12,
                backgroundColor: "background.paper",
                transform: "translate(-50%, 50%) rotate(45deg)",
                borderBottom: "1px solid",
                borderRight: "1px solid",
                borderColor: "divider",
                zIndex: 0,
              },
            },
          },
        }}
      >
        <Box sx={{ p: 1.5, minWidth: 280, maxWidth: 340 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
            {t("Roll Check")}
          </Typography>
          <Stack spacing={1}>
            <Stack direction="row" spacing={1}>
              <FormControl fullWidth size="small">
                <InputLabel id="npc-quick-check-primary-label">{t("Attr 1")}</InputLabel>
                <Select
                  labelId="npc-quick-check-primary-label"
                  label={t("Attr 1")}
                  value={selectedAttr1}
                  onChange={(e) => setSelectedAttr1(e.target.value)}
                >
                  {attributes.map((attr) => (
                    <MenuItem key={`npc-qc-primary-${attr.label}`} value={attr.label}>
                      {t(attr.label)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth size="small">
                <InputLabel id="npc-quick-check-secondary-label">{t("Attr 2")}</InputLabel>
                <Select
                  labelId="npc-quick-check-secondary-label"
                  label={t("Attr 2")}
                  value={selectedAttr2}
                  onChange={(e) => setSelectedAttr2(e.target.value)}
                >
                  {attributes.map((attr) => (
                    <MenuItem key={`npc-qc-secondary-${attr.label}`} value={attr.label}>
                      {t(attr.label)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>

            <TextField
              size="small"
              type="number"
              label={t("Modifier")}
              value={modifier}
              onChange={(e) => setModifier(e.target.value)}
            />

            {quickCheckKind === "attribute" && (
              <>
                <FormControl fullWidth size="small">
                  <InputLabel id="npc-quick-check-difficulty-mode-label">
                    {t("Difficulty")}
                  </InputLabel>
                  <Select
                    labelId="npc-quick-check-difficulty-mode-label"
                    label={t("Difficulty")}
                    value={quickCheckDifficultyMode}
                    onChange={(e) => setQuickCheckDifficultyMode(e.target.value)}
                  >
                    <MenuItem value="preset">{t("Preset")}</MenuItem>
                    <MenuItem value="custom">{t("Custom DL")}</MenuItem>
                  </Select>
                </FormControl>

                {quickCheckDifficultyMode === "preset" ? (
                  <FormControl fullWidth size="small">
                    <InputLabel id="npc-quick-check-difficulty-value-label">
                      {t("DL")}
                    </InputLabel>
                    <Select
                      labelId="npc-quick-check-difficulty-value-label"
                      label={t("DL")}
                      value={quickCheckDifficulty}
                      onChange={(e) => setQuickCheckDifficulty(e.target.value)}
                    >
                      {[7, 10, 13, 16].map((dl) => (
                        <MenuItem key={`npc-qc-dl-${dl}`} value={dl}>
                          {dl}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                ) : (
                  <TextField
                    size="small"
                    type="number"
                    label={t("Custom DL")}
                    value={quickCheckCustomDifficulty}
                    onChange={(e) => setQuickCheckCustomDifficulty(e.target.value)}
                  />
                )}
              </>
            )}

            <Button
              variant="contained"
              onClick={submitQuickCheck}
              endIcon={<Casino fontSize="small" />}
            >
              {t("Roll")}
            </Button>
          </Stack>
        </Box>
      </Popover>
    </>
  );
};

export default StandardRollsSection;
