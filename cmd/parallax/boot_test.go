package main

import (
	"bytes"
	"context"
	"encoding/json"
	"io"
	"net"
	"net/http"
	"net/http/cookiejar"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"github.com/hollis-labs/substrate/boot"
)

// started boots the real stack (every module the manifest selects and the real handler chain) on
// a temp data directory and a free loopback port, and returns its base URL. Nothing is stubbed
// between the HTTP client and the database.
func started(t *testing.T, override string) string {
	t.Helper()
	return startedIn(t, t.TempDir(), override)
}

// startedIn is started with a chosen data directory.
func startedIn(t *testing.T, dataDir, override string) string {
	t.Helper()
	file := filepath.Join(t.TempDir(), "override.yaml")
	if err := os.WriteFile(file, []byte(override), 0o600); err != nil {
		t.Fatal(err)
	}
	env := map[string]string{"PARALLAX_DATA_DIR": dataDir, "SUBSTRATE_CONFIG": file}
	// The config module reads SUBSTRATE_CONFIG from the process environment.
	t.Setenv("SUBSTRATE_CONFIG", file)

	ctx, cancel := context.WithCancel(context.Background())
	run, err := boot.StartWith(ctx, substrateApp, substrateModules, substrateConfigJSON, bootOptions(func(k string) string { return env[k] }, true))
	if err != nil {
		cancel()
		t.Fatal(err)
	}
	addr := make(chan net.Addr, 1)
	p := &parallax{app: run.App, ready: func(a net.Addr) { addr <- a }}
	done := make(chan error, 1)
	go func() { done <- p.serve(ctx) }()
	t.Cleanup(func() {
		cancel()
		select {
		case err := <-done:
			if err != nil {
				t.Errorf("serve ended with %v", err)
			}
		case <-time.After(15 * time.Second):
			t.Error("serve did not stop on cancel")
		}
		_ = run.Stop(context.Background())
	})
	select {
	case a := <-addr:
		return "http://" + a.String()
	case err := <-done:
		t.Fatalf("serve returned before listening: %v", err)
	case <-time.After(15 * time.Second):
		t.Fatal("serve never listened")
	}
	return ""
}

type client struct {
	t    *testing.T
	base string
	http *http.Client
}

func newClient(t *testing.T, base string) *client {
	jar, err := cookiejar.New(nil)
	if err != nil {
		t.Fatal(err)
	}
	return &client{t: t, base: base, http: &http.Client{Jar: jar, Timeout: 10 * time.Second}}
}

// do sends one request; headers may override Host.
func (c *client) do(method, path string, body any, headers map[string]string) (int, []byte) {
	c.t.Helper()
	var rdr io.Reader
	if body != nil {
		b, err := json.Marshal(body)
		if err != nil {
			c.t.Fatal(err)
		}
		rdr = bytes.NewReader(b)
	}
	req, err := http.NewRequest(method, c.base+path, rdr)
	if err != nil {
		c.t.Fatal(err)
	}
	if body != nil {
		req.Header.Set("Content-Type", "application/json")
	}
	for k, v := range headers {
		if k == "Host" {
			req.Host = v
			continue
		}
		req.Header.Set(k, v)
	}
	res, err := c.http.Do(req)
	if err != nil {
		c.t.Fatal(err)
	}
	defer func() { _ = res.Body.Close() }()
	out, _ := io.ReadAll(res.Body)
	return res.StatusCode, out
}

func (c *client) want(status int, method, path string, body any, headers map[string]string) []byte {
	c.t.Helper()
	got, out := c.do(method, path, body, headers)
	if got != status {
		c.t.Fatalf("%s %s: %d want %d: %s", method, path, got, status, out)
	}
	return out
}

var xrw = map[string]string{"X-Requested-With": "parallax-ui"}

const loopbackOverride = "httphost:\n  addr: \"127.0.0.1:0\"\n"

