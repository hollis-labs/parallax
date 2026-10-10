# Flux settings fixture composition

Current owner scope: Appearance (all themes/modes), Layout, Shortcuts and Permissions are the four local behavioral fixture pages. Profile, Preferences, Providers, Agents, Plugins and Observability are **inert fictional specimens**. Metadata navigation and public field presentation can be inspected; extra-page edit/save/cancel/reorder/install/configuration and worker callbacks refuse. No provider defaults, plugin policy, or expanded behavior is owner approved. No credentials, transport, publishing or deployment.

The wider local behavior recorded in historical commit bc03171 was superseded by exact PM steering 01a12567-d638-7e82-aba0-3c43d7412148, conveyed in manager message 01a12575-9f51-7d94-8478-86a22141fc44. Its interrupted native run (exit130, four passes) is retained as historical evidence, not current acceptance.

## Composition — CW-20261010-0095

`/?example=flux-settings#appearance` extends the settings-review and Administration
example family with four behavioral pages and six inert fictional specimen sections. Both existing examples
link here. The landed four-section `flux-settings.html` candidate, its stories,
scope decision and proposal remain available unchanged in scope. DEC-080 confirms
that narrower 0094 scope; it does not approve these wider visuals, provider
defaults or plugin policies. Owner visual approval remains **false**.

## Source and adaptations

The primary reference is the authored Flux tree
`232064c3a5eaa8e8d9e270d89d78df3ca81df231`, rather than Nanite's embedded copy.
The source map and retained source archive are in the author proof packet under
`.scratch/flux-composition`. The existing [fidelity mapping](flux-fidelity-spec.md)
continues to own token-role decisions.

| Flux source | Composition and explicit adaptation |
| --- | --- |
| `settings/SettingsPage.tsx` | You / AI / Extensions / System grouped links, breadcrumb, hash reload and history. Projects and other unassigned sections are omitted. Developer mode adds local read-only System Prompts and Inspector. |
| `settings/ProfilePanel.tsx` | Identity, email, timezone, language, theme preference, reduced motion and agent context use public scalar forms. Avatar is absent read-only metadata. Source debounce, editing, saves and uploads are withheld. No personal file reads. |
| `settings/PreferencesPanel.tsx` | Read-only fictional session/utility/display defaults and recorded provider fallback order. The opaque ID `0` remains a provider ID. Malformed or duplicate/unknown persisted IDs fall back with a source-labelled notice. Previously stored malformed specimen data can be inspected; no persistence or reorder writes occur. |
| `settings/appearance/{AppearancePanel,TokenEditor,ThemePreview}.tsx` | Reuses landed AppearanceSection and public theme tokens. Custom duplicate/edit/revert/save and live scoped preview stay local; specimen export never downloads. System mode resolves to the deterministic dark specimen palette. |
| `settings/LayoutPanel.tsx`, `settings/PermissionsPanel.tsx` | Reuses landed LayoutSection and PermissionsSection for guarded local fixture previews. No persisted layout, authorization or live tool grants. |
| `settings/ShortcutsPanel.tsx` | Reuses landed ShortcutsSection with additional committed row/section admission. Capture is limited to the exact recording button; native Save Enter, Cancel Space and Tab remain available. Plugin shortcut rows stay read-only. |
| `settings/ProviderManager.tsx` | Status/detail list with enabled, disabled, credential presence and zero model count. Credential inputs and connectivity tests are omitted. Preview controls are disabled and callbacks refuse. |
| `settings/AgentProfileManager.tsx`, `settings/agents/AgentDetailView.tsx` | Metadata master-detail inspection with managed/file sources, model, skills and prompt specimens. Agent fields use the same public settings form; no full agent builder or live agent mutation. |
| `settings/{PluginManager,PluginDetailView,PluginConfigPanel}.tsx` | Active/disabled manager/detail/config, disabled install/reload preview. Scalar config preserves zero, false, absent directory and read-only secret presence. No imports, packages, plugin slots or lifecycle receipts. |
| `settings/observability/{ObservabilityDashboard,KPIRow,DurationChart,ProviderDistributionChart,WorkerStatusPanel}.tsx` | Fixed-clock KPI row, labelled duration/distribution bars and worker/execution tables. Semantic status tokens replace source chart paint. Counts/durations/costs can be zero; absent and explicitly empty worktree metadata remain distinct. Cancellation controls are disabled and callbacks refuse. |

Profiles and manager configuration are deliberately schema-driven rather than
transplants of the app-bound Flux stores. `SettingsGroupForm`, `SettingsRenderer`,
`SettingsProvenanceRenderer` and the historical `SettingsWizard` import come from the landed public
`kit-settings@0.2.0` contract. Setup preview is withheld on all inert extra pages; no configuration or installation plan is completed. Desired
settings do not imply observation status. This adds no shared-kit fork or repack.
Existing grouped-shell/manager/key-capture/token-editor gaps remain local
composition candidates under the [0094 proposal](flux-settings-proposal.md).

## Fixture and lifetime boundaries

Seed **4421**, clock **2026-10-04T14:30:00Z**. Fictional Local Studio before Cloud
Atlas is an authored example order, not a provider recommendation. Notebook is an
active plugin specimen and Inspector is disabled; neither is actual plugin
management. No API, network transport, model dispatch, credential collection,
wall-clock polling, upload or live Flux adoption is implemented.

Every local callback checks its current committed frame and activation, connected
root, source, access and layer. Source replacement retires drafts. Activity
hide/show unsubscribes the committed lifetime; callbacks from before hiding do
not revive. Visible competing dialog/menu/listbox layers veto actions; closed
ancestor markers do not create a competing layer. Recording checks IME/229 before
consuming or cancelling, and ordinary editable composing updates remain usable.

Navigation's delayed heading focus checks the same published lifetime and exact
foreground ownership. New plain or portaled foreground focus wins. No broad
closing-popup ancestor exemption exists. Keyboard navigation retains row/link
focus. Review controls collapse by default, and the example owns a scrollable
viewport for 390px and short 420px layouts. Public token palettes and isolated
system fallback fonts define its presentation.

## Reproduction and evidence

`frontend/playwright.flux-composition.config.ts` defaults to the actual repository
Vite server on **18975**. Its explicit remote override is
`FLUX_COMPOSITION_BASE_URL`; no alternate fixture implementation is selected.
`FLUX_COMPOSITION_RUN` gives each run independent logs/screens/traces. The author
owns **18971** Go, **18972** Storybook and **18975** Vite exclusively.

Run the repository gate through `heavytest`, then build Storybook and regenerate
the existing actionable export inventory. The author packet retains original
builds, a complete source archive (all HTML entries and fixtures), address-only
native-stage overrides, exact lock/archive/emitted/installed maps, raw failures
and settled native screenshots. The retained dependency cache is not a fresh
network-install claim. The packet's pinned stage recipe is the cheap replay path.

Native specs cover navigation/history, inert public presentation and callback refusal,
confirmed Layout/Permissions reachability, capture/save/cancel,
once-working retired callbacks with fresh positives, Activity, access/layer/root
loss, actual overlay vetoes, delayed focus, malformed preference metadata, unavailable
views, and 1280/390/short-420 geometry. Synthetic composing events establish event
handling only; hardware IME, touch, live providers and assistive technology are
not claimed. Author native execution and independent manager source/receipt review
are separate evidence. Owner review in Parallax precedes any Flux adoption.
