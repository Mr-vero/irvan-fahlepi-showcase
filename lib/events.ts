/** The only events the first-party counter accepts. Anything else is dropped on the server. */
export const EVENT_NAMES = [
  "survey_start",
  "survey_answer",
  "survey_complete",
  "share_click",
  "share_complete",
  "game_start",
  "game_complete",
  "leaderboard_submit",
  "story_start",
  "story_complete",
] as const;

export type EventName = (typeof EVENT_NAMES)[number];

export function isEventName(v: unknown): v is EventName {
  return typeof v === "string" && (EVENT_NAMES as readonly string[]).includes(v);
}