func TestAcceptance(t *testing.T) {
	base := started(t, loopbackOverride)
	c := newClient(t, base)

	c.want(200, "GET", "/healthz", nil, nil)

	// Signed out: the guard answers with the flat error body, for the API and the plugin mount.
	var flat struct{ Code, Message string }
	if err := json.Unmarshal(c.want(401, "GET", "/api/scenario", nil, nil), &flat); err != nil || flat.Code != "unauthorized" || flat.Message == "" {
		t.Fatalf("unauthenticated body = %+v, %v", flat, err)
	}
	c.want(401, "GET", "/api/snapshots/current", nil, nil)
	c.want(401, "GET", "/plugins/ops/g1/bundle.js", nil, nil)

	creds := map[string]string{"username": "owner", "display_name": "Owner", "password": "correct horse battery staple"}
	c.want(200, "POST", "/api/setup", creds, xrw)
	c.want(200, "POST", "/api/login", map[string]string{"username": "owner", "password": creds["password"]}, xrw)

	if body := c.want(200, "GET", "/api/scenario", nil, nil); !bytes.Contains(body, []byte("RUN-008")) {
		t.Fatalf("scenario body lacks RUN-008: %.200s", body)
	}
	if body := c.want(200, "GET", "/api/scenario?profile=large", nil, nil); !bytes.Contains(body, []byte("RUN-080")) {
		t.Fatalf("large scenario body lacks RUN-080: %.200s", body)
	}
	c.want(200, "GET", "/api/snapshots/current", nil, nil)
	if body := c.want(200, "GET", "/plugins/ops/g1/bundle.js", nil, nil); len(body) == 0 {
		t.Fatal("plugin bundle is empty")
	}
	c.want(404, "GET", "/plugins/nope", nil, nil)

	// Refusals: a cookie write without the CSRF header, a foreign Host.
	c.want(403, "POST", "/api/logout", nil, nil)
	c.want(403, "GET", "/healthz", nil, map[string]string{"Host": "evil.example.test"})
	c.want(403, "GET", "/api/scenario", nil, map[string]string{"Host": "evil.example.test"})

	c.want(204, "POST", "/api/logout", nil, xrw)
	c.want(401, "GET", "/api/scenario", nil, nil)
}

// A listed proxy name is served only for a loopback peer carrying exactly one
// X-Forwarded-Proto: https, and cookie-authenticated writes still pass the identity checks.
func TestProxiedHost(t *testing.T) {
	const name = "parallax.example.test"
	base := started(t, loopbackOverride+"parallax:\n  allowed_hosts: ["+name+"]\nidentity:\n  trusted_proxy: true\n  allowed_origins: [\"https://"+name+"\"]\n")
	c := newClient(t, base)
	https := map[string]string{"Host": name, "X-Forwarded-Proto": "https"}

	c.want(200, "GET", "/healthz", nil, https)
	c.want(403, "GET", "/healthz", nil, map[string]string{"Host": name})                                               // no validated proto
	c.want(403, "GET", "/healthz", nil, map[string]string{"Host": name, "X-Forwarded-Proto": "http"})                  // plaintext
	c.want(403, "GET", "/healthz", nil, map[string]string{"Host": "other.example.test", "X-Forwarded-Proto": "https"}) // not listed

	// End to end through the proxy name: setup with the page's own origin, then a signed-in read.
	// The session cookie is Secure behind https and the test client speaks http, so it is carried by hand.
	body, _ := json.Marshal(map[string]string{"username": "owner", "display_name": "Owner", "password": "correct horse battery staple"})
	req, _ := http.NewRequest("POST", base+"/api/setup", bytes.NewReader(body))
	req.Host = name
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Forwarded-Proto", "https")
	req.Header.Set("Origin", "https://"+name)
	req.Header.Set("X-Requested-With", "parallax-ui")
	res, err := (&http.Client{Timeout: 10 * time.Second}).Do(req)
	if err != nil {
		t.Fatal(err)
	}
	_ = res.Body.Close()
	if res.StatusCode != 200 || len(res.Cookies()) == 0 {
		t.Fatalf("proxied setup: status %d, %d cookies", res.StatusCode, len(res.Cookies()))
	}
	read := func(host string) int {
		r, _ := http.NewRequest("GET", base+"/api/scenario", nil)
		r.Host = host
		r.Header.Set("X-Forwarded-Proto", "https")
		for _, ck := range res.Cookies() {
			r.AddCookie(ck)
		}
		out, err := (&http.Client{Timeout: 10 * time.Second}).Do(r)
		if err != nil {
			t.Fatal(err)
		}
		_ = out.Body.Close()
		return out.StatusCode
	}
	if got := read(name); got != 200 {
		t.Fatalf("signed-in read through the proxy name = %d, want 200", got)
	}
	if got := read("other.example.test"); got != 403 {
		t.Fatalf("read through an unlisted name = %d, want 403", got)
	}
}

