import { useState, useRef } from "react";
import { Box, ButtonBase, Menu, MenuItem, Typography } from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import StatTooltip from "/src/components/common/StatTooltip";
import {
  BoltIcon,
  DarkIcon,
  EarthIcon,
  FireIcon,
  IceIcon,
  LightIcon,
  PhysicalIcon,
  PoisonIcon,
  AirIcon,
} from "/src/components/icons";
import { useTranslate } from "/src/translation/translate";
// import { typeList } from "../../typeConstants";
const AFFINITY_OPTIONS = [
  { value: "", labelKey: "None", fallback: "None" },
  { value: "rs", labelKey: "Resistance", fallback: "Resistance" },
  { value: "im", labelKey: "Immunity", fallback: "Immunity" },
  { value: "ab", labelKey: "Absorption", fallback: "Absorption" },
  { value: "vu", labelKey: "Vulnerability", fallback: "Vulnerability" },
];

export function TypeName({ type }) {
  const { t } = useTranslate();
  return (
    <>
      {type === "physical" && t("Physical")}
      {type === "air" && t("Air")}
      {type === "bolt" && t("Bolt")}
      {type === "dark" && t("Dark")}
      {type === "earth" && t("Earth")}
      {type === "fire" && t("Fire")}
      {type === "ice" && t("Ice")}
      {type === "light" && t("Light")}
      {type === "poison" && t("Poison")}
    </>
  );
}

export function TypeIcon({ type, disabled, size }) {
  return (
    <>
      {type === "physical" && <PhysicalIcon disabled={disabled} size={size} />}
      {type === "air" && <AirIcon disabled={disabled} size={size} />}
      {type === "bolt" && <BoltIcon disabled={disabled} size={size} />}
      {type === "dark" && <DarkIcon disabled={disabled} size={size} />}
      {type === "earth" && <EarthIcon disabled={disabled} size={size} />}
      {type === "fire" && <FireIcon disabled={disabled} size={size} />}
      {type === "ice" && <IceIcon disabled={disabled} size={size} />}
      {type === "light" && <LightIcon disabled={disabled} size={size} />}
      {type === "poison" && <PoisonIcon disabled={disabled} size={size} />}
    </>
  );
}

export function TypeAffinity({
  type,
  affinity,
  currentAffinity,
  iconSize,
  editable = false,
  onChangeAffinity,
  showDropdownArrow = true,
}) {
  const { t } = useTranslate();
  const rawAffinity = String(affinity ?? "").toLowerCase();
  const normalizedAffinity = rawAffinity === "no" ? "" : rawAffinity;
  const rawCurrent =
    currentAffinity !== undefined
      ? String(currentAffinity).toLowerCase()
      : normalizedAffinity;
  const normalizedCurrent = rawCurrent === "no" ? "" : rawCurrent;
  const disabled = normalizedCurrent === "";
  const value = ["", "rs", "im", "ab", "vu"].includes(normalizedCurrent)
    ? normalizedCurrent
    : "";
  const buttonRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const iconNode = <TypeIcon type={type} disabled={disabled} size={iconSize} />;

  if (!editable) {
    return (
      <StatTooltip
        title={type.charAt(0).toUpperCase() + type.slice(1)}
        base={normalizedAffinity}
        current={normalizedCurrent}
        display="flex"
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 0.5,
          }}
        >
          {iconNode}
          {normalizedAffinity && (
            <Typography
              sx={{
                color: "red.main",
                fontWeight: "bold",
                fontFamily: "Antonio",
                textTransform: "uppercase",
                fontSize: "1.1rem",
                lineHeight: 1,
                letterSpacing: "0.03em",
              }}
            >
              {normalizedAffinity}
            </Typography>
          )}
        </Box>
      </StatTooltip>
    );
  }

  return (
    <StatTooltip
      title={type.charAt(0).toUpperCase() + type.slice(1)}
      base={normalizedAffinity}
      current={normalizedCurrent}
      display="flex"
      sx={{ width: "100%" }}
      disabled={menuOpen}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
        }}
      >
        <ButtonBase
          ref={buttonRef}
          onClick={() => setMenuOpen(true)}
          sx={{
            px: 0.55,
            py: 0.15,
            width: "100%",
            minWidth: 0,
            minHeight: 28,
            borderRadius: 0.75,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 0.45,
            fontFamily: "Antonio",
            fontWeight: "bold",
            textTransform: "uppercase",
            fontSize: "1.05rem",
            lineHeight: 1,
            color: "red.main",
            opacity: value ? 1 : 0.72,
            "&:hover": {
              backgroundColor: "transparent",
            },
          }}
        >
          {iconNode}
          <Typography
            component="span"
            sx={{
              color: "red.main",
              fontWeight: "bold",
              fontFamily: "Antonio",
              textTransform: "uppercase",
              fontSize: "1.05rem",
              lineHeight: 1,
              letterSpacing: "0.03em",
            }}
          >
            {value ? value.toUpperCase() : ""}
          </Typography>
          {showDropdownArrow && (
            <KeyboardArrowDownIcon
              sx={{
                fontSize: "0.95rem",
                color: "text.secondary",
                opacity: 0.9,
                ml: 0.1,
              }}
            />
          )}
        </ButtonBase>
        <Menu
          anchorEl={buttonRef.current}
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          transformOrigin={{ vertical: "top", horizontal: "center" }}
        >
          {AFFINITY_OPTIONS.map((opt) => (
            <MenuItem
              key={opt.value || "none"}
              selected={normalizedAffinity === opt.value}
              onClick={() => {
                onChangeAffinity?.(opt.value);
                setMenuOpen(false);
              }}
            >
              {t(opt.labelKey) === opt.labelKey
                ? opt.fallback
                : t(opt.labelKey)}
            </MenuItem>
          ))}
        </Menu>
      </Box>
    </StatTooltip>
  );
}
