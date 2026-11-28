import { selectedToggleSx } from "../../components/common/selectedToggleSx";
import {
  Link as RouterLink,
  useSearchParams,
  useNavigate,
  useLocation,
} from "react-router";

import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
  useMediaQuery,
  Container,
  CircularProgress,
  Paper,
  TextField,
  FormControl,
  FormControlLabel,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  Autocomplete,
  ToggleButtonGroup,
  ToggleButton,
  Fab,
} from "@mui/material";
import Layout from "../../components/Layout";
import SettingRow from "../../components/common/SettingRow";
import { SignIn } from "../../components/auth";
import NpcActorCard from "../../components/shared/actors/npc/NpcActorCard";
import {
  Delete,
  ChevronLeft,
  ChevronRight,
  Code,
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
  KeyboardArrowUp,
  Menu as MenuIcon,
  ViewQuilt,
  ViewSidebar,
  ViewList,
  UnfoldLess,
  UnfoldMore,
} from "@mui/icons-material";
import JSZip from "jszip";
import {
  useCallback,
  useDeferredValue,
  useEffect,
  useRef,
  useState,
  useMemo,
} from "react";
import useDownloadImage from "../../hooks/useDownloadImage";
import Export from "../../components/Export";
import { buildItemText } from "../../libs/buildItemText";
import { createUniqueFilenameTracker } from "../../utility/sanitizeFilename";
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
import { usePersistentState } from "../../hooks/usePersistentState";
import MasonryColumns from "../../components/common/MasonryColumns";
import AppBarSearch from "../../components/appbar/AppBarSearch";
import PhoneIphone from "@mui/icons-material/PhoneIphone";
import TabletMac from "@mui/icons-material/TabletMac";
import DesktopWindows from "@mui/icons-material/DesktopWindows";
import MasonryCard from "./listPreview/MasonryCard";
import { scrollToCardId } from "./listPreview/utils";
import MobileListBar from "./listPreview/MobileListBar";
import PreviewWidthToggle from "./listPreview/PreviewWidthToggle";
import {
  MASONRY_WIDTHS,
  MOBILE_LIST_BAR_HEIGHT,
  SIDEBAR_WIDTH,
} from "./listPreview/constants";
import NpcListPreview from "./NpcListPreview";
import NpcListDrawer from "./NpcListDrawer";
import { useDockedBarInset } from "../../hooks/useDockedBarInset";
import { useAppBarTop } from "./listPreview/useAppBarTop";
import DeleteConfirmationDialog from "../../components/common/DeleteConfirmationDialog";
import MigrationDialog from "../../components/common/MigrationDialog";
import {
  npcNeedsMigration,
  getPendingNpcMigrations,
  NPC_CURRENT_SCHEMA_VERSION,
  applyNpcPreSaveTransforms,
  applyNpcPostLoadTransforms,
} from "../../libs/actor";
import {
  stampSave,
  stampCreate,
  compareTimestamps,
} from "../../libs/actor/timestamps";
import SystemUpdateAltIcon from "@mui/icons-material/SystemUpdateAlt";
import {
  canonicalizeForTransfer,
  canonicalizeForExport,
  normalizeOwnershipForTarget,
} from "../../libs/exportTransforms";
import { applySpeciesEffects } from "../../forms/rendering/config/actorConfigs/npcSpeciesEffects";
import {
  applyRole,
  QA_LEVELS,
  QA_ROLE_KEYS,
} from "../../libs/quickAssembly/roles";

const toolButtonSx = {
  width: 36,
  height: 36,
  border: 1,
  borderColor: "divider",
  borderRadius: 1,
};

const desktopToolSx = [
  toolButtonSx,
  { display: { xs: "none", md: "inline-flex" } },
];

const iconOnlyMobileSx = {
  minWidth: 0,
  fontSize: { xs: 0, sm: "inherit" },
  px: { xs: 1, sm: 1.25 },
  "& .MuiButton-startIcon": { mx: { xs: 0, sm: "-4px" } },
  "& .MuiButton-startIcon .MuiSvgIcon-root": { fontSize: "1.25rem" },
};

const CREATE_NPC_ROLE_OPTIONS = QA_ROLE_KEYS.map((key) => ({
  value: key,
  label: key.charAt(0).toUpperCase() + key.slice(1),
}));

const CREATE_NPC_SPECIES_OPTIONS = [
  { value: "Beast", label: "Beast" },
  { value: "Construct", label: "Construct" },
  { value: "Demon", label: "Demon" },
  { value: "Elemental", label: "Elemental" },
  { value: "Monster", label: "Monster" },
  { value: "Plant", label: "Plant" },
  { value: "Undead", label: "Undead" },
  { value: "Humanoid", label: "Humanoid" },
  { value: "Variant Humanoid", label: "Variant Humanoid" },
];

const CREATE_NPC_RANK_OPTIONS = [
  { value: "soldier", label: "Soldier" },
  { value: "elite", label: "Elite" },
  { value: "champion1", label: "Champion (1)" },
  { value: "champion2", label: "Champion (2)" },
  { value: "champion3", label: "Champion (3)" },
  { value: "champion4", label: "Champion (4)" },
  { value: "champion5", label: "Champion (5)" },
  { value: "champion6", label: "Champion (6)" },
  { value: "companion", label: "Companion" },
  { value: "groupvehicle", label: "Group Vehicle" },
];

const CREATE_NPC_COMPANION_LVL_OPTIONS = [1, 2, 3, 4, 5];

const defaultCreateNpcOptions = {
  name: "",
  species: "Beast",
  rank: "soldier",
  companionlvl: 1,
  companionpclvl: 5,
  useQuickAssembly: false,
  role: "brute",
  lvl: 5,
};

