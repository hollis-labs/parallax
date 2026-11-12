package main

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"net"

	"github.com/spf13/cobra"

	"github.com/hollis-labs/substrate/module"
	"github.com/hollis-labs/substrate/modules/auth"
	"github.com/hollis-labs/substrate/modules/httphost"
	"github.com/hollis-labs/substrate/modules/identity"

	"github.com/hollis-labs/parallax/internal/api"
	"github.com/hollis-labs/parallax/internal/demoplugin"
	"github.com/hollis-labs/parallax/internal/hostguard"
	"github.com/hollis-labs/parallax/internal/settings"
	"github.com/hollis-labs/parallax/internal/webui"
)

// parallax is what the commands share: the started framework app. ready, when set, learns the
// bound address (tests listen on port 0).
type parallax struct {
	app   *module.App
	ready func(net.Addr)
}

func (p *parallax) serveCmd(ctx context.Context) *cobra.Command {
	return &cobra.Command{
		Use:   "serve",
		Short: "Serve the fixture lab, its API and the plugin delivery",
		Args:  cobra.NoArgs,
		RunE:  func(*cobra.Command, []string) error { return p.serve(ctx) },
	}
}

func (p *parallax) serve(ctx context.Context) error {
	app := p.app
	cfg, err := settings.Parse(app.Config[settings.Key])
	if err != nil {
		return err
	}
	if err = requireLoopback(app); err != nil {
		return err
	}
	id := identity.From(app)
	table := auth.ScopeTable(app)
	if id == nil || table == nil {
		return errors.New("the identity and auth modules must be started")
	}
	api.RegisterScopes(table)

	delivery, err := demoplugin.Delivery()
	if err != nil {
		return err
	}
	assets, err := webui.Assets()
	if err != nil {
		return err
	}
	// The delivery serves the registry and the reviewed bundle bytes; it holds no caller data
	// and the auth guard covers the mount (parallax.read), so it is not an open mount.
	handler, err := httphost.Handler(app, httphost.Options{
		Assets: assets,
		Routes: api.Handler(),
		Mounts: []httphost.Mount{{Pattern: api.PluginsPattern, Handler: delivery}},
	})
	if err != nil {
		return err
	}
	// Outermost first: the Host check, then the session cookie becomes the bearer the guard
	// verifies, then the host (guard, routes, SPA).
	handler = hostguard.Handler(cfg.AllowedHosts, id.Middleware(handler))

	return httphost.Serve(ctx, app, handler, httphost.ServeOptions{
		Ready: func(addr net.Addr) {
			slog.Info("parallax listening", "addr", addr.String())
			if p.ready != nil {
				p.ready(addr)
			}
		},
	})
}

// requireLoopback keeps the backend on the loopback interface: the Host check assumes it.
func requireLoopback(app *module.App) error {
	cfg, _ := app.Config["httphost"].(map[string]any)
	addr, _ := cfg["addr"].(string)
	if addr == "" {
		addr = "127.0.0.1:8080"
	}
	host, _, err := net.SplitHostPort(addr)
	if err == nil {
		if host == "localhost" {
			return nil
		}
		if ip := net.ParseIP(host); ip != nil && ip.IsLoopback() {
			return nil
		}
	}
	return fmt.Errorf("parallax requires a loopback httphost.addr (for example 127.0.0.1:8085), got %q", addr)
}
