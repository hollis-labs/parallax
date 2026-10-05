import { Button } from "@hollis-labs/design-components"
import { Panel } from "@hollis-labs/kit-dashboard/widgets"
import {
  SpeechInput,
  Transcription,
  TranscriptionSegment,
  VoiceSelector,
  VoiceSelectorContent,
  VoiceSelectorDescription,
  VoiceSelectorEmpty,
  VoiceSelectorInput,
  VoiceSelectorItem,
  VoiceSelectorList,
  VoiceSelectorName,
  VoiceSelectorTrigger,
} from "@hollis-labs/kit-voice"
import { Headphones } from "lucide-react"
import { lazy, Suspense, useEffect, useRef, useState } from "react"
import { type VoiceState, voiceFixture, voiceModel, voiceStates } from "./model"
import "./voice.css"

const Player = lazy(() => import("./Player"))
export function VoiceLab({
  initialState = "normal",
  initialView = "Transcript",
  onInspect,
  onIntent,
}: {
  initialState?: VoiceState
  initialView?: string
  onInspect: (id: string) => void
  onIntent: (s: string) => void
}) {
  const [state, setState] = useState<VoiceState>(initialState),
    [id, setId] = useState(voiceFixture.clips[0].id),
    [view, setView] = useState(initialView),
    [time, setTime] = useState(0),
    [seek, setSeek] = useState({ id: 0, time: 0 }),
    [playing, setPlaying] = useState(false),
    [draft, setDraft] = useState(""),
    [step, setStep] = useState(0),
    [open, setOpen] = useState(false),
    [error, setError] = useState("")
  const epoch = useRef(0),
    alive = useRef(false)
  useEffect(() => {
    alive.current = true
    return () => {
      alive.current = false
      epoch.current++
    }
  }, [])
  const current = epoch.current,
    model = voiceModel(state, id, step)
  function retire() {
    epoch.current++
    setTime(0)
    setSeek((s) => ({ id: s.id + 1, time: 0 }))
    setPlaying(false)
    setDraft("")
    setStep(0)
    setError("")
    setOpen(false)
    onIntent("")
  }
  function select(next: string) {
    retire()
    setId(next)
  }
  function seekTo(next: number) {
    const bounded = Math.max(0, Math.min(model.clip.durationSeconds, next))
    setTime(bounded)
    setSeek((s) => ({ id: s.id + 1, time: bounded }))
  }
  function currentOnly(work: () => void) {
    if (alive.current && epoch.current === current) work()
  }
  return (
    <div className="administration-lab voice-lab">
      <fieldset className="control-group">
        <legend>Voice and media review</legend>
        <label>
          Presentation state{" "}
          <select
            aria-label="Voice state"
            value={state}
            onChange={(e) => {
              retire()
              setState(e.target.value as VoiceState)
            }}
          >
            {voiceStates.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        {["Transcript", "Audio"].map((v) => (
          <Button
            key={v}
            size="sm"
            aria-pressed={view === v}
            onClick={() => {
              retire()
              setView(v)
            }}
          >
            {v}
          </Button>
        ))}
      </fieldset>
      <p className="muted">
        {voiceFixture.version} · seed{voiceFixture.seed} · fixed{voiceFixture.clock} · bundled
        original audio, no capture or provider.
      </p>
      {!model.accessible ? (
        <p role="status" className="notice">
          {state === "loading"
            ? "Loading authored voice evidence"
            : state === "denied"
              ? "Voice evidence denied; transcript and media withheld"
              : "Scripted media error; no retained transcript or loaded sample"}
        </p>
      ) : state === "empty" ? (
        <p role="status">No voice samples or transcript segments.</p>
      ) : (
        <>
          <Panel
            icon={<Headphones className="size-4" />}
            title="Review sample"
            meta={model.clip.id}
          >
            <VoiceSelector
              value={id}
              onValueChange={(next) => {
                if (next) select(next)
              }}
              open={open}
              onOpenChange={setOpen}
            >
              <VoiceSelectorTrigger
                render={<Button variant="outline">Choose review sample: {model.clip.title}</Button>}
              />
              <VoiceSelectorContent title="Choose bundled review sample">
                <VoiceSelectorInput
                  aria-label="Search review samples"
                  placeholder="Search bundled samples…"
                />
                <VoiceSelectorList>
                  <VoiceSelectorEmpty>No matching authored samples</VoiceSelectorEmpty>
                  {voiceFixture.clips.map((c) => (
                    <VoiceSelectorItem
                      key={c.id}
                      value={c.id}
                      keywords={[c.title]}
                      onSelect={() => select(c.id)}
                    >
                      <VoiceSelectorName>{c.title}</VoiceSelectorName>
                      <VoiceSelectorDescription>
                        {c.id} · synthetic tone, not a speech voice
                      </VoiceSelectorDescription>
                    </VoiceSelectorItem>
                  ))}
                </VoiceSelectorList>
              </VoiceSelectorContent>
            </VoiceSelector>
            <p className="muted">
              {model.clip.recordedAt} UTC · {model.clip.chatId}/{model.clip.sessionId}/
              {model.clip.runId}/{model.clip.toolId}/{model.clip.spanId}
            </p>
            <p className="muted">{voiceFixture.source}</p>
            <Button size="sm" onClick={() => onInspect(model.run.taskId)}>
              Inspect related run (full snapshot)
            </Button>
          </Panel>
          <Panel icon={<Headphones className="size-4" />} title="Scripted voice input">
            <div className="voice-input-review">
              <SpeechInput
                disabled
                aria-label="Microphone capture disabled"
                onClick={(e) => e.preventDefault()}
                aria-pressed={state === "recording"}
                aria-busy={state === "transcribing"}
              />
              <p role="status">
                {state === "recording"
                  ? "Recording appearance only — microphone remains disabled"
                  : state === "transcribing"
                    ? "Transcribing appearance only — reveal authored text manually"
                    : state === "permission-unavailable"
                      ? "Permission unavailable fixture — no device permission was requested"
                      : state === "unknown"
                        ? "Unknown fixture voice status — playback and drafts withheld"
                        : "Capture disabled; review uses bundled fixtures"}
              </p>
            </div>
            <p className="muted">
              Device fixture: synthetic input unavailable. Real MicSelector/device enumeration is
              not mounted.
            </p>
            {state === "transcribing" ? (
              <Button
                disabled={step >= model.clip.segments.length}
                onClick={() => setStep((s) => s + 1)}
              >
                Reveal next authored segment
              </Button>
            ) : null}
          </Panel>
          {view === "Audio" && model.canPlay ? (
            <Suspense fallback={<p role="status">Loading local audio presentation…</p>}>
              <Player
                key={`${id}/${state}/${current}`}
                clip={model.clip}
                seek={seek}
                onTime={(n) => currentOnly(() => setTime(n))}
                onPlaying={(value) => currentOnly(() => setPlaying(value))}
                onError={() =>
                  currentOnly(() =>
                    setError("Local sample could not be decoded; no service was contacted."),
                  )
                }
              />
            </Suspense>
          ) : view === "Audio" ? (
            <p role="status">Local playback unavailable in this scripted state.</p>
          ) : null}
          {error ? <p role="alert">{error}</p> : null}
          <Panel
            icon={<Headphones className="size-4" />}
            title="Authored timed review text"
            meta={`${time.toFixed(2)}s / ${model.clip.durationSeconds}s`}
          >
            <p className="muted">
              Synthetic review transcript aligned for UI timing, not recognized speech from the
              tone.{" "}
              {playing ? "Local audio playing" : "Local audio paused / manual review position"}
            </p>
            <Transcription segments={model.segments} currentTime={time} onSeek={seekTo}>
              {(segment, index) => (
                <TranscriptionSegment key={`${id}/${index}`} segment={segment} index={index} />
              )}
            </Transcription>
            {!model.segments.length ? <p>No authored segments revealed.</p> : null}
            <div className="voice-review-actions">
              <Button size="sm" onClick={() => seekTo(0)}>
                Reset review position
              </Button>
              <Button size="sm" onClick={() => seekTo(time + 2)}>
                Advance review position
              </Button>
            </div>
            <label>
              Transient transcript note
              <textarea
                aria-label="Transient transcript note"
                value={draft}
                maxLength={2048}
                disabled={state === "permission-unavailable" || state === "unknown"}
                onChange={(e) => {
                  setDraft(e.target.value)
                  onIntent("")
                }}
              />
            </label>
            <Button
              size="sm"
              disabled={!draft || state === "permission-unavailable" || state === "unknown"}
              onClick={() =>
                onIntent(
                  `Transcript save intent refused for ${model.clip.id}; no text or audio is uploaded/saved.`,
                )
              }
            >
              Inspect transcript save intent
            </Button>
          </Panel>
        </>
      )}
    </div>
  )
}
export default VoiceLab
