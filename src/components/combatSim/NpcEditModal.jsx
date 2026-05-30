import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Box,
  Paper,
  Grid,
  Tabs,
  Tab,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  useTheme,
  useMediaQuery,
  Divider,
} from "@mui/material";
import { Save, Menu as MenuIcon } from "@mui/icons-material";
import { useDatabase } from "../../hooks/useDatabase";
import { NpcProvider } from "../../components/npc/NpcContext";
import {
  applyNpcPostLoadTransforms,
  applyNpcPreSaveTransforms,
} from "../../libs/actor";
import EditBasics from "../../components/npc/EditBasics";
import EditAffinities from "../../components/npc/EditAffinities";
import EditExtra from "../../components/npc/EditExtra";
import EditAttacks from "../../components/npc/EditAttacks";
import EditWeaponAttacks from "../../components/npc/EditWeaponAttacks";
import EditSpells from "../../components/npc/EditSpells";
import EditActions from "../../components/npc/EditActions";
import EditSpecial from "../../components/npc/EditSpecial";
import EditRareGear from "../../components/npc/EditRareGear";
import EditNotes from "../../components/npc/EditNotes";
import ExplainAffinities from "../../components/npc/ExplainAffinities";
import ExplainSkills from "../../components/npc/ExplainSkills";
import CustomHeader from "../../components/common/CustomHeader";
import NpcActorCard from "../../components/shared/actors/npc/NpcActorCard";
import { useTranslate } from "../../translation/translate";
import { globalConfirm } from "../../utility/globalConfirm";
import { calcAvailableSkills, calcUsedSkills } from "../../libs/npcs";
import deepEqual from "deep-equal";

const SECTIONS = [
  { id: "npc-modal-basics", label: "Basic Information" },
  { id: "npc-modal-affinities", label: "Affinities & Bonuses" },
  { id: "npc-modal-attacks", label: "Attacks" },
  { id: "npc-modal-spells", label: "Spells" },
  { id: "npc-modal-actions", label: "Other Actions" },
  { id: "npc-modal-special", label: "Special Rules" },
  { id: "npc-modal-raregear", label: "Rare Equipment" },
  { id: "npc-modal-notes", label: "Notes" },
];

