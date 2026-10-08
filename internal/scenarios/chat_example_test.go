package scenarios

import (
	"encoding/json"
	"os"
	"testing"
)

func TestChatExampleDeterministicArtifact(t *testing.T) {
	p := GenerateChatExample()
	a, _ := json.Marshal(p)
	b, _ := json.Marshal(GenerateChatExample())
	if string(a) != string(b) {
		t.Fatal("generator drift")
	}
	if e := ValidateChatExample(p, GenerateCommunications(), Generate()); e != nil {
		t.Fatal(e)
	}
	raw, e := os.ReadFile("../../frontend/src/fixtures/chat-example.json")
	if e != nil {
		t.Fatal(e)
	}
	var bundled ChatExample
	if e = json.Unmarshal(raw, &bundled); e != nil {
		t.Fatal(e)
	}
	b, _ = json.Marshal(bundled)
	if string(a) != string(b) {
		t.Fatal("stale chat artifact")
	}
	if len(p.Sessions) != 4 || len(p.Sessions[0].Turns) != 26 || len(p.Sources) != 18 {
		t.Fatal("bounded context drift")
	}
}
func TestChatExampleRefusesInvalidPackAndCrossValidJoins(t *testing.T) {
	cases := []struct {
		name   string
		mutate func(*ChatExample, *Communications, *Scenario)
	}{
		{"version", func(p *ChatExample, c *Communications, o *Scenario) { p.Version = "future" }},
		{"generator", func(p *ChatExample, c *Communications, o *Scenario) { p.Generator = "future" }},
		{"matched unsupported seed", func(p *ChatExample, c *Communications, o *Scenario) {
			p.Seed = 1
			p.Operations.Seed = 1
			p.Communications.Seed = 1
			c.Seed = 1
			o.Seed = 1
		}},
		{"Torque profile", func(p *ChatExample, c *Communications, o *Scenario) { p.Operations.Profile = "torque-16w" }},
		{"projection", func(p *ChatExample, c *Communications, o *Scenario) { p.Projection = "prefix" }},
		{"clock", func(p *ChatExample, c *Communications, o *Scenario) { p.Clock = "2026-10-04T14:31:00Z" }},
		{"duplicate session", func(p *ChatExample, c *Communications, o *Scenario) { p.Sessions[1].ID = p.Sessions[0].ID }},
		{"duplicate turn", func(p *ChatExample, c *Communications, o *Scenario) {
			p.Sessions[0].Turns[1].ID = p.Sessions[0].Turns[0].ID
		}},
		{"history bounds", func(p *ChatExample, c *Communications, o *Scenario) { p.Sessions[0].InitialCount = 27 }},
		{"unordered authored history", func(p *ChatExample, c *Communications, o *Scenario) {
			x := p.Sessions[0].Turns
			p.Sessions[0].Turns[0], p.Sessions[0].Turns[1] = x[1], x[0]
		}},
		{"unordered recorded history", func(p *ChatExample, c *Communications, o *Scenario) {
			x := p.Sessions[0].Turns
			x[24], x[25] = x[25], x[24]
			x[24].Order = 24
			x[25].Order = 25
		}},
		{"cross chat message", func(p *ChatExample, c *Communications, o *Scenario) {
			p.Sessions[0].Turns[24].MessageID = "MSG-REQUEST-002"
		}},
		{"cross valid message context", func(p *ChatExample, c *Communications, o *Scenario) {
			o.Messages[0].RunID = "RUN-002"
			o.Messages[0].SessionID = "SESSION-002"
		}},
		{"future recorded time", func(p *ChatExample, c *Communications, o *Scenario) { o.Messages[1].Time = "2026-10-04T14:30:01Z" }},
		{"noncanonical recorded time", func(p *ChatExample, c *Communications, o *Scenario) { o.Messages[0].Time = "2026-10-04T15:10:00+01:00" }},
		{"invalid time", func(p *ChatExample, c *Communications, o *Scenario) { o.Messages[0].Time = "invalid" }},
		{"missing recorded row", func(p *ChatExample, c *Communications, o *Scenario) { p.Sessions[0].Turns = p.Sessions[0].Turns[:25] }},
		{"cross chat card", func(p *ChatExample, c *Communications, o *Scenario) {
			p.Sessions[0].Cards[0].CardID = p.Sessions[1].Cards[0].CardID
		}},
		{"duplicate card", func(p *ChatExample, c *Communications, o *Scenario) { p.Sessions[0].Cards[1] = p.Sessions[0].Cards[0] }},
		{"question mismatch", func(p *ChatExample, c *Communications, o *Scenario) { p.Sessions[0].Cards[1].QuestionID = "missing" }},
		{"cross chat attachment", func(p *ChatExample, c *Communications, o *Scenario) { p.Sources[0].ReferenceID = "ATTACHMENT-002" }},
		{"cross chat tool", func(p *ChatExample, c *Communications, o *Scenario) { p.Sources[1].ReferenceID = "TOOL-002" }},
		{"cross chat trace", func(p *ChatExample, c *Communications, o *Scenario) { p.Sources[2].ReferenceID = "TRACE-002" }},
		{"cross chat plan", func(p *ChatExample, c *Communications, o *Scenario) { p.Sources[3].ReferenceID = "PLAN-002" }},
		{"cross chat queue", func(p *ChatExample, c *Communications, o *Scenario) { p.Sources[4].ReferenceID = "QUEUE-002" }},
		{"duplicate source", func(p *ChatExample, c *Communications, o *Scenario) { p.Sources[1].ID = p.Sources[0].ID }},
		{"empty has recorded context", func(p *ChatExample, c *Communications, o *Scenario) { p.Sessions[3].ChatID = "CHAT-001" }},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			p, c, o := GenerateChatExample(), GenerateCommunications(), Generate()
			tc.mutate(&p, &c, &o)
			if ValidateChatExample(p, c, o) == nil {
				t.Fatal("invalid pack admitted")
			}
		})
	}
}
