// Command parallax is the fixture-only GUI laboratory, built on Substrate. The shell (config,
// logging, health, HTTP, auth, identity, database, CLI skeleton) comes from the manifest; this
// file and internal/ are the app: its fixtures, its read-only API and its plugin delivery.
package main

import (
	"context"
	"fmt"
	"os"
	"os/signal"
	"syscall"

	"github.com/spf13/cobra"

	"github.com/hollis-labs/substrate/boot"
	"github.com/hollis-labs/substrate/modules/cli"
)

func main() {
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()
	if err := run(ctx, os.Getenv, os.Args[1:]); err != nil {
		fmt.Fprintln(os.Stderr, "parallax:", err)
		stop()
		os.Exit(1)
	}
}

func run(ctx context.Context, getenv func(string) string, args []string) error {
	modules, prepare := plan(args)
	started, err := boot.StartWith(ctx, substrateApp, modules, substrateConfigJSON, bootOptions(getenv, prepare))
	if err != nil {
		return err
	}
	defer func() { _ = started.Stop(context.Background()) }()

	return (&parallax{app: started.App}).root(ctx, args).ExecuteContext(ctx)
}

// root is the command tree: the framework's skeleton plus serve. `parallax` with no command
// serves, like `parallax serve`.
func (p *parallax) root(ctx context.Context, args []string) *cobra.Command {
	rootCmd := cli.Root(p.app)
	rootCmd.SetArgs(args) // the same words plan() looked at
	serve := p.serveCmd(ctx)
	rootCmd.RunE = func(c *cobra.Command, args []string) error { return serve.RunE(c, args) }
	rootCmd.Args = cobra.NoArgs
	rootCmd.AddCommand(serve)
	return rootCmd
}
