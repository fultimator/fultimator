import type { DieSides } from "./types";

export const LOCAL_CHAT_KEY = "fultimator-local-chat";
export const LOCAL_SPEAKER_KEY = "fultimator-chat-speaker";
export const DICE_OPTIONS: DieSides[] = [4, 6, 8, 10, 12, 20];
export const AUTHOR_NAME = "You";
export const DEFAULT_SPEAKER = "Game Master";

// Built-in speaker names are stored in English; translate them for display.
export const isBuiltinSpeaker = (name: string) =>
  name === AUTHOR_NAME || name === DEFAULT_SPEAKER;
