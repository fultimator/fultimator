import {
  Link as RouterLink,
  useSearchParams,
  useNavigate,
  useLocation,
} from "react-router-dom";

import {
  query,
  orderBy,
  collection,
  where,
  doc,
  addDoc,
  deleteDoc,
} from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";

import { firestore } from "../../firebase";
import { auth } from "../../firebase";

import {
  IconButton,
  Skeleton,
  Tooltip,
  Typography,
  Grid,
  Snackbar,
  CircularProgress,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Autocomplete,
} from "@mui/material";
import Layout from "../../components/Layout";
import { SignIn } from "../../components/auth";
import NpcPretty from "../../components/npc/Pretty";
// import NpcUgly from "../../components/npc/Ugly";
import {
  ContentCopy,
  Delete,
  Share,
  Download,
  Edit,
  HistoryEdu,
  UploadFile,
} from "@mui/icons-material";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { useEffect, useRef, useState } from "react";
import useDownloadImage from "../../hooks/useDownloadImage";
import Export from "../../components/Export";
import { useTranslate } from "../../translation/translate";
import { validateNpc } from "../../utility/validateJson";
import ExportAllNPCs from "../../components/common/ExportAllNPCs";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import { ExpandLess, ExpandMore } from "@mui/icons-material";

export default function NpcGallery() {
  const { t } = useTranslate();
  const [user, loading] = useAuthState(auth);

  return (
    <Layout>
      {loading && <Skeleton />}

      {!loading && !user && (
        <>
          <Typography sx={{ my: 1 }}>
            {t("You have to be logged in to access this feature")}
          </Typography>
          <SignIn />
        </>
      )}

      {user && <Personal user={user} />}
    </Layout>
  );
}