export default function NpcEditModal({ npcId, open, onClose, onSaved }) {
  const { t } = useTranslate();
  const theme = useTheme();
  const secondary = theme.palette.secondary.main;
  const isSmallScreen = useMediaQuery("(max-width: 899px)");
  const isSideBySide = useMediaQuery("(min-width: 1200px)");

  const isLocalNpc =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      npcId ?? "",
    );

  const localDb = useDatabase("local");
  const cloudDb = useDatabase("cloud");
  const db = isLocalNpc ? localDb : cloudDb;

  const [npcTemp, setNpcTemp] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isUpdated, setIsUpdated] = useState(false);
  const [baselineRef, setBaselineRef] = useState(null);
  const [tab, setTab] = useState(0);
  const [navAnchor, setNavAnchor] = useState(null);
  const contentRef = useRef(null);

  useEffect(() => {
    if (!open || !npcId) return;
    setTab(0);
    setLoading(true);
    setNpcTemp(null);
    setIsUpdated(false);
    db.getDoc(db.doc("npc-personal", npcId))
      .then((data) => {
        if (!data) return;
        const normalized = applyNpcPostLoadTransforms(
          JSON.parse(JSON.stringify(data)),
        );
        setNpcTemp(normalized);
        setBaselineRef(
          applyNpcPreSaveTransforms(JSON.parse(JSON.stringify(normalized))),
        );
      })
      .finally(() => setLoading(false));
  }, [open, npcId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!npcTemp || !baselineRef) return;
    const current = applyNpcPreSaveTransforms(
      JSON.parse(JSON.stringify(npcTemp)),
    );
    setIsUpdated(!deepEqual(current, baselineRef));
  }, [npcTemp, baselineRef]);

  const handleSave = useCallback(async () => {
    if (!npcTemp) return;
    const toSave = applyNpcPreSaveTransforms(
      JSON.parse(JSON.stringify(npcTemp)),
    );
    await db.setDoc(db.doc("npc-personal", npcId), toSave);
    setIsUpdated(false);
    setBaselineRef(toSave);
    onSaved?.(npcTemp);
    onClose();
  }, [db, npcId, npcTemp, onSaved, onClose]);

  const handleClose = useCallback(async () => {
    if (isUpdated) {
      const confirmed = await globalConfirm(
        "You have unsaved changes. Are you sure you want to close?",
      );
      if (!confirmed) return;
    }
    onClose();
  }, [isUpdated, onClose]);

  const scrollToSection = (sectionId) => {
    setNavAnchor(null);
    // On narrow viewports switch to editor tab first
    if (!isSideBySide) setTab(0);
    // Small delay lets hidden→visible paint before scroll
    requestAnimationFrame(() => {
      const el = contentRef.current?.querySelector(`#${sectionId}`);
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const available = npcTemp ? calcAvailableSkills(npcTemp) : 0;
  const used = npcTemp ? calcUsedSkills(npcTemp) : 0;
  const spOver = used > available;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      fullScreen={isSmallScreen}
      paperprops={{ sx: { height: isSmallScreen ? "100%" : "90vh" } }}
    >
      <DialogTitle sx={{ borderBottom: "none" }}>
        {npcTemp?.name ?? t("Edit NPC")}
      </DialogTitle>

      {/* Tab bar row with SP chip + nav menu on the right */}
      <Box
        className="MuiDialogTitle-root"
        sx={{
          px: 3,
          py: 0,
          borderBottom: 1,
          borderColor: "divider",
          display: "flex",
          alignItems: "center",
        }}
      >
        {!isSideBySide ? (
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            sx={{
              flex: 1,
              background: "transparent",
              boxShadow: "none",
              border: "none",
            }}
          >
            <Tab label={t("Editor")} />
            <Tab label={t("Preview")} />
          </Tabs>
        ) : (
          <Box sx={{ flex: 1 }} />
        )}

        {/* SP tracker chip */}
        {npcTemp && (
          <Tooltip title={t("Skill Points: used / available")}>
            <Chip
              label={`SP ${used} / ${available}`}
              size="small"
              color={spOver ? "error" : "default"}
              variant={spOver ? "filled" : "outlined"}
              sx={{ mr: 1, fontFamily: "Antonio", fontWeight: 700 }}
            />
          </Tooltip>
        )}

        {/* Section nav menu */}
        <Tooltip title={t("Jump to section")}>
          <span>
            <IconButton
              size="small"
              disabled={!npcTemp}
              onClick={(e) => setNavAnchor(e.currentTarget)}
            >
              <MenuIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
        <Menu
          anchorEl={navAnchor}
          open={Boolean(navAnchor)}
          onClose={() => setNavAnchor(null)}
        >
          {SECTIONS.map((s) => (
            <MenuItem key={s.id} onClick={() => scrollToSection(s.id)}>
              {t(s.label)}
            </MenuItem>
          ))}
        </Menu>
      </Box>

      <DialogContent
        dividers
        sx={{ overflowY: "auto", px: 0 }}
        ref={contentRef}
      >
        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {!loading && npcTemp && (
          <NpcProvider npcData={npcTemp}>
            {isSideBySide ? (
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  alignItems: "flex-start",
                  px: 3,
                }}
              >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <EditorPanels
                    npcTemp={npcTemp}
                    setNpcTemp={setNpcTemp}
                    secondary={secondary}
                    isSmallScreen={isSmallScreen}
                    t={t}
                  />
                </Box>
                <Divider orientation="vertical" flexItem />
                <Box sx={{ width: 360, flexShrink: 0 }}>
                  <PreviewPanel npcTemp={npcTemp} />
                </Box>
              </Box>
            ) : (
              <>
                <Box hidden={tab !== 0} sx={{ px: 3 }}>
                  <EditorPanels
                    npcTemp={npcTemp}
                    setNpcTemp={setNpcTemp}
                    secondary={secondary}
                    isSmallScreen={isSmallScreen}
                    t={t}
                  />
                </Box>
                <Box hidden={tab !== 1} sx={{ px: 3 }}>
                  <PreviewPanel npcTemp={npcTemp} />
                </Box>
              </>
            )}
          </NpcProvider>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>{t("Close")}</Button>
        <Button
          variant="contained"
          startIcon={<Save />}
          onClick={handleSave}
          disabled={!isUpdated || loading}
        >
          {t("Save")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function EditorPanels({ npcTemp, setNpcTemp, secondary, isSmallScreen, t }) {
  return (
    <>
      <Paper
        id="npc-modal-basics"
        elevation={3}
        sx={{
          p: "15px",
          borderRadius: "8px",
          border: "2px solid",
          borderColor: secondary,
          mb: 2,
        }}
      >
        <EditBasics npc={npcTemp} setNpc={setNpcTemp} />
      </Paper>

      <Paper
        id="npc-modal-affinities"
        elevation={3}
        sx={{
          p: "15px",
          borderRadius: "8px",
          border: "2px solid",
          borderColor: secondary,
          mb: 2,
        }}
      >
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <CustomHeader
              type="top"
              headerText={t("Affinity")}
              showIconButton={false}
            />
            <ExplainAffinities npc={npcTemp} />
            <EditAffinities npc={npcTemp} setNpc={setNpcTemp} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <CustomHeader
              type={isSmallScreen ? "middle" : "top"}
              headerText={t("Bonuses")}
              showIconButton={false}
            />
            <EditExtra npc={npcTemp} setNpc={setNpcTemp} />
          </Grid>
        </Grid>
      </Paper>

      <Paper
        id="npc-modal-attacks"
        elevation={3}
        sx={{
          p: "15px",
          borderRadius: "8px",
          border: "2px solid",
          borderColor: secondary,
          mb: 2,
        }}
      >
        <Grid container>
          <Grid size={12}>
            <EditAttacks npc={npcTemp} setNpc={setNpcTemp} />
          </Grid>
          <Grid size={12}>
            <EditWeaponAttacks npc={npcTemp} setNpc={setNpcTemp} />
          </Grid>
        </Grid>
      </Paper>

      <Paper
        id="npc-modal-spells"
        elevation={3}
        sx={{
          p: "15px",
          borderRadius: "8px",
          border: "2px solid",
          borderColor: secondary,
          mb: 2,
        }}
      >
        <EditSpells npc={npcTemp} setNpc={setNpcTemp} />
      </Paper>

      <Paper
        elevation={3}
        sx={{
          p: "15px",
          borderRadius: "8px",
          border: "2px solid",
          borderColor: secondary,
          mb: 2,
        }}
      >
        <Grid container spacing={2}>
          <Grid id="npc-modal-actions" size={{ xs: 12, md: 6 }}>
            <EditActions npc={npcTemp} setNpc={setNpcTemp} />
          </Grid>
          <Grid id="npc-modal-special" size={{ xs: 12, md: 6 }}>
            <EditSpecial npc={npcTemp} setNpc={setNpcTemp} />
          </Grid>
          <Grid id="npc-modal-raregear" size={{ xs: 12, md: 6 }}>
            <EditRareGear npc={npcTemp} setNpc={setNpcTemp} />
          </Grid>
          <Grid id="npc-modal-notes" size={{ xs: 12, md: 6 }}>
            <EditNotes npc={npcTemp} setNpc={setNpcTemp} />
          </Grid>
        </Grid>
      </Paper>
    </>
  );
}

function PreviewPanel({ npcTemp }) {
  return (
    <>
      <NpcActorCard
        npc={npcTemp}
        npcImage={npcTemp.imgurl}
        collapse={true}
        variant="interactive"
      />
      <Box sx={{ mt: 2 }}>
        <ExplainSkills npc={npcTemp} />
      </Box>
    </>
  );
}
