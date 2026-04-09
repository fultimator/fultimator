import { useState, useRef, useEffect } from "react";
import HelpFeedbackDialog from "../../components/appbar/HelpFeedbackDialog";
import DeleteConfirmationDialog from "../../components/common/DeleteConfirmationDialog";
import MigrationDialog from "../../components/common/MigrationDialog";
import { playerNeedsMigration, applyPreSaveTransforms, applyPostLoadTransforms } from "../../components/player/playerTransforms";
import SystemUpdateAltIcon from "@mui/icons-material/SystemUpdateAlt";
import { useNavigate } from "react-router-dom";

import {
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu as MuiMenu,
  Skeleton,
  Tooltip,
  Typography,
  Grid,
  Snackbar,
  Paper,
  TextField,
  Button,
  InputAdornment,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Collapse,
  ToggleButtonGroup,
  ToggleButton,
  Fab,
} from "@mui/material";
import Layout from "../../components/Layout";
import { SignIn } from "../../components/auth";
import {
  ContentCopy,
  ContentPaste,
  Delete,
  Download,
  DriveFileMove,
  FileCopy,
  LibraryAddCheck,
  Share,
  Edit,
  HistoryEdu,
  Badge,
  BugReport,
} from "@mui/icons-material";
import StorageIcon from "@mui/icons-material/Storage";
import CloudIcon from "@mui/icons-material/Cloud";
import { useTranslate } from "../../translation/translate";
import PlayerCardGallery from "../../components/player/playerSheet/PlayerCardGallery";
import Export from "../../components/Export";
import SearchIcon from "@mui/icons-material/Search";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { validateCharacter } from "../../utility/validateJson";
import { SUPPORTS_LOCAL_DB, IS_ELECTRON } from "../../platform";
import DriveSync from "../../components/DriveSync";
import { useDatabaseContext } from "../../context/DatabaseContext";
import { useDatabase } from "../../hooks/useDatabase";
import JSZip from "jszip";
import useDownload from "../../hooks/useDownload";

export default function PlayerGallery() {
  const { authLoading, dbMode } = useDatabaseContext();

  return (
    <Layout>
      {authLoading && <Skeleton />}
      {!authLoading && <Personal key={dbMode} />}
    </Layout>
  );
}

