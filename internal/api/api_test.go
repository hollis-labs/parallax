package api

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	libauth "github.com/hollis-labs/libs/security/auth"

	"github.com/hollis-labs/parallax/internal/snapshots"
)

// Every route the API serves has ScopeRead in the table the guard enforces, and the mux and the
// table are built from one list, so this fails if either side stops using it.
func TestEveryRouteHasItsScope(t *testing.T) {
	routes := Routes()
	if len(routes) == 0 {
		t.Fatal("no routes")
	}
	table := libauth.NewScopeTable()
	RegisterScopes(table)
	for _, rt := range routes {
		if !strings.HasPrefix(rt.Pattern, "/api/") {
			t.Errorf("%s %s is outside /api/, where the guard does not look", rt.Method, rt.Pattern)
		}
		if got, known := table.ForRoute(rt.Method, rt.Pattern); !known || got != ScopeRead {
			t.Errorf("%s %s: scope=%q known=%v, want %q", rt.Method, rt.Pattern, got, known, ScopeRead)
		}
	}
	for _, p := range []string{"/plugins/ops/g1/bundle.js", "/plugins/registry"} {
		if got, known := table.ForRoute("GET", p); !known || got != ScopeRead {
			t.Errorf("GET %s: scope=%q known=%v, want %q", p, got, known, ScopeRead)
		}
	}
	// A route nobody declared is unmapped, which the guard refuses in enforce mode.
	for _, u := range [][2]string{{"POST", "/api/scenario"}, {"GET", "/api/other"}, {"DELETE", "/plugins/ops"}} {
		if _, known := table.ForRoute(u[0], u[1]); known {
			t.Errorf("%s %s is mapped but not declared", u[0], u[1])
		}
	}
}

// The scope table and the mux are built from the same declaration, and neither needs the other:
// every declared route is served by the mux and every route the mux serves is declared.
func TestServedRoutesAreTheDeclaredRoutes(t *testing.T) {
	store, err := snapshots.Load("")
	if err != nil {
		t.Fatal(err)
	}
	mux := Handler(store)
	declared := map[string]bool{}
	for _, rt := range Routes() {
		declared[key(rt.Method, rt.Pattern)] = true
		_, pattern := mux.Handler(httptest.NewRequest(rt.Method, rt.Pattern, nil))
		if pattern != key(rt.Method, rt.Pattern) {
			t.Errorf("%s %s is declared but the mux serves %q", rt.Method, rt.Pattern, pattern)
		}
	}
	for k := range handlers(store) {
		if !declared[k] {
			t.Errorf("%s has a handler but no declaration, so the guard would refuse it", k)
		}
	}
	// Building the scope table must not need a store: nothing in it touches one.
	RegisterScopes(libauth.NewScopeTable())
}

func TestScenarioProfiles(t *testing.T) {
	store, err := snapshots.Load("")
	if err != nil {
		t.Fatal(err)
	}
	srv := Handler(store)
	for profile, want := range map[string]string{"": "RUN-008", "large": "RUN-080"} {
		rec := httptest.NewRecorder()
		srv.ServeHTTP(rec, httptest.NewRequest(http.MethodGet, "/api/scenario?profile="+profile, nil))
		if rec.Code != http.StatusOK || !strings.Contains(rec.Body.String(), want) {
			t.Errorf("profile %q: status %d, body lacks %s", profile, rec.Code, want)
		}
	}
}
