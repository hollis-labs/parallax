import {
  AudioPlayer,
  AudioPlayerControlBar,
  AudioPlayerDurationDisplay,
  AudioPlayerElement,
  AudioPlayerMuteButton,
  AudioPlayerPlayButton,
  AudioPlayerSeekBackwardButton,
  AudioPlayerSeekForwardButton,
  AudioPlayerTimeDisplay,
  AudioPlayerTimeRange,
  AudioPlayerVolumeRange,
} from "@hollis-labs/kit-voice/audio-player"
import { useEffect, useRef } from "react"
import type { Clip } from "./model"
export default function Player({
  clip,
  seek,
  onTime,
  onPlaying,
  onError,
}: {
  clip: Clip
  seek: { id: number; time: number }
  onTime: (n: number) => void
  onPlaying: (playing: boolean) => void
  onError: () => void
}) {
  const audio = useRef<HTMLAudioElement>(null)
  useEffect(() => {
    const element = audio.current
    return () => {
      element?.pause()
      element?.removeAttribute("src")
      element?.load()
    }
  }, [])
  useEffect(() => {
    if (audio.current && audio.current.readyState > 0) audio.current.currentTime = seek.time
  }, [seek])
  return (
    <section aria-label="Local sample player">
      <p className="muted">
        Original generated tone · {clip.durationSeconds}s · mono16-bitPCM/{clip.sampleRate}Hz. No
        speech, autoplay or transport.
      </p>
      <AudioPlayer>
        <AudioPlayerElement
          ref={audio}
          src={clip.asset}
          preload="metadata"
          onLoadedMetadata={(e) => {
            e.currentTarget.currentTime = seek.time
          }}
          onTimeUpdate={(e) => onTime(e.currentTarget.currentTime)}
          onPlay={() => onPlaying(true)}
          onPause={() => onPlaying(false)}
          onEnded={() => onPlaying(false)}
          onError={onError}
        />
        <AudioPlayerControlBar className="voice-player-controls">
          <AudioPlayerPlayButton />
          <AudioPlayerSeekBackwardButton seekOffset={2} />
          <AudioPlayerSeekForwardButton seekOffset={2} />
          <AudioPlayerTimeDisplay />
          <AudioPlayerTimeRange />
          <AudioPlayerDurationDisplay />
          <AudioPlayerMuteButton />
          <AudioPlayerVolumeRange />
        </AudioPlayerControlBar>
      </AudioPlayer>
    </section>
  )
}
