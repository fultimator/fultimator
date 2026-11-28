import { memo } from "react";
import { Box, Typography } from "@mui/material";
import { useTranslate } from "../../../translation/translate";
import { PLACEHOLDER_HEIGHT, useLazyMount } from "./useLazyMount";

const CardSlot = memo(function CardSlot({
  npc,
  renderCard,
  registerCard,
  scrollRoot,
  scrollMarginTop,
}) {
  const { elRef, mounted } = useLazyMount(scrollRoot);

  return (
    <Box
      data-npc-id={npc.id}
      ref={(el) => {
        elRef.current = el;
        registerCard(npc.id, el);
      }}
      sx={{
        scrollMarginTop,
        minHeight: mounted ? undefined : PLACEHOLDER_HEIGHT,
      }}
    >
      {mounted && renderCard(npc)}
    </Box>
  );
});

export default function CardStack({
  items,
  renderCard,
  registerCard,
  scrollRoot,
  scrollMarginTop,
  emptyText,
}) {
  const { t } = useTranslate();
  if (!items.length) {
    return (
      <Typography color="text.secondary">
        {emptyText ?? t("No adversaries match your filters.")}
      </Typography>
    );
  }
  return items.map((npc) => (
    <CardSlot
      key={npc.id}
      npc={npc}
      renderCard={renderCard}
      registerCard={registerCard}
      scrollRoot={scrollRoot}
      scrollMarginTop={scrollMarginTop}
    />
  ));
}
