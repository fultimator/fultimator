import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Fab,
  Paper,
  Popover,
  Tooltip,
  useMediaQuery,
} from "@mui/material";
import {
  AutoAwesome,
  AutoFixHigh,
  Diamond,
  FlashOn,
  Home,
  PlayCircleOutlined,
  Psychology,
  QueryStats,
  Shield,
  Star,
  StickyNote2,
  Timeline,
} from "@mui/icons-material";
import { useTranslate } from "../../translation/translate";

const APP_BAR_OFFSET = 72;
const BOTTOM_TOLERANCE = 8;

const SECTIONS = [
  { id: "edit-section-overview", label: "Overview", Icon: Home },
  { id: "edit-section-basics", label: "Basics", Icon: Psychology },
  { id: "edit-section-affinities", label: "Stats", Icon: Shield },
  { id: "edit-section-attacks", label: "Attacks", Icon: FlashOn },
  { id: "edit-section-spells", label: "Spells", Icon: AutoFixHigh },
  { id: "edit-section-actions", label: "Actions", Icon: PlayCircleOutlined },
  { id: "edit-section-special", label: "Special Rules", Icon: Star },
  { id: "edit-section-raregear", label: "Rare Gear", Icon: Diamond },
  { id: "edit-section-notes", label: "Notes", Icon: StickyNote2 },
  { id: "edit-section-effects", label: "Effects", Icon: AutoAwesome },
  { id: "edit-section-attackchance", label: "Attack Chance", Icon: QueryStats },
];

const IDS = SECTIONS.map((section) => section.id);

function useActiveSection() {
  const [active, setActive] = useState(IDS[0]);
  const [sections, setSections] = useState([]);

  useEffect(() => {
    setSections(SECTIONS.filter(({ id }) => document.getElementById(id)));
    const visible = new Set();
    const observer = new window.IntersectionObserver(
      (entries) => {
        entries.forEach(({ target, isIntersecting }) =>
          isIntersecting ? visible.add(target.id) : visible.delete(target.id),
        );
        const first = IDS.find((id) => visible.has(id));
        if (first) setActive(first);
      },
      { rootMargin: `-${APP_BAR_OFFSET}px 0px -55% 0px` },
    );
    IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    const onScroll = () => {
      const atBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - BOTTOM_TOLERANCE;
      if (!atBottom) return;
      const last = [...IDS].reverse().find((id) => document.getElementById(id));
      if (last) setActive(last);
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return { active, sections };
}

function scrollToSection(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - APP_BAR_OFFSET;
  window.scrollTo({ top, behavior: "smooth" });
}

function TimelineList({ sections, active, showLabels, onSelect }) {
  const { t } = useTranslate();
  const activeIndex = sections.findIndex(({ id }) => id === active);

  return (
    <Box
      sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      {sections.map(({ id, label, Icon }, index) => {
        const isActive = id === active;
        const reached = index <= activeIndex;
        const dot = (
          <Button
            onClick={() => {
              scrollToSection(id);
              onSelect?.();
            }}
            aria-label={t(label)}
            aria-current={isActive ? "location" : undefined}
            variant={isActive ? "contained" : "outlined"}
            color={reached ? "primary" : "inherit"}
            size="small"
            startIcon={showLabels ? <Icon /> : undefined}
            sx={{
              height: 36,
              minWidth: 0,
              width: showLabels ? "100%" : 36,
              px: showLabels ? 1.5 : 0,
              justifyContent: showLabels ? "flex-start" : "center",
              whiteSpace: "nowrap",
            }}
          >
            {showLabels ? t(label) : <Icon />}
          </Button>
        );
        return (
          <Box
            key={id}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: showLabels ? "flex-start" : "center",
              width: showLabels ? "100%" : "auto",
            }}
          >
            {showLabels ? (
              dot
            ) : (
              <Tooltip title={t(label)} placement="right">
                {dot}
              </Tooltip>
            )}
            {index < sections.length - 1 && (
              <Box
                sx={{
                  width: 2,
                  height: 14,
                  ml: showLabels ? "21px" : 0,
                  bgcolor: index < activeIndex ? "primary.main" : "divider",
                  transition: "background-color 0.2s ease",
                }}
              />
            )}
          </Box>
        );
      })}
    </Box>
  );
}

export default function NpcSectionTimeline() {
  const { t } = useTranslate();
  const wide = useMediaQuery("(min-width: 1400px)");
  const roomy = useMediaQuery("(min-width: 1640px)");
  const { active, sections } = useActiveSection();
  const [anchor, setAnchor] = useState(null);

  if (wide) {
    return (
      <Paper
        component="nav"
        aria-label={t("Sections")}
        sx={{
          position: "fixed",
          left: 12,
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 1100,
          p: 1,
        }}
      >
        <TimelineList sections={sections} active={active} showLabels={roomy} />
      </Paper>
    );
  }

  return (
    <>
      <Tooltip title={t("Sections")} placement="right">
        <Fab
          size="small"
          color="primary"
          aria-label={t("Sections")}
          onClick={(e) => setAnchor(e.currentTarget)}
          sx={{ position: "fixed", bottom: 16, left: 16, zIndex: 1200 }}
        >
          <Timeline />
        </Fab>
      </Tooltip>
      <Popover
        open={Boolean(anchor)}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        transformOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Box sx={{ p: 1.5, minWidth: 200 }}>
          <TimelineList
            sections={sections}
            active={active}
            showLabels
            onSelect={() => setAnchor(null)}
          />
        </Box>
      </Popover>
    </>
  );
}
