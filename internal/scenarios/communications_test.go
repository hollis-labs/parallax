package scenarios

import (
	"encoding/json"
	"os"
	"testing"
	"time"
)

func TestCommunicationsDeterministicGraphAndArtifact(t *testing.T) {
	s := GenerateCommunications()
	a, _ := json.Marshal(s)
	b, _ := json.Marshal(GenerateCommunications())
	if string(a) != string(b) {
		t.Fatal("communications drift")
	}
	raw, err := os.ReadFile("../../frontend/src/fixtures/communications.json")
	if err != nil {
		t.Fatal(err)
	}
	var bundled Communications
	if err = json.Unmarshal(raw, &bundled); err != nil {
		t.Fatal(err)
	}
	c, _ := json.Marshal(bundled)
	if string(a) != string(c) {
		t.Fatal("communications artifact stale: make fixtures")
	}
	ops := Generate()
	if s.Clock != ops.Clock || s.OperationsVersion != ops.Version || s.Seed != ops.Seed {
		t.Fatal("cross-family identity mismatch")
	}
	contacts := map[string]bool{}
	for _, c := range s.Contacts {
		if contacts[c.ID] {
			t.Fatal("duplicate contact")
		}
		contacts[c.ID] = true
	}
	convs := map[string]Conversation{}
	for _, c := range s.Conversations {
		if !contacts[c.ContactID] {
			t.Fatal("missing conversation contact")
		}
		convs[c.ID] = c
	}
	attachments := map[string]Attachment{}
	for _, a := range s.Attachments {
		attachments[a.ID] = a
	}
	clock, _ := time.Parse(time.RFC3339, s.Clock)
	for _, m := range s.Messages {
		conv, ok := convs[m.ConversationID]
		stamp, err := time.Parse(time.RFC3339, m.Time)
		if !ok || conv.ContactID != m.ContactID || err != nil || stamp.After(clock) {
			t.Fatal("message join/timestamp invalid")
		}
		for _, id := range m.AttachmentIDs {
			if attachments[id].RunID != conv.RunID {
				t.Fatal("attachment run mismatch")
			}
		}
	}
	for i, chat := range s.ChatSessions {
		if chat.RunID != ops.Runs[i].ID || chat.SessionID != ops.Sessions[i].ID || !contacts[chat.ContactID] || attachments[chat.AttachmentID].RunID != chat.RunID || s.Plans[i].ID != chat.PlanID || s.Queues[i].ID != chat.QueueID || ops.ToolCalls[i].RunID != chat.RunID {
			t.Fatal("chat operations join invalid")
		}
	}
}
func TestCommunicationsRejectsBrokenRelationships(t *testing.T) {
	cases := []struct {
		name   string
		mutate func(*Communications)
	}{
		{"missing contact", func(s *Communications) { s.Conversations[0].ContactID = "missing" }},
		{"wrong attachment run", func(s *Communications) { s.Attachments[0].RunID = "RUN-002" }},
		{"missing plan", func(s *Communications) { s.ChatSessions[0].PlanID = "missing" }},
		{"wrong queue run", func(s *Communications) { s.Queues[0].RunID = "RUN-002" }},
		{"wrong operations session", func(s *Communications) { s.ChatSessions[0].SessionID = "SESSION-002" }},
		{"future message", func(s *Communications) { s.Messages[0].Time = "2026-10-04T14:30:01Z" }},
		{"message precedes run", func(s *Communications) { s.Messages[0].Time = "2026-10-04T01:00:00Z" }},
		{"orphan card", func(s *Communications) { s.Cards[0].ChatID = "missing" }},
		{"duplicate message", func(s *Communications) { s.Messages[1].ID = s.Messages[0].ID }},
	}
	if err := ValidateCommunications(GenerateCommunications(), Generate()); err != nil {
		t.Fatal(err)
	}
	for _, c := range cases {
		t.Run(c.name, func(t *testing.T) {
			s := GenerateCommunications()
			c.mutate(&s)
			if ValidateCommunications(s, Generate()) == nil {
				t.Fatal("invalid fixture accepted")
			}
		})
	}
}
