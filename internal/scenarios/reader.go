package scenarios

import (
	"encoding/json"
	"fmt"
	"os"
)

// Reader types match schema fe.reader.list.v1 and fe.reader.item.v1
type ReaderResolvedText struct {
	Value  string `json:"value"`
	Source string `json:"source"`
}

type ReaderSourceIdentity struct {
	Provider     string `json:"provider"`
	CanonicalURL string `json:"canonical_url,omitempty"`
	SubmittedURL string `json:"submitted_url,omitempty"`
}

type ReaderAssetVariant struct {
	AssetVariantID   string `json:"asset_variant_id"`
	Kind             string `json:"kind"`
	Custody          string `json:"custody"`
	AcquisitionState string `json:"acquisition_state"`
	MimeType         string `json:"mime_type,omitempty"`
	ContentHREF      string `json:"content_href,omitempty"`
	SourceURL        string `json:"source_url,omitempty"`
	DurationSeconds  *float64 `json:"duration_seconds,omitempty"`
}

type ReaderMediaAttachment struct {
	AttachmentID        string `json:"attachment_id"`
	FragmentRevisionID  string `json:"fragment_revision_id"`
	MediaAssetID        string `json:"media_asset_id"`
	Role                string `json:"role"`
	Position            int    `json:"position"`
	Caption             string `json:"caption,omitempty"`
}

type ReaderMediaItem struct {
	Attachment      ReaderMediaAttachment `json:"attachment"`
	MediaAssetID    string                `json:"media_asset_id"`
	ProviderMediaID string                `json:"provider_media_id,omitempty"`
	Kind            string                `json:"kind"`
	AltText         string                `json:"alt_text,omitempty"`
	Variants        []ReaderAssetVariant  `json:"variants"`
}

type ReaderPlayback struct {
	Kind           string  `json:"kind"`
	Provider       string  `json:"provider,omitempty"`
	ProviderItemID string  `json:"provider_item_id,omitempty"`
	StartSeconds   *float64 `json:"start_seconds,omitempty"`
}

type ReaderTagAttribution struct {
	Value         string `json:"value"`
	Source        string `json:"source"` // user, provider, deterministic, model
	ObservationID string `json:"observation_id,omitempty"`
}

type ReaderTags struct {
	Combined   []string               `json:"combined"`
	Attributed []ReaderTagAttribution `json:"attributed"`
}

type ReaderAnnotation struct {
	AnnotationID string `json:"annotation_id"`
	CaptureID    string `json:"capture_id"`
	Kind         string `json:"kind"` // highlight, capture_note
	Text         string `json:"text"`
	CapturedAt   string `json:"captured_at"`
}

type ReaderCuratedNote struct {
	BodyMarkdown string `json:"body_markdown"`
	Revision     int    `json:"revision"`
	UpdatedAt    string `json:"updated_at"`
}

type ReaderReadingPosition struct {
	Kind           string   `json:"kind"` // none, article, video, gallery, document, audio
	Progress       *float64 `json:"progress,omitempty"`
	BlockAnchor    string   `json:"block_anchor,omitempty"`
	LocalOffset    *int     `json:"local_offset,omitempty"`
	ElapsedSeconds *float64 `json:"elapsed_seconds,omitempty"`
	DurationSeconds *float64 `json:"duration_seconds,omitempty"`
	AttachmentID   string   `json:"attachment_id,omitempty"`
	Index          *int     `json:"index,omitempty"`
	Page           *int     `json:"page,omitempty"`
}

type ReaderReadingState struct {
	PrincipalID  string                `json:"principal_id"`
	FragmentID   string                `json:"fragment_id"`
	State        string                `json:"state"` // unread, in_progress, read
	Position     ReaderReadingPosition `json:"position"`
	LastOpenedAt string                `json:"last_opened_at,omitempty"`
	CompletedAt  string                `json:"completed_at,omitempty"`
	Revision     int                   `json:"revision"`
}

type ReaderTriageSummary struct {
	CaseIDs         []string `json:"case_ids"`
	UnresolvedCount int      `json:"unresolved_count"`
}

type ReaderEffectSummary struct {
	State      string   `json:"state"` // none, pending, partial, succeeded, failed
	References []string `json:"references"`
}

type ReaderCapabilityCoverage struct {
	Capability    string `json:"capability"`
	State         string `json:"state"` // provided, missing, pending, failed, stale, not_applicable
	ObservationID string `json:"observation_id,omitempty"`
	Detail        string `json:"detail,omitempty"`
}

type ReaderOperationalSummaries struct {
	Triage         ReaderTriageSummary                   `json:"triage"`
	Routing        ReaderEffectSummary                   `json:"routing"`
	Materialization ReaderEffectSummary                  `json:"materialization"`
	Enrichment     []ReaderCapabilityCoverage            `json:"enrichment"`
	Acquisition    map[string]int                        `json:"acquisition"` // pending, available, reference_only, failed
}

type ReaderCommandCapability struct {
	Command                  string `json:"command"`
	InputSchema              string `json:"input_schema"`
	ExpectedRevisionRequired bool   `json:"expected_revision_required"`
}

type ReaderArticle struct {
	PreviewMarkdown       string `json:"preview_markdown"`
	FullContentAvailable  bool   `json:"full_content_available"`
	FullContentHREF       string `json:"full_content_href,omitempty"`
}

type ReaderDisplay struct {
	Title        ReaderResolvedText  `json:"title"`
	Description  *ReaderResolvedText `json:"description,omitempty"`
	Byline       *ReaderResolvedText `json:"byline,omitempty"`
	PublishedAt  string              `json:"published_at,omitempty"`
	Summary      ReaderResolvedText  `json:"summary"`
}

