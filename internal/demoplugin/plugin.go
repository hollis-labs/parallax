// Package demoplugin provides a real fixture-backed plugin using registry v2.
package demoplugin

import (
	"embed"
	"encoding/json"
	"github.com/hollis-labs/chimera/plugins"
	"github.com/hollis-labs/libs/plugin-mcp/plugin-sdk/registry"
)

//go:embed bundle.js
var assets embed.FS

func Delivery() (*plugins.Delivery, error) {
	body, err := assets.ReadFile("bundle.js")
	if err != nil {
		return nil, err
	}
	r := registry.NewResponse("parallax-fixture-host-v1", 1)
	for kind, region := range map[string]string{"widget": "operations.summary", "panel": "operations.detail"} {
		r.Kinds[kind] = registry.KindDescriptor{SchemaVersion: 1, MetadataSchema: json.RawMessage(`{}`), Representations: []registry.Representation{registry.Component}, Regions: []string{region}, RequiredCapabilities: []string{}}
		r.Regions[region] = registry.RegionDescriptor{Kinds: []string{kind}, Representations: []registry.Representation{registry.Component}, ContextSchema: json.RawMessage(`{}`), Ordering: "manifest"}
		export := "Summary"
		if kind == "panel" {
			export = "ProvenancePanel"
		}
		if err := r.Set(registry.Contribution{Status: registry.StatusAccepted, OwnerID: "ops", OwnerGeneration: "g1", LocalKey: kind, Kind: kind, SchemaVersion: 1, Representation: registry.Component, Metadata: json.RawMessage(`{"label":"Operations readiness"}`), Component: &registry.ComponentRef{Export: export, Region: region}}); err != nil {
			return nil, err
		}
	}
	descriptor := r.Kinds["widget"]
	descriptor.Regions = append(descriptor.Regions, "operations.modal")
	r.Kinds["widget"] = descriptor
	r.Regions["operations.modal"] = registry.RegionDescriptor{Kinds: []string{"widget"}, Representations: []registry.Representation{registry.Component}, ContextSchema: json.RawMessage(`{}`), Ordering: "manifest"}
	if err := r.Set(registry.Contribution{Status: registry.StatusAccepted, OwnerID: "ops", OwnerGeneration: "g1", LocalKey: "modal", Kind: "widget", SchemaVersion: 1, Representation: registry.Component, Metadata: json.RawMessage(`{"label":"Operations modal detail"}`), Component: &registry.ComponentRef{Export: "Detail", Region: "operations.modal"}}); err != nil {
		return nil, err
	}
	r.Kinds["slot"] = registry.KindDescriptor{SchemaVersion: 1, MetadataSchema: json.RawMessage(`{}`), Representations: []registry.Representation{registry.Declarative}, Regions: []string{"operations.toolbar"}, RequiredCapabilities: []string{}}
	r.Regions["operations.toolbar"] = registry.RegionDescriptor{Kinds: []string{"slot"}, Representations: []registry.Representation{registry.Declarative}, ContextSchema: json.RawMessage(`{}`), Ordering: "manifest"}
	for key, label := range map[string]string{"navigate-usage": "Open Usage through plugin action", "inspect-detail": "Inspect plugin detail", "simulate-review": "Simulate plugin review"} {
		metadata, _ := json.Marshal(map[string]string{"label": label})
		if err := r.Set(registry.Contribution{Status: registry.StatusAccepted, OwnerID: "ops", OwnerGeneration: "g1", LocalKey: key, Kind: "slot", SchemaVersion: 1, Representation: registry.Declarative, Declarative: json.RawMessage(`{}`), Metadata: metadata}); err != nil {
			return nil, err
		}
	}
	r.Kinds["command"] = registry.KindDescriptor{SchemaVersion: 1, MetadataSchema: json.RawMessage(`{}`), Representations: []registry.Representation{registry.Handler}, Regions: []string{"operations.commands"}, RequiredCapabilities: []string{}}
	r.Regions["operations.commands"] = registry.RegionDescriptor{Kinds: []string{"command"}, Representations: []registry.Representation{registry.Handler}, ContextSchema: json.RawMessage(`{}`), Ordering: "manifest"}
	if err := r.Set(registry.Contribution{Status: registry.StatusAccepted, OwnerID: "ops", OwnerGeneration: "g1", LocalKey: "review", Kind: "command", SchemaVersion: 1, Representation: registry.Handler, Metadata: json.RawMessage(`{"label":"Fixture review simulation"}`), Handler: &registry.HandlerRef{ID: "fixture-simulation"}}); err != nil {
		return nil, err
	}
	r.Plugins["ops"] = registry.Plugin{OwnerGeneration: "g1", BundleURL: "/plugins/ops/g1/bundle.js", BundleVersion: registry.BundleDigest(body), Runtime: []registry.Runtime{{Name: "react", Min: "19.0.0", Max: "20.0.0"}}}
	return plugins.NewDelivery(r, map[string]plugins.Bundle{"ops": {JavaScript: body}}, map[string]string{"react": "19.3.0"})
}
