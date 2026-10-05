package scenarios

import (
	"encoding/json"
	"fmt"
	"os"
)

// Communications is an app presentation fixture, not an email/SMS/wire protocol.
type Contact struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Role  string `json:"role"`
	Email string `json:"email"`
	Phone string `json:"phone"`
	Notes string `json:"notes"`
}
type Conversation struct {
	ID        string `json:"id"`
	ContactID string `json:"contactId"`
	Channel   string `json:"channel"`
	Subject   string `json:"subject"`
	RunID     string `json:"runId"`
}
type Correspondence struct {
	ID             string   `json:"id"`
	ConversationID string   `json:"conversationId"`
	ContactID      string   `json:"contactId"`
	Direction      string   `json:"direction"`
	Body           string   `json:"body"`
	Time           string   `json:"time"`
	Delivery       string   `json:"delivery"`
	AttachmentIDs  []string `json:"attachmentIds"`
}
type Attachment struct {
	ID        string `json:"id"`
	Name      string `json:"name"`
	MediaType string `json:"mediaType"`
	Content   string `json:"content"`
	RunID     string `json:"runId"`
}
type ChatSession struct {
	ID           string `json:"id"`
	SessionID    string `json:"sessionId"`
	RunID        string `json:"runId"`
	ContactID    string `json:"contactId"`
	Title        string `json:"title"`
	Reasoning    string `json:"reasoning"`
	PlanID       string `json:"planId"`
	QueueID      string `json:"queueId"`
	AttachmentID string `json:"attachmentId"`
}
type ReviewPlan struct {
	ID    string   `json:"id"`
	RunID string   `json:"runId"`
	Steps []string `json:"steps"`
}
type ReviewQueue struct {
	ID     string `json:"id"`
	RunID  string `json:"runId"`
	Status string `json:"status"`
	Title  string `json:"title"`
}
type InteractiveCard struct {
	ID     string `json:"id"`
	ChatID string `json:"chatId"`
	Kind   string `json:"kind"`
	Title  string `json:"title"`
	Body   string `json:"body"`
}
type Communications struct {
	Cards             []InteractiveCard `json:"cards"`
	Version           string            `json:"version"`
	Generator         string            `json:"generator"`
	Seed              uint64            `json:"seed"`
	Clock             string            `json:"clock"`
	OperationsVersion string            `json:"operationsVersion"`
	Contacts          []Contact         `json:"contacts"`
	Conversations     []Conversation    `json:"conversations"`
	Messages          []Correspondence  `json:"messages"`
	Attachments       []Attachment      `json:"attachments"`
	ChatSessions      []ChatSession     `json:"chatSessions"`
	Plans             []ReviewPlan      `json:"plans"`
	Queues            []ReviewQueue     `json:"queues"`
	StreamChunks      []string          `json:"streamChunks"`
}

func GenerateCommunications() Communications {
	ops := Generate()
	s := Communications{Version: "communications/v1", Generator: "parallax/v3", Seed: ops.Seed, Clock: ops.Clock, OperationsVersion: ops.Version, StreamChunks: []string{"Reviewing the bundled context. ", "The fixture inspection is complete. ", "No tool or provider was contacted."}}
	channels := []string{"email", "SMS", "Tether"}
	subjects := []string{"Gateway review evidence", "Fixture contract handoff", "Telemetry sampling follow-up"}
	for i := 0; i < 3; i++ {
		id := func(prefix string) string { return fmt.Sprintf("%s-%03d", prefix, i+1) }
		task := ops.Tasks[i]
		contact := Contact{ID: id("CONTACT"), Name: task.Owner + " Rivera", Role: []string{"Operations reviewer", "Fixture engineer", "Telemetry analyst"}[i], Email: fmt.Sprintf("reviewer%d@example.invalid", i+1), Phone: fmt.Sprintf("+1 202 555 01%02d", i+10), Notes: "Fictitious presentation contact. No directory or account service is connected."}
		s.Contacts = append(s.Contacts, contact)
		s.Conversations = append(s.Conversations, Conversation{ID: id("CONVERSATION"), ContactID: contact.ID, Channel: channels[i], Subject: subjects[i], RunID: task.RunID})
		s.Attachments = append(s.Attachments, Attachment{ID: id("ATTACHMENT"), Name: fmt.Sprintf("run-%03d-evidence.txt", i+1), MediaType: "text/plain", Content: task.Narrative + "\nLinked tool: " + ops.ToolCalls[i].ID + "\n" + ops.ToolCalls[i].Output, RunID: task.RunID})
		s.Messages = append(s.Messages, Correspondence{ID: id("MESSAGE-IN"), ConversationID: id("CONVERSATION"), ContactID: contact.ID, Direction: "inbound", Body: "Please review the local evidence for " + task.Title + ". The attached note is a bundled fixture, not a live delivery.", Time: ops.Messages[i*2].Time, Delivery: "received", AttachmentIDs: []string{id("ATTACHMENT")}}, Correspondence{ID: id("MESSAGE-OUT"), ConversationID: id("CONVERSATION"), ContactID: contact.ID, Direction: "outbound", Body: task.Narrative + " The review remains an offline presentation; no task state was changed.", Time: ops.Messages[i*2+1].Time, Delivery: []string{"delivered", "failed", "queued"}[i], AttachmentIDs: []string{}})
		s.ChatSessions = append(s.ChatSessions, ChatSession{ID: id("CHAT"), SessionID: task.SessionID, RunID: task.RunID, ContactID: contact.ID, Title: task.Title, Reasoning: "Authored review rationale: compare the bundled context and recorded fixture outcome. This is demonstration text, not hidden model reasoning.", PlanID: id("PLAN"), QueueID: id("QUEUE"), AttachmentID: id("ATTACHMENT")})
		s.Cards = append(s.Cards, InteractiveCard{ID: id("CARD-CONFIRM"), ChatID: id("CHAT"), Kind: "parallax.confirmation/v1", Title: "Review fixture handoff", Body: "Inspect a proposed handoff. Answering only records a local intent; it does not approve or continue a run."}, InteractiveCard{ID: id("CARD-PROMPT"), ChatID: id("CHAT"), Kind: "parallax.prompt/v1", Title: "Local evidence note", Body: "Draft a note for this recorded review. No response is transported or saved."})
		s.Plans = append(s.Plans, ReviewPlan{ID: id("PLAN"), RunID: task.RunID, Steps: []string{"Inspect bundled context", "Review recorded tool outcome", "Document local evidence"}})
		s.Queues = append(s.Queues, ReviewQueue{ID: id("QUEUE"), RunID: task.RunID, Status: []string{"pending", "completed", "pending"}[i], Title: "Review evidence for " + task.ID})
	}
	return s
}
func WriteCommunications(path string) error {
	b, err := json.MarshalIndent(GenerateCommunications(), "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(path, append(b, '\n'), 0644)
}
