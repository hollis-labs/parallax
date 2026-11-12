// Package snapshots serves the immutable review capture. By default that is the capture embedded in
// the build (data/current.json when the build has one, else data/empty.json); the operator can
// point parallax.snapshot_file at another capture file, read once at start.
package snapshots

import (
	"embed"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
)

//go:embed data/*.json
var data embed.FS

// Version is the only capture format the frontend reads.
const Version = "parallax-capture/v1"

// MaxBytes bounds a capture file; the largest real capture is well under a megabyte.
const MaxBytes = 16 << 20

// Store holds the capture that Serve answers with.
type Store struct{ body []byte }

// Load returns the store for file, or for the embedded capture when file is empty. The capture is
// validated either way, so a bad one stops the start instead of failing in the browser.
func Load(file string) (*Store, error) {
	if file == "" {
		body, err := data.ReadFile("data/current.json")
		if err != nil {
			body, err = data.ReadFile("data/empty.json")
		}
		if err != nil {
			return nil, fmt.Errorf("embedded capture: %w", err)
		}
		if err = Validate(body); err != nil {
			return nil, fmt.Errorf("embedded capture: %w", err)
		}
		return &Store{body: body}, nil
	}
	if !filepath.IsAbs(file) {
		return nil, fmt.Errorf("%q is not an absolute path", file)
	}
	f, err := os.Open(file) //nolint:gosec // the operator names this file in the config
	if err != nil {
		return nil, err
	}
	defer func() { _ = f.Close() }()
	body, err := io.ReadAll(io.LimitReader(f, MaxBytes+1))
	if err != nil {
		return nil, err
	}
	if len(body) > MaxBytes {
		return nil, fmt.Errorf("%s is larger than %d bytes", filepath.Base(file), MaxBytes)
	}
	if err = Validate(body); err != nil {
		return nil, fmt.Errorf("%s: %w", filepath.Base(file), err)
	}
	return &Store{body: body}, nil
}

// Validate checks the shape the frontend dereferences: a capture object of the supported version
// that is either the empty form (id and sources null) or has an id and the torque task items,
// tether overview body and tether session items. Optional parts (console, planner) are not checked.
func Validate(body []byte) error {
	var c struct {
		Version string          `json:"version"`
		ID      *string         `json:"id"`
		Sources json.RawMessage `json:"sources"`
	}
	if err := json.Unmarshal(body, &c); err != nil {
		return fmt.Errorf("not a JSON object: %w", err)
	}
	if c.Version != Version {
		return fmt.Errorf("version is %q, want %q", c.Version, Version)
	}
	if string(c.Sources) == "null" || len(c.Sources) == 0 {
		if c.ID != nil {
			return errors.New("sources is null but id is set")
		}
		return nil
	}
	if c.ID == nil || *c.ID == "" {
		return errors.New("a capture with sources needs a non-empty id")
	}
	var s struct {
		Torque struct {
			Tasks struct {
				Items []json.RawMessage `json:"items"`
			} `json:"tasks"`
		} `json:"torque"`
		Tether struct {
			Overview struct {
				Body map[string]json.RawMessage `json:"body"`
			} `json:"overview"`
			Sessions struct {
				Items []json.RawMessage `json:"items"`
			} `json:"sessions"`
		} `json:"tether"`
	}
	if err := json.Unmarshal(c.Sources, &s); err != nil {
		return fmt.Errorf("sources: %w", err)
	}
	switch {
	case s.Torque.Tasks.Items == nil:
		return errors.New("sources.torque.tasks.items must be an array")
	case s.Tether.Sessions.Items == nil:
		return errors.New("sources.tether.sessions.items must be an array")
	case s.Tether.Overview.Body == nil:
		return errors.New("sources.tether.overview.body must be an object")
	}
	return nil
}

// Serve answers GET /api/snapshots/current.
func (s *Store) Serve(w http.ResponseWriter, _ *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Cache-Control", "no-store")
	_, _ = w.Write(s.body)
}
