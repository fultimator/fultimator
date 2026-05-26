import React, { useEffect, useRef, useState } from "react";
import { Box, Card, IconButton, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useChatMessagesStore } from "../../store/chatMessagesStore";
import { useEncounterChatStore } from "../../stores/encounterChatStore";
import { useThemeStore } from "../../store/themeStore";
import { useAppDrawerStore } from "../../store/appDrawerStore";
import { MessageContent } from "../app-drawer/panels/chat/message-templates/registry";
import type { ChatMessage } from "../app-drawer/panels/chat/types";

const TOAST_DURATION = 6000;
const EXIT_DURATION = 350;

const cardAnimations = {
  "@keyframes toastEnter": {
    from: { opacity: 0, transform: "translateY(20px)" },
    to: { opacity: 1, transform: "translateY(0)" },
  },
  "@keyframes toastExit": {
    from: { opacity: 1, transform: "translateY(0)" },
    to: { opacity: 0, transform: "translateY(-12px)" },
  },
};

interface ToastEntry {
  id: string;
  message: ChatMessage;
  exiting: boolean;
}

export const ChatToastOverlay: React.FC = () => {
  const globalMessages = useChatMessagesStore((s) => s.messages);
  const encounterMessages = useEncounterChatStore((s) => s.messages);
  const messages = React.useMemo(
    () =>
      [...globalMessages, ...encounterMessages].sort(
        (a, b) => a.createdAt - b.createdAt,
      ),
    [globalMessages, encounterMessages],
  );
  const drawerOpen = useThemeStore((s) => s.drawerOpen);
  const setDrawerOpen = useThemeStore((s) => s.setDrawerOpen);
  const activeTab = useAppDrawerStore((s) => s.activeTab);
  const setActiveTab = useAppDrawerStore((s) => s.setActiveTab);

  const [toasts, setToasts] = useState<ToastEntry[]>([]);
  const mountedCountRef = useRef<number | null>(null);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    mountedCountRef.current = messages.length;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const dismissToast = (id: string) => {
    const t = timers.current.get(id);
    if (t !== undefined) {
      clearTimeout(t);
      timers.current.delete(id);
    }
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)),
    );
    setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      EXIT_DURATION,
    );
  };

  const pauseToast = (id: string) => {
    const t = timers.current.get(id);
    if (t !== undefined) {
      clearTimeout(t);
      timers.current.delete(id);
    }
  };

  const resumeToast = (id: string) => {
    if (!timers.current.has(id))
      timers.current.set(
        id,
        setTimeout(() => dismissToast(id), TOAST_DURATION),
      );
  };

  useEffect(() => {
    if (mountedCountRef.current === null) return;
    if (messages.length <= mountedCountRef.current) {
      mountedCountRef.current = messages.length;
      return;
    }

    const newMessages = messages.slice(mountedCountRef.current);
    mountedCountRef.current = messages.length;
    if (drawerOpen && activeTab === "chat") return;

    newMessages.forEach((msg) => {
      if (timers.current.has(msg.id)) return;
      timers.current.set(
        msg.id,
        setTimeout(() => dismissToast(msg.id), TOAST_DURATION),
      );
      setToasts((prev) => [
        ...prev,
        { id: msg.id, message: msg, exiting: false },
      ]);
    });
  }, [messages, drawerOpen, activeTab]);

  useEffect(() => {
    const t = timers.current;
    return () => t.forEach((timer) => clearTimeout(timer));
  }, []);

  const handleOpen = () => {
    setDrawerOpen(true);
    setActiveTab("chat");
    timers.current.forEach((t) => clearTimeout(t));
    timers.current.clear();
    setToasts([]);
  };

  if (toasts.length === 0) return null;

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 16,
        right: 16,
        display: "flex",
        flexDirection: "column",
        gap: 1,
        zIndex: 1400,
        pointerEvents: "none",
        width: { xs: "calc(100vw - 32px)", sm: 360 },
      }}
    >
      {toasts.map((toast) => (
        <ToastCard
          key={toast.id}
          toast={toast}
          onDismiss={dismissToast}
          onOpen={handleOpen}
          onPause={pauseToast}
          onResume={resumeToast}
        />
      ))}
    </Box>
  );
};

interface ToastCardProps {
  toast: ToastEntry;
  onDismiss: (id: string) => void;
  onOpen: () => void;
  onPause: (id: string) => void;
  onResume: (id: string) => void;
}

const ToastCard: React.FC<ToastCardProps> = ({
  toast,
  onDismiss,
  onOpen,
  onPause,
  onResume,
}) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const touchStartX = useRef<number | null>(null);
  const swiped = useRef(false);

  const applyDrag = (el: HTMLDivElement, dx: number, transition = "none") => {
    el.style.transition = transition;
    el.style.transform = dx > 0 ? `translateX(${dx}px)` : "";
    el.style.opacity = dx > 0 ? String(Math.max(0, 1 - dx / 160)) : "";
  };

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const onTouchStart = (e: Event) => {
      touchStartX.current = (e as globalThis.TouchEvent).touches[0].clientX;
      swiped.current = false;
      onPause(toast.id);
    };

    const onTouchMove = (e: Event) => {
      if (touchStartX.current === null) return;
      const dx =
        (e as globalThis.TouchEvent).touches[0].clientX - touchStartX.current;
      if (dx > 0) {
        e.preventDefault();
        swiped.current = dx > 10;
        el.style.animation = "none";
        applyDrag(el, dx);
      }
    };

    const onTouchEnd = (e: Event) => {
      if (touchStartX.current === null) return;
      const dx =
        (e as globalThis.TouchEvent).changedTouches[0].clientX -
        touchStartX.current;
      touchStartX.current = null;
      if (dx > 60) {
        swiped.current = true;
        onDismiss(toast.id);
      } else {
        swiped.current = false;
        el.style.animation = "";
        applyDrag(el, 0, "transform 0.2s ease, opacity 0.2s ease");
        onResume(toast.id);
      }
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [toast.id]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Card
      ref={cardRef}
      onClick={() => {
        if (!swiped.current) onOpen();
      }}
      onMouseEnter={() => onPause(toast.id)}
      onMouseLeave={() => onResume(toast.id)}
      sx={{
        ...cardAnimations,
        pointerEvents: "auto",
        cursor: "pointer",
        width: "100%",
        border: 1,
        borderColor: "divider",
        borderRadius: 2,
        backgroundColor: "background.paper",
        boxShadow: 3,
        overflow: "hidden",
        animation: toast.exiting
          ? `toastExit ${EXIT_DURATION}ms ease-in forwards`
          : "toastEnter 300ms ease-out forwards",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 1.5,
          pt: 0.75,
          pb: 0,
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
          {("speaker" in toast.message ? toast.message.speaker : undefined) ??
            "NPC"}
        </Typography>
        <IconButton
          size="small"
          aria-label="Dismiss"
          onClick={(e) => {
            e.stopPropagation();
            onDismiss(toast.id);
          }}
          sx={{ ml: 1, flexShrink: 0, color: "text.secondary" }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
      <Box sx={{ px: 1.5, pb: 1, pt: 0.5 }}>
        <MessageContent message={toast.message} />
      </Box>
    </Card>
  );
};

export default ChatToastOverlay;
