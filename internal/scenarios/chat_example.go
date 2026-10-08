package scenarios

import (
	"encoding/json"
	"fmt"
	"os"
	"strings"
	"time"
)

type ChatIdentity struct {
	Version   string `json:"version"`
	Generator string `json:"generator"`
	Profile   string `json:"profile,omitempty"`
	Seed      uint64 `json:"seed"`
	Clock     string `json:"clock"`
}
type ChatTurn struct {
	Order      int    `json:"order"`
	ID         string `json:"id"`
	Kind       string `json:"kind"`
	MessageID  string `json:"messageId,omitempty"`
	Role       string `json:"role,omitempty"`
	Text       string `json:"text,omitempty"`
	Provenance string `json:"provenance"`
}
type ChatSource struct {
	ID          string `json:"id"`
	Kind        string `json:"kind"`
	ReferenceID string `json:"referenceId,omitempty"`
	Text        string `json:"text,omitempty"`
	Provenance  string `json:"provenance"`
}
type ChatCardAppearance struct {
	CardID     string   `json:"cardId"`
	Prior      *string  `json:"prior"`
	ActionIDs  []string `json:"actionIds"`
	QuestionID string   `json:"questionId,omitempty"`
	Provenance string   `json:"provenance"`
}
type ChatExampleSession struct {
	ID              string               `json:"id"`
	ChatID          string               `json:"chatId,omitempty"`
	Title           string               `json:"title"`
	Kind            string               `json:"kind"`
	Group           string               `json:"group"`
	Turns           []ChatTurn           `json:"turns"`
	InitialCount    int                  `json:"initialCount"`
	HistoryPageSize int                  `json:"historyPageSize"`
	SourceIDs       []string             `json:"sourceIds"`
	Cards           []ChatCardAppearance `json:"cards"`
	PreviewChunks   []string             `json:"previewChunks"`
}
type ChatExample struct {
	Version        string               `json:"version"`
	Generator      string               `json:"generator"`
	Seed           uint64               `json:"seed"`
	Clock          string               `json:"clock"`
	Projection     string               `json:"projection"`
	Operations     ChatIdentity         `json:"operations"`
	Communications ChatIdentity         `json:"communications"`
	Sessions       []ChatExampleSession `json:"sessions"`
	Sources        []ChatSource         `json:"sources"`
}

