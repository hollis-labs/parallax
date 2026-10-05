package scenarios

import (
	"encoding/json"
	"os"
	"reflect"
	"strings"
	"testing"
)

func TestDeveloperFreshnessAndBounds(t *testing.T) {
	s := GenerateDeveloper()
	if e := ValidateDeveloper(s); e != nil {
		t.Fatal(e)
	}
	if !reflect.DeepEqual(s, GenerateDeveloper()) {
		t.Fatal("not deterministic")
	}
	b, e := os.ReadFile("../../frontend/src/fixtures/developer.json")
	if e != nil {
		t.Fatal(e)
	}
	var bundled Developer
	if e = json.Unmarshal(b, &bundled); e != nil {
		t.Fatal(e)
	}
	if !reflect.DeepEqual(s, bundled) {
		t.Fatal("bundled developer fixture stale")
	}
	cases := map[string]func(*Developer){"dangling edge": func(s *Developer) { s.Edges[0].Target = "UNKNOWN" }, "wrong tool": func(s *Developer) { s.Files[0].ToolID = "TOOL-002" }, "wrong span": func(s *Developer) { s.Nodes[0].SpanID = "SPAN-unknown" }, "future": func(s *Developer) { s.RecordedAt = "2027-01-01T00:00:00Z" }, "path traversal": func(s *Developer) { s.Files[0].Path = "../secret" }, "oversize": func(s *Developer) { s.Terminal = strings.Repeat("x", 8193) }, "duplicate node": func(s *Developer) { s.Nodes[1].ID = s.Nodes[0].ID }}
	for name, mutate := range cases {
		t.Run(name, func(t *testing.T) {
			copy := GenerateDeveloper()
			mutate(&copy)
			if ValidateDeveloper(copy) == nil {
				t.Fatal("invalid fixture accepted")
			}
		})
	}
}
