import React from "react";
import { TextMessageTemplate } from "./TextMessageTemplate";
import { RollMessageTemplate } from "./RollMessageTemplate";
import { AttributeCheckMessageTemplate } from "./AttributeCheckMessageTemplate";
import { OpenCheckMessageTemplate } from "./OpenCheckMessageTemplate";
import { OpposedCheckMessageTemplate } from "./OpposedCheckMessageTemplate";
import { ActionMessageTemplate } from "./ActionMessageTemplate";
import { AccuracyCheckMessageTemplate } from "./AccuracyCheckMessageTemplate";
import { MagicCheckMessageTemplate } from "./MagicCheckMessageTemplate";
import { DisplayMessageTemplate } from "./DisplayMessageTemplate";
import type {
  ChatMessage,
  AttributeCheckMessage,
  OpenCheckMessage,
  OpposedCheckMessage,
} from "../types";
import { useChatActions } from "../ChatActionsContext.shared";

type TemplateComponent = React.FC<{ message: ChatMessage }>;

const TextTemplate: TemplateComponent = ({ message }) => {
  if (message.kind !== "text") return null;
  return <TextMessageTemplate text={message.text} />;
};

const RollTemplate: TemplateComponent = ({ message }) => {
  if (message.kind !== "generic") return null;
  return <RollMessageTemplate roll={message.roll} />;
};

const OpenCheckTemplate: TemplateComponent = ({ message }) => {
  const { onOppose, selectedSpeaker } = useChatActions();
  if (message.kind !== "open") return null;
  const canOppose =
    onOppose != null && message.speaker !== selectedSpeaker;
  return (
    <OpenCheckMessageTemplate
      check={message.check}
      onOppose={
        canOppose ? () => onOppose(message as OpenCheckMessage) : undefined
      }
    />
  );
};

const AttributeCheckWithOpposeTemplate: TemplateComponent = ({ message }) => {
  const { onOppose, selectedSpeaker } = useChatActions();
  if (message.kind !== "attribute") return null;
  const canOppose =
    onOppose != null && message.speaker !== selectedSpeaker;
  return (
    <AttributeCheckMessageTemplate
      check={message.check}
      onOppose={
        canOppose ? () => onOppose(message as AttributeCheckMessage) : undefined
      }
    />
  );
};

const OpposedCheckTemplate: TemplateComponent = ({ message }) => {
  const { onRerollOpposed } = useChatActions();
  if (message.kind !== "opposed") return null;
  return (
    <OpposedCheckMessageTemplate
      check={message.check}
      onReroll={
        onRerollOpposed != null
          ? () => onRerollOpposed(message as OpposedCheckMessage)
          : undefined
      }
    />
  );
};

const ActionTemplate: TemplateComponent = ({ message }) => {
  if (message.kind !== "action") return null;
  return <ActionMessageTemplate message={message} />;
};

const AccuracyTemplate: TemplateComponent = ({ message }) => {
  if (message.kind !== "accuracy") return null;
  return <AccuracyCheckMessageTemplate check={message.check} />;
};

const MagicTemplate: TemplateComponent = ({ message }) => {
  if (message.kind !== "magic") return null;
  return <MagicCheckMessageTemplate check={message.check} />;
};

const DisplayTemplate: TemplateComponent = ({ message }) => {
  if (message.kind !== "display") return null;
  return <DisplayMessageTemplate message={message} />;
};

const registry: Record<ChatMessage["kind"], TemplateComponent> = {
  text: TextTemplate,
  generic: RollTemplate,
  attribute: AttributeCheckWithOpposeTemplate,
  open: OpenCheckTemplate,
  opposed: OpposedCheckTemplate,
  action: ActionTemplate,
  accuracy: AccuracyTemplate,
  magic: MagicTemplate,
  display: DisplayTemplate,
};

export const MessageContent: TemplateComponent = ({ message }) => {
  const Template = registry[message.kind];
  return Template ? <Template message={message} /> : null;
};
