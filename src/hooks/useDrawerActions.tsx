import React, { useEffect } from "react";
import { KeyboardArrowUp, Save } from "@mui/icons-material";
import { useAppDrawerStore } from "../store/appDrawerStore";
import { useTranslate } from "../translation/translate";

export function useDrawerScrollTop(showScrollTop: boolean) {
  const setDrawerBottomActions = useAppDrawerStore((s) => s.setDrawerBottomActions);
  const { t } = useTranslate();

  useEffect(() => {
    setDrawerBottomActions((prev) => {
      const others = prev.filter((a) => a.id !== "scroll-top");
      return [
        ...others,
        {
          id: "scroll-top",
          label: t("Scroll to top"),
          icon: <KeyboardArrowUp fontSize="small" />,
          disabled: !showScrollTop,
          onClick: () => window.scrollTo({ top: 0, behavior: "smooth" }),
        },
      ];
    });
  }, [showScrollTop, setDrawerBottomActions, t]);

  useEffect(() => {
    return () => {
      setDrawerBottomActions((prev) => prev.filter((a) => a.id !== "scroll-top"));
    };
  }, [setDrawerBottomActions]);
}

export function useDrawerSave(options: {
  canSave: boolean;
  onSave: () => void;
}) {
  const { canSave, onSave } = options;
  const setDrawerBottomActions = useAppDrawerStore((s) => s.setDrawerBottomActions);
  const { t } = useTranslate();

  useEffect(() => {
    setDrawerBottomActions((prev) => {
      const others = prev.filter((a) => a.id !== "save");
      return [
        {
          id: "save",
          label: t("Save"),
          icon: <Save fontSize="small" />,
          disabled: !canSave,
          onClick: onSave,
        },
        ...others,
      ];
    });
  }, [canSave, onSave, setDrawerBottomActions, t]);

  useEffect(() => {
    return () => {
      setDrawerBottomActions((prev) => prev.filter((a) => a.id !== "save"));
    };
  }, [setDrawerBottomActions]);
}
