package settings

import (
	"reflect"
	"strings"
	"testing"
)

func TestParse(t *testing.T) {
	for _, tc := range []struct {
		name string
		raw  any
		want []string
		err  string
	}{
		{"snapshot file", map[string]any{"snapshot_file": "/srv/example/capture.json"}, nil, ""},
		{"snapshot file unset", map[string]any{"snapshot_file": nil}, nil, ""},
		{"snapshot file empty", map[string]any{"snapshot_file": " "}, nil, ""},
		{"snapshot file relative", map[string]any{"snapshot_file": "capture.json"}, nil, "parallax.snapshot_file: \"capture.json\" is not an absolute path"},
		{"snapshot file not a string", map[string]any{"snapshot_file": 3}, nil, "parallax.snapshot_file must be a string"},
		{"missing", nil, nil, ""},
		{"empty", map[string]any{}, nil, ""},
		{"hosts", map[string]any{"allowed_hosts": []any{" Parallax.Example.Test ", "other.example.test:8443"}}, []string{"parallax.example.test", "other.example.test:8443"}, ""},
		{"typo", map[string]any{"allowed_host": []any{"x.example.test"}}, nil, "unknown config key(s): allowed_host"},
		{"not a map", "x", nil, "must be a map"},
		{"not a list", map[string]any{"allowed_hosts": "x.example.test"}, nil, "list of strings"},
		{"not a string", map[string]any{"allowed_hosts": []any{3}}, nil, "list of strings"},
		{"url", map[string]any{"allowed_hosts": []any{"https://x.example.test"}}, nil, "not a host name"},
		{"empty name", map[string]any{"allowed_hosts": []any{" "}}, nil, "not a host name"},
		{"bad port form", map[string]any{"allowed_hosts": []any{"a:b:c"}}, nil, "not a host name"},
	} {
		t.Run(tc.name, func(t *testing.T) {
			got, err := Parse(tc.raw)
			if tc.err != "" {
				if err == nil || !strings.Contains(err.Error(), tc.err) {
					t.Fatalf("err = %v, want %q", err, tc.err)
				}
				return
			}
			if err != nil || !reflect.DeepEqual(got.AllowedHosts, tc.want) {
				t.Fatalf("got %v, %v want %v", got.AllowedHosts, err, tc.want)
			}
		})
	}
}

func TestSnapshotFileIsKeptAndDefaultsToEmpty(t *testing.T) {
	got, err := Parse(map[string]any{"snapshot_file": " /srv/example/capture.json "})
	if err != nil || got.SnapshotFile != "/srv/example/capture.json" {
		t.Fatalf("got %q, %v", got.SnapshotFile, err)
	}
	if got, err = Parse(nil); err != nil || got.SnapshotFile != "" {
		t.Fatalf("default = %q, %v", got.SnapshotFile, err)
	}
}
