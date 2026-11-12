package main

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"slices"
	"strings"

	"github.com/hollis-labs/substrate/boot"
	"github.com/hollis-labs/substrate/module"

	"github.com/hollis-labs/parallax/internal/appdirs"
)

// bootOptions are this app's boot hooks. After the config module has applied the SUBSTRATE_CONFIG
// override, the data directory is resolved and the two files that live in it (the database and
// the identity signing key) are anchored there. With prepare it also creates the directory and
// secures the database file; the read-only commands pass false and create nothing (see plan).
func bootOptions(getenv func(string) string, prepare bool) boot.Options {
	return boot.Options{AfterConfig: func(_ context.Context, app *module.App) error {
		return anchorPaths(app, getenv, prepare)
	}}
}

// plan decides, from the command line, which framework modules to start and whether the data
// directory may be created. Only serving (the default) writes anything. Every other command,
// including version, config, health and help, reads configuration and starts no module that opens
// a file, so running one without PARALLAX_DATA_DIR cannot touch the live data directory of the
// app name.
//
// Every argument that does not start with "-" counts as a command word. That is right only while
// the root command has no global flag that takes a value: `--level debug serve` would read "debug"
// as the command. TestRootHasNoValueFlags fails when such a flag is added, and then plan must
// learn it.
func plan(args []string) (modules []string, prepare bool) {
	var words []string
	for _, a := range args {
		if a == "-h" || a == "--help" || a == "--version" {
			return pick(readOnly), false
		}
		if !strings.HasPrefix(a, "-") {
			words = append(words, a)
		}
	}
	if len(words) == 0 || words[0] == "serve" {
		return substrateModules, true
	}
	return pick(readOnly), false
}

// readOnly are the modules that open no file and bind no port when started.
var readOnly = []string{"config", "logging", "health", "cli"}

// pick keeps the start order of substrateModules.
func pick(want []string) []string {
	var out []string
	for _, m := range substrateModules {
		if slices.Contains(want, m) {
			out = append(out, m)
		}
	}
	return out
}

// anchorPaths turns the manifest's relative defaults (database.sqlite.path, identity.key_file)
// into paths inside the data directory. A path the operator's override made absolute is kept.
// Only with prepare does it create anything.
func anchorPaths(app *module.App, getenv func(string) string, prepare bool) error {
	dirs, err := appdirs.Resolve(getenv)
	if err != nil {
		return err
	}
	if prepare {
		if err = dirs.PrepareDir(); err != nil {
			return fmt.Errorf("prepare the data directory %s: %w", dirs.Data, err)
		}
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
	if !prepare {
		return nil
	}
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
