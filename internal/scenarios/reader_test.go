package scenarios

import (
	"strings"
	"testing"
)

func TestGenerateReaderExample(t *testing.T) {
	fixture := GenerateReaderExample()

	if fixture.Seed != 4421 {
		t.Fatalf("expected seed 4421, got %d", fixture.Seed)
	}
	if fixture.ReferenceClock != "2026-10-04T14:30:00Z" {
		t.Fatalf("expected reference clock 2026-10-04T14:30:00Z, got %s", fixture.ReferenceClock)
	}
	if fixture.Version != "fe.reader.list.v1" {
		t.Fatalf("expected version fe.reader.list.v1, got %s", fixture.Version)
	}
	if fixture.Generator != "parallax/v10" {
		t.Fatalf("expected generator parallax/v10, got %s", fixture.Generator)
	}

	if len(fixture.Items) < 12 {
		t.Fatalf("expected at least 12 records, got %d", len(fixture.Items))
	}

	// Verify all 8 renderers
	requiredRenderers := []string{"article", "image", "gallery", "video", "audio", "document", "text", "unknown"}
	foundRenderers := make(map[string]bool)
	for _, item := range fixture.Items {
		foundRenderers[item.Renderer] = true
	}
	for _, r := range requiredRenderers {
		if !foundRenderers[r] {
			t.Errorf("missing required renderer: %s", r)
		}
	}

	// Verify operations tones
	hasTriageAttention := false
	hasTriageClear := false
	routingStates := make(map[string]bool)
	materializationStates := make(map[string]bool)
	enrichmentStates := make(map[string]bool)
	mediaStates := make(map[string]bool)

	for _, item := range fixture.Items {
		if item.Operations.Triage.UnresolvedCount > 0 {
			hasTriageAttention = true
		} else {
			hasTriageClear = true
		}
		routingStates[item.Operations.Routing.State] = true
		materializationStates[item.Operations.Materialization.State] = true
		for _, cov := range item.Operations.Enrichment {
			enrichmentStates[cov.State] = true
		}
		for state, count := range item.Operations.Acquisition {
			if count > 0 {
				mediaStates[state] = true
			}
		}
	}

	if !hasTriageAttention || !hasTriageClear {
		t.Errorf("triage operations states not fully covered: attention=%v, clear=%v", hasTriageAttention, hasTriageClear)
	}
	for _, expected := range []string{"none", "pending", "succeeded", "failed"} {
		if !routingStates[expected] {
			t.Errorf("routing state %s not covered", expected)
		}
	}
	for _, expected := range []string{"none", "pending", "succeeded"} {
		if !materializationStates[expected] {
			t.Errorf("materialization state %s not covered", expected)
		}
	}
	for _, expected := range []string{"provided", "pending", "failed"} {
		if !enrichmentStates[expected] {
			t.Errorf("enrichment state %s not covered", expected)
		}
	}
	for _, expected := range []string{"available", "reference_only", "failed", "pending"} {
		if !mediaStates[expected] {
			t.Errorf("media state %s not covered", expected)
		}
	}

	// Verify reading states
	readingStates := make(map[string]bool)
	for _, item := range fixture.Items {
		readingStates[item.ReadingState.State] = true
	}
	for _, expected := range []string{"unread", "in_progress", "read"} {
		if !readingStates[expected] {
			t.Errorf("reading state %s not covered", expected)
		}
	}

	// Verify tag attribution sources
	tagSources := make(map[string]bool)
	for _, item := range fixture.Items {
		for _, tag := range item.Tags.Attributed {
			tagSources[tag.Source] = true
		}
	}
	for _, expected := range []string{"user", "provider", "deterministic", "model"} {
		if !tagSources[expected] {
			t.Errorf("tag source %s not covered", expected)
		}
	}

	// Verify notes
	hasCurated := false
	hasNoCurated := false
	hasCapture := false
	hasNoCapture := false
	for _, item := range fixture.Items {
		if item.CuratedNote != nil && item.CuratedNote.BodyMarkdown != "" {
			hasCurated = true
		} else {
			hasNoCurated = true
		}
		captureCount := 0
		for _, ann := range item.Annotations {
			if ann.Kind == "capture_note" {
				captureCount++
			}
		}
		if captureCount > 0 {
			hasCapture = true
		} else {
			hasNoCapture = true
		}
	}
	if !hasCurated || !hasNoCurated {
		t.Errorf("curated note coverage incomplete: hasCurated=%v, hasNoCurated=%v", hasCurated, hasNoCurated)
	}
	if !hasCapture || !hasNoCapture {
		t.Errorf("capture note coverage incomplete: hasCapture=%v, hasNoCapture=%v", hasCapture, hasNoCapture)
	}

	// Verify edge cases
	hasLongTitle := false
	hasEmptySummary := false
	hasNoSourceURL := false
	for _, item := range fixture.Items {
		if len(item.Display.Title.Value) > 120 {
			hasLongTitle = true
		}
		if item.Display.Summary.Value == "" {
			hasEmptySummary = true
		}
		if item.Source.CanonicalURL == "" && item.Source.SubmittedURL == "" {
			hasNoSourceURL = true
		}
	}
	if !hasLongTitle {
		t.Errorf("long title edge case missing")
	}
	if !hasEmptySummary {
		t.Errorf("empty summary edge case missing")
	}
	if !hasNoSourceURL {
		t.Errorf("no source URL edge case missing")
	}

	// Verify scope parity
	if len(fixture.InboxItems) >= len(fixture.LibraryItems) {
		t.Errorf("inbox items should be a strict subset of library items: inbox=%d, library=%d", len(fixture.InboxItems), len(fixture.LibraryItems))
	}
	if len(fixture.LibraryItems) != len(fixture.AllItems) {
		t.Errorf("library and all items should be identical: library=%d, all=%d", len(fixture.LibraryItems), len(fixture.AllItems))
	}

	// Verify media is self-contained SVG / data URI
	for _, item := range fixture.Items {
		for _, media := range item.Media {
			for _, variant := range media.Variants {
				if variant.ContentHREF != "" && !strings.HasPrefix(variant.ContentHREF, "data:image/svg+xml") {
					t.Errorf("expected SVG data URI for media variant content_href, got %s", variant.ContentHREF)
				}
			}
		}
	}

	// Verify 2-page pagination
	if len(fixture.PageOneItems) == 0 || len(fixture.PageTwoItems) == 0 {
		t.Errorf("expected two pages of items for pagination")
	}
	if fixture.NextCursor == "" {
		t.Errorf("expected non-empty nextCursor for page one")
	}
}
