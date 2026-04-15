import LaunchIcon from "@mui/icons-material/Launch";
import LanguageIcon from "@mui/icons-material/Language";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import GetAppIcon from "@mui/icons-material/GetApp";
import FreeBreakfastIcon from "@mui/icons-material/FreeBreakfast";
import NewReleasesIcon from "@mui/icons-material/NewReleases";
import ExtensionIcon from "@mui/icons-material/Extension";
import StarIcon from "@mui/icons-material/Star";
import Diversity1Icon from "@mui/icons-material/Diversity1";
import ConnectWithoutContactIcon from '@mui/icons-material/ConnectWithoutContact';
import { useTranslate } from "../../translation/translate";

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
    case "social_media":
      return <ConnectWithoutContactIcon />;
    default:
      return <LaunchIcon />;
  }
};

export const getTypeColor = ({type, isDarkMode = false}) => {
  switch (type) {
    case "both":
      return isDarkMode ? "#64b5f6" : "#1565c0";
    case "free":
      return isDarkMode ? "#81c784" : "#2e7d32";
    case "pdf":
      return isDarkMode ? "#f48fb1" : "#c2185b";
    case "physical":
      return isDarkMode ? "#ffb74d" : "#e65100";
    case "website":
      return isDarkMode ? "#ba68c8" : "#6a1b9a";
    case "tools":
      return isDarkMode ? "#4db6ac" : "#00695c";
    case "content":
      return isDarkMode ? "#ffd54f" : "#f57c00";
    case "coming_soon":
      return isDarkMode ? "#ff8a65" : "#d84315";
    case "crowdfunding":
      return isDarkMode ? "#f48fb1" : "#ad1457";
    case "social_media":
      return isDarkMode ? "#90a4ae" : "#455a64";
    default:
      return isDarkMode ? "#bdbdbd" : "#757575";
  }
};

export const useTypeLabel = () => {
  const { t } = useTranslate();
  return (type) => {
    switch (type) {
      case "pdf":
        return t("resources_pdf_download");
      case "physical":
        return t("resources_physical_book");
      case "both":
        return t("resources_book_pdf");
      case "free":
        return t("resources_free_resource");
      case "website":
        return t("resources_website");
      case "coming_soon":
        return t("resources_coming_soon");
      case "tools":
        return t("resources_tools");
      case "content":
        return t("resources_content");
      case "crowdfunding":
        return t("resources_crowdfunding");
      case "social_media":
        return t("resources_social_media");
      default:
        return t("resources_resource");
    }
  };
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
