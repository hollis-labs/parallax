# Nil shortcut registry and layered Escape ownership — CW-20261010-0090

Torque and Messaging exercise shared primitives in two existing idioms: task-board inspection and message-draft inspection. These are isolated local candidate proofs. Registry publication and application deployment remain separate work.

## Consumer ownership

Torque binds `/`, Mod+K and the 300ms Shift-Shift alias to its existing task filter. The caller supplies current source/access admission. Its own input consumes Escape and retains focus, including when empty. Task inspection uses its admitted loaded task order with explicit wrap navigation, a connected popup root, and source/selection admission. Closing inspection preserves the background query and returns focus to the admitted opener. After an external source reset, the current empty inspection shell remains dismissible; retired selection handles stay fenced.

Messaging uses the existing conversation search and message-draft inspector. Search clears before dismissal. The browser proof invokes a captured first inspector action successfully, reopens a replacement inspector, then invokes that same old action while the replacement remains open. A current Escape still closes the replacement.

Both controlled Base UI popups cancel the library's Escape close request and allow propagation to one window bubble coordinator. Native and React child handlers settle first. Registered innermost layers and active unregistered child overlays retain ownership. Closed popups in an exit animation release ownership, even while they retain layout. A popup root may connect after registration; dispatch still requires a connected current root.

## Shared contract

`useShortcut`, `useShiftShift`, `useQuickSearchShortcut` and `useLayeredEscape` keep native listeners current while each exposed handle captures its own committed frame and activation lease. Retained handles retire after replacement, access changes, layer retirement or unmount, including StrictMode effect replay. Modifier matching is exact; clock zero is a valid Shift tap origin. Composition lifetime and event diagnostics, editable/composite targets, scopes, admission and overlay ownership fence activation.

Focus return resolves only connected, visible, enabled targets accepted by caller admission, with an explicit caller fallback. Restoration reports actual focus success. Existing SearchInput defaults retain legacy clear-and-blur behavior; layered Escape behavior is opt-in. Existing useArrowNav consumers retain their defaults.

## Candidate and evidence

The tarball is `third_party/hollis-labs-design-components-0.4.0-cw0090.tgz`, pinned through the frontend file dependency. Its package metadata remains `0.4.0`; this unpublished candidate is not registry-equivalent to released 0.4.0. The adjacent provenance manifest records the exact source commit, package tree, archive SHA256 and every packed file's SHA256. `.scratch/recovery/installed-byte-map.json` checks those packed bytes against the installed package.

Kit package tests include the original independent manager reproductions, captured/current controls, delayed portal connection and closing-menu ownership. The package gate includes typecheck, complete component tests, build, lint and the repository design-rules gate. Consumer checks cover frontend typecheck/lint, CSS variables, optional imports and export coverage. Native Playwright acceptance covers shortcut registry, Torque keyboard ownership, Run Explorer and Evidence legacy behavior. Exact commands, failed and final logs, screenshots and executable isolated-port replay are retained in each worktree's `.scratch/recovery`.

Synthetic composition diagnostics demonstrate event admission, not hardware OS IME or physical touch behavior. These adapters add keyboard behavior to existing chrome; no new theme styling, transport, persistence or domain behavior is introduced. Downstream radial, fullscreen and full Nil example tasks are outside this change.