function Personal() {
  const { t } = useTranslate();
  const [name, setName] = useState("");
  const [direction, setDirection] = useState("ascending");
  const [open, setOpen] = useState(false);
  const [isBugDialogOpen, setIsBugDialogOpen] = useState(false);

  // Deletion confirmation states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [playerToDelete, setPlayerToDelete] = useState(null);
  const [isBulkDelete, setIsBulkDelete] = useState(false);

  const navigate = useNavigate();

  const fileInputRef = useRef(null);

  const [showScrollTop, setShowScrollTop] = useState(false);
  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const { dbMode, requestModeSwitch, cloudUser, activeUid } = useDatabaseContext();
  const db = useDatabase();
  const localDb = useDatabase("local");
  const cloudDb = useDatabase("cloud");
  const [download] = useDownload();

  const [personalList, loading, err] = db.useCollectionData(
    db.query(db.collection("player-personal"))
  );

  if (err?.code === "quota-exceeded") {
    return (
      <Paper elevation={3} sx={{ marginBottom: 5, padding: 4 }}>
        {t(
          "Apologies, fultimator has reached its read quota at the moment, please try again tomorrow. (Around 12-24 hours)"
        )}
      </Paper>
    );
  }

  const filteredList = personalList
    ? personalList
        .filter((item) => {
          if (name !== "" && !item.name.toLowerCase().includes(name.toLowerCase()))
            return false;
          return true;
        })
        .sort((item1, item2) => {
          if (direction === "ascending") {
            return item1.name.localeCompare(item2.name);
          } else {
            return item2.name.localeCompare(item1.name);
          }
        })
    : [];

  const addPlayer = async function () {
    const data = {
      name: "-",
      lvl: 5,
      info: {
        pronouns: "",
        identity: "",
        theme: "",
        origin: "",
        bonds: [],
        description: "",
        fabulapoints: 3,
        exp: 0,
        zenit: 0,
        imgurl: "",
      },
      attributes: {
        dexterity: 8,
        insight: 8,
        might: 8,
        willpower: 8,
      },
      stats: {
        hp: { max: 45, current: 45 },
        mp: { max: 45, current: 45 },
        ip: { max: 6, current: 6 },
      },
      statuses: {
        slow: false,
        dazed: false,
        enraged: false,
        weak: false,
        shaken: false,
        poisoned: false,
        dexUp: false,
        insUp: false,
        migUp: false,
        wlpUp: false,
      },
      immunities: {
        slow: false,
        dazed: false,
        enraged: false,
        weak: false,
        shaken: false,
        poisoned: false,
      },
      classes: [],
      weapons: [
        {
          base: {
            category: "Brawling",
            name: "Unarmed Strike",
            cost: 0,
            att1: "dexterity",
            att2: "might",
            prec: 0,
            damage: 0,
            type: "physical",
            hands: 1,
            melee: true,
            martial: false,
          },
          name: "Unarmed Strike",
          category: "Brawling",
          melee: true,
          ranged: false,
          type: "physical",
          hands: 1,
          att1: "dexterity",
          att2: "might",
          martial: false,
          damageBonus: false,
          damageReworkBonus: false,
          precBonus: false,
          rework: false,
          quality: "",
          qualityCost: 0,
          totalBonus: 0,
          selectedQuality: "",
          cost: 0,
          damage: 0,
          prec: 0,
          damageModifier: 0,
          precModifier: 0,
          defModifier: 0,
          mDefModifier: 0,
          initModifier: 0,
          magicModifier: 0,
          damageMeleeModifier: 0,
          damageRangedModifier: 0,
          isEquipped: true,
        },
      ],
      armor: [],
      notes: [],
      modifiers: {
        hp: 0,
        mp: 0,
        ip: 0,
        def: 0,
        mdef: 0,
        init: 0,
        meleePrec: 0,
        rangedPrec: 0,
        magicPrec: 0,
      },
    };

    try {
      const res = await db.addDoc(db.collection("player-personal"), data);
      console.debug(res);
    } catch (e) {
      console.debug(e);
    }
  };

  const handleFileUpload = async (jsonData) => {
    try {
      // Apply post-load transforms to normalize legacy formats (equipment nesting, skill names, etc.)
      let data = applyPostLoadTransforms(jsonData);

      if (!validateCharacter(data)) {
        console.error("Invalid character data.");
        alert(t("Invalid character JSON data."));
        return;
      }

      delete data.id;
      data.uid = activeUid;
      data.published = false;

      // Apply pre-save transforms to strip runtime-only flags before initial save
      data = applyPreSaveTransforms(data);

      const res = await db.addDoc(db.collection("player-personal"), data);
      console.debug("Document added with ID: ", res.id);
    } catch (error) {
      console.error("Error uploading PC from JSON:", error);
    }
  };

  const handlePastePlayer = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const jsonData = JSON.parse(text);
      await handleFileUpload(jsonData);
    } catch (err) {
      console.error("Failed to parse clipboard content:", err);
      alert(t("Could not parse clipboard content as JSON."));
    }
  };

  const exportSelectedAsJson = async () => {
    const selected = filteredList.filter((p) => selectedIds.has(p.id));
    const zip = new JSZip();
    selected.forEach((player) => {
      const jsonData = JSON.stringify(player, null, 2);
      zip.file(`${(player.name || "player").replace(/\s/g, "_").toLowerCase()}.json`, jsonData);
    });
    const zipBlob = await zip.generateAsync({ type: "blob" });
    download(URL.createObjectURL(zipBlob), "players.zip");
  };

  const [snackMsg, setSnackMsg] = useState(null);
  const notify = (msg) => setSnackMsg(msg);

  const uniqueName = (name, existingNames) => {
    const s = new Set(existingNames);
    if (!s.has(name)) return name;
    const base = `${name} (Copy)`;
    if (!s.has(base)) return base;
    let i = 2;
    while (s.has(`${name} (Copy ${i})`)) i++;
    return `${name} (Copy ${i})`;
  };

  const copyPlayerToLocal = (player) => async () => {
    try {
      const existing = await localDb.getDocs(localDb.query(localDb.collection("player-personal")));
      const existingNames = existing.map((n) => n.name);
      const newName = uniqueName(player.name, existingNames);
      const data = { ...player, name: newName, uid: "local-user", published: false };
      delete data.id;
      await localDb.addDoc(localDb.collection("player-personal"), data);
      notify(t("Copied to Local"));
    } catch { notify(t("Failed to copy to Local")); }
  };

  const copyPlayerToCloud = (player) => async () => {
    if (!cloudUser) { notify(t("Sign in to copy to Cloud")); return; }
    try {
      const existing = await cloudDb.getDocs(cloudDb.query(cloudDb.collection("player-personal")));
      const existingNames = existing.map((n) => n.name);
      const newName = uniqueName(player.name, existingNames);
      const data = { ...player, name: newName, published: false };
      delete data.id;
      await cloudDb.addDoc(cloudDb.collection("player-personal"), data);
      notify(t("Copied to Cloud"));
    } catch { notify(t("Failed to copy to Cloud")); }
  };

  const movePlayerToLocal = (player) => async () => {
    try {
      const existing = await localDb.getDocs(localDb.query(localDb.collection("player-personal")));
      const existingNames = existing.map((n) => n.name);
      const newName = uniqueName(player.name, existingNames);
      const data = { ...player, name: newName, uid: "local-user", published: false };
      delete data.id;
      await localDb.addDoc(localDb.collection("player-personal"), data);
      await db.deleteDoc(db.doc("player-personal", player.id));
      notify(t("Moved to Local"));
    } catch { notify(t("Failed to move to Local")); }
  };

  const movePlayerToCloud = (player) => async () => {
    if (!cloudUser) { notify(t("Sign in to move to Cloud")); return; }
    try {
      const existing = await cloudDb.getDocs(cloudDb.query(cloudDb.collection("player-personal")));
      const existingNames = existing.map((n) => n.name);
      const newName = uniqueName(player.name, existingNames);
      const data = { ...player, name: newName, published: false };
      delete data.id;
      await cloudDb.addDoc(cloudDb.collection("player-personal"), data);
      await db.deleteDoc(db.doc("player-personal", player.id));
      notify(t("Moved to Cloud"));
    } catch { notify(t("Failed to move to Cloud")); }
  };

  // ── Migration ────────────────────────────────────────────────────────────────
  const [migrationDialogOpen, setMigrationDialogOpen] = useState(false);
  const stalePlayers = (personalList ?? []).filter(playerNeedsMigration);

  const handleMigrateAllPlayers = async (actors) => {
    for (const player of actors) {
      const ref = db.doc("player-personal", player.id);
      const migrated = applyPostLoadTransforms(player);
      await db.setDoc(ref, applyPreSaveTransforms(migrated));
    }
  };

  // ── Select mode ──────────────────────────────────────────────────────────────
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [copyAnchor, setCopyAnchor] = useState(null);
  const [moveAnchor, setMoveAnchor] = useState(null);

  const toggleSelectMode = () => {
    setSelectMode((prev) => {
      if (prev) setSelectedIds(new Set());
      return !prev;
    });
  };

  const toggleSelectPlayer = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const deleteSelected = async () => {
    setIsBulkDelete(true);
    setDeleteDialogOpen(true);
  };

  const copySelectedToLocal = async () => {
    const selected = filteredList.filter((p) => selectedIds.has(p.id));
    if (!selected.length) return;
    try {
      const existing = await localDb.getDocs(localDb.query(localDb.collection("player-personal")));
      const usedNames = existing.map((n) => n.name);
      for (const p of selected) {
        const newName = uniqueName(p.name, usedNames);
        usedNames.push(newName);
        const data = { ...p, name: newName, uid: "local-user", published: false };
        delete data.id;
        await localDb.addDoc(localDb.collection("player-personal"), data);
      }
      notify(t("Copied to Local"));
    } catch { notify(t("Failed to copy to Local")); }
  };

  const copySelectedToCloud = async () => {
    if (!cloudUser) { notify(t("Sign in to copy to Cloud")); return; }
    const selected = filteredList.filter((p) => selectedIds.has(p.id));
    if (!selected.length) return;
    try {
      const existing = await cloudDb.getDocs(cloudDb.query(cloudDb.collection("player-personal")));
      const usedNames = existing.map((n) => n.name);
      for (const p of selected) {
        const newName = uniqueName(p.name, usedNames);
        usedNames.push(newName);
        const data = { ...p, name: newName, published: false };
        delete data.id;
        await cloudDb.addDoc(cloudDb.collection("player-personal"), data);
      }
      notify(t("Copied to Cloud"));
    } catch { notify(t("Failed to copy to Cloud")); }
  };

  const moveSelectedToLocal = async () => {
    const selected = filteredList.filter((p) => selectedIds.has(p.id));
    if (!selected.length) return;
    if (!window.confirm(`Move ${selected.length} player(s) to Local?`)) return;
    try {
      const existing = await localDb.getDocs(localDb.query(localDb.collection("player-personal")));
      const usedNames = existing.map((n) => n.name);
      for (const p of selected) {
        const newName = uniqueName(p.name, usedNames);
        usedNames.push(newName);
        const data = { ...p, name: newName, uid: "local-user", published: false };
        delete data.id;
        await localDb.addDoc(localDb.collection("player-personal"), data);
        await db.deleteDoc(db.doc("player-personal", p.id));
      }
      setSelectedIds(new Set());
      notify(t("Moved to Local"));
    } catch { notify(t("Failed to move to Local")); }
  };

  const moveSelectedToCloud = async () => {
    if (!cloudUser) { notify(t("Sign in to move to Cloud")); return; }
    const selected = filteredList.filter((p) => selectedIds.has(p.id));
    if (!selected.length) return;
    if (!window.confirm(`Move ${selected.length} player(s) to Cloud?`)) return;
    try {
      const existing = await cloudDb.getDocs(cloudDb.query(cloudDb.collection("player-personal")));
      const usedNames = existing.map((n) => n.name);
      for (const p of selected) {
        const newName = uniqueName(p.name, usedNames);
        usedNames.push(newName);
        const data = { ...p, name: newName, published: false };
        delete data.id;
        await cloudDb.addDoc(cloudDb.collection("player-personal"), data);
        await db.deleteDoc(db.doc("player-personal", p.id));
      }
      setSelectedIds(new Set());
      notify(t("Moved to Cloud"));
    } catch { notify(t("Failed to move to Cloud")); }
  };

  const copyAllToLocal = async () => {
    try {
      const existing = await localDb.getDocs(localDb.query(localDb.collection("player-personal")));
      const usedNames = existing.map((n) => n.name);
      for (const p of filteredList) {
        const newName = uniqueName(p.name, usedNames);
        usedNames.push(newName);
        const data = { ...p, name: newName, uid: "local-user", published: false };
        delete data.id;
        await localDb.addDoc(localDb.collection("player-personal"), data);
      }
      notify(t("Copied to Local"));
    } catch { notify(t("Failed to copy to Local")); }
  };

  const copyAllToCloud = async () => {
    if (!cloudUser) { notify(t("Sign in to copy to Cloud")); return; }
    try {
      const existing = await cloudDb.getDocs(cloudDb.query(cloudDb.collection("player-personal")));
      const usedNames = existing.map((n) => n.name);
      for (const p of filteredList) {
        const newName = uniqueName(p.name, usedNames);
        usedNames.push(newName);
        const data = { ...p, name: newName, published: false };
        delete data.id;
        await cloudDb.addDoc(cloudDb.collection("player-personal"), data);
      }
      notify(t("Copied to Cloud"));
    } catch { notify(t("Failed to copy to Cloud")); }
  };

  const moveAllToLocal = async () => {
    if (!window.confirm(`Move all ${filteredList.length} player(s) to Local?`)) return;
    try {
      const existing = await localDb.getDocs(localDb.query(localDb.collection("player-personal")));
      const usedNames = existing.map((n) => n.name);
      for (const p of filteredList) {
        const newName = uniqueName(p.name, usedNames);
        usedNames.push(newName);
        const data = { ...p, name: newName, uid: "local-user", published: false };
        delete data.id;
        await localDb.addDoc(localDb.collection("player-personal"), data);
        await db.deleteDoc(db.doc("player-personal", p.id));
      }
      notify(t("Moved to Local"));
    } catch { notify(t("Failed to move to Local")); }
  };

  const moveAllToCloud = async () => {
    if (!cloudUser) { notify(t("Sign in to move to Cloud")); return; }
    if (!window.confirm(`Move all ${filteredList.length} player(s) to Cloud?`)) return;
    try {
      const existing = await cloudDb.getDocs(cloudDb.query(cloudDb.collection("player-personal")));
      const usedNames = existing.map((n) => n.name);
      for (const p of filteredList) {
        const newName = uniqueName(p.name, usedNames);
        usedNames.push(newName);
        const data = { ...p, name: newName, published: false };
        delete data.id;
        await cloudDb.addDoc(cloudDb.collection("player-personal"), data);
        await db.deleteDoc(db.doc("player-personal", p.id));
      }
      notify(t("Moved to Cloud"));
    } catch { notify(t("Failed to move to Cloud")); }
  };

  const copyPlayer = function (player) {
    return async function () {
      const data = Object.assign({}, player);
      delete data.id;
      data.published = false;

      if (window.confirm("Are you sure you want to copy?")) {
        db.addDoc(db.collection("player-personal"), data)
          .then(function (docRef) {
            window.location.href = `/pc-gallery/${docRef.id}`;
          })
          .catch(function (error) {
            console.error("Error adding document: ", error);
          });
      }
    };
  };

  const deletePlayer = function (player) {
    return function () {
      setPlayerToDelete(player);
      setIsBulkDelete(false);
      setDeleteDialogOpen(true);
    };
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleBugDialogClose = () => {
    setIsBugDialogOpen(false);
  };

  const sharePlayer = async (id) => {
    let baseUrl = window.location.href.replace(/\/[^/]+$/, "");
    if (IS_ELECTRON) {
      baseUrl = "https://fultimator.com";
    }
    const fullUrl = `${baseUrl}/pc-gallery/${id}`;
    await navigator.clipboard.writeText(fullUrl);
    setOpen(true);
  };

  const handleNavigation = (path) => {
    navigate(path, { state: { from: "/pc-gallery" } });
  };

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 20 }}>
        <Paper sx={{ width: "100%", px: 2, py: 1 }}>

          {/* ── Zone 1: Filters ─────────────────────────────────────────────── */}
          <Grid container spacing={1} alignItems="center">
            <Grid item xs={12} sm>
              <TextField
                label={t("Search by Player Name")}
                variant="outlined"
                size="small"
                fullWidth
                value={name}
                onChange={(evt) => { setName(evt.target.value); }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                inputProps={{ maxLength: 50 }}
              />
            </Grid>
            <Grid item xs={12} sm="auto" sx={{ minWidth: 160 }}>
              <FormControl fullWidth size="small">
                <InputLabel id="direction">{t("Direction:")}</InputLabel>
                <Select
                  labelId="direction"
                  id="select-direction"
                  value={direction}
                  label="direction:"
                  onChange={(evt) => { setDirection(evt.target.value); }}
                >
                  <MenuItem value={"ascending"}>{t("Ascending")}</MenuItem>
                  <MenuItem value={"descending"}>{t("Descending")}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Divider sx={{ my: 0.75 }} />

          {/* ── Actions + Status (single row) ───────────────────────────────── */}
          <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
            <Button variant="contained" startIcon={<HistoryEdu />} onClick={addPlayer} disabled={dbMode === "cloud" && !cloudUser}>
              {t("Create Player")}
            </Button>
            {SUPPORTS_LOCAL_DB && (
              <ToggleButtonGroup
                value={dbMode}
                exclusive
                onChange={(_, val) => { if (val !== null) requestModeSwitch(val); }}
                size="small"
              >
                <ToggleButton value="local">
                  <StorageIcon sx={{ mr: 0.5 }} fontSize="small" />
                  {t("Local")}
                </ToggleButton>
                <ToggleButton value="cloud">
                  <CloudIcon sx={{ mr: 0.5 }} fontSize="small" />
                  {t("Cloud")}
                </ToggleButton>
              </ToggleButtonGroup>
            )}
            {dbMode === "local" && <DriveSync />}
            <Box sx={{ flex: 1 }} />
            <Button variant="outlined" size="small" onClick={() => fileInputRef.current.click()}>
              {t("Add PC from JSON")}
            </Button>
            <Tooltip title={t("Add PC from Clipboard")}>
              <IconButton size="small" onClick={handlePastePlayer}>
                <ContentPaste />
              </IconButton>
            </Tooltip>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = () => {
                    try {
                      const result = JSON.parse(reader.result);
                      handleFileUpload(result);
                    } catch (err) {
                      console.error("Error parsing JSON:", err);
                    }
                  };
                  reader.readAsText(file);
                }
              }}
              style={{ display: "none" }}
            />
            <Divider orientation="vertical" flexItem />
            <Typography variant="body1" fontWeight={600}>
              {filteredList?.length ?? 0} {t("Players")}
            </Typography>
            {stalePlayers.length > 0 && (
              <Tooltip title={t("Some players need a data migration")}>
                <Button
                  variant="outlined"
                  size="small"
                  color="warning"
                  startIcon={<SystemUpdateAltIcon />}
                  onClick={() => setMigrationDialogOpen(true)}
                >
                  {t("Migrate")} ({stalePlayers.length})
                </Button>
              </Tooltip>
            )}
            <Tooltip title={selectMode ? t("Exit Select Mode") : t("Select Players")}>
              <Button
                variant={selectMode ? "contained" : "outlined"}
                size="small"
                startIcon={<LibraryAddCheck />}
                onClick={toggleSelectMode}
              >
                {t("Select")}
              </Button>
            </Tooltip>
          </Box>

          {/* ── Select mode sub-bar ─────────────────────────────────────────── */}
          <Collapse in={selectMode}>
            <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 1, mt: 0.75, pt: 0.75, borderTop: 1, borderColor: "divider" }}>
              <Typography variant="body2" color="text.secondary">
                {selectedIds.size} {t("selected")}
              </Typography>
              <Box sx={{ flex: 1 }} />
              {/* <Button
                size="small"
                variant="outlined"
                onClick={(e) => setCopyAnchor(e.currentTarget)}
                startIcon={<FileCopy />}
              >
                {t("Copy")}
              </Button> */}
              <MuiMenu anchorEl={copyAnchor} open={Boolean(copyAnchor)} onClose={() => setCopyAnchor(null)}>
                <MenuItem disabled={selectedIds.size === 0} onClick={() => { setCopyAnchor(null); copySelectedToLocal(); }}>
                  <ListItemIcon><StorageIcon fontSize="small" /></ListItemIcon>
                  <ListItemText primary={`${t("Copy Selected to Local")} (${selectedIds.size})`} />
                </MenuItem>
                <MenuItem disabled={selectedIds.size === 0 || !cloudUser} onClick={() => { setCopyAnchor(null); copySelectedToCloud(); }}>
                  <ListItemIcon><CloudIcon fontSize="small" /></ListItemIcon>
                  <ListItemText primary={`${t("Copy Selected to Cloud")} (${selectedIds.size})`} />
                </MenuItem>
                <Divider />
                <MenuItem onClick={() => { setCopyAnchor(null); copyAllToLocal(); }}>
                  <ListItemIcon><StorageIcon fontSize="small" /></ListItemIcon>
                  <ListItemText primary={t("Copy All to Local")} />
                </MenuItem>
                <MenuItem disabled={!cloudUser} onClick={() => { setCopyAnchor(null); copyAllToCloud(); }}>
                  <ListItemIcon><CloudIcon fontSize="small" /></ListItemIcon>
                  <ListItemText primary={t("Copy All to Cloud")} />
                </MenuItem>
              </MuiMenu>
              <Button
                size="small"
                variant="outlined"
                onClick={(e) => setMoveAnchor(e.currentTarget)}
                startIcon={<DriveFileMove />}
              >
                {t("Move")}
              </Button>
              <MuiMenu anchorEl={moveAnchor} open={Boolean(moveAnchor)} onClose={() => setMoveAnchor(null)}>
                <MenuItem disabled={selectedIds.size === 0} onClick={() => { setMoveAnchor(null); moveSelectedToLocal(); }}>
                  <ListItemIcon><StorageIcon fontSize="small" /></ListItemIcon>
                  <ListItemText primary={`${t("Move Selected to Local")} (${selectedIds.size})`} />
                </MenuItem>
                <MenuItem disabled={selectedIds.size === 0 || !cloudUser} onClick={() => { setMoveAnchor(null); moveSelectedToCloud(); }}>
                  <ListItemIcon><CloudIcon fontSize="small" /></ListItemIcon>
                  <ListItemText primary={`${t("Move Selected to Cloud")} (${selectedIds.size})`} />
                </MenuItem>
                <Divider />
                <MenuItem onClick={() => { setMoveAnchor(null); moveAllToLocal(); }}>
                  <ListItemIcon><StorageIcon fontSize="small" /></ListItemIcon>
                  <ListItemText primary={t("Move All to Local")} />
                </MenuItem>
                <MenuItem disabled={!cloudUser} onClick={() => { setMoveAnchor(null); moveAllToCloud(); }}>
                  <ListItemIcon><CloudIcon fontSize="small" /></ListItemIcon>
                  <ListItemText primary={t("Move All to Cloud")} />
                </MenuItem>
              </MuiMenu>
              <Tooltip title={`${t("Export Selected as JSON")} (${selectedIds.size})`}>
                <span>
                  <IconButton onClick={exportSelectedAsJson} disabled={selectedIds.size === 0}>
                    <Download />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title={`${t("Delete Selected")} (${selectedIds.size})`}>
                <span>
                  <IconButton onClick={deleteSelected} disabled={selectedIds.size === 0} color="error">
                    <Delete />
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
          </Collapse>

        </Paper>
      </div>

      {!cloudUser && (
        <Paper
          elevation={dbMode === "cloud" ? 3 : 0}
          variant={dbMode === "cloud" ? "elevation" : "outlined"}
          sx={{ p: 2, mb: 2, display: "flex", alignItems: "center", justifyContent: "center", gap: 2, flexWrap: "wrap" }}
        >
          <CloudIcon color={dbMode === "cloud" ? "primary" : "disabled"} />
          <Typography variant="body2" color={dbMode === "cloud" ? "text.primary" : "text.secondary"} sx={{ flex: 1, minWidth: 200 }}>
            {dbMode === "cloud"
              ? t("You have to be logged in to access this feature")
              : t("Have a Google account? Sign in to sync your data between devices")}
          </Typography>
          <SignIn />
        </Paper>
      )}

      {loading && (dbMode !== "cloud" || cloudUser) && (
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 50 }}>
          <CircularProgress />
        </div>
      )}
      <Grid container spacing={1} sx={{ py: 1 }}>
        {filteredList.map((player, index) => (
          <Grid
            item
            xs={12}
            md={6}
            alignItems="center"
            justifyContent="center"
            key={index}
            sx={{
              marginBottom: "20px",
              ...(selectMode ? {
                cursor: "pointer",
                outline: selectedIds.has(player.id) ? "3px solid" : "1px dashed",
                outlineColor: selectedIds.has(player.id) ? "primary.main" : "divider",
                borderRadius: 1,
              } : {}),
            }}
            onClick={selectMode ? () => toggleSelectPlayer(player.id) : undefined}
          >
            <PlayerCardGallery
              player={player}
              setPlayer={null}
              sx={{ marginBottom: 1 }}
            />
            <div style={{ marginTop: "3px" }} onClick={(e) => e.stopPropagation()}>
                  {/* <Tooltip title={t("Copy")}>
                    <IconButton onClick={copyPlayer(player)}>
                      <ContentCopy />
                    </IconButton>
                  </Tooltip> */}
                  <PlayerTransferButton
                    player={player}
                    copyPlayerToLocal={copyPlayerToLocal}
                    copyPlayerToCloud={copyPlayerToCloud}
                    movePlayerToLocal={movePlayerToLocal}
                    movePlayerToCloud={movePlayerToCloud}
                    t={t}
                  />
                  <Tooltip title={t("Edit")}>
                    <IconButton onClick={() => handleNavigation(`/pc-gallery/${player.id}`)}>
                      <Edit />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={t("Delete")}>
                    <IconButton onClick={deletePlayer(player)}>
                      <Delete />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={t("Share URL")}>
                    <span>
                      <IconButton onClick={() => sharePlayer(player.id)} disabled={dbMode === "local"}>
                        <Share />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title={t("Player Sheet")}>
                    <IconButton onClick={() => handleNavigation(`/character-sheet/${player.id}`)}>
                      <Badge />
                    </IconButton>
                  </Tooltip>
                  <Export name={`${player.name}`} dataType="pc" data={player} />
            </div>
          </Grid>
        ))}
        <Grid item xs={12}>
          <Button
            variant="outlined"
            startIcon={<BugReport />}
            sx={{ marginTop: "5rem" }}
            onClick={() => setIsBugDialogOpen(true)}
          >
            {t("Report a Bug")}
          </Button>
        </Grid>
      </Grid>
      <Box sx={{ height: "10vh" }} />
      <MigrationDialog
        open={migrationDialogOpen}
        onClose={() => setMigrationDialogOpen(false)}
        actors={stalePlayers}
        actorType="player"
        onMigrateAll={handleMigrateAllPlayers}
      />

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={async () => {
          if (isBulkDelete) {
            for (const id of selectedIds) {
              await db.deleteDoc(db.doc("player-personal", id));
            }
            setSelectedIds(new Set());
          } else if (playerToDelete) {
            await db.deleteDoc(db.doc("player-personal", playerToDelete.id));
            setPlayerToDelete(null);
          }
        }}
        title={isBulkDelete ? t("Confirm Bulk Deletion") : t("Confirm Deletion")}
        message={
          isBulkDelete
            ? t("Are you sure you want to delete {count} player(s)?").replace("{count}", String(selectedIds.size))
            : t("Are you sure you want to delete this player?")
        }
        itemPreview={
          !isBulkDelete && playerToDelete && (
            <Box>
              <Typography variant="h4">{playerToDelete.name}</Typography>
              <Typography variant="body2">
                {t("Level")} {playerToDelete.lvl} - {playerToDelete.info?.identity}
              </Typography>
            </Box>
          )
        }
      />
      <HelpFeedbackDialog
        open={isBugDialogOpen}
        onClose={handleBugDialogClose}
        userEmail={cloudUser?.email ?? ""}
        userUUID={cloudUser?.uid ?? activeUid}
        title={"Report a Bug"}
        placeholder="Please describe the bug. Please leave a message in english!"
        onSuccess={null}
        webhookUrl={import.meta.env.VITE_DISCORD_REPORT_BUG_WEBHOOK_URL}
      />
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        open={open}
        autoHideDuration={2000}
        onClose={handleClose}
        message={t("Copied to Clipboard!")}
      />
      <Snackbar
        open={Boolean(snackMsg)}
        onClose={() => setSnackMsg(null)}
        autoHideDuration={2000}
        message={snackMsg}
      />
      {showScrollTop && (
        <Tooltip title={t("Scroll to top")}>
          <Fab
            size="small"
            color="primary"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            sx={{ position: "fixed", bottom: 24, right: 24, zIndex: 1200 }}
          >
            <KeyboardArrowUpIcon />
          </Fab>
        </Tooltip>
      )}
    </>
  );
}

