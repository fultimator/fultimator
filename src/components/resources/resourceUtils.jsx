import LaunchIcon from "@mui/icons-material/Launch";
import LanguageIcon from "@mui/icons-material/Language";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import GetAppIcon from "@mui/icons-material/GetApp";
import FreeBreakfastIcon from "@mui/icons-material/FreeBreakfast";
import NewReleasesIcon from "@mui/icons-material/NewReleases";
import ExtensionIcon from "@mui/icons-material/Extension";
import CopyrightIcon from "@mui/icons-material/Copyright";
import StarIcon from "@mui/icons-material/Star";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import InfoIcon from "@mui/icons-material/Info";
import Diversity1Icon from "@mui/icons-material/Diversity1";

export const getTypeIcon = (type) => {
  switch (type) {
    case "pdf":
      return <GetAppIcon />;
    case "physical":
      return <MenuBookIcon />;
    case "both":
      return <MenuBookIcon />;
    case "free":
      return <FreeBreakfastIcon />;
    case "website":
      return <LanguageIcon />;
    case "coming_soon":
      return <NewReleasesIcon />;
    case "tools":
      return <ExtensionIcon />;
    case "content":
      return <StarIcon />;
    case "crowdfunding":
      return <Diversity1Icon />;
    default:
      return <LaunchIcon />;
  }
};

export const getTypeColor = ({type, isDarkMode = false}) => {
  switch (type) {
    case "free":
      return isDarkMode ? "#81c784" : "#388e3c";
    case "coming_soon":
      return isDarkMode ? "#ffb74d" : "#f57c00";
    case "pdf":
      return isDarkMode ? "#90caf9" : "#1976d2";
    case "physical":
    case "both":
      return isDarkMode ? "#f48fb1" : "#c2185b";
    case "website":
      return isDarkMode ? "#ce93d8" : "#7b1fa2";
    case "tools":
      return isDarkMode ? "#a5d6a7" : "#4caf50";
    case "content":
      return isDarkMode ? "#ffcc02" : "#ff9800";
    default:
      return isDarkMode ? "#e0e0e0" : "#666666";
  }
};

export const getTypeLabel = (type) => {
  switch (type) {
    case "pdf":
      return "PDF Download";
    case "physical":
      return "Physical Book";
    case "both":
      return "Book & PDF";
    case "free":
      return "Free Resource";
    case "website":
      return "Website";
    case "coming_soon":
      return "Coming Soon";
    case "tools":
      return "Tool";
    case "content":
      return "Content";
    default:
      return "Resource";
  }
};

export const languages = {
  en: {
    lang: "English",
    flag: "🇺🇸",
  },
  it: {
    lang: "Italiano",
    flag: "🇮🇹",
  },
  fr: {
    lang: "Français",
    flag: "🇫🇷",
  },
  de: {
    lang: "Deutsch",
    flag: "🇩🇪",
  },
  pl: {
    lang: "Polski",
    flag: "🇵🇱",
  },
  "pt-BR": {
    lang: "Português (Brasil)",
    flag: "🇧🇷",
  },
  es: {
    lang: "Español",
    flag: "🇪🇸",
  },
  zh: {
    lang: "中文",
    flag: "🇨🇳",
  },
  other: {
    lang: "Other",
    flag: "🌐",
  },
};
