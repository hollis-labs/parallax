// Package settings reads the app's own "parallax" block from the manifest config. The shell
// modules read theirs; this block holds what only Parallax has: the extra hosts it answers to.
//
//	parallax:
//	  allowed_hosts: []   # extra Host values (besides loopback) served behind a local TLS proxy
//	  snapshot_file: ""   # absolute path of a capture file to serve instead of the embedded one; unset = embedded
//
// The manifest cannot carry the block (it accepts config only for catalog modules), so the
// operator sets it in the file named by SUBSTRATE_CONFIG. Behind a proxy also set
// identity.trusted_proxy: true (and identity.allowed_origins when the page origin differs).
package settings

import (
	"fmt"
	"net"
	"path/filepath"
	"sort"
	"strings"
)

// Key is the name of the config block.
const Key = "parallax"

// Settings are the parsed block.
type Settings struct {
	AllowedHosts []string
	// SnapshotFile is an absolute path, or empty for the embedded capture. The file itself is
	// checked when the capture is loaded.
	SnapshotFile string
}

// Parse reads the block (nil for a missing one). An unknown key is an error, so a typo is found
// at startup instead of silently turning a protection off.
func Parse(raw any) (Settings, error) {
	var s Settings
	if raw == nil {
		return s, nil
	}
	block, ok := raw.(map[string]any)
	if !ok {
		return s, fmt.Errorf("parallax: the config block must be a map")
	}
	var unknown []string
	for k := range block {
		if k != "allowed_hosts" && k != "snapshot_file" {
			unknown = append(unknown, k)
		}
	}
	if len(unknown) > 0 {
		sort.Strings(unknown)
		return s, fmt.Errorf("parallax: unknown config key(s): %s", strings.Join(unknown, ", "))
	}
	switch f := block["snapshot_file"].(type) {
	case nil:
	case string:
		f = strings.TrimSpace(f)
		if f != "" && !filepath.IsAbs(f) {
			return s, fmt.Errorf("parallax.snapshot_file: %q is not an absolute path", f)
		}
		s.SnapshotFile = f
	default:
		return s, fmt.Errorf("parallax.snapshot_file must be a string")
	}
	switch hosts := block["allowed_hosts"].(type) {
	case nil:
	case []any:
		for _, h := range hosts {
			t, ok := h.(string)
			if !ok {
				return s, fmt.Errorf("parallax.allowed_hosts must be a list of strings")
			}
			t = strings.ToLower(strings.TrimSpace(t))
			if t == "" || strings.ContainsAny(t, "/@ ") {
				return s, fmt.Errorf("parallax.allowed_hosts: %q is not a host name", t)
			}
			if _, _, err := net.SplitHostPort(t); err != nil && strings.Contains(t, ":") {
				return s, fmt.Errorf("parallax.allowed_hosts: %q is not a host name", t)
			}
			s.AllowedHosts = append(s.AllowedHosts, t)
		}
	default:
		return s, fmt.Errorf("parallax.allowed_hosts must be a list of strings")
	}
	return s, nil
}
