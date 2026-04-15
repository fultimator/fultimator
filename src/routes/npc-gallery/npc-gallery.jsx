import {
  Link as RouterLink,
  useSearchParams,
  useNavigate,
  useLocation,
} from "react-router";

import {
  Box,
  Button,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu as MuiMenu,
  Skeleton,
  Snackbar,
  Tooltip,
  Typography,
  Grid,
  Collapse,
  CircularProgress,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  ToggleButtonGroup,
  ToggleButton,
  Fab,
} from "@mui/material";
import Layout from "../../components/Layout";
import { SignIn } from "../../components/auth";
import NpcPretty from "../../components/npc/Pretty";
import {
  Delete,
  Download,
  DriveFileMove,
  Edit,
  FileCopy,
  HistoryEdu,
  LibraryAddCheck,
  PhotoLibrary,
  Share,
  UploadFile,
  ContentPaste,
  ExpandLess,
  ExpandMore,
  KeyboardArrowUp,
} from "@mui/icons-material";
import JSZip from "jszip";
import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import useDownloadImage from "../../hooks/useDownloadImage";
import Export from "../../components/Export";
import { buildItemText } from "../../libs/buildItemText";
import { useTranslate } from "../../translation/translate";
import { validateNpc } from "../../utility/validateJson";
import ExportAllNPCs from "../../components/common/ExportAllNPCs";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import StorageIcon from "@mui/icons-material/Storage";
import CloudIcon from "@mui/icons-material/Cloud";
import { SUPPORTS_LOCAL_DB, IS_ELECTRON } from "../../platform";
import DriveSync from "../../components/DriveSync";
import { useDatabaseContext } from "../../context/useDatabaseContext";
import { useDatabase } from "../../hooks/useDatabase";
import DeleteConfirmationDialog from "../../components/common/DeleteConfirmationDialog";
import MigrationDialog from "../../components/common/MigrationDialog";
import {
  npcNeedsMigration,
  applyNpcPreSaveTransforms,
  applyNpcPostLoadTransforms,
} from "../../components/npc/npcTransforms";
import SystemUpdateAltIcon from "@mui/icons-material/SystemUpdateAlt";

