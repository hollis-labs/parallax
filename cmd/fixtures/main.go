package main

import (
	"github.com/hollis-labs/parallax/internal/scenarios"
	"log"
)

func main() {
	if err := scenarios.WriteReaderExample("frontend/src/fixtures/reader-example.json"); err != nil {
		log.Fatal(err)
	}
	if err := scenarios.WriteChatExample("frontend/src/fixtures/chat-example.json"); err != nil {
		log.Fatal(err)
	}
	if err := scenarios.WriteTorque("frontend/src/fixtures/operations-torque.json", "frontend/src/fixtures/torque-reference.json"); err != nil {
		log.Fatal(err)
	}
	if err := scenarios.WriteFamilyContracts("frontend/src/fixtures/family-contracts.json"); err != nil {
		log.Fatal(err)
	}
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
