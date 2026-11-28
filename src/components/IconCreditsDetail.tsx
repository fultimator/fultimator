import React from "react";
import { Box, IconButton, Link, Typography } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { useTranslate } from "../translation/translate";
import { isUrl, type IconAsset, type IconAuthor } from "../libs/iconCredits";

const wrapSx = { wordBreak: "break-all" } as const;

export function Preview({
  src,
  alt,
  size,
}: {
  src: string;
  alt: string;
  size: number;
}) {
  const theme = useTheme();
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        aspectRatio: "1",
        borderRadius: 1,
        bgcolor: alpha(theme.palette.text.primary, 0.06),
      }}
    >
      <Box
        component="img"
        src={src}
        alt={alt}
        loading="lazy"
        sx={{ width: size, height: size, objectFit: "contain" }}
      />
    </Box>
  );
}

function LinkOrText({ value }: { value: string }) {
  if (!isUrl(value)) return <>{value}</>;
  return (
    <Link
      href={value}
      target="_blank"
      rel="noreferrer"
      underline="hover"
      sx={wrapSx}
    >
      {value.replace(/^(https?:\/\/(www\.)?|mailto:)/i, "")}
      <OpenInNewIcon
        sx={{ fontSize: "0.9em", ml: 0.5, verticalAlign: "middle" }}
      />
    </Link>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Box sx={{ mb: 1.25 }}>
      <Typography
        variant="caption"
        sx={{
          display: "block",
          color: "text.secondary",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          fontWeight: 600,
        }}
      >
        {label}
      </Typography>
      <Typography variant="body2">{children}</Typography>
    </Box>
  );
}

interface DetailProps {
  asset: IconAsset | null;
  assetAuthor?: IconAuthor;
  filterAuthor?: IconAuthor;
  compact?: boolean;
  onClear?: () => void;
}

export default function IconCreditsDetail({
  asset,
  assetAuthor,
  filterAuthor,
  compact = false,
  onClear,
}: DetailProps) {
  const { t } = useTranslate();
  const hint = (
    <Typography variant="caption" color="text.secondary">
      {t("icon_credits_select_hint")}
    </Typography>
  );

  if (!asset) {
    if (!filterAuthor) return hint;
    const { name, role, notes, link } = filterAuthor;
    return (
      <Box>
        <Typography sx={{ fontWeight: 700 }}>{name}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          {[role, notes].filter(Boolean).join(" · ")}
        </Typography>
        {link && (
          <Row label={t("icon_credits_source")}>
            <LinkOrText value={link} />
          </Row>
        )}
        {hint}
      </Box>
    );
  }

  const artist = assetAuthor?.role
    ? `${asset.author} · ${assetAuthor.role}`
    : asset.author;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: compact ? "row" : "column",
        gap: compact ? 1.5 : 2,
      }}
    >
      <Box sx={{ width: compact ? 64 : 160, flexShrink: 0 }}>
        <Preview src={asset.url} alt={asset.name} size={compact ? 40 : 96} />
      </Box>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography sx={{ fontWeight: 700, ...wrapSx }}>
          {asset.name}
        </Typography>
        {!compact && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mb: 2, ...wrapSx }}
          >
            {asset.path}
          </Typography>
        )}
        <Row label={t("icon_credits_artist")}>{artist}</Row>
        <Row label={t("icon_credits_license")}>
          <LinkOrText value={asset.license} />
        </Row>
        <Row label={t("icon_credits_source")}>
          <LinkOrText value={asset.source} />
        </Row>
      </Box>
      {compact && onClear && (
        <IconButton
          size="small"
          onClick={onClear}
          aria-label={t("Close")}
          sx={{ mt: -0.5, mr: -0.5, alignSelf: "flex-start" }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      )}
    </Box>
  );
}
