import type { TranscriptionSegmentData, VoiceSelectorProps } from "@hollis-labs/kit-voice"
import type { AudioPlayerElementProps } from "@hollis-labs/kit-voice/audio-player"

function contracts(
  segment: TranscriptionSegmentData,
  selector: VoiceSelectorProps,
  player: AudioPlayerElementProps,
) {
  // @ts-expect-error exact second offsets remain numbers
  segment.startSecond = "zero"
  // @ts-expect-error controlled selector values are strings
  selector.value = 42
  // @ts-expect-error media source cannot mix URL and Blob
  const mixed: AudioPlayerElementProps = { src: "/media/sample.wav", blob: new Blob() }
  return [segment, selector, player, mixed]
}
void contracts
