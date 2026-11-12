package main

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/hollis-labs/substrate/boot"
	"github.com/hollis-labs/substrate/module"

	"github.com/hollis-labs/parallax/internal/appdirs"
)

// bootOptions are this app's boot hooks. After the config module has applied the SUBSTRATE_CONFIG
// override, the data directory is resolved and secured, and the two files that live in it (the
// database and the identity signing key) are anchored there.
func bootOptions(getenv func(string) string) boot.Options {
	return boot.Options{AfterConfig: func(_ context.Context, app *module.App) error {
		return anchorPaths(app, getenv)
	}}
}

// anchorPaths turns the manifest's relative defaults (database.sqlite.path, identity.key_file)
// into paths inside the data directory. A path the operator's override made absolute is kept.
func anchorPaths(app *module.App, getenv func(string) string) error {
	dirs, err := appdirs.Resolve(getenv)
	if err != nil {
		return err
	}
	if err = dirs.PrepareDir(); err != nil {
		return fmt.Errorf("prepare the data directory %s: %w", dirs.Data, err)
	}
	sqlite, err := configBlock(app, "database", "sqlite")
	if err != nil {
		return err
	}
	dbPath, err := anchor(dirs, sqlite, "path", "database.sqlite.path")
	if err != nil {
		return err
	}
	id, err := configBlock(app, "identity")
	if err != nil {
		return err
	}
	if _, err = anchor(dirs, id, "key_file", "identity.key_file"); err != nil {
		return err
	}
	// Create the database file private before the database module opens it, when its directory
	// exists (an override may name a directory the module is meant to refuse or create itself).
	if fi, statErr := os.Stat(filepath.Dir(dbPath)); statErr == nil && fi.IsDir() {
		return appdirs.EnsurePrivate(dbPath)
	}
	return nil
}

// anchor rewrites block[key], a non-empty string, to its anchored form and returns it.
func anchor(dirs appdirs.Dirs, block map[string]any, key, name string) (string, error) {
	v, ok := block[key].(string)
	if !ok || v == "" {
		return "", fmt.Errorf("config: %s must be a non-empty string", name)
	}
	block[key] = dirs.Anchor(v)
	return block[key].(string), nil
}

// configBlock walks app.Config down the named keys; every level must be a map.
func configBlock(app *module.App, path ...string) (map[string]any, error) {
	cur := app.Config
	for i, k := range path {
		next, ok := cur[k].(map[string]any)
		if !ok {
			return nil, fmt.Errorf("config: %s must be a map", strings.Join(path[:i+1], "."))
		}
		cur = next
	}
	return cur, nil
}
