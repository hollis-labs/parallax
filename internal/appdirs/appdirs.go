// Package appdirs decides where Parallax keeps its files. The only durable data is the identity
// module's database and signing key, under XDG_DATA_HOME (through the shared apppaths layer) or
// under PARALLAX_DATA_DIR when the operator sets it. The manifest names the files; relative names
// are anchored in the data directory.
package appdirs

import (
	"fmt"
	"os"
	"path/filepath"

	paths "github.com/hollis-labs/libs/core/util/apppaths"
)

const (
	appName = "parallax"
	// DataDirEnv overrides the whole data directory.
	DataDirEnv = "PARALLAX_DATA_DIR"
)

// Dirs are the resolved directories.
type Dirs struct{ Data string }

// Resolve returns the data directory. getenv is os.Getenv outside tests. Nothing is created.
func Resolve(getenv func(string) string) (Dirs, error) {
	if v := getenv(DataDirEnv); v != "" {
		abs, err := filepath.Abs(v)
		if err != nil {
			return Dirs{}, fmt.Errorf("resolve %s: %w", DataDirEnv, err)
		}
		return Dirs{Data: abs}, nil
	}
	layout, err := paths.Resolve(appName, paths.WithoutMaterialize())
	if err != nil {
		return Dirs{}, fmt.Errorf("resolve application directories: %w", err)
	}
	return Dirs{Data: layout.DataDir()}, nil
}

// PrepareDir creates the data directory (0700) when missing and tightens it when it exists.
func (d Dirs) PrepareDir() error {
	if err := os.MkdirAll(d.Data, 0o700); err != nil {
		return err
	}
	return os.Chmod(d.Data, 0o700) //nolint:gosec // 0700 on a directory is the point: owner-only
}

// EnsurePrivate creates the file at path (0600) when missing and tightens it when it exists, so
// the database is never readable by other users. The signing key creates itself private.
func EnsurePrivate(path string) error {
	f, err := os.OpenFile(path, os.O_CREATE|os.O_RDWR, 0o600) //nolint:gosec // path is the configured database file
	if err != nil {
		return err
	}
	if err := f.Chmod(0o600); err != nil {
		_ = f.Close()
		return err
	}
	return f.Close()
}

// Anchor returns path unchanged when it is absolute, and otherwise joins it to the data directory.
func (d Dirs) Anchor(path string) string {
	if filepath.IsAbs(path) {
		return path
	}
	return filepath.Join(d.Data, path)
}
