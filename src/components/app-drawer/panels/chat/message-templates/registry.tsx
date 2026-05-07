import React from "react";
import { TextMessageTemplate } from "./TextMessageTemplate";
import { RollMessageTemplate } from "./RollMessageTemplate";
import { CheckMessageTemplate } from "./CheckMessageTemplate";
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

const registry: Record<ChatMessage["kind"], TemplateComponent> = {
  text: TextTemplate,
  generic: RollTemplate,
  check: CheckTemplate,
};

export const MessageContent: TemplateComponent = ({ message }) => {
  const Template = registry[message.kind];
  return Template ? <Template message={message} /> : null;
};