func GenerateChatExample() ChatExample {
	o, c := Generate(), GenerateCommunications()
	p := ChatExample{Version: "chat-example/v1", Generator: "parallax/v9", Seed: 4421, Clock: o.Clock, Projection: "snapshot", Operations: ChatIdentity{o.Version, o.Generator, o.Profile, o.Seed, o.Clock}, Communications: ChatIdentity{c.Version, c.Generator, "", c.Seed, c.Clock}}
	for i, ch := range c.ChatSessions {
		s := ChatExampleSession{ID: ch.ID, ChatID: ch.ID, Title: ch.Title, Kind: "recorded context with authored history", Group: "Bundled review sessions", InitialCount: 6, HistoryPageSize: 6, Turns: []ChatTurn{}, SourceIDs: []string{}, Cards: []ChatCardAppearance{}, PreviewChunks: []string{"Authored preview: comparing the supplied context. ", "Only local review text is being revealed. ", "This remains uncommitted; no model or tool was contacted."}}
		for j := 0; j < 24; j++ {
			role := "user"
			if j%2 == 1 {
				role = "assistant"
			}
			questions := []string{"Which run is linked to this review?", "Is the latest supplied result a live response?", "Where does the tool evidence come from?", "Can I inspect the source attachment?", "What does an absent value mean?", "How should zero and null be interpreted?", "Does this card have a recorded response?", "Is the queue status an authorization?", "What is the plan intended to demonstrate?", "Can older history be fetched from a provider?", "How will a local draft be handled?", "What remains outside this review?"}
			answers := []string{fmt.Sprintf("The supplied context links %s to %s and %s.", ch.ID, ch.RunID, ch.SessionID), "The result below references the original operations fixture. It is not a new model response.", "The linked tool, trace and span are bundled records; inspection never executes them.", "The text attachment is available as a declared local source, with its original run relationship.", "Absent means no supplied value. It must not be converted into observed zero.", "Zero is a literal value; null remains a distinct supplied value in the authored text specimen.", "No recorded prior response is supplied. The card appearance annotation is authored separately.", "The queue is snapshot metadata. It does not grant access or continue work.", "The plan lists supplied review steps without performing them.", "Older rows are finite authored history already in this pack; there is no provider fetch.", "A draft may form a local inspection candidate. It is never appended to the recorded transcript.", "Sending, approval, uploads, saves and provider execution remain unavailable."}
			text := questions[j/2]
			if j%2 == 1 {
				text = answers[j/2]
			}
			if j == 10 {
				text += "\n" + strings.Repeat("Long authored context: compare zero, null and absent fields without claiming an observed outcome.\n", 24)
			}
			s.Turns = append(s.Turns, ChatTurn{ID: fmt.Sprintf("AUTHORED-%s-%02d", ch.ID, j+1), Kind: "authored", Role: role, Text: text, Provenance: "Untimed authored history specimen; ordered for review only."})
		}
		for _, m := range o.Messages {
			if m.SessionID == ch.SessionID {
				s.Turns = append(s.Turns, ChatTurn{ID: m.ID, Kind: "recorded reference", MessageID: m.ID, Provenance: "Exact operations/v2 records-8 message reference."})
			}
		}
		kinds := []string{"attachment", "tool", "trace", "plan", "queue"}
		refs := []string{ch.AttachmentID, o.ToolCalls[i].ID, o.Traces[i].ID, ch.PlanID, ch.QueueID}
		for k, kind := range kinds {
			id := fmt.Sprintf("SOURCE-%s-%s", ch.ID, kind)
			p.Sources = append(p.Sources, ChatSource{ID: id, Kind: kind, ReferenceID: refs[k], Provenance: "Supplied linked snapshot metadata; no separate metadata timestamp."})
			s.SourceIDs = append(s.SourceIDs, id)
		}
		id := "SOURCE-" + ch.ID + "-literal"
		p.Sources = append(p.Sources, ChatSource{ID: id, Kind: "authored text", Text: "Literal <script>neverExecute()</script> https://example.invalid\n{\"count\":0,\"value\":null}\nAbsent field: no supplied value.", Provenance: "Authored escaped text specimen; no URL action or retrieval."})
		s.SourceIDs = append(s.SourceIDs, id)
		for _, card := range c.Cards {
			if card.ChatID == ch.ID {
				a := ChatCardAppearance{CardID: card.ID, ActionIDs: []string{"inspect", "dismiss"}, Provenance: "Authored prior appearance; no recorded card response or timestamp."}
				if card.Kind == "parallax.prompt/v1" {
					a.QuestionID = "review-note"
				}
				s.Cards = append(s.Cards, a)
			}
		}
		for j := range s.Turns {
			s.Turns[j].Order = j
		}
		p.Sessions = append(p.Sessions, s)
	}
	p.Sessions = append(p.Sessions, ChatExampleSession{ID: "CHAT-AUTHORED-EMPTY", Title: "Empty review session", Kind: "authored empty", Group: "Authored specimens", Turns: []ChatTurn{}, InitialCount: 0, HistoryPageSize: 6, SourceIDs: []string{}, Cards: []ChatCardAppearance{}, PreviewChunks: []string{}})
	return p
}
func ValidateChatExample(p ChatExample, c Communications, o Scenario) error {
	if p.Version != "chat-example/v1" || p.Generator != "parallax/v9" || p.Seed != 4421 || p.Clock != "2026-10-04T14:30:00Z" || p.Projection != "snapshot" || p.Operations != (ChatIdentity{"operations/v2", "parallax/v2", "records-8", 4421, p.Clock}) || p.Communications != (ChatIdentity{"communications/v1", "parallax/v3", "", 4421, p.Clock}) || o.Version != p.Operations.Version || o.Generator != p.Operations.Generator || o.Profile != p.Operations.Profile || o.Seed != p.Seed || o.Clock != p.Clock || c.Version != p.Communications.Version || c.Generator != p.Communications.Generator || c.Seed != p.Seed || c.Clock != p.Clock {
		return fmt.Errorf("chat companion identity/projection mismatch")
	}
	if err := ValidateCommunications(c, o); err != nil {
		return err
	}
	if err := Validate(o); err != nil {
		return err
	}
	clock, _ := time.Parse(time.RFC3339, p.Clock)
	chats := map[string]ChatSession{}
	for _, x := range c.ChatSessions {
		chats[x.ID] = x
	}
	cards := map[string]InteractiveCard{}
	for _, x := range c.Cards {
		cards[x.ID] = x
	}
	msgs := map[string]Message{}
	for _, x := range o.Messages {
		msgs[x.ID] = x
	}
	sources := map[string]ChatSource{}
	for _, x := range p.Sources {
		if x.ID == "" || sources[x.ID].ID != "" || x.Provenance == "" {
			return fmt.Errorf("invalid source identity")
		}
		sources[x.ID] = x
	}
	seen := map[string]bool{}
	usedSources := map[string]bool{}
	seenChats := map[string]bool{}
	for _, s := range p.Sessions {
		if s.ID == "" || seen[s.ID] || s.Title == "" || s.Group == "" || s.HistoryPageSize < 1 || s.HistoryPageSize > 12 || s.InitialCount < 0 || s.InitialCount > len(s.Turns) || len(s.Turns) > 64 {
			return fmt.Errorf("invalid session/history bounds")
		}
		seen[s.ID] = true
		if s.Kind == "authored empty" {
			if s.ChatID != "" || len(s.Turns)+len(s.Cards)+len(s.SourceIDs)+len(s.PreviewChunks) != 0 {
				return fmt.Errorf("authored empty context invalid")
			}
			continue
		}
		ch, ok := chats[s.ChatID]
		if !ok || s.ID != ch.ID || seenChats[ch.ID] || s.Kind != "recorded context with authored history" {
			return fmt.Errorf("invalid chat context")
		}
		seenChats[ch.ID] = true
		referenced := map[string]bool{}
		last := time.Time{}
		recorded := false
		for ordinal, t := range s.Turns {
			if t.Order != ordinal {
				return fmt.Errorf("transcript order invalid")
			}
			if t.ID == "" || seen[t.ID] || t.Provenance == "" {
				return fmt.Errorf("invalid turn identity")
			}
			seen[t.ID] = true
			if t.Kind == "authored" {
				if recorded || t.MessageID != "" || t.Text == "" || (t.Role != "user" && t.Role != "assistant") || !strings.HasPrefix(t.ID, "AUTHORED-") {
					return fmt.Errorf("invalid authored turn/order")
				}
				continue
			}
			m, ok := msgs[t.MessageID]
			stamp, e := time.Parse(time.RFC3339, m.Time)
			if t.Kind != "recorded reference" || !ok || t.ID != m.ID || m.RunID != ch.RunID || m.SessionID != ch.SessionID || t.Role != "" || t.Text != "" || e != nil || stamp.Format(time.RFC3339) != m.Time || !strings.HasSuffix(m.Time, "Z") || stamp.After(clock) || stamp.Before(last) || referenced[m.ID] {
				return fmt.Errorf("invalid recorded message/order/time")
			}
			last = stamp
			recorded = true
			referenced[m.ID] = true
		}
		for _, m := range o.Messages {
			if m.RunID == ch.RunID && m.SessionID == ch.SessionID && !referenced[m.ID] {
				return fmt.Errorf("missing recorded message")
			}
		}
		cardSeen := map[string]bool{}
		for _, a := range s.Cards {
			card, ok := cards[a.CardID]
			if !ok || card.ChatID != ch.ID || cardSeen[a.CardID] || a.Provenance == "" || len(a.ActionIDs) != 2 || a.ActionIDs[0] != "inspect" || a.ActionIDs[1] != "dismiss" || (card.Kind == "parallax.prompt/v1" && a.QuestionID != "review-note") || (card.Kind != "parallax.prompt/v1" && a.QuestionID != "") {
				return fmt.Errorf("invalid card annotation")
			}
			cardSeen[a.CardID] = true
		}
		for _, card := range c.Cards {
			if card.ChatID == ch.ID && !cardSeen[card.ID] {
				return fmt.Errorf("missing card annotation")
			}
		}
		for _, id := range s.SourceIDs {
			x, ok := sources[id]
			if !ok || usedSources[id] {
				return fmt.Errorf("missing/duplicate source")
			}
			usedSources[id] = true
			valid := false
			switch x.Kind {
			case "attachment":
				for _, a := range c.Attachments {
					valid = valid || (a.ID == x.ReferenceID && a.ID == ch.AttachmentID && a.RunID == ch.RunID)
				}
			case "plan":
				valid = x.ReferenceID == ch.PlanID
			case "queue":
				valid = x.ReferenceID == ch.QueueID
			case "trace":
				for _, r := range o.Runs {
					valid = valid || (r.ID == ch.RunID && r.TraceID == x.ReferenceID)
				}
			case "tool":
				for _, t := range o.ToolCalls {
					if t.ID == x.ReferenceID && t.RunID == ch.RunID {
						for _, sp := range o.Spans {
							valid = valid || (sp.ID == t.SpanID && sp.TraceID == t.TraceID)
						}
					}
				}
			case "authored text":
				valid = x.ReferenceID == "" && x.Text != ""
			}
			if !valid || (x.Kind != "authored text" && x.Text != "") {
				return fmt.Errorf("cross-context source invalid")
			}
		}
		if len(s.PreviewChunks) > 8 {
			return fmt.Errorf("preview unbounded")
		}
		for _, x := range s.PreviewChunks {
			if x == "" {
				return fmt.Errorf("empty preview chunk")
			}
		}
	}
	if len(seenChats) != len(chats) || len(usedSources) != len(sources) {
		return fmt.Errorf("incomplete chat/source context")
	}
	return nil
}
func WriteChatExample(path string) error {
	p := GenerateChatExample()
	if e := ValidateChatExample(p, GenerateCommunications(), Generate()); e != nil {
		return e
	}
	b, e := json.MarshalIndent(p, "", "  ")
	if e != nil {
		return e
	}
	return os.WriteFile(path, append(b, '\n'), 0644)
}
