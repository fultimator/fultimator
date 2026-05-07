import React, { useEffect, useRef, useState } from "react";
import { Box, Divider, Typography } from "@mui/material";
import DeleteConfirmationDialog from "../../../common/DeleteConfirmationDialog";
import { AUTHOR_NAME, DEFAULT_SPEAKER } from "./constants";
import { formatTimeAgo } from "./utils";
import { useChatStore } from "./chatStore";
import {
  useRouteActor,
  useActorName,
  resolveSpeakerOptions,
} from "./domain/speakers";
import { BaseMessageTemplate } from "./message-templates/BaseMessageTemplate";
import { MessageContent } from "./message-templates/registry";
import { MessageListErrorBoundary } from "./MessageListErrorBoundary";
import { ChatComposer } from "./ChatComposer";

export const ChatPanel: React.FC = () => {
  const [selectedSpeaker, setSelectedSpeaker] = useState(DEFAULT_SPEAKER);
  const [clearLogsDialogOpen, setClearLogsDialogOpen] = useState(false);
  const endOfMessagesRef = useRef<HTMLDivElement | null>(null);
  const previousMessageCountRef = useRef(0);

  const { playerDoc, npcDoc } = useRouteActor();
  const contextActorName = useActorName(playerDoc, npcDoc);
  const speakerOptions = resolveSpeakerOptions(contextActorName);
  const activePlayerDoc =
    selectedSpeaker === DEFAULT_SPEAKER ? null : playerDoc;
  const store = useChatStore(selectedSpeaker, activePlayerDoc);

  useEffect(() => {
    if (!speakerOptions.includes(selectedSpeaker)) {
      setSelectedSpeaker(DEFAULT_SPEAKER);
    }
  }, [selectedSpeaker, speakerOptions]);

  useEffect(() => {
    const prev = previousMessageCountRef.current;
    if (store.messages.length > prev) {
      endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    previousMessageCountRef.current = store.messages.length;
  }, [store.messages.length]);

  const handleExport = () => {
    try {
      const blob = new Blob(
        [
          JSON.stringify(
            { exportedAt: new Date().toISOString(), messages: store.messages },
            null,
            2,
          ),
        ],
        { type: "application/json" },
      );
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `chat-log-${Date.now()}.json`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
    } catch {
      // ignore export errors
    }
  };

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <MessageListErrorBoundary>
        <Box
          sx={{
            px: 2,
            pt: 2,
            pb: 2,
            flex: 1,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 1,
          }}
        >
          {store.messages.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              Start chatting or roll from the dice tray below.
            </Typography>
          )}
          {store.messages.map((message) => (
            <BaseMessageTemplate
              key={message.id}
              speaker={message.speaker || AUTHOR_NAME}
              timeAgo={formatTimeAgo(message.createdAt)}
              onDelete={() => store.deleteMessage(message.id)}
            >
              <MessageContent message={message} />
            </BaseMessageTemplate>
          ))}
          <Box ref={endOfMessagesRef} />
        </Box>
      </MessageListErrorBoundary>

      <Divider />

      <ChatComposer
        store={store}
        speakerOptions={speakerOptions}
        selectedSpeaker={selectedSpeaker}
        playerDoc={activePlayerDoc}
        onSpeakerChange={setSelectedSpeaker}
        onExport={handleExport}
        onClearRequest={() => setClearLogsDialogOpen(true)}
      />

      <DeleteConfirmationDialog
        open={clearLogsDialogOpen}
        onClose={() => setClearLogsDialogOpen(false)}
        onConfirm={() => store.clearAll()}
        title="Clear Chat Logs"
        message="Are you sure you want to delete all chat messages and roll history?"
        enableCtrlBypass={false}
      />
    </Box>
  );
};
