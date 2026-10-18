// Package snapshots serves the immutable review capture shipped with this build.
package snapshots

import (
	"embed"
	"net/http"
)

//go:embed data/*.json
var data embed.FS

func Serve(w http.ResponseWriter, r *http.Request) {
	body, err := data.ReadFile("data/current.json")
	if err != nil {
		body, _ = data.ReadFile("data/empty.json")
	}
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Cache-Control", "no-store")
	_, _ = w.Write(body)
}
