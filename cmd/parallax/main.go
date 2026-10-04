// Command parallax starts the fixture-only GUI laboratory.
package main

import (
	"context"
	"encoding/json"
	"github.com/hollis-labs/chimera/host"
	"github.com/hollis-labs/parallax/internal/demoplugin"
	"github.com/hollis-labs/parallax/internal/scenarios"
	"github.com/hollis-labs/parallax/internal/webui"
	"log"
	"net"
	"net/http"
	"os"
	"os/signal"
	"syscall"
)

func main() {
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()
	mux := http.NewServeMux()
	mux.HandleFunc("GET /api/scenario", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(func() scenarios.Scenario {
			if r.URL.Query().Get("profile") == "large" {
				return scenarios.GenerateProfile(80)
			}
			return scenarios.Generate()
		}())
	})
	delivery, err := demoplugin.Delivery()
	if err != nil {
		log.Fatal(err)
	}
	app, err := host.New(host.Config{Name: "Parallax", Assets: webui.Assets(), Routes: mux, Plugins: delivery})
	if err != nil {
		log.Fatal(err)
	}
	addr := os.Getenv("LISTEN_ADDR")
	if addr == "" {
		addr = "127.0.0.1:18441"
	}
	listener, err := net.Listen("tcp", addr)
	if err != nil {
		log.Fatal(err)
	}
	log.Printf("Parallax fixture lab: http://%s", addr)
	if err := app.Serve(ctx, listener); err != nil {
		log.Fatal(err)
	}
}
