import {
  Box,
  useMediaQuery,
  Container,
  Alert,
  AlertTitle,
  CircularProgress,
  Snackbar,
} from "@mui/material";
import Layout from "../../components/Layout";
import React, { useState, useMemo, useEffect } from "react";
import { useTranslate } from "../../translation/translate";
import { useTheme } from "@mui/material/styles";
import HeaderSection from "../../components/resources/HeaderSection";
import NavigationTabs from "../../components/resources/NavigationTabs";
import FilterSection from "../../components/resources/FilterSection";
import OfficialResources from "../../components/resources/OfficialResources";
import CommunityResources from "../../components/resources/CommunityResources";
import StatisticsFooter from "../../components/resources/StatisticsFooter";
import AddResourceRequestDialog from "../../components/resources/AddResourceRequestDialog";
import { createClient } from "@supabase/supabase-js";
import { languages } from "../../components/resources/resourceUtils";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../firebase";

function Resources() {
  const [user, loadingUser] = useAuthState(auth);
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;
  const supabase = createClient(supabaseUrl, supabaseKey);

  // State for resources
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showAddResourceDialog, setShowAddResourceDialog] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const fetchResources = async () => {
    try {
      setLoading(true);
      let { data: resources, error } = await supabase
        .from("resources")
        .select("*")
        .eq("is_visible", true); // Only fetch visible resources

      if (error) {
        console.error("Error fetching resources:", error);
        setError("Failed to load resources");
        return [];
      }
      return resources || [];
    } catch (error) {
      console.error("Unexpected error fetching resources:", error);
      setError("Unexpected error occurred");
      return [];
    }
  };

  useEffect(() => {
    const loadResources = async () => {
      const fetchedResources = await fetchResources();
      setResources(fetchedResources);
      setLoading(false);
    };
    loadResources();
  }, []);

  const muiTheme = useTheme();
  const { t } = useTranslate();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));

  // State for filtering and search
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [languageFilter, setLanguageFilter] = useState("all");
  const [expandedLicenseInfo, setExpandedLicenseInfo] = useState(false);

  // Process resources from Supabase data
  const allResources = useMemo(() => {
    if (!resources.length) return { official: [], homebrew: [] };

    const official = resources
      .filter((resource) => resource.is_official)
      .map((resource) => ({
        name: resource.title,
        description: resource.descr_short,
        type: resource.type,
        url: resource.url,
        language: resource.language,
        publisher: resource.publisher,
        collection: resource.collection,
        tags: resource.tags,
        publish_date: resource.publish_date,
        category: "official",
      }));

    const homebrew = resources
      .filter((resource) => !resource.is_official)
      .map((resource) => ({
        name: resource.title,
        description: resource.descr_short,
        type: resource.type,
        url: resource.url,
        author: resource.author,
        license: resource.license,
        language: resource.language,
        collection: resource.collection,
        tags: resource.tags,
        publish_date: resource.publish_date,
        category: "homebrew",
      }));

    return { official, homebrew };
  }, [resources]);

  const uniqueTypes = useMemo(() => {
    const types = new Set();
    [...allResources.official, ...allResources.homebrew].forEach((resource) => {
      types.add(resource.type);
    });
    return Array.from(types);
  }, [allResources]);

  const uniqueLanguages = useMemo(() => {
    const languages = new Set();
    // Include languages from both official and homebrew resources
    [...allResources.official, ...allResources.homebrew].forEach((resource) => {
      if (resource.language) {
        languages.add(resource.language);
      }
    });
    return Array.from(languages);
  }, [allResources]);

  // Filter resources based on search and filters
  const filteredResources = useMemo(() => {
    let resourceList =
      activeTab === 0 ? allResources.official : allResources.homebrew;

    if (searchQuery) {
      resourceList = resourceList.filter(
        (resource) =>
          resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          resource.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          (resource.author &&
            resource.author.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (typeFilter !== "all") {
      resourceList = resourceList.filter(
        (resource) => resource.type === typeFilter
      );
    }

    // Remove the activeTab === 0 condition to allow language filtering for both tabs
    if (languageFilter !== "all") {
      resourceList = resourceList.filter((resource) => {
        const langKey = resource.language || "other";
        return langKey === languageFilter;
      });
    }

    return resourceList;
  }, [activeTab, searchQuery, typeFilter, languageFilter, allResources]);

  const groupedOfficialResources = useMemo(() => {
    if (activeTab !== 0) return {};

    const grouped = {};
    filteredResources.forEach((resource) => {
      const languageKey = resource.language || "other";
      if (!grouped[languageKey]) {
        grouped[languageKey] = {
          language: languages[languageKey]?.lang || "Other",
          flag: languages[languageKey]?.flag || "🌐",
          resources: [],
        };
      }
      grouped[languageKey].resources.push(resource);
    });
    return grouped;
  }, [filteredResources, activeTab]);

  // Show loading state
  if (loading) {
    return (
      <Layout>
        <Container maxWidth="xl" sx={{ py: 2 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "400px",
            }}
          >
            <CircularProgress size={60} />
          </Box>
        </Container>
      </Layout>
    );
  }

  // Show error state
  if (error) {
    return (
      <Layout>
        <Container maxWidth="xl" sx={{ py: 2 }}>
          <Alert severity="error" sx={{ mb: 4 }}>
            <AlertTitle>Error Loading Resources</AlertTitle>
            {error}
          </Alert>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Header Section */}
      <HeaderSection isMobile={isMobile} />

      {/* Navigation Tabs */}
      <NavigationTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isMobile={isMobile}
      />

      {/* Search and Filter Section */}
      <FilterSection
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
        languageFilter={languageFilter}
        setLanguageFilter={setLanguageFilter}
        uniqueTypes={uniqueTypes}
        uniqueLanguages={uniqueLanguages}
      />

      {/* Official Resources Content */}
      {activeTab === 0 && (
        <OfficialResources
          groupedOfficialResources={groupedOfficialResources}
        />
      )}

      {/* Community Content */}
      {activeTab === 1 && (
        <CommunityResources
          filteredResources={filteredResources}
          setShowAddResourceDialog={setShowAddResourceDialog}
          isMobile={isMobile}
          expandedLicenseInfo={expandedLicenseInfo}
          setExpandedLicenseInfo={setExpandedLicenseInfo}
        />
      )}

      {/* Statistics Footer */}
      <StatisticsFooter
        allResources={allResources}
        uniqueLanguages={uniqueLanguages}
      />

      {/* Add Resource Request Dialog */}
      <AddResourceRequestDialog
        open={showAddResourceDialog}
        onClose={() => setShowAddResourceDialog(false)}
        userEmail={user?.email || ""} // You'll need to pass user email from your auth context
        userUUID={user?.uid || ""} // You'll need to pass user UUID from your auth context
        webhookUrl={import.meta.env.VITE_DISCORD_APPLICATIONS_WEBHOOK_URL || ""} // Add this env variable
        onSuccess={() => {
          setShowSuccessMessage(true);
        }}
      />

      {/* Success Message Snackbar */}
      <Snackbar
        open={showSuccessMessage}
        autoHideDuration={6000}
        onClose={() => setShowSuccessMessage(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Alert
          onClose={() => setShowSuccessMessage(false)}
          severity="success"
          sx={{ width: "100%" }}
        >
          {t("Resource request submitted successfully! We'll review it soon.")}
        </Alert>
      </Snackbar>
    </Layout>
  );
}

export default Resources;
