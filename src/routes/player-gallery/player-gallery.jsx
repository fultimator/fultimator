import { selectedToggleSx } from "../../components/common/selectedToggleSx";
import { useState, useRef, useEffect, useMemo, useDeferredValue } from "react";
import HelpFeedbackDialog from "../../components/appbar/HelpFeedbackDialog";
import { useDeleteConfirmation } from "../../hooks/useDeleteConfirmation";
import DeleteConfirmationDialog from "../../components/common/DeleteConfirmationDialog";
import MigrationDialog from "../../components/common/MigrationDialog";
import {
  playerNeedsMigration,
  getPendingPlayerMigrations,
  PLAYER_CURRENT_SCHEMA_VERSION,
  applyPreSaveTransforms,
  applyPostLoadTransforms,
} from "../../libs/actor";
import {
  stampSave,
  stampCreate,
  compareTimestamps,
} from "../../libs/actor/timestamps";
import SystemUpdateAltIcon from "@mui/icons-material/SystemUpdateAlt";
import { useNavigate } from "react-router";
import { rankTags } from "../../hooks/useTagSuggestions";

import {
  Autocomplete,
  Chip,
  Divider,
  IconButton,
  useMediaQuery,
  ListItemIcon,
  ListItemText,
  Menu as MuiMenu,
  Skeleton,
  Tooltip,
  Typography,
  Snackbar,
  Paper,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Collapse,
  Container,
  ToggleButtonGroup,
  ToggleButton,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  Radio,
  RadioGroup,
  FormControlLabel,
} from "@mui/material";
import MasonryColumns from "../../components/common/MasonryColumns";
import { usePersistentState } from "../../hooks/usePersistentState";
import { useDockedBarInset } from "../../hooks/useDockedBarInset";
import { useAppBarTop } from "../npc-gallery/listPreview/useAppBarTop";
import MasonryCard from "../npc-gallery/listPreview/MasonryCard";
import { scrollToCardId } from "../npc-gallery/listPreview/utils";
import PhoneIphone from "@mui/icons-material/PhoneIphone";
import TabletMac from "@mui/icons-material/TabletMac";
import DesktopWindows from "@mui/icons-material/DesktopWindows";
import MobileListBar from "../npc-gallery/listPreview/MobileListBar";
import PreviewWidthToggle from "../npc-gallery/listPreview/PreviewWidthToggle";
import {
  MASONRY_WIDTHS,
  MOBILE_LIST_BAR_HEIGHT,
  SIDEBAR_WIDTH,
} from "../npc-gallery/listPreview/constants";
import NpcListPreview from "../npc-gallery/NpcListPreview";
import NpcListDrawer from "../npc-gallery/NpcListDrawer";
import AppBarSearch from "../../components/appbar/AppBarSearch";
import Layout from "../../components/Layout";
import { SignIn } from "../../components/auth";
import {
  ContentPaste,
  ChevronLeft,
  ChevronRight,
  Code,
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
  ViewQuilt,
  ViewList,
  ViewSidebar,
  UnfoldLess,
  UnfoldMore,
  ExpandLess,
  ExpandMore,
  Menu as MenuIcon,
  UploadFile,
  DeleteSweep,
} from "@mui/icons-material";
import StorageIcon from "@mui/icons-material/Storage";
import CloudIcon from "@mui/icons-material/Cloud";
import { useTranslate } from "../../translation/translate";
import PlayerCardGallery from "/src/libs/player/PlayerCardGallery";
import Export from "../../components/Export";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { validateCharacter } from "../../utility/validateJson";
import { SUPPORTS_LOCAL_DB, IS_ELECTRON } from "../../platform";
import DriveSync from "../../components/DriveSync";
import { useDatabaseContext } from "../../context/useDatabaseContext";
import { useDatabase } from "../../hooks/useDatabase";
import JSZip from "jszip";
import useDownload from "../../hooks/useDownload";
import useDownloadImage from "../../hooks/useDownloadImage";
import SettingRow from "../../components/common/SettingRow";
import classList from "../../libs/classes";
import defaultConsumables from "../../libs/consumables";
import { buildItemText } from "../../libs/buildItemText";
import { createUniqueFilenameTracker } from "../../utility/sanitizeFilename";
import MnemosphereCreateDialog from "/src/libs/player/MnemosphereCreateDialog";
import {
  canonicalizeForTransfer,
  normalizeOwnershipForTarget,
} from "../../libs/exportTransforms";

const toolButtonSx = {
  width: 36,
  height: 36,
  border: 1,
  borderColor: "divider",
  borderRadius: 1,
};