func TestBadSettingsRefuseToServe(t *testing.T) {
	file := filepath.Join(t.TempDir(), "override.yaml")
	if err := os.WriteFile(file, []byte(loopbackOverride+"parallax:\n  allowed_host: [x.example.test]\n"), 0o600); err != nil {
		t.Fatal(err)
	}
	env := map[string]string{"PARALLAX_DATA_DIR": t.TempDir(), "SUBSTRATE_CONFIG": file}
	t.Setenv("SUBSTRATE_CONFIG", file)
	run, err := boot.StartWith(context.Background(), substrateApp, substrateModules, substrateConfigJSON, bootOptions(func(k string) string { return env[k] }, true))
	if err != nil {
		t.Fatal(err)
	}
	defer func() { _ = run.Stop(context.Background()) }()
	err = (&parallax{app: run.App}).serve(context.Background())
	if err == nil || !strings.Contains(err.Error(), "unknown config key(s): allowed_host") {
		t.Fatalf("serve error = %v", err)
	}
}

// The manifest's relative defaults land in the data directory, private; an absolute path from
// the override is kept and nothing is created at the default.
func TestDataPaths(t *testing.T) {
	t.Run("defaults are anchored in the data directory", func(t *testing.T) {
		data := filepath.Join(t.TempDir(), "data")
		c := newClient(t, startedIn(t, data, loopbackOverride))
		c.want(200, "POST", "/api/setup", map[string]string{"username": "owner", "display_name": "Owner", "password": "correct horse battery staple"}, xrw)
		for name, want := range map[string]os.FileMode{"parallax.db": 0o600, "identity-signing.key": 0o600} {
			fi, err := os.Stat(filepath.Join(data, name))
			if err != nil || fi.Mode().Perm() != want {
				t.Errorf("%s: %v, mode %v, want %o", name, err, fi, want)
			}
		}
		if fi, err := os.Stat(data); err != nil || fi.Mode().Perm() != 0o700 {
			t.Errorf("data directory: %v, %v", err, fi)
		}
	})
	t.Run("an absolute path from the override is kept", func(t *testing.T) {
		data := filepath.Join(t.TempDir(), "data")
		elsewhere := t.TempDir()
		override := loopbackOverride + "database:\n  sqlite:\n    path: " + filepath.Join(elsewhere, "custom.db") + "\nidentity:\n  key_file: " + filepath.Join(elsewhere, "custom.key") + "\n"
		c := newClient(t, startedIn(t, data, override))
		c.want(200, "POST", "/api/setup", map[string]string{"username": "owner", "display_name": "Owner", "password": "correct horse battery staple"}, xrw)
		for _, name := range []string{"custom.db", "custom.key"} {
			if _, err := os.Stat(filepath.Join(elsewhere, name)); err != nil {
				t.Errorf("%s not created where the override says: %v", name, err)
			}
		}
		for _, name := range []string{"parallax.db", "identity-signing.key"} {
			if _, err := os.Stat(filepath.Join(data, name)); err == nil {
				t.Errorf("%s created in the data directory despite the override", name)
			}
		}
	})
}

const captureBody = `{"version":"parallax-capture/v1","id":"synthetic","sources":{"torque":{"tasks":{"items":[]}},"tether":{"overview":{"body":{}},"sessions":{"items":[]}}}}`

