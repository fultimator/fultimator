import {
  Grid,
  Paper,
  useTheme,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Box,
  Chip,
  TextField,
  Tabs,
  Tab,
  Divider,
} from "@mui/material";
import { AutoAwesome } from "@mui/icons-material";
import { useState, useRef } from "react";
import Pretty from "./Pretty";
import ChangeName from "../common/ChangeName";
import ChangeQuality from "../common/ChangeQuality";
import { useTranslate } from "../../../translation/translate";
import CustomHeaderAlt from "../../../components/common/CustomHeaderAlt";
import useUploadJSON from "../../../hooks/useUploadJSON";
import QualitiesGenerator from "./QualitiesGenerator";
import SelectBase from "./SelectBase";
import qualities from "../../../libs/qualities";

const CATEGORIES = ["Offensive", "Defensive", "Enhancement"];
const FILTER_OPTIONS = [
  { label: "Weapons", value: "weapon" },
  { label: "Custom Weapons", value: "customWeapon" },
  { label: "Armor", value: "armor" },
  { label: "Shields", value: "shield" },
  { label: "Accessories", value: "accessory" },
];

function Qualities() {
  const { t } = useTranslate();
  const theme = useTheme();
  const secondary = theme.palette.secondary.main;

  const [tab, setTab] = useState(0);
  const [name, setName] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [quality, setQuality] = useState("");
  const [cost, setCost] = useState(0);
  const [filter, setFilter] = useState([]);
  const [selectedBase, setSelectedBase] = useState("");

  const fileInputRef = useRef(null);

  const { handleFileUpload } = useUploadJSON((data) => {
    if (data) {
      if (data.name) setName(data.name);
      if (data.category) setCategory(data.category);
      if (data.quality) setQuality(data.quality);
      if (data.cost !== undefined) setCost(data.cost);
      if (data.filter) setFilter(data.filter);
    }
  });

  const handleClearFields = () => {
    setName("");
    setCategory(CATEGORIES[0]);
    setQuality("");
    setCost(0);
    setFilter([]);
    setSelectedBase("");
  };

  const handleFilterChange = (event) => {
    const {
      target: { value },
    } = event;
    setFilter(typeof value === "string" ? value.split(",") : value);
  };

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  const handleBaseChange = (e) => {
    const baseName = e.target.value;
    const base = qualities.find((q) => q.name === baseName);
    if (base) {
      setSelectedBase(baseName);
      setName(t(base.name));
      setCategory(base.category);
      setQuality(t(base.quality));
      setCost(base.cost);
      setFilter(base.filter || []);
    }
  };

  return (
    <Grid container spacing={2}>
      {/* Form */}
      <Grid item xs={12} sm={6}>
        <Paper
          elevation={3}
          sx={{
            p: "14px",
            borderRadius: "8px",
            border: "2px solid",
            borderColor: secondary,
          }}
        >
          {/* Header */}
          <CustomHeaderAlt
            headerText={t("Qualities")}
            icon={<AutoAwesome fontSize="large" />}
          />

          <Tabs
            value={tab}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
            sx={{ mb: 2 }}
          >
            <Tab label={t("Custom")} />
            <Tab label={t("Generator")} />
          </Tabs>

          {tab === 0 && (
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12}>
                <SelectBase value={selectedBase} onChange={handleBaseChange} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <ChangeName
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth variant="standard">
                  <InputLabel id="category-label">{t("Category")}</InputLabel>
                  <Select
                    labelId="category-label"
                    id="category-select"
                    value={category}
                    label={t("Category")}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    {CATEGORIES.map((cat) => (
                      <MenuItem key={cat} value={cat}>
                        {t(cat)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <ChangeQuality
                  quality={quality}
                  setQuality={(e) => setQuality(e.target.value)}
                  qualityCost={cost}
                  setQualityCost={(e) => setCost(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="filter-label">{t("Applicable to")}</InputLabel>
                  <Select
                    labelId="filter-label"
                    id="filter-select"
                    multiple
                    value={filter}
                    onChange={handleFilterChange}
                    input={<OutlinedInput label={t("Applicable to")} />}
                    renderValue={(selected) => (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip
                            key={value}
                            label={t(
                              FILTER_OPTIONS.find((o) => o.value === value)
                                ?.label || value
                            )}
                          />
                        ))}
                      </Box>
                    )}
                  >
                    {FILTER_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {t(option.label)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item>
                    <Button
                      variant="outlined"
                      onClick={() => fileInputRef.current.click()}
                    >
                      {t("Upload JSON")}
                    </Button>
                  </Grid>
                  <Grid item>
                    <Button variant="outlined" onClick={handleClearFields}>
                      {t("Clear All Fields")}
                    </Button>
                  </Grid>
                </Grid>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  style={{ display: "none" }}
                />
              </Grid>
            </Grid>
          )}

          {tab === 1 && (
            <QualitiesGenerator onGenerate={(text) => setQuality(text)} />
          )}
        </Paper>
      </Grid>

      {/* Pretty */}
      <Grid item xs={12} sm={6}>
        <Pretty
          custom={{
            name,
            category,
            quality,
            cost,
            filter,
          }}
        />
      </Grid>
    </Grid>
  );
}

export default Qualities;