function PlayerTransferButton({ player, copyPlayerToLocal, copyPlayerToCloud, movePlayerToLocal, movePlayerToCloud, t }) {
  const { cloudUser } = useDatabaseContext();
  const [anchor, setAnchor] = useState(null);
  return (
    <>
      <Tooltip title={t("Copy to / Move to...")}>
        <IconButton onClick={(e) => setAnchor(e.currentTarget)}>
          <FileCopy />
        </IconButton>
      </Tooltip>
      <MuiMenu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
        <MenuItem onClick={() => { setAnchor(null); copyPlayerToLocal(player)(); }}>
          <ListItemIcon><StorageIcon fontSize="small" /></ListItemIcon>
          <ListItemText primary={t("Copy to Local")} />
        </MenuItem>
        <MenuItem disabled={!cloudUser} onClick={() => { setAnchor(null); copyPlayerToCloud(player)(); }}>
          <ListItemIcon><CloudIcon fontSize="small" /></ListItemIcon>
          <ListItemText primary={t("Copy to Cloud")} />
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => { setAnchor(null); movePlayerToLocal(player)(); }}>
          <ListItemIcon><StorageIcon fontSize="small" /></ListItemIcon>
          <ListItemText primary={t("Move to Local")} />
        </MenuItem>
        <MenuItem disabled={!cloudUser} onClick={() => { setAnchor(null); movePlayerToCloud(player)(); }}>
          <ListItemIcon><CloudIcon fontSize="small" /></ListItemIcon>
          <ListItemText primary={t("Move to Cloud")} />
        </MenuItem>
      </MuiMenu>
    </>
  );
}
