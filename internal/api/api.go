// Package api serves the fixture lab's read-only API. Every route is declared once, with its
// scope, and the mux and the scope table are both built from that list.
package api

import (
	"encoding/json"
	"net/http"

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

// Route is one declared route.
type Route struct {
	Method, Pattern, Scope string
	Handler                http.HandlerFunc
}

// Routes lists every route under /api/.
func Routes() []Route {
	return []Route{
		{http.MethodGet, "/api/snapshots/current", ScopeRead, snapshots.Serve},
		{http.MethodGet, "/api/scenario", ScopeRead, scenario},
	}
}

// Handler builds the mux httphost mounts under /api/.
func Handler() *http.ServeMux {
	mux := http.NewServeMux()
	for _, rt := range Routes() {
		mux.HandleFunc(rt.Method+" "+rt.Pattern, rt.Handler)
	}
	return mux
}

// RegisterScopes declares the scope of every route and of the plugin delivery mount. A route
// not listed is unmapped, which the guard refuses in enforce mode.
func RegisterScopes(t *libauth.ScopeTable) {
	for _, rt := range Routes() {
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
