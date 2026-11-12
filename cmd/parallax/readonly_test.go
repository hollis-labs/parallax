package main

import (
	"context"
	"io/fs"
	"os"
	"os/exec"
	"path/filepath"
	"slices"
	"testing"
	"time"

	"github.com/spf13/pflag"

	"github.com/hollis-labs/substrate/boot"
)

func TestPlan(t *testing.T) {
	for _, tc := range []struct {
		args    []string
		modules []string
		prepare bool
	}{
		{nil, substrateModules, true},
		{[]string{"serve"}, substrateModules, true},
		{[]string{"serve", "--help"}, pick(readOnly), false},
		{[]string{"version"}, pick(readOnly), false},
		{[]string{"config"}, pick(readOnly), false},
		{[]string{"health"}, pick(readOnly), false},
		{[]string{"help"}, pick(readOnly), false},
		{[]string{"--help"}, pick(readOnly), false},
		{[]string{"completion", "bash"}, pick(readOnly), false},
		{[]string{"nonsense"}, pick(readOnly), false},
	} {
		mods, prepare := plan(tc.args)
		if !slices.Equal(mods, tc.modules) || prepare != tc.prepare {
			t.Errorf("plan(%v) = %v, %v; want %v, %v", tc.args, mods, prepare, tc.modules, tc.prepare)
		}
	}
}

// The read-only commands start no module that opens a file and create nothing: with an empty HOME
// and no PARALLAX_DATA_DIR, the tree stays empty. Serving is the positive control, so the
// emptiness check is known to be able to see a write.
func TestReadOnlyCommandsCreateNothing(t *testing.T) {
	bin := filepath.Join(t.TempDir(), "parallax")
	build := exec.Command("go", "build", "-o", bin, ".") //nolint:gosec // fixed arguments, and bin is a temp path
	if out, err := build.CombinedOutput(); err != nil {
		t.Fatalf("build: %v\n%s", err, out)
	}
	cfg := filepath.Join(t.TempDir(), "cfg.yaml")
	if err := os.WriteFile(cfg, []byte("httphost:\n  addr: \"127.0.0.1:0\"\n"), 0o600); err != nil {
		t.Fatal(err)
	}
	command := func(ctx context.Context, home string, args ...string) *exec.Cmd {
		c := exec.CommandContext(ctx, bin, args...) //nolint:gosec // bin is the binary this test just built
		c.Dir = home
		c.Env = []string{"PATH=" + os.Getenv("PATH"), "HOME=" + home, "XDG_DATA_HOME=" + home + "/data",
			"XDG_STATE_HOME=" + home + "/state", "XDG_CONFIG_HOME=" + home + "/config", "SUBSTRATE_CONFIG=" + cfg}
		return c
	}
	entries := func(home string) []string {
		var got []string
		_ = filepath.WalkDir(home, func(p string, _ fs.DirEntry, _ error) error {
			if p != home {
				got = append(got, p)
			}
			return nil
		})
		return got
	}
	for _, args := range [][]string{{"version"}, {"config"}, {"health"}, {"help"}, {"--help"}, {"serve", "--help"}} {
		home := t.TempDir()
		if out, err := command(context.Background(), home, args...).CombinedOutput(); err != nil {
			t.Errorf("%v failed: %v\n%s", args, err, out)
		}
		if got := entries(home); len(got) != 0 {
			t.Errorf("%v created %v", args, got)
		}
	}

	home := t.TempDir()
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()
	serve := command(ctx, home, "serve")
	if err := serve.Start(); err != nil {
		t.Fatal(err)
	}
	defer func() { _ = serve.Wait() }()
	defer cancel()
	for deadline := time.Now().Add(15 * time.Second); len(entries(home)) == 0; time.Sleep(50 * time.Millisecond) {
		if time.Now().After(deadline) {
			t.Fatal("control: serve created nothing, so the emptiness check proves nothing")
		}
	}
}

// plan treats every argument that does not start with "-" as a command word, which is right only
// while no root-level flag takes a value. Fails when one is added.
func TestRootHasNoValueFlags(t *testing.T) {
	t.Setenv("PARALLAX_DATA_DIR", filepath.Join(t.TempDir(), "data"))
	t.Setenv("SUBSTRATE_CONFIG", "")
	modules, prepare := plan([]string{"version"})
	run, err := boot.StartWith(context.Background(), substrateApp, modules, substrateConfigJSON, bootOptions(os.Getenv, prepare))
	if err != nil {
		t.Fatal(err)
	}
	defer func() { _ = run.Stop(context.Background()) }()
	root := (&parallax{app: run.App}).root(context.Background(), nil)
	check := func(fs *pflag.FlagSet) {
		fs.VisitAll(func(f *pflag.Flag) {
			if f.Value.Type() != "bool" {
				t.Errorf("root flag --%s takes a value (%s); plan() would read its value as the command word, teach it first", f.Name, f.Value.Type())
			}
		})
	}
	check(root.Flags())
	check(root.PersistentFlags())
}
