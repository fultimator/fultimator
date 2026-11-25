import {
  addDoc,
  deleteDoc,
  doc,
  useAuthState,
  auth,
  query,
  orderBy,
  limit,
  collection,
  where,
  startAfter,
  useCollectionData as useCollectionDataCloud,
  firestore as cloudFirestore,
} from "@platform/cloud";

import {
  IconButton,
  Skeleton,
  Tooltip,
  Typography,
  Grid,
  Snackbar,
  Paper,
  Slider,
  Avatar,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Fab,
  Chip,
  Box,
  ButtonBase,
} from "@mui/material";
import Layout from "../../components/Layout";
import AppBarSearch from "../../components/appbar/AppBarSearch";
import { SignIn } from "../../components/auth";
import NpcActorCard from "../../components/shared/actors/npc/NpcActorCard";
import {
  ArrowRight,
  ArrowLeft,
  Cloud as CloudIcon,
  ContentCopy,
  Share,
  Download,
  Report,
  KeyboardArrowUp,
  DeleteSweep,
} from "@mui/icons-material";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";

import allToken from "/images/routes/icons/species/All-token.webp";
import beastToken from "/images/routes/icons/species/Beast-token.webp";
import constructToken from "/images/routes/icons/species/Construct-token.webp";
import demonToken from "/images/routes/icons/species/Demon-token.webp";
import elementalToken from "/images/routes/icons/species/Elemental-token.webp";
import humanToken from "/images/routes/icons/species/Human-token.webp";
import monsterToken from "/images/routes/icons/species/Monster-token.webp";
import plantToken from "/images/routes/icons/species/Plant-token.webp";
import undeadToken from "/images/routes/icons/species/Undead-token.webp";
import useDownloadImage from "../../hooks/useDownloadImage";
import { usePersistentState } from "../../hooks/usePersistentState";
import MasonryCard from "../npc-gallery/listPreview/MasonryCard";
import MasonryColumns from "../../components/common/MasonryColumns";
import Export from "../../components/Export";
import {
  NPC_CURRENT_SCHEMA_VERSION,
  applyNpcPostLoadTransforms,
} from "../../libs/actor";
import { useTranslate, languageOptions } from "../../translation/translate";

import ReportContentDialog from "../../components/appbar/ReportContentDialog";

export default function NpcCompedium() {
  const { t } = useTranslate();
  const [user, loading] = useAuthState(auth);

  return (
    <Layout fullWidth>
      <Box sx={{ px: { xs: 2, md: 3 } }}>
        {loading && <Skeleton />}
        {!loading && !user && (
          <Paper
            elevation={3}
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
            <CloudIcon color="primary" />
            <Typography
              variant="body2"
              sx={{
                color: "text.primary",
                flex: 1,
                minWidth: 200,
              }}
            >
              {t("You have to be logged in to access this feature")}
            </Typography>
            <SignIn />
          </Paper>
        )}
        {user && <Personal user={user} />}
      </Box>
    </Layout>
  );
}

