package main

import (
	"github.com/hollis-labs/parallax/internal/scenarios"
	"log"
)

func main() {
	if err := scenarios.Write("frontend/src/fixtures/operations.json"); err != nil {
		log.Fatal(err)
	}
	if err := scenarios.WriteProfile("frontend/src/fixtures/operations-large.json", 80); err != nil {
		log.Fatal(err)
	}
}
