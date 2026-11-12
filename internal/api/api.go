// Package api serves the fixture lab's read-only API. Every route is declared once, with its
// scope, and the mux and the scope table are both built from that list.
package api

import (
	"encoding/json"
	"net/http"
	"slices"

	libauth "github.com/hollis-labs/libs/security/auth"

	"github.com/hollis-labs/parallax/internal/scenarios"
	"github.com/hollis-labs/parallax/internal/snapshots"
)

// ScopeRead is held by every signed-in person who may open the lab. The first account created
// by setup holds "*" and so passes it.
const ScopeRead = "parallax.read"

// PluginsPattern is where the plugin delivery (registry, bundles) is mounted, outside /api/.
// PluginsScopePattern is the same subtree in the scope table, whose matcher needs a trailing "*".
const (
	PluginsPattern      = "/plugins/"
	PluginsScopePattern = "/plugins/*"
)

// Route is one declared route: what the scope table needs, with no handler bound.
type Route struct{ Method, Pattern, Scope string }

// routes lists every route under /api/. It is the one declaration: the scope table is built from
// it alone, and Handler binds a handler to each entry.
var routes = []Route{
	{http.MethodGet, "/api/snapshots/current", ScopeRead},
	{http.MethodGet, "/api/scenario", ScopeRead},
}

// Routes returns the declared routes.
func Routes() []Route { return slices.Clone(routes) }

func key(method, pattern string) string { return method + " " + pattern }

// handlers binds the handler of every declared route. captures is the capture the snapshot route
// serves.
func handlers(captures *snapshots.Store) map[string]http.HandlerFunc {
	return map[string]http.HandlerFunc{
		key(http.MethodGet, "/api/snapshots/current"): captures.Serve,
		key(http.MethodGet, "/api/scenario"):          scenario,
	}
}

// Handler builds the mux httphost mounts under /api/. It panics when a declared route has no
// handler or a handler has no declaration (a programming error that the tests catch).
func Handler(captures *snapshots.Store) *http.ServeMux {
	bound := handlers(captures)
	if len(bound) != len(routes) {
		panic("api: handlers and declared routes differ in number")
	}
	mux := http.NewServeMux()
	for _, rt := range routes {
		h, ok := bound[key(rt.Method, rt.Pattern)]
		if !ok {
			panic("api: no handler for " + key(rt.Method, rt.Pattern))
		}
		mux.HandleFunc(key(rt.Method, rt.Pattern), h)
	}
	return mux
}

// RegisterScopes declares the scope of every route and of the plugin delivery mount. A route
// not listed is unmapped, which the guard refuses in enforce mode. It needs no store.
func RegisterScopes(t *libauth.ScopeTable) {
	for _, rt := range routes {
		t.Route(rt.Method, rt.Pattern, rt.Scope)
	}
	t.Route(http.MethodGet, PluginsScopePattern, ScopeRead)
}

func scenario(w http.ResponseWriter, r *http.Request) {
	s := scenarios.Generate()
	if r.URL.Query().Get("profile") == "large" {
		s = scenarios.GenerateProfile(80)
	}
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(s)
}
