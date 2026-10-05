package main

import (
	"github.com/hollis-labs/parallax/internal/scenarios"
	"log"
)

func main() {
	if err := scenarios.WriteVoice("frontend/src/fixtures/voice.json", "frontend/public/media"); err != nil {
		log.Fatal(err)
	}
	if err := scenarios.WriteDeveloper("frontend/src/fixtures/developer.json"); err != nil {
		log.Fatal(err)
	}
	if err := scenarios.WriteObservations("frontend/src/fixtures/observations.json"); err != nil {
		log.Fatal(err)
	}
	if err := scenarios.WriteAdministration("frontend/src/fixtures/administration.json"); err != nil {
		log.Fatal(err)
	}
	if err := scenarios.Write("frontend/src/fixtures/operations.json"); err != nil {
		log.Fatal(err)
	}
	if err := scenarios.WriteProfile("frontend/src/fixtures/operations-large.json", 80); err != nil {
		log.Fatal(err)
	}
	if err := scenarios.WriteCommunications("frontend/src/fixtures/communications.json"); err != nil {
		log.Fatal(err)
	}
}