export default function NpcGallery() {
  const { authLoading, dbMode } = useDatabaseContext();

  return (
    <Layout fullWidth>
      <Box sx={{ px: { xs: 2, md: 3 } }}>
        {authLoading && <Skeleton />}
        {!authLoading && <Personal key={dbMode} />}
      </Box>
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
  const [collapse, setCollapse] = usePersistentState(
    "npcGallery.collapse",
    false,
  );
  const [layout, setLayout] = usePersistentState(
    "npcGallery.layout",
    "masonry",
  );
  const [previewSize, setPreviewSize] = usePersistentState(
    "listPreview.size",
    "tablet",
  );
  const [masonrySize, setMasonrySize] = usePersistentState(
    "masonry.size",
    "phone",
  );
  const deferredName = useDeferredValue(name);
  const appBarHeight = useAppBarTop();
  const desktop = useMediaQuery("(min-width: 900px)");
  const dockedBarInset = useDockedBarInset();
  const filterWrapRef = useRef(null);
  const exportButtonRef = useRef(null);
  const [toolsAnchor, setToolsAnchor] = useState(null);
  const [listDrawerOpen, setListDrawerOpen] = useState(false);
  const [highlightId, setHighlightId] = useState(null);

  const [sidebarOpen, setSidebarOpen] = usePersistentState(
    "npcGallery.sidebar",
    false,
  );
  const sidebarShifts = desktop && sidebarOpen && layout === "masonry";
  const [listTop, setListTop] = useState(appBarHeight + 16);

  const focusCard = (id) => {
    scrollToCardId(id);
    setHighlightId(id);
  };

  const cardScrollMargin = desktop
    ? listTop
    : appBarHeight + MOBILE_LIST_BAR_HEIGHT + 8;

  useEffect(() => {
    const el = filterWrapRef.current;
    if (!el || !desktop) return undefined;
    const update = () => setListTop(appBarHeight + el.offsetHeight + 4);
    update();
    const observer = new window.ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [desktop, appBarHeight]);
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

  // Create NPC modal state
  const [isCreateNpcModalOpen, setIsCreateNpcModalOpen] = useState(false);
  const [createNpcOptions, setCreateNpcOptions] = useState(
    defaultCreateNpcOptions,
  );

  const npcQuery = useMemo(() => {
    const constraints =
      dbMode === "cloud" && cloudUser
        ? [db.where("uid", "==", cloudUser.uid)]
        : [];
    return db.query(
      db.collection("npc-personal"),
      ...constraints,
      db.orderBy("lvl", "asc"),
      db.orderBy("name", "asc"),
    );
  }, [db, dbMode, cloudUser]);
  const [personalList, loading, err] = db.useCollectionData(npcQuery);

  const filteredList = useMemo(
    () =>
      personalList
        ? personalList
            .filter((item) => {
              if (
                deferredName !== "" &&
                !item.name.toLowerCase().includes(deferredName.toLowerCase())
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
              if (rank && (item.rank || "soldier") !== rank) return false;

              return true;
            })
            .sort((item1, item2) => {
              // Fall back to publishedAt for NPCs that predate the createdAt field.
              const createdAtOf = (item) => item.createdAt ?? item.publishedAt;
              if (direction === "ascending") {
                if (sort === "name")
                  return item1.name.localeCompare(item2.name);
                else if (sort === "level") return item1.lvl - item2.lvl;
                else if (sort === "publishedAt")
                  return compareTimestamps(
                    item1.publishedAt,
                    item2.publishedAt,
                  );
                else if (sort === "createdAt")
                  return compareTimestamps(
                    createdAtOf(item1),
                    createdAtOf(item2),
                  );
                else if (sort === "updatedAt")
                  return compareTimestamps(item1.updatedAt, item2.updatedAt);
              } else {
                if (sort === "name")
                  return item2.name.localeCompare(item1.name);
                else if (sort === "level") return item2.lvl - item1.lvl;
                else if (sort === "publishedAt")
                  return compareTimestamps(
                    item2.publishedAt,
                    item1.publishedAt,
                  );
                else if (sort === "createdAt")
                  return compareTimestamps(
                    createdAtOf(item2),
                    createdAtOf(item1),
                  );
                else if (sort === "updatedAt")
                  return compareTimestamps(item2.updatedAt, item1.updatedAt);
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
        : [],
    [
      personalList,
      deferredName,
      tagSearch,
      species,
      rank,
      sort,
      direction,
      tagSort,
    ],
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

  const createNpc = async (options = defaultCreateNpcOptions) => {
    const species = options.species || "Beast";
    const { affinities, immunities } = applySpeciesEffects(species);
    const useQuickAssembly = !!options.useQuickAssembly;
    const role = useQuickAssembly ? options.role || "brute" : "custom";
    const lvl = useQuickAssembly ? options.lvl || 5 : 5;
    const data = applyRole(
      {
        name: options.name || "-",
        species,
        lvl,
        role,
        rank: options.rank || "soldier",
        imgurl: "",
        attributes: {
          dexterity: { base: 8 },
          insight: { base: 8 },
          might: { base: 8 },
          will: { base: 8 },
        },
        attacks: [],
        affinities,
        immunities,
        ...(options.rank === "companion"
          ? {
              companionlvl: options.companionlvl ?? 1,
              companionpclvl: options.companionpclvl ?? 5,
            }
          : {}),
      },
      { role, level: lvl },
    );
    try {
      const docRef = await db.addDoc(
        db.collection("npc-personal"),
        stampCreate(data),
      );
      navigate(`/npc-gallery/${docRef.id}`);
    } catch (e) {
      console.debug(e);
    }
  };

  const handleOpenCreateNpcModal = () => {
    setCreateNpcOptions(defaultCreateNpcOptions);
    setIsCreateNpcModalOpen(true);
  };

  const handleCloseCreateNpcModal = () => {
    setIsCreateNpcModalOpen(false);
  };

  const handleCreateNpcOptionChange = (field, value) => {
    setCreateNpcOptions((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCreateNpcConfirm = async () => {
    handleCloseCreateNpcModal();
    await createNpc(createNpcOptions);
    setCreateNpcOptions(defaultCreateNpcOptions);
  };

  const handleFileUpload = async (jsonData) => {
    try {
      const data = applyNpcPostLoadTransforms(jsonData);

      if (!validateNpc(data)) {
        console.error("Invalid NPC data.");
        alert(t("Invalid NPC JSON data."));
        return;
      }

      delete data.id;
      data.published = false;

      const res = await db.addDoc(
        db.collection("npc-personal"),
        stampCreate(applyNpcPreSaveTransforms(data)),
      );
      console.debug("Document added with ID: ", res.id);
    } catch (error) {
      console.error("Error uploading NPC from JSON:", error);
    }
  };

  const copyNpc = (npc) => async () => {
    const data = { ...npc, published: false };
    delete data.id;
    try {
      const docRef = await db.addDoc(
        db.collection("npc-personal"),
        stampCreate(data),
      );
      notify(t("NPC copied"));
      navigate(`/npc-gallery/${docRef.id}`);
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
  const bulkCopyToDb = async (npcs, targetDb, target) => {
    for (const npc of npcs) {
      const canonical = canonicalizeForTransfer("npc", npc);
      const data = normalizeOwnershipForTarget(
        { ...canonical, published: false },
        target,
        cloudUser?.uid,
      );
      await targetDb.addDoc(
        targetDb.collection("npc-personal"),
        stampSave(data, data.createdAt ?? data.publishedAt),
      );
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
      await bulkCopyToDb(selected, localDb, "local");
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
      await bulkCopyToDb(selected, cloudDb, "cloud");
      notify(t("Copied to Cloud"));
      setSelectedIds(new Set());
    } catch {
      notify(t("Failed to copy to Cloud"));
    }
  };

  const moveSelectedToLocal = async () => {
    const selected = filteredList.filter((npc) => selectedIds.has(npc.id));
    try {
      await bulkCopyToDb(selected, localDb, "local");
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
      await bulkCopyToDb(selected, cloudDb, "cloud");
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
      await bulkCopyToDb(filteredList, localDb, "local");
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
      await bulkCopyToDb(filteredList, cloudDb, "cloud");
      notify(t("Copied to Cloud"));
    } catch {
      notify(t("Failed to copy to Cloud"));
    }
  };

  const moveAllToLocal = async () => {
    if (!window.confirm(`Move all ${filteredList.length} NPC(s) to Local?`))
      return;
    try {
      await bulkCopyToDb(filteredList, localDb, "local");
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
      await bulkCopyToDb(filteredList, cloudDb, "cloud");
      await bulkDeleteFromDb(filteredList, db);
      notify(t("Moved to Cloud"));
    } catch {
      notify(t("Failed to move to Cloud"));
    }
  };

  const exportSelectedAsJSON = async () => {
    const selected = filteredList.filter((npc) => selectedIds.has(npc.id));
    const zip = new JSZip();
    const uniqueFilename = createUniqueFilenameTracker();
    selected.forEach((npc) => {
      const canonical = canonicalizeForExport("npc", npc);
      zip.file(
        `${uniqueFilename(npc.name)}.json`,
        JSON.stringify(canonical, null, 2),
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
      .map((npc) =>
        buildItemText("npc", canonicalizeForTransfer("npc", npc), fmt),
      )
      .join(separator);
    await navigator.clipboard.writeText(text);
    setExportAnchor(null);
    notify(t("Copied to Clipboard!"));
  };

  const exportSelectedAsText = async (fmt) => {
    const selected = filteredList.filter((npc) => selectedIds.has(npc.id));
    const ext = fmt === "plain" ? "txt" : "md";
    const zip = new JSZip();
    const uniqueFilename = createUniqueFilenameTracker();
    selected.forEach((npc) => {
      const text = buildItemText(
        "npc",
        canonicalizeForTransfer("npc", npc),
        fmt,
      );
      zip.file(`${uniqueFilename(npc.name)}.${ext}`, text);
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

  const renderNpc = (npc) => (
    <Npc
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

  if (err?.code === "quota-exceeded") {
    return (
      <Paper elevation={3} sx={{ marginBottom: 5, padding: 4 }}>
        {t(
          "Apologies, fultimator has reached its read quota at the moment, please try again tomorrow. (Around 12-24 hours)",
        )}
      </Paper>
    );
  }

  const copyNpcToLocal = (npc) => async () => {
    try {
      await bulkCopyToDb([npc], localDb, "local");
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
      await bulkCopyToDb([npc], cloudDb, "cloud");
      notify(t("NPC copied to Cloud"));
    } catch {
      notify(t("Failed to copy NPC to Cloud"));
    }
  };

  const moveNpcToLocal = (npc) => async () => {
    try {
      await bulkCopyToDb([npc], localDb, "local");
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
      await bulkCopyToDb([npc], cloudDb, "cloud");
      await db.deleteDoc(db.doc("npc-personal", npc.id));
      notify(t("NPC moved to Cloud"));
    } catch {
      notify(t("Failed to move NPC to Cloud"));
    }
  };

  const activeFilters = [
    tagSort,
    species && t(species),
    rank,
    sort !== "name" && sort,
    direction !== "ascending" && direction,
  ].filter(Boolean);

  const filterPanel = (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "repeat(2, minmax(0, 1fr))",
          md: "repeat(3, minmax(0, 1fr))",
          lg: "1.3fr repeat(4, minmax(0, 1fr)) auto",
        },
        alignItems: "center",
        gap: 1.5,
      }}
    >
      <Box sx={{ gridColumn: { xs: "1 / -1", lg: "auto" } }}>
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
      </Box>
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
          <MenuItem value={"champion1"}>{t("Champion (1)")}</MenuItem>
          <MenuItem value={"champion2"}>{t("Champion (2)")}</MenuItem>
          <MenuItem value={"champion3"}>{t("Champion (3)")}</MenuItem>
          <MenuItem value={"champion4"}>{t("Champion (4)")}</MenuItem>
          <MenuItem value={"champion5"}>{t("Champion (5)")}</MenuItem>
          <MenuItem value={"champion6"}>{t("Champion (6)")}</MenuItem>
          <MenuItem value={"companion"}>{t("Companion")}</MenuItem>
          <MenuItem value={"groupvehicle"}>{t("Group Vehicle")}</MenuItem>
        </Select>
      </FormControl>
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
          <MenuItem value={"createdAt"}>{t("creation_date")}</MenuItem>
          <MenuItem value={"updatedAt"}>{t("updated_date")}</MenuItem>
          <MenuItem value={"publishedAt"}>{t("Published Date")}</MenuItem>
        </Select>
      </FormControl>
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
      <Button
        variant="outlined"
        color="warning"
        startIcon={<DeleteSweepIcon />}
        disabled={!filteredParams}
        onClick={clearSearchFilters}
        sx={{ gridColumn: { xs: "1 / -1", lg: "auto" } }}
      >
        {t("clear_search_filters")}
      </Button>
    </Box>
  );

  const listToggle = (sx) =>
    layout === "masonry" && (
      <Tooltip title={t("Adversaries")}>
        <IconButton
          aria-label={t("Adversaries")}
          aria-pressed={desktop && sidebarOpen}
          sx={[toolButtonSx, desktop && sidebarOpen && selectedToggleSx, sx]}
          onClick={() =>
            desktop ? setSidebarOpen(!sidebarOpen) : setListDrawerOpen(true)
          }
        >
          <ViewList />
        </IconButton>
      </Tooltip>
    );

  return (
    <Box>
      <AppBarSearch
        value={name}
        onChange={updateName}
        placeholder={t("Adversary Name")}
        chips={activeFilters}
        panel={filterPanel}
      />
      <Box
        ref={filterWrapRef}
        sx={{
          mb: 2.5,
          position: { md: "sticky" },
          top: { md: appBarHeight },
          zIndex: 2,
          ml: { md: -3 },
          ...dockedBarInset,
          mt: { md: `calc(${appBarHeight}px - 4.5em)` },
          pl: sidebarShifts
            ? `clamp(0px, calc(1200px + 2 * ${SIDEBAR_WIDTH} - 100vw), ${SIDEBAR_WIDTH})`
            : 0,
          transition:
            "padding-left 0.2s ease, margin-right 0.3s ease, padding-right 0.3s ease",
        }}
      >
        <Paper
          square={desktop}
          elevation={desktop ? 3 : 1}
          sx={{
            px: { xs: 2, md: 0 },
            py: 1,
            backgroundImage: "none",
            backgroundColor: (theme) => theme.palette.background.paper,
          }}
        >
          <Container disableGutters={!desktop}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 1.5,
                rowGap: 1,
                "& .MuiToggleButton-root, & .MuiButton-root:not(.MuiToggleButton-root)":
                  { height: 36 },
              }}
            >
              {listToggle({ display: { xs: "none", md: "inline-flex" } })}
              <Button
                variant="contained"
                startIcon={<HistoryEdu />}
                onClick={handleOpenCreateNpcModal}
                disabled={dbMode === "cloud" && !cloudUser}
                sx={{
                  flex: { xs: "1 1 100%", md: "none" },
                  order: { xs: 1, md: 0 },
                  whiteSpace: "nowrap",
                }}
              >
                {t("create_npc")}
              </Button>
              {SUPPORTS_LOCAL_DB && (
                <ToggleButtonGroup
                  value={dbMode}
                  exclusive
                  onChange={(_, val) => {
                    if (val !== null) requestModeSwitch(val);
                  }}
                  size="small"
                  sx={{
                    flex: { xs: 1, md: "none" },
                    order: { xs: 2, md: 0 },
                    "& .MuiToggleButton-root": {
                      flex: { xs: 1, md: "none" },
                    },
                  }}
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
              {dbMode === "local" && (
                <Box sx={{ order: { xs: 3, md: 0 } }}>
                  <DriveSync />
                </Box>
              )}
              <Box sx={{ flex: 1, display: { xs: "none", md: "block" } }} />

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.75,
                  order: { xs: 2, md: 0 },
                }}
              >
                {listToggle({ display: { md: "none" } })}
                <Tooltip title={t("More actions")}>
                  <IconButton
                    aria-label={t("More actions")}
                    aria-haspopup="menu"
                    sx={toolButtonSx}
                    onClick={(e) => setToolsAnchor(e.currentTarget)}
                  >
                    <MenuIcon />
                  </IconButton>
                </Tooltip>
                <MuiMenu
                  anchorEl={toolsAnchor}
                  open={Boolean(toolsAnchor)}
                  onClose={() => setToolsAnchor(null)}
                >
                  <MenuItem
                    onClick={() => {
                      setToolsAnchor(null);
                      fileInputRef.current.click();
                    }}
                  >
                    <ListItemIcon>
                      <UploadFile />
                    </ListItemIcon>
                    {t("Add NPC from JSON")}
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      setToolsAnchor(null);
                      handlePasteNpc();
                    }}
                  >
                    <ListItemIcon>
                      <ContentPaste />
                    </ListItemIcon>
                    {t("Add NPC from Clipboard")}
                  </MenuItem>
                  <MenuItem
                    disabled={!filteredList?.length}
                    onClick={() => {
                      setToolsAnchor(null);
                      exportButtonRef.current?.click();
                    }}
                  >
                    <ListItemIcon>
                      <Download />
                    </ListItemIcon>
                    {t("export_npcs_button")}
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      setToolsAnchor(null);
                      setCollapse(!collapse);
                    }}
                  >
                    <ListItemIcon>
                      {collapse ? <UnfoldLess /> : <UnfoldMore />}
                    </ListItemIcon>
                    {collapse ? t("Collapse") : t("Expand")}
                  </MenuItem>
                  <Divider />
                  {[
                    ["masonry", "Masonry", <ViewQuilt key="m" />],
                    ["list", "List + preview", <ViewSidebar key="l" />],
                  ].map(([value, label, icon]) => (
                    <MenuItem
                      key={value}
                      selected={layout === value}
                      onClick={() => {
                        setToolsAnchor(null);
                        setLayout(value);
                      }}
                    >
                      <ListItemIcon>{icon}</ListItemIcon>
                      {label}
                    </MenuItem>
                  ))}
                  {desktop && <Divider />}
                  {desktop &&
                    [
                      ["phone", "Phone", <PhoneIphone key="p" />],
                      ["tablet", "Tablet", <TabletMac key="t" />],
                      ["desktop", "Full width", <DesktopWindows key="d" />],
                    ].map(([value, label, icon]) => {
                      const current =
                        layout === "list" ? previewSize : masonrySize;
                      return (
                        <MenuItem
                          key={value}
                          selected={current === value}
                          onClick={() => {
                            setToolsAnchor(null);
                            (layout === "list"
                              ? setPreviewSize
                              : setMasonrySize)(value);
                          }}
                        >
                          <ListItemIcon>{icon}</ListItemIcon>
                          {label}
                        </MenuItem>
                      );
                    })}
                </MuiMenu>
                <Tooltip title={t("Add NPC from JSON")}>
                  <IconButton
                    aria-label={t("Add NPC from JSON")}
                    sx={desktopToolSx}
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
                  <IconButton
                    aria-label={t("Add NPC from Clipboard")}
                    sx={desktopToolSx}
                    onClick={handlePasteNpc}
                  >
                    <ContentPaste />
                  </IconButton>
                </Tooltip>
                <ExportAllNPCs
                  iconOnly
                  buttonRef={exportButtonRef}
                  sx={desktopToolSx}
                  npcs={filteredList?.length > 0 ? filteredList : []}
                />
                <Tooltip title={collapse ? t("Collapse") : t("Expand")}>
                  <IconButton
                    aria-label={collapse ? t("Collapse") : t("Expand")}
                    sx={desktopToolSx}
                    onClick={() => setCollapse(!collapse)}
                  >
                    {collapse ? <UnfoldLess /> : <UnfoldMore />}
                  </IconButton>
                </Tooltip>
              </Box>

              <Divider
                orientation="vertical"
                flexItem
                sx={{ display: { xs: "none", md: "block" } }}
              />
              <ToggleButtonGroup
                size="small"
                exclusive
                sx={{ display: { xs: "none", md: "inline-flex" } }}
                value={layout}
                onChange={(_, value) => value && setLayout(value)}
                aria-label="Layout"
              >
                <ToggleButton value="masonry" aria-label="Masonry layout">
                  <Tooltip title="Masonry">
                    <ViewQuilt fontSize="small" />
                  </Tooltip>
                </ToggleButton>
                <ToggleButton value="list" aria-label="List and preview layout">
                  <Tooltip title="List + preview (prototype)">
                    <ViewSidebar fontSize="small" />
                  </Tooltip>
                </ToggleButton>
              </ToggleButtonGroup>
              {desktop && (
                <>
                  <Divider orientation="vertical" flexItem />
                  <PreviewWidthToggle
                    value={layout === "list" ? previewSize : masonrySize}
                    onChange={
                      layout === "list" ? setPreviewSize : setMasonrySize
                    }
                  />
                </>
              )}

              <Divider
                orientation="vertical"
                flexItem
                sx={{ display: { xs: "none", md: "block" } }}
              />

              <Box
                sx={{
                  display: { xs: "flex", md: "contents" },
                  alignItems: "center",
                  gap: 1.5,
                  flex: "1 1 100%",
                  order: { xs: 6, md: 0 },
                }}
              >
                <Typography
                  variant="body1"
                  sx={{ fontWeight: 600, whiteSpace: "nowrap" }}
                >
                  {t("filtered_npc_count") + " " + filteredList?.length}
                </Typography>
                {staleNpcs.length > 0 && (
                  <Tooltip title={t("Some NPCs need a data migration")}>
                    <Button
                      variant="outlined"
                      color="warning"
                      startIcon={<SystemUpdateAltIcon />}
                      onClick={() => setMigrationDialogOpen(true)}
                      aria-label={`${t("Migrate")} (${staleNpcs.length})`}
                      sx={{ whiteSpace: "nowrap" }}
                    >
                      <Box
                        component="span"
                        sx={{ display: { xs: "none", sm: "inline" }, mr: 0.5 }}
                      >
                        {t("Migrate")}
                      </Box>
                      ({staleNpcs.length})
                    </Button>
                  </Tooltip>
                )}
                <Tooltip
                  title={selectMode ? t("Exit Select Mode") : t("Select NPCs")}
                >
                  <Button
                    variant={selectMode ? "contained" : "outlined"}
                    startIcon={<LibraryAddCheck />}
                    onClick={toggleSelectMode}
                    sx={{ ml: { xs: "auto", md: 0 } }}
                  >
                    {t("Select")}
                  </Button>
                </Tooltip>
              </Box>
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
                  aria-label={t("Copy")}
                  sx={iconOnlyMobileSx}
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
                  aria-label={t("Move")}
                  sx={iconOnlyMobileSx}
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
                <Tooltip
                  title={`${t("Delete Selected")} (${selectedIds.size})`}
                >
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
          </Container>
        </Paper>
      </Box>
      <Box
        sx={{
          display: layout === "list" ? "contents" : "block",
          ml: sidebarShifts ? SIDEBAR_WIDTH : 0,
          transition: "margin-left 0.2s ease",
        }}
      >
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
        {layout === "list" ? (
          <NpcListPreview
            items={filteredList}
            selectMode={selectMode}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            stickyTop={listTop}
            previewSize={previewSize}
            renderCard={renderNpc}
          />
        ) : (
          <>
            {!desktop && (
              <MobileListBar
                top={appBarHeight}
                title={t("Adversaries")}
                currentName={
                  filteredList?.find((n) => n.id === highlightId)?.name
                }
                currentIndex={
                  filteredList?.findIndex((n) => n.id === highlightId) + 1
                }
                count={filteredList?.length ?? 0}
                onOpen={() => setListDrawerOpen(true)}
              />
            )}
            <MasonryColumns columnWidth={MASONRY_WIDTHS[masonrySize]}>
              {filteredList?.map((npc) => (
                <MasonryCard
                  key={npc.id}
                  id={npc.id}
                  active={highlightId === npc.id}
                  scrollMarginTop={cardScrollMargin}
                >
                  {renderNpc(npc)}
                </MasonryCard>
              ))}
            </MasonryColumns>
            <NpcListDrawer
              persistent={desktop}
              top={appBarHeight}
              open={desktop ? sidebarOpen : listDrawerOpen}
              onClose={() =>
                desktop ? setSidebarOpen(false) : setListDrawerOpen(false)
              }
              items={filteredList}
              selectMode={selectMode}
              selectedIds={selectedIds}
              onSelectionChange={setSelectedIds}
              activeId={highlightId}
              onSelect={focusCard}
            />
          </>
        )}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: 50,
          }}
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
          getMigrations={getPendingNpcMigrations}
        />
        <Dialog
          open={isCreateNpcModalOpen}
          onClose={handleCloseCreateNpcModal}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>{t("create_npc")}</DialogTitle>
          <DialogContent dividers>
            <Box sx={{ mt: 1 }}>
              <SettingRow label={t("Name")} hint={t("optional_name_hint")}>
                <TextField
                  value={createNpcOptions.name}
                  onChange={(evt) =>
                    handleCreateNpcOptionChange("name", evt.target.value)
                  }
                  size="small"
                  sx={{ minWidth: 220 }}
                />
              </SettingRow>

              <SettingRow
                label={t("role_use_quick_assembly")}
                hint={t("role_hint")}
                showDivider={!createNpcOptions.useQuickAssembly}
              >
                <FormControlLabel
                  control={
                    <Switch
                      checked={createNpcOptions.useQuickAssembly}
                      onChange={(evt) =>
                        handleCreateNpcOptionChange(
                          "useQuickAssembly",
                          evt.target.checked,
                        )
                      }
                    />
                  }
                  label=""
                  sx={{ m: 0 }}
                />
              </SettingRow>

              {createNpcOptions.useQuickAssembly && (
                <SettingRow
                  label={t("role")}
                  hint={t("role_select_hint")}
                  showDivider={false}
                  dense
                >
                  <FormControl
                    variant="outlined"
                    size="small"
                    sx={{ minWidth: 180 }}
                  >
                    <Select
                      value={createNpcOptions.role}
                      onChange={(evt) =>
                        handleCreateNpcOptionChange("role", evt.target.value)
                      }
                    >
                      {CREATE_NPC_ROLE_OPTIONS.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {t(option.label)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </SettingRow>
              )}

              {createNpcOptions.useQuickAssembly && (
                <SettingRow
                  label={t("Level")}
                  hint={t("role_level_hint")}
                  dense
                >
                  <FormControl
                    variant="outlined"
                    size="small"
                    sx={{ minWidth: 100 }}
                  >
                    <Select
                      value={createNpcOptions.lvl}
                      onChange={(evt) =>
                        handleCreateNpcOptionChange(
                          "lvl",
                          Number(evt.target.value),
                        )
                      }
                    >
                      {QA_LEVELS.map((n) => (
                        <MenuItem key={n} value={n}>
                          {n}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </SettingRow>
              )}

              <SettingRow label={t("Species")} hint={t("species_hint")}>
                <FormControl
                  variant="outlined"
                  size="small"
                  sx={{ minWidth: 180 }}
                >
                  <Select
                    value={createNpcOptions.species}
                    onChange={(evt) =>
                      handleCreateNpcOptionChange("species", evt.target.value)
                    }
                  >
                    {CREATE_NPC_SPECIES_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {t(option.label)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </SettingRow>

              <SettingRow
                label={t("Rank")}
                hint={
                  createNpcOptions.rank === "companion"
                    ? t("companion_type_hint")
                    : t("set_npc_type_type")
                }
                showDivider={createNpcOptions.rank !== "companion"}
              >
                <FormControl
                  variant="outlined"
                  size="small"
                  sx={{ minWidth: 180 }}
                >
                  <Select
                    value={createNpcOptions.rank}
                    onChange={(evt) =>
                      handleCreateNpcOptionChange("rank", evt.target.value)
                    }
                  >
                    {CREATE_NPC_RANK_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {t(option.label)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </SettingRow>

              {createNpcOptions.rank === "companion" && (
                <SettingRow
                  label={t("skill_level")}
                  hint={t("skill_level_hint")}
                  showDivider={false}
                  dense
                >
                  <FormControl
                    variant="outlined"
                    size="small"
                    sx={{ minWidth: 100 }}
                  >
                    <Select
                      value={createNpcOptions.companionlvl}
                      onChange={(evt) =>
                        handleCreateNpcOptionChange(
                          "companionlvl",
                          Number(evt.target.value),
                        )
                      }
                    >
                      {CREATE_NPC_COMPANION_LVL_OPTIONS.map((n) => (
                        <MenuItem key={n} value={n}>
                          {n}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </SettingRow>
              )}

              {createNpcOptions.rank === "companion" && (
                <SettingRow
                  label={t("player_level")}
                  hint={t("player_level_hint")}
                  showDivider={false}
                  dense
                >
                  <TextField
                    type="number"
                    value={createNpcOptions.companionpclvl}
                    onChange={(evt) =>
                      handleCreateNpcOptionChange(
                        "companionpclvl",
                        Number(evt.target.value) || 5,
                      )
                    }
                    size="small"
                    sx={{ minWidth: 100 }}
                  />
                </SettingRow>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseCreateNpcModal}>{t("Cancel")}</Button>
            <Button variant="contained" onClick={handleCreateNpcConfirm}>
              {t("create_npc")}
            </Button>
          </DialogActions>
        </Dialog>
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
      </Box>
    </Box>
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
  const navigate = useNavigate();
  const ref = useRef();
  const [downloadImage] = useDownloadImage(npc.name, ref);
  const [transferAnchor, setTransferAnchor] = useState(null);
  const [actionsAnchor, setActionsAnchor] = useState(null);
  const [_exportAnchor, setExportAnchor] = useState(null);
  const [actionsSubmenu, setActionsSubmenu] = useState(null); // "export" | "transfer" | null
  const [localShareSnackbarOpen, setLocalShareSnackbarOpen] = useState(false);
  const isLocalDb = dbMode !== "cloud";
  const exportData = canonicalizeForExport("npc", npc);

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

  const closeMenus = () => {
    setTransferAnchor(null);
    setExportAnchor(null);
    setActionsAnchor(null);
    setActionsSubmenu(null);
  };

  const copyJsonToClipboard = async () => {
    await navigator.clipboard.writeText(
      JSON.stringify({ ...exportData, dataType: "npc" }, null, 2),
    );
    closeMenus();
  };

  const downloadJson = () => {
    const safeName = (npc?.name || "npc").replace(/\s+/g, "_").toLowerCase();
    const blob = new Blob(
      [JSON.stringify({ ...exportData, dataType: "npc" }, null, 2)],
      {
        type: "application/json;charset=utf-8",
      },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${safeName}.json`;
    a.click();
    URL.revokeObjectURL(url);
    closeMenus();
  };

  const copyText = async (fmt) => {
    const text = buildItemText("npc", exportData, fmt);
    await navigator.clipboard.writeText(text);
    closeMenus();
  };

  const downloadText = (fmt) => {
    const text = buildItemText("npc", exportData, fmt);
    const ext = fmt === "plain" ? "txt" : "md";
    const safeName = (npc?.name || "npc").replace(/\s+/g, "_").toLowerCase();
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${safeName}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
    closeMenus();
  };

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
                outlineOffset: "-3px",
                borderRadius: 1,
              }
            : {}
        }
      >
        <NpcActorCard
          npc={npc}
          cardRef={ref}
          npcImage={npc.imgurl}
          collapse={collapse}
          variant="interactive"
          onClick={() => {
            if (selectMode) onToggleSelect(npc.id);
            else setCollapse(!collapse);
          }}
        />
      </Box>
      <Box
        sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}
      >
        <Tooltip title={t("Actions")}>
          <IconButton onClick={(e) => setActionsAnchor(e.currentTarget)}>
            <MenuIcon />
          </IconButton>
        </Tooltip>
        <MuiMenu
          anchorEl={actionsAnchor}
          open={Boolean(actionsAnchor)}
          onClose={closeMenus}
          slotProps={{
            transition: { onExited: () => setActionsSubmenu(null) },
          }}
        >
          {actionsSubmenu === null && [
            <MenuItem
              key="edit"
              onClick={() => {
                closeMenus();
                navigate(
                  `/npc-gallery/${npc.id}${filterParams ? (filterParams.startsWith("?") ? filterParams : `?${filterParams}`) : ""}`,
                );
              }}
            >
              <ListItemIcon>
                <Edit fontSize="small" />
              </ListItemIcon>
              <ListItemText primary={t("Edit")} />
            </MenuItem>,
            <MenuItem key="export" onClick={() => setActionsSubmenu("export")}>
              <ListItemIcon>
                <Code fontSize="small" />
              </ListItemIcon>
              <ListItemText primary={t("Export")} />
              <ChevronRight fontSize="small" />
            </MenuItem>,
            <MenuItem
              key="transfer"
              onClick={() => setActionsSubmenu("transfer")}
            >
              <ListItemIcon>
                <FileCopy fontSize="small" />
              </ListItemIcon>
              <ListItemText primary={t("Copy / Move")} />
              <ChevronRight fontSize="small" />
            </MenuItem>,
            <MenuItem
              key="delete"
              onClick={() => {
                closeMenus();
                deleteNpc(npc)();
              }}
            >
              <ListItemIcon>
                <Delete fontSize="small" />
              </ListItemIcon>
              <ListItemText primary={t("Delete")} />
            </MenuItem>,
            <MenuItem
              key="share"
              sx={isLocalDb ? { opacity: 0.38 } : undefined}
              onClick={() => {
                closeMenus();
                if (isLocalDb) {
                  setLocalShareSnackbarOpen(true);
                  return;
                }
                shareNpc(npc.id);
              }}
            >
              <ListItemIcon>
                <Share fontSize="small" />
              </ListItemIcon>
              <ListItemText primary={t("Share URL")} />
            </MenuItem>,
            <MenuItem
              key="download"
              onClick={() => {
                closeMenus();
                expandAndDownloadImage();
              }}
            >
              <ListItemIcon>
                <Download fontSize="small" />
              </ListItemIcon>
              <ListItemText primary={t("Download as Image")} />
            </MenuItem>,
          ]}
          {actionsSubmenu === "export" && [
            <MenuItem key="back" onClick={() => setActionsSubmenu(null)}>
              <ListItemIcon>
                <ChevronLeft fontSize="small" />
              </ListItemIcon>
              <ListItemText primary={t("Export")} />
            </MenuItem>,
            <Divider key="div" />,
            <MenuItem key="copy-json" onClick={copyJsonToClipboard}>
              {t("copy_json_clipboard")}
            </MenuItem>,
            <MenuItem key="dl-json" onClick={downloadJson}>
              {t("export_json_file")}
            </MenuItem>,
            <Divider key="div2" />,
            <MenuItem key="copy-md" onClick={() => copyText("markdown")}>
              {t("Copy Markdown to Clipboard")}
            </MenuItem>,
            <MenuItem key="dl-md" onClick={() => downloadText("markdown")}>
              {t("Export as Markdown (.md)")}
            </MenuItem>,
            <Divider key="div3" />,
            <MenuItem key="copy-plain" onClick={() => copyText("plain")}>
              {t("Copy Plaintext to Clipboard")}
            </MenuItem>,
            <MenuItem key="dl-plain" onClick={() => downloadText("plain")}>
              {t("Export as Plaintext (.txt)")}
            </MenuItem>,
            <MenuItem key="copy-obs" onClick={() => copyText("obsidian")}>
              {t("Copy Obsidian (BlueCorvid) to Clipboard")}
            </MenuItem>,
            <MenuItem key="dl-obs" onClick={() => downloadText("obsidian")}>
              {t("Export as Obsidian (.md)")}
            </MenuItem>,
          ]}
          {actionsSubmenu === "transfer" && [
            <MenuItem key="back" onClick={() => setActionsSubmenu(null)}>
              <ListItemIcon>
                <ChevronLeft fontSize="small" />
              </ListItemIcon>
              <ListItemText primary={t("Copy / Move")} />
            </MenuItem>,
            <Divider key="div" />,
            <MenuItem
              key="copy-local"
              onClick={() => {
                closeMenus();
                copyNpcToLocal(npc)();
              }}
            >
              <ListItemIcon>
                <StorageIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary={t("Copy to Local")} />
            </MenuItem>,
            <MenuItem
              key="copy-cloud"
              disabled={!cloudUser}
              onClick={() => {
                closeMenus();
                copyNpcToCloud(npc)();
              }}
            >
              <ListItemIcon>
                <CloudIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary={t("Copy to Cloud")} />
            </MenuItem>,
            <Divider key="div2" />,
            <MenuItem
              key="move-local"
              onClick={() => {
                closeMenus();
                moveNpcToLocal(npc)();
              }}
            >
              <ListItemIcon>
                <StorageIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary={t("Move to Local")} />
            </MenuItem>,
            <MenuItem
              key="move-cloud"
              disabled={!cloudUser}
              onClick={() => {
                closeMenus();
                moveNpcToCloud(npc)();
              }}
            >
              <ListItemIcon>
                <CloudIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary={t("Move to Cloud")} />
            </MenuItem>,
          ]}
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
            style={{ display: "inline-flex", alignItems: "center" }}
          >
            <IconButton>
              <Edit />
            </IconButton>
          </RouterLink>
        </Tooltip>
        <Export name={`${npc.name}`} dataType="npc" data={npc} />
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
        <Tooltip title={t("Delete")}>
          <IconButton onClick={deleteNpc(npc)}>
            <Delete />
          </IconButton>
        </Tooltip>
        <Tooltip
          title={
            isLocalDb ? (
              <>
                {t("Share URL")}
                <br />
                {t("Disabled for local")}
              </>
            ) : (
              t("Share URL")
            )
          }
        >
          <span
            onClick={
              isLocalDb ? () => setLocalShareSnackbarOpen(true) : undefined
            }
          >
            <IconButton onClick={() => shareNpc(npc.id)} disabled={isLocalDb}>
              <Share />
            </IconButton>
          </span>
        </Tooltip>
        <Snackbar
          open={localShareSnackbarOpen}
          autoHideDuration={2500}
          onClose={() => setLocalShareSnackbarOpen(false)}
          message={`${t("Share URL")}: ${t("Disabled for local")}`}
        />
        <Tooltip title={t("Download as Image")}>
          <IconButton onClick={expandAndDownloadImage}>
            <Download />
          </IconButton>
        </Tooltip>
        <Tooltip
          title={`Schema version ${npc.schemaVersion ?? 0} of ${NPC_CURRENT_SCHEMA_VERSION} (${npcNeedsMigration(npc) ? "migration needed" : "up to date"})`}
        >
          <Chip
            label={`v${npc.schemaVersion ?? 0}`}
            size="small"
            color={npcNeedsMigration(npc) ? "warning" : "default"}
            variant="outlined"
            sx={{ fontSize: "0.85rem" }}
          />
        </Tooltip>
      </Box>
    </Grid>
  );
}
