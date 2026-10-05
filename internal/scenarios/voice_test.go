package scenarios

import (
	"crypto/sha256"
	"encoding/binary"
	"encoding/hex"
	"encoding/json"
	"os"
	"path/filepath"
	"reflect"
	"strings"
	"testing"
)

func TestVoiceFixturesAndMedia(t *testing.T) {
	s := GenerateVoice()
	if e := ValidateVoice(s); e != nil {
		t.Fatal(e)
	}
	if !reflect.DeepEqual(s, GenerateVoice()) {
		t.Fatal("voice generation nondeterministic")
	}
	b, e := os.ReadFile("../../frontend/src/fixtures/voice.json")
	if e != nil {
		t.Fatal(e)
	}
	var bundled Voice
	if json.Unmarshal(b, &bundled) != nil || !reflect.DeepEqual(s, bundled) {
		t.Fatal("voice artifact stale")
	}
	for _, c := range s.Clips {
		b, e := os.ReadFile(filepath.Join("../../frontend/public/media", filepath.Base(c.Asset)))
		if e != nil {
			t.Fatal(e)
		}
		sum := sha256.Sum256(b)
		if hex.EncodeToString(sum[:]) != c.SHA256 || len(b) != 44+c.DurationSeconds*8000*2 || string(b[:4]) != "RIFF" || string(b[8:12]) != "WAVE" || binary.LittleEndian.Uint16(b[22:24]) != 1 || binary.LittleEndian.Uint32(b[24:28]) != 8000 || binary.LittleEndian.Uint16(b[34:36]) != 16 {
			t.Fatal("media bytes/header differ")
		}
	}
	for name, mutate := range map[string]func(*Voice){"wrong chat": func(s *Voice) { s.Clips[0].ChatID = "CHAT-003" }, "wrong span": func(s *Voice) { s.Clips[0].SpanID = "SPAN-TOOL-003" }, "future": func(s *Voice) { s.Clips[0].RecordedAt = "2027-01-01T00:00:00Z" }, "media hash": func(s *Voice) { s.Clips[0].SHA256 = "invalid" }, "remote asset": func(s *Voice) { s.Clips[0].Asset = "https://example.invalid/audio.wav" }, "overlap": func(s *Voice) { s.Clips[0].Segments[1].StartSecond = 1 }, "out of bounds": func(s *Voice) { s.Clips[0].Segments[0].EndSecond = 99 }, "oversize text": func(s *Voice) { s.Clips[0].Segments[0].Text = strings.Repeat("x", 513) }, "missing provenance": func(s *Voice) { s.Clips[0].License = "" }} {
		t.Run(name, func(t *testing.T) {
			copy := GenerateVoice()
			mutate(&copy)
			if ValidateVoice(copy) == nil {
				t.Fatal("invalid voice accepted")
			}
		})
	}
}

func TestToneFadeOutAndSilence(t *testing.T) {
	b := GenerateTone(1, 80)
	sample := func(frame int) int16 { return int16(binary.LittleEndian.Uint16(b[44+frame*2:])) }
	// Frame6745 is immediately inside the 256-frame fade-out. It must not
	// jump to zero as the earlier incorrect subtraction did.
	if sample(6745) == 0 {
		t.Fatal("fade-out jumps to silence")
	}
	if sample(6872) != int16((6144-(6872%80)*8192/80)*128/256) {
		t.Fatal("fade-out midpoint gain must be128/256")
	}
	for frame := 7000; frame < 8000; frame++ {
		if sample(frame) != 0 {
			t.Fatal("final1000-frame gap must be silent")
		}
	}
}
