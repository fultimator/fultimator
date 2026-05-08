import React from "react";
import { TextMessageTemplate } from "./TextMessageTemplate";
import { RollMessageTemplate } from "./RollMessageTemplate";
import { CheckMessageTemplate } from "./CheckMessageTemplate";
import { ActionMessageTemplate } from "./ActionMessageTemplate";
import { AccuracyCheckMessageTemplate } from "./AccuracyCheckMessageTemplate";
import type { ChatMessage } from "../types";

type TemplateComponent = React.FC<{ message: ChatMessage }>;

const TextTemplate: TemplateComponent = ({ message }) => {
  if (message.kind !== "text") return null;
  return <TextMessageTemplate text={message.text} />;
};

const RollTemplate: TemplateComponent = ({ message }) => {
  if (message.kind !== "generic") return null;
  return <RollMessageTemplate roll={message.roll} />;
};

const CheckTemplate: TemplateComponent = ({ message }) => {
  if (message.kind !== "check") return null;
  return <CheckMessageTemplate check={message.check} />;
};

const ActionTemplate: TemplateComponent = ({ message }) => {
  if (message.kind !== "action") return null;
  return <ActionMessageTemplate message={message} />;
};

const AccuracyTemplate: TemplateComponent = ({ message }) => {
  if (message.kind !== "accuracy") return null;
  return <AccuracyCheckMessageTemplate check={message.check} />;
};

const registry: Record<ChatMessage["kind"], TemplateComponent> = {
  text: TextTemplate,
  generic: RollTemplate,
  check: CheckTemplate,
  action: ActionTemplate,
  accuracy: AccuracyTemplate,
};

export const MessageContent: TemplateComponent = ({ message }) => {
  const Template = registry[message.kind];
  return Template ? <Template message={message} /> : null;
};
