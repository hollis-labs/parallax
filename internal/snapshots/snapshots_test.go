package snapshots

import (
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

const valid = `{"version":"parallax-capture/v1","id":"abc123","sources":{"torque":{"tasks":{"items":[]}},"tether":{"overview":{"body":{}},"sessions":{"items":[]}}}}`

func write(t *testing.T, content string) string {
	t.Helper()
	p := filepath.Join(t.TempDir(), "capture.json")
	if err := os.WriteFile(p, []byte(content), 0o600); err != nil {
		t.Fatal(err)
	}
	return p
}

func serve(t *testing.T, s *Store) (int, string, http.Header) {
	t.Helper()
	rec := httptest.NewRecorder()
	s.Serve(rec, httptest.NewRequest(http.MethodGet, "/api/snapshots/current", nil))
	return rec.Code, rec.Body.String(), rec.Header()
}

// With no file the build behaves as before: the embedded current.json when the build has one,
// else empty.json.
func TestDefaultServesTheEmbeddedCapture(t *testing.T) {
	s, err := Load("")
	if err != nil {
		t.Fatal(err)
	}
	want, err := data.ReadFile("data/current.json")
	if err != nil {
		want, _ = data.ReadFile("data/empty.json")
	}
	code, body, h := serve(t, s)
	if code != 200 || body != string(want) {
		t.Fatalf("status %d, body %q, want the embedded capture %q", code, body, want)
	}
	if h.Get("Content-Type") != "application/json" || h.Get("Cache-Control") != "no-store" {
		t.Fatalf("headers %v", h)
	}
}

func TestAConfiguredFileIsServed(t *testing.T) {
	s, err := Load(write(t, valid))
	if err != nil {
		t.Fatal(err)
	}
	if code, body, _ := serve(t, s); code != 200 || body != valid {
		t.Fatalf("status %d, body %q", code, body)
	}
}

func TestTheEmptyCaptureFileIsValid(t *testing.T) {
	if _, err := Load(write(t, `{"version":"parallax-capture/v1","id":null,"sources":null}`)); err != nil {
		t.Fatal(err)
	}
}

func TestBadCapturesAreRefused(t *testing.T) {
	missing := filepath.Join(t.TempDir(), "nope.json")
	for name, tc := range map[string]struct{ file, want string }{
		"missing file":      {missing, "no such file"},
		"relative path":     {"capture.json", "not an absolute path"},
		"not JSON":          {write(t, `{nope`), "not a JSON object"},
		"not an object":     {write(t, `[1]`), "not a JSON object"},
		"wrong version":     {write(t, `{"version":"parallax-capture/v2","id":null,"sources":null}`), `version is "parallax-capture/v2"`},
		"id without source": {write(t, `{"version":"parallax-capture/v1","id":"x","sources":null}`), "sources is null but id is set"},
		"source without id": {write(t, `{"version":"parallax-capture/v1","id":null,"sources":{}}`), "needs a non-empty id"},
		"no task items":     {write(t, `{"version":"parallax-capture/v1","id":"x","sources":{"torque":{"tasks":{}},"tether":{"overview":{"body":{}},"sessions":{"items":[]}}}}`), "torque.tasks.items"},
		"no session items":  {write(t, `{"version":"parallax-capture/v1","id":"x","sources":{"torque":{"tasks":{"items":[]}},"tether":{"overview":{"body":{}}}}}`), "tether.sessions.items"},
		"no overview body":  {write(t, `{"version":"parallax-capture/v1","id":"x","sources":{"torque":{"tasks":{"items":[]}},"tether":{"sessions":{"items":[]}}}}`), "tether.overview.body"},
		"too large":         {write(t, `{"version":"parallax-capture/v1","id":null,"sources":null,"pad":"`+strings.Repeat("x", MaxBytes)+`"}`), "larger than"},
	} {
		t.Run(name, func(t *testing.T) {
			s, err := Load(tc.file)
			if err == nil || s != nil || !strings.Contains(err.Error(), tc.want) {
				t.Fatalf("Load = %v, %v; want an error containing %q", s, err, tc.want)
			}
		})
	}
}

// The embedded files must pass the same check, or a build would refuse to start.
func TestEmbeddedCapturesAreValid(t *testing.T) {
	entries, err := data.ReadDir("data")
	if err != nil || len(entries) == 0 {
		t.Fatalf("no embedded captures: %v", err)
	}
	for _, e := range entries {
		b, _ := data.ReadFile("data/" + e.Name())
		if err := Validate(b); err != nil {
			t.Errorf("%s: %v", e.Name(), err)
		}
	}
}
