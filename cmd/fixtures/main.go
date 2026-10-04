package main

import (
	"github.com/hollis-labs/parallax/internal/scenarios"
	"log"
)

func main() {
	if err := scenarios.Write("frontend/src/fixtures/operations.json"); err != nil {
		log.Fatal(err)
	}
}