export default function NpcGallery() {
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
  const navigate = useNavigate();
  const location = useLocation();

  const [searchParams] = useSearchParams();

  const [name, setName] = useState(searchParams.get("name") || "");
  const [rank, setRank] = useState(searchParams.get("rank") || "");
  const [species, setSpecies] = useState(searchParams.get("species") || "");
  const [sort, setSort] = useState(searchParams.get("sort") || "name");
  const [direction, setDirection] = useState(
    searchParams.get("direction") || "ascending",
  );
  const [tagSearch] = useState("");
  const [tagSort, setTagSort] = useState(searchParams.get("tagSort") || null);
  const [collapse, setCollapse] = useState(false);
  const [filteredParams, setFilteredParams] = useState(location.search || "");

  const fileInputRef = useRef(null);

  const [showScrollTop, setShowScrollTop] = useState(false);
  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const { dbMode, requestModeSwitch, cloudUser } = useDatabaseContext();
  const db = useDatabase();
  const localDb = useDatabase("local");
  const cloudDb = useDatabase("cloud");

  // Deletion confirmation states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [npcToDelete, setNpcToDelete] = useState(null);
  const [isBulkDelete, setIsBulkDelete] = useState(false);

  // Migration states
  const [migrationDialogOpen, setMigrationDialogOpen] = useState(false);

  const [personalList, loading, err] = db.useCollectionData(
    db.query(
      db.collection("npc-personal"),
      db.orderBy("lvl", "asc"),
      db.orderBy("name", "asc"),
    ),
  );

  const staleNpcs = useMemo(() => {
    if (!personalList) return [];
    return personalList.filter(npcNeedsMigration);
  }, [personalList]);

  const handleMigrateAllNpcs = async () => {
    for (const npc of staleNpcs) {
      const ref = db.doc("npc-personal", npc.id);
      const migrated = applyNpcPostLoadTransforms(npc);
      await db.setDoc(ref, applyNpcPreSaveTransforms(migrated));
    }
    setMigrationDialogOpen(false);
    notify(t("All NPCs migrated successfully"));
  };

  const tagCounts = personalList
    ? personalList.reduce((accumulator, npc) => {
        if (npc.tags) {
          npc.tags.forEach((tag) => {
            if (tag.name) {
              const tagName = tag.name.toUpperCase();
              accumulator[tagName] = (accumulator[tagName] || 0) + 1;
            }
          });
        }
        return accumulator;
      }, {})
    : {};

  const sortedTags = Object.keys(tagCounts).sort(
    (a, b) => tagCounts[b] - tagCounts[a],
  );

  const updateName = (value) => {
    setName(value);
    updateUrlParams({ name: value });
  };
  const updateRank = (value) => {
    setRank(value);
    updateUrlParams({ rank: value });
  };
  const updateSpecies = (value) => {
    setSpecies(value);
    updateUrlParams({ species: value });
  };
  const updateSort = (value) => {
    setSort(value);
    updateUrlParams({ sort: value });
  };
  const updateDirection = (value) => {
    setDirection(value);
    updateUrlParams({ direction: value });
  };
  const updateTagSort = (value) => {
    setTagSort(value);
    updateUrlParams({ tagSort: value });
  };

  const updateUrlParams = (updatedParams) => {
    if (loading) return;

    const currentParams = {
      name,
      rank,
      species,
      tagSort,
      sort,
      direction,
      ...updatedParams,
    };

    const queryString = new URLSearchParams(
      Object.entries(currentParams).reduce((acc, [key, value]) => {
        if (value) acc[key] = value;
        return acc;
      }, {}),
    ).toString();

    setFilteredParams(queryString);

    navigate(`${location.pathname}?${queryString}`, {
      replace: true,
      state: { from: "/npc-gallery", search: location.search },
    });
  };

  const clearSearchFilters = () => {
    setName("");
    setRank("");
    setSpecies("");
    setTagSort(null);
    setSort("name");
    setDirection("ascending");
    setFilteredParams("");
    navigate(location.pathname, { replace: true });
  };

  const addNpc = async function () {
    const data = {
      name: "-",
      species: "Beast",
      lvl: 5,
      imgurl: "",
      attributes: { dexterity: 8, might: 8, will: 8, insight: 8 },
      attacks: [],
      affinities: {},
    };
    try {
      const res = await db.addDoc(db.collection("npc-personal"), data);
      console.debug(res);
    } catch (e) {
      console.debug(e);
    }
  };

  const handleFileUpload = async (jsonData) => {
    try {
      if (!validateNpc(jsonData)) {
        console.error("Invalid NPC data.");
        alert(t("Invalid NPC JSON data."));
        return;
      }

      delete jsonData.id;
      jsonData.published = false;

      const res = await db.addDoc(db.collection("npc-personal"), jsonData);
      console.debug("Document added with ID: ", res.id);
    } catch (error) {
      console.error("Error uploading NPC from JSON:", error);
    }
  };

  const copyNpc = (npc) => async () => {
    const data = { ...npc, published: false };
    delete data.id;
    try {
      const docRef = await db.addDoc(db.collection("npc-personal"), data);
      notify(t("NPC copied"));
      setTimeout(() => {
        window.location.href = `/npc-gallery/${docRef.id}`;
      }, 800);
    } catch {
      notify(t("Failed to copy NPC"));
    }
  };

  const deleteNpc = (npc) => () => {
    setNpcToDelete(npc);
    setIsBulkDelete(false);
    setDeleteDialogOpen(true);
  };

  const [snackMsg, setSnackMsg] = useState(null);
  const notify = (msg) => setSnackMsg(msg);

  const [selectedIds, setSelectedIds] = useState(new Set());
  const [selectMode, setSelectMode] = useState(false);

  const toggleSelectMode = () => {
    setSelectMode((prev) => {
      if (prev) setSelectedIds(new Set());
      return !prev;
    });
  };

  const toggleSelectNpc = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const deleteSelected = async () => {
    setIsBulkDelete(true);
    setDeleteDialogOpen(true);
  };

  const [copyAnchor, setCopyAnchor] = useState(null);
  const [moveAnchor, setMoveAnchor] = useState(null);
  const [exportAnchor, setExportAnchor] = useState(null);

  // Bulk cross-DB copy / move
  const bulkCopyToDb = async (npcs, targetDb) => {
    for (const npc of npcs) {
      const data = { ...npc, published: false };
      delete data.id;
      await targetDb.addDoc(targetDb.collection("npc-personal"), data);
    }
  };

  const bulkDeleteFromDb = async (npcs, sourceDb) => {
    for (const npc of npcs) {
      await sourceDb.deleteDoc(sourceDb.doc("npc-personal", npc.id));
    }
  };

  const copySelectedToLocal = async () => {
    const selected = filteredList.filter((npc) => selectedIds.has(npc.id));
    try {
      await bulkCopyToDb(selected, localDb);
      notify(t("Copied to Local"));
      setSelectedIds(new Set());
    } catch {
      notify(t("Failed to copy to Local"));
    }
  };

  const copySelectedToCloud = async () => {
    if (!cloudUser) {
      notify(t("Sign in to copy to Cloud"));
      return;
    }
    const selected = filteredList.filter((npc) => selectedIds.has(npc.id));
    try {
      await bulkCopyToDb(selected, cloudDb);
      notify(t("Copied to Cloud"));
      setSelectedIds(new Set());
    } catch {
      notify(t("Failed to copy to Cloud"));
    }
  };

  const moveSelectedToLocal = async () => {
    const selected = filteredList.filter((npc) => selectedIds.has(npc.id));
    try {
      await bulkCopyToDb(selected, localDb);
      await bulkDeleteFromDb(selected, db);
      notify(t("Moved to Local"));
      setSelectedIds(new Set());
    } catch {
      notify(t("Failed to move to Local"));
    }
  };

  const moveSelectedToCloud = async () => {
    if (!cloudUser) {
      notify(t("Sign in to move to Cloud"));
      return;
    }
    const selected = filteredList.filter((npc) => selectedIds.has(npc.id));
    try {
      await bulkCopyToDb(selected, cloudDb);
      await bulkDeleteFromDb(selected, db);
      notify(t("Moved to Cloud"));
      setSelectedIds(new Set());
    } catch {
      notify(t("Failed to move to Cloud"));
    }
  };

  const copyAllToLocal = async () => {
    if (!window.confirm(`Copy all ${filteredList.length} NPC(s) to Local?`))
      return;
    try {
      await bulkCopyToDb(filteredList, localDb);
      notify(t("Copied to Local"));
    } catch {
      notify(t("Failed to copy to Local"));
    }
  };

  const copyAllToCloud = async () => {
    if (!cloudUser) {
      notify(t("Sign in to copy to Cloud"));
      return;
    }
    if (!window.confirm(`Copy all ${filteredList.length} NPC(s) to Cloud?`))
      return;
    try {
      await bulkCopyToDb(filteredList, cloudDb);
      notify(t("Copied to Cloud"));
    } catch {
      notify(t("Failed to copy to Cloud"));
    }
  };

  const moveAllToLocal = async () => {
    if (!window.confirm(`Move all ${filteredList.length} NPC(s) to Local?`))
      return;
    try {
      await bulkCopyToDb(filteredList, localDb);
      await bulkDeleteFromDb(filteredList, db);
      notify(t("Moved to Local"));
    } catch {
      notify(t("Failed to move to Local"));
    }
  };

  const moveAllToCloud = async () => {
    if (!cloudUser) {
      notify(t("Sign in to move to Cloud"));
      return;
    }
    if (!window.confirm(`Move all ${filteredList.length} NPC(s) to Cloud?`))
      return;
    try {
      await bulkCopyToDb(filteredList, cloudDb);
      await bulkDeleteFromDb(filteredList, db);
      notify(t("Moved to Cloud"));
    } catch {
      notify(t("Failed to move to Cloud"));
    }
  };

  const exportSelectedAsJSON = async () => {
    const selected = filteredList.filter((npc) => selectedIds.has(npc.id));
    const zip = new JSZip();
    selected.forEach((npc) => {
      zip.file(
        `${npc.name.replace(/\s/g, "_").toLowerCase()}.json`,
        JSON.stringify(npc, null, 2),
      );
    });
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "selected_npcs.zip";
    a.click();
    URL.revokeObjectURL(url);
    setExportAnchor(null);
  };

  const copySelectedAsText = async (fmt) => {
    const selected = filteredList.filter((npc) => selectedIds.has(npc.id));
    const separator = fmt === "obsidian" ? "\n\n" : "\n\n---\n\n";
    const text = selected
      .map((npc) => buildItemText("npc", npc, fmt))
      .join(separator);
    await navigator.clipboard.writeText(text);
    setExportAnchor(null);
    notify(t("Copied to Clipboard!"));
  };

  const exportSelectedAsText = async (fmt) => {
    const selected = filteredList.filter((npc) => selectedIds.has(npc.id));
    const ext = fmt === "plain" ? "txt" : "md";
    const zip = new JSZip();
    selected.forEach((npc) => {
      const text = buildItemText("npc", npc, fmt);
      zip.file(`${npc.name.replace(/\s+/g, "_").toLowerCase()}.${ext}`, text);
    });
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `selected_npcs_${fmt}.zip`;
    a.click();
    URL.revokeObjectURL(url);
    setExportAnchor(null);
  };

  const downloadCallbacksRef = useRef(new Map());

  const downloadSelectedAsImages = () => {
    const selected = filteredList.filter((npc) => selectedIds.has(npc.id));
    selected.forEach((npc, i) => {
      const fn = downloadCallbacksRef.current.get(npc.id);
      if (fn) setTimeout(fn, i * 400);
    });
  };

  const handlePasteNpc = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const jsonData = JSON.parse(text);
      await handleFileUpload(jsonData);
    } catch (err) {
      console.error("Failed to parse clipboard content:", err);
      alert(t("Could not parse clipboard content as JSON."));
    }
  };

  const shareNpc = async (id) => {
    let baseUrl = window.location.href.replace(/\/[^/]+$/, "");
    if (IS_ELECTRON) {
      baseUrl = "https://fultimator.com";
    }
    await navigator.clipboard.writeText(`${baseUrl}/npc-gallery/${id}`);
    notify(t("Copied to Clipboard!"));
  };

  const isMobile = window.innerWidth < 900;

  if (err?.code === "quota-exceeded") {
    return (
      <Paper elevation={3} sx={{ marginBottom: 5, padding: 4 }}>
        {t(
          "Apologies, fultimator has reached its read quota at the moment, please try again tomorrow. (Around 12-24 hours)",
        )}
      </Paper>
    );
  }

  const filteredList = personalList
    ? personalList
        .filter((item) => {
          if (
            name !== "" &&
            !item.name.toLowerCase().includes(name.toLowerCase())
          )
            return false;

          if (
            tagSearch !== "" &&
            !item.tags?.some(
              (tag) =>
                tag.name &&
                tag.name.toLowerCase().includes(tagSearch.toLowerCase()),
            )
          )
            return false;

          if (species && item.species !== species) return false;
          if (rank && item.rank !== rank) return false;

          return true;
        })
        .sort((item1, item2) => {
          if (direction === "ascending") {
            if (sort === "name") return item1.name.localeCompare(item2.name);
            else if (sort === "level") return item1.lvl - item2.lvl;
            else if (sort === "publishedAt")
              return (item1.publishedAt ?? 0) - (item2.publishedAt ?? 0);
          } else {
            if (sort === "name") return item2.name.localeCompare(item1.name);
            else if (sort === "level") return item2.lvl - item1.lvl;
            else if (sort === "publishedAt")
              return (item2.publishedAt ?? 0) - (item1.publishedAt ?? 0);
          }
        })
        .filter((item) => {
          if (
            tagSort !== "" &&
            tagSort !== null &&
            !item.tags?.some(
              (tag) => tag.name.toUpperCase() === tagSort.toUpperCase(),
            )
          ) {
            return false;
          }
          return true;
        })
    : [];

  const copyNpcToLocal = (npc) => async () => {
    try {
      await bulkCopyToDb([npc], localDb);
      notify(t("NPC copied to Local"));
    } catch {
      notify(t("Failed to copy NPC to Local"));
    }
  };

  const copyNpcToCloud = (npc) => async () => {
    if (!cloudUser) {
      notify(t("Sign in to copy to Cloud"));
      return;
    }
    try {
      await bulkCopyToDb([npc], cloudDb);
      notify(t("NPC copied to Cloud"));
    } catch {
      notify(t("Failed to copy NPC to Cloud"));
    }
  };

  const moveNpcToLocal = (npc) => async () => {
    try {
      await bulkCopyToDb([npc], localDb);
      await db.deleteDoc(db.doc("npc-personal", npc.id));
      notify(t("NPC moved to Local"));
    } catch {
      notify(t("Failed to move NPC to Local"));
    }
  };

  const moveNpcToCloud = (npc) => async () => {
    if (!cloudUser) {
      notify(t("Sign in to move to Cloud"));
      return;
    }
    try {
      await bulkCopyToDb([npc], cloudDb);
      await db.deleteDoc(db.doc("npc-personal", npc.id));
      notify(t("NPC moved to Cloud"));
    } catch {
      notify(t("Failed to move NPC to Cloud"));
    }
  };

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 20 }}>
        <Paper sx={{ width: "100%", px: 2, py: 1 }}>
          {/* Zone 1: Filters */}
          <Grid container spacing={1} sx={{ alignItems: "center" }}>
            <Grid
              size={{
                xs: 12,
                md: 3,
              }}
            >
              <TextField
                label={t("Adversary Name")}
                variant="outlined"
                size="small"
                fullWidth
                value={name}
                onChange={(evt) => {
                  updateName(evt.target.value);
                }}
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                md: 2,
              }}
            >
              <Autocomplete
                fullWidth
                size="small"
                options={sortedTags}
                value={tagSort}
                onChange={(event, newValue) => {
                  updateTagSort(newValue);
                }}
                filterOptions={(options, { inputValue }) => {
                  const inputValueUpper = inputValue.toUpperCase();
                  return options.filter((option) =>
                    option.toUpperCase().includes(inputValueUpper),
                  );
                }}
                isOptionEqualToValue={(option, value) => option === value}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={t("Tag Search")}
                    variant="outlined"
                    fullWidth
                  />
                )}
              />
            </Grid>
            <Grid
              size={{
                xs: 6,
                sm: 4,
                md: "grow",
              }}
            >
              <FormControl fullWidth size="small">
                <InputLabel id="rank">{t("Rank:")}</InputLabel>
                <Select
                  labelId="rank"
                  id="select-rank"
                  value={rank}
                  label={t("Rank:")}
                  onChange={(evt) => {
                    updateRank(evt.target.value);
                  }}
                >
                  <MenuItem value={""}>{t("All")}</MenuItem>
                  <MenuItem value={"soldier"}>{t("Soldier")}</MenuItem>
                  <MenuItem value={"elite"}>{t("Elite")}</MenuItem>
                  <MenuItem value={"champion1"}>{t("Champion(1)")}</MenuItem>
                  <MenuItem value={"champion2"}>{t("Champion(2)")}</MenuItem>
                  <MenuItem value={"champion3"}>{t("Champion(3)")}</MenuItem>
                  <MenuItem value={"champion4"}>{t("Champion(4)")}</MenuItem>
                  <MenuItem value={"champion5"}>{t("Champion(5)")}</MenuItem>
                  <MenuItem value={"champion6"}>{t("Champion(6)")}</MenuItem>
                  <MenuItem value={"companion"}>{t("Companion")}</MenuItem>
                  <MenuItem value={"groupvehicle"}>
                    {t("Group Vehicle")}
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid
              size={{
                xs: 6,
                sm: 4,
                md: "grow",
              }}
            >
              <FormControl fullWidth size="small">
                <InputLabel id="species">{t("Species:")}</InputLabel>
                <Select
                  labelId="species"
                  id="select-species"
                  value={species}
                  label={t("Species:")}
                  onChange={(evt) => {
                    updateSpecies(evt.target.value);
                  }}
                >
                  <MenuItem value={""}>{t("All")}</MenuItem>
                  <MenuItem value={"Beast"}>{t("Beast")}</MenuItem>
                  <MenuItem value={"Construct"}>{t("Construct")}</MenuItem>
                  <MenuItem value={"Demon"}>{t("Demon")}</MenuItem>
                  <MenuItem value={"Elemental"}>{t("Elemental")}</MenuItem>
                  <MenuItem value={"Humanoid"}>{t("Humanoid")}</MenuItem>
                  <MenuItem value={"Monster"}>{t("Monster")}</MenuItem>
                  <MenuItem value={"Plant"}>{t("Plant")}</MenuItem>
                  <MenuItem value={"Undead"}>{t("Undead")}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid
              size={{
                xs: 6,
                sm: 4,
                md: "grow",
              }}
            >
              <FormControl fullWidth size="small">
                <InputLabel id="sort">{t("Sort:")}</InputLabel>
                <Select
                  labelId="sort"
                  id="select-sort"
                  value={sort}
                  label="Sort:"
                  onChange={(evt) => {
                    updateSort(evt.target.value);
                  }}
                >
                  <MenuItem value={"name"}>{t("Name")}</MenuItem>
                  <MenuItem value={"level"}>{t("Level")}</MenuItem>
                  <MenuItem value={"publishedAt"}>
                    {t("Published Date")}
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid
              size={{
                xs: 6,
                sm: 4,
                md: "grow",
              }}
            >
              <FormControl fullWidth size="small">
                <InputLabel id="direction">{t("Direction:")}</InputLabel>
                <Select
                  labelId="direction"
                  id="select-direction"
                  value={direction}
                  label="direction:"
                  onChange={(evt) => {
                    updateDirection(evt.target.value);
                  }}
                >
                  <MenuItem value={"ascending"}>{t("Ascending")}</MenuItem>
                  <MenuItem value={"descending"}>{t("Descending")}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid
              sx={{
                display: "flex",
                justifyContent: { xs: "flex-end", sm: "center" },
              }}
              size={{
                xs: 12,
                sm: "auto",
              }}
            >
              <Tooltip title={t("clear_search_filters")} placement="top">
                <span>
                  <IconButton
                    onClick={clearSearchFilters}
                    color={filteredParams ? "warning" : "default"}
                    size="small"
                  >
                    <DeleteSweepIcon />
                  </IconButton>
                </span>
              </Tooltip>
            </Grid>
          </Grid>

          <Divider sx={{ my: 0.75 }} />

          {/* Actions + Status (single row) */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 1,
            }}
          >
            <Button
              variant="contained"
              startIcon={<HistoryEdu />}
              onClick={addNpc}
              disabled={dbMode === "cloud" && !cloudUser}
            >
              {t("Create NPC")}
            </Button>
            {SUPPORTS_LOCAL_DB && (
              <ToggleButtonGroup
                value={dbMode}
                exclusive
                onChange={(_, val) => {
                  if (val !== null) requestModeSwitch(val);
                }}
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
            <Box sx={{ "& button": { width: "auto !important" } }}>
              <ExportAllNPCs
                npcs={filteredList?.length > 0 ? filteredList : []}
              />
            </Box>
            <Tooltip title={t("Add NPC from JSON")}>
              <IconButton
                size="small"
                onClick={() => fileInputRef.current.click()}
              >
                <UploadFile />
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
            <Tooltip title={t("Add NPC from Clipboard")}>
              <IconButton size="small" onClick={handlePasteNpc}>
                <ContentPaste />
              </IconButton>
            </Tooltip>
            <Tooltip title={collapse ? t("Collapse") : t("Expand")}>
              <IconButton
                size="small"
                onClick={() => {
                  setCollapse(!collapse);
                }}
              >
                {collapse ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            </Tooltip>
            <Divider orientation="vertical" flexItem />
            <Typography
              variant="body1"
              sx={{
                fontWeight: 600,
              }}
            >
              {t("filtered_npc_count") + " " + filteredList?.length}
            </Typography>
            {staleNpcs.length > 0 && (
              <Tooltip title={t("Some NPCs need a data migration")}>
                <Button
                  variant="outlined"
                  size="small"
                  color="warning"
                  startIcon={<SystemUpdateAltIcon />}
                  onClick={() => setMigrationDialogOpen(true)}
                >
                  {t("Migrate")} ({staleNpcs.length})
                </Button>
              </Tooltip>
            )}
            <Tooltip
              title={selectMode ? t("Exit Select Mode") : t("Select NPCs")}
            >
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

          {/* Select mode sub-bar */}
          <Collapse in={selectMode}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 1,
                mt: 0.75,
                pt: 0.75,
                borderTop: 1,
                borderColor: "divider",
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  color: "text.secondary",
                }}
              >
                {selectedIds.size} {t("selected")}
              </Typography>
              <Box sx={{ flex: 1 }} />
              <Button
                size="small"
                variant="outlined"
                onClick={(e) => setCopyAnchor(e.currentTarget)}
                startIcon={<FileCopy />}
              >
                {t("Copy")}
              </Button>
              <MuiMenu
                anchorEl={copyAnchor}
                open={Boolean(copyAnchor)}
                onClose={() => setCopyAnchor(null)}
              >
                <MenuItem
                  disabled={selectedIds.size === 0}
                  onClick={() => {
                    setCopyAnchor(null);
                    copySelectedToLocal();
                  }}
                >
                  <ListItemIcon>
                    <StorageIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary={`${t("Copy Selected to Local")} (${selectedIds.size})`}
                  />
                </MenuItem>
                <MenuItem
                  disabled={selectedIds.size === 0 || !cloudUser}
                  onClick={() => {
                    setCopyAnchor(null);
                    copySelectedToCloud();
                  }}
                >
                  <ListItemIcon>
                    <CloudIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary={`${t("Copy Selected to Cloud")} (${selectedIds.size})`}
                  />
                </MenuItem>
                <Divider />
                <MenuItem
                  onClick={() => {
                    setCopyAnchor(null);
                    copyAllToLocal();
                  }}
                >
                  <ListItemIcon>
                    <StorageIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary={t("Copy All to Local")} />
                </MenuItem>
                <MenuItem
                  disabled={!cloudUser}
                  onClick={() => {
                    setCopyAnchor(null);
                    copyAllToCloud();
                  }}
                >
                  <ListItemIcon>
                    <CloudIcon fontSize="small" />
                  </ListItemIcon>
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
              <MuiMenu
                anchorEl={moveAnchor}
                open={Boolean(moveAnchor)}
                onClose={() => setMoveAnchor(null)}
              >
                {dbMode !== "local" && (
                  <MenuItem
                    disabled={selectedIds.size === 0}
                    onClick={() => {
                      setMoveAnchor(null);
                      moveSelectedToLocal();
                    }}
                  >
                    <ListItemIcon>
                      <StorageIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary={`${t("Move Selected to Local")} (${selectedIds.size})`}
                    />
                  </MenuItem>
                )}
                {dbMode !== "cloud" && (
                  <MenuItem
                    disabled={selectedIds.size === 0 || !cloudUser}
                    onClick={() => {
                      setMoveAnchor(null);
                      moveSelectedToCloud();
                    }}
                  >
                    <ListItemIcon>
                      <CloudIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary={`${t("Move Selected to Cloud")} (${selectedIds.size})`}
                    />
                  </MenuItem>
                )}
                <Divider />
                {dbMode !== "local" && (
                  <MenuItem
                    onClick={() => {
                      setMoveAnchor(null);
                      moveAllToLocal();
                    }}
                  >
                    <ListItemIcon>
                      <StorageIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={t("Move All to Local")} />
                  </MenuItem>
                )}
                {dbMode !== "cloud" && (
                  <MenuItem
                    disabled={!cloudUser}
                    onClick={() => {
                      setMoveAnchor(null);
                      moveAllToCloud();
                    }}
                  >
                    <ListItemIcon>
                      <CloudIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={t("Move All to Cloud")} />
                  </MenuItem>
                )}
              </MuiMenu>
              <Tooltip title={`${t("Delete Selected")} (${selectedIds.size})`}>
                <span>
                  <IconButton
                    onClick={deleteSelected}
                    disabled={selectedIds.size === 0}
                    color="error"
                  >
                    <Delete />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip
                title={`${t("export_selected_npcs_button")} (${selectedIds.size})`}
              >
                <span>
                  <IconButton
                    onClick={(e) => setExportAnchor(e.currentTarget)}
                    disabled={selectedIds.size === 0}
                  >
                    <Download />
                  </IconButton>
                </span>
              </Tooltip>
              <MuiMenu
                anchorEl={exportAnchor}
                open={Boolean(exportAnchor)}
                onClose={() => setExportAnchor(null)}
              >
                <MenuItem
                  disabled={selectedIds.size === 0}
                  onClick={exportSelectedAsJSON}
                >
                  <ListItemText primary={t("export_json_file")} />
                </MenuItem>
                <Divider />
                <MenuItem
                  disabled={selectedIds.size === 0}
                  onClick={() => copySelectedAsText("markdown")}
                >
                  <ListItemText primary={t("Copy Markdown to Clipboard")} />
                </MenuItem>
                <MenuItem
                  disabled={selectedIds.size === 0}
                  onClick={() => exportSelectedAsText("markdown")}
                >
                  <ListItemText primary={t("Export as Markdown (.zip)")} />
                </MenuItem>
                <MenuItem
                  disabled={selectedIds.size === 0}
                  onClick={() => copySelectedAsText("plain")}
                >
                  <ListItemText primary={t("Copy Plaintext to Clipboard")} />
                </MenuItem>
                <MenuItem
                  disabled={selectedIds.size === 0}
                  onClick={() => exportSelectedAsText("plain")}
                >
                  <ListItemText primary={t("Export as Plaintext (.zip)")} />
                </MenuItem>
                <MenuItem
                  disabled={selectedIds.size === 0}
                  onClick={() => copySelectedAsText("obsidian")}
                >
                  <ListItemText
                    primary={t("Copy Obsidian (BlueCorvid) to Clipboard")}
                  />
                </MenuItem>
                <MenuItem
                  disabled={selectedIds.size === 0}
                  onClick={() => exportSelectedAsText("obsidian")}
                >
                  <ListItemText primary={t("Export as Obsidian (.zip)")} />
                </MenuItem>
              </MuiMenu>
              <Tooltip
                title={`${t("Download Selected as Images")} (${selectedIds.size})`}
              >
                <span>
                  <IconButton
                    onClick={downloadSelectedAsImages}
                    disabled={selectedIds.size === 0}
                  >
                    <PhotoLibrary />
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
          sx={{
            p: 2,
            mb: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <CloudIcon color={dbMode === "cloud" ? "primary" : "disabled"} />
          <Typography
            variant="body2"
            color={dbMode === "cloud" ? "text.primary" : "text.secondary"}
            sx={{ flex: 1, minWidth: 200 }}
          >
            {dbMode === "cloud"
              ? t("You have to be logged in to access this feature")
              : t(
                  "Have a Google account? Sign in to sync your data between devices.",
                )}
          </Typography>
          <SignIn />
        </Paper>
      )}
      {isMobile ? (
        <div>
          {filteredList?.map((npc, i) => (
            <Npc
              key={i}
              npc={npc}
              copyNpc={copyNpc}
              deleteNpc={deleteNpc}
              shareNpc={shareNpc}
              collapseGet={collapse}
              filterParams={filteredParams}
              dbMode={dbMode}
              selectMode={selectMode}
              isSelected={selectedIds.has(npc.id)}
              onToggleSelect={toggleSelectNpc}
              onRegisterDownload={(id, fn) => {
                if (fn) downloadCallbacksRef.current.set(id, fn);
                else downloadCallbacksRef.current.delete(id);
              }}
              copyNpcToLocal={copyNpcToLocal}
              copyNpcToCloud={copyNpcToCloud}
              moveNpcToLocal={moveNpcToLocal}
              moveNpcToCloud={moveNpcToCloud}
            />
          ))}
        </div>
      ) : (
        <div
          style={{ display: "flex", flexDirection: "row-reverse", rowGap: 30 }}
        >
          <div style={{ marginLeft: 10, width: "50%" }}>
            {filteredList?.map((npc, i) => {
              if (i % 2 === 0) return "";
              return (
                <Npc
                  key={i}
                  npc={npc}
                  copyNpc={copyNpc}
                  deleteNpc={deleteNpc}
                  shareNpc={shareNpc}
                  collapseGet={collapse}
                  filterParams={filteredParams}
                  dbMode={dbMode}
                  selectMode={selectMode}
                  isSelected={selectedIds.has(npc.id)}
                  onToggleSelect={toggleSelectNpc}
                  onRegisterDownload={(id, fn) => {
                    if (fn) downloadCallbacksRef.current.set(id, fn);
                    else downloadCallbacksRef.current.delete(id);
                  }}
                  copyNpcToLocal={copyNpcToLocal}
                  copyNpcToCloud={copyNpcToCloud}
                  moveNpcToLocal={moveNpcToLocal}
                  moveNpcToCloud={moveNpcToCloud}
                />
              );
            })}
          </div>
          <div style={{ marginRight: 10, width: "50%" }}>
            {filteredList?.map((npc, i) => {
              if (i % 2 !== 0) return "";
              return (
                <Npc
                  key={i}
                  npc={npc}
                  copyNpc={copyNpc}
                  deleteNpc={deleteNpc}
                  shareNpc={shareNpc}
                  collapseGet={collapse}
                  filterParams={filteredParams}
                  dbMode={dbMode}
                  selectMode={selectMode}
                  isSelected={selectedIds.has(npc.id)}
                  onToggleSelect={toggleSelectNpc}
                  onRegisterDownload={(id, fn) => {
                    if (fn) downloadCallbacksRef.current.set(id, fn);
                    else downloadCallbacksRef.current.delete(id);
                  }}
                  copyNpcToLocal={copyNpcToLocal}
                  copyNpcToCloud={copyNpcToCloud}
                  moveNpcToLocal={moveNpcToLocal}
                  moveNpcToCloud={moveNpcToCloud}
                />
              );
            })}
          </div>
        </div>
      )}
      <div
        style={{ display: "flex", justifyContent: "center", marginBottom: 50 }}
      >
        {loading && (dbMode !== "cloud" || cloudUser) && <CircularProgress />}
      </div>
      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        open={Boolean(snackMsg)}
        autoHideDuration={2500}
        onClose={() => setSnackMsg(null)}
        message={snackMsg}
      />
      <MigrationDialog
        open={migrationDialogOpen}
        onClose={() => setMigrationDialogOpen(false)}
        actors={staleNpcs}
        actorType="npc"
        onMigrateAll={handleMigrateAllNpcs}
      />
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={async () => {
          if (isBulkDelete) {
            for (const id of selectedIds) {
              await db.deleteDoc(db.doc("npc-personal", id));
            }
            setSelectedIds(new Set());
            notify(t("NPCs deleted"));
          } else if (npcToDelete) {
            await db.deleteDoc(db.doc("npc-personal", npcToDelete.id));
            setNpcToDelete(null);
            notify(t("NPC deleted"));
          }
        }}
        title={
          isBulkDelete ? t("Confirm Bulk Deletion") : t("Confirm Deletion")
        }
        message={
          isBulkDelete
            ? t("Are you sure you want to delete {count} NPC(s)?").replace(
                "{count}",
                String(selectedIds.size),
              )
            : t("Are you sure you want to delete this NPC?")
        }
        itemPreview={
          !isBulkDelete &&
          npcToDelete && (
            <Box>
              <Typography variant="h4">{npcToDelete.name}</Typography>
              <Typography variant="body2">
                {t("Level")} {npcToDelete.lvl} - {t(npcToDelete.species)}
              </Typography>
            </Box>
          )
        }
      />
      {showScrollTop && (
        <Tooltip title={t("Scroll to top")}>
          <Fab
            size="small"
            color="primary"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            sx={{ position: "fixed", bottom: 24, right: 24, zIndex: 1200 }}
          >
            <KeyboardArrowUp />
          </Fab>
        </Tooltip>
      )}
    </>
  );
}

