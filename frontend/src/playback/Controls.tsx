import { Button } from "@hollis-labs/design-components"
import { resourceOverrides } from "./model"
import type { usePlayback } from "./usePlayback"
export function PlaybackControls({ review }: { review: ReturnType<typeof usePlayback> }) {
  return (
    <fieldset className="playback-controls" aria-label="Fixed fixture playback">
      <legend>Recorded fixture review · local playback, no live stream</legend>
      <div className="playback-actions">
        <Button size="sm" onClick={review.toggle}>
          {review.playing ? "Pause playback" : "Play recorded events"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={review.step}
          disabled={review.index === review.frames.length - 1}
        >
          Step recorded event
        </Button>
        <Button size="sm" variant="outline" onClick={review.reset}>
          Reset playback
        </Button>
        <Button size="sm" variant="outline" onClick={review.snapshot}>
          Show fixture snapshot
        </Button>
        <label>
          Resource override
          <select
            aria-label="Resource override"
            value={review.override}
            onChange={(e) => review.changeOverride(e.target.value as typeof review.override)}
          >
            {resourceOverrides.map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </label>
      </div>
      <label className="playback-seek">
        Review position
        <input
          aria-label="Playback position"
          type="range"
          min="0"
          max={review.frames.length - 1}
          value={review.index}
          onChange={(e) => review.seek(Number(e.target.value))}
        />
        <span>
          {review.index + 1}/{review.frames.length}
        </span>
      </label>
      {review.override === "degraded" && (
        <p className="notice">
          Scripted degraded resource override · authored evidence retained; no service was checked.
        </p>
      )}
      <p className="muted">
        <time data-testid="playback-cutoff" dateTime={review.cutoff}>
          {review.cutoff}
        </time>{" "}
        · {review.playing ? "Playing scripted boundaries" : "Paused deterministic frame"} · seed{" "}
        {review.source.seed} · reference {review.source.clock}
      </p>
    </fieldset>
  )
}