export default function PlayerGallery() {
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
  const defaultCreatePlayerOptions = {
    name: "",
    advancement: false,
    automaticClassLevel: true,
    defaultView: "normal",
    expandAllSections: true,
    autoEquipUnarmed: true,
    optionalRules: {
      quirks: false,
      campActivities: false,
      zeroPower: false,
      technospheres: false,
      technospheresVariant: "standard",
      innateClasses: [],
    },
  };
  const [name, setName] = useState("");
  const deferredName = useDeferredValue(name);
  const [sort, setSort] = useState("name");
  const [direction, setDirection] = useState("ascending");
  const [tagFilter, setTagFilter] = useState(null);
  const [layout, setLayout] = usePersistentState(
    "playerGallery.layout",
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
  const desktop = useMediaQuery("(min-width: 900px)");
  const dockedBarInset = useDockedBarInset();
  const [sidebarOpen, setSidebarOpen] = usePersistentState(
    "playerGallery.sidebar",
    false,
  );
  const [listDrawerOpen, setListDrawerOpen] = useState(false);
  const [toolsAnchor, setToolsAnchor] = useState(null);
  const [expandAll, setExpandAll] = usePersistentState(
    "playerGallery.expandAll",
    false,
  );
  const [highlightId, setHighlightId] = useState(null);
  const sidebarShifts = desktop && sidebarOpen && layout === "masonry";
  const appBarHeight = useAppBarTop();
  const filterWrapRef = useRef(null);
  const [listTop, setListTop] = useState(appBarHeight + 16);

  useEffect(() => {
    const el = filterWrapRef.current;
    if (!el || !desktop) return undefined;
    const update = () => setListTop(appBarHeight + el.offsetHeight + 4);
    update();
    const observer = new window.ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [desktop, appBarHeight]);

  const playerColumns = useMemo(
    () => [
      {
        field: "name",
        headerName: t("Name"),
        flex: 2,
        minWidth: desktop ? 160 : 80,
        cellClassName: "npc-name-cell",
      },
      {
        field: "lvl",
        headerName: t("Lvl"),
        type: "number",
        width: desktop ? 72 : 48,
        headerAlign: "left",
        align: "left",
      },
      {
        field: "classNames",
        headerName: t("Classes"),
        flex: 2,
        minWidth: desktop ? 140 : 90,
      },
    ],
    [t, desktop],
  );
  const [open, setOpen] = useState(false);
  const [isBugDialogOpen, setIsBugDialogOpen] = useState(false);
  const [isCreatePlayerModalOpen, setIsCreatePlayerModalOpen] = useState(false);
  const [createPlayerOptions, setCreatePlayerOptions] = useState(
    defaultCreatePlayerOptions,
  );
  const [startingMnemosphereDialogOpen, setStartingMnemosphereDialogOpen] =
    useState(false);

  // Deletion confirmation states
  const playerToDeleteRef = useRef(null);
  const isBulkDeleteRef = useRef(false);

  const performDelete = async () => {
    if (isBulkDeleteRef.current) {
      for (const id of selectedIds) {
        await db.deleteDoc(db.doc("player-personal", id));
      }
      setSelectedIds(new Set());
    } else if (playerToDeleteRef.current) {
      await db.deleteDoc(
        db.doc("player-personal", playerToDeleteRef.current.id),
      );
      playerToDeleteRef.current = null;
      setPlayerToDelete(null);
    }
    closeDeleteDialog();
  };

  const {
    isOpen: deleteDialogOpen,
    closeDialog: closeDeleteDialog,
    handleDelete,
  } = useDeleteConfirmation({
    onConfirm: performDelete,
  });

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

  const { dbMode, requestModeSwitch, cloudUser, activeUid } =
    useDatabaseContext();
  const db = useDatabase();
  const localDb = useDatabase("local");
  const cloudDb = useDatabase("cloud");
  const [download] = useDownload();

  const playerQuery = useMemo(() => {
    const constraints =
      dbMode === "cloud" && cloudUser
        ? [db.where("uid", "==", cloudUser.uid)]
        : [];
    return db.query(db.collection("player-personal"), ...constraints);
  }, [db, dbMode, cloudUser]);
  const [personalList, loading, err] = db.useCollectionData(playerQuery);

  const filteredList = useMemo(
    () =>
      personalList
        ? personalList
            .map(applyPostLoadTransforms)
            .filter((item) => {
              if (
                deferredName !== "" &&
                !item.name.toLowerCase().includes(deferredName.toLowerCase())
              )
                return false;
              if (
                tagFilter &&
                !item.tags?.some(
                  (tag) => tag.name?.toUpperCase() === tagFilter.toUpperCase(),
                )
              )
                return false;
              return true;
            })
            .sort((item1, item2) => {
              if (direction === "ascending") {
                if (sort === "createdAt")
                  return compareTimestamps(item1.createdAt, item2.createdAt);
                else if (sort === "updatedAt")
                  return compareTimestamps(item1.updatedAt, item2.updatedAt);
                return item1.name.localeCompare(item2.name);
              } else {
                if (sort === "createdAt")
                  return compareTimestamps(item2.createdAt, item1.createdAt);
                else if (sort === "updatedAt")
                  return compareTimestamps(item2.updatedAt, item1.updatedAt);
                return item2.name.localeCompare(item1.name);
              }
            })
        : [],
    [personalList, deferredName, sort, direction, tagFilter],
  );

  const sortedTags = useMemo(() => rankTags(personalList), [personalList]);

  const gridItems = useMemo(
    () =>
      filteredList.map((player) => ({
        ...player,
        classNames: (player.classes || [])
          .filter((c) => c?.name)
          .map((c) => c.name)
          .join(", "),
      })),
    [filteredList],
  );

  const [snackMsg, setSnackMsg] = useState(null);

  // Migration
  const [migrationDialogOpen, setMigrationDialogOpen] = useState(false);

  // Select mode
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [copyAnchor, setCopyAnchor] = useState(null);
  const [moveAnchor, setMoveAnchor] = useState(null);

  if (err?.code === "quota-exceeded") {
    return (
      <Layout>
        <Paper elevation={3} sx={{ marginBottom: 5, padding: 4 }}>
          {t(
            "Apologies, fultimator has reached its read quota at the moment, please try again tomorrow. (Around 12-24 hours)",
          )}
        </Paper>
      </Layout>
    );
  }

  const addPlayer = async function (
    options = defaultCreatePlayerOptions,
    forcedId = null,
  ) {
    const technospheresEnabled = options.optionalRules?.technospheres ?? false;
    const technospheresVariant =
      options.optionalRules?.technospheresVariant ?? "standard";
    const usesInnateClassRules =
      technospheresEnabled && technospheresVariant !== "hoplospheres";
    const grantsTechnosphereHpMpBonus =
      technospheresEnabled &&
      ["standard", "mnemospheres"].includes(technospheresVariant);
    const enablesMnemospheres =
      technospheresEnabled && technospheresVariant !== "hoplospheres";

    const innateClassNames = usesInnateClassRules
      ? (options.optionalRules?.innateClasses ?? [])
      : [];
    const startingClasses = innateClassNames
      .map((className) =>
        classList.find((classDef) => classDef.name === className),
      )
      .filter(Boolean)
      .map((classDef) => ({
        name: classDef.name,
        lvl: 1,
        benefits: classDef.benefits,
        skills: (classDef.skills ?? []).slice().sort((a, b) => {
          if (a.skillName < b.skillName) return -1;
          if (a.skillName > b.skillName) return 1;
          return 0;
        }),
        heroic: classDef.heroic || { name: "", description: "" },
        spells: classDef.spells || [],
        isHomebrew: false,
      }));

    const data = {
      name: options.name,
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
      classes: startingClasses,
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
        },
      ],
      armor: [],
      consumables: defaultConsumables.map((c) => ({ ...c })),
      notes: [],
      modifiers: {
        hp: grantsTechnosphereHpMpBonus ? 5 : 0,
        mp: grantsTechnosphereHpMpBonus ? 5 : 0,
        ip: 0,
        def: 0,
        mdef: 0,
        init: 0,
        meleePrec: 0,
        rangedPrec: 0,
        magicPrec: 0,
      },
      equippedSlots: {
        mainHand: {
          source: "weapons",
          name: "Unarmed Strike",
          index: 0,
        },
        offHand: {
          source: "weapons",
          name: "Unarmed Strike",
          index: 0,
        },
      },
      settings: {
        defaultView: options.defaultView,
        expandAllSections: options.expandAllSections ?? true,
        advancement: options.advancement,
        automaticClassLevel:
          options.optionalRules?.technospheres ||
          options.automaticClassLevel !== false,
        autoEquipUnarmed: options.autoEquipUnarmed ?? true,
        optionalRules: {
          ...options.optionalRules,
        },
        ...(options.optionalRules?.technospheres
          ? { specialSkillOverrides: { "Dual Shieldbearer": true } }
          : {}),
      },
      ...(technospheresEnabled
        ? {
            equipment: [
              {
                mnemospheres:
                  enablesMnemospheres && options.startingMnemosphere
                    ? [options.startingMnemosphere]
                    : [],
                hoplospheres: [],
              },
            ],
          }
        : {}),
      ...(activeUid ? { uid: activeUid } : {}),
    };

    try {
      // Normalize and migrate before saving
      const normalizedData = stampCreate(
        applyPreSaveTransforms(applyPostLoadTransforms(data)),
      );
      if (forcedId) {
        await db.setDoc(db.doc("player-personal", forcedId), normalizedData);
        return forcedId;
      }
      const res = await db.addDoc(
        db.collection("player-personal"),
        normalizedData,
      );
      return res.id;
    } catch (e) {
      console.debug(e);
      return null;
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
      data = stampCreate(applyPreSaveTransforms(data));

      const res = await db.addDoc(db.collection("player-personal"), data);
      console.debug("Document added with ID: ", res.id);
    } catch (error) {
      console.error("Error uploading character from JSON:", error);
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

  const notify = (msg) => setSnackMsg(msg);

  const uniqueName = (name, existingNames) => {
    let newName = name;
    let counter = 1;
    while (existingNames.includes(newName)) {
      newName = `${name} (${counter})`;
      counter++;
    }
    return newName;
  };

  const preparePlayerTransferData = (player, target, nextName) => {
    const canonical = canonicalizeForTransfer("pc", player);
    const normalized = normalizeOwnershipForTarget(
      { ...canonical, name: nextName, published: false },
      target,
      cloudUser?.uid,
    );
    return stampSave(normalized, normalized.createdAt);
  };

  const exportPlayersAsZip = async (players, filename) => {
    if (!players.length) return;
    const zip = new JSZip();
    const uniqueFilename = createUniqueFilenameTracker();
    players.forEach((p) => {
      const canonical = canonicalizeForTransfer("pc", p);
      zip.file(
        `${uniqueFilename(p.name)}.json`,
        JSON.stringify(canonical, null, 2),
      );
    });
    const content = await zip.generateAsync({ type: "blob" });
    download(URL.createObjectURL(content), filename);
  };

  const exportSelectedAsJson = () =>
    exportPlayersAsZip(
      filteredList.filter((p) => selectedIds.has(p.id)),
      "selected_players.zip",
    );

  const exportAllAsJson = () => exportPlayersAsZip(filteredList, "players.zip");

  const copyPlayerToLocal = (player) => async () => {
    try {
      const existing = await localDb.getDocs(
        localDb.query(localDb.collection("player-personal")),
      );
      const existingNames = existing.map((n) => n.name);
      const newName = uniqueName(player.name, existingNames);
      const data = preparePlayerTransferData(player, "local", newName);
      await localDb.addDoc(localDb.collection("player-personal"), data);
      notify(t("Copied to Local"));
    } catch {
      notify(t("Failed to copy to Local"));
    }
  };

  const copyPlayerToCloud = (player) => async () => {
    if (!cloudUser) {
      notify(t("Sign in to copy to Cloud"));
      return;
    }
    try {
      const existing = await cloudDb.getDocs(
        cloudDb.query(cloudDb.collection("player-personal")),
      );
      const existingNames = existing.map((n) => n.name);
      const newName = uniqueName(player.name, existingNames);
      const data = preparePlayerTransferData(player, "cloud", newName);
      await cloudDb.addDoc(cloudDb.collection("player-personal"), data);
      notify(t("Copied to Cloud"));
    } catch {
      notify(t("Failed to copy to Cloud"));
    }
  };

  const movePlayerToLocal = (player) => async () => {
    try {
      const existing = await localDb.getDocs(
        localDb.query(localDb.collection("player-personal")),
      );
      const existingNames = existing.map((n) => n.name);
      const newName = uniqueName(player.name, existingNames);
      const data = preparePlayerTransferData(player, "local", newName);
      await localDb.addDoc(localDb.collection("player-personal"), data);
      await db.deleteDoc(db.doc("player-personal", player.id));
      notify(t("Moved to Local"));
    } catch {
      notify(t("Failed to move to Local"));
    }
  };

  const movePlayerToCloud = (player) => async () => {
    if (!cloudUser) {
      notify(t("Sign in to move to Cloud"));
      return;
    }
    try {
      const existing = await cloudDb.getDocs(
        cloudDb.query(cloudDb.collection("player-personal")),
      );
      const existingNames = existing.map((n) => n.name);
      const newName = uniqueName(player.name, existingNames);
      const data = preparePlayerTransferData(player, "cloud", newName);
      await cloudDb.addDoc(cloudDb.collection("player-personal"), data);
      await db.deleteDoc(db.doc("player-personal", player.id));
      notify(t("Moved to Cloud"));
    } catch {
      notify(t("Failed to move to Cloud"));
    }
  };

  const stalePlayers = (personalList ?? []).filter(playerNeedsMigration);

  const handleMigrateAllPlayers = async (actors) => {
    for (const player of actors) {
      const ref = db.doc("player-personal", player.id);
      const migrated = applyPostLoadTransforms(player);
      await db.setDoc(ref, applyPreSaveTransforms(migrated));
    }
    // Wait longer for Firestore to propagate changes to real-time listeners
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  const toggleSelectMode = () => {
    setSelectMode((prev) => {
      if (prev) setSelectedIds(new Set());
      return !prev;
    });
  };

  const toggleSelectPlayer = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const deleteSelected = (e) => {
    isBulkDeleteRef.current = true;
    setIsBulkDelete(true);
    handleDelete(e);
  };

  const copySelectedToLocal = async () => {
    const selected = filteredList.filter((p) => selectedIds.has(p.id));
    if (!selected.length) return;
    try {
      const existing = await localDb.getDocs(
        localDb.query(localDb.collection("player-personal")),
      );
      const usedNames = existing.map((n) => n.name);
      for (const p of selected) {
        const newName = uniqueName(p.name, usedNames);
        usedNames.push(newName);
        const data = preparePlayerTransferData(p, "local", newName);
        await localDb.addDoc(localDb.collection("player-personal"), data);
      }
      notify(t("Copied to Local"));
    } catch {
      notify(t("Failed to copy to Local"));
    }
  };

  const copySelectedToCloud = async () => {
    if (!cloudUser) {
      notify(t("Sign in to copy to Cloud"));
      return;
    }
    const selected = filteredList.filter((p) => selectedIds.has(p.id));
    if (!selected.length) return;
    try {
      const existing = await cloudDb.getDocs(
        cloudDb.query(cloudDb.collection("player-personal")),
      );
      const usedNames = existing.map((n) => n.name);
      for (const p of selected) {
        const newName = uniqueName(p.name, usedNames);
        usedNames.push(newName);
        const data = preparePlayerTransferData(p, "cloud", newName);
        await cloudDb.addDoc(cloudDb.collection("player-personal"), data);
      }
      notify(t("Copied to Cloud"));
    } catch {
      notify(t("Failed to copy to Cloud"));
    }
  };

  const moveSelectedToLocal = async () => {
    const selected = filteredList.filter((p) => selectedIds.has(p.id));
    if (!selected.length) return;
    if (!window.confirm(`Move ${selected.length} player(s) to Local?`)) return;
    try {
      const existing = await localDb.getDocs(
        localDb.query(localDb.collection("player-personal")),
      );
      const usedNames = existing.map((n) => n.name);
      for (const p of selected) {
        const newName = uniqueName(p.name, usedNames);
        usedNames.push(newName);
        const data = preparePlayerTransferData(p, "local", newName);
        await localDb.addDoc(localDb.collection("player-personal"), data);
        await db.deleteDoc(db.doc("player-personal", p.id));
      }
      setSelectedIds(new Set());
      notify(t("Moved to Local"));
    } catch {
      notify(t("Failed to move to Local"));
    }
  };

  const moveSelectedToCloud = async () => {
    if (!cloudUser) {
      notify(t("Sign in to move to Cloud"));
      return;
    }
    const selected = filteredList.filter((p) => selectedIds.has(p.id));
    if (!selected.length) return;
    if (!window.confirm(`Move ${selected.length} player(s) to Cloud?`)) return;
    try {
      const existing = await cloudDb.getDocs(
        cloudDb.query(cloudDb.collection("player-personal")),
      );
      const usedNames = existing.map((n) => n.name);
      for (const p of selected) {
        const newName = uniqueName(p.name, usedNames);
        usedNames.push(newName);
        const data = preparePlayerTransferData(p, "cloud", newName);
        await cloudDb.addDoc(cloudDb.collection("player-personal"), data);
        await db.deleteDoc(db.doc("player-personal", p.id));
      }
      setSelectedIds(new Set());
      notify(t("Moved to Cloud"));
    } catch {
      notify(t("Failed to move to Cloud"));
    }
  };

  const copyAllToLocal = async () => {
    try {
      const existing = await localDb.getDocs(
        localDb.query(localDb.collection("player-personal")),
      );
      const usedNames = existing.map((n) => n.name);
      for (const p of filteredList) {
        const newName = uniqueName(p.name, usedNames);
        usedNames.push(newName);
        const data = preparePlayerTransferData(p, "local", newName);
        await localDb.addDoc(localDb.collection("player-personal"), data);
      }
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
    try {
      const existing = await cloudDb.getDocs(
        cloudDb.query(cloudDb.collection("player-personal")),
      );
      const usedNames = existing.map((n) => n.name);
      for (const p of filteredList) {
        const newName = uniqueName(p.name, usedNames);
        usedNames.push(newName);
        const data = preparePlayerTransferData(p, "cloud", newName);
        await cloudDb.addDoc(cloudDb.collection("player-personal"), data);
      }
      notify(t("Copied to Cloud"));
    } catch {
      notify(t("Failed to copy to Cloud"));
    }
  };

  const moveAllToLocal = async () => {
    if (!window.confirm(`Move all ${filteredList.length} player(s) to Local?`))
      return;
    try {
      const existing = await localDb.getDocs(
        localDb.query(localDb.collection("player-personal")),
      );
      const usedNames = existing.map((n) => n.name);
      for (const p of filteredList) {
        const newName = uniqueName(p.name, usedNames);
        usedNames.push(newName);
        const data = preparePlayerTransferData(p, "local", newName);
        await localDb.addDoc(localDb.collection("player-personal"), data);
        await db.deleteDoc(db.doc("player-personal", p.id));
      }
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
    if (!window.confirm(`Move all ${filteredList.length} player(s) to Cloud?`))
      return;
    try {
      const existing = await cloudDb.getDocs(
        cloudDb.query(cloudDb.collection("player-personal")),
      );
      const usedNames = existing.map((n) => n.name);
      for (const p of filteredList) {
        const newName = uniqueName(p.name, usedNames);
        usedNames.push(newName);
        const data = preparePlayerTransferData(p, "cloud", newName);
        await cloudDb.addDoc(cloudDb.collection("player-personal"), data);
        await db.deleteDoc(db.doc("player-personal", p.id));
      }
      notify(t("Moved to Cloud"));
    } catch {
      notify(t("Failed to move to Cloud"));
    }
  };

  const deletePlayer = (player) => (e) => {
    playerToDeleteRef.current = player;
    setPlayerToDelete(player);
    isBulkDeleteRef.current = false;
    setIsBulkDelete(false);
    handleDelete(e);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleBugDialogClose = () => {
    setIsBugDialogOpen(false);
  };

  const handleOpenCreatePlayerModal = () => {
    setCreatePlayerOptions(defaultCreatePlayerOptions);
    setIsCreatePlayerModalOpen(true);
  };

  const handleCloseCreatePlayerModal = () => {
    setIsCreatePlayerModalOpen(false);
  };

  const handleCreatePlayerOptionChange = (field, value) => {
    setCreatePlayerOptions((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCreateOptionalRuleChange = (rule, checked) => {
    setCreatePlayerOptions((prev) => ({
      ...prev,
      ...(rule === "technospheres" && checked
        ? { automaticClassLevel: true }
        : {}),
      optionalRules: {
        ...prev.optionalRules,
        [rule]: checked,
      },
    }));
  };

  const handleCreateOptionalRuleValueChange = (rule, value) => {
    setCreatePlayerOptions((prev) => ({
      ...prev,
      optionalRules: {
        ...prev.optionalRules,
        [rule]: value,
      },
    }));
  };

  const handleCreatePlayerConfirm = async () => {
    const newPlayerId = crypto.randomUUID();
    handleCloseCreatePlayerModal();
    navigate(`/player-edit/${newPlayerId}`, {
      state: { from: "/pc-gallery", creating: true },
    });
    void addPlayer(createPlayerOptions, newPlayerId).then((savedId) => {
      if (!savedId) {
        console.error("Failed to persist newly created player", newPlayerId);
      }
    });
    setCreatePlayerOptions(defaultCreatePlayerOptions);
  };

  const handleStartingMnemosphereConfirm = (mnemo) => {
    setStartingMnemosphereDialogOpen(false);
    setCreatePlayerOptions((prev) => ({ ...prev, startingMnemosphere: mnemo }));
  };

  const handleStartingMnemosphereSkip = () => {
    setStartingMnemosphereDialogOpen(false);
    setCreatePlayerOptions((prev) => ({ ...prev, startingMnemosphere: null }));
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
    navigate(path, { state: { from: "/pc-gallery", dbMode } });
  };

  const renderPlayer = (player) => (
    <Box
      sx={{
        marginBottom: "20px",
        ...(selectMode
          ? {
              cursor: "pointer",
              outline: selectedIds.has(player.id) ? "3px solid" : "1px dashed",
              outlineColor: selectedIds.has(player.id)
                ? "primary.main"
                : "divider",
              borderRadius: 1,
            }
          : {}),
      }}
      onClick={selectMode ? () => toggleSelectPlayer(player.id) : undefined}
    >
      <PlayerGalleryCardActions
        player={player}
        t={t}
        dbMode={dbMode}
        handleNavigation={handleNavigation}
        deletePlayer={deletePlayer}
        sharePlayer={sharePlayer}
        copyPlayerToLocal={copyPlayerToLocal}
        copyPlayerToCloud={copyPlayerToCloud}
        movePlayerToLocal={movePlayerToLocal}
        movePlayerToCloud={movePlayerToCloud}
        expandAll={expandAll}
      />
    </Box>
  );

  const focusCard = (id) => {
    scrollToCardId(id);
    setHighlightId(id);
  };

  const cardScrollMargin = desktop
    ? listTop
    : appBarHeight + MOBILE_LIST_BAR_HEIGHT + 8;

  const clearFilters = () => {
    setName("");
    setSort("name");
    setDirection("ascending");
    setTagFilter(null);
  };

  const activeFilters = [
    tagFilter,
    sort !== "name" && sort,
    direction !== "ascending" && direction,
  ].filter(Boolean);

  const filterPanel = (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "repeat(2, minmax(0, 1fr))",
          md: "1.3fr repeat(2, minmax(0, 1fr)) auto",
        },
        alignItems: "center",
        gap: 1.5,
      }}
    >
      <Box sx={{ gridColumn: { xs: "1 / -1", md: "auto" } }}>
        <Autocomplete
          fullWidth
          size="small"
          options={sortedTags}
          value={tagFilter}
          onChange={(event, newValue) => setTagFilter(newValue)}
          filterOptions={(options, { inputValue }) => {
            const inputValueUpper = inputValue.toUpperCase();
            return options.filter((option) =>
              option.toUpperCase().includes(inputValueUpper),
            );
          }}
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
        <InputLabel id="sort">{t("Sort:")}</InputLabel>
        <Select
          labelId="sort"
          id="select-sort"
          value={sort}
          label="Sort:"
          onChange={(evt) => setSort(evt.target.value)}
        >
          <MenuItem value={"name"}>{t("Name")}</MenuItem>
          <MenuItem value={"createdAt"}>{t("creation_date")}</MenuItem>
          <MenuItem value={"updatedAt"}>{t("updated_date")}</MenuItem>
        </Select>
      </FormControl>
      <FormControl fullWidth size="small">
        <InputLabel id="direction">{t("Direction:")}</InputLabel>
        <Select
          labelId="direction"
          id="select-direction"
          value={direction}
          label="direction:"
          onChange={(evt) => setDirection(evt.target.value)}
        >
          <MenuItem value={"ascending"}>{t("Ascending")}</MenuItem>
          <MenuItem value={"descending"}>{t("Descending")}</MenuItem>
        </Select>
      </FormControl>
      <Button
        variant="outlined"
        color="warning"
        startIcon={<DeleteSweep />}
        disabled={!activeFilters.length && !name}
        onClick={clearFilters}
        sx={{ gridColumn: { xs: "1 / -1", md: "auto" } }}
      >
        {t("clear_search_filters")}
      </Button>
    </Box>
  );

  const listToggle = (sx) =>
    layout === "masonry" && (
      <Tooltip title={t("Players")}>
        <IconButton
          aria-label={t("Players")}
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
    <>
      <AppBarSearch
        value={name}
        onChange={setName}
        placeholder={t("Search by Player Name")}
        maxLength={50}
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
                onClick={handleOpenCreatePlayerModal}
                disabled={dbMode === "cloud" && !cloudUser}
                sx={{
                  flex: { xs: "1 1 100%", md: "none" },
                  order: { xs: 1, md: 0 },
                  whiteSpace: "nowrap",
                }}
              >
                {t("create_pc")}
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
                  order: { xs: 4, md: 0 },
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
                    {t("Add PC from JSON")}
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      setToolsAnchor(null);
                      handlePastePlayer();
                    }}
                  >
                    <ListItemIcon>
                      <ContentPaste />
                    </ListItemIcon>
                    {t("Add PC from Clipboard")}
                  </MenuItem>
                  <MenuItem
                    disabled={!filteredList.length}
                    onClick={() => {
                      setToolsAnchor(null);
                      exportAllAsJson();
                    }}
                  >
                    <ListItemIcon>
                      <Download />
                    </ListItemIcon>
                    {t("Export all")}
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      setToolsAnchor(null);
                      setExpandAll(!expandAll);
                    }}
                  >
                    <ListItemIcon>
                      {expandAll ? <UnfoldLess /> : <UnfoldMore />}
                    </ListItemIcon>
                    {expandAll ? t("Collapse Details") : t("Expand Details")}
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
                <Tooltip title={t("Add PC from JSON")}>
                  <IconButton
                    aria-label={t("Add PC from JSON")}
                    sx={toolButtonSx}
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
                <Tooltip title={t("Add PC from Clipboard")}>
                  <IconButton
                    aria-label={t("Add PC from Clipboard")}
                    sx={toolButtonSx}
                    onClick={handlePastePlayer}
                  >
                    <ContentPaste />
                  </IconButton>
                </Tooltip>
                <Tooltip title={t("Export all")}>
                  <span>
                    <IconButton
                      aria-label={t("Export all")}
                      sx={toolButtonSx}
                      disabled={!filteredList.length}
                      onClick={exportAllAsJson}
                    >
                      <Download />
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip
                  title={
                    expandAll ? t("Collapse Details") : t("Expand Details")
                  }
                >
                  <IconButton
                    aria-label={
                      expandAll ? t("Collapse Details") : t("Expand Details")
                    }
                    sx={toolButtonSx}
                    onClick={() => setExpandAll(!expandAll)}
                  >
                    {expandAll ? <UnfoldLess /> : <UnfoldMore />}
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
                sx={{ order: { xs: 4, md: 0 } }}
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
                  <Tooltip title="List + preview">
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
                  order: { xs: 5, md: 0 },
                }}
              >
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {filteredList?.length ?? 0} {t("Players")}
                </Typography>
                {stalePlayers.length > 0 && (
                  <Tooltip title={t("Some players need a data migration")}>
                    <Button
                      variant="outlined"
                      color="warning"
                      startIcon={<SystemUpdateAltIcon />}
                      onClick={() => setMigrationDialogOpen(true)}
                    >
                      {t("Migrate")} ({stalePlayers.length})
                    </Button>
                  </Tooltip>
                )}
                <Tooltip
                  title={
                    selectMode ? t("Exit Select Mode") : t("Select Players")
                  }
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
                  <Divider />
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
                </MuiMenu>
                <Tooltip
                  title={`${t("Export Selected as JSON")} (${selectedIds.size})`}
                >
                  <span>
                    <IconButton
                      onClick={exportSelectedAsJson}
                      disabled={selectedIds.size === 0}
                    >
                      <Download />
                    </IconButton>
                  </span>
                </Tooltip>
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
                    "Have a Google account? Sign in to sync your data between devices",
                  )}
            </Typography>
            <SignIn />
          </Paper>
        )}
        {loading && (dbMode !== "cloud" || cloudUser) && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: 50,
            }}
          >
            <CircularProgress />
          </div>
        )}
        {layout === "list" ? (
          <NpcListPreview
            items={gridItems}
            columns={playerColumns}
            title={t("Players")}
            emptyText={t("No players match your filters.")}
            selectMode={selectMode}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            stickyTop={listTop}
            previewSize={previewSize}
            renderCard={renderPlayer}
          />
        ) : (
          <>
            {!desktop && (
              <MobileListBar
                top={appBarHeight}
                title={t("Players")}
                currentName={
                  filteredList.find((p) => p.id === highlightId)?.name
                }
                currentIndex={
                  filteredList.findIndex((p) => p.id === highlightId) + 1
                }
                count={filteredList.length}
                onOpen={() => setListDrawerOpen(true)}
              />
            )}
            <MasonryColumns columnWidth={MASONRY_WIDTHS[masonrySize]}>
              {filteredList.map((player) => (
                <MasonryCard
                  key={player.id}
                  id={player.id}
                  active={highlightId === player.id}
                  scrollMarginTop={cardScrollMargin}
                >
                  {renderPlayer(player)}
                </MasonryCard>
              ))}
            </MasonryColumns>
          </>
        )}
      </Box>
      {layout === "masonry" && (
        <NpcListDrawer
          persistent={desktop}
          top={appBarHeight}
          open={desktop ? sidebarOpen : listDrawerOpen}
          onClose={() =>
            desktop ? setSidebarOpen(false) : setListDrawerOpen(false)
          }
          items={gridItems}
          columns={playerColumns}
          title={t("Players")}
          selectMode={selectMode}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          activeId={highlightId}
          onSelect={focusCard}
        />
      )}
      <Button
        variant="outlined"
        startIcon={<BugReport />}
        sx={{ marginTop: "5rem" }}
        onClick={() => setIsBugDialogOpen(true)}
      >
        {t("Report a Bug")}
      </Button>
      <Box sx={{ height: "10vh" }} />
      <MigrationDialog
        open={migrationDialogOpen}
        onClose={() => setMigrationDialogOpen(false)}
        actors={stalePlayers}
        actorType="player"
        onMigrateAll={handleMigrateAllPlayers}
        getMigrations={getPendingPlayerMigrations}
      />
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={closeDeleteDialog}
        onConfirm={performDelete}
        title={
          isBulkDelete ? t("Confirm Bulk Deletion") : t("Confirm Deletion")
        }
        message={
          isBulkDelete
            ? t("Are you sure you want to delete {count} player(s)?").replace(
                "{count}",
                String(selectedIds.size),
              )
            : t("Are you sure you want to delete this player?")
        }
        itemPreview={
          !isBulkDelete &&
          playerToDelete && (
            <Box>
              <Typography variant="h4">{playerToDelete.name}</Typography>
              <Typography variant="body2">
                {t("Level")} {playerToDelete.lvl} -{" "}
                {playerToDelete.info?.identity}
              </Typography>
            </Box>
          )
        }
      />
      <Dialog
        open={isCreatePlayerModalOpen}
        onClose={handleCloseCreatePlayerModal}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{t("create_pc")}</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ mt: 1 }}>
            <SettingRow label={t("Name")} hint={t("optional_name_hint")}>
              <TextField
                value={createPlayerOptions.name}
                onChange={(evt) =>
                  handleCreatePlayerOptionChange("name", evt.target.value)
                }
                size="small"
                sx={{ minWidth: 220 }}
              />
            </SettingRow>

            <SettingRow
              label={t("Default View")}
              hint={t("Choose which view opens first in Player Edit.")}
            >
              <FormControl
                variant="outlined"
                size="small"
                sx={{ minWidth: 180 }}
              >
                <Select
                  value={createPlayerOptions.defaultView}
                  onChange={(evt) =>
                    handleCreatePlayerOptionChange(
                      "defaultView",
                      evt.target.value,
                    )
                  }
                >
                  <MenuItem value="normal">{t("Normal View")}</MenuItem>
                  <MenuItem value="compact">{t("Compact View")}</MenuItem>
                </Select>
              </FormControl>
            </SettingRow>

            <SettingRow
              label={t("Expand All Sections")}
              hint={t(
                "When enabled, all spell and class sections start expanded on load.",
              )}
              compactControl
            >
              <Checkbox
                checked={createPlayerOptions.expandAllSections ?? true}
                onChange={(evt) =>
                  handleCreatePlayerOptionChange(
                    "expandAllSections",
                    evt.target.checked,
                  )
                }
              />
            </SettingRow>

            <SettingRow
              label={t("Advancement")}
              hint={t(
                "(Placeholder) Toggle to enable features related to character advancement such as guided level up options, and per-level skill management.",
              )}
              compactControl
            >
              <Checkbox
                checked={createPlayerOptions.advancement}
                onChange={(evt) =>
                  handleCreatePlayerOptionChange(
                    "advancement",
                    evt.target.checked,
                  )
                }
              />
            </SettingRow>

            <SettingRow
              label={t("Automatic Class Leveling")}
              hint={t(
                "When enabled, class level is read-only and is derived from the total current skill levels in that class.",
              )}
              compactControl
            >
              <Checkbox
                checked={
                  createPlayerOptions.optionalRules.technospheres ||
                  createPlayerOptions.automaticClassLevel !== false
                }
                disabled={createPlayerOptions.optionalRules.technospheres}
                onChange={(evt) =>
                  handleCreatePlayerOptionChange(
                    "automaticClassLevel",
                    evt.target.checked,
                  )
                }
              />
            </SettingRow>

            <SettingRow
              label={t("Auto-Equip Unarmed Strike")}
              hint={t(
                "When a weapon is unequipped from a hand slot, automatically equip Unarmed Strike if that hand is now empty.",
              )}
              compactControl
            >
              <Checkbox
                checked={createPlayerOptions.autoEquipUnarmed ?? true}
                onChange={(evt) =>
                  handleCreatePlayerOptionChange(
                    "autoEquipUnarmed",
                    evt.target.checked,
                  )
                }
              />
            </SettingRow>

            <Typography
              variant="body1"
              sx={{ px: 1, mt: 1, mb: 0.25, fontWeight: 600 }}
            >
              {t("Optional Rules")}
            </Typography>

            <SettingRow
              label={t("Quirks")}
              hint={t(
                "Play with the Quirk advanced optional rule from High Fantasy Atlas, page 114.",
              )}
              showDivider={false}
              dense
              compactControl
            >
              <Checkbox
                checked={createPlayerOptions.optionalRules.quirks}
                onChange={(evt) =>
                  handleCreateOptionalRuleChange("quirks", evt.target.checked)
                }
              />
            </SettingRow>

            <SettingRow
              label={t("Zero Power")}
              hint={t(
                "Play with the Zero Power optional rule from High Fantasy Atlas, page 124.",
              )}
              showDivider={false}
              dense
              compactControl
            >
              <Checkbox
                checked={createPlayerOptions.optionalRules.zeroPower}
                onChange={(evt) =>
                  handleCreateOptionalRuleChange(
                    "zeroPower",
                    evt.target.checked,
                  )
                }
              />
            </SettingRow>

            <SettingRow
              label={t("Camp Activities")}
              hint={t(
                "Enable the Camp Activity optional rule from Natural Fantasy Atlas, page 130.",
              )}
              showDivider={false}
              dense
              compactControl
            >
              <Checkbox
                checked={createPlayerOptions.optionalRules.campActivities}
                onChange={(evt) =>
                  handleCreateOptionalRuleChange(
                    "campActivities",
                    evt.target.checked,
                  )
                }
              />
            </SettingRow>

            <SettingRow
              label={t("Technospheres")}
              hint={t(
                "Enable the Technosphere optional rule from Techno Fantasy Atlas, page 130. Armor and Custom Weapons will have slots instead of qualities. Hoplospheres, Mnemospheres and Mnemosphere Receptacles can be created.",
              )}
              showDivider={false}
              dense
              compactControl
            >
              <Checkbox
                checked={createPlayerOptions.optionalRules.technospheres}
                onChange={(evt) =>
                  handleCreateOptionalRuleChange(
                    "technospheres",
                    evt.target.checked,
                  )
                }
              />
            </SettingRow>
            {createPlayerOptions.optionalRules.technospheres && (
              <Box sx={{ mt: 1, px: 1, mb: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  {t(
                    "Manage innate classes from the Classes tab. Add them under Innate Classes with the compendium search or add button.",
                  )}
                </Typography>
              </Box>
            )}
            {createPlayerOptions.optionalRules.technospheres && (
              <SettingRow
                label={t("Technospheres Alternative Rule")}
                hint={t("Select which Technospheres variant to use.")}
                showDivider={false}
                dense
                compactControl
              >
                <RadioGroup
                  value={
                    createPlayerOptions.optionalRules.technospheresVariant ??
                    "standard"
                  }
                  onChange={(evt) =>
                    handleCreateOptionalRuleValueChange(
                      "technospheresVariant",
                      evt.target.value,
                    )
                  }
                  sx={{
                    alignItems: "flex-end",
                    minWidth: 240,
                    "& .MuiFormControlLabel-root": {
                      mr: 0,
                      ml: 0,
                    },
                  }}
                >
                  <FormControlLabel
                    value="standard"
                    control={<Radio size="small" />}
                    label={t("Standard")}
                    labelPlacement="start"
                  />
                  <FormControlLabel
                    value="integrated"
                    control={<Radio size="small" />}
                    label={t("Integrated technospheres")}
                    labelPlacement="start"
                  />
                  <FormControlLabel
                    value="mnemospheres"
                    control={<Radio size="small" />}
                    label={t("Mnemospheres only")}
                    labelPlacement="start"
                  />
                  <FormControlLabel
                    value="hoplospheres"
                    control={<Radio size="small" />}
                    label={t("Hoplospheres only")}
                    labelPlacement="start"
                  />
                </RadioGroup>
              </SettingRow>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreatePlayerModal}>{t("Cancel")}</Button>
          <Button variant="contained" onClick={handleCreatePlayerConfirm}>
            {t("create_pc")}
          </Button>
        </DialogActions>
      </Dialog>
      <MnemosphereCreateDialog
        open={startingMnemosphereDialogOpen}
        onClose={handleStartingMnemosphereSkip}
        onConfirm={handleStartingMnemosphereConfirm}
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

function PlayerGalleryCardActions({
  player,
  t,
  dbMode,
  handleNavigation,
  deletePlayer,
  sharePlayer,
  copyPlayerToLocal,
  copyPlayerToCloud,
  movePlayerToLocal,
  movePlayerToCloud,
  expandAll,
}) {
  const cardRef = useRef(null);
  const [expanded, setExpanded] = useState(expandAll);

  useEffect(() => {
    setExpanded(expandAll);
  }, [expandAll]);
  const [actionsAnchor, setActionsAnchor] = useState(null);
  const [actionsSubmenu, setActionsSubmenu] = useState(null); // "export" | "transfer" | null
  const [localShareSnackbarOpen, setLocalShareSnackbarOpen] = useState(false);
  const isLocalDb = dbMode === "local";
  const isMobile = useMediaQuery("(max-width: 600px)");
  const [downloadImage] = useDownloadImage(player?.name || "player", cardRef);
  const exportData = canonicalizeForTransfer(
    "pc",
    applyPreSaveTransforms(player),
  );

  const closeMenus = () => {
    setActionsAnchor(null);
    setActionsSubmenu(null);
  };

  const copyJsonToClipboard = async () => {
    await navigator.clipboard.writeText(
      JSON.stringify({ ...exportData, dataType: "pc" }, null, 2),
    );
    closeMenus();
  };

  const downloadJson = () => {
    const safeName = (player?.name || "player")
      .replace(/\s+/g, "_")
      .toLowerCase();
    const blob = new Blob(
      [JSON.stringify({ ...exportData, dataType: "pc" }, null, 2)],
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
    const text = buildItemText("pc", exportData, fmt);
    await navigator.clipboard.writeText(text);
    closeMenus();
  };

  const downloadText = (fmt) => {
    const text = buildItemText("pc", exportData, fmt);
    const ext = fmt === "plain" ? "txt" : "md";
    const safeName = (player?.name || "player")
      .replace(/\s+/g, "_")
      .toLowerCase();
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
    <>
      <Box ref={cardRef}>
        <PlayerCardGallery
          player={player}
          setPlayer={null}
          isExpanded={expanded}
          sx={{ marginBottom: 1 }}
        />
      </Box>
      <Box
        sx={{
          mt: "3px",
          display: "flex",
          alignItems: "center",
          gap: 1,
          flexWrap: "wrap",
        }}
        onClick={(e) => e.stopPropagation()}
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
                handleNavigation(`/player-edit/${player.id}`);
              }}
            >
              <ListItemIcon>
                <Edit fontSize="small" />
              </ListItemIcon>
              <ListItemText primary={t("Edit")} />
            </MenuItem>,
            <MenuItem
              key="sheet"
              onClick={() => {
                closeMenus();
                handleNavigation(`/character-sheet/${player.id}`);
              }}
            >
              <ListItemIcon>
                <Badge fontSize="small" />
              </ListItemIcon>
              <ListItemText primary={t("Player Sheet")} />
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
                deletePlayer(player)();
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
                sharePlayer(player.id);
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
                downloadImage();
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
                copyPlayerToLocal(player)();
              }}
            >
              <ListItemIcon>
                <StorageIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary={t("Copy to Local")} />
            </MenuItem>,
            <MenuItem
              key="copy-cloud"
              onClick={() => {
                closeMenus();
                copyPlayerToCloud(player)();
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
                movePlayerToLocal(player)();
              }}
            >
              <ListItemIcon>
                <StorageIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary={t("Move to Local")} />
            </MenuItem>,
            <MenuItem
              key="move-cloud"
              onClick={() => {
                closeMenus();
                movePlayerToCloud(player)();
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
          <IconButton
            onClick={() => handleNavigation(`/player-edit/${player.id}`)}
          >
            <Edit />
          </IconButton>
        </Tooltip>
        <Tooltip title={t("Player Sheet")}>
          <IconButton
            onClick={() => handleNavigation(`/character-sheet/${player.id}`)}
          >
            <Badge />
          </IconButton>
        </Tooltip>
        {!isMobile && (
          <>
            <Export
              name={`${player.name}`}
              dataType="pc"
              data={applyPreSaveTransforms(player)}
            />
            <PlayerTransferButton
              player={player}
              copyPlayerToLocal={copyPlayerToLocal}
              copyPlayerToCloud={copyPlayerToCloud}
              movePlayerToLocal={movePlayerToLocal}
              movePlayerToCloud={movePlayerToCloud}
              t={t}
            />
            <Tooltip title={t("Delete")}>
              <IconButton onClick={deletePlayer(player)}>
                <Delete />
              </IconButton>
            </Tooltip>
            <Tooltip
              title={
                dbMode === "local" ? (
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
                <IconButton
                  onClick={() => sharePlayer(player.id)}
                  disabled={isLocalDb}
                >
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
              <IconButton onClick={downloadImage}>
                <Download />
              </IconButton>
            </Tooltip>
          </>
        )}
        <Box sx={{ ml: "auto" }} />
        <Tooltip
          title={`Schema version ${player.schemaVersion ?? 0} of ${PLAYER_CURRENT_SCHEMA_VERSION} (${playerNeedsMigration(player) ? "migration needed" : "up to date"})`}
        >
          <Chip
            label={`v${player.schemaVersion ?? 0}`}
            size="small"
            color={playerNeedsMigration(player) ? "warning" : "default"}
            variant="outlined"
            sx={{ fontSize: "0.85rem" }}
          />
        </Tooltip>
        <Tooltip title={expanded ? t("Collapse Details") : t("Expand Details")}>
          <IconButton onClick={() => setExpanded((prev) => !prev)}>
            {expanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Tooltip>
      </Box>
    </>
  );
}

function PlayerTransferButton({
  player,
  copyPlayerToLocal,
  copyPlayerToCloud,
  movePlayerToLocal,
  movePlayerToCloud,
  t,
}) {
  const { cloudUser } = useDatabaseContext();
  const [anchor, setAnchor] = useState(null);
  return (
    <>
      <Tooltip title={t("Copy to / Move to...")}>
        <IconButton onClick={(e) => setAnchor(e.currentTarget)}>
          <FileCopy />
        </IconButton>
      </Tooltip>
      <MuiMenu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
      >
        <MenuItem
          onClick={() => {
            setAnchor(null);
            copyPlayerToLocal(player)();
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
            setAnchor(null);
            copyPlayerToCloud(player)();
          }}
        >
          <ListItemIcon>
            <CloudIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={t("Copy to Cloud")} />
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            setAnchor(null);
            movePlayerToLocal(player)();
          }}
        >
          <ListItemIcon>
            <StorageIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={t("Move to Local")} />
        </MenuItem>
        <MenuItem
          disabled={!cloudUser}
          onClick={() => {
            setAnchor(null);
            movePlayerToCloud(player)();
          }}
        >
          <ListItemIcon>
            <CloudIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={t("Move to Cloud")} />
        </MenuItem>
      </MuiMenu>
    </>
  );
}