// parallax.snapshot_file: unset serves the embedded capture; a valid file is served; a missing or
// malformed file refuses to start and the error names the key.
func TestSnapshotFile(t *testing.T) {
	signIn := func(c *client) {
		c.want(200, "POST", "/api/setup", map[string]string{"username": "owner", "display_name": "Owner", "password": "correct horse battery staple"}, xrw)
	}
	t.Run("unset serves the embedded capture", func(t *testing.T) {
		c := newClient(t, started(t, loopbackOverride))
		signIn(c)
		if body := c.want(200, "GET", "/api/snapshots/current", nil, nil); bytes.Contains(body, []byte("synthetic")) {
			t.Fatalf("embedded capture expected, got %s", body)
		}
	})
	t.Run("a valid file is served", func(t *testing.T) {
		file := filepath.Join(t.TempDir(), "capture.json")
		if err := os.WriteFile(file, []byte(captureBody), 0o600); err != nil {
			t.Fatal(err)
		}
		c := newClient(t, started(t, loopbackOverride+"parallax:\n  snapshot_file: "+file+"\n"))
		signIn(c)
		if body := c.want(200, "GET", "/api/snapshots/current", nil, nil); string(body) != captureBody {
			t.Fatalf("body = %s", body)
		}
	})
	for name, content := range map[string]string{"missing": "", "malformed": "{nope", "wrong version": `{"version":"x","id":null,"sources":null}`} {
		t.Run(name+" file refuses to start", func(t *testing.T) {
			file := filepath.Join(t.TempDir(), "capture.json")
			if content != "" {
				if err := os.WriteFile(file, []byte(content), 0o600); err != nil {
					t.Fatal(err)
				}
			}
			err := serveWith(t, loopbackOverride+"parallax:\n  snapshot_file: "+file+"\n")
			if err == nil || !strings.Contains(err.Error(), "parallax.snapshot_file") {
				t.Fatalf("serve error = %v, want one naming parallax.snapshot_file", err)
			}
		})
	}
}

// serveWith boots the stack with an override and returns the error serve ends with.
func serveWith(t *testing.T, override string) error {
	t.Helper()
	file := filepath.Join(t.TempDir(), "override.yaml")
	if err := os.WriteFile(file, []byte(override), 0o600); err != nil {
		t.Fatal(err)
	}
	env := map[string]string{"PARALLAX_DATA_DIR": t.TempDir(), "SUBSTRATE_CONFIG": file}
	t.Setenv("SUBSTRATE_CONFIG", file)
	run, err := boot.StartWith(context.Background(), substrateApp, substrateModules, substrateConfigJSON, bootOptions(func(k string) string { return env[k] }, true))
	if err != nil {
		t.Fatal(err)
	}
	defer func() { _ = run.Stop(context.Background()) }()
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	return (&parallax{app: run.App}).serve(ctx)
}

// The identity behavior the frontend contract relies on (Substrate bac8c60): a who-am-I route,
// empty lists as [] and Retry-After on a rate-limited login.
func TestIdentityContract(t *testing.T) {
	c := newClient(t, started(t, loopbackOverride))
	c.want(401, "GET", "/api/identity/profile", nil, nil)
	c.want(200, "POST", "/api/setup", map[string]string{"username": "owner", "display_name": "Owner", "password": "correct horse battery staple"}, xrw)
	var me struct {
		Username  string   `json:"username"`
		Scopes    []string `json:"scopes"`
		Assurance string   `json:"assurance"`
	}
	if err := json.Unmarshal(c.want(200, "GET", "/api/identity/profile", nil, nil), &me); err != nil {
		t.Fatal(err)
	}
	if me.Username != "owner" || me.Assurance != "local" || len(me.Scopes) != 1 || me.Scopes[0] != "*" {
		t.Fatalf("profile = %+v", me)
	}
	if body := c.want(200, "GET", "/api/identity/keys", nil, nil); strings.Contains(string(body), "null") {
		t.Fatalf("an empty list must be [], got %s", body)
	}

	anon := newClient(t, c.base)
	bad := map[string]string{"username": "owner", "password": "wrong password here"}
	for range 5 {
		anon.want(401, "POST", "/api/login", bad, xrw)
	}
	req, err := http.NewRequest(http.MethodPost, c.base+"/api/login", strings.NewReader(`{"username":"owner","password":"wrong password here"}`))
	if err != nil {
		t.Fatal(err)
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Requested-With", "parallax-ui")
	res, err := anon.http.Do(req)
	if err != nil {
		t.Fatal(err)
	}
	_ = res.Body.Close()
	if res.StatusCode != 429 || res.Header.Get("Retry-After") == "" {
		t.Fatalf("sixth login: %d, Retry-After %q", res.StatusCode, res.Header.Get("Retry-After"))
	}
}