type ReaderItem struct {
	SchemaVersion      string                     `json:"schema_version"`
	FragmentID         string                     `json:"fragment_id"`
	FragmentRevisionID string                     `json:"fragment_revision_id"`
	Revision           int                        `json:"revision"`
	Source             ReaderSourceIdentity       `json:"source"`
	Renderer           string                     `json:"renderer"` // article, image, gallery, video, audio, document, text, unknown
	Display            ReaderDisplay              `json:"display"`
	Article            ReaderArticle              `json:"article"`
	Media              []ReaderMediaItem          `json:"media"`
	Playback           *ReaderPlayback            `json:"playback,omitempty"`
	Tags               ReaderTags                 `json:"tags"`
	Annotations        []ReaderAnnotation         `json:"annotations"`
	CuratedNote        *ReaderCuratedNote         `json:"curated_note,omitempty"`
	CaptureCount       int                        `json:"capture_count"`
	ReadingState       ReaderReadingState         `json:"reading_state"`
	Operations         ReaderOperationalSummaries `json:"operations"`
	Actions            []ReaderCommandCapability  `json:"actions"`
}

type ReaderItemList struct {
	SchemaVersion string       `json:"schema_version"`
	Scope         string       `json:"scope"`
	Items         []ReaderItem `json:"items"`
	NextCursor    string       `json:"next_cursor,omitempty"`
}

type ReaderExampleFixture struct {
	Version        string         `json:"version"`
	Generator      string         `json:"generator"`
	Seed           uint64         `json:"seed"`
	ReferenceClock string         `json:"referenceClock"`
	Projection     string         `json:"projection"`
	InboxItems     []ReaderItem   `json:"inboxItems"`
	LibraryItems   []ReaderItem   `json:"libraryItems"`
	AllItems       []ReaderItem   `json:"allItems"`
	PageOneItems   []ReaderItem   `json:"pageOneItems"`
	PageTwoItems   []ReaderItem   `json:"pageTwoItems"`
	NextCursor     string         `json:"nextCursor"`
	Items          []ReaderItem   `json:"items"`
}

func defaultActions() []ReaderCommandCapability {
	cmds := []string{
		"add_tag",
		"remove_tag",
		"append_capture_note",
		"update_curated_note",
		"set_reading_progress",
		"mark_read",
		"mark_unread",
		"request_asset_acquisition",
		"route",
		"materialize",
	}
	out := make([]ReaderCommandCapability, len(cmds))
	for i, c := range cmds {
		out[i] = ReaderCommandCapability{
			Command:                  c,
			InputSchema:              fmt.Sprintf("fe.reader.command.%s.v1", c),
			ExpectedRevisionRequired: true,
		}
	}
	return out
}

func floatPtr(f float64) *float64 { return &f }
func intPtr(i int) *int             { return &i }