function Personal({ user }) {
  const { t } = useTranslate();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchParams] = useSearchParams();

  const [name, setName] = useState(searchParams.get("name") || "");
  const [rank, setRank] = useState(searchParams.get("rank") || "");
  const [species, setSpecies] = useState(searchParams.get("species") || "");
  const [sort, setSort] = useState(searchParams.get("sort") || "name");
  const [direction, setDirection] = useState(
    searchParams.get("direction") || "ascending"
  );
  const [tagSearch] = useState("");
  const [tagSort, setTagSort] = useState(searchParams.get("tagSort") || null);
  const [collapse, setCollapse] = useState(false);
  const [filteredParams, setFilteredParams] = useState(location.search || "");

  const fileInputRef = useRef(null);

  const personalRef = collection(firestore, "npc-personal");
  const personalQuery = query(
    personalRef,
    where("uid", "==", user.uid),
    orderBy("lvl", "asc"),
    orderBy("name", "asc")
  );
  const [personalList, loading, err] = useCollectionData(personalQuery, {
    idField: "id",
  });

  const tagCounts = personalList
    ? personalList.reduce((accumulator, npc) => {
        if (npc.tags) {
          npc.tags.forEach((tag) => {
            if (tag.name) {
              const tagName = tag.name.toUpperCase(); // Convert to UpperCase
              accumulator[tagName] = (accumulator[tagName] || 0) + 1;
            }
          });
        }
        return accumulator;
      }, {})
    : {};

  const sortedTags = Object.keys(tagCounts).sort(
    (a, b) => tagCounts[b] - tagCounts[a]
  );

  // Create wrapper functions for state updates that also update URL
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

  // Function to update URL parameters
  const updateUrlParams = (updatedParams) => {
    if (loading) return; // Don't update URL while loading

    const currentParams = {
      name,
      rank,
      species,
      tagSort,
      sort,
      direction,
      ...updatedParams,
    };

    // Build the query string
    const queryString = new URLSearchParams(
      Object.entries(currentParams).reduce((acc, [key, value]) => {
        if (value) acc[key] = value; // Only include non-empty values
        return acc;
      }, {})
    ).toString();

    // Set it for later use
    setFilteredParams(queryString);

    // Update the URL with the new query string
    navigate(`${location.pathname}?${queryString}`, {
      replace: true,
      state: {
        from: "/npc-gallery",
        search: location.search,
      },
    });
  };

  const clearSearchFilters = () => {
    // Reset all filter states
    setName("");
    setRank("");
    setSpecies("");
    setTagSort(null);
    setSort("name"); // Reset to default sort
    setDirection("ascending"); // Reset to default direction

    // Clear the URL parameters
    setFilteredParams("");

    // Update the URL to remove all query parameters
    navigate(location.pathname, { replace: true });
  };

  const addNpc = async function () {
    const data = {
      name: "-",
      species: "Beast",
      lvl: 5,
      imgurl: "",
      uid: user.uid,
      attributes: {
        dexterity: 8,
        might: 8,
        will: 8,
        insight: 8,
      },
      attacks: [],
      affinities: {},
    };
    const ref = collection(firestore, "npc-personal");

    try {
      const res = await addDoc(ref, data);
      console.debug(res);
    } catch (e) {
      console.debug(e);
    }
  };

  const handleFileUpload = async (jsonData) => {
    try {
      if (!validateNpc(jsonData)) {
        console.error("Invalid NPC data.");
        const alertMessage = t("Invalid NPC JSON data.");
        alert(alertMessage);
        return;
      }

      delete jsonData.id; // Remove the id field if present
      jsonData.uid = user.uid; // Assign the current user UID
      jsonData.published = false; // Set the published field to false

      // Reference to the Firestore collection
      const ref = collection(firestore, "npc-personal");

      // Add document to Firestore
      const res = await addDoc(ref, jsonData);
      console.debug("Document added with ID: ", res.id);
    } catch (error) {
      console.error("Error uploading NPC from JSON:", error);
    }
  };

  const copyNpc = function (npc) {
    return async function () {
      const data = Object.assign({}, npc);
      data.uid = user.uid;
      delete data.id;
      data.published = false;

      const ref = collection(firestore, "npc-personal");
      if (window.confirm("Are you sure you want to copy?")) {
        addDoc(ref, data)
          .then(function (docRef) {
            window.location.href = `/npc-gallery/${docRef.id}`;
          })
          .catch(function (error) {
            console.error("Error adding document: ", error);
          });
      }
    };
  };

  const deleteNpc = function (npc) {
    return function () {
      if (window.confirm("Are you sure you want to delete?")) {
        deleteDoc(doc(firestore, "npc-personal", npc.id));
      }
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

  const isMobile = window.innerWidth < 900;

  if (err?.code === "resource-exhausted") {
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
          // Filter based on name, species, and rank
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
                tag.name.toLowerCase().includes(tagSearch.toLowerCase())
            )
          )
            return false;

          if (species && item.species !== species) return false;

          if (rank && item.rank !== rank) return false;

          return true;
        })
        // eslint-disable-next-line array-callback-return
        .sort((item1, item2) => {
          // Sort based on selected sort and direction
          if (direction === "ascending") {
            if (sort === "name") {
              return item1.name.localeCompare(item2.name);
            } else if (sort === "level") {
              return item1.lvl - item2.lvl;
            } else if (sort === "publishedAt") {
              return (
                (item1.publishedAt ? item1.publishedAt : 0) -
                (item2.publishedAt ? item2.publishedAt : 0)
              );
            }
          } else {
            if (sort === "name") {
              return item2.name.localeCompare(item1.name);
            } else if (sort === "level") {
              return item2.lvl - item1.lvl;
            } else if (sort === "publishedAt") {
              return (
                (item2.publishedAt ? item2.publishedAt : 0) -
                (item1.publishedAt ? item1.publishedAt : 0)
              );
            }
          }
        })
        .filter((item) => {
          // Filter based on selected tag sort
          if (
            tagSort !== "" &&
            tagSort !== null &&
            !item.tags?.some(
              (tag) => tag.name.toUpperCase() === tagSort.toUpperCase()
            )
          ) {
            return false;
          }
          return true;
        })
    : [];

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 20 }}>
        <Paper sx={{ width: "100%", px: 2, py: 1 }}>
          <Grid container spacing={1} sx={{ py: 1 }} justifyContent="center">
            <Grid
              item
              xs={12}
              md={3}
              alignItems="center"
              justifyContent="center"
              sx={{ display: "flex" }}
            >
              <TextField
                id="outlined-basic"
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
              item
              xs={12}
              md={2}
              alignItems="center"
              justifyContent="center"
              sx={{ display: "flex" }}
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
                    option.toUpperCase().includes(inputValueUpper)
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
              item
              xs={6}
              md={1.5}
              alignItems="center"
              justifyContent="center"
              sx={{ display: "flex" }}
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
              item
              xs={6}
              md={1.5}
              alignItems="center"
              justifyContent="center"
              sx={{ display: "flex" }}
            >
              <FormControl fullWidth size="small">
                <InputLabel id="rank">{t("Species:")}</InputLabel>
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
              item
              xs={5}
              md={1.5}
              alignItems="center"
              justifyContent="center"
              sx={{ display: "flex" }}
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
              item
              xs={5}
              md={1.5}
              alignItems="center"
              justifyContent="center"
              sx={{ display: "flex" }}
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
              item
              xs={2}
              md={1}
              alignItems="center"
              justifyContent="center"
              sx={{ display: "flex" }}
            >
              <Tooltip title={t("clear_search_filters")} placement="top">
                <Button
                  onClick={clearSearchFilters}
                  variant="outlined"
                  fullWidth
                  sx={{
                    height: "100%",
                    padding: 0, // Remove default padding
                    minWidth: 0, // Ensure the button doesn't enforce a minimum width
                  }}
                >
                  <DeleteSweepIcon />
                </Button>
              </Tooltip>
            </Grid>
            <Grid
              item
              xs={12}
              md={4}
              alignItems="center"
              justifyContent="center"
              sx={{ display: "flex" }}
            >
              <Button
                fullWidth
                variant="contained"
                startIcon={<HistoryEdu />}
                onClick={addNpc}
              >
                {t("Create NPC")}
              </Button>
            </Grid>
            <Grid item xs={12} md={3} sx={{ display: "flex" }}>
              <ExportAllNPCs
                npcs={filteredList?.length > 0 ? filteredList : []}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <Button
                variant="outlined"
                startIcon={<UploadFile />}
                fullWidth
                onClick={() => fileInputRef.current.click()}
              >
                {t("Add NPC from JSON")}
              </Button>
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
            </Grid>
            <Grid
              item
              xs={12}
              md={2}
              alignItems="center"
              sx={{ display: "flex" }}
            >
              <Button
                variant="outlined"
                fullWidth
                startIcon={collapse ? <ExpandLess /> : <ExpandMore />}
                onClick={() => {
                  setCollapse(!collapse);
                }}
              >
                {collapse ? t("Collapse") : t("Expand")}
              </Button>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" align="center" mt={1} mb={-1}>
                {t("filtered_npc_count") + " " + filteredList?.length}
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      </div>

      {isMobile ? (
        <div>
          {filteredList?.map((npc, i) => {
            return (
              <Npc
                key={i}
                npc={npc}
                copyNpc={copyNpc}
                deleteNpc={deleteNpc}
                shareNpc={shareNpc}
                collapseGet={collapse}
                filterParams={filteredParams}
              />
            );
          })}
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
                />
              );
            })}
          </div>
        </div>
      )}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: 50,
        }}
      >
        {loading && <CircularProgress />}
      </div>

      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        open={open}
        autoHideDuration={2000}
        onClose={handleClose}
        message={t("Copied to Clipboard!")}
      />
    </>
  );
}

function Npc({ npc, copyNpc, deleteNpc, shareNpc, collapseGet, filterParams }) {
  const { t } = useTranslate();
  const ref = useRef();
  const [downloadImage] = useDownloadImage(npc.name, ref);

  const [collapse, setCollapse] = useState(false);

  useEffect(() => {
    setCollapse(collapseGet);
  }, [collapseGet]);

  function expandAndDownloadImage() {
    setCollapse(true);
    setTimeout(downloadImage, 100);
  }

  return (
    <Grid item xs={12} md={12} sx={{ marginBottom: 3 }}>
      <NpcPretty
        npc={npc}
        ref={ref}
        npcImage={npc.imgurl}
        collapse={collapse}
        onClick={() => {
          setCollapse(!collapse);
        }}
      />
      {/* <NpcUgly npc={npc} /> */}
      <Tooltip title={t("Copy")}>
        <IconButton onClick={copyNpc(npc)}>
          <ContentCopy />
        </IconButton>
      </Tooltip>
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
      <Tooltip title={t("Share URL")}>
        <IconButton onClick={() => shareNpc(npc.id)}>
          <Share />
        </IconButton>
      </Tooltip>
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