function Personal({ user }) {
  const { t } = useTranslate();
  const navigate = useNavigate();

  const [openReportDialog, setOpenReportDialog] = useState(false);
  const [selectedReportNpc, setSelectedReportNpc] = useState({
    id: "",
    name: "",
    author: "",
  });
  const [showScrollTop, setShowScrollTop] = useState(false);
  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const [collapse, setCollapse] = usePersistentState(
    "npcCompendium.collapse",
    true,
  );
  const [lastItem, setLastItem] = useState(undefined);
  const [prevLastItem, setPrevLastItem] = useState([]);
  const personalRef = useMemo(
    () => collection(cloudFirestore, "npc-personal"),
    [],
  );
  const [selectedType, setSelectedType] = useState("All");
  const [name, setName] = useState("");
  const [rank, setRank] = useState("");
  const [language, setLanguage] = useState("en");
  const [levels, setLevels] = useState([5, 60]);

  const [searchParams, setSearchParams] = useState({
    type: "All",
    name: "",
    level: [5, 60],
    rank: "",
    language: "en",
  });

  const personalQuery = useMemo(() => {
    const constraints = [where("published", "==", true)];

    if (searchParams.level[0] !== 5 || searchParams.level[1] !== 60) {
      constraints.push(where("lvl", ">=", searchParams.level[0]));
      constraints.push(where("lvl", "<=", searchParams.level[1]));
      constraints.push(orderBy("lvl", "asc"));
    }

    if (searchParams.name !== "") {
      constraints.push(
        where("searchString", "array-contains-any", [
          ...searchParams.name
            .replace(/[\W_]+/g, " ")
            .toLowerCase()
            .split(" "),
        ]),
      );
    }

    if (searchParams.rank !== "") {
      constraints.push(where("rank", "==", searchParams.rank));
    }

    if (searchParams.type !== "All") {
      constraints.push(where("species", "==", searchParams.type));
    }

    constraints.push(where("language", "==", searchParams.language));

    constraints.push(orderBy("publishedAt", "desc"));

    if (lastItem) {
      if (searchParams.level[0] !== 5 || searchParams.level[1] !== 60) {
        constraints.push(startAfter(lastItem.lvl, lastItem.publishedAt));
      } else {
        constraints.push(startAfter(lastItem.publishedAt));
      }
    }

    constraints.push(limit(6));

    return query(personalRef, ...constraints);
  }, [personalRef, searchParams, lastItem]);
  const [personalList, loading, err] = useCollectionDataCloud(personalQuery);

  if (err) {
    console.error(err);
  }

  const activeFilters = [
    selectedType !== "All" && t(selectedType),
    (levels[0] !== 5 || levels[1] !== 60) &&
      `${t("Lvl:")} ${levels[0]}–${levels[1]}`,
    rank && rank,
    language !== "en" && language.toUpperCase(),
  ].filter(Boolean);

  const runSearch = (query = name) => {
    setPrevLastItem([]);
    setLastItem(undefined);
    setSearchParams({
      type: selectedType,
      name: query.toLowerCase(),
      level: levels,
      rank: rank ? rank : "",
      language: language,
    });
  };

  const clearFilters = () => {
    setSelectedType("All");
    setName("");
    setRank("");
    setLanguage("en");
    setLevels([5, 60]);
    setPrevLastItem([]);
    setLastItem(undefined);
    setSearchParams({
      type: "All",
      name: "",
      level: [5, 60],
      rank: "",
      language: "en",
    });
  };

  const nextPage = () => {
    setPrevLastItem([...prevLastItem, lastItem]);
    for (let i = 1; i < personalList.length; i++) {
      if (personalList[personalList.length - i]?.id) {
        setLastItem(personalList[personalList.length - 1]);
        return;
      }
    }
  };

  const prevPage = () => {
    setLastItem(prevLastItem[prevLastItem.length - 1]);
    const newPrevLastItem = [...prevLastItem];
    newPrevLastItem.pop();
    setPrevLastItem(newPrevLastItem);
  };

  const copyNpc = function (npc) {
    return async function () {
      const data = JSON.parse(JSON.stringify(npc));
      data.uid = user.uid;
      delete data.id;
      data.published = false;

      const ref = collection(cloudFirestore, "npc-personal");

      addDoc(ref, data)
        .then(function (docRef) {
          navigate(`/npc-gallery/${docRef.id}`);
        })
        .catch(function (error) {
          console.error("Error adding document: ", error);
        });
    };
  };

  const deleteNpc = function (npc) {
    return function () {
      deleteDoc(doc(cloudFirestore, "npc-personal", npc.id));
    };
  };

  const [open, setOpen] = useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  const shareNpc = async (id) => {
    const baseUrl = window.location.href.replace(/\/[^/]+$/, "");
    const fullUrl = `${baseUrl}/npc-gallery/${id}`;
    await navigator.clipboard.writeText(fullUrl);
    setOpen(true);
  };

  const enemyType = (token, name, label) => {
    const selected = selectedType === name;
    return (
      <ButtonBase
        key={name}
        onClick={() => setSelectedType(name)}
        aria-pressed={selected}
        aria-label={label}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 0.5,
          px: { xs: 0.5, md: 1.5 },
          py: 0.5,
          borderRadius: 2,
          bgcolor: selected ? "action.selected" : "transparent",
          fontWeight: selected ? 700 : 400,
          fontSize: { xs: "0.9rem", md: "1rem" },
          whiteSpace: "nowrap",
        }}
      >
        <Avatar
          alt=""
          src={token}
          sx={{
            width: { xs: 48, md: 52 },
            height: { xs: 48, md: 52 },
            border: 2,
            borderColor: selected ? "primary.main" : "transparent",
            filter: selected ? "none" : "grayscale(1)",
            opacity: selected ? 1 : 0.8,
          }}
        />
        {label}
      </ButtonBase>
    );
  };

  const marks = [
    {
      value: 5,
      label: t("Lvl 5"),
    },
    {
      value: 10,
      label: t("Lvl 10"),
    },
    {
      value: 20,
      label: t("Lvl 20"),
    },
    {
      value: 30,
      label: t("Lvl 30"),
    },
    {
      value: 40,
      label: t("Lvl 40"),
    },
    {
      value: 50,
      label: t("Lvl 50"),
    },
    {
      value: 60,
      label: t("Lvl 60"),
    },
  ];

  const handleCloseReportDialog = () => {
    setOpenReportDialog(false);
    setSelectedReportNpc({ id: "", name: "", author: "" });
  };

  if (err?.code === "resource-exhausted") {
    return (
      <Paper elevation={3} sx={{ marginBottom: 5, padding: 4 }}>
        {t(
          "Apologies, fultimator has reached its read quota at the moment, please try again tomorrow. (Around 12-24 hours)",
        )}
      </Paper>
    );
  }

  const filterPanel = (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2.5,
        }}
      >
        <Box
          sx={{
            display: { xs: "grid", md: "flex" },
            gridTemplateColumns: "repeat(3, 1fr)",
            justifyItems: "center",
            gap: { xs: 0.5, md: 0.75 },
            flexWrap: { md: "wrap" },
            justifyContent: { md: "space-between" },
            "& > *": { flex: { md: 1 } },
          }}
        >
          {enemyType(allToken, "All", t("All"))}
          {enemyType(beastToken, "Beast", t("Beast"))}
          {enemyType(constructToken, "Construct", t("Construct"))}
          {enemyType(demonToken, "Demon", t("Demon"))}
          {enemyType(elementalToken, "Elemental", t("Elemental"))}
          {enemyType(humanToken, "Humanoid", t("Humanoid"))}
          {enemyType(monsterToken, "Monster", t("Monster"))}
          {enemyType(plantToken, "Plant", t("Plant"))}
          {enemyType(undeadToken, "Undead", t("Undead"))}
        </Box>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "minmax(0, 1fr)",
              sm: "repeat(2, minmax(0, 1fr))",
              lg: "1fr 170px 170px auto",
            },
            alignItems: "center",
            gap: 1.5,
            flex: { lg: 1 },
          }}
        >
          <Box
            sx={{
              gridColumn: { sm: "1 / -1", lg: "auto" },
              px: { xs: 3, md: 4 },
            }}
          >
            <Slider
              getAriaLabel={() => "Level"}
              value={levels}
              step={5}
              min={5}
              marks={marks}
              onChange={(_, value) => setLevels(value)}
              max={60}
              size="small"
              valueLabelDisplay="on"
              getAriaValueText={(value) => `${t("Lvl:")}${value}`}
              sx={{
                display: "block",
                mt: 3,
                mb: 1,
                "& .MuiSlider-mark": {
                  height: 10,
                  width: 2,
                  backgroundColor: "text.disabled",
                },
                "& .MuiSlider-markActive": { backgroundColor: "primary.main" },
                "& .MuiSlider-markLabel": { fontSize: "0.75rem" },
              }}
            />
          </Box>

          <FormControl size="small" sx={{ width: "100%" }}>
            <InputLabel id="rank">{t("Rank:")}</InputLabel>
            <Select
              labelId="rank"
              id="select-rank"
              value={rank}
              label={t("Rank:")}
              onChange={(evt) => setRank(evt.target.value)}
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

          <FormControl size="small" sx={{ width: "100%" }}>
            <InputLabel id="language">{t("Language:")}</InputLabel>
            <Select
              labelId="language"
              id="select-language"
              value={language}
              label={t("Language:")}
              onChange={(evt) => setLanguage(evt.target.value)}
            >
              {languageOptions.map((option) => (
                <MenuItem key={option.code} value={option.code}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box
            sx={{
              display: "flex",
              gap: 1,
              gridColumn: { xs: "1 / -1", lg: "auto" },
            }}
          >
            <Button
              variant="outlined"
              color="warning"
              startIcon={<DeleteSweep />}
              disabled={!activeFilters.length && !name}
              onClick={clearFilters}
              sx={{ flex: 1 }}
            >
              {t("Clear")}
            </Button>
            <Button
              variant="outlined"
              onClick={() => setCollapse(!collapse)}
              sx={{ flex: 1 }}
            >
              {collapse ? t("Collapse") : t("Expand")}
            </Button>
          </Box>
        </Box>
      </Box>
    </>
  );

  return (
    <>
      <AppBarSearch
        value={name}
        onChange={setName}
        onSubmit={runSearch}
        placeholder={t("Adversary Name")}
        chips={activeFilters}
        panel={filterPanel}
      />
      <MasonryColumns>
        {personalList?.map((npc) => (
          <MasonryCard key={npc.id} id={npc.id}>
            <Npc
              npc={npc}
              copyNpc={copyNpc}
              deleteNpc={deleteNpc}
              shareNpc={shareNpc}
              reportNpc={() => {
                setSelectedReportNpc(npc);
                setOpenReportDialog(true);
              }}
              collapseGet={collapse}
            />
          </MasonryCard>
        ))}
      </MasonryColumns>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: 50,
        }}
      >
        {!loading ? (
          <>
            {personalList && personalList.length > 5 ? (
              <>
                {prevLastItem.length ? (
                  <Button
                    variant="contained"
                    sx={{ marginRight: 4 }}
                    startIcon={<ArrowLeft />}
                    onClick={prevPage}
                    size="large"
                  >
                    {t("Prev Items")}
                  </Button>
                ) : (
                  ""
                )}
                <Button
                  variant="contained"
                  sx={{}}
                  endIcon={<ArrowRight />}
                  onClick={nextPage}
                  size="large"
                >
                  {t("Next Items")}
                </Button>
              </>
            ) : (
              <div style={{ textAlign: "center" }}>
                <Typography
                  sx={{
                    fontWeight: 700,
                    marginBottom: 4,
                  }}
                >
                  {t("No more adversaries found.")}
                </Typography>
                {prevLastItem.length ? (
                  <Button
                    variant="contained"
                    sx={{}}
                    startIcon={<ArrowLeft />}
                    onClick={prevPage}
                    size="large"
                  >
                    {t("Prev Items")}
                  </Button>
                ) : (
                  ""
                )}
              </div>
            )}
            <ReportContentDialog
              open={openReportDialog}
              onClose={handleCloseReportDialog}
              userUUID={user.uid}
              contentId={selectedReportNpc.id}
              contentName={selectedReportNpc.name}
              contentAuthor={selectedReportNpc.uid}
              contentType="NPC"
            />
          </>
        ) : (
          <CircularProgress />
        )}
      </div>
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        open={open}
        autoHideDuration={2000}
        onClose={handleClose}
        message={t("Copied to Clipboard!")}
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

function Npc({ npc: rawNpc, copyNpc, shareNpc, reportNpc, collapseGet }) {
  const { t } = useTranslate();
  const npc = applyNpcPostLoadTransforms(rawNpc);
  const ref = useRef();
  const [downloadImage] = useDownloadImage(npc.name, ref);

  useEffect(() => {
    setCollapse(collapseGet);
  }, [collapseGet]);

  // const [collapse, setCollapse] = useState(window.innerWidth >= 900);
  const [collapse, setCollapse] = useState(false);

  return (
    <Grid
      sx={{
        marginBottom: 3,
        display: "flex",
        alignItems: "center",
        flexWrap: "wrap",
      }}
      size={{
        xs: 12,
        md: 12,
      }}
    >
      <NpcActorCard
        npc={npc}
        cardRef={ref}
        npcImage={npc.imgurl}
        collapse={collapse}
        variant="interactive"
        onClick={() => setCollapse(!collapse)}
      />
      <Tooltip title={t("Copy to adversary designer")}>
        <IconButton onClick={copyNpc(npc)}>
          <ContentCopy />
        </IconButton>
      </Tooltip>
      <Tooltip title={t("Share URL")}>
        <IconButton onClick={() => shareNpc(npc.id)}>
          <Share />
        </IconButton>
      </Tooltip>
      <Tooltip title={t("Download as Image")}>
        <IconButton onClick={downloadImage}>
          <Download />
        </IconButton>
      </Tooltip>
      <Tooltip title={t("Report NPC")}>
        <IconButton onClick={() => reportNpc(npc)}>
          <Report />
        </IconButton>
      </Tooltip>
      <Export name={`${npc.name}`} dataType="npc" data={npc} />
      <Box sx={{ ml: "auto", display: "flex", alignItems: "center", gap: 1 }}>
        <span style={{ fontSize: 14 }}>
          {t("Created By:")} {npc.createdBy}
        </span>
        <Tooltip
          title={`Schema version ${rawNpc.schemaVersion ?? 0} of ${NPC_CURRENT_SCHEMA_VERSION}`}
        >
          <Chip
            label={
              NPC_CURRENT_SCHEMA_VERSION > 0
                ? `v${rawNpc.schemaVersion ?? 0}/${NPC_CURRENT_SCHEMA_VERSION}`
                : `V${rawNpc.schemaVersion ?? 0}`
            }
            size="small"
            color="default"
            variant="outlined"
            sx={{ fontSize: "0.85rem" }}
          />
        </Tooltip>
      </Box>
    </Grid>
  );
}