// SVG data URI generator for self-contained inert media
func svgDataURI(label, bg, fg string) string {
	svg := fmt.Sprintf(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="250" viewBox="0 0 400 250"><rect width="100%%" height="100%%" fill="%s"/><text x="50%%" y="50%%" dominant-baseline="middle" text-anchor="middle" font-family="system-ui, sans-serif" font-size="16" font-weight="600" fill="%s">%s</text></svg>`, bg, fg, label)
	return fmt.Sprintf("data:image/svg+xml;utf8,%s", svg)
}

func GenerateReaderExample() ReaderExampleFixture {
	refClock := "2026-10-04T14:30:00Z"
	const seed = uint64(4421)

	// 14 rich items covering all requirements
	items := make([]ReaderItem, 14)

	// Item 1: article (Inbox & Library)
	items[0] = ReaderItem{
		SchemaVersion:      "fe.reader.item.v1",
		FragmentID:         "FRAG-001",
		FragmentRevisionID: "REV-FRAG-001-01",
		Revision:           2,
		Source: ReaderSourceIdentity{
			Provider:     "web_clipper",
			CanonicalURL: "https://hollis-labs.com/research/content-memory",
			SubmittedURL: "https://hollis-labs.com/research/content-memory",
		},
		Renderer: "article",
		Display: ReaderDisplay{
			Title:       ReaderResolvedText{Value: "How Durable Content Memory Reshapes Knowledge Tools", Source: "source"},
			Description: &ReaderResolvedText{Value: "Exploration of local-first content memory architectures.", Source: "source"},
			Byline:      &ReaderResolvedText{Value: "Hollis Labs Research", Source: "provider"},
			PublishedAt: "2026-09-15T10:00:00Z",
			Summary:     ReaderResolvedText{Value: "An in-depth review of immutable content addressed memory models and deterministic offline replay patterns for knowledge work.", Source: "deterministic"},
		},
		Article: ReaderArticle{
			PreviewMarkdown:      "Durable content memory replaces ephemeral caching with deterministic records...",
			FullContentAvailable: true,
			FullContentHREF:      "/v1/reader/items/FRAG-001/content",
		},
		Media: []ReaderMediaItem{},
		Tags: ReaderTags{
			Combined: []string{"research", "architecture", "web"},
			Attributed: []ReaderTagAttribution{
				{Value: "research", Source: "user"},
				{Value: "architecture", Source: "model", ObservationID: "obs-001"},
				{Value: "web", Source: "deterministic"},
			},
		},
		Annotations: []ReaderAnnotation{
			{AnnotationID: "ann-001-1", CaptureID: "cap-001", Kind: "capture_note", Text: "Review section 3 carefully regarding offline replay.", CapturedAt: "2026-10-04T12:00:00Z"},
			{AnnotationID: "ann-001-2", CaptureID: "cap-001", Kind: "capture_note", Text: "Relevant to Tether message delivery guarantees.", CapturedAt: "2026-10-04T13:15:00Z"},
		},
		CuratedNote: &ReaderCuratedNote{
			BodyMarkdown: "Key reference for our ADR on local-first persistence guarantees.",
			Revision:     1,
			UpdatedAt:    "2026-10-04T14:00:00Z",
		},
		CaptureCount: 3,
		ReadingState: ReaderReadingState{
			PrincipalID: "user-chrispian",
			FragmentID:  "FRAG-001",
			State:       "unread",
			Position:    ReaderReadingPosition{Kind: "none"},
			Revision:    1,
		},
		Operations: ReaderOperationalSummaries{
			Triage:          ReaderTriageSummary{CaseIDs: []string{}, UnresolvedCount: 0},
			Routing:         ReaderEffectSummary{State: "succeeded", References: []string{"route-research"}},
			Materialization: ReaderEffectSummary{State: "succeeded", References: []string{"dest-archive"}},
			Enrichment: []ReaderCapabilityCoverage{
				{Capability: "title", State: "provided"},
				{Capability: "summary", State: "provided"},
				{Capability: "tags", State: "provided"},
			},
			Acquisition: map[string]int{"pending": 0, "available": 0, "reference_only": 0, "failed": 0},
		},
		Actions: defaultActions(),
	}

	// Item 2: image (Inbox & Library)
	imgURI := svgDataURI("Tether Agent Mesh Architecture", "%23242b35", "%2361afef")
	imgLargeURI := svgDataURI("Tether Agent Mesh Architecture (Detail)", "%231e2227", "%2398c379")
	items[1] = ReaderItem{
		SchemaVersion:      "fe.reader.item.v1",
		FragmentID:         "FRAG-002",
		FragmentRevisionID: "REV-FRAG-002-01",
		Revision:           1,
		Source: ReaderSourceIdentity{
			Provider:     "screenshot_intake",
			CanonicalURL: "https://nanite.cloud/docs/diagrams/mesh",
		},
		Renderer: "image",
		Display: ReaderDisplay{
			Title:       ReaderResolvedText{Value: "Architecture Diagram of Tether Agent Runtime and Meshed Bus Channels", Source: "source"},
			Description: &ReaderResolvedText{Value: "Topology diagram showing supervisor and task agent communication channels.", Source: "provider"},
			PublishedAt: "2026-09-20T14:22:00Z",
			Summary:     ReaderResolvedText{Value: "Captures routing topologies and cross-runtime mailbox channels between Claude, Codex, and Antigravity agents.", Source: "model"},
		},
		Article: ReaderArticle{PreviewMarkdown: "", FullContentAvailable: false},
		Media: []ReaderMediaItem{
			{
				Attachment:   ReaderMediaAttachment{AttachmentID: "att-002-1", FragmentRevisionID: "REV-FRAG-002-01", MediaAssetID: "asset-002-1", Role: "primary", Position: 0, Caption: "Tether Bus Diagram"},
				MediaAssetID: "asset-002-1",
				Kind:         "image",
				AltText:      "Tether bus diagram with agent nodes",
				Variants: []ReaderAssetVariant{
					{AssetVariantID: "var-002-preview", Kind: "preview", Custody: "mirror", AcquisitionState: "available", MimeType: "image/svg+xml", ContentHREF: imgURI},
					{AssetVariantID: "var-002-large", Kind: "large", Custody: "mirror", AcquisitionState: "available", MimeType: "image/svg+xml", ContentHREF: imgLargeURI},
				},
			},
		},
		Tags: ReaderTags{
			Combined: []string{"diagram", "mesh"},
			Attributed: []ReaderTagAttribution{
				{Value: "diagram", Source: "provider"},
				{Value: "mesh", Source: "model", ObservationID: "obs-002"},
			},
		},
		Annotations:  []ReaderAnnotation{},
		CaptureCount: 1,
		ReadingState: ReaderReadingState{
			PrincipalID:  "user-chrispian",
			FragmentID:   "FRAG-002",
			State:        "in_progress",
			Position:     ReaderReadingPosition{Kind: "none"},
			LastOpenedAt: "2026-10-04T13:45:00Z",
			Revision:     2,
		},
		Operations: ReaderOperationalSummaries{
			Triage:          ReaderTriageSummary{CaseIDs: []string{"triage-case-002"}, UnresolvedCount: 1},
			Routing:         ReaderEffectSummary{State: "pending", References: []string{"route-diagrams"}},
			Materialization: ReaderEffectSummary{State: "pending", References: []string{"dest-canvas"}},
			Enrichment: []ReaderCapabilityCoverage{
				{Capability: "vision", State: "pending"},
				{Capability: "OCR", State: "provided"},
			},
			Acquisition: map[string]int{"pending": 0, "available": 1, "reference_only": 0, "failed": 0},
		},
		Actions: defaultActions(),
	}

	// Item 3: gallery (Inbox & Library)
	gal1 := svgDataURI("Multi-Agent View 1: Task Dispatch", "%23282c34", "%23e06c75")
	gal2 := svgDataURI("Multi-Agent View 2: Coordination", "%2321252b", "%23e5c07b")
	gal3 := svgDataURI("Multi-Agent View 3: Execution Log", "%232c313a", "%2398c379")
	items[2] = ReaderItem{
		SchemaVersion:      "fe.reader.item.v1",
		FragmentID:         "FRAG-003",
		FragmentRevisionID: "REV-FRAG-003-01",
		Revision:           3,
		Source: ReaderSourceIdentity{
			Provider:     "gallery_importer",
			CanonicalURL: "https://hollis-labs.com/gallery/agents",
		},
		Renderer: "gallery",
		Display: ReaderDisplay{
			Title:       ReaderResolvedText{Value: "Visual Progressions in Multi-Agent Collaborative Task Workspaces", Source: "source"},
			PublishedAt: "2026-09-28T09:15:00Z",
			Summary:     ReaderResolvedText{Value: "Three sequential interface captures showing task dispatch, supervisor coordination, and live review execution.", Source: "deterministic"},
		},
		Article: ReaderArticle{PreviewMarkdown: "Gallery captures of multi-agent UI progression.", FullContentAvailable: false},
		Media: []ReaderMediaItem{
			{
				Attachment:   ReaderMediaAttachment{AttachmentID: "att-003-1", FragmentRevisionID: "REV-FRAG-003-01", MediaAssetID: "asset-003-1", Role: "gallery_item", Position: 0, Caption: "Task Dispatch Panel"},
				MediaAssetID: "asset-003-1",
				Kind:         "image",
				AltText:      "Task dispatch panel",
				Variants: []ReaderAssetVariant{
					{AssetVariantID: "var-003-1-prev", Kind: "preview", Custody: "mirror", AcquisitionState: "available", ContentHREF: gal1},
				},
			},
			{
				Attachment:   ReaderMediaAttachment{AttachmentID: "att-003-2", FragmentRevisionID: "REV-FRAG-003-01", MediaAssetID: "asset-003-2", Role: "gallery_item", Position: 1, Caption: "Supervisor Coordination Grid"},
				MediaAssetID: "asset-003-2",
				Kind:         "image",
				AltText:      "Supervisor coordination grid",
				Variants: []ReaderAssetVariant{
					{AssetVariantID: "var-003-2-prev", Kind: "preview", Custody: "mirror", AcquisitionState: "available", ContentHREF: gal2},
				},
			},
			{
				Attachment:   ReaderMediaAttachment{AttachmentID: "att-003-3", FragmentRevisionID: "REV-FRAG-003-01", MediaAssetID: "asset-003-3", Role: "gallery_item", Position: 2, Caption: "Execution Review Board"},
				MediaAssetID: "asset-003-3",
				Kind:         "image",
				AltText:      "Execution review board",
				Variants: []ReaderAssetVariant{
					{AssetVariantID: "var-003-3-prev", Kind: "preview", Custody: "mirror", AcquisitionState: "available", ContentHREF: gal3},
				},
			},
		},
		Tags: ReaderTags{
			Combined: []string{"review", "gallery"},
			Attributed: []ReaderTagAttribution{
				{Value: "review", Source: "user"},
				{Value: "gallery", Source: "model"},
			},
		},
		Annotations:  []ReaderAnnotation{},
		CaptureCount: 2,
		ReadingState: ReaderReadingState{
			PrincipalID:  "user-chrispian",
			FragmentID:   "FRAG-003",
			State:        "read",
			Position:     ReaderReadingPosition{Kind: "gallery", AttachmentID: "att-003-2", Index: intPtr(1)},
			CompletedAt:  "2026-10-04T11:00:00Z",
			LastOpenedAt: "2026-10-04T10:55:00Z",
			Revision:     3,
		},
		Operations: ReaderOperationalSummaries{
			Triage:          ReaderTriageSummary{CaseIDs: []string{}, UnresolvedCount: 0},
			Routing:         ReaderEffectSummary{State: "succeeded", References: []string{"route-gallery"}},
			Materialization: ReaderEffectSummary{State: "none", References: []string{}},
			Enrichment: []ReaderCapabilityCoverage{
				{Capability: "gallery_manifest", State: "provided"},
				{Capability: "thumbnail_or_poster", State: "provided"},
			},
			Acquisition: map[string]int{"pending": 0, "available": 3, "reference_only": 0, "failed": 0},
		},
		Actions: defaultActions(),
	}

	// Item 4: video (Inbox & Library)
	vidPoster := svgDataURI("Video: Cross-Runtime Agent Handoffs", "%231a202c", "%23e2e8f0")
	items[3] = ReaderItem{
		SchemaVersion:      "fe.reader.item.v1",
		FragmentID:         "FRAG-004",
		FragmentRevisionID: "REV-FRAG-004-01",
		Revision:           1,
		Source: ReaderSourceIdentity{
			Provider:     "video_recorder",
			CanonicalURL: "https://youtube.com/watch?v=dQw4w9WgXcQ",
		},
		Renderer: "video",
		Display: ReaderDisplay{
			Title:       ReaderResolvedText{Value: "Demonstration of Cross-Runtime Agent Handoffs and Recovery", Source: "source"},
			PublishedAt: "2026-10-01T16:00:00Z",
			Summary:     ReaderResolvedText{Value: "Walkthrough of handoff protocol when an orchestrator detects a stuck task agent and safely migrates state.", Source: "deterministic"},
		},
		Article: ReaderArticle{PreviewMarkdown: "", FullContentAvailable: false},
		Media: []ReaderMediaItem{
			{
				Attachment:   ReaderMediaAttachment{AttachmentID: "att-004-1", FragmentRevisionID: "REV-FRAG-004-01", MediaAssetID: "asset-004-1", Role: "poster", Position: 0, Caption: "Video Presentation Poster"},
				MediaAssetID: "asset-004-1",
				Kind:         "video",
				AltText:      "Agent handoff demo video",
				Variants: []ReaderAssetVariant{
					{AssetVariantID: "var-004-poster", Kind: "poster", Custody: "mirror", AcquisitionState: "available", ContentHREF: vidPoster, DurationSeconds: floatPtr(480.0)},
				},
			},
		},
		Playback: &ReaderPlayback{
			Kind:           "provider_embed",
			Provider:       "youtube",
			ProviderItemID: "dQw4w9WgXcQ",
			StartSeconds:   floatPtr(142.5),
		},
		Tags: ReaderTags{
			Combined: []string{"demo", "video"},
			Attributed: []ReaderTagAttribution{
				{Value: "demo", Source: "user"},
				{Value: "video", Source: "deterministic"},
			},
		},
		Annotations:  []ReaderAnnotation{},
		CaptureCount: 1,
		ReadingState: ReaderReadingState{
			PrincipalID:  "user-chrispian",
			FragmentID:   "FRAG-004",
			State:        "in_progress",
			Position:     ReaderReadingPosition{Kind: "video", ElapsedSeconds: floatPtr(142.5), DurationSeconds: floatPtr(480.0)},
			LastOpenedAt: "2026-10-04T12:30:00Z",
			Revision:     2,
		},
		Operations: ReaderOperationalSummaries{
			Triage:          ReaderTriageSummary{CaseIDs: []string{}, UnresolvedCount: 0},
			Routing:         ReaderEffectSummary{State: "none", References: []string{}},
			Materialization: ReaderEffectSummary{State: "none", References: []string{}},
			Enrichment: []ReaderCapabilityCoverage{
				{Capability: "transcript", State: "provided"},
			},
			Acquisition: map[string]int{"pending": 0, "available": 1, "reference_only": 0, "failed": 0},
		},
		Actions: defaultActions(),
	}

	// Item 5: audio (Inbox & Library)
	items[4] = ReaderItem{
		SchemaVersion:      "fe.reader.item.v1",
		FragmentID:         "FRAG-005",
		FragmentRevisionID: "REV-FRAG-005-01",
		Revision:           1,
		Source: ReaderSourceIdentity{
			Provider:     "audio_feed",
			CanonicalURL: "https://hollis-labs.com/audio/voice-session-1",
		},
		Renderer: "audio",
		Display: ReaderDisplay{
			Title:       ReaderResolvedText{Value: "Voice Synthesis and Ambient Transcript Recording Session", Source: "source"},
			PublishedAt: "2026-10-02T11:00:00Z",
			Summary:     ReaderResolvedText{Value: "Audio clip testing voice synthesizer pacing and phonetic accuracy across technical jargon.", Source: "provider"},
		},
		Article: ReaderArticle{PreviewMarkdown: "Voice testing recording.", FullContentAvailable: false},
		Media: []ReaderMediaItem{
			{
				Attachment:   ReaderMediaAttachment{AttachmentID: "att-005-1", FragmentRevisionID: "REV-FRAG-005-01", MediaAssetID: "asset-005-1", Role: "primary", Position: 0},
				MediaAssetID: "asset-005-1",
				Kind:         "audio",
				Variants: []ReaderAssetVariant{
					{AssetVariantID: "var-005-audio", Kind: "original", Custody: "reference", AcquisitionState: "reference_only", DurationSeconds: floatPtr(310.0)},
				},
			},
		},
		Tags: ReaderTags{
			Combined: []string{"voice", "audio"},
			Attributed: []ReaderTagAttribution{
				{Value: "voice", Source: "model"},
				{Value: "audio", Source: "provider"},
			},
		},
		Annotations:  []ReaderAnnotation{},
		CaptureCount: 1,
		ReadingState: ReaderReadingState{
			PrincipalID:  "user-chrispian",
			FragmentID:   "FRAG-005",
			State:        "in_progress",
			Position:     ReaderReadingPosition{Kind: "audio", ElapsedSeconds: floatPtr(45.2), DurationSeconds: floatPtr(310.0)},
			LastOpenedAt: "2026-10-04T13:00:00Z",
			Revision:     1,
		},
		Operations: ReaderOperationalSummaries{
			Triage:          ReaderTriageSummary{CaseIDs: []string{"triage-case-005-a", "triage-case-005-b"}, UnresolvedCount: 2},
			Routing:         ReaderEffectSummary{State: "failed", References: []string{"route-audio-pod"}},
			Materialization: ReaderEffectSummary{State: "none", References: []string{}},
			Enrichment: []ReaderCapabilityCoverage{
				{Capability: "transcript", State: "missing"},
				{Capability: "OCR", State: "failed"},
			},
			Acquisition: map[string]int{"pending": 0, "available": 0, "reference_only": 1, "failed": 0},
		},
		Actions: defaultActions(),
	}

	// Item 6: document (Inbox & Library)
	items[5] = ReaderItem{
		SchemaVersion:      "fe.reader.item.v1",
		FragmentID:         "FRAG-006",
		FragmentRevisionID: "REV-FRAG-006-01",
		Revision:           1,
		Source: ReaderSourceIdentity{
			Provider:     "doc_scanner",
			CanonicalURL: "https://adr.internal/0052",
		},
		Renderer: "document",
		Display: ReaderDisplay{
			Title:       ReaderResolvedText{Value: "System Architecture Decision Record: ADR-0052 Local First Memory", Source: "source"},
			PublishedAt: "2026-09-30T17:00:00Z",
			Summary:     ReaderResolvedText{Value: "Architectural blueprint formalizing local-first content memory, vector embedding pipelines, and BM25 baseline fallbacks.", Source: "deterministic"},
		},
		Article: ReaderArticle{PreviewMarkdown: "ADR-0052: Local First Memory specification...", FullContentAvailable: true},
		Media: []ReaderMediaItem{
			{
				Attachment:   ReaderMediaAttachment{AttachmentID: "att-006-1", FragmentRevisionID: "REV-FRAG-006-01", MediaAssetID: "asset-006-1", Role: "primary", Position: 0},
				MediaAssetID: "asset-006-1",
				Kind:         "document",
				Variants: []ReaderAssetVariant{
					{AssetVariantID: "var-006-doc", Kind: "original", Custody: "mirror", AcquisitionState: "failed", SourceURL: "https://untrusted.internal/doc.pdf"},
				},
			},
		},
		Tags: ReaderTags{
			Combined: []string{"adr", "core"},
			Attributed: []ReaderTagAttribution{
				{Value: "adr", Source: "deterministic"},
				{Value: "core", Source: "user"},
			},
		},
		Annotations:  []ReaderAnnotation{},
		CaptureCount: 5,
		ReadingState: ReaderReadingState{
			PrincipalID: "user-chrispian",
			FragmentID:  "FRAG-006",
			State:       "unread",
			Position:    ReaderReadingPosition{Kind: "document", Page: intPtr(1), Progress: floatPtr(0.0)},
			Revision:    1,
		},
		Operations: ReaderOperationalSummaries{
			Triage:          ReaderTriageSummary{CaseIDs: []string{}, UnresolvedCount: 0},
			Routing:         ReaderEffectSummary{State: "partial", References: []string{"route-docs"}},
			Materialization: ReaderEffectSummary{State: "succeeded", References: []string{"dest-wiki"}},
			Enrichment: []ReaderCapabilityCoverage{
				{Capability: "OCR", State: "provided"},
				{Capability: "title", State: "provided"},
			},
			Acquisition: map[string]int{"pending": 0, "available": 0, "reference_only": 0, "failed": 1},
		},
		Actions: defaultActions(),
	}

	// Item 7: text (Library & All only)
	items[6] = ReaderItem{
		SchemaVersion:      "fe.reader.item.v1",
		FragmentID:         "FRAG-007",
		FragmentRevisionID: "REV-FRAG-007-01",
		Revision:           1,
		Source: ReaderSourceIdentity{
			Provider:     "sysop_collector",
			CanonicalURL: "https://logs.internal/session-881",
		},
		Renderer: "text",
		Display: ReaderDisplay{
			Title:       ReaderResolvedText{Value: "Raw Terminal Session Transcript and Exception Diagnostics Log", Source: "source"},
			PublishedAt: "2026-10-03T08:14:00Z",
			Summary:     ReaderResolvedText{Value: "Monitored stdout/stderr emission during Hadron cluster failure failover test.", Source: "deterministic"},
		},
		Article: ReaderArticle{
			PreviewMarkdown:      "2026-10-03 08:14:02 ERROR [hadron] cluster quorum unreachable\n2026-10-03 08:14:05 INFO failover triggered...",
			FullContentAvailable: true,
		},
		Media: []ReaderMediaItem{},
		Tags: ReaderTags{
			Combined: []string{"logs"},
			Attributed: []ReaderTagAttribution{
				{Value: "logs", Source: "deterministic"},
			},
		},
		Annotations:  []ReaderAnnotation{},
		CaptureCount: 1,
		ReadingState: ReaderReadingState{
			PrincipalID:  "user-chrispian",
			FragmentID:   "FRAG-007",
			State:        "read",
			Position:     ReaderReadingPosition{Kind: "none"},
			CompletedAt:  "2026-10-03T09:00:00Z",
			LastOpenedAt: "2026-10-03T08:50:00Z",
			Revision:     2,
		},
		Operations: ReaderOperationalSummaries{
			Triage:          ReaderTriageSummary{CaseIDs: []string{}, UnresolvedCount: 0},
			Routing:         ReaderEffectSummary{State: "succeeded", References: []string{"route-logs"}},
			Materialization: ReaderEffectSummary{State: "succeeded", References: []string{"dest-cold-storage"}},
			Enrichment:      []ReaderCapabilityCoverage{},
			Acquisition:     map[string]int{"pending": 0, "available": 0, "reference_only": 0, "failed": 0},
		},
		Actions: defaultActions(),
	}

	// Item 8: unknown renderer (Library & All only)
	items[7] = ReaderItem{
		SchemaVersion:      "fe.reader.item.v1",
		FragmentID:         "FRAG-008",
		FragmentRevisionID: "REV-FRAG-008-01",
		Revision:           1,
		Source: ReaderSourceIdentity{
			Provider:     "custom_sink",
			CanonicalURL: "https://sink.internal/raw-payload",
		},
		Renderer: "unknown",
		Display: ReaderDisplay{
			Title:       ReaderResolvedText{Value: "Unclassified Fragment Payload with Custom Content Schemas", Source: "source"},
			PublishedAt: "2026-10-03T19:30:00Z",
			Summary:     ReaderResolvedText{Value: "Custom blob ingested from downstream ingestion sensor before protocol negotiation.", Source: "provider"},
		},
		Article: ReaderArticle{PreviewMarkdown: "Binary/opaque stream content.", FullContentAvailable: false},
		Media:   []ReaderMediaItem{},
		Tags: ReaderTags{
			Combined: []string{"raw"},
			Attributed: []ReaderTagAttribution{
				{Value: "raw", Source: "provider"},
			},
		},
		Annotations:  []ReaderAnnotation{},
		CaptureCount: 1,
		ReadingState: ReaderReadingState{
			PrincipalID: "user-chrispian",
			FragmentID:  "FRAG-008",
			State:       "unread",
			Position:    ReaderReadingPosition{Kind: "none"},
			Revision:    1,
		},
		Operations: ReaderOperationalSummaries{
			Triage:          ReaderTriageSummary{CaseIDs: []string{"triage-case-008"}, UnresolvedCount: 1},
			Routing:         ReaderEffectSummary{State: "none", References: []string{}},
			Materialization: ReaderEffectSummary{State: "none", References: []string{}},
			Enrichment:      []ReaderCapabilityCoverage{},
			Acquisition:     map[string]int{"pending": 0, "available": 0, "reference_only": 0, "failed": 0},
		},
		Actions: defaultActions(),
	}

	// Item 9: Edge case - Long title (Library & All only)
	items[8] = ReaderItem{
		SchemaVersion:      "fe.reader.item.v1",
		FragmentID:         "FRAG-009",
		FragmentRevisionID: "REV-FRAG-009-01",
		Revision:           2,
		Source: ReaderSourceIdentity{
			Provider:     "academic_feed",
			CanonicalURL: "https://arxiv.org/abs/2610.99999",
		},
		Renderer: "article",
		Display: ReaderDisplay{
			Title:       ReaderResolvedText{Value: "Comprehensive Longitudinal Analysis of Autonomous Micro-Agents Operating Under Strict Isolation Boundaries Across Heterogeneous Operating Systems, Hardware Architectures, and Non-Standard Execution Environments with Bounded Telemetry", Source: "source"},
			PublishedAt: "2026-10-02T08:00:00Z",
			Summary:     ReaderResolvedText{Value: "Empirical benchmarks across thousands of hours of agent runtime executions assessing task completion rates and memory bounds.", Source: "deterministic"},
		},
		Article: ReaderArticle{PreviewMarkdown: "Abstract: We evaluate autonomous coding agent architectures...", FullContentAvailable: true},
		Media:   []ReaderMediaItem{},
		Tags: ReaderTags{
			Combined: []string{"ml", "long-form"},
			Attributed: []ReaderTagAttribution{
				{Value: "ml", Source: "model"},
				{Value: "long-form", Source: "user"},
			},
		},
		Annotations:  []ReaderAnnotation{},
		CaptureCount: 4,
		ReadingState: ReaderReadingState{
			PrincipalID:  "user-chrispian",
			FragmentID:   "FRAG-009",
			State:        "in_progress",
			Position:     ReaderReadingPosition{Kind: "article", Progress: floatPtr(0.85)},
			LastOpenedAt: "2026-10-04T12:00:00Z",
			Revision:     2,
		},
		Operations: ReaderOperationalSummaries{
			Triage:          ReaderTriageSummary{CaseIDs: []string{}, UnresolvedCount: 0},
			Routing:         ReaderEffectSummary{State: "succeeded", References: []string{"route-research"}},
			Materialization: ReaderEffectSummary{State: "succeeded", References: []string{"dest-archive"}},
			Enrichment: []ReaderCapabilityCoverage{
				{Capability: "title", State: "provided"},
				{Capability: "summary", State: "provided"},
			},
			Acquisition: map[string]int{"pending": 0, "available": 0, "reference_only": 0, "failed": 0},
		},
		Actions: defaultActions(),
	}

	// Item 10: Edge case - Empty summary (Library & All only)
	items[9] = ReaderItem{
		SchemaVersion:      "fe.reader.item.v1",
		FragmentID:         "FRAG-010",
		FragmentRevisionID: "REV-FRAG-010-01",
		Revision:           1,
		Source: ReaderSourceIdentity{
			Provider:     "quick_notes",
			CanonicalURL: "https://notes.internal/substrate",
		},
		Renderer: "article",
		Display: ReaderDisplay{
			Title:       ReaderResolvedText{Value: "Quick Note: Verification Steps for Substrate Migration", Source: "source"},
			PublishedAt: "2026-10-03T15:20:00Z",
			Summary:     ReaderResolvedText{Value: "", Source: "deterministic"}, // empty summary edge case!
		},
		Article: ReaderArticle{PreviewMarkdown: "Steps: 1. check monorepo, 2. build mesh...", FullContentAvailable: false},
		Media:   []ReaderMediaItem{},
		Tags: ReaderTags{
			Combined: []string{"substrate"},
			Attributed: []ReaderTagAttribution{
				{Value: "substrate", Source: "user"},
			},
		},
		Annotations:  []ReaderAnnotation{},
		CaptureCount: 1,
		ReadingState: ReaderReadingState{
			PrincipalID: "user-chrispian",
			FragmentID:  "FRAG-010",
			State:       "unread",
			Position:    ReaderReadingPosition{Kind: "none"},
			Revision:    1,
		},
		Operations: ReaderOperationalSummaries{
			Triage:          ReaderTriageSummary{CaseIDs: []string{}, UnresolvedCount: 0},
			Routing:         ReaderEffectSummary{State: "none", References: []string{}},
			Materialization: ReaderEffectSummary{State: "none", References: []string{}},
			Enrichment: []ReaderCapabilityCoverage{
				{Capability: "summary", State: "pending"},
			},
			Acquisition: map[string]int{"pending": 0, "available": 0, "reference_only": 0, "failed": 0},
		},
		Actions: defaultActions(),
	}

	// Item 11: Edge case - No source URL (Library & All only)
	items[10] = ReaderItem{
		SchemaVersion:      "fe.reader.item.v1",
		FragmentID:         "FRAG-011",
		FragmentRevisionID: "REV-FRAG-011-01",
		Revision:           1,
		Source: ReaderSourceIdentity{
			Provider:     "local_draft",
			CanonicalURL: "", // no source URL edge case!
			SubmittedURL: "",
		},
		Renderer: "article",
		Display: ReaderDisplay{
			Title:       ReaderResolvedText{Value: "Locally Staged Scratch Fragment Created During Disconnected Operation", Source: "source"},
			PublishedAt: "2026-10-04T08:45:00Z",
			Summary:     ReaderResolvedText{Value: "Scratch buffer created offline by worker node before upstream sync connection established.", Source: "deterministic"},
		},
		Article: ReaderArticle{PreviewMarkdown: "Drafting local thoughts without internet.", FullContentAvailable: false},
		Media:   []ReaderMediaItem{},
		Tags: ReaderTags{
			Combined: []string{"scratch"},
			Attributed: []ReaderTagAttribution{
				{Value: "scratch", Source: "user"},
			},
		},
		Annotations:  []ReaderAnnotation{},
		CaptureCount: 1,
		ReadingState: ReaderReadingState{
			PrincipalID: "user-chrispian",
			FragmentID:  "FRAG-011",
			State:       "unread",
			Position:    ReaderReadingPosition{Kind: "none"},
			Revision:    1,
		},
		Operations: ReaderOperationalSummaries{
			Triage:          ReaderTriageSummary{CaseIDs: []string{}, UnresolvedCount: 0},
			Routing:         ReaderEffectSummary{State: "none", References: []string{}},
			Materialization: ReaderEffectSummary{State: "none", References: []string{}},
			Enrichment: []ReaderCapabilityCoverage{
				{Capability: "title", State: "provided"},
			},
			Acquisition: map[string]int{"pending": 0, "available": 0, "reference_only": 0, "failed": 0},
		},
		Actions: defaultActions(),
	}

	// Item 12: Media edge case (pending variant, revision 3 curated note)
	items[11] = ReaderItem{
		SchemaVersion:      "fe.reader.item.v1",
		FragmentID:         "FRAG-012",
		FragmentRevisionID: "REV-FRAG-012-03",
		Revision:           4,
		Source: ReaderSourceIdentity{
			Provider:     "web_clipper",
			CanonicalURL: "https://clusters.org/infographic",
		},
		Renderer: "image",
		Display: ReaderDisplay{
			Title:       ReaderResolvedText{Value: "Captured Infographic: Energy Budgets of Decentralized Compute Clusters", Source: "source"},
			PublishedAt: "2026-09-25T13:00:00Z",
			Summary:     ReaderResolvedText{Value: "Comparative energy usage curves across varied cluster architectures and memory configurations.", Source: "provider"},
		},
		Article: ReaderArticle{PreviewMarkdown: "", FullContentAvailable: false},
		Media: []ReaderMediaItem{
			{
				Attachment:   ReaderMediaAttachment{AttachmentID: "att-012-1", FragmentRevisionID: "REV-FRAG-012-03", MediaAssetID: "asset-012-1", Role: "primary", Position: 0},
				MediaAssetID: "asset-012-1",
				Kind:         "image",
				AltText:      "Energy budget infographic",
				Variants: []ReaderAssetVariant{
					{AssetVariantID: "var-012-pending", Kind: "preview", Custody: "cache", AcquisitionState: "pending"},
				},
			},
		},
		Tags: ReaderTags{
			Combined: []string{"energy", "infographic"},
			Attributed: []ReaderTagAttribution{
				{Value: "energy", Source: "model"},
				{Value: "infographic", Source: "provider"},
			},
		},
		Annotations: []ReaderAnnotation{},
		CuratedNote: &ReaderCuratedNote{
			BodyMarkdown: "Needs re-verification against newest thermal sensor reports.",
			Revision:     3,
			UpdatedAt:    "2026-10-04T13:50:00Z",
		},
		CaptureCount: 2,
		ReadingState: ReaderReadingState{
			PrincipalID: "user-chrispian",
			FragmentID:  "FRAG-012",
			State:       "unread",
			Position:    ReaderReadingPosition{Kind: "none"},
			Revision:    1,
		},
		Operations: ReaderOperationalSummaries{
			Triage:          ReaderTriageSummary{CaseIDs: []string{"case-1", "case-2", "case-3"}, UnresolvedCount: 3},
			Routing:         ReaderEffectSummary{State: "failed", References: []string{"route-infographics"}},
			Materialization: ReaderEffectSummary{State: "failed", References: []string{"dest-reports"}},
			Enrichment: []ReaderCapabilityCoverage{
				{Capability: "OCR", State: "failed"},
				{Capability: "vision", State: "failed"},
			},
			Acquisition: map[string]int{"pending": 1, "available": 0, "reference_only": 0, "failed": 0},
		},
		Actions: defaultActions(),
	}

	// Item 13: Cursor pagination page 2 item
	items[12] = ReaderItem{
		SchemaVersion:      "fe.reader.item.v1",
		FragmentID:         "FRAG-013",
		FragmentRevisionID: "REV-FRAG-013-01",
		Revision:           1,
		Source: ReaderSourceIdentity{
			Provider:     "design_system",
			CanonicalURL: "https://parallax.design/wave-2",
		},
		Renderer: "article",
		Display: ReaderDisplay{
			Title:       ReaderResolvedText{Value: "Second Wave Architecture Proposals for Parallax Primitives", Source: "source"},
			PublishedAt: "2026-10-04T07:15:00Z",
			Summary:     ReaderResolvedText{Value: "Proposed component extractions for data-agnostic ops-list views and 2-column AppShell recipes.", Source: "deterministic"},
		},
		Article: ReaderArticle{PreviewMarkdown: "Wave 2 primitives discussion...", FullContentAvailable: true},
		Media:   []ReaderMediaItem{},
		Tags: ReaderTags{
			Combined: []string{"v2"},
			Attributed: []ReaderTagAttribution{
				{Value: "v2", Source: "user"},
			},
		},
		Annotations:  []ReaderAnnotation{},
		CaptureCount: 1,
		ReadingState: ReaderReadingState{
			PrincipalID:  "user-chrispian",
			FragmentID:   "FRAG-013",
			State:        "read",
			Position:     ReaderReadingPosition{Kind: "none"},
			CompletedAt:  "2026-10-04T08:00:00Z",
			LastOpenedAt: "2026-10-04T07:50:00Z",
			Revision:     2,
		},
		Operations: ReaderOperationalSummaries{
			Triage:          ReaderTriageSummary{CaseIDs: []string{}, UnresolvedCount: 0},
			Routing:         ReaderEffectSummary{State: "succeeded", References: []string{"route-primitives"}},
			Materialization: ReaderEffectSummary{State: "succeeded", References: []string{"dest-design-kit"}},
			Enrichment:      []ReaderCapabilityCoverage{},
			Acquisition:     map[string]int{"pending": 0, "available": 0, "reference_only": 0, "failed": 0},
		},
		Actions: defaultActions(),
	}

	// Item 14: Cursor pagination page 2 item
	items[13] = ReaderItem{
		SchemaVersion:      "fe.reader.item.v1",
		FragmentID:         "FRAG-014",
		FragmentRevisionID: "REV-FRAG-014-01",
		Revision:           1,
		Source: ReaderSourceIdentity{
			Provider:     "benchmarks",
			CanonicalURL: "https://perf.internal/dom-routing",
		},
		Renderer: "article",
		Display: ReaderDisplay{
			Title:       ReaderResolvedText{Value: "Benchmark Results for Low-Latency DOM Event Routing", Source: "source"},
			PublishedAt: "2026-10-04T09:30:00Z",
			Summary:     ReaderResolvedText{Value: "Benchmarking synthetic event bubbling versus native element pointer routing in dense list renderers.", Source: "deterministic"},
		},
		Article: ReaderArticle{PreviewMarkdown: "Performance numbers for virtual DOM event listeners...", FullContentAvailable: true},
		Media:   []ReaderMediaItem{},
		Tags: ReaderTags{
			Combined: []string{"benchmark"},
			Attributed: []ReaderTagAttribution{
				{Value: "benchmark", Source: "deterministic"},
			},
		},
		Annotations:  []ReaderAnnotation{},
		CaptureCount: 1,
		ReadingState: ReaderReadingState{
			PrincipalID: "user-chrispian",
			FragmentID:  "FRAG-014",
			State:       "unread",
			Position:    ReaderReadingPosition{Kind: "none"},
			Revision:    1,
		},
		Operations: ReaderOperationalSummaries{
			Triage:          ReaderTriageSummary{CaseIDs: []string{}, UnresolvedCount: 0},
			Routing:         ReaderEffectSummary{State: "succeeded", References: []string{"route-benchmarks"}},
			Materialization: ReaderEffectSummary{State: "succeeded", References: []string{"dest-archive"}},
			Enrichment:      []ReaderCapabilityCoverage{},
			Acquisition:     map[string]int{"pending": 0, "available": 0, "reference_only": 0, "failed": 0},
		},
		Actions: defaultActions(),
	}

	// Inbox is items 0..5 (6 items)
	inboxItems := items[0:6]
	// Page 1 is items 0..7 (8 items)
	pageOne := items[0:8]
	// Page 2 is items 8..13 (6 items)
	pageTwo := items[8:14]

	return ReaderExampleFixture{
		Version:        "fe.reader.list.v1",
		Generator:      "parallax/v10",
		Seed:           seed,
		ReferenceClock: refClock,
		Projection:     "snapshot",
		InboxItems:     inboxItems,
		LibraryItems:   items,
		AllItems:       items, // all equals library as confirmed
		PageOneItems:   pageOne,
		PageTwoItems:   pageTwo,
		NextCursor:     "cursor-page-2",
		Items:          items,
	}
}

func WriteReaderExample(path string) error {
	fixture := GenerateReaderExample()
	b, err := json.MarshalIndent(fixture, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(path, append(b, '\n'), 0644)
}
