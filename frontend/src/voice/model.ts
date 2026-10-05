import operations from "../fixtures/operations.json" with { type: "json" }
import fixture from "../fixtures/voice.json" with { type: "json" }
export const voiceFixture = fixture
export const voiceStates = [
  "normal",
  "recording",
  "transcribing",
  "playback",
  "empty",
  "loading",
  "error",
  "permission-unavailable",
  "denied",
  "long-content",
  "unknown",
] as const
export type VoiceState = (typeof voiceStates)[number]
export type Clip = (typeof fixture.clips)[number]
export function voiceModel(state: VoiceState, id: string, step: number) {
  const clip = fixture.clips.find((c) => c.id === id) ?? fixture.clips[0]
  const accessible = !["loading", "error", "denied"].includes(state)
  const segments =
    accessible && state !== "empty"
      ? clip.segments.slice(0, state === "transcribing" ? step : undefined).map((s) => ({
          ...s,
          text:
            state === "long-content"
              ? `${s.text} ${"Authored long review sentence. ".repeat(25)}`
              : s.text,
        }))
      : []
  const run = operations.runs.find((r) => r.id === clip.runId)
  if (!run) throw new Error("Bundled voice run missing")
  return {
    state,
    clip,
    segments,
    accessible,
    run,
    canPlay:
      accessible &&
      !["empty", "recording", "transcribing", "permission-unavailable", "unknown"].includes(state),
  }
}