function Npc({
  npc,
  _copyNpc,
  deleteNpc,
  shareNpc,
  collapseGet,
  filterParams,
  dbMode,
  selectMode,
  isSelected,
  onToggleSelect,
  onRegisterDownload,
  copyNpcToLocal,
  copyNpcToCloud,
  moveNpcToLocal,
  moveNpcToCloud,
}) {
  const { t } = useTranslate();
  const { cloudUser } = useDatabaseContext();
  const ref = useRef();
  const [downloadImage] = useDownloadImage(npc.name, ref);
  const [transferAnchor, setTransferAnchor] = useState(null);

  const [collapse, setCollapse] = useState(false);

  useEffect(() => {
    setCollapse(collapseGet);
  }, [collapseGet]);

  const expandAndDownloadImage = useCallback(() => {
    setCollapse(true);
    setTimeout(downloadImage, 100);
  }, [downloadImage]);

  useEffect(() => {
    onRegisterDownload(npc.id, expandAndDownloadImage);
    return () => onRegisterDownload(npc.id, null);
  }, [npc.id, onRegisterDownload, expandAndDownloadImage]);

  return (
    <Grid
      sx={{ marginBottom: 3 }}
      size={{
        xs: 12,
        md: 12,
      }}
    >
      <Box
        sx={
          isSelected
            ? {
                outline: "3px solid",
                outlineColor: "primary.main",
                borderRadius: 1,
              }
            : {}
        }
      >
        <NpcPretty
          npc={npc}
          ref={ref}
          npcImage={npc.imgurl}
          collapse={collapse}
          onClick={() => {
            if (selectMode) onToggleSelect(npc.id);
            else setCollapse(!collapse);
          }}
        />
      </Box>
      <Tooltip title={t("Copy to...")}>
        <IconButton onClick={(e) => setTransferAnchor(e.currentTarget)}>
          <FileCopy />
        </IconButton>
      </Tooltip>
      <MuiMenu
        anchorEl={transferAnchor}
        open={Boolean(transferAnchor)}
        onClose={() => setTransferAnchor(null)}
      >
        <MenuItem
          onClick={() => {
            setTransferAnchor(null);
            copyNpcToLocal(npc)();
          }}
        >
          <ListItemIcon>
            <StorageIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={t("Copy to Local")} />
        </MenuItem>
        <MenuItem
          disabled={!cloudUser}
          onClick={() => {
            setTransferAnchor(null);
            copyNpcToCloud(npc)();
          }}
        >
          <ListItemIcon>
            <CloudIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={t("Copy to Cloud")} />
        </MenuItem>
        <Divider />
        {dbMode !== "local" && (
          <MenuItem
            onClick={() => {
              setTransferAnchor(null);
              moveNpcToLocal(npc)();
            }}
          >
            <ListItemIcon>
              <StorageIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary={t("Move to Local")} />
          </MenuItem>
        )}
        {dbMode !== "cloud" && (
          <MenuItem
            disabled={!cloudUser}
            onClick={() => {
              setTransferAnchor(null);
              moveNpcToCloud(npc)();
            }}
          >
            <ListItemIcon>
              <CloudIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary={t("Move to Cloud")} />
          </MenuItem>
        )}
      </MuiMenu>
      <Tooltip title={t("Edit")}>
        <RouterLink
          to={`/npc-gallery/${npc.id}${
            filterParams
              ? filterParams.startsWith("?")
                ? filterParams
                : `?${filterParams}`
              : ""
          }`}
        >
          <IconButton>
            <Edit />
          </IconButton>
        </RouterLink>
      </Tooltip>
      <Tooltip title={t("Delete")}>
        <IconButton onClick={deleteNpc(npc)}>
          <Delete />
        </IconButton>
      </Tooltip>
      {dbMode === "cloud" && (
        <Tooltip title={t("Share URL")}>
          <IconButton onClick={() => shareNpc(npc.id)}>
            <Share />
          </IconButton>
        </Tooltip>
      )}
      <Tooltip title={t("Download as Image")}>
        <IconButton
          onClick={() => {
            expandAndDownloadImage();
          }}
        >
          <Download />
        </IconButton>
      </Tooltip>
      <Export name={`${npc.name}`} dataType="npc" data={npc} />
    </Grid>
  );
}
