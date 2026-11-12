package main

import (
	"encoding/json"
	"fmt"

	"github.com/hollis-labs/parallax/internal/appdirs"
)

// prepare resolves and secures the data directory, then returns the manifest config (the
// generated substrateConfigJSON) with the files that live in it as absolute paths. The manifest
// holds working-directory defaults; the data directory is only known at run time.
func prepare(getenv func(string) string) (string, error) {
	dirs, err := appdirs.Resolve(getenv)
	if err != nil {
		return "", err
	}
	if err = dirs.Prepare(); err != nil {
		return "", fmt.Errorf("prepare the data directory %s: %w", dirs.Data, err)
	}
	cfg := map[string]any{}
	if err = json.Unmarshal([]byte(substrateConfigJSON), &cfg); err != nil {
		return "", err
	}
	db, _ := cfg["database"].(map[string]any)
	sqlite, _ := db["sqlite"].(map[string]any)
	if sqlite == nil {
		return "", fmt.Errorf("the manifest has no database.sqlite block")
	}
	sqlite["path"] = dirs.Database()
	id, _ := cfg["identity"].(map[string]any)
	if id == nil {
		return "", fmt.Errorf("the manifest has no identity block")
	}
	id["key_file"] = dirs.SigningKey()
	out, err := json.Marshal(cfg)
	return string(out), err
}
