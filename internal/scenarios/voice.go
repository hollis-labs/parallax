package scenarios

import (
	"bytes"
	"crypto/sha256"
	"encoding/binary"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

type VoiceSegment struct {
	Text        string  `json:"text"`
	StartSecond float64 `json:"startSecond"`
	EndSecond   float64 `json:"endSecond"`
}
type VoiceClip struct {
	ID              string         `json:"id"`
	Title           string         `json:"title"`
	ChatID          string         `json:"chatId"`
	RunID           string         `json:"runId"`
	SessionID       string         `json:"sessionId"`
	ToolID          string         `json:"toolId"`
	SpanID          string         `json:"spanId"`
	RecordedAt      string         `json:"recordedAt"`
	Asset           string         `json:"asset"`
	SHA256          string         `json:"sha256"`
	DurationSeconds int            `json:"durationSeconds"`
	SampleRate      int            `json:"sampleRate"`
	PeriodFrames    int            `json:"periodFrames"`
	MediaKind       string         `json:"mediaKind"`
	License         string         `json:"license"`
	Segments        []VoiceSegment `json:"segments"`
}
type Voice struct {
	Version               string      `json:"version"`
	Generator             string      `json:"generator"`
	OperationsVersion     string      `json:"operationsVersion"`
	CommunicationsVersion string      `json:"communicationsVersion"`
	Seed                  uint64      `json:"seed"`
	Clock                 string      `json:"clock"`
	Source                string      `json:"source"`
	Clips                 []VoiceClip `json:"clips"`
}

// GenerateTone is original integer-only mono PCM: quiet triangle pulses, no speech.
// Samples use a 256-frame fade-in/out per second and a 1/8-second silent gap.
func GenerateTone(seconds, period int) []byte {
	const rate = 8000
	samples := seconds * rate
	data := make([]byte, samples*2)
	for i := 0; i < samples; i++ {
		p := i % period
		v := 0
		if p < period/2 {
			v = -2048 + p*8192/period
		} else {
			v = 6144 - p*8192/period
		}
		within := i % rate
		gain := 256
		if within < 256 {
			gain = within
		}
		if within > rate-1256 {
			gain = rate - 1000 - within
			if gain < 0 {
				gain = 0
			}
		}
		v = v * gain / 256
		binary.LittleEndian.PutUint16(data[i*2:], uint16(int16(v)))
	}
	b := new(bytes.Buffer)
	b.WriteString("RIFF")
	binary.Write(b, binary.LittleEndian, uint32(36+len(data)))
	b.WriteString("WAVEfmt ")
	binary.Write(b, binary.LittleEndian, uint32(16))
	binary.Write(b, binary.LittleEndian, uint16(1))
	binary.Write(b, binary.LittleEndian, uint16(1))
	binary.Write(b, binary.LittleEndian, uint32(rate))
	binary.Write(b, binary.LittleEndian, uint32(rate*2))
	binary.Write(b, binary.LittleEndian, uint16(2))
	binary.Write(b, binary.LittleEndian, uint16(16))
	b.WriteString("data")
	binary.Write(b, binary.LittleEndian, uint32(len(data)))
	b.Write(data)
	return b.Bytes()
}
func GenerateVoice() Voice {
	ops := Generate()
	comms := GenerateCommunications()
	s := Voice{Version: "voice/v1", Generator: "parallax/v7", OperationsVersion: ops.Version, CommunicationsVersion: comms.Version, Seed: ops.Seed, Clock: ops.Clock, Source: "Original Parallax generated mono PCM triangle tones (MIT); authored timed review text is not speech transcription."}
	for i := 1; i <= 2; i++ {
		run := ops.Runs[i]
		tool := ops.ToolCalls[i]
		duration := 6 + i*2
		period := 80 / i
		id := fmt.Sprintf("AUDIO-%03d", i)
		sum := sha256.Sum256(GenerateTone(duration, period))
		clip := VoiceClip{ID: id, Title: []string{"Completed review tone", "Refused review tone"}[i-1], ChatID: comms.ChatSessions[i].ID, RunID: run.ID, SessionID: run.SessionID, ToolID: tool.ID, SpanID: tool.SpanID, RecordedAt: tool.Finished, Asset: fmt.Sprintf("/media/review-tone-%03d.wav", i), SHA256: hex.EncodeToString(sum[:]), DurationSeconds: duration, SampleRate: 8000, PeriodFrames: period, MediaKind: "synthetic-tone-not-speech", License: "MIT"}
		texts := []string{"Authored review text: inspect the bundled context.", "This timing accompanies a generated tone, not recognized speech.", fmt.Sprintf("Related evidence: %s and %s.", run.ID, tool.ID), "No recording, provider call or saved response occurs."}
		if duration == 10 {
			texts = append(texts, "The recorded refusal remains a fixture outcome.")
		}
		for j, text := range texts {
			clip.Segments = append(clip.Segments, VoiceSegment{text, float64(j * 2), float64((j + 1) * 2)})
		}
		s.Clips = append(s.Clips, clip)
	}
	return s
}
func ValidateVoice(s Voice) error {
	expected := GenerateVoice()
	if s.Version != expected.Version || s.Generator != expected.Generator || s.OperationsVersion != expected.OperationsVersion || s.CommunicationsVersion != expected.CommunicationsVersion || s.Clock != expected.Clock || s.Seed != expected.Seed || s.Source == "" || len(s.Clips) != 2 {
		return fmt.Errorf("voice identity/bounds mismatch")
	}
	ids := map[string]bool{}
	for i, c := range s.Clips {
		e := expected.Clips[i]
		if ids[c.ID] || c.ID != e.ID || c.ChatID != e.ChatID || c.RunID != e.RunID || c.SessionID != e.SessionID || c.ToolID != e.ToolID || c.SpanID != e.SpanID || c.RecordedAt != e.RecordedAt {
			return fmt.Errorf("invalid voice graph/time")
		}
		ids[c.ID] = true
		if c.Asset != e.Asset || strings.Contains(c.Asset, "..") || c.SHA256 != e.SHA256 || c.SampleRate != 8000 || c.PeriodFrames != e.PeriodFrames || c.DurationSeconds != e.DurationSeconds || c.MediaKind != e.MediaKind || c.License != "MIT" || len(c.Title) > 128 || len(c.Segments) != len(e.Segments) {
			return fmt.Errorf("invalid original media metadata")
		}
		last := float64(0)
		for _, seg := range c.Segments {
			if seg.StartSecond != last || seg.EndSecond <= seg.StartSecond || seg.EndSecond > float64(c.DurationSeconds) || strings.TrimSpace(seg.Text) == "" || len(seg.Text) > 512 {
				return fmt.Errorf("invalid bounded transcript timing")
			}
			last = seg.EndSecond
		}
		if last != float64(c.DurationSeconds) {
			return fmt.Errorf("incomplete transcript window")
		}
	}
	return nil
}
func WriteVoice(path, mediaDir string) error {
	s := GenerateVoice()
	if e := ValidateVoice(s); e != nil {
		return e
	}
	b, e := json.MarshalIndent(s, "", "  ")
	if e != nil {
		return e
	}
	if e = os.WriteFile(path, append(b, '\n'), 0644); e != nil {
		return e
	}
	if e = os.MkdirAll(mediaDir, 0755); e != nil {
		return e
	}
	for _, c := range s.Clips {
		if e = os.WriteFile(filepath.Join(mediaDir, filepath.Base(c.Asset)), GenerateTone(c.DurationSeconds, c.PeriodFrames), 0644); e != nil {
			return e
		}
	}
	return nil
}
