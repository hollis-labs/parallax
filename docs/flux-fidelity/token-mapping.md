# Authored Flux token and scale mapping

Generated source inventory; proposals, not accepted defaults. See [spec](../flux-fidelity-spec.md) for F1–F7 decisions and contextual exceptions. JSON retains every source occurrence and file hash. Lexical extraction includes dormant UI and editor swatches; it does not assert render reachability.

| Source kind | Authored value / utility | Nearest kit token or scale | Default and rationale | Source occurrence |
|---|---|---|---|---|
| css---c-bg | #0c0d0e | bg | exact semantic role | src/index.css:132 |
| css---c-bg | #f4f5f6 | bg | exact semantic role | src/index.css:202 |
| css---c-bg-elevated | #16181a | bg-elevated | exact semantic role | src/index.css:133 |
| css---c-bg-elevated | #ffffff | bg-elevated | exact semantic role | src/index.css:203 |
| css---c-border | #25282c | border | exact semantic role | src/index.css:137 |
| css---c-border | #d0d4d8 | border | exact semantic role | src/index.css:207 |
| css---c-border-subtle | #1d1f22 | border-subtle | exact semantic role | src/index.css:138 |
| css---c-border-subtle | #e2e5e8 | border-subtle | exact semantic role | src/index.css:208 |
| css---c-brand | #c81828 | brand | exact semantic role | src/index.css:215 |
| css---c-brand | #d4202e | brand | exact semantic role | src/index.css:146 |
| css---c-brand-active | #97111d | brand-active | exact semantic role | src/index.css:217 |
| css---c-brand-active | #b61b28 | brand-active | exact semantic role | src/index.css:148 |
| css---c-brand-fg | #ffffff | brand-fg | exact semantic role | src/index.css:150, src/index.css:219 |
| css---c-brand-hover | #b01422 | brand-hover | exact semantic role | src/index.css:216 |
| css---c-brand-hover | #e13a46 | brand-hover | exact semantic role | src/index.css:147 |
| css---c-brand-muted | rgba(200, 24, 40, 0.07) | brand-muted | exact semantic role | src/index.css:218 |
| css---c-brand-muted | rgba(212, 32, 46, 0.14) | brand-muted | exact semantic role | src/index.css:149 |
| css---c-composer | #16181a | bg-elevated | F1: scoped theme on composer; nearest role, retain dark composer only if confirmed | src/index.css:189, src/index.css:257 |
| css---c-composer-active | #34383d | surface-active | F1: scoped theme on composer; nearest role, retain dark composer only if confirmed | src/index.css:197, src/index.css:265 |
| css---c-composer-bar | #131416 | bg | F1: scoped theme on composer; nearest role, retain dark composer only if confirmed | src/index.css:190, src/index.css:258 |
| css---c-composer-border | #25282c | border | F1: scoped theme on composer; nearest role, retain dark composer only if confirmed | src/index.css:191, src/index.css:259 |
| css---c-composer-border-focus | #34383d | ring | F1: scoped theme on composer; nearest role, retain dark composer only if confirmed | src/index.css:192, src/index.css:260 |
| css---c-composer-fg | #e8eaed | fg | F1: scoped theme on composer; nearest role, retain dark composer only if confirmed | src/index.css:193, src/index.css:261 |
| css---c-composer-fg-muted | #6c747c | fg-muted | F1: scoped theme on composer; nearest role, retain dark composer only if confirmed | src/index.css:195, src/index.css:263 |
| css---c-composer-fg-secondary | #98a0a8 | fg-secondary | F1: scoped theme on composer; nearest role, retain dark composer only if confirmed | src/index.css:194, src/index.css:262 |
| css---c-composer-hover | #25282c | surface-hover | F1: scoped theme on composer; nearest role, retain dark composer only if confirmed | src/index.css:196, src/index.css:264 |
| css---c-danger | #c81828 | danger | exact semantic role | src/index.css:227 |
| css---c-danger | #d4202e | danger | exact semantic role | src/index.css:159 |
| css---c-danger-fg | #ffffff | danger-fg | exact semantic role | src/index.css:162, src/index.css:230 |
| css---c-danger-hover | #b01422 | danger-hover | exact semantic role | src/index.css:228 |
| css---c-danger-hover | #e13a46 | danger-hover | exact semantic role | src/index.css:160 |
| css---c-danger-muted | rgba(200, 24, 40, 0.08) | danger-muted | exact semantic role | src/index.css:229 |
| css---c-danger-muted | rgba(212, 32, 46, 0.14) | danger-muted | exact semantic role | src/index.css:161 |
| css---c-divider | rgba(0, 0, 0, 0.07) | divider | exact semantic role | src/index.css:209 |
| css---c-divider | rgba(255, 255, 255, 0.06) | divider | exact semantic role | src/index.css:139 |
| css---c-fg | #18191b | fg | exact semantic role | src/index.css:210 |
| css---c-fg | #e8eaed | fg | exact semantic role | src/index.css:140 |
| css---c-fg-faint | #4a5058 | fg-faint | exact semantic role | src/index.css:143 |
| css---c-fg-faint | #98a0a8 | fg-faint | exact semantic role | src/index.css:213 |
| css---c-fg-muted | #6c747c | fg-muted | exact semantic role | src/index.css:142, src/index.css:212 |
| css---c-fg-secondary | #4a5058 | fg-secondary | exact semantic role | src/index.css:211 |
| css---c-fg-secondary | #98a0a8 | fg-secondary | exact semantic role | src/index.css:141 |
| css---c-info | #4a5058 | info | exact semantic role | src/index.css:232 |
| css---c-info | #98a0a8 | info | exact semantic role | src/index.css:164 |
| css---c-info-muted | rgba(152, 160, 168, 0.1) | info-muted | exact semantic role | src/index.css:165 |
| css---c-info-muted | rgba(74, 80, 88, 0.07) | info-muted | exact semantic role | src/index.css:233 |
| css---c-mode-architect | #57534e | fg-muted | F2: simplify to role + visible identity text; distinct hue needs reviewed theme idiom | src/index.css:248 |
| css---c-mode-architect | #78716c | fg-muted | F2: simplify to role + visible identity text; distinct hue needs reviewed theme idiom | src/index.css:180 |
| css---c-mode-default | #475569 | fg-secondary | F2: simplify to role + visible identity text; distinct hue needs reviewed theme idiom | src/index.css:247 |
| css---c-mode-default | #64748b | fg-secondary | F2: simplify to role + visible identity text; distinct hue needs reviewed theme idiom | src/index.css:179 |
| css---c-mode-planner | #6366b8 | info | F2: simplify to role + visible identity text; distinct hue needs reviewed theme idiom | src/index.css:249 |
| css---c-mode-planner | #7c7bd1 | info | F2: simplify to role + visible identity text; distinct hue needs reviewed theme idiom | src/index.css:181 |
| css---c-mode-writer | #8a6d4a | warning | F2: simplify to role + visible identity text; distinct hue needs reviewed theme idiom | src/index.css:250 |
| css---c-mode-writer | #a78b5e | warning | F2: simplify to role + visible identity text; distinct hue needs reviewed theme idiom | src/index.css:182 |
| css---c-primary | #18191b | primary | exact semantic role | src/index.css:221 |
| css---c-primary | #e8eaed | primary | exact semantic role | src/index.css:153 |
| css---c-primary-active | #2a2c30 | primary-active | exact semantic role | src/index.css:223 |
| css---c-primary-active | #cfd4d8 | primary-active | exact semantic role | src/index.css:155 |
| css---c-primary-fg | #0c0d0e | primary-fg | exact semantic role | src/index.css:157 |
| css---c-primary-fg | #ffffff | primary-fg | exact semantic role | src/index.css:225 |
| css---c-primary-hover | #000000 | primary-hover | exact semantic role | src/index.css:222 |
| css---c-primary-hover | #ffffff | primary-hover | exact semantic role | src/index.css:154 |
| css---c-primary-muted | rgba(232, 234, 237, 0.1) | primary-muted | exact semantic role | src/index.css:156 |
| css---c-primary-muted | rgba(24, 25, 27, 0.07) | primary-muted | exact semantic role | src/index.css:224 |
| css---c-selection | rgba(0, 0, 0, 0.06) | selection | exact semantic role | src/index.css:243 |
| css---c-selection | rgba(255, 255, 255, 0.08) | selection | exact semantic role | src/index.css:175 |
| css---c-selection-fg | var(--c-fg) | selection-fg | exact semantic role | src/index.css:176, src/index.css:244 |
| css---c-status-danger | #a05050 | danger | Flux alias resolves by source role; accent means brand here | src/index.css:254 |
| css---c-status-danger | #c07070 | danger | Flux alias resolves by source role; accent means brand here | src/index.css:186 |
| css---c-status-ok | #4a7a65 | success | Flux alias resolves by source role; accent means brand here | src/index.css:252 |
| css---c-status-ok | #6b9e8a | success | Flux alias resolves by source role; accent means brand here | src/index.css:184 |
| css---c-status-warn | #8a6d3e | warning | Flux alias resolves by source role; accent means brand here | src/index.css:253 |
| css---c-status-warn | #b09060 | warning | Flux alias resolves by source role; accent means brand here | src/index.css:185 |
| css---c-success | #4a5058 | success | exact semantic role | src/index.css:235 |
| css---c-success | #c0c4c8 | success | exact semantic role | src/index.css:167 |
| css---c-success-fg | #ffffff | success-fg | exact semantic role | src/index.css:169, src/index.css:237 |
| css---c-success-muted | rgba(192, 196, 200, 0.1) | success-muted | exact semantic role | src/index.css:168 |
| css---c-success-muted | rgba(74, 80, 88, 0.08) | success-muted | exact semantic role | src/index.css:236 |
| css---c-surface | #25282c | surface | exact semantic role | src/index.css:134 |
| css---c-surface | #dde0e3 | surface | exact semantic role | src/index.css:204 |
| css---c-surface-active | #4a5058 | surface-active | exact semantic role | src/index.css:136 |
| css---c-surface-active | #c2c7cc | surface-active | exact semantic role | src/index.css:206 |
| css---c-surface-hover | #34383d | surface-hover | exact semantic role | src/index.css:135 |
| css---c-surface-hover | #d0d4d8 | surface-hover | exact semantic role | src/index.css:205 |
| css---c-warning | #c81828 | warning | exact semantic role | src/index.css:239 |
| css---c-warning | #d4202e | warning | exact semantic role | src/index.css:171 |
| css---c-warning-muted | rgba(200, 24, 40, 0.07) | warning-muted | exact semantic role | src/index.css:240 |
| css---c-warning-muted | rgba(212, 32, 46, 0.12) | warning-muted | exact semantic role | src/index.css:172 |
| css---color-accent | var(--c-brand) | brand | Flux alias resolves by source role; accent means brand here | src/index.css:92 |
| css---color-accent-active | var(--c-brand-active) | brand-active | Flux alias resolves by source role; accent means brand here | src/index.css:94 |
| css---color-accent-fg | var(--c-brand-fg) | brand-fg | Flux alias resolves by source role; accent means brand here | src/index.css:96 |
| css---color-accent-hover | var(--c-brand-hover) | brand-hover | Flux alias resolves by source role; accent means brand here | src/index.css:93 |
| css---color-accent-muted | var(--c-brand-muted) | brand-muted | Flux alias resolves by source role; accent means brand here | src/index.css:95 |
| css---color-background | var(--c-bg) | bg | Flux alias resolves by source role; accent means brand here | src/index.css:112 |
| css---color-bg | var(--c-bg) | bg | exact semantic role | src/index.css:25 |
| css---color-bg-elevated | var(--c-bg-elevated) | bg-elevated | exact semantic role | src/index.css:26 |
| css---color-border | var(--c-border) | border | exact semantic role | src/index.css:30 |
| css---color-border-subtle | var(--c-border-subtle) | border-subtle | exact semantic role | src/index.css:31 |
| css---color-brand | var(--c-brand) | brand | exact semantic role | src/index.css:39 |
| css---color-brand-active | var(--c-brand-active) | brand-active | exact semantic role | src/index.css:41 |
| css---color-brand-fg | var(--c-brand-fg) | brand-fg | exact semantic role | src/index.css:43 |
| css---color-brand-hover | var(--c-brand-hover) | brand-hover | exact semantic role | src/index.css:40 |
| css---color-brand-muted | var(--c-brand-muted) | brand-muted | exact semantic role | src/index.css:42 |
| css---color-card | var(--c-bg-elevated) | bg-elevated | Flux alias resolves by source role; accent means brand here | src/index.css:103 |
| css---color-card-foreground | var(--c-fg) | fg | Flux alias resolves by source role; accent means brand here | src/index.css:104 |
| css---color-composer | var(--c-composer) | bg-elevated | F1: scoped theme on composer; nearest role, retain dark composer only if confirmed | src/index.css:116 |
| css---color-composer-active | var(--c-composer-active) | surface-active | F1: scoped theme on composer; nearest role, retain dark composer only if confirmed | src/index.css:124 |
| css---color-composer-bar | var(--c-composer-bar) | bg | F1: scoped theme on composer; nearest role, retain dark composer only if confirmed | src/index.css:117 |
| css---color-composer-border | var(--c-composer-border) | border | F1: scoped theme on composer; nearest role, retain dark composer only if confirmed | src/index.css:118 |
| css---color-composer-border-focus | var(--c-composer-border-focus) | ring | F1: scoped theme on composer; nearest role, retain dark composer only if confirmed | src/index.css:119 |
| css---color-composer-fg | var(--c-composer-fg) | fg | F1: scoped theme on composer; nearest role, retain dark composer only if confirmed | src/index.css:120 |
| css---color-composer-fg-muted | var(--c-composer-fg-muted) | fg-muted | F1: scoped theme on composer; nearest role, retain dark composer only if confirmed | src/index.css:122 |
| css---color-composer-fg-secondary | var(--c-composer-fg-secondary) | fg-secondary | F1: scoped theme on composer; nearest role, retain dark composer only if confirmed | src/index.css:121 |
| css---color-composer-hover | var(--c-composer-hover) | surface-hover | F1: scoped theme on composer; nearest role, retain dark composer only if confirmed | src/index.css:123 |
| css---color-danger | var(--c-danger) | danger | exact semantic role | src/index.css:51 |
| css---color-danger-fg | var(--c-danger-fg) | danger-fg | exact semantic role | src/index.css:54 |
| css---color-danger-hover | var(--c-danger-hover) | danger-hover | exact semantic role | src/index.css:52 |
| css---color-danger-muted | var(--c-danger-muted) | danger-muted | exact semantic role | src/index.css:53 |
| css---color-destructive | var(--c-danger) | danger | Flux alias resolves by source role; accent means brand here | src/index.css:109 |
| css---color-destructive-foreground | var(--c-danger-fg) | danger-fg | Flux alias resolves by source role; accent means brand here | src/index.css:110 |
| css---color-divider | var(--c-divider) | divider | exact semantic role | src/index.css:32 |
| css---color-fg | var(--c-fg) | fg | exact semantic role | src/index.css:33 |
| css---color-fg-faint | var(--c-fg-faint) | fg-faint | exact semantic role | src/index.css:36 |
| css---color-fg-muted | var(--c-fg-muted) | fg-muted | exact semantic role | src/index.css:35 |
| css---color-fg-secondary | var(--c-fg-secondary) | fg-secondary | exact semantic role | src/index.css:34 |
| css---color-foreground | var(--c-fg) | fg | Flux alias resolves by source role; accent means brand here | src/index.css:113 |
| css---color-info | var(--c-info) | info | exact semantic role | src/index.css:57 |
| css---color-info-muted | var(--c-info-muted) | info-muted | exact semantic role | src/index.css:58 |
| css---color-input | var(--c-border-subtle) | border-subtle | Flux alias resolves by source role; accent means brand here | src/index.css:111 |
| css---color-mode-architect | var(--c-mode-architect) | fg-muted | F2: simplify to role + visible identity text; distinct hue needs reviewed theme idiom | src/index.css:75 |
| css---color-mode-default | var(--c-mode-default) | fg-secondary | F2: simplify to role + visible identity text; distinct hue needs reviewed theme idiom | src/index.css:74 |
| css---color-mode-planner | var(--c-mode-planner) | info | F2: simplify to role + visible identity text; distinct hue needs reviewed theme idiom | src/index.css:76 |
| css---color-mode-writer | var(--c-mode-writer) | warning | F2: simplify to role + visible identity text; distinct hue needs reviewed theme idiom | src/index.css:77 |
| css---color-muted | var(--c-surface) | surface | Flux alias resolves by source role; accent means brand here | src/index.css:101 |
| css---color-muted-foreground | var(--c-fg-muted) | fg-muted | Flux alias resolves by source role; accent means brand here | src/index.css:102 |
| css---color-popover | var(--c-bg-elevated) | bg-elevated | Flux alias resolves by source role; accent means brand here | src/index.css:99 |
| css---color-popover-foreground | var(--c-fg) | fg | Flux alias resolves by source role; accent means brand here | src/index.css:100 |
| css---color-primary | var(--c-primary) | primary | exact semantic role | src/index.css:105 |
| css---color-primary-active | var(--c-primary-active) | primary-active | exact semantic role | src/index.css:47 |
| css---color-primary-foreground | var(--c-primary-fg) | primary-fg | Flux alias resolves by source role; accent means brand here | src/index.css:106 |
| css---color-primary-hover | var(--c-primary-hover) | primary-hover | exact semantic role | src/index.css:46 |
| css---color-primary-muted | var(--c-primary-muted) | primary-muted | exact semantic role | src/index.css:48 |
| css---color-ring | var(--c-primary) | ring | exact semantic role | src/index.css:85 |
| css---color-secondary | var(--c-surface) | surface | Flux alias resolves by source role; accent means brand here | src/index.css:107 |
| css---color-secondary-foreground | var(--c-fg) | fg | Flux alias resolves by source role; accent means brand here | src/index.css:108 |
| css---color-selection | var(--c-selection) | selection | exact semantic role | src/index.css:70 |
| css---color-selection-fg | var(--c-selection-fg) | selection-fg | exact semantic role | src/index.css:71 |
| css---color-status-danger | var(--c-status-danger) | danger | Flux alias resolves by source role; accent means brand here | src/index.css:82 |
| css---color-status-ok | var(--c-status-ok) | success | Flux alias resolves by source role; accent means brand here | src/index.css:80 |
| css---color-status-warn | var(--c-status-warn) | warning | Flux alias resolves by source role; accent means brand here | src/index.css:81 |
| css---color-success | var(--c-success) | success | exact semantic role | src/index.css:61 |
| css---color-success-fg | var(--c-success-fg) | success-fg | exact semantic role | src/index.css:63 |
| css---color-success-muted | var(--c-success-muted) | success-muted | exact semantic role | src/index.css:62 |
| css---color-surface | var(--c-surface) | surface | exact semantic role | src/index.css:27 |
| css---color-surface-active | var(--c-surface-active) | surface-active | exact semantic role | src/index.css:29 |
| css---color-surface-hover | var(--c-surface-hover) | surface-hover | exact semantic role | src/index.css:28 |
| css---color-toggle-on | var(--c-primary) | primary | Flux alias resolves by source role; accent means brand here | src/index.css:88 |
| css---color-warning | var(--c-warning) | warning | exact semantic role | src/index.css:66 |
| css---color-warning-muted | var(--c-warning-muted) | warning-muted | exact semantic role | src/index.css:67 |
| css---color-zinc-100 | #f4f4f5 | fg | F3: nearest neutral ladder role; choose by foreground/surface context | src/index.css:13 |
| css---color-zinc-200 | #e4e4e7 | fg | F3: nearest neutral ladder role; choose by foreground/surface context | src/index.css:14 |
| css---color-zinc-300 | #d4d4d8 | fg-secondary | F3: nearest neutral ladder role; choose by foreground/surface context | src/index.css:15 |
| css---color-zinc-400 | #a1a1aa | fg-secondary | F3: nearest neutral ladder role; choose by foreground/surface context | src/index.css:16 |
| css---color-zinc-50 | #fafafa | fg | F3: nearest neutral ladder role; choose by foreground/surface context | src/index.css:12 |
| css---color-zinc-500 | #71717a | fg-muted | F3: nearest neutral ladder role; choose by foreground/surface context | src/index.css:17 |
| css---color-zinc-600 | #52525b | fg-muted | F3: nearest neutral ladder role; choose by foreground/surface context | src/index.css:18 |
| css---color-zinc-700 | #3f3f46 | surface | F3: nearest neutral ladder role; choose by foreground/surface context | src/index.css:19 |
| css---color-zinc-800 | #27272a | surface | F3: nearest neutral ladder role; choose by foreground/surface context | src/index.css:20 |
| css---color-zinc-900 | #18181b | bg | F3: nearest neutral ladder role; choose by foreground/surface context | src/index.css:21 |
| css---color-zinc-950 | #09090b | bg | F3: nearest neutral ladder role; choose by foreground/surface context | src/index.css:22 |
| css---font-mono | var(--font-mono-family) | font-mono | F6: theme font stack override only; local font receipt or disclosed system fallback | src/index.css:9 |
| css---font-mono-family | "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace | font-mono | F6: theme font stack override only; local font receipt or disclosed system fallback | src/index.css:130 |
| css---font-sans | var(--font-ui) | font-sans | F6: theme font stack override only; local font receipt or disclosed system fallback | src/index.css:8 |
| css---font-ui | "Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif | font-sans | F6: theme font stack override only; local font receipt or disclosed system fallback | src/index.css:129 |
| css--moz-osx-font-smoothing | grayscale | preserve structural CSS / named inherited scale | layout/reset/animation or theme metadata, no new color/scale token | src/index.css:278 |
| css--ms-overflow-style | none | preserve structural CSS / named inherited scale | layout/reset/animation or theme metadata, no new color/scale token | src/index.css:298, src/index.css:340 |
| css--webkit-font-smoothing | antialiased | preserve structural CSS / named inherited scale | layout/reset/animation or theme metadata, no new color/scale token | src/index.css:277 |
| css-background | #ffffff | divider | F3/F7: nearest authored Concrete & Signal reference RGB (rgba(255, 255, 255, 0.06)); role overrides numeric proximity; alpha stays theme-owned | src/index.css:351 |
| css-background | rgba(0, 0, 0, 0.15) | primary-fg | F3/F7: nearest authored Concrete & Signal reference RGB (#000000); role overrides numeric proximity; alpha stays theme-owned | src/index.css:330 |
| css-background | rgba(0, 0, 0, 0.25) | primary-fg | F3/F7: nearest authored Concrete & Signal reference RGB (#000000); role overrides numeric proximity; alpha stays theme-owned | src/index.css:333 |
| css-background | rgba(255, 255, 255, 0.15) | divider | F3/F7: nearest authored Concrete & Signal reference RGB (rgba(255, 255, 255, 0.06)); role overrides numeric proximity; alpha stays theme-owned | src/index.css:320 |
| css-background | rgba(255, 255, 255, 0.25) | divider | F3/F7: nearest authored Concrete & Signal reference RGB (rgba(255, 255, 255, 0.06)); role overrides numeric proximity; alpha stays theme-owned | src/index.css:324 |
| css-background | transparent | transparent | structural paint keyword; preserve | src/index.css:317 |
| css-background-color | #f0fff4 | bg | F3/F7: nearest authored Concrete & Signal reference RGB (#f4f5f6); role overrides numeric proximity; alpha stays theme-owned | src/index.css:390 |
| css-background-color | #ffeef0 | bg | F3/F7: nearest authored Concrete & Signal reference RGB (#f4f5f6); role overrides numeric proximity; alpha stays theme-owned | src/index.css:391 |
| css-background-color | var(--c-bg) | bg | exact semantic role | src/index.css:279 |
| css-border-radius | 3px | rounded-xs | F4: nearest scale (2); proposed snap, fidelity difference explicit | src/index.css:321 |
| css-color | #005cc5 | fg-muted | F3/F7: nearest authored Concrete & Signal reference RGB (#575d64); role overrides numeric proximity; alpha stays theme-owned | src/index.css:372, src/index.css:386 |
| css-color | #032f62 | surface-hover | F3/F7: nearest authored Concrete & Signal reference RGB (#34383d); role overrides numeric proximity; alpha stays theme-owned | src/index.css:375 |
| css-color | #22863a | success | F3/F7: nearest authored Concrete & Signal reference RGB (#304f42); role overrides numeric proximity; alpha stays theme-owned | src/index.css:384, src/index.css:390 |
| css-color | #24292e | surface | F3/F7: nearest authored Concrete & Signal reference RGB (#25282c); role overrides numeric proximity; alpha stays theme-owned | src/index.css:351, src/index.css:385, src/index.css:388 (all in JSON) |
| css-color | #6a737d | fg-faint | F3/F7: nearest authored Concrete & Signal reference RGB (#5c6166); role overrides numeric proximity; alpha stays theme-owned | src/index.css:380 |
| css-color | #6f42c1 | fg-faint | F3/F7: nearest authored Concrete & Signal reference RGB (#8e9298); role overrides numeric proximity; alpha stays theme-owned | src/index.css:362 |
| css-color | #735c0f | warning | F3/F7: nearest authored Concrete & Signal reference RGB (#594628); role overrides numeric proximity; alpha stays theme-owned | src/index.css:387 |
| css-color | #b31d28 | brand-active | F3/F7: nearest authored Concrete & Signal reference RGB (#b61b28); role overrides numeric proximity; alpha stays theme-owned | src/index.css:391 |
| css-color | #d73a49 | brand-hover | F3/F7: nearest authored Concrete & Signal reference RGB (#e13a46); role overrides numeric proximity; alpha stays theme-owned | src/index.css:358 |
| css-color | #e36209 | brand-hover | F3/F7: nearest authored Concrete & Signal reference RGB (#e13a46); role overrides numeric proximity; alpha stays theme-owned | src/index.css:377 |
| css-color | var(--c-fg) | fg | exact semantic role | src/index.css:280 |
| css-display | block | preserve structural CSS / named inherited scale | layout/reset/animation or theme metadata, no new color/scale token | src/index.css:312 |
| css-display | none | preserve structural CSS / named inherited scale | layout/reset/animation or theme metadata, no new color/scale token | src/index.css:301, src/index.css:345 |
| css-font-family | var(--font-mono-family) | font-mono | F6: theme font stack override only; local font receipt or disclosed system fallback | src/index.css:288 |
| css-font-family | var(--font-ui) | font-sans | F6: theme font stack override only; local font receipt or disclosed system fallback | src/index.css:276, src/index.css:284 |
| css-font-style | italic | preserve structural CSS / named inherited scale | layout/reset/animation or theme metadata, no new color/scale token | src/index.css:388 |
| css-font-weight | bold | font-semibold | inherited weight scale; dynamic/keyword weights retain contextual role | src/index.css:386, src/index.css:389 |
| css-height | 0 | size-0 | F5: static spacing to Tailwind scale; percentages/data dimensions remain geometry, SVG viewBox is asset geometry | src/index.css:303, src/index.css:347 |
| css-height | 100% | controlled geometry / named inherited scale | F5: static spacing to Tailwind scale; percentages/data dimensions remain geometry, SVG viewBox is asset geometry | src/index.css:269 |
| css-height | 6px | size-1.5 | F5: static spacing to Tailwind scale; percentages/data dimensions remain geometry, SVG viewBox is asset geometry | src/index.css:314 |
| css-margin | 0 | size-0 | F5: static spacing to Tailwind scale; percentages/data dimensions remain geometry, SVG viewBox is asset geometry | src/index.css:270 |
| css-overflow | hidden | preserve structural CSS / named inherited scale | layout/reset/animation or theme metadata, no new color/scale token | src/index.css:272 |
| css-padding | 0 | size-0 | F5: static spacing to Tailwind scale; percentages/data dimensions remain geometry, SVG viewBox is asset geometry | src/index.css:271 |
| css-scrollbar-color | rgba(0, 0, 0, 0.15) transparent | primary-fg | F3/F7: nearest authored Concrete & Signal reference RGB (#000000); role overrides numeric proximity; alpha stays theme-owned | src/index.css:327 |
| css-scrollbar-color | rgba(255, 255, 255, 0.15) transparent | divider | F3/F7: nearest authored Concrete & Signal reference RGB (rgba(255, 255, 255, 0.06)); role overrides numeric proximity; alpha stays theme-owned | src/index.css:309 |
| css-scrollbar-width | none | controlled geometry / named inherited scale | F5: static spacing to Tailwind scale; percentages/data dimensions remain geometry, SVG viewBox is asset geometry | src/index.css:297, src/index.css:339 |
| css-scrollbar-width | thin | controlled geometry / named inherited scale | F5: static spacing to Tailwind scale; percentages/data dimensions remain geometry, SVG viewBox is asset geometry | src/index.css:308 |
| css-width | 0 | size-0 | F5: static spacing to Tailwind scale; percentages/data dimensions remain geometry, SVG viewBox is asset geometry | src/index.css:302, src/index.css:346 |
| css-width | 6px | size-1.5 | F5: static spacing to Tailwind scale; percentages/data dimensions remain geometry, SVG viewBox is asset geometry | src/index.css:313 |
| inline-fontFamily | 'monospace' | font-mono | F6: theme font stack override only; local font receipt or disclosed system fallback | src/components/ErrorBoundary.tsx:29 |
| inline-fontFamily | 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif' | font-sans | F6: theme font stack override only; local font receipt or disclosed system fallback | src/components/NavRail.tsx:58 |
| inline-fontSize | '34px' | text-4xl | F4: nearest scale (36); proposed snap, fidelity difference explicit | src/components/NavRail.tsx:58 |
| inline-fontSize | 12 | text-xs | exact scale | src/components/ErrorBoundary.tsx:34 |
| inline-fontSize | 14 | text-sm | exact scale | src/components/ErrorBoundary.tsx:31 |
| inline-fontSize | 24 | text-2xl | exact scale | src/components/ErrorBoundary.tsx:30 |
| inline-fontWeight | 900 | font-black | inherited weight scale; dynamic/keyword weights retain contextual role | src/components/NavRail.tsx:58 |
| inline-gap | 8 | gap-2 | F5: static spacing to Tailwind scale; percentages/data dimensions remain geometry, SVG viewBox is asset geometry | src/components/ui/tooltip.tsx:21 |
| inline-gap | HostRuntimeFeedGap | controlled geometry / named inherited scale | F5: static spacing to Tailwind scale; percentages/data dimensions remain geometry, SVG viewBox is asset geometry | src/lib/host-runtime-feed.ts:138, src/lib/host-runtime-feed.ts:259 |
| inline-gap | JSON.parse | controlled geometry / named inherited scale | F5: static spacing to Tailwind scale; percentages/data dimensions remain geometry, SVG viewBox is asset geometry | src/hooks/useHostRuntimeFeed.ts:33 |
| inline-gap | leftOpen | controlled geometry / named inherited scale | F5: static spacing to Tailwind scale; percentages/data dimensions remain geometry, SVG viewBox is asset geometry | src/components/chat/LayoutMenu.tsx:374 |
| inline-gap | rightOpen | controlled geometry / named inherited scale | F5: static spacing to Tailwind scale; percentages/data dimensions remain geometry, SVG viewBox is asset geometry | src/components/chat/LayoutMenu.tsx:451 |
| inline-gap | state.gap | controlled geometry / named inherited scale | F5: static spacing to Tailwind scale; percentages/data dimensions remain geometry, SVG viewBox is asset geometry | src/lib/host-runtime-feed.ts:124, src/lib/host-runtime-feed.ts:253 |
| inline-height | "14" | h-3.5 | F5: static spacing to Tailwind scale; percentages/data dimensions remain geometry, SVG viewBox is asset geometry | src/components/chat/LayoutMenu.tsx:30 |
| inline-height | "16" | h-4 | F5: static spacing to Tailwind scale; percentages/data dimensions remain geometry, SVG viewBox is asset geometry | src/components/chat/LayoutMenu.tsx:26 |
| inline-height | "18" | h-4.5 | F5: static spacing to Tailwind scale; percentages/data dimensions remain geometry, SVG viewBox is asset geometry | src/components/chat/LayoutMenu.tsx:27, src/components/chat/LayoutMenu.tsx:28, src/components/chat/LayoutMenu.tsx:29 (all in JSON) |
| inline-height | 11 | h-2.75 | F5: static spacing to Tailwind scale; percentages/data dimensions remain geometry, SVG viewBox is asset geometry | src/components/settings/SettingsPage.tsx:303, src/components/settings/SystemPromptsViewer.tsx:166 |
| inline-height | 14 | h-3.5 | F5: static spacing to Tailwind scale; percentages/data dimensions remain geometry, SVG viewBox is asset geometry | src/components/settings/SettingsPage.tsx:281, src/components/settings/SystemPromptsViewer.tsx:140, src/components/settings/SystemPromptsViewer.tsx:142 |
| inline-height | 16 | h-4 | F5: static spacing to Tailwind scale; percentages/data dimensions remain geometry, SVG viewBox is asset geometry | src/components/chat/LayoutMenu.tsx:132 |
| inline-height | 200 | h-50 | F5: static spacing to Tailwind scale; percentages/data dimensions remain geometry, SVG viewBox is asset geometry | src/components/drawers/ChatWorkingDrawer.tsx:204, src/components/drawers/ChatWorkingDrawer.tsx:87, src/stores/useLayoutStore.ts:192 (all in JSON) |
| inline-height | 240 | h-60 | F5: static spacing to Tailwind scale; percentages/data dimensions remain geometry, SVG viewBox is asset geometry | src/components/drawers/ChatPrimaryDrawer.tsx:90 |
| inline-height | 280 | h-70 | F5: static spacing to Tailwind scale; percentages/data dimensions remain geometry, SVG viewBox is asset geometry | src/stores/useLayoutStore.ts:358 |
| inline-height | 40 | h-10 | F5: static spacing to Tailwind scale; percentages/data dimensions remain geometry, SVG viewBox is asset geometry | src/components/chat/LayoutMenu.tsx:215 |
| inline-height | drawer.height | controlled geometry / named inherited scale | F5: static spacing to Tailwind scale; percentages/data dimensions remain geometry, SVG viewBox is asset geometry | src/components/drawers/ChatPrimaryDrawer.tsx:103, src/components/drawers/ChatPrimaryDrawer.tsx:76, src/components/drawers/ChatPrimaryDrawer.tsx:93 (all in JSON) |
| inline-height | next | controlled geometry / named inherited scale | F5: static spacing to Tailwind scale; percentages/data dimensions remain geometry, SVG viewBox is asset geometry | src/components/drawers/ChatPrimaryDrawer.tsx:84, src/components/drawers/ChatWorkingDrawer.tsx:194 |
| inline-height | size | controlled geometry / named inherited scale | F5: static spacing to Tailwind scale; percentages/data dimensions remain geometry, SVG viewBox is asset geometry | src/components/chat/LayoutMenu.tsx:54, src/components/settings/ProfilePanel.tsx:30 |
| inline-marginBottom | 16 | mb-4 | F5: static spacing to Tailwind scale; percentages/data dimensions remain geometry, SVG viewBox is asset geometry | src/components/ErrorBoundary.tsx:30 |
| inline-marginTop | 16 | mt-4 | F5: static spacing to Tailwind scale; percentages/data dimensions remain geometry, SVG viewBox is asset geometry | src/components/ErrorBoundary.tsx:34 |
| inline-minHeight | '100vh' | controlled geometry / named inherited scale | F5: static spacing to Tailwind scale; percentages/data dimensions remain geometry, SVG viewBox is asset geometry | src/components/ErrorBoundary.tsx:29 |
| inline-minHeight | 288 | min-h-72 | F5: static spacing to Tailwind scale; percentages/data dimensions remain geometry, SVG viewBox is asset geometry | src/components/chat/LayoutMenu.tsx:362 |
| inline-padding | 10 | p-2.5 | F5: static spacing to Tailwind scale; percentages/data dimensions remain geometry, SVG viewBox is asset geometry | src/components/settings/observability/ProviderDistributionChart.tsx:39 |
| inline-padding | 14 | p-3.5 | F5: static spacing to Tailwind scale; percentages/data dimensions remain geometry, SVG viewBox is asset geometry | src/components/settings/observability/ProviderDistributionChart.tsx:27 |
| inline-padding | 40 | p-10 | F5: static spacing to Tailwind scale; percentages/data dimensions remain geometry, SVG viewBox is asset geometry | src/components/ErrorBoundary.tsx:29 |
| inline-padding | leftOpen | controlled geometry / named inherited scale | F5: static spacing to Tailwind scale; percentages/data dimensions remain geometry, SVG viewBox is asset geometry | src/components/chat/LayoutMenu.tsx:371 |
| inline-padding | rightOpen | controlled geometry / named inherited scale | F5: static spacing to Tailwind scale; percentages/data dimensions remain geometry, SVG viewBox is asset geometry | src/components/chat/LayoutMenu.tsx:448 |
| inline-width | "12" | w-3 | F5: static spacing to Tailwind scale; percentages/data dimensions remain geometry, SVG viewBox is asset geometry | src/components/chat/LayoutMenu.tsx:26, src/components/chat/LayoutMenu.tsx:29 |
| inline-width | "18" | w-4.5 | F5: static spacing to Tailwind scale; percentages/data dimensions remain geometry, SVG viewBox is asset geometry | src/components/chat/LayoutMenu.tsx:27, src/components/chat/LayoutMenu.tsx:28, src/components/chat/LayoutMenu.tsx:30 (all in JSON) |
| inline-width | "w-48" | controlled geometry / named inherited scale | F5: static spacing to Tailwind scale; percentages/data dimensions remain geometry, SVG viewBox is asset geometry | src/components/settings/primitives.tsx:159 |
| inline-width | "w-60" | controlled geometry / named inherited scale | F5: static spacing to Tailwind scale; percentages/data dimensions remain geometry, SVG viewBox is asset geometry | src/components/settings/primitives.tsx:197 |
| inline-width | '55%' | controlled geometry / named inherited scale | F5: static spacing to Tailwind scale; percentages/data dimensions remain geometry, SVG viewBox is asset geometry | src/components/chat/LayoutMenu.tsx:429 |
| inline-width | '60%' | controlled geometry / named inherited scale | F5: static spacing to Tailwind scale; percentages/data dimensions remain geometry, SVG viewBox is asset geometry | src/components/chat/LayoutMenu.tsx:222 |
| inline-width | '62%' | controlled geometry / named inherited scale | F5: static spacing to Tailwind scale; percentages/data dimensions remain geometry, SVG viewBox is asset geometry | src/components/chat/LayoutMenu.tsx:430 |
| inline-width | '70%' | controlled geometry / named inherited scale | F5: static spacing to Tailwind scale; percentages/data dimensions remain geometry, SVG viewBox is asset geometry | src/components/chat/LayoutMenu.tsx:428, src/components/chat/LayoutMenu.tsx:435 |
| inline-width | '80%' | controlled geometry / named inherited scale | F5: static spacing to Tailwind scale; percentages/data dimensions remain geometry, SVG viewBox is asset geometry | src/components/chat/LayoutMenu.tsx:221 |
| inline-width | '92%' | controlled geometry / named inherited scale | F5: static spacing to Tailwind scale; percentages/data dimensions remain geometry, SVG viewBox is asset geometry | src/components/chat/LayoutMenu.tsx:491 |
| inline-width | 11 | w-2.75 | F5: static spacing to Tailwind scale; percentages/data dimensions remain geometry, SVG viewBox is asset geometry | src/components/settings/SettingsPage.tsx:303, src/components/settings/SystemPromptsViewer.tsx:166 |
| inline-width | 14 | w-3.5 | F5: static spacing to Tailwind scale; percentages/data dimensions remain geometry, SVG viewBox is asset geometry | src/components/settings/SettingsPage.tsx:281, src/components/settings/SystemPromptsViewer.tsx:140, src/components/settings/SystemPromptsViewer.tsx:142 |
| inline-width | 16 | w-4 | F5: static spacing to Tailwind scale; percentages/data dimensions remain geometry, SVG viewBox is asset geometry | src/components/chat/LayoutMenu.tsx:132 |
| inline-width | 48 | w-12 | F5: static spacing to Tailwind scale; percentages/data dimensions remain geometry, SVG viewBox is asset geometry | src/components/chat/LayoutMenu.tsx:215 |
| inline-width | 696 | w-174 | F5: static spacing to Tailwind scale; percentages/data dimensions remain geometry, SVG viewBox is asset geometry | src/components/chat/LayoutMenu.tsx:334 |
| inline-width | \`${Math.max(2, Math.min(100, pct))}%\` | controlled geometry / named inherited scale | F5: static spacing to Tailwind scale; percentages/data dimensions remain geometry, SVG viewBox is asset geometry | src/components/widgets/Widget.tsx:146 |
| inline-width | \`${Math.max(pct, 1)}%\` | controlled geometry / named inherited scale | F5: static spacing to Tailwind scale; percentages/data dimensions remain geometry, SVG viewBox is asset geometry | src/components/widgets/ContextInspectorModal.tsx:222 |
| inline-width | \`${Math.min(100, Math.max(0, (progressValue ?? 0) * 100))}%\` | controlled geometry / named inherited scale | F5: static spacing to Tailwind scale; percentages/data dimensions remain geometry, SVG viewBox is asset geometry | src/components/settings/PluginInstallProgress.tsx:224 |
| inline-width | \`${Math.min(100, Math.max(0, metric.percent))}%\` | controlled geometry / named inherited scale | F5: static spacing to Tailwind scale; percentages/data dimensions remain geometry, SVG viewBox is asset geometry | src/components/chat/envelopes/ReportCard.tsx:79 |
| inline-width | \`${Math.min(100, usagePercent)}%\` | controlled geometry / named inherited scale | F5: static spacing to Tailwind scale; percentages/data dimensions remain geometry, SVG viewBox is asset geometry | src/components/plugins/debug/SlotInspectorPanel.tsx:90 |
| inline-width | \`${Math.min(percent, 100)}%\` | controlled geometry / named inherited scale | F5: static spacing to Tailwind scale; percentages/data dimensions remain geometry, SVG viewBox is asset geometry | src/components/chat/IterationLimitWarning.tsx:52 |
| inline-width | \`${pct}%\` | controlled geometry / named inherited scale | F5: static spacing to Tailwind scale; percentages/data dimensions remain geometry, SVG viewBox is asset geometry | src/components/chat/envelopes/primitives/ProgressCard.tsx:42 |
| inline-width | \`${progressPct}%\` | controlled geometry / named inherited scale | F5: static spacing to Tailwind scale; percentages/data dimensions remain geometry, SVG viewBox is asset geometry | src/components/chat/envelopes/primitives/ListCard.tsx:288, src/components/work/PlanCard.tsx:72 |
| inline-width | \`${progress}%\` | controlled geometry / named inherited scale | F5: static spacing to Tailwind scale; percentages/data dimensions remain geometry, SVG viewBox is asset geometry | src/components/workflows/WorkflowRunCard.tsx:147 |
| inline-width | size | controlled geometry / named inherited scale | F5: static spacing to Tailwind scale; percentages/data dimensions remain geometry, SVG viewBox is asset geometry | src/components/chat/LayoutMenu.tsx:54, src/components/settings/ProfilePanel.tsx:29 |
| literal-color | #000 | primary-fg | F3/F7: nearest authored Concrete & Signal reference RGB (#000000); role overrides numeric proximity; alpha stays theme-owned | src/components/chat/LayoutMenu.tsx:201 |
| literal-color | #000000 | primary-fg | F3/F7: nearest authored Concrete & Signal reference RGB (#000000); role overrides numeric proximity; alpha stays theme-owned | src/components/chat/LayoutMenu.tsx:120, src/lib/theme/defaults.ts:556, src/lib/theme/defaults.ts:75 |
| literal-color | #004458 | success | F3/F7: nearest authored Concrete & Signal reference RGB (#304f42); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:460 |
| literal-color | #005670 | success | F3/F7: nearest authored Concrete & Signal reference RGB (#304f42); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:459 |
| literal-color | #006e8c | success | F3/F7: nearest authored Concrete & Signal reference RGB (#304f42); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:458, src/lib/theme/defaults.ts:467, src/lib/theme/defaults.ts:477 |
| literal-color | #00b8cc | fg-muted | F3/F7: nearest authored Concrete & Signal reference RGB (#91979e); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:322 |
| literal-color | #00b8d4 | fg-muted | F3/F7: nearest authored Concrete & Signal reference RGB (#91979e); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:418 |
| literal-color | #00e0ff | fg-secondary | F3/F7: nearest authored Concrete & Signal reference RGB (#98a0a8); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:416, src/lib/theme/defaults.ts:425, src/lib/theme/defaults.ts:435 |
| literal-color | #00e5ff | fg-secondary | F3/F7: nearest authored Concrete & Signal reference RGB (#98a0a8); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:320, src/lib/theme/defaults.ts:329, src/lib/theme/defaults.ts:339 |
| literal-color | #020617 | bg | F3/F7: nearest authored Concrete & Signal reference RGB (#0c0d0e); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:16 |
| literal-color | #022c22 | bg-elevated | F3/F7: nearest authored Concrete & Signal reference RGB (#16181a); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:56 |
| literal-color | #0284c7 | fg-muted | F3/F7: nearest authored Concrete & Signal reference RGB (#575d64); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:68 |
| literal-color | #030712 | bg | F3/F7: nearest authored Concrete & Signal reference RGB (#0c0d0e); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:20 |
| literal-color | #0369a1 | fg-muted | F3/F7: nearest authored Concrete & Signal reference RGB (#575d64); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:68 |
| literal-color | #042f2e | border-subtle | F3/F7: nearest authored Concrete & Signal reference RGB (#1d1f22); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:60 |
| literal-color | #047857 | success | F3/F7: nearest authored Concrete & Signal reference RGB (#304f42); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:56 |
| literal-color | #050a14 | bg | F3/F7: nearest authored Concrete & Signal reference RGB (#0c0d0e); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:400, src/lib/theme/defaults.ts:415, src/lib/theme/defaults.ts:420 (all in JSON) |
| literal-color | #052e16 | bg-elevated | F3/F7: nearest authored Concrete & Signal reference RGB (#16181a); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:52 |
| literal-color | #059669 | success | F3/F7: nearest authored Concrete & Signal reference RGB (#304f42); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:56 |
| literal-color | #061824 | bg-elevated | F3/F7: nearest authored Concrete & Signal reference RGB (#16181a); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:324, src/lib/theme/defaults.ts:333 |
| literal-color | #064e3b | success | F3/F7: nearest authored Concrete & Signal reference RGB (#304f42); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:56 |
| literal-color | #065f46 | success | F3/F7: nearest authored Concrete & Signal reference RGB (#304f42); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:56 |
| literal-color | #06b6d4 | fg-muted | F3/F7: nearest authored Concrete & Signal reference RGB (#91979e); role overrides numeric proximity; alpha stays theme-owned | src/components/settings/observability/ProviderDistributionChart.tsx:9, src/lib/theme/tailwind-swatches.ts:64 |
| literal-color | #075985 | success | F3/F7: nearest authored Concrete & Signal reference RGB (#304f42); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:68 |
| literal-color | #081120 | bg-elevated | F3/F7: nearest authored Concrete & Signal reference RGB (#16181a); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:401 |
| literal-color | #082f49 | surface | F3/F7: nearest authored Concrete & Signal reference RGB (#25282c); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:68 |
| literal-color | #083344 | surface | F3/F7: nearest authored Concrete & Signal reference RGB (#25282c); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:64 |
| literal-color | #0891b2 | fg-muted | F3/F7: nearest authored Concrete & Signal reference RGB (#575d64); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:64 |
| literal-color | #09090b | bg | F3/F7: nearest authored Concrete & Signal reference RGB (#0c0d0e); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:24 |
| literal-color | #0a0a0a | bg | F3/F7: nearest authored Concrete & Signal reference RGB (#0c0d0e); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:546, src/lib/theme/defaults.ts:555 |
| literal-color | #0a0e14 | bg | F3/F7: nearest authored Concrete & Signal reference RGB (#0c0d0e); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:132, src/lib/theme/defaults.ts:141 |
| literal-color | #0a1a24 | bg-elevated | F3/F7: nearest authored Concrete & Signal reference RGB (#16181a); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:449 |
| literal-color | #0c0a09 | bg | F3/F7: nearest authored Concrete & Signal reference RGB (#0c0d0e); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:28 |
| literal-color | #0c0c0c | bg | F3/F7: nearest authored Concrete & Signal reference RGB (#0c0d0e); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:497, src/lib/theme/defaults.ts:517, src/lib/theme/defaults.ts:526 |
| literal-color | #0c0d0e | bg | F3/F7: nearest authored Concrete & Signal reference RGB (#0c0d0e); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:16, src/lib/theme/defaults.ts:36 |
| literal-color | #0c1a2e | border-subtle | F3/F7: nearest authored Concrete & Signal reference RGB (#1d1f22); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:406 |
| literal-color | #0c4a6e | success | F3/F7: nearest authored Concrete & Signal reference RGB (#304f42); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:68 |
| literal-color | #0d9488 | fg-muted | F3/F7: nearest authored Concrete & Signal reference RGB (#575d64); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:60 |
| literal-color | #0e0a1c | bg | F3/F7: nearest authored Concrete & Signal reference RGB (#0c0d0e); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:304 |
| literal-color | #0e0e10 | bg | F3/F7: nearest authored Concrete & Signal reference RGB (#0c0d0e); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:112 |
| literal-color | #0e7490 | fg-muted | F3/F7: nearest authored Concrete & Signal reference RGB (#575d64); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:373, src/lib/theme/defaults.ts:383, src/lib/theme/tailwind-swatches.ts:64 |
| literal-color | #0ea5e9 | fg-muted | F3/F7: nearest authored Concrete & Signal reference RGB (#91979e); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:68 |
| literal-color | #0f172a | bg-elevated | F3/F7: nearest authored Concrete & Signal reference RGB (#16181a); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:16 |
| literal-color | #0f766e | success | F3/F7: nearest authored Concrete & Signal reference RGB (#304f42); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:60 |
| literal-color | #10b981 | fg-faint | F3/F7: nearest authored Concrete & Signal reference RGB (#5c6166); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:56 |
| literal-color | #111 | bg | F3/F7: nearest authored Concrete & Signal reference RGB (#0c0d0e); role overrides numeric proximity; alpha stays theme-owned | src/components/chat/LayoutMenu.tsx:198 |
| literal-color | #111827 | bg-elevated | F3/F7: nearest authored Concrete & Signal reference RGB (#16181a); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:20 |
| literal-color | #115e59 | success | F3/F7: nearest authored Concrete & Signal reference RGB (#304f42); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:60 |
| literal-color | #117a4a | success | F3/F7: nearest authored Concrete & Signal reference RGB (#304f42); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:469, src/lib/theme/defaults.ts:479 |
| literal-color | #134e4a | success | F3/F7: nearest authored Concrete & Signal reference RGB (#304f42); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:60 |
| literal-color | #14110e | bg | F3/F7: nearest authored Concrete & Signal reference RGB (#0c0d0e); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:208, src/lib/theme/defaults.ts:228, src/lib/theme/defaults.ts:237 |
| literal-color | #14253d | surface | F3/F7: nearest authored Concrete & Signal reference RGB (#25282c); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:402 |
| literal-color | #14532d | success | F3/F7: nearest authored Concrete & Signal reference RGB (#304f42); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:52 |
| literal-color | #14b8a6 | fg-faint | F3/F7: nearest authored Concrete & Signal reference RGB (#8e9298); role overrides numeric proximity; alpha stays theme-owned | src/components/settings/observability/ProviderDistributionChart.tsx:12, src/lib/theme/tailwind-swatches.ts:60 |
| literal-color | #155e75 | success | F3/F7: nearest authored Concrete & Signal reference RGB (#304f42); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:64 |
| literal-color | #15803d | success | F3/F7: nearest authored Concrete & Signal reference RGB (#304f42); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:52 |
| literal-color | #161616 | bg-elevated | F3/F7: nearest authored Concrete & Signal reference RGB (#16181a); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:498 |
| literal-color | #16181a | bg-elevated | F3/F7: nearest authored Concrete & Signal reference RGB (#16181a); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:17 |
| literal-color | #164e63 | success | F3/F7: nearest authored Concrete & Signal reference RGB (#304f42); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:64 |
| literal-color | #166534 | success | F3/F7: nearest authored Concrete & Signal reference RGB (#304f42); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:52 |
| literal-color | #16a34a | success | F3/F7: nearest authored Concrete & Signal reference RGB (#304f42); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:52 |
| literal-color | #172554 | primary-active | F3/F7: nearest authored Concrete & Signal reference RGB (#2a2c30); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:72 |
| literal-color | #181230 | border-subtle | F3/F7: nearest authored Concrete & Signal reference RGB (#1d1f22); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:305 |
| literal-color | #18181b | fg | F3/F7: nearest authored Concrete & Signal reference RGB (#18191b); role overrides numeric proximity; alpha stays theme-owned | src/components/ErrorBoundary.tsx:29, src/components/settings/observability/DurationChart.tsx:12, src/components/settings/observability/ProviderDistributionChart.tsx:35 (all in JSON) |
| literal-color | #18191b | fg | F3/F7: nearest authored Concrete & Signal reference RGB (#18191b); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:65, src/lib/theme/defaults.ts:74 |
| literal-color | #1a0e2e | border-subtle | F3/F7: nearest authored Concrete & Signal reference RGB (#1d1f22); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:353 |
| literal-color | #1a1b26 | border-subtle | F3/F7: nearest authored Concrete & Signal reference RGB (#1d1f22); role overrides numeric proximity; alpha stays theme-owned | src/components/chat/ShellMessage.tsx:32 |
| literal-color | #1a2e05 | fg | F3/F7: nearest authored Concrete & Signal reference RGB (#18191b); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:48 |
| literal-color | #1a3050 | surface-hover | F3/F7: nearest authored Concrete & Signal reference RGB (#34383d); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:403, src/lib/theme/defaults.ts:405 |
| literal-color | #1a3a9e | surface-active | F3/F7: nearest authored Concrete & Signal reference RGB (#4a5058); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:364 |
| literal-color | #1c1813 | fg | F3/F7: nearest authored Concrete & Signal reference RGB (#18191b); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:209 |
| literal-color | #1c1917 | fg | F3/F7: nearest authored Concrete & Signal reference RGB (#18191b); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:28 |
| literal-color | #1c1c1c | fg | F3/F7: nearest authored Concrete & Signal reference RGB (#18191b); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:503 |
| literal-color | #1d1f22 | border-subtle | F3/F7: nearest authored Concrete & Signal reference RGB (#1d1f22); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:22 |
| literal-color | #1d4ed8 | fg-muted | F3/F7: nearest authored Concrete & Signal reference RGB (#575d64); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:362, src/lib/theme/defaults.ts:371, src/lib/theme/defaults.ts:381 (all in JSON) |
| literal-color | #1e1b4b | primary-active | F3/F7: nearest authored Concrete & Signal reference RGB (#2a2c30); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:76 |
| literal-color | #1e1f2e | surface | F3/F7: nearest authored Concrete & Signal reference RGB (#25282c); role overrides numeric proximity; alpha stays theme-owned | src/components/chat/ShellMessage.tsx:34 |
| literal-color | #1e293b | primary-active | F3/F7: nearest authored Concrete & Signal reference RGB (#2a2c30); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:16 |
| literal-color | #1e3a8a | surface-active | F3/F7: nearest authored Concrete & Signal reference RGB (#4a5058); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:72 |
| literal-color | #1e40af | fg-muted | F3/F7: nearest authored Concrete & Signal reference RGB (#575d64); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:363, src/lib/theme/tailwind-swatches.ts:72 |
| literal-color | #1f1838 | surface | F3/F7: nearest authored Concrete & Signal reference RGB (#25282c); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:310 |
| literal-color | #1f1a14 | fg | F3/F7: nearest authored Concrete & Signal reference RGB (#18191b); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:257 |
| literal-color | #1f1f23 | border-subtle | F3/F7: nearest authored Concrete & Signal reference RGB (#1d1f22); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:118 |
| literal-color | #1f2937 | surface | F3/F7: nearest authored Concrete & Signal reference RGB (#25282c); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:20 |
| literal-color | #203c62 | success | F3/F7: nearest authored Concrete & Signal reference RGB (#304f42); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:404 |
| literal-color | #221d18 | fg | F3/F7: nearest authored Concrete & Signal reference RGB (#18191b); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:214 |
| literal-color | #222 | border-subtle | F3/F7: nearest authored Concrete & Signal reference RGB (#1d1f22); role overrides numeric proximity; alpha stays theme-owned | src/components/chat/LayoutMenu.tsx:199 |
| literal-color | #222222 | border-subtle | F3/F7: nearest authored Concrete & Signal reference RGB (#1d1f22); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:557 |
| literal-color | #22c55e | fg-faint | F3/F7: nearest authored Concrete & Signal reference RGB (#5c6166); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:52 |
| literal-color | #22d3ee | fg-secondary | F3/F7: nearest authored Concrete & Signal reference RGB (#98a0a8); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:63 |
| literal-color | #242424 | border-subtle | F3/F7: nearest authored Concrete & Signal reference RGB (#1d1f22); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:499, src/lib/theme/defaults.ts:502 |
| literal-color | #25282c | surface | F3/F7: nearest authored Concrete & Signal reference RGB (#25282c); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:18, src/lib/theme/defaults.ts:21 |
| literal-color | #253d58 | success | F3/F7: nearest authored Concrete & Signal reference RGB (#304f42); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:172 |
| literal-color | #2563eb | fg-faint | F3/F7: nearest authored Concrete & Signal reference RGB (#8e9298); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:72 |
| literal-color | #27272a | surface | F3/F7: nearest authored Concrete & Signal reference RGB (#25282c); role overrides numeric proximity; alpha stays theme-owned | src/lib/chartSetup.ts:27, src/lib/theme/defaults.ts:114, src/lib/theme/defaults.ts:117 (all in JSON) |
| literal-color | #292524 | surface | F3/F7: nearest authored Concrete & Signal reference RGB (#25282c); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:28 |
| literal-color | #2a2148 | primary-active | F3/F7: nearest authored Concrete & Signal reference RGB (#2a2c30); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:306, src/lib/theme/defaults.ts:309 |
| literal-color | #2a241e | border-subtle | F3/F7: nearest authored Concrete & Signal reference RGB (#1d1f22); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:210, src/lib/theme/defaults.ts:213 |
| literal-color | #2a2c30 | primary-active | F3/F7: nearest authored Concrete & Signal reference RGB (#2a2c30); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:76 |
| literal-color | #2c4a68 | info | F3/F7: nearest authored Concrete & Signal reference RGB (#464c53); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:171 |
| literal-color | #2dd4bf | fg-secondary | F3/F7: nearest authored Concrete & Signal reference RGB (#98a0a8); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:59 |
| literal-color | #2e1065 | surface-hover | F3/F7: nearest authored Concrete & Signal reference RGB (#34383d); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:80 |
| literal-color | #2e2e2e | primary-active | F3/F7: nearest authored Concrete & Signal reference RGB (#2a2c30); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:500 |
| literal-color | #2e3c48 | surface-hover | F3/F7: nearest authored Concrete & Signal reference RGB (#34383d); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:268 |
| literal-color | #2e4868 | info | F3/F7: nearest authored Concrete & Signal reference RGB (#464c53); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:410 |
| literal-color | #2e4a5e | info | F3/F7: nearest authored Concrete & Signal reference RGB (#464c53); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:450, src/lib/theme/defaults.ts:475 |
| literal-color | #2ee59d | fg-muted | F3/F7: nearest authored Concrete & Signal reference RGB (#91979e); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:427, src/lib/theme/defaults.ts:437 |
| literal-color | #312e81 | info | F3/F7: nearest authored Concrete & Signal reference RGB (#464c53); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:76 |
| literal-color | #334155 | info | F3/F7: nearest authored Concrete & Signal reference RGB (#464c53); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:16 |
| literal-color | #34343a | surface-hover | F3/F7: nearest authored Concrete & Signal reference RGB (#34383d); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:115 |
| literal-color | #34383d | surface-hover | F3/F7: nearest authored Concrete & Signal reference RGB (#34383d); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:19 |
| literal-color | #34d399 | fg-muted | F3/F7: nearest authored Concrete & Signal reference RGB (#91979e); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:55 |
| literal-color | #365314 | warning | F3/F7: nearest authored Concrete & Signal reference RGB (#594628); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:48 |
| literal-color | #3730a3 | surface-active | F3/F7: nearest authored Concrete & Signal reference RGB (#4a5058); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:76 |
| literal-color | #374151 | info | F3/F7: nearest authored Concrete & Signal reference RGB (#464c53); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:20 |
| literal-color | #382c5e | surface-hover | F3/F7: nearest authored Concrete & Signal reference RGB (#34383d); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:307 |
| literal-color | #383838 | surface-hover | F3/F7: nearest authored Concrete & Signal reference RGB (#34383d); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:501 |
| literal-color | #38bdf8 | fg-secondary | F3/F7: nearest authored Concrete & Signal reference RGB (#98a0a8); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:67 |
| literal-color | #3a322a | primary-active | F3/F7: nearest authored Concrete & Signal reference RGB (#2a2c30); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:211 |
| literal-color | #3a4a58 | info | F3/F7: nearest authored Concrete & Signal reference RGB (#464c53); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:267 |
| literal-color | #3b0764 | surface-hover | F3/F7: nearest authored Concrete & Signal reference RGB (#34383d); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:84 |
| literal-color | #3b82f6 | fg-muted | F3/F7: nearest authored Concrete & Signal reference RGB (#91979e); role overrides numeric proximity; alpha stays theme-owned | src/components/settings/observability/ProviderDistributionChart.tsx:7, src/lib/theme/tailwind-swatches.ts:72 |
| literal-color | #3c5a78 | fg-muted | F3/F7: nearest authored Concrete & Signal reference RGB (#575d64); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:170, src/lib/theme/defaults.ts:179 |
| literal-color | #3f3f46 | surface-hover | F3/F7: nearest authored Concrete & Signal reference RGB (#34383d); role overrides numeric proximity; alpha stays theme-owned | src/components/settings/observability/DurationChart.tsx:13, src/components/settings/observability/ProviderDistributionChart.tsx:36, src/lib/theme/tailwind-swatches.ts:24 |
| literal-color | #3f6212 | warning | F3/F7: nearest authored Concrete & Signal reference RGB (#594628); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:48 |
| literal-color | #4040a0 | fg-muted | F3/F7: nearest authored Concrete & Signal reference RGB (#575d64); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:574 |
| literal-color | #422006 | border-subtle | F3/F7: nearest authored Concrete & Signal reference RGB (#1d1f22); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:44 |
| literal-color | #431407 | fg | F3/F7: nearest authored Concrete & Signal reference RGB (#18191b); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:36 |
| literal-color | #4338ca | fg-muted | F3/F7: nearest authored Concrete & Signal reference RGB (#575d64); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:76 |
| literal-color | #44403c | surface-hover | F3/F7: nearest authored Concrete & Signal reference RGB (#34383d); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:28 |
| literal-color | #450a0a | fg | F3/F7: nearest authored Concrete & Signal reference RGB (#18191b); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:32 |
| literal-color | #451a03 | border-subtle | F3/F7: nearest authored Concrete & Signal reference RGB (#1d1f22); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:40 |
| literal-color | #464650 | info | F3/F7: nearest authored Concrete & Signal reference RGB (#464c53); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:116 |
| literal-color | #475569 | surface-active | F3/F7: nearest authored Concrete & Signal reference RGB (#4a5058); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:187, src/lib/theme/defaults.ts:91, src/lib/theme/tailwind-swatches.ts:16 |
| literal-color | #4a044e | surface-hover | F3/F7: nearest authored Concrete & Signal reference RGB (#34383d); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:88 |
| literal-color | #4a3872 | surface-active | F3/F7: nearest authored Concrete & Signal reference RGB (#4a5058); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:308 |
| literal-color | #4a4a4a | info | F3/F7: nearest authored Concrete & Signal reference RGB (#464c53); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:507, src/lib/theme/defaults.ts:547, src/lib/theme/defaults.ts:564 (all in JSON) |
| literal-color | #4a4a50 | info | F3/F7: nearest authored Concrete & Signal reference RGB (#464c53); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:162 |
| literal-color | #4a5058 | surface-active | F3/F7: nearest authored Concrete & Signal reference RGB (#4a5058); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:20, src/lib/theme/defaults.ts:26, src/lib/theme/defaults.ts:66 (all in JSON) |
| literal-color | #4a6a88 | fg-faint | F3/F7: nearest authored Concrete & Signal reference RGB (#5c6166); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:409 |
| literal-color | #4a7a65 | fg-faint | F3/F7: nearest authored Concrete & Signal reference RGB (#5c6166); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:95 |
| literal-color | #4ade80 | fg-faint | F3/F7: nearest authored Concrete & Signal reference RGB (#8e9298); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:51 |
| literal-color | #4b5563 | surface-active | F3/F7: nearest authored Concrete & Signal reference RGB (#4a5058); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:20 |
| literal-color | #4c0519 | danger-hover | F3/F7: nearest authored Concrete & Signal reference RGB (#7e1823); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:96 |
| literal-color | #4c1d95 | surface-active | F3/F7: nearest authored Concrete & Signal reference RGB (#4a5058); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:80 |
| literal-color | #4c4038 | warning | F3/F7: nearest authored Concrete & Signal reference RGB (#594628); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:212 |
| literal-color | #4ce8ff | info | F3/F7: nearest authored Concrete & Signal reference RGB (#b4bac0); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:417 |
| literal-color | #4cf0ff | info | F3/F7: nearest authored Concrete & Signal reference RGB (#b4bac0); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:321 |
| literal-color | #4d5d6b | fg-muted | F3/F7: nearest authored Concrete & Signal reference RGB (#575d64); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:266, src/lib/theme/defaults.ts:275, src/lib/theme/defaults.ts:283 |
| literal-color | #4d7c0f | warning | F3/F7: nearest authored Concrete & Signal reference RGB (#594628); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:48 |
| literal-color | #4e3e6e | surface-active | F3/F7: nearest authored Concrete & Signal reference RGB (#4a5058); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:354 |
| literal-color | #4f46e5 | fg-faint | F3/F7: nearest authored Concrete & Signal reference RGB (#8e9298); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:76 |
| literal-color | #500724 | danger-hover | F3/F7: nearest authored Concrete & Signal reference RGB (#7e1823); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:92 |
| literal-color | #524880 | fg-muted | F3/F7: nearest authored Concrete & Signal reference RGB (#575d64); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:314 |
| literal-color | #52525b | surface-active | F3/F7: nearest authored Concrete & Signal reference RGB (#4a5058); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:122, src/lib/theme/tailwind-swatches.ts:24 |
| literal-color | #555 | surface-active | F3/F7: nearest authored Concrete & Signal reference RGB (#4a5058); role overrides numeric proximity; alpha stays theme-owned | src/components/chat/LayoutMenu.tsx:202 |
| literal-color | #57534e | surface-active | F3/F7: nearest authored Concrete & Signal reference RGB (#4a5058); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:188, src/lib/theme/defaults.ts:92, src/lib/theme/tailwind-swatches.ts:28 |
| literal-color | #581c87 | surface-active | F3/F7: nearest authored Concrete & Signal reference RGB (#4a5058); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:84 |
| literal-color | #5a5145 | surface-active | F3/F7: nearest authored Concrete & Signal reference RGB (#4a5058); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:258 |
| literal-color | #5a5249 | surface-active | F3/F7: nearest authored Concrete & Signal reference RGB (#4a5058); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:218 |
| literal-color | #5a7484 | fg-faint | F3/F7: nearest authored Concrete & Signal reference RGB (#5c6166); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:451, src/lib/theme/defaults.ts:476 |
| literal-color | #5a7694 | fg-faint | F3/F7: nearest authored Concrete & Signal reference RGB (#5c6166); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:130 |
| literal-color | #5a7858 | fg-faint | F3/F7: nearest authored Concrete & Signal reference RGB (#5c6166); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:181, src/lib/theme/defaults.ts:191 |
| literal-color | #5b21b6 | fg-muted | F3/F7: nearest authored Concrete & Signal reference RGB (#575d64); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:80 |
| literal-color | #5c5ca8 | fg-faint | F3/F7: nearest authored Concrete & Signal reference RGB (#5c6166); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:285 |
| literal-color | #5ee0b8 | fg-secondary | F3/F7: nearest authored Concrete & Signal reference RGB (#98a0a8); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:331, src/lib/theme/defaults.ts:341 |
| literal-color | #5eead4 | info | F3/F7: nearest authored Concrete & Signal reference RGB (#b4bac0); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:59 |
| literal-color | #60a5fa | fg-secondary | F3/F7: nearest authored Concrete & Signal reference RGB (#98a0a8); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:71 |
| literal-color | #6366b8 | fg-faint | F3/F7: nearest authored Concrete & Signal reference RGB (#8e9298); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:189, src/lib/theme/defaults.ts:93 |
| literal-color | #6366f1 | fg-muted | F3/F7: nearest authored Concrete & Signal reference RGB (#91979e); role overrides numeric proximity; alpha stays theme-owned | src/components/settings/observability/DurationChart.tsx:66, src/components/settings/observability/ProviderDistributionChart.tsx:13, src/lib/theme/tailwind-swatches.ts:76 |
| literal-color | #64748b | fg-faint | F3/F7: nearest authored Concrete & Signal reference RGB (#5c6166); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:49, src/lib/theme/tailwind-swatches.ts:16 |
| literal-color | #65a30d | warning | F3/F7: nearest authored Concrete & Signal reference RGB (#594628); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:48 |
| literal-color | #67e8f9 | success | F3/F7: nearest authored Concrete & Signal reference RGB (#cadcd5); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:63 |
| literal-color | #6a8aa8 | fg-faint | F3/F7: nearest authored Concrete & Signal reference RGB (#8e9298); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:408, src/lib/theme/defaults.ts:433 |
| literal-color | #6b21a8 | fg-muted | F3/F7: nearest authored Concrete & Signal reference RGB (#575d64); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:84 |
| literal-color | #6b7280 | fg-faint | F3/F7: nearest authored Concrete & Signal reference RGB (#5c6166); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:20 |
| literal-color | #6b9e8a | fg-faint | F3/F7: nearest authored Concrete & Signal reference RGB (#8e9298); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:53 |
| literal-color | #6c6c6c | fg-faint | F3/F7: nearest authored Concrete & Signal reference RGB (#5c6166); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:506, src/lib/theme/defaults.ts:531, src/lib/theme/defaults.ts:548 (all in JSON) |
| literal-color | #6c747c | fg-faint | F3/F7: nearest authored Concrete & Signal reference RGB (#5c6166); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:25, src/lib/theme/defaults.ts:67 |
| literal-color | #6d28d9 | fg-faint | F3/F7: nearest authored Concrete & Signal reference RGB (#8e9298); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:80 |
| literal-color | #6e8aa8 | fg-faint | F3/F7: nearest authored Concrete & Signal reference RGB (#8e9298); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:128, src/lib/theme/defaults.ts:137, src/lib/theme/defaults.ts:145 |
| literal-color | #6ee7b7 | info | F3/F7: nearest authored Concrete & Signal reference RGB (#b4bac0); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:55 |
| literal-color | #701a75 | surface-active | F3/F7: nearest authored Concrete & Signal reference RGB (#4a5058); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:88 |
| literal-color | #713f12 | warning | F3/F7: nearest authored Concrete & Signal reference RGB (#594628); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:44 |
| literal-color | #71717a | fg-faint | F3/F7: nearest authored Concrete & Signal reference RGB (#5c6166); role overrides numeric proximity; alpha stays theme-owned | src/components/settings/observability/ProviderDistributionChart.tsx:31, src/lib/theme/defaults.ts:121, src/lib/theme/tailwind-swatches.ts:24 |
| literal-color | #76688e | fg-faint | F3/F7: nearest authored Concrete & Signal reference RGB (#5c6166); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:355, src/lib/theme/defaults.ts:379 |
| literal-color | #76767c | fg-faint | F3/F7: nearest authored Concrete & Signal reference RGB (#5c6166); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:163 |
| literal-color | #780f18 | danger-hover | F3/F7: nearest authored Concrete & Signal reference RGB (#7e1823); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:263 |
| literal-color | #78350f | danger-hover | F3/F7: nearest authored Concrete & Signal reference RGB (#7e1823); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:40 |
| literal-color | #78716c | fg-faint | F3/F7: nearest authored Concrete & Signal reference RGB (#5c6166); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:146, src/lib/theme/defaults.ts:50, src/lib/theme/tailwind-swatches.ts:28 |
| literal-color | #7a8898 | fg-faint | F3/F7: nearest authored Concrete & Signal reference RGB (#8e9298); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:226 |
| literal-color | #7c2d12 | danger-hover | F3/F7: nearest authored Concrete & Signal reference RGB (#7e1823); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:36 |
| literal-color | #7c3aed | fg-faint | F3/F7: nearest authored Concrete & Signal reference RGB (#8e9298); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:80 |
| literal-color | #7c6ca8 | fg-faint | F3/F7: nearest authored Concrete & Signal reference RGB (#8e9298); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:313, src/lib/theme/defaults.ts:337 |
| literal-color | #7c7bd1 | fg-muted | F3/F7: nearest authored Concrete & Signal reference RGB (#91979e); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:147, src/lib/theme/defaults.ts:51 |
| literal-color | #7dd3fc | surface-active | F3/F7: nearest authored Concrete & Signal reference RGB (#c2c7cc); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:67 |
| literal-color | #7e22ce | fg-faint | F3/F7: nearest authored Concrete & Signal reference RGB (#8e9298); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:84 |
| literal-color | #7f1d1d | danger-hover | F3/F7: nearest authored Concrete & Signal reference RGB (#7e1823); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:32 |
| literal-color | #818cf8 | fg-secondary | F3/F7: nearest authored Concrete & Signal reference RGB (#98a0a8); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:75 |
| literal-color | #82796d | fg-faint | F3/F7: nearest authored Concrete & Signal reference RGB (#5c6166); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:217, src/lib/theme/defaults.ts:259 |
| literal-color | #831843 | danger | F3/F7: nearest authored Concrete & Signal reference RGB (#8c1824); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:92 |
| literal-color | #841019 | danger-hover | F3/F7: nearest authored Concrete & Signal reference RGB (#7e1823); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:167 |
| literal-color | #84cc16 | fg-faint | F3/F7: nearest authored Concrete & Signal reference RGB (#5c6166); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:48 |
| literal-color | #851f1c | danger-hover | F3/F7: nearest authored Concrete & Signal reference RGB (#7e1823); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:272 |
| literal-color | #854d0e | warning | F3/F7: nearest authored Concrete & Signal reference RGB (#594628); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:44 |
| literal-color | #86198f | fg-faint | F3/F7: nearest authored Concrete & Signal reference RGB (#5c6166); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:88 |
| literal-color | #86efac | info | F3/F7: nearest authored Concrete & Signal reference RGB (#b4bac0); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:51 |
| literal-color | #880d52 | danger | F3/F7: nearest authored Concrete & Signal reference RGB (#8c1824); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:455 |
| literal-color | #881337 | danger | F3/F7: nearest authored Concrete & Signal reference RGB (#8c1824); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:96 |
| literal-color | #888 | fg-faint | F3/F7: nearest authored Concrete & Signal reference RGB (#8e9298); role overrides numeric proximity; alpha stays theme-owned | src/components/chat/LayoutMenu.tsx:200 |
| literal-color | #8a4018 | danger | F3/F7: nearest authored Concrete & Signal reference RGB (#8c1824); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:552 |
| literal-color | #8a6d3e | fg-faint | F3/F7: nearest authored Concrete & Signal reference RGB (#5c6166); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:96 |
| literal-color | #8a6d4a | fg-faint | F3/F7: nearest authored Concrete & Signal reference RGB (#5c6166); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:94 |
| literal-color | #8a7530 | warning | F3/F7: nearest authored Concrete & Signal reference RGB (#594628); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:277, src/lib/theme/defaults.ts:286, src/lib/theme/defaults.ts:287 |
| literal-color | #8a8ac0 | fg-secondary | F3/F7: nearest authored Concrete & Signal reference RGB (#98a0a8); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:243 |
| literal-color | #8a99a6 | fg-muted | F3/F7: nearest authored Concrete & Signal reference RGB (#91979e); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:224, src/lib/theme/defaults.ts:233, src/lib/theme/defaults.ts:241 |
| literal-color | #8a9ca8 | fg-muted | F3/F7: nearest authored Concrete & Signal reference RGB (#91979e); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:434, src/lib/theme/defaults.ts:452 |
| literal-color | #8aa3bf | fg-secondary | F3/F7: nearest authored Concrete & Signal reference RGB (#98a0a8); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:129 |
| literal-color | #8b5cf6 | fg-secondary | F3/F7: nearest authored Concrete & Signal reference RGB (#98a0a8); role overrides numeric proximity; alpha stays theme-owned | src/components/settings/observability/ProviderDistributionChart.tsx:8, src/lib/theme/tailwind-swatches.ts:80 |
| literal-color | #8ba888 | fg-faint | F3/F7: nearest authored Concrete & Signal reference RGB (#8e9298); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:139, src/lib/theme/defaults.ts:149 |
| literal-color | #8e0d59 | danger | F3/F7: nearest authored Concrete & Signal reference RGB (#8c1824); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:359 |
| literal-color | #8e1420 | danger | F3/F7: nearest authored Concrete & Signal reference RGB (#8c1824); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:262 |
| literal-color | #8e1a3e | danger | F3/F7: nearest authored Concrete & Signal reference RGB (#8c1824); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:464 |
| literal-color | #8e6040 | fg-faint | F3/F7: nearest authored Concrete & Signal reference RGB (#5c6166); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:380 |
| literal-color | #909090 | fg-faint | F3/F7: nearest authored Concrete & Signal reference RGB (#8e9298); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:505, src/lib/theme/defaults.ts:522, src/lib/theme/defaults.ts:530 (all in JSON) |
| literal-color | #922820 | danger | F3/F7: nearest authored Concrete & Signal reference RGB (#8c1824); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:176 |
| literal-color | #92400e | danger | F3/F7: nearest authored Concrete & Signal reference RGB (#8c1824); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:40 |
| literal-color | #9333ea | chart-1 | F3/F7: nearest authored Concrete & Signal reference RGB (#ff00ff); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:84 |
| literal-color | #93c5fd | surface-active | F3/F7: nearest authored Concrete & Signal reference RGB (#c2c7cc); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:71 |
| literal-color | #94a3b8 | fg-secondary | F3/F7: nearest authored Concrete & Signal reference RGB (#98a0a8); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:15 |
| literal-color | #97111d | brand-active | F3/F7: nearest authored Concrete & Signal reference RGB (#97111d); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:71 |
| literal-color | #98a0a8 | fg-secondary | F3/F7: nearest authored Concrete & Signal reference RGB (#98a0a8); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:24, src/lib/theme/defaults.ts:41, src/lib/theme/defaults.ts:68 |
| literal-color | #991b1b | brand-active | F3/F7: nearest authored Concrete & Signal reference RGB (#97111d); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:32 |
| literal-color | #99f6e4 | success | F3/F7: nearest authored Concrete & Signal reference RGB (#cadcd5); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:59 |
| literal-color | #9a1520 | brand-active | F3/F7: nearest authored Concrete & Signal reference RGB (#97111d); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:166 |
| literal-color | #9a3412 | danger | F3/F7: nearest authored Concrete & Signal reference RGB (#8c1824); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:36 |
| literal-color | #9a6638 | warning | F3/F7: nearest authored Concrete & Signal reference RGB (#594628); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:184, src/lib/theme/defaults.ts:190, src/lib/theme/defaults.ts:192 |
| literal-color | #9c2a26 | danger | F3/F7: nearest authored Concrete & Signal reference RGB (#8c1824); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:271, src/lib/theme/defaults.ts:289 |
| literal-color | #9ca3af | fg-secondary | F3/F7: nearest authored Concrete & Signal reference RGB (#98a0a8); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:19 |
| literal-color | #9d174d | danger | F3/F7: nearest authored Concrete & Signal reference RGB (#8c1824); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:92 |
| literal-color | #9e1060 | brand-active | F3/F7: nearest authored Concrete & Signal reference RGB (#b61b28); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:454 |
| literal-color | #9e4c20 | brand-active | F3/F7: nearest authored Concrete & Signal reference RGB (#b61b28); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:551, src/lib/theme/defaults.ts:561 |
| literal-color | #9f1239 | brand-hover | F3/F7: nearest authored Concrete & Signal reference RGB (#b01422); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:96 |
| literal-color | #a05028 | brand-active | F3/F7: nearest authored Concrete & Signal reference RGB (#b61b28); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:280, src/lib/theme/defaults.ts:284, src/lib/theme/defaults.ts:288 |
| literal-color | #a05050 | brand-hover | F3/F7: nearest authored Concrete & Signal reference RGB (#e13a46); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:97 |
| literal-color | #a16207 | brand-active | F3/F7: nearest authored Concrete & Signal reference RGB (#b61b28); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:44 |
| literal-color | #a1a1aa | fg-secondary | F3/F7: nearest authored Concrete & Signal reference RGB (#98a0a8); role overrides numeric proximity; alpha stays theme-owned | src/components/ErrorBoundary.tsx:34, src/lib/chartSetup.ts:26, src/lib/theme/defaults.ts:120 (all in JSON) |
| literal-color | #a21caf | fg-faint | F3/F7: nearest authored Concrete & Signal reference RGB (#8e9298); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:88 |
| literal-color | #a298b4 | fg-secondary | F3/F7: nearest authored Concrete & Signal reference RGB (#98a0a8); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:356 |
| literal-color | #a3e635 | fg-faint | F3/F7: nearest authored Concrete & Signal reference RGB (#8e9298); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:47 |
| literal-color | #a4a4a8 | fg-secondary | F3/F7: nearest authored Concrete & Signal reference RGB (#98a0a8); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:164 |
| literal-color | #a4b1bc | info | F3/F7: nearest authored Concrete & Signal reference RGB (#b4bac0); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:225 |
| literal-color | #a5b4fc | surface-active | F3/F7: nearest authored Concrete & Signal reference RGB (#c2c7cc); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:75 |
| literal-color | #a5f3fc | success | F3/F7: nearest authored Concrete & Signal reference RGB (#cadcd5); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:63 |
| literal-color | #a61a26 | brand-hover | F3/F7: nearest authored Concrete & Signal reference RGB (#b01422); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:125, src/lib/theme/defaults.ts:221 |
| literal-color | #a78b5e | fg-faint | F3/F7: nearest authored Concrete & Signal reference RGB (#8e9298); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:52 |
| literal-color | #a78bfa | info | F3/F7: nearest authored Concrete & Signal reference RGB (#b4bac0); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:79 |
| literal-color | #a7f3d0 | success | F3/F7: nearest authored Concrete & Signal reference RGB (#cadcd5); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:55 |
| literal-color | #a81069 | brand-active | F3/F7: nearest authored Concrete & Signal reference RGB (#b61b28); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:358, src/lib/theme/defaults.ts:368 |
| literal-color | #a81824 | brand-hover | F3/F7: nearest authored Concrete & Signal reference RGB (#b01422); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:261 |
| literal-color | #a8224a | brand-active | F3/F7: nearest authored Concrete & Signal reference RGB (#b61b28); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:463, src/lib/theme/defaults.ts:481 |
| literal-color | #a8302a | brand-active | F3/F7: nearest authored Concrete & Signal reference RGB (#b61b28); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:175, src/lib/theme/defaults.ts:193 |
| literal-color | #a855f7 | fg-secondary | F3/F7: nearest authored Concrete & Signal reference RGB (#98a0a8); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:84 |
| literal-color | #a89858 | fg-faint | F3/F7: nearest authored Concrete & Signal reference RGB (#8e9298); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:235, src/lib/theme/defaults.ts:244, src/lib/theme/defaults.ts:245 |
| literal-color | #a8a094 | fg-secondary | F3/F7: nearest authored Concrete & Signal reference RGB (#98a0a8); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:260 |
| literal-color | #a8a29e | fg-secondary | F3/F7: nearest authored Concrete & Signal reference RGB (#98a0a8); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:27 |
| literal-color | #a9b1d6 | info | F3/F7: nearest authored Concrete & Signal reference RGB (#b4bac0); role overrides numeric proximity; alpha stays theme-owned | src/components/chat/ShellMessage.tsx:58 |
| literal-color | #aaa | fg-secondary | F3/F7: nearest authored Concrete & Signal reference RGB (#98a0a8); role overrides numeric proximity; alpha stays theme-owned | src/components/chat/LayoutMenu.tsx:202 |
| literal-color | #b01422 | brand-hover | F3/F7: nearest authored Concrete & Signal reference RGB (#b01422); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:70, src/lib/theme/defaults.ts:80 |
| literal-color | #b09060 | fg-faint | F3/F7: nearest authored Concrete & Signal reference RGB (#8e9298); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:54 |
| literal-color | #b0a0c8 | info | F3/F7: nearest authored Concrete & Signal reference RGB (#b4bac0); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:532 |
| literal-color | #b0a0d8 | info | F3/F7: nearest authored Concrete & Signal reference RGB (#b4bac0); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:312, src/lib/theme/defaults.ts:338 |
| literal-color | #b0a89c | fg-secondary | F3/F7: nearest authored Concrete & Signal reference RGB (#98a0a8); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:216 |
| literal-color | #b41a26 | brand-active | F3/F7: nearest authored Concrete & Signal reference RGB (#b61b28); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:165 |
| literal-color | #b45309 | brand-active | F3/F7: nearest authored Concrete & Signal reference RGB (#b61b28); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:40 |
| literal-color | #b4b4b4 | info | F3/F7: nearest authored Concrete & Signal reference RGB (#b4bac0); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:543 |
| literal-color | #b61b28 | brand-active | F3/F7: nearest authored Concrete & Signal reference RGB (#b61b28); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:29 |
| literal-color | #b8146e | brand-hover | F3/F7: nearest authored Concrete & Signal reference RGB (#e13a46); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:453 |
| literal-color | #b85a28 | brand-hover | F3/F7: nearest authored Concrete & Signal reference RGB (#e13a46); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:550, src/lib/theme/defaults.ts:560, src/lib/theme/defaults.ts:569 (all in JSON) |
| literal-color | #b86b00 | brand-active | F3/F7: nearest authored Concrete & Signal reference RGB (#b61b28); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:472, src/lib/theme/defaults.ts:478, src/lib/theme/defaults.ts:480 |
| literal-color | #b8744a | brand-hover | F3/F7: nearest authored Concrete & Signal reference RGB (#e13a46); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:238, src/lib/theme/defaults.ts:242, src/lib/theme/defaults.ts:246 |
| literal-color | #b91c1c | brand-active | F3/F7: nearest authored Concrete & Signal reference RGB (#b61b28); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:32 |
| literal-color | #bae6fd | surface | F3/F7: nearest authored Concrete & Signal reference RGB (#dde0e3); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:67 |
| literal-color | #bbf7d0 | success | F3/F7: nearest authored Concrete & Signal reference RGB (#cadcd5); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:51 |
| literal-color | #bcaecc | info | F3/F7: nearest authored Concrete & Signal reference RGB (#b4bac0); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:350 |
| literal-color | #be123c | brand | F3/F7: nearest authored Concrete & Signal reference RGB (#c81828); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:96 |
| literal-color | #be185d | brand | F3/F7: nearest authored Concrete & Signal reference RGB (#d4202e); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:92 |
| literal-color | #bef264 | warning | F3/F7: nearest authored Concrete & Signal reference RGB (#e2d6c4); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:47 |
| literal-color | #bfb490 | info | F3/F7: nearest authored Concrete & Signal reference RGB (#b4bac0); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:446 |
| literal-color | #bfdbfe | surface | F3/F7: nearest authored Concrete & Signal reference RGB (#dde0e3); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:71 |
| literal-color | #c026d3 | chart-1 | F3/F7: nearest authored Concrete & Signal reference RGB (#ff00ff); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:88 |
| literal-color | #c0622c | brand-hover | F3/F7: nearest authored Concrete & Signal reference RGB (#e13a46); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:510 |
| literal-color | #c07070 | fg-faint | F3/F7: nearest authored Concrete & Signal reference RGB (#8e9298); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:55 |
| literal-color | #c084fc | info | F3/F7: nearest authored Concrete & Signal reference RGB (#b4bac0); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:83 |
| literal-color | #c08858 | fg-faint | F3/F7: nearest authored Concrete & Signal reference RGB (#8e9298); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:142, src/lib/theme/defaults.ts:148, src/lib/theme/defaults.ts:150 |
| literal-color | #c0c4c8 | surface-active | F3/F7: nearest authored Concrete & Signal reference RGB (#c2c7cc); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:43 |
| literal-color | #c14a45 | brand-hover | F3/F7: nearest authored Concrete & Signal reference RGB (#e13a46); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:133, src/lib/theme/defaults.ts:151, src/lib/theme/defaults.ts:229 (all in JSON) |
| literal-color | #c2410c | brand-active | F3/F7: nearest authored Concrete & Signal reference RGB (#b61b28); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:376, src/lib/theme/defaults.ts:382, src/lib/theme/defaults.ts:384 (all in JSON) |
| literal-color | #c2c7cc | surface-active | F3/F7: nearest authored Concrete & Signal reference RGB (#c2c7cc); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:62 |
| literal-color | #c4147a | brand-hover | F3/F7: nearest authored Concrete & Signal reference RGB (#e13a46); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:357, src/lib/theme/defaults.ts:367, src/lib/theme/defaults.ts:385 |
| literal-color | #c4b5fd | primary-active | F3/F7: nearest authored Concrete & Signal reference RGB (#cfd4d8); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:79 |
| literal-color | #c4c4c4 | surface-active | F3/F7: nearest authored Concrete & Signal reference RGB (#c2c7cc); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:542 |
| literal-color | #c7d2fe | surface | F3/F7: nearest authored Concrete & Signal reference RGB (#dde0e3); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:75 |
| literal-color | #c81828 | brand | F3/F7: nearest authored Concrete & Signal reference RGB (#c81828); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:69, src/lib/theme/defaults.ts:79, src/lib/theme/defaults.ts:88 |
| literal-color | #c8202e | brand | F3/F7: nearest authored Concrete & Signal reference RGB (#c81828); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:123, src/lib/theme/defaults.ts:219 |
| literal-color | #c8be9c | danger | F3/F7: nearest authored Concrete & Signal reference RGB (#e2adb4); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:447 |
| literal-color | #c8c8c8 | surface-active | F3/F7: nearest authored Concrete & Signal reference RGB (#c2c7cc); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:524, src/lib/theme/defaults.ts:544 |
| literal-color | #c8e0f0 | surface | F3/F7: nearest authored Concrete & Signal reference RGB (#dde0e3); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:407 |
| literal-color | #ca8a04 | brand-hover | F3/F7: nearest authored Concrete & Signal reference RGB (#e13a46); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:44 |
| literal-color | #cbd5e1 | primary-active | F3/F7: nearest authored Concrete & Signal reference RGB (#cfd4d8); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:15 |
| literal-color | #ccc4b0 | surface-active | F3/F7: nearest authored Concrete & Signal reference RGB (#c2c7cc); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:254 |
| literal-color | #ccfbf1 | border-subtle | F3/F7: nearest authored Concrete & Signal reference RGB (#e2e5e8); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:59 |
| literal-color | #cdc0dc | primary-active | F3/F7: nearest authored Concrete & Signal reference RGB (#cfd4d8); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:349 |
| literal-color | #cecec8 | surface-active | F3/F7: nearest authored Concrete & Signal reference RGB (#c2c7cc); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:158 |
| literal-color | #cfc6a8 | danger-hover | F3/F7: nearest authored Concrete & Signal reference RGB (#e3b4bb); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:445 |
| literal-color | #cfd4d8 | primary-active | F3/F7: nearest authored Concrete & Signal reference RGB (#cfd4d8); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:34 |
| literal-color | #cffafe | fg | F3/F7: nearest authored Concrete & Signal reference RGB (#e8eaed); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:63 |
| literal-color | #d05e59 | brand-hover | F3/F7: nearest authored Concrete & Signal reference RGB (#e13a46); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:134, src/lib/theme/defaults.ts:230 |
| literal-color | #d0c4dc | surface-hover | F3/F7: nearest authored Concrete & Signal reference RGB (#d0d4d8); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:351 |
| literal-color | #d0d4d8 | surface-hover | F3/F7: nearest authored Concrete & Signal reference RGB (#d0d4d8); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:61, src/lib/theme/defaults.ts:63 |
| literal-color | #d1d5db | surface-hover | F3/F7: nearest authored Concrete & Signal reference RGB (#d0d4d8); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:19 |
| literal-color | #d1fae5 | border-subtle | F3/F7: nearest authored Concrete & Signal reference RGB (#e2e5e8); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:55 |
| literal-color | #d4202e | brand | F3/F7: nearest authored Concrete & Signal reference RGB (#d4202e); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:27, src/lib/theme/defaults.ts:37, src/lib/theme/defaults.ts:46 |
| literal-color | #d4cab8 | warning | F3/F7: nearest authored Concrete & Signal reference RGB (#e2d6c4); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:255 |
| literal-color | #d4d4d4 | surface-hover | F3/F7: nearest authored Concrete & Signal reference RGB (#d0d4d8); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:541 |
| literal-color | #d4d4d8 | surface-hover | F3/F7: nearest authored Concrete & Signal reference RGB (#d0d4d8); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:23 |
| literal-color | #d6d3d1 | surface-hover | F3/F7: nearest authored Concrete & Signal reference RGB (#d0d4d8); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:27 |
| literal-color | #d83a46 | brand-hover | F3/F7: nearest authored Concrete & Signal reference RGB (#e13a46); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:124, src/lib/theme/defaults.ts:220 |
| literal-color | #d8b4fe | surface-hover | F3/F7: nearest authored Concrete & Signal reference RGB (#d0d4d8); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:83 |
| literal-color | #d8d0c0 | warning | F3/F7: nearest authored Concrete & Signal reference RGB (#e2d6c4); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:253 |
| literal-color | #d8d8d4 | surface-hover | F3/F7: nearest authored Concrete & Signal reference RGB (#d0d4d8); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:159 |
| literal-color | #d946ef | chart-1 | F3/F7: nearest authored Concrete & Signal reference RGB (#ff00ff); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:88 |
| literal-color | #d97706 | brand-hover | F3/F7: nearest authored Concrete & Signal reference RGB (#e13a46); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:40 |
| literal-color | #d97742 | brand-hover | F3/F7: nearest authored Concrete & Signal reference RGB (#e13a46); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:508, src/lib/theme/defaults.ts:518, src/lib/theme/defaults.ts:527 (all in JSON) |
| literal-color | #d9f99d | warning | F3/F7: nearest authored Concrete & Signal reference RGB (#e2d6c4); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:47 |
| literal-color | #db2777 | brand-hover | F3/F7: nearest authored Concrete & Signal reference RGB (#e13a46); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:92 |
| literal-color | #dbeafe | fg | F3/F7: nearest authored Concrete & Signal reference RGB (#e8eaed); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:71 |
| literal-color | #dc2626 | brand | F3/F7: nearest authored Concrete & Signal reference RGB (#d4202e); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:32 |
| literal-color | #dcd4b8 | warning | F3/F7: nearest authored Concrete & Signal reference RGB (#e2d6c4); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:448 |
| literal-color | #dcdcd8 | surface | F3/F7: nearest authored Concrete & Signal reference RGB (#dde0e3); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:157 |
| literal-color | #dcdcdc | surface | F3/F7: nearest authored Concrete & Signal reference RGB (#dde0e3); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:545 |
| literal-color | #dcfce7 | fg | F3/F7: nearest authored Concrete & Signal reference RGB (#e8eaed); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:51 |
| literal-color | #ddd2e8 | surface | F3/F7: nearest authored Concrete & Signal reference RGB (#dde0e3); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:348 |
| literal-color | #ddd6fe | border-subtle | F3/F7: nearest authored Concrete & Signal reference RGB (#e2e5e8); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:79 |
| literal-color | #dde0e3 | surface | F3/F7: nearest authored Concrete & Signal reference RGB (#dde0e3); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:60 |
| literal-color | #dfd8c0 | warning | F3/F7: nearest authored Concrete & Signal reference RGB (#e2d6c4); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:444 |
| literal-color | #e0e0e0 | surface | F3/F7: nearest authored Concrete & Signal reference RGB (#dde0e3); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:515 |
| literal-color | #e0e7ff | fg | F3/F7: nearest authored Concrete & Signal reference RGB (#e8eaed); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:75 |
| literal-color | #e0f2fe | fg | F3/F7: nearest authored Concrete & Signal reference RGB (#e8eaed); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:67 |
| literal-color | #e11d48 | brand-hover | F3/F7: nearest authored Concrete & Signal reference RGB (#e13a46); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:96 |
| literal-color | #e13a46 | brand-hover | F3/F7: nearest authored Concrete & Signal reference RGB (#e13a46); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:28, src/lib/theme/defaults.ts:38 |
| literal-color | #e2dac8 | warning | F3/F7: nearest authored Concrete & Signal reference RGB (#e2d6c4); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:256 |
| literal-color | #e2e5e8 | border-subtle | F3/F7: nearest authored Concrete & Signal reference RGB (#e2e5e8); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:64 |
| literal-color | #e2e8f0 | fg | F3/F7: nearest authored Concrete & Signal reference RGB (#e8eaed); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:15 |
| literal-color | #e38a57 | brand-hover | F3/F7: nearest authored Concrete & Signal reference RGB (#e13a46); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:509, src/lib/theme/defaults.ts:519 |
| literal-color | #e4daee | border-subtle | F3/F7: nearest authored Concrete & Signal reference RGB (#e2e5e8); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:352 |
| literal-color | #e4ddd0 | warning | F3/F7: nearest authored Concrete & Signal reference RGB (#e2d6c4); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:252 |
| literal-color | #e4e4e7 | border-subtle | F3/F7: nearest authored Concrete & Signal reference RGB (#e2e5e8); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:23 |
| literal-color | #e5e7eb | fg | F3/F7: nearest authored Concrete & Signal reference RGB (#e8eaed); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:19 |
| literal-color | #e61478 | brand-hover | F3/F7: nearest authored Concrete & Signal reference RGB (#e13a46); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:317, src/lib/theme/defaults.ts:413 |
| literal-color | #e7e5e4 | border-subtle | F3/F7: nearest authored Concrete & Signal reference RGB (#e2e5e8); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:27 |
| literal-color | #e7e7e4 | border-subtle | F3/F7: nearest authored Concrete & Signal reference RGB (#e2e5e8); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:156 |
| literal-color | #e879f9 | danger-hover | F3/F7: nearest authored Concrete & Signal reference RGB (#e3b4bb); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:87 |
| literal-color | #e8e8e4 | border-subtle | F3/F7: nearest authored Concrete & Signal reference RGB (#e2e5e8); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:160 |
| literal-color | #e8eaed | fg | F3/F7: nearest authored Concrete & Signal reference RGB (#e8eaed); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:23, src/lib/theme/defaults.ts:32 |
| literal-color | #e9d5ff | fg | F3/F7: nearest authored Concrete & Signal reference RGB (#e8eaed); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:83 |
| literal-color | #ea580c | brand-hover | F3/F7: nearest authored Concrete & Signal reference RGB (#e13a46); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:36 |
| literal-color | #eab308 | brand-hover | F3/F7: nearest authored Concrete & Signal reference RGB (#e13a46); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:44 |
| literal-color | #ec4899 | brand-hover | F3/F7: nearest authored Concrete & Signal reference RGB (#e13a46); role overrides numeric proximity; alpha stays theme-owned | src/components/settings/observability/ProviderDistributionChart.tsx:11, src/lib/theme/tailwind-swatches.ts:92 |
| literal-color | #ecfccb | border-subtle | F3/F7: nearest authored Concrete & Signal reference RGB (#e2e5e8); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:47 |
| literal-color | #ecfdf5 | bg | F3/F7: nearest authored Concrete & Signal reference RGB (#f4f5f6); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:55 |
| literal-color | #ecfeff | bg | F3/F7: nearest authored Concrete & Signal reference RGB (#f4f5f6); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:63 |
| literal-color | #ede9fe | bg | F3/F7: nearest authored Concrete & Signal reference RGB (#f4f5f6); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:79 |
| literal-color | #ededed | fg | F3/F7: nearest authored Concrete & Signal reference RGB (#e8eaed); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:539 |
| literal-color | #eee | fg | F3/F7: nearest authored Concrete & Signal reference RGB (#e8eaed); role overrides numeric proximity; alpha stays theme-owned | src/components/chat/LayoutMenu.tsx:199 |
| literal-color | #eef2ff | bg | F3/F7: nearest authored Concrete & Signal reference RGB (#f4f5f6); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:75 |
| literal-color | #ef4444 | brand-hover | F3/F7: nearest authored Concrete & Signal reference RGB (#e13a46); role overrides numeric proximity; alpha stays theme-owned | src/components/ErrorBoundary.tsx:29, src/lib/theme/tailwind-swatches.ts:32 |
| literal-color | #eff6ff | bg | F3/F7: nearest authored Concrete & Signal reference RGB (#f4f5f6); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:71 |
| literal-color | #f0abfc | surface | F3/F7: nearest authored Concrete & Signal reference RGB (#dde0e3); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:87 |
| literal-color | #f0e8ff | bg | F3/F7: nearest authored Concrete & Signal reference RGB (#f4f5f6); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:311 |
| literal-color | #f0eae0 | fg | F3/F7: nearest authored Concrete & Signal reference RGB (#e8eaed); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:215 |
| literal-color | #f0f0f0 | bg | F3/F7: nearest authored Concrete & Signal reference RGB (#f4f5f6); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:504, src/lib/theme/defaults.ts:514 |
| literal-color | #f0f9ff | bg | F3/F7: nearest authored Concrete & Signal reference RGB (#f4f5f6); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:67 |
| literal-color | #f0fdf4 | bg | F3/F7: nearest authored Concrete & Signal reference RGB (#f4f5f6); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:51 |
| literal-color | #f0fdfa | bg | F3/F7: nearest authored Concrete & Signal reference RGB (#f4f5f6); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:59 |
| literal-color | #f1f5f9 | bg | F3/F7: nearest authored Concrete & Signal reference RGB (#f4f5f6); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:15 |
| literal-color | #f3e8ff | bg | F3/F7: nearest authored Concrete & Signal reference RGB (#f4f5f6); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:83 |
| literal-color | #f3f4f6 | bg | F3/F7: nearest authored Concrete & Signal reference RGB (#f4f5f6); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:19 |
| literal-color | #f43f5e | brand-hover | F3/F7: nearest authored Concrete & Signal reference RGB (#e13a46); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:96 |
| literal-color | #f472b6 | danger | F3/F7: nearest authored Concrete & Signal reference RGB (#e2adb4); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:91 |
| literal-color | #f4f1e8 | bg | F3/F7: nearest authored Concrete & Signal reference RGB (#f4f5f6); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:442 |
| literal-color | #f4f4f5 | bg | F3/F7: nearest authored Concrete & Signal reference RGB (#f4f5f6); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:119, src/lib/theme/tailwind-swatches.ts:23 |
| literal-color | #f4f5f6 | bg | F3/F7: nearest authored Concrete & Signal reference RGB (#f4f5f6); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:58 |
| literal-color | #f59e0b | brand-hover | F3/F7: nearest authored Concrete & Signal reference RGB (#e13a46); role overrides numeric proximity; alpha stays theme-owned | src/components/settings/observability/ProviderDistributionChart.tsx:10, src/lib/theme/tailwind-swatches.ts:40 |
| literal-color | #f5d0fe | fg | F3/F7: nearest authored Concrete & Signal reference RGB (#e8eaed); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:87 |
| literal-color | #f5f0fa | bg | F3/F7: nearest authored Concrete & Signal reference RGB (#f4f5f6); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:346 |
| literal-color | #f5f1ea | bg | F3/F7: nearest authored Concrete & Signal reference RGB (#f4f5f6); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:250 |
| literal-color | #f5f3ff | bg | F3/F7: nearest authored Concrete & Signal reference RGB (#f4f5f6); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:79 |
| literal-color | #f5f5f4 | bg | F3/F7: nearest authored Concrete & Signal reference RGB (#f4f5f6); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:27 |
| literal-color | #f7f7f6 | bg | F3/F7: nearest authored Concrete & Signal reference RGB (#f4f5f6); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:154 |
| literal-color | #f7fee7 | bg | F3/F7: nearest authored Concrete & Signal reference RGB (#f4f5f6); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:47 |
| literal-color | #f87171 | brand-hover | F3/F7: nearest authored Concrete & Signal reference RGB (#e13a46); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:31 |
| literal-color | #f8f8f8 | bg | F3/F7: nearest authored Concrete & Signal reference RGB (#f4f5f6); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:540 |
| literal-color | #f8fafc | bg | F3/F7: nearest authored Concrete & Signal reference RGB (#f4f5f6); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:15 |
| literal-color | #f97316 | brand-hover | F3/F7: nearest authored Concrete & Signal reference RGB (#e13a46); role overrides numeric proximity; alpha stays theme-owned | src/components/settings/observability/ProviderDistributionChart.tsx:14, src/lib/theme/tailwind-swatches.ts:36 |
| literal-color | #f9a8d4 | danger-hover | F3/F7: nearest authored Concrete & Signal reference RGB (#e3b4bb); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:91 |
| literal-color | #f9fafb | bg | F3/F7: nearest authored Concrete & Signal reference RGB (#f4f5f6); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:19 |
| literal-color | #facc15 | brand-hover | F3/F7: nearest authored Concrete & Signal reference RGB (#e13a46); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:43 |
| literal-color | #fae8ff | bg | F3/F7: nearest authored Concrete & Signal reference RGB (#f4f5f6); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:87 |
| literal-color | #faf5ff | bg | F3/F7: nearest authored Concrete & Signal reference RGB (#f4f5f6); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:83 |
| literal-color | #fafaf9 | bg | F3/F7: nearest authored Concrete & Signal reference RGB (#f4f5f6); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:27 |
| literal-color | #fafafa | divider | F3/F7: nearest authored Concrete & Signal reference RGB (rgba(255, 255, 255, 0.06)); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:23 |
| literal-color | #fb7185 | danger | F3/F7: nearest authored Concrete & Signal reference RGB (#e2adb4); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:95 |
| literal-color | #fb923c | brand-hover | F3/F7: nearest authored Concrete & Signal reference RGB (#e13a46); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:35 |
| literal-color | #fbbf24 | brand-hover | F3/F7: nearest authored Concrete & Signal reference RGB (#e13a46); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:39 |
| literal-color | #fbcfe8 | border-subtle | F3/F7: nearest authored Concrete & Signal reference RGB (#e2e5e8); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:91 |
| literal-color | #fbf8f2 | bg | F3/F7: nearest authored Concrete & Signal reference RGB (#f4f5f6); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:251 |
| literal-color | #fbf9f2 | bg | F3/F7: nearest authored Concrete & Signal reference RGB (#f4f5f6); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:443 |
| literal-color | #fca5a5 | danger | F3/F7: nearest authored Concrete & Signal reference RGB (#e2adb4); role overrides numeric proximity; alpha stays theme-owned | src/components/ErrorBoundary.tsx:31, src/lib/theme/tailwind-swatches.ts:31 |
| literal-color | #fcd34d | danger | F3/F7: nearest authored Concrete & Signal reference RGB (#e2adb4); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:39 |
| literal-color | #fce7f3 | bg | F3/F7: nearest authored Concrete & Signal reference RGB (#f4f5f6); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:91 |
| literal-color | #fda4af | danger | F3/F7: nearest authored Concrete & Signal reference RGB (#e2adb4); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:95 |
| literal-color | #fdba74 | danger | F3/F7: nearest authored Concrete & Signal reference RGB (#e2adb4); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:35 |
| literal-color | #fde047 | danger | F3/F7: nearest authored Concrete & Signal reference RGB (#e2adb4); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:43 |
| literal-color | #fde68a | warning | F3/F7: nearest authored Concrete & Signal reference RGB (#e2d6c4); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:39 |
| literal-color | #fdf2f8 | bg | F3/F7: nearest authored Concrete & Signal reference RGB (#f4f5f6); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:91 |
| literal-color | #fdf4ff | divider | F3/F7: nearest authored Concrete & Signal reference RGB (rgba(255, 255, 255, 0.06)); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:87 |
| literal-color | #fecaca | warning | F3/F7: nearest authored Concrete & Signal reference RGB (#e2d6c4); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:31 |
| literal-color | #fecdd3 | warning | F3/F7: nearest authored Concrete & Signal reference RGB (#e2d6c4); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:95 |
| literal-color | #fed7aa | warning | F3/F7: nearest authored Concrete & Signal reference RGB (#e2d6c4); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:35 |
| literal-color | #fee2e2 | fg | F3/F7: nearest authored Concrete & Signal reference RGB (#e8eaed); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:31 |
| literal-color | #fef08a | warning | F3/F7: nearest authored Concrete & Signal reference RGB (#e2d6c4); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:43 |
| literal-color | #fef2f2 | bg | F3/F7: nearest authored Concrete & Signal reference RGB (#f4f5f6); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:31 |
| literal-color | #fef3c7 | warning | F3/F7: nearest authored Concrete & Signal reference RGB (#e2d6c4); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:39 |
| literal-color | #fef9c3 | warning | F3/F7: nearest authored Concrete & Signal reference RGB (#e2d6c4); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:43 |
| literal-color | #fefce8 | bg | F3/F7: nearest authored Concrete & Signal reference RGB (#f4f5f6); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:43 |
| literal-color | #ff2d92 | brand-hover | F3/F7: nearest authored Concrete & Signal reference RGB (#e13a46); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:315, src/lib/theme/defaults.ts:325, src/lib/theme/defaults.ts:343 (all in JSON) |
| literal-color | #ff4d6e | brand-hover | F3/F7: nearest authored Concrete & Signal reference RGB (#e13a46); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:421, src/lib/theme/defaults.ts:439 |
| literal-color | #ff52a4 | danger | F3/F7: nearest authored Concrete & Signal reference RGB (#e2adb4); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:316, src/lib/theme/defaults.ts:326, src/lib/theme/defaults.ts:412 |
| literal-color | #ff7085 | danger | F3/F7: nearest authored Concrete & Signal reference RGB (#e2adb4); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:422 |
| literal-color | #ffaa00 | brand-hover | F3/F7: nearest authored Concrete & Signal reference RGB (#e13a46); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:430, src/lib/theme/defaults.ts:436, src/lib/theme/defaults.ts:438 |
| literal-color | #ffaa44 | danger | F3/F7: nearest authored Concrete & Signal reference RGB (#e2adb4); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:334, src/lib/theme/defaults.ts:340, src/lib/theme/defaults.ts:342 |
| literal-color | #ffe4e6 | fg | F3/F7: nearest authored Concrete & Signal reference RGB (#e8eaed); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:95 |
| literal-color | #ffedd5 | fg | F3/F7: nearest authored Concrete & Signal reference RGB (#e8eaed); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:35 |
| literal-color | #fff | divider | F3/F7: nearest authored Concrete & Signal reference RGB (rgba(255, 255, 255, 0.06)); role overrides numeric proximity; alpha stays theme-owned | src/components/chat/LayoutMenu.tsx:198, src/components/chat/LayoutMenu.tsx:201 |
| literal-color | #fff1f2 | bg | F3/F7: nearest authored Concrete & Signal reference RGB (#f4f5f6); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:95 |
| literal-color | #fff7ed | bg | F3/F7: nearest authored Concrete & Signal reference RGB (#f4f5f6); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:35 |
| literal-color | #fffbeb | bg | F3/F7: nearest authored Concrete & Signal reference RGB (#f4f5f6); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/tailwind-swatches.ts:39 |
| literal-color | #ffffff | divider | F3/F7: nearest authored Concrete & Signal reference RGB (rgba(255, 255, 255, 0.06)); role overrides numeric proximity; alpha stays theme-owned | src/components/chat/LayoutMenu.tsx:119, src/components/settings/observability/ProviderDistributionChart.tsx:61, src/lib/theme/defaults.ts:127 (all in JSON) |
| literal-color | rgb(') | fg-secondary | F3/F7: dynamic/unparsed paint; nearest neutral role, resolve via reviewed theme adapter; never fixed component color | src/components/settings/appearance/ColorPickerPopover.tsx:61 |
| literal-color | rgba(${r}, ${g}, ${b}, ${a.toFixed(2) | fg-secondary | F3/F7: dynamic/unparsed paint; nearest neutral role, resolve via reviewed theme adapter; never fixed component color | src/components/settings/appearance/ColorPickerPopover.tsx:130, src/components/settings/appearance/ColorPickerPopover.tsx:39 |
| literal-color | rgba(') | fg-secondary | F3/F7: dynamic/unparsed paint; nearest neutral role, resolve via reviewed theme adapter; never fixed component color | src/components/settings/appearance/ColorPickerPopover.tsx:61 |
| literal-color | rgba(...) | fg-secondary | F3/F7: dynamic/unparsed paint; nearest neutral role, resolve via reviewed theme adapter; never fixed component color | src/components/settings/appearance/ColorPickerPopover.tsx:106 |
| literal-color | rgba(0, 0, 0, 0.06) | primary-fg | F3/F7: nearest authored Concrete & Signal reference RGB (#000000); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:186, src/lib/theme/defaults.ts:571, src/lib/theme/defaults.ts:90 |
| literal-color | rgba(0, 110, 140, 0.07) | success | F3/F7: nearest authored Concrete & Signal reference RGB (#304f42); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:468 |
| literal-color | rgba(0, 110, 140, 0.08) | success | F3/F7: nearest authored Concrete & Signal reference RGB (#304f42); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:461 |
| literal-color | rgba(0, 224, 255, 0.08) | fg-secondary | F3/F7: nearest authored Concrete & Signal reference RGB (#98a0a8); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:426, src/lib/theme/defaults.ts:432 |
| literal-color | rgba(0, 224, 255, 0.10) | fg-secondary | F3/F7: nearest authored Concrete & Signal reference RGB (#98a0a8); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:419 |
| literal-color | rgba(0, 229, 255, 0.12) | fg-secondary | F3/F7: nearest authored Concrete & Signal reference RGB (#98a0a8); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:330 |
| literal-color | rgba(0, 229, 255, 0.14) | fg-secondary | F3/F7: nearest authored Concrete & Signal reference RGB (#98a0a8); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:323 |
| literal-color | rgba(0,0,0,0.04) | primary-fg | F3/F7: nearest authored Concrete & Signal reference RGB (#000000); role overrides numeric proximity; alpha stays theme-owned | src/components/chat/Banner.tsx:55, src/components/chat/composer/Drawer.tsx:54 |
| literal-color | rgba(0,0,0,0.10) | primary-fg | F3/F7: nearest authored Concrete & Signal reference RGB (#000000); role overrides numeric proximity; alpha stays theme-owned | src/components/chat/LayoutMenu.tsx:215 |
| literal-color | rgba(0,0,0,0.12) | primary-fg | F3/F7: nearest authored Concrete & Signal reference RGB (#000000); role overrides numeric proximity; alpha stays theme-owned | src/components/chat/LayoutMenu.tsx:132 |
| literal-color | rgba(0,0,0,0.18) | primary-fg | F3/F7: nearest authored Concrete & Signal reference RGB (#000000); role overrides numeric proximity; alpha stays theme-owned | src/components/chat/composer/Drawer.tsx:54 |
| literal-color | rgba(0,0,0,0.22) | primary-fg | F3/F7: nearest authored Concrete & Signal reference RGB (#000000); role overrides numeric proximity; alpha stays theme-owned | src/components/chat/Banner.tsx:55 |
| literal-color | rgba(10, 10, 10, 0.06) | bg | F3/F7: nearest authored Concrete & Signal reference RGB (#0c0d0e); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:558 |
| literal-color | rgba(10, 26, 36, 0.06) | bg-elevated | F3/F7: nearest authored Concrete & Signal reference RGB (#16181a); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:474 |
| literal-color | rgba(110, 138, 168, 0.14) | fg-faint | F3/F7: nearest authored Concrete & Signal reference RGB (#8e9298); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:138 |
| literal-color | rgba(110, 138, 168, 0.16) | fg-faint | F3/F7: nearest authored Concrete & Signal reference RGB (#8e9298); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:131 |
| literal-color | rgba(113, 113, 122, 0.15) | fg-faint | F3/F7: nearest authored Concrete & Signal reference RGB (#5c6166); role overrides numeric proximity; alpha stays theme-owned | src/components/settings/observability/DurationChart.tsx:38 |
| literal-color | rgba(138, 117, 48, 0.08) | warning | F3/F7: nearest authored Concrete & Signal reference RGB (#594628); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:278 |
| literal-color | rgba(138, 153, 166, 0.13) | fg-muted | F3/F7: nearest authored Concrete & Signal reference RGB (#91979e); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:234 |
| literal-color | rgba(138, 153, 166, 0.14) | fg-muted | F3/F7: nearest authored Concrete & Signal reference RGB (#91979e); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:227 |
| literal-color | rgba(139, 168, 136, 0.15) | fg-faint | F3/F7: nearest authored Concrete & Signal reference RGB (#8e9298); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:140 |
| literal-color | rgba(14, 116, 144, 0.09) | fg-muted | F3/F7: nearest authored Concrete & Signal reference RGB (#575d64); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:374 |
| literal-color | rgba(144, 144, 144, 0.08) | fg-faint | F3/F7: nearest authored Concrete & Signal reference RGB (#8e9298); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:523 |
| literal-color | rgba(15,17,22,0.06) | bg | F3/F7: nearest authored Concrete & Signal reference RGB (#0c0d0e); role overrides numeric proximity; alpha stays theme-owned | src/components/chat/LayoutMenu.tsx:490 |
| literal-color | rgba(15,17,22,0.18) | bg | F3/F7: nearest authored Concrete & Signal reference RGB (#0c0d0e); role overrides numeric proximity; alpha stays theme-owned | src/components/chat/LayoutMenu.tsx:337 |
| literal-color | rgba(15,17,22,0.32) | bg | F3/F7: nearest authored Concrete & Signal reference RGB (#0c0d0e); role overrides numeric proximity; alpha stays theme-owned | src/components/chat/LayoutMenu.tsx:182 |
| literal-color | rgba(152, 160, 168, 0.10) | fg-secondary | F3/F7: nearest authored Concrete & Signal reference RGB (#98a0a8); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:42 |
| literal-color | rgba(154, 102, 56, 0.09) | warning | F3/F7: nearest authored Concrete & Signal reference RGB (#594628); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:185 |
| literal-color | rgba(156, 42, 38, 0.07) | danger | F3/F7: nearest authored Concrete & Signal reference RGB (#8c1824); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:273 |
| literal-color | rgba(160, 80, 40, 0.08) | brand-active | F3/F7: nearest authored Concrete & Signal reference RGB (#b61b28); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:281 |
| literal-color | rgba(168, 152, 88, 0.14) | fg-faint | F3/F7: nearest authored Concrete & Signal reference RGB (#8e9298); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:236 |
| literal-color | rgba(168, 24, 36, 0.06) | brand-hover | F3/F7: nearest authored Concrete & Signal reference RGB (#b01422); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:264 |
| literal-color | rgba(168, 34, 74, 0.08) | brand-active | F3/F7: nearest authored Concrete & Signal reference RGB (#b61b28); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:465 |
| literal-color | rgba(168, 48, 42, 0.08) | brand-active | F3/F7: nearest authored Concrete & Signal reference RGB (#b61b28); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:177 |
| literal-color | rgba(17, 122, 74, 0.08) | success | F3/F7: nearest authored Concrete & Signal reference RGB (#304f42); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:470 |
| literal-color | rgba(180, 26, 38, 0.07) | brand-active | F3/F7: nearest authored Concrete & Signal reference RGB (#b61b28); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:168 |
| literal-color | rgba(184, 107, 0, 0.08) | brand-active | F3/F7: nearest authored Concrete & Signal reference RGB (#b61b28); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:473 |
| literal-color | rgba(184, 116, 74, 0.14) | brand-hover | F3/F7: nearest authored Concrete & Signal reference RGB (#e13a46); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:239 |
| literal-color | rgba(184, 20, 110, 0.07) | brand-hover | F3/F7: nearest authored Concrete & Signal reference RGB (#e13a46); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:456 |
| literal-color | rgba(184, 90, 40, 0.07) | brand-hover | F3/F7: nearest authored Concrete & Signal reference RGB (#e13a46); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:553 |
| literal-color | rgba(184, 90, 40, 0.08) | brand-hover | F3/F7: nearest authored Concrete & Signal reference RGB (#e13a46); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:570 |
| literal-color | rgba(184, 90, 40, 0.09) | brand-hover | F3/F7: nearest authored Concrete & Signal reference RGB (#e13a46); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:562 |
| literal-color | rgba(192, 136, 88, 0.14) | fg-faint | F3/F7: nearest authored Concrete & Signal reference RGB (#8e9298); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:143 |
| literal-color | rgba(192, 196, 200, 0.10) | surface-active | F3/F7: nearest authored Concrete & Signal reference RGB (#c2c7cc); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:44 |
| literal-color | rgba(193, 74, 69, 0.14) | brand-hover | F3/F7: nearest authored Concrete & Signal reference RGB (#e13a46); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:135, src/lib/theme/defaults.ts:231 |
| literal-color | rgba(194, 65, 12, 0.08) | brand-active | F3/F7: nearest authored Concrete & Signal reference RGB (#b61b28); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:377 |
| literal-color | rgba(196, 20, 122, 0.08) | brand-hover | F3/F7: nearest authored Concrete & Signal reference RGB (#e13a46); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:360, src/lib/theme/defaults.ts:369 |
| literal-color | rgba(200, 200, 200, 0.07) | surface-active | F3/F7: nearest authored Concrete & Signal reference RGB (#c2c7cc); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:525 |
| literal-color | rgba(200, 24, 40, 0.07) | brand | F3/F7: nearest authored Concrete & Signal reference RGB (#c81828); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:72, src/lib/theme/defaults.ts:89 |
| literal-color | rgba(200, 24, 40, 0.08) | brand | F3/F7: nearest authored Concrete & Signal reference RGB (#c81828); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:81 |
| literal-color | rgba(200, 32, 46, 0.12) | brand | F3/F7: nearest authored Concrete & Signal reference RGB (#c81828); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:126, src/lib/theme/defaults.ts:222 |
| literal-color | rgba(212, 32, 46, 0.12) | brand | F3/F7: nearest authored Concrete & Signal reference RGB (#d4202e); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:47 |
| literal-color | rgba(212, 32, 46, 0.14) | brand | F3/F7: nearest authored Concrete & Signal reference RGB (#d4202e); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:30, src/lib/theme/defaults.ts:39 |
| literal-color | rgba(217, 119, 66, 0.10) | brand-hover | F3/F7: nearest authored Concrete & Signal reference RGB (#e13a46); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:511, src/lib/theme/defaults.ts:528 |
| literal-color | rgba(217, 119, 66, 0.12) | brand-hover | F3/F7: nearest authored Concrete & Signal reference RGB (#e13a46); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:520 |
| literal-color | rgba(232, 234, 237, 0.10) | fg | F3/F7: nearest authored Concrete & Signal reference RGB (#e8eaed); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:35 |
| literal-color | rgba(24, 25, 27, 0.07) | fg | F3/F7: nearest authored Concrete & Signal reference RGB (#18191b); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:77 |
| literal-color | rgba(240, 232, 255, 0.08) | bg | F3/F7: nearest authored Concrete & Signal reference RGB (#f4f5f6); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:336 |
| literal-color | rgba(255, 170, 0, 0.10) | brand-hover | F3/F7: nearest authored Concrete & Signal reference RGB (#e13a46); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:431 |
| literal-color | rgba(255, 170, 68, 0.14) | danger | F3/F7: nearest authored Concrete & Signal reference RGB (#e2adb4); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:335 |
| literal-color | rgba(255, 240, 220, 0.08) | bg | F3/F7: nearest authored Concrete & Signal reference RGB (#f4f5f6); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:240 |
| literal-color | rgba(255, 255, 255, 0.08) | divider | F3/F7: nearest authored Concrete & Signal reference RGB (rgba(255, 255, 255, 0.06)); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:144, src/lib/theme/defaults.ts:48, src/lib/theme/defaults.ts:516 (all in JSON) |
| literal-color | rgba(255, 45, 146, 0.10) | brand-hover | F3/F7: nearest authored Concrete & Signal reference RGB (#e13a46); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:414 |
| literal-color | rgba(255, 45, 146, 0.14) | brand-hover | F3/F7: nearest authored Concrete & Signal reference RGB (#e13a46); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:318, src/lib/theme/defaults.ts:327 |
| literal-color | rgba(255, 77, 110, 0.10) | brand-hover | F3/F7: nearest authored Concrete & Signal reference RGB (#e13a46); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:423 |
| literal-color | rgba(29, 78, 216, 0.08) | fg-muted | F3/F7: nearest authored Concrete & Signal reference RGB (#575d64); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:372 |
| literal-color | rgba(29, 78, 216, 0.09) | fg-muted | F3/F7: nearest authored Concrete & Signal reference RGB (#575d64); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:365 |
| literal-color | rgba(40, 20, 60, 0.06) | surface | F3/F7: nearest authored Concrete & Signal reference RGB (#25282c); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:378 |
| literal-color | rgba(46, 229, 157, 0.10) | fg-muted | F3/F7: nearest authored Concrete & Signal reference RGB (#91979e); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:428 |
| literal-color | rgba(60, 40, 20, 0.06) | surface | F3/F7: nearest authored Concrete & Signal reference RGB (#25282c); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:282 |
| literal-color | rgba(60, 90, 120, 0.08) | fg-muted | F3/F7: nearest authored Concrete & Signal reference RGB (#575d64); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:180 |
| literal-color | rgba(60, 90, 120, 0.09) | fg-muted | F3/F7: nearest authored Concrete & Signal reference RGB (#575d64); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:173 |
| literal-color | rgba(74, 74, 74, 0.06) | info | F3/F7: nearest authored Concrete & Signal reference RGB (#464c53); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:565, src/lib/theme/defaults.ts:567 |
| literal-color | rgba(74, 80, 88, 0.07) | surface-active | F3/F7: nearest authored Concrete & Signal reference RGB (#4a5058); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:84 |
| literal-color | rgba(74, 80, 88, 0.08) | surface-active | F3/F7: nearest authored Concrete & Signal reference RGB (#4a5058); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:86 |
| literal-color | rgba(77, 93, 107, 0.07) | fg-muted | F3/F7: nearest authored Concrete & Signal reference RGB (#575d64); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:276 |
| literal-color | rgba(77, 93, 107, 0.08) | fg-muted | F3/F7: nearest authored Concrete & Signal reference RGB (#575d64); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:269 |
| literal-color | rgba(90, 120, 88, 0.10) | fg-faint | F3/F7: nearest authored Concrete & Signal reference RGB (#5c6166); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:182 |
| literal-color | rgba(94, 224, 184, 0.14) | fg-secondary | F3/F7: nearest authored Concrete & Signal reference RGB (#98a0a8); role overrides numeric proximity; alpha stays theme-owned | src/lib/theme/defaults.ts:332 |
| literal-color | rgba(99, 102, 241, 0.1) | fg-muted | F3/F7: nearest authored Concrete & Signal reference RGB (#91979e); role overrides numeric proximity; alpha stays theme-owned | src/components/settings/observability/DurationChart.tsx:67 |
| svg-fill | #00D8FF | fg-secondary | F3/F7: nearest authored Concrete & Signal reference RGB (#98a0a8); role overrides numeric proximity; alpha stays theme-owned | src/assets/react.svg:1 |
| svg-height | 32 | size-8 | F5: static spacing to Tailwind scale; percentages/data dimensions remain geometry, SVG viewBox is asset geometry | src/assets/react.svg:1 |
| svg-width | 35.93 | size-8.9825 | F5: static spacing to Tailwind scale; percentages/data dimensions remain geometry, SVG viewBox is asset geometry | src/assets/react.svg:1 |
| utility | -mb-1.5 | -mb-1.5 | named Tailwind spacing/size or structural utility; preserve | src/components/drawers/ChatWorkingDrawer.tsx:302 |
| utility | -mb-[2px] | mb-0.5 | Tailwind spacing scale; preserve sign/modifiers; rem follows user scaling | src/components/chat/ChatDrawerTabStrip.tsx:113 |
| utility | -mb-px | -mb-px | named Tailwind spacing/size or structural utility; preserve | src/components/settings/inspector/InspectorPanel.tsx:333 |
| utility | -mx-1 | -mx-1 | named Tailwind spacing/size or structural utility; preserve | src/components/settings/agents/AgentDetailView.tsx:215, src/components/settings/agents/AgentDetailView.tsx:379, src/components/settings/agents/AgentDetailView.tsx:387 (all in JSON) |
| utility | -right-1.5 | -right-1.5 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/ChatTranscript.tsx:260 |
| utility | -space-x-2 | -space-x-2 | named Tailwind spacing/size or structural utility; preserve | src/components/ui/avatar.tsx:76 |
| utility | -top-1.5 | -top-1.5 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/ChatTranscript.tsx:260 |
| utility | after:bg-foreground | bg-fg | Flux alias resolves by source role; accent means brand here | src/components/ui/tabs.tsx:70 |
| utility | alert-dialog-content:text-left | text-left | named inherited/contract type or structural text utility | src/components/ui/alert-dialog.tsx:78 |
| utility | aria-invalid:border-destructive | border-danger | Flux alias resolves by source role; accent means brand here | src/components/ui/badge.tsx:8, src/components/ui/input.tsx:13, src/components/ui/select.tsx:40 (all in JSON) |
| utility | aria-invalid:ring-destructive/20 | ring-danger/20 | Flux alias resolves by source role; accent means brand here | src/components/ui/badge.tsx:8, src/components/ui/input.tsx:13, src/components/ui/select.tsx:40 (all in JSON) |
| utility | avatar-group:size-10 | size-10 | named Tailwind spacing/size or structural utility; preserve | src/components/ui/avatar.tsx:92 |
| utility | avatar-group:size-6 | size-6 | named Tailwind spacing/size or structural utility; preserve | src/components/ui/avatar.tsx:92 |
| utility | avatar:size-2 | size-2 | named Tailwind spacing/size or structural utility; preserve | src/components/ui/avatar.tsx:61 |
| utility | avatar:size-2.5 | size-2.5 | named Tailwind spacing/size or structural utility; preserve | src/components/ui/avatar.tsx:62 |
| utility | avatar:size-3 | size-3 | named Tailwind spacing/size or structural utility; preserve | src/components/ui/avatar.tsx:63 |
| utility | avatar:text-xs | text-xs | named inherited/contract type or structural text utility | src/components/ui/avatar.tsx:47 |
| utility | bg-[#1a1b26] | bg-fg-secondary | F3: literal paint becomes semantic role; theme-only fidelity value | src/components/chat/ShellMessage.tsx:32 |
| utility | bg-[#1e1f2e] | bg-fg-secondary | F3: literal paint becomes semantic role; theme-only fidelity value | src/components/chat/ShellMessage.tsx:34 |
| utility | bg-accent/10 | bg-brand/10 | Flux alias resolves by source role; accent means brand here | src/components/settings/inspector/InspectorPanel.tsx:584 |
| utility | bg-amber-500/10 | bg-warning/10 | F3: caution palette becomes warning; identity hue needs F2 | src/components/agents/TagPills.tsx:14, src/components/settings/agents/AgentReflexesPanel.tsx:581, src/components/ui/tag-input.tsx:8 |
| utility | bg-amber-600/10 | bg-warning/10 | F3: caution palette becomes warning; identity hue needs F2 | src/components/settings/PluginManager.tsx:427, src/components/settings/PluginManager.tsx:63 |
| utility | bg-amber-600/5 | bg-warning/5 | F3: caution palette becomes warning; identity hue needs F2 | src/components/settings/PluginDetailView.tsx:474 |
| utility | bg-background | bg-bg | Flux alias resolves by source role; accent means brand here | src/components/ui/alert-dialog.tsx:61, src/components/ui/sheet.tsx:61, src/components/ui/switch.tsx:26 (all in JSON) |
| utility | bg-background/10 | bg-bg/10 | Flux alias resolves by source role; accent means brand here | src/components/ui/kbd.tsx:10 |
| utility | bg-background/20 | bg-bg/20 | Flux alias resolves by source role; accent means brand here | src/components/ui/kbd.tsx:10 |
| utility | bg-bg | bg-bg | exact semantic role | src/components/AppGate.tsx:29, src/components/AppGate.tsx:35, src/components/AppShell.tsx:140 (all in JSON) |
| utility | bg-bg-elevated | bg-bg-elevated | exact semantic role | src/components/NavRail.tsx:52, src/components/RightRail.tsx:57, src/components/RightRailV2.tsx:110 (all in JSON) |
| utility | bg-bg-elevated/20 | bg-bg-elevated/20 | exact semantic role | src/components/RightRail.tsx:57, src/components/RightRailV2.tsx:110, src/components/chat/ComposerPlusMenu.tsx:154 (all in JSON) |
| utility | bg-bg-elevated/30 | bg-bg-elevated/30 | exact semantic role | src/components/settings/observability/UtilityTable.tsx:43 |
| utility | bg-bg-elevated/50 | bg-bg-elevated/50 | exact semantic role | src/components/chat/MessageContent.tsx:168, src/components/chat/ShellInfoDrawer.tsx:25, src/components/chat/envelopes/ArtifactMiniCard.tsx:64 (all in JSON) |
| utility | bg-bg-elevated/80 | bg-bg-elevated/80 | exact semantic role | src/components/messaging/InboxContent.tsx:271 |
| utility | bg-bg-surface | bg-surface | Flux alias resolves by source role; accent means brand here | src/components/chat/composer/BooleanChoice.tsx:45, src/components/chat/composer/CardRadio.tsx:38, src/components/chat/composer/Drawer.tsx:52 |
| utility | bg-bg/30 | bg-bg/30 | exact semantic role | src/components/settings/AgentProfileManager.tsx:321, src/components/settings/PanelManager.tsx:105, src/components/settings/PluginManager.tsx:386 (all in JSON) |
| utility | bg-bg/40 | bg-bg/40 | exact semantic role | src/components/settings/AgentProfileManager.tsx:358, src/components/settings/CatalogBrowser.tsx:439, src/components/settings/CatalogSourceManager.tsx:193 (all in JSON) |
| utility | bg-bg/50 | bg-bg/50 | exact semantic role | src/components/settings/agents/AgentBuilderWizard.tsx:1397, src/components/settings/agents/AgentBuilderWizard.tsx:1492 |
| utility | bg-bg/60 | bg-bg/60 | exact semantic role | src/components/settings/agents/AgentBuilderWizard.tsx:1411 |
| utility | bg-bg/80 | bg-bg/80 | exact semantic role | src/components/work/TodoItem.tsx:89 |
| utility | bg-black/40 | bg-bg/40 | F3: theme-relative role; no fixed black/white component paint | src/components/chat/LayoutMenu.tsx:179, src/components/settings/ProfilePanel.tsx:73 |
| utility | bg-black/50 | bg-bg/50 | F3: theme-relative role; no fixed black/white component paint | src/components/settings/ProviderManager.tsx:76, src/components/ui/alert-dialog.tsx:39, src/components/ui/sheet.tsx:37 |
| utility | bg-black/60 | bg-bg/60 | F3: theme-relative role; no fixed black/white component paint | src/components/chat/AgentPicker.tsx:54, src/components/ui/dialog.tsx:40 |
| utility | bg-blue-100 | bg-info | F2/F3: nearest information role; categorical identity needs labelled marker and owner review | src/components/settings/inspector/InspectorPanel.tsx:157 |
| utility | bg-blue-500 | bg-info | F2/F3: nearest information role; categorical identity needs labelled marker and owner review | src/components/chat/extensions/SlashCommandMenu.tsx:147 |
| utility | bg-blue-500/10 | bg-info/10 | F2/F3: nearest information role; categorical identity needs labelled marker and owner review | src/components/agents/TagPills.tsx:12, src/components/ui/tag-input.tsx:6 |
| utility | bg-border | bg-border | exact semantic role | src/components/chat/LeftRail.tsx:157, src/components/drawers/ChatPrimaryDrawer.tsx:148, src/components/drawers/ChatPrimaryDrawer.tsx:570 (all in JSON) |
| utility | bg-border-subtle | bg-border-subtle | exact semantic role | src/components/chat/envelopes/primitives/TimelineCard.tsx:59 |
| utility | bg-border/40 | bg-border/40 | exact semantic role | src/components/chat/CompactionDivider.tsx:11, src/components/chat/CompactionDivider.tsx:18 |
| utility | bg-brand | bg-brand | exact semantic role | src/components/NavRail.tsx:57, src/components/chat/ChatComposer.tsx:582, src/components/chat/ChatHeader.tsx:310 (all in JSON) |
| utility | bg-brand-muted | bg-brand-muted | exact semantic role | src/components/chat/ChatMessage.tsx:76, src/components/chat/ComposerToolbar.tsx:200, src/components/settings/appearance/AppearancePanel.tsx:174 |
| utility | bg-brand/10 | bg-brand/10 | exact semantic role | src/components/settings/SkillsBrowser.tsx:377, src/components/settings/SystemPromptsViewer.tsx:121 |
| utility | bg-brand/15 | bg-brand/15 | exact semantic role | src/components/settings/agents/AgentBuilderWizard.tsx:1444 |
| utility | bg-card | bg-bg-elevated | Flux alias resolves by source role; accent means brand here | src/components/ui/card.tsx:10 |
| utility | bg-composer-hover | bg-surface-hover | F1: scoped theme on composer; nearest role, retain dark composer only if confirmed | src/components/chat/UserProfileMenu.tsx:53 |
| utility | bg-cyan-500/10 | bg-info/10 | F2/F3: nearest information role; categorical identity needs labelled marker and owner review | src/components/agents/TagPills.tsx:15, src/components/ui/tag-input.tsx:9 |
| utility | bg-cyan-500/20 | bg-info/20 | F2/F3: nearest information role; categorical identity needs labelled marker and owner review | src/components/settings/observability/RecentExecutionsTable.tsx:103 |
| utility | bg-danger | bg-danger | exact semantic role | src/components/chat/Banner.tsx:50, src/components/chat/ChatComposer.tsx:588, src/components/chat/IterationLimitWarning.tsx:51 (all in JSON) |
| utility | bg-danger-muted | bg-danger-muted | exact semantic role | src/components/chat/Banner.tsx:50, src/components/memory/MemoryDetail.tsx:162, src/components/widgets/ContextInspectorModal.tsx:39 |
| utility | bg-danger/10 | bg-danger/10 | exact semantic role | src/components/chat/envelopes/ReportCard.tsx:58, src/components/settings/DurableAgentAdminPanel.tsx:1022, src/components/settings/DurableAgentAdminPanel.tsx:1321 (all in JSON) |
| utility | bg-danger/15 | bg-danger/15 | exact semantic role | src/components/chat/ShellMessage.tsx:43 |
| utility | bg-danger/20 | bg-danger/20 | exact semantic role | src/components/settings/CatalogBrowser.tsx:339, src/components/settings/ToolDashboard.tsx:1099, src/components/settings/ToolDashboard.tsx:992 (all in JSON) |
| utility | bg-danger/40 | bg-danger/40 | exact semantic role | src/components/workflows/WorkflowStepItem.tsx:41 |
| utility | bg-danger/5 | bg-danger/5 | exact semantic role | src/components/chat/envelopes/ApprovalCard.tsx:299, src/components/chat/envelopes/ElicitationPromptCard.tsx:181, src/components/chat/envelopes/primitives/DiffCard.tsx:33 (all in JSON) |
| utility | bg-destructive | bg-danger | Flux alias resolves by source role; accent means brand here | src/components/ui/badge.tsx:16 |
| utility | bg-divider | bg-divider | exact semantic role | src/components/chat/ChatHeader.tsx:415, src/components/chat/ChatHeader.tsx:513, src/components/chat/ComposerToolbar.tsx:140 (all in JSON) |
| utility | bg-elevated | bg-bg-elevated | Flux alias resolves by source role; accent means brand here | src/components/chat/LayoutMenu.tsx:119, src/components/chat/LayoutMenu.tsx:198, src/lib/theme/defaults.ts:113 (all in JSON) |
| utility | bg-emerald-100 | bg-success | F3: completion palette becomes success | src/components/settings/MemoryPanel.tsx:12 |
| utility | bg-emerald-500/10 | bg-success/10 | F3: completion palette becomes success | src/components/agents/TagPills.tsx:17, src/components/settings/agents/AgentReflexesPanel.tsx:630, src/components/settings/agents/AgentReflexesPanel.tsx:715 (all in JSON) |
| utility | bg-emerald-600/10 | bg-success/10 | F3: completion palette becomes success | src/components/settings/PluginManager.tsx:61 |
| utility | bg-emerald-600/5 | bg-success/5 | F3: completion palette becomes success | src/components/settings/PluginInstallProgress.tsx:168 |
| utility | bg-fg | bg-fg | exact semantic role | src/components/chat/Banner.tsx:108, src/components/chat/ComposerPlusMenu.tsx:138 |
| utility | bg-fg-faint | bg-fg-faint | exact semantic role | src/components/agents/StatusDot.tsx:12, src/components/widgets/Widget.tsx:101 |
| utility | bg-fg-faint/40 | bg-fg-faint/40 | exact semantic role | src/components/SearchModal.tsx:198 |
| utility | bg-fg-muted | bg-fg-muted | exact semantic role | src/components/chat/ThinkingIndicator.tsx:57, src/components/chat/envelopes/primitives/StatusPill.tsx:75, src/components/widgets/Widget.tsx:135 (all in JSON) |
| utility | bg-fg-muted/10 | bg-fg-muted/10 | exact semantic role | src/components/memory/MemoryCard.tsx:23, src/components/workflows/WorkflowRunCard.tsx:43, src/components/workflows/WorkflowRunCard.tsx:79 (all in JSON) |
| utility | bg-fg-muted/20 | bg-fg-muted/20 | exact semantic role | src/components/settings/observability/WorkerStatusPanel.tsx:26, src/components/settings/observability/WorkerStatusPanel.tsx:60, src/components/workflows/WorkflowStepItem.tsx:44 |
| utility | bg-fg-muted/40 | bg-fg-muted/40 | exact semantic role | src/components/chat/envelopes/primitives/TimelineCard.tsx:24, src/components/workflows/WorkflowRunCard.tsx:28 |
| utility | bg-fg/8 | bg-fg/8 | exact semantic role | src/components/drawers/ChatWorkingDrawer.tsx:410 |
| utility | bg-foreground | bg-fg | Flux alias resolves by source role; accent means brand here | src/components/ui/switch.tsx:26 |
| utility | bg-green-100 | bg-success | F3: completion palette becomes success | src/components/settings/inspector/InspectorPanel.tsx:151 |
| utility | bg-green-500 | bg-success | F3: completion palette becomes success | src/components/settings/inspector/InspectorPanel.tsx:51 |
| utility | bg-indigo-500 | bg-info | F2/F3: nearest information role; categorical identity needs labelled marker and owner review | src/components/settings/PluginInstallProgress.tsx:223 |
| utility | bg-indigo-500/10 | bg-info/10 | F2/F3: nearest information role; categorical identity needs labelled marker and owner review | src/components/agents/TagPills.tsx:19, src/components/ui/tag-input.tsx:13 |
| utility | bg-indigo-500/20 | bg-info/20 | F2/F3: nearest information role; categorical identity needs labelled marker and owner review | src/components/settings/ToolDashboard.tsx:738 |
| utility | bg-indigo-500/70 | bg-info/70 | F2/F3: nearest information role; categorical identity needs labelled marker and owner review | src/components/settings/PluginInstallProgress.tsx:227 |
| utility | bg-info | bg-info | exact semantic role | src/components/chat/Banner.tsx:48, src/components/chat/ChatComposer.tsx:642, src/components/chat/composer/Drawer.tsx:10 (all in JSON) |
| utility | bg-info-muted | bg-info-muted | exact semantic role | src/components/chat/Banner.tsx:48, src/components/memory/MemoryCard.tsx:21, src/components/memory/MemoryDetail.tsx:35 (all in JSON) |
| utility | bg-info/10 | bg-info/10 | exact semantic role | src/components/chat/envelopes/ReportCard.tsx:59, src/components/work/PlanCard.tsx:10 |
| utility | bg-info/15 | bg-info/15 | exact semantic role | src/components/chat/extensions/SlashCommandMenu.tsx:155, src/components/chat/extensions/SlashCommandMenu.tsx:46 |
| utility | bg-info/20 | bg-info/20 | exact semantic role | src/components/settings/observability/WorkerStatusPanel.tsx:20, src/components/settings/observability/WorkerStatusPanel.tsx:42, src/components/workflows/WorkflowRunCard.tsx:74 |
| utility | bg-info/40 | bg-info/40 | exact semantic role | src/components/workflows/WorkflowStepItem.tsx:39 |
| utility | bg-input | bg-border-subtle | Flux alias resolves by source role; accent means brand here | src/components/ui/switch.tsx:18 |
| utility | bg-input/30 | bg-border-subtle/30 | Flux alias resolves by source role; accent means brand here | src/components/ui/tabs.tsx:69 |
| utility | bg-input/80 | bg-border-subtle/80 | Flux alias resolves by source role; accent means brand here | src/components/ui/switch.tsx:18 |
| utility | bg-mode-architect/15 | bg-fg-muted/15 | F2: simplify to role + visible identity text; distinct hue needs reviewed theme idiom | src/components/settings/appearance/ThemePreview.tsx:101 |
| utility | bg-mode-default/10 | bg-fg-secondary/10 | F2: simplify to role + visible identity text; distinct hue needs reviewed theme idiom | src/components/chat/ChatTranscript.tsx:390 |
| utility | bg-mode-default/15 | bg-fg-secondary/15 | F2: simplify to role + visible identity text; distinct hue needs reviewed theme idiom | src/components/chat/ChatMessage.tsx:67, src/components/settings/appearance/ThemePreview.tsx:100 |
| utility | bg-mode-planner/15 | bg-info/15 | F2: simplify to role + visible identity text; distinct hue needs reviewed theme idiom | src/components/settings/appearance/ThemePreview.tsx:102 |
| utility | bg-mode-writer/15 | bg-warning/15 | F2: simplify to role + visible identity text; distinct hue needs reviewed theme idiom | src/components/settings/appearance/ThemePreview.tsx:103 |
| utility | bg-muted | bg-surface | Flux alias resolves by source role; accent means brand here | src/components/ui/alert-dialog.tsx:139, src/components/ui/avatar.tsx:47, src/components/ui/avatar.tsx:92 (all in JSON) |
| utility | bg-orange-500/10 | bg-warning/10 | F3: caution palette becomes warning; identity hue needs F2 | src/components/agents/TagPills.tsx:18, src/components/ui/tag-input.tsx:12 |
| utility | bg-orange-500/15 | bg-warning/15 | F3: caution palette becomes warning; identity hue needs F2 | src/components/chat/ChatMessage.tsx:74 |
| utility | bg-pink-500/10 | bg-info/10 | F2/F3: nearest information role; categorical identity needs labelled marker and owner review | src/components/agents/TagPills.tsx:16, src/components/ui/tag-input.tsx:10 |
| utility | bg-pink-500/15 | bg-info/15 | F2/F3: nearest information role; categorical identity needs labelled marker and owner review | src/components/chat/ChatMessage.tsx:75 |
| utility | bg-popover | bg-bg-elevated | Flux alias resolves by source role; accent means brand here | src/components/ui/context-menu.tsx:103, src/components/ui/context-menu.tsx:86, src/components/ui/dropdown-menu.tsx:233 (all in JSON) |
| utility | bg-primary | bg-primary | exact semantic role | src/components/chat/ChatComposer.tsx:673, src/components/chat/ChatTranscript.tsx:260, src/components/chat/ChatTranscript.tsx:397 (all in JSON) |
| utility | bg-primary-foreground | bg-primary-fg | Flux alias resolves by source role; accent means brand here | src/components/ui/switch.tsx:26 |
| utility | bg-primary-foreground/18 | bg-primary-fg/18 | Flux alias resolves by source role; accent means brand here | src/components/chat/LeftRail.tsx:114 |
| utility | bg-primary-muted | bg-primary-muted | exact semantic role | src/components/RightRail.tsx:200, src/components/RightRailV2.tsx:331, src/components/chat/ComposerPlusMenu.tsx:125 (all in JSON) |
| utility | bg-primary-muted/80 | bg-primary-muted/80 | exact semantic role | src/components/chat/envelopes/primitives/ListCard.tsx:319 |
| utility | bg-primary/10 | bg-primary/10 | exact semantic role | src/components/chat/composer/CardRadio.tsx:37, src/components/chat/composer/CheckboxList.tsx:35, src/components/drawers/ArtifactsContent.tsx:245 (all in JSON) |
| utility | bg-primary/15 | bg-primary/15 | exact semantic role | src/components/chat/ChatMessage.tsx:72, src/components/settings/ProjectManager.tsx:95, src/components/sidebar/ScopeSelector.tsx:53 (all in JSON) |
| utility | bg-primary/5 | bg-primary/5 | exact semantic role | src/components/chat/ChatComposer.tsx:605, src/components/chat/ChatTranscript.tsx:444, src/components/drawers/ArtifactsContent.tsx:223 (all in JSON) |
| utility | bg-primary/50 | bg-primary/50 | exact semantic role | src/components/chat/MessageContent.tsx:253 |
| utility | bg-purple-500/10 | bg-info/10 | F2/F3: nearest information role; categorical identity needs labelled marker and owner review | src/components/agents/TagPills.tsx:13, src/components/ui/tag-input.tsx:7 |
| utility | bg-red-100 | bg-danger | F3: feedback palette becomes danger; brand requires explicit identity context | src/components/settings/MemoryPanel.tsx:20, src/components/settings/MemoryPanel.tsx:24, src/components/settings/inspector/InspectorPanel.tsx:155 |
| utility | bg-red-50 | bg-danger | F3: feedback palette becomes danger; brand requires explicit identity context | src/components/settings/MemoryPanel.tsx:152, src/components/settings/MemoryPanel.tsx:159 |
| utility | bg-red-500 | bg-danger | F3: feedback palette becomes danger; brand requires explicit identity context | src/components/settings/inspector/InspectorPanel.tsx:51 |
| utility | bg-red-500/10 | bg-danger/10 | F3: feedback palette becomes danger; brand requires explicit identity context | src/components/settings/agents/AgentBuilderWizard.tsx:642 |
| utility | bg-red-600/10 | bg-danger/10 | F3: feedback palette becomes danger; brand requires explicit identity context | src/components/settings/PluginManager.tsx:64 |
| utility | bg-red-600/5 | bg-danger/5 | F3: feedback palette becomes danger; brand requires explicit identity context | src/components/settings/PluginInstallProgress.tsx:168 |
| utility | bg-rose-500/10 | bg-danger/10 | F3: feedback palette becomes danger; brand requires explicit identity context | src/components/settings/agents/AgentReflexesPanel.tsx:630 |
| utility | bg-secondary | bg-surface | Flux alias resolves by source role; accent means brand here | src/components/ui/badge.tsx:14, src/components/ui/sheet.tsx:76 |
| utility | bg-selection | bg-selection | exact semantic role | src/components/settings/appearance/ThemePreview.tsx:76, src/components/ui/context-menu.tsx:67, src/components/ui/dropdown-menu.tsx:214 |
| utility | bg-sky-500/10 | bg-info/10 | F2/F3: nearest information role; categorical identity needs labelled marker and owner review | src/components/settings/agents/AgentReflexesPanel.tsx:637 |
| utility | bg-slate-500/10 | bg-fg-muted/10 | F3: nearest neutral ladder role; choose by foreground/surface context | src/components/settings/agents/AgentReflexesPanel.tsx:715 |
| utility | bg-status-info/10 | bg-info/10 | Flux alias resolves by source role; accent means brand here | src/components/settings/SystemPromptsViewer.tsx:116, src/components/settings/SystemPromptsViewer.tsx:120 |
| utility | bg-status-ok | bg-success | Flux alias resolves by source role; accent means brand here | src/components/settings/CatalogBrowser.tsx:392, src/components/settings/CatalogSourceManager.tsx:158, src/components/settings/PluginDetailView.tsx:170 (all in JSON) |
| utility | bg-status-ok/10 | bg-success/10 | Flux alias resolves by source role; accent means brand here | src/components/settings/SystemPromptsViewer.tsx:115, src/components/settings/SystemPromptsViewer.tsx:122 |
| utility | bg-status-ok/5 | bg-success/5 | Flux alias resolves by source role; accent means brand here | src/components/settings/agents/SkillDetailView.tsx:433 |
| utility | bg-status-warn/10 | bg-warning/10 | Flux alias resolves by source role; accent means brand here | src/components/settings/SystemPromptsViewer.tsx:123 |
| utility | bg-success | bg-success | exact semantic role | src/components/agents/StatusDot.tsx:12, src/components/chat/Banner.tsx:51, src/components/chat/ChatComposer.tsx:616 (all in JSON) |
| utility | bg-success-muted | bg-success-muted | exact semantic role | src/components/chat/Banner.tsx:51, src/components/memory/MemoryCard.tsx:17, src/components/memory/MemoryDetail.tsx:39 (all in JSON) |
| utility | bg-success/10 | bg-success/10 | exact semantic role | src/components/chat/AdapterBadge.tsx:4, src/components/chat/composer/BooleanChoice.tsx:43, src/components/chat/envelopes/ReportCard.tsx:55 (all in JSON) |
| utility | bg-success/15 | bg-success/15 | exact semantic role | src/components/chat/ShellMessage.tsx:42 |
| utility | bg-success/20 | bg-success/20 | exact semantic role | src/components/settings/ToolDashboard.tsx:1107, src/components/settings/observability/ProcessHealthPanel.tsx:26, src/components/settings/observability/WorkerStatusPanel.tsx:48 (all in JSON) |
| utility | bg-success/40 | bg-success/40 | exact semantic role | src/components/workflows/WorkflowStepItem.tsx:37 |
| utility | bg-success/5 | bg-success/5 | exact semantic role | src/components/chat/envelopes/primitives/DiffCard.tsx:43, src/components/settings/CatalogBrowser.tsx:341 |
| utility | bg-surface | bg-surface | exact semantic role | src/components/NavRail.tsx:115, src/components/NavRail.tsx:79, src/components/SearchModal.tsx:233 (all in JSON) |
| utility | bg-surface-hover | bg-surface-hover | exact semantic role | src/components/chat/extensions/FileMentionMenu.tsx:129, src/components/chat/extensions/FileMentionMenu.tsx:142, src/components/chat/extensions/FileMentionMenu.tsx:155 (all in JSON) |
| utility | bg-surface-hover/50 | bg-surface-hover/50 | exact semantic role | src/components/chat/ChatMessage.tsx:311, src/components/settings/observability/RecentExecutionsTable.tsx:104 |
| utility | bg-surface/10 | bg-surface/10 | exact semantic role | src/components/plugins/debug/TurnSnapshotPanel.tsx:101 |
| utility | bg-surface/20 | bg-surface/20 | exact semantic role | src/components/settings/agents/AgentCapabilitiesPanel.tsx:1158, src/components/settings/agents/AgentCapabilitiesPanel.tsx:1240, src/components/settings/agents/AgentCapabilitiesPanel.tsx:390 (all in JSON) |
| utility | bg-surface/30 | bg-surface/30 | exact semantic role | src/components/drawers/ChatWorkingDrawer.tsx:353, src/components/settings/agents/AgentBuilderWizard.tsx:1068, src/components/settings/agents/AgentBuilderWizard.tsx:1332 (all in JSON) |
| utility | bg-surface/40 | bg-surface/40 | exact semantic role | src/components/chat/ChatDrawerTabStrip.tsx:87, src/components/chat/CompactionDivider.tsx:13, src/components/memory/MemoryCard.tsx:50 (all in JSON) |
| utility | bg-surface/50 | bg-surface/50 | exact semantic role | src/components/chat/MessageContent.tsx:146, src/components/chat/ToolCallIndicator.tsx:12, src/components/chat/extensions/FileMentionMenu.tsx:95 (all in JSON) |
| utility | bg-surface/60 | bg-surface/60 | exact semantic role | src/components/drawers/ChatPrimaryDrawer.tsx:220, src/components/drawers/ChatPrimaryDrawer.tsx:248, src/components/settings/CatalogBrowser.tsx:449 (all in JSON) |
| utility | bg-toggle-on | bg-primary | Flux alias resolves by source role; accent means brand here | src/components/plugins/debug/SlotInspectorPanel.tsx:88, src/components/settings/CatalogSourceManager.tsx:173, src/components/settings/ProviderManager.tsx:344 (all in JSON) |
| utility | bg-transparent | bg-transparent | structural paint keyword; preserve | src/components/chat/AgentPicker.tsx:76, src/components/chat/ChatComposer.tsx:318, src/components/chat/ChatComposer.tsx:680 (all in JSON) |
| utility | bg-violet-500 | bg-info | F2/F3: nearest information role; categorical identity needs labelled marker and owner review | src/components/chat/envelopes/ReportCard.tsx:60 |
| utility | bg-violet-500/10 | bg-info/10 | F2/F3: nearest information role; categorical identity needs labelled marker and owner review | src/components/chat/AdapterBadge.tsx:3, src/components/chat/envelopes/ReportCard.tsx:60 |
| utility | bg-violet-500/15 | bg-info/15 | F2/F3: nearest information role; categorical identity needs labelled marker and owner review | src/components/chat/ChatMessage.tsx:73 |
| utility | bg-violet-500/20 | bg-info/20 | F2/F3: nearest information role; categorical identity needs labelled marker and owner review | src/components/settings/observability/RecentExecutionsTable.tsx:102 |
| utility | bg-warning | bg-warning | exact semantic role | src/components/chat/Banner.tsx:49, src/components/chat/ChatDrawerTabStrip.tsx:125, src/components/chat/IterationLimitWarning.tsx:51 (all in JSON) |
| utility | bg-warning-muted | bg-warning-muted | exact semantic role | src/components/chat/Banner.tsx:49, src/components/widgets/ContextInspectorModal.tsx:38 |
| utility | bg-warning/10 | bg-warning/10 | exact semantic role | src/components/chat/ChatMessage.tsx:367, src/components/chat/ChatMessage.tsx:511, src/components/chat/ShellMessage.tsx:84 (all in JSON) |
| utility | bg-warning/15 | bg-warning/15 | exact semantic role | src/components/chat/ApprovalCard.tsx:102, src/components/chat/extensions/SlashCommandMenu.tsx:154 |
| utility | bg-warning/20 | bg-warning/20 | exact semantic role | src/components/settings/observability/ProcessHealthPanel.tsx:24, src/components/settings/observability/WorkerStatusPanel.tsx:36, src/components/workflows/WorkflowRunCard.tsx:45 (all in JSON) |
| utility | bg-warning/30 | bg-warning/30 | exact semantic role | src/components/messaging/InboxContent.tsx:21 |
| utility | bg-warning/5 | bg-warning/5 | exact semantic role | src/components/settings/agents/SkillDetailView.tsx:421 |
| utility | bg-white | bg-fg | F3: theme-relative role; no fixed black/white component paint | src/components/drawers/ChatPrimaryDrawer.tsx:574, src/components/drawers/ChatPrimaryDrawer.tsx:594, src/components/plugins/debug/DebugPanel.tsx:21 (all in JSON) |
| utility | bg-yellow-100 | bg-warning | F3: caution palette becomes warning; identity hue needs F2 | src/components/settings/inspector/InspectorPanel.tsx:153 |
| utility | bg-yellow-400 | bg-warning | F3: caution palette becomes warning; identity hue needs F2 | src/components/settings/inspector/InspectorPanel.tsx:51 |
| utility | bg-zinc-200 | bg-fg | F3: nearest neutral ladder role; choose by foreground/surface context | src/components/settings/MemoryPanel.tsx:16 |
| utility | bg-zinc-800 | bg-surface | F3: nearest neutral ladder role; choose by foreground/surface context | src/components/settings/PluginInstallProgress.tsx:220 |
| utility | bg-zinc-950/80 | bg-bg/80 | F3: nearest neutral ladder role; choose by foreground/surface context | src/components/settings/PluginInstallProgress.tsx:168 |
| utility | border-2 | border-2 | inherited border/stroke scale or structure | src/components/drawers/ArtifactsContent.tsx:245, src/components/work/PlanStepItem.tsx:54, src/components/work/TodoItem.tsx:105 |
| utility | border-[1.5px] | border-0.375 | Tailwind spacing scale; preserve sign/modifiers; rem follows user scaling | src/components/chat/composer/CheckboxList.tsx:40 |
| utility | border-accent | border-brand | Flux alias resolves by source role; accent means brand here | src/components/settings/inspector/InspectorPanel.tsx:584 |
| utility | border-amber-500/20 | border-warning/20 | F3: caution palette becomes warning; identity hue needs F2 | src/components/agents/TagPills.tsx:14, src/components/ui/tag-input.tsx:8 |
| utility | border-amber-600/40 | border-warning/40 | F3: caution palette becomes warning; identity hue needs F2 | src/components/settings/PluginDetailView.tsx:474, src/components/settings/PluginManager.tsx:427, src/components/settings/PluginManager.tsx:63 |
| utility | border-b | border-b | inherited directional border scale / structural ring utility | src/components/RightRail.tsx:189, src/components/RightRailV2.tsx:321, src/components/RightRailV2.tsx:344 (all in JSON) |
| utility | border-b-0 | border-b-0 | inherited directional border scale / structural ring utility | src/components/settings/PreferencesPanel.tsx:234, src/components/settings/primitives.tsx:105, src/components/settings/primitives.tsx:89 |
| utility | border-b-2 | border-b-2 | inherited directional border scale / structural ring utility | src/components/RightRailV2.tsx:354, src/components/chat/ChatDrawerTabStrip.tsx:88, src/components/drawers/ChatPrimaryDrawer.tsx:182 (all in JSON) |
| utility | border-b-bg-elevated | border-b-bg-elevated | exact semantic role | src/components/settings/inspector/InspectorPanel.tsx:333 |
| utility | border-b-fg | border-b-fg | exact semantic role | src/components/chat/ChatDrawerTabStrip.tsx:88 |
| utility | border-b-surface | border-b-surface | exact semantic role | src/components/drawers/ChatPrimaryDrawer.tsx:182 |
| utility | border-black/10 | border-bg/10 | F3: theme-relative role; no fixed black/white component paint | src/components/chat/LayoutMenu.tsx:233, src/components/chat/LayoutMenu.tsx:234, src/components/chat/LayoutMenu.tsx:235 |
| utility | border-blue-300 | border-info | F2/F3: nearest information role; categorical identity needs labelled marker and owner review | src/components/settings/inspector/InspectorPanel.tsx:157 |
| utility | border-blue-500/20 | border-info/20 | F2/F3: nearest information role; categorical identity needs labelled marker and owner review | src/components/agents/TagPills.tsx:12, src/components/ui/tag-input.tsx:6 |
| utility | border-border | border-border | exact semantic role | src/components/NavRail.tsx:52, src/components/RightRail.tsx:183, src/components/RightRail.tsx:189 (all in JSON) |
| utility | border-border-subtle | border-border-subtle | exact semantic role | src/components/NavRail.tsx:64, src/components/RightRail.tsx:56, src/components/RightRailV2.tsx:109 (all in JSON) |
| utility | border-border-subtle/30 | border-border-subtle/30 | exact semantic role | src/components/settings/appearance/TailwindSwatchGrid.tsx:22 |
| utility | border-border-subtle/50 | border-border-subtle/50 | exact semantic role | src/components/chat/ToolCallIndicator.tsx:12, src/components/settings/appearance/AppearancePanel.tsx:199, src/components/work/PlanCard.tsx:68 (all in JSON) |
| utility | border-border-subtle/60 | border-border-subtle/60 | exact semantic role | src/components/settings/agents/AgentCapabilitiesPanel.tsx:962, src/components/settings/agents/editors/CapabilityChecklist.tsx:68 |
| utility | border-border/20 | border-border/20 | exact semantic role | src/components/plugins/debug/SlotInspectorPanel.tsx:108, src/components/plugins/debug/TurnSnapshotPanel.tsx:101 |
| utility | border-border/30 | border-border/30 | exact semantic role | src/components/chat/CompactionDivider.tsx:13, src/components/plugins/debug/SlotInspectorPanel.tsx:98, src/components/plugins/debug/TurnSnapshotPanel.tsx:72 (all in JSON) |
| utility | border-border/50 | border-border/50 | exact semantic role | src/components/messaging/InboxContent.tsx:215, src/components/plugins/debug/DebugPanel.tsx:42 |
| utility | border-brand | border-brand | exact semantic role | src/components/chat/ComposerToolbar.tsx:199, src/components/settings/appearance/AppearancePanel.tsx:174 |
| utility | border-brand-muted | border-brand-muted | exact semantic role | src/components/chat/ComposerToolbar.tsx:200 |
| utility | border-brand/20 | border-brand/20 | exact semantic role | src/components/settings/SkillsBrowser.tsx:377 |
| utility | border-brand/30 | border-brand/30 | exact semantic role | src/components/settings/SystemPromptsViewer.tsx:121 |
| utility | border-brand/40 | border-brand/40 | exact semantic role | src/components/settings/DurableAgentAdminPanel.tsx:173, src/components/settings/agents/AgentBuilderWizard.tsx:1444 |
| utility | border-collapse | border-collapse | inherited border/stroke scale or structure | src/components/chat/MessageContent.tsx:139 |
| utility | border-cyan-500/20 | border-info/20 | F2/F3: nearest information role; categorical identity needs labelled marker and owner review | src/components/agents/TagPills.tsx:15, src/components/ui/tag-input.tsx:9 |
| utility | border-danger | border-danger | exact semantic role | src/components/chat/ChatHeader.tsx:297 |
| utility | border-danger/20 | border-danger/20 | exact semantic role | src/components/workflows/WorkflowRunDetail.tsx:157 |
| utility | border-danger/30 | border-danger/30 | exact semantic role | src/components/chat/envelopes/ApprovalCard.tsx:299, src/components/chat/envelopes/ElicitationPromptCard.tsx:181, src/components/chat/envelopes/primitives/TableCard.tsx:246 (all in JSON) |
| utility | border-danger/40 | border-danger/40 | exact semantic role | src/components/settings/agents/AgentDetailView.tsx:296 |
| utility | border-danger/50 | border-danger/50 | exact semantic role | src/components/settings/ToolDashboard.tsx:1099, src/components/settings/ToolDashboard.tsx:992, src/components/widgets/WidgetRenderer.tsx:22 |
| utility | border-dashed | border-dashed | inherited border/stroke scale or structure | src/components/drawers/ArtifactsContent.tsx:245, src/components/memory/MemoryDetail.tsx:297, src/components/settings/DurableAgentAdminPanel.tsx:1371 (all in JSON) |
| utility | border-divider | border-divider | exact semantic role | src/components/chat/ApprovalCard.tsx:126, src/components/chat/ApprovalCard.tsx:134, src/components/chat/ChatHeader.tsx:294 (all in JSON) |
| utility | border-emerald-500/20 | border-success/20 | F3: completion palette becomes success | src/components/agents/TagPills.tsx:17, src/components/ui/tag-input.tsx:11 |
| utility | border-emerald-600/40 | border-success/40 | F3: completion palette becomes success | src/components/settings/PluginInstallProgress.tsx:164, src/components/settings/PluginManager.tsx:61 |
| utility | border-fg-faint/30 | border-fg-faint/30 | exact semantic role | src/components/work/PlanStepItem.tsx:58 |
| utility | border-fg-faint/60 | border-fg-faint/60 | exact semantic role | src/components/SearchModal.tsx:198, src/components/sidebar/LeftSidebar.tsx:560, src/components/sidebar/LeftSidebar.tsx:561 |
| utility | border-fg-faint/70 | border-fg-faint/70 | exact semantic role | src/components/sidebar/LeftSidebar.tsx:554 |
| utility | border-fg-muted | border-fg-muted | exact semantic role | src/components/chat/envelopes/primitives/StatusPill.tsx:75, src/components/sidebar/StartSurfaceDialog.tsx:527 |
| utility | border-fg-secondary/30 | border-fg-secondary/30 | exact semantic role | src/components/chat/ComposerPlusMenu.tsx:138 |
| utility | border-green-300 | border-success | F3: completion palette becomes success | src/components/settings/inspector/InspectorPanel.tsx:151 |
| utility | border-indigo-500/20 | border-info/20 | F2/F3: nearest information role; categorical identity needs labelled marker and owner review | src/components/agents/TagPills.tsx:19, src/components/ui/tag-input.tsx:13 |
| utility | border-indigo-500/30 | border-info/30 | F2/F3: nearest information role; categorical identity needs labelled marker and owner review | src/components/settings/ToolDashboard.tsx:738 |
| utility | border-indigo-500/40 | border-info/40 | F2/F3: nearest information role; categorical identity needs labelled marker and owner review | src/components/settings/PluginInstallProgress.tsx:167 |
| utility | border-info | border-info | exact semantic role | src/components/work/ScopeChip.tsx:26 |
| utility | border-info/30 | border-info/30 | exact semantic role | src/components/chat/extensions/SlashCommandMenu.tsx:155, src/components/chat/extensions/SlashCommandMenu.tsx:46 |
| utility | border-input | border-border-subtle | Flux alias resolves by source role; accent means brand here | src/components/settings/agents/AgentReflexesPanel.tsx:358, src/components/settings/agents/AgentReflexesPanel.tsx:373, src/components/settings/agents/AgentReflexesPanel.tsx:402 (all in JSON) |
| utility | border-l | border-l | inherited directional border scale / structural ring utility | src/components/RightRail.tsx:183, src/components/RightRailV2.tsx:314, src/components/chat/LayoutMenu.tsx:445 (all in JSON) |
| utility | border-l-2 | border-l-2 | inherited directional border scale / structural ring utility | src/components/chat/MessageContent.tsx:168, src/components/settings/AgentProfileManager.tsx:318, src/components/settings/CatalogBrowser.tsx:375 (all in JSON) |
| utility | border-l-brand | border-l-brand | exact semantic role | src/components/settings/SkillsBrowser.tsx:340, src/components/settings/primitives.tsx:23 |
| utility | border-l-fg | border-l-fg | exact semantic role | src/components/settings/primitives.tsx:28 |
| utility | border-l-fg-faint | border-l-fg-faint | exact semantic role | src/components/settings/CatalogBrowser.tsx:380, src/components/settings/PanelManager.tsx:105, src/components/settings/ProviderManager.tsx:325 (all in JSON) |
| utility | border-l-fg-secondary | border-l-fg-secondary | exact semantic role | src/components/settings/primitives.tsx:27 |
| utility | border-l-status-danger | border-l-danger | Flux alias resolves by source role; accent means brand here | src/components/settings/primitives.tsx:26 |
| utility | border-l-status-ok | border-l-success | Flux alias resolves by source role; accent means brand here | src/components/settings/CatalogBrowser.tsx:379, src/components/settings/PanelManager.tsx:104, src/components/settings/ProviderManager.tsx:324 (all in JSON) |
| utility | border-l-status-warn | border-l-warning | Flux alias resolves by source role; accent means brand here | src/components/settings/primitives.tsx:25 |
| utility | border-none | border-none | inherited border/stroke scale or structure | src/components/chat/UserProfileMenu.tsx:94 |
| utility | border-orange-500/20 | border-warning/20 | F3: caution palette becomes warning; identity hue needs F2 | src/components/agents/TagPills.tsx:18, src/components/ui/tag-input.tsx:12 |
| utility | border-pink-500/20 | border-info/20 | F2/F3: nearest information role; categorical identity needs labelled marker and owner review | src/components/agents/TagPills.tsx:16, src/components/ui/tag-input.tsx:10 |
| utility | border-primary | border-primary | exact semantic role | src/components/RightRailV2.tsx:356, src/components/chat/ChatComposer.tsx:572, src/components/chat/LayoutMenu.tsx:210 (all in JSON) |
| utility | border-primary-foreground/35 | border-primary-fg/35 | Flux alias resolves by source role; accent means brand here | src/components/chat/LeftRail.tsx:109 |
| utility | border-primary/30 | border-primary/30 | exact semantic role | src/components/chat/ChatComposer.tsx:605, src/components/chat/ChatTranscript.tsx:444, src/components/settings/PluginDetailView.tsx:414 (all in JSON) |
| utility | border-primary/50 | border-primary/50 | exact semantic role | src/components/chat/MessageContent.tsx:168, src/components/ui/tag-input.tsx:118 |
| utility | border-purple-500/20 | border-info/20 | F2/F3: nearest information role; categorical identity needs labelled marker and owner review | src/components/agents/TagPills.tsx:13, src/components/ui/tag-input.tsx:7 |
| utility | border-r | border-r | inherited directional border scale / structural ring utility | src/components/NavRail.tsx:52, src/components/chat/LayoutMenu.tsx:368, src/components/chat/LeftRail.tsx:85 (all in JSON) |
| utility | border-red-300 | border-danger | F3: feedback palette becomes danger; brand requires explicit identity context | src/components/settings/MemoryPanel.tsx:152, src/components/settings/MemoryPanel.tsx:159, src/components/settings/inspector/InspectorPanel.tsx:155 |
| utility | border-red-500/40 | border-danger/40 | F3: feedback palette becomes danger; brand requires explicit identity context | src/components/settings/agents/AgentBuilderWizard.tsx:642 |
| utility | border-red-600/40 | border-danger/40 | F3: feedback palette becomes danger; brand requires explicit identity context | src/components/settings/PluginManager.tsx:64 |
| utility | border-red-600/50 | border-danger/50 | F3: feedback palette becomes danger; brand requires explicit identity context | src/components/settings/PluginInstallProgress.tsx:166 |
| utility | border-status-info/30 | border-info/30 | Flux alias resolves by source role; accent means brand here | src/components/settings/SystemPromptsViewer.tsx:116, src/components/settings/SystemPromptsViewer.tsx:120 |
| utility | border-status-ok/30 | border-success/30 | Flux alias resolves by source role; accent means brand here | src/components/settings/SystemPromptsViewer.tsx:115, src/components/settings/SystemPromptsViewer.tsx:122 |
| utility | border-status-ok/40 | border-success/40 | Flux alias resolves by source role; accent means brand here | src/components/settings/agents/SkillDetailView.tsx:433 |
| utility | border-status-warn/30 | border-warning/30 | Flux alias resolves by source role; accent means brand here | src/components/settings/SystemPromptsViewer.tsx:123 |
| utility | border-subtle | border-border-subtle | Flux alias resolves by source role; accent means brand here | src/lib/theme/defaults.ts:118, src/lib/theme/defaults.ts:160, src/lib/theme/defaults.ts:214 (all in JSON) |
| utility | border-success | border-success | exact semantic role | src/components/chat/composer/BooleanChoice.tsx:43, src/components/messaging/InboxContent.tsx:182, src/components/messaging/InboxContent.tsx:192 (all in JSON) |
| utility | border-success/20 | border-success/20 | exact semantic role | src/components/chat/AdapterBadge.tsx:4 |
| utility | border-success/30 | border-success/30 | exact semantic role | src/components/settings/CatalogBrowser.tsx:341, src/components/settings/DurableAgentAdminPanel.tsx:1025, src/components/settings/DurableAgentAdminPanel.tsx:1319 |
| utility | border-success/50 | border-success/50 | exact semantic role | src/components/settings/ToolDashboard.tsx:1107 |
| utility | border-t | border-t | inherited directional border scale / structural ring utility | src/components/NavRail.tsx:64, src/components/chat/ApprovalCard.tsx:126, src/components/chat/ApprovalCard.tsx:134 (all in JSON) |
| utility | border-t-0 | border-t-0 | inherited directional border scale / structural ring utility | src/components/chat/ChatComposer.tsx:569, src/components/chat/LayoutMenu.tsx:490 |
| utility | border-t-2 | border-t-2 | inherited directional border scale / structural ring utility | src/components/chat/ChatDrawerTabStrip.tsx:88, src/components/drawers/ChatWorkingDrawer.tsx:320 |
| utility | border-t-fg | border-t-fg | exact semantic role | src/components/chat/ChatDrawerTabStrip.tsx:88 |
| utility | border-t-primary | border-t-primary | exact semantic role | src/components/drawers/ChatWorkingDrawer.tsx:320 |
| utility | border-t-transparent | border-t-transparent | structural paint keyword; preserve | src/components/chat/LeftRail.tsx:109 |
| utility | border-transparent | border-transparent | structural paint keyword; preserve | src/components/RightRailV2.tsx:357, src/components/chat/LayoutMenu.tsx:69, src/components/chat/LayoutMenu.tsx:93 (all in JSON) |
| utility | border-violet-500/20 | border-info/20 | F2/F3: nearest information role; categorical identity needs labelled marker and owner review | src/components/chat/AdapterBadge.tsx:3 |
| utility | border-warning | border-warning | exact semantic role | src/components/chat/ChatHeader.tsx:296 |
| utility | border-warning/20 | border-warning/20 | exact semantic role | src/components/chat/extensions/SlashCommandMenu.tsx:154 |
| utility | border-warning/30 | border-warning/30 | exact semantic role | src/components/drawers/ChatWorkingDrawer.tsx:472, src/components/settings/CatalogBrowser.tsx:417, src/components/settings/DurableAgentAdminPanel.tsx:1026 (all in JSON) |
| utility | border-warning/40 | border-warning/40 | exact semantic role | src/components/chat/ChatMessage.tsx:511, src/components/settings/agents/SkillDetailView.tsx:421 |
| utility | border-warning/50 | border-warning/50 | exact semantic role | src/components/chat/ChatMessage.tsx:367 |
| utility | border-x | border-x | inherited directional border scale / structural ring utility | src/components/chat/ChatDrawerTabStrip.tsx:113, src/components/drawers/ChatPrimaryDrawer.tsx:102, src/components/drawers/ChatPrimaryDrawer.tsx:114 (all in JSON) |
| utility | border-yellow-300 | border-warning | F3: caution palette becomes warning; identity hue needs F2 | src/components/settings/inspector/InspectorPanel.tsx:153 |
| utility | bottom-0 | bottom-0 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/envelopes/primitives/TimelineCard.tsx:59, src/components/drawers/ChatWorkingDrawer.tsx:316, src/components/ui/avatar.tsx:60 (all in JSON) |
| utility | bottom-4 | bottom-4 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/ChatTranscript.tsx:513, src/components/messaging/InboxContent.tsx:421, src/components/settings/CatalogBrowser.tsx:333 (all in JSON) |
| utility | bottom-[1px] | bottom-0.25 | Tailwind spacing scale; preserve sign/modifiers; rem follows user scaling | src/components/chat/LayoutMenu.tsx:134 |
| utility | dark:aria-invalid:ring-destructive/40 | ring-danger/40 | Flux alias resolves by source role; accent means brand here | src/components/ui/badge.tsx:8, src/components/ui/input.tsx:13, src/components/ui/select.tsx:40 (all in JSON) |
| utility | dark:bg-bg-elevated/60 | bg-bg-elevated/60 | exact semantic role | src/components/plugins/debug/DebugPanel.tsx:21, src/components/ui/icon-picker.tsx:145 |
| utility | dark:bg-destructive/60 | bg-danger/60 | Flux alias resolves by source role; accent means brand here | src/components/ui/badge.tsx:16 |
| utility | dark:bg-emerald-900/40 | bg-success/40 | F3: completion palette becomes success | src/components/settings/MemoryPanel.tsx:12 |
| utility | dark:bg-input/30 | bg-border-subtle/30 | Flux alias resolves by source role; accent means brand here | src/components/ui/input.tsx:11, src/components/ui/select.tsx:40, src/components/ui/textarea.tsx:10 |
| utility | dark:bg-red-900/20 | bg-danger/20 | F3: feedback palette becomes danger; brand requires explicit identity context | src/components/settings/MemoryPanel.tsx:152, src/components/settings/MemoryPanel.tsx:159 |
| utility | dark:bg-red-900/40 | bg-danger/40 | F3: feedback palette becomes danger; brand requires explicit identity context | src/components/settings/MemoryPanel.tsx:20, src/components/settings/MemoryPanel.tsx:24 |
| utility | dark:bg-zinc-700 | bg-surface | F3: nearest neutral ladder role; choose by foreground/surface context | src/components/settings/MemoryPanel.tsx:16 |
| utility | dark:focus-visible:ring-destructive/40 | ring-danger/40 | Flux alias resolves by source role; accent means brand here | src/components/ui/badge.tsx:16 |
| utility | dark:hover:bg-input/50 | bg-border-subtle/50 | Flux alias resolves by source role; accent means brand here | src/components/ui/select.tsx:40 |
| utility | dark:hover:text-foreground | text-fg | Flux alias resolves by source role; accent means brand here | src/components/ui/tabs.tsx:67 |
| utility | dark:text-amber-400 | text-warning | F3: caution palette becomes warning; identity hue needs F2 | src/components/settings/PluginManager.tsx:63 |
| utility | dark:text-emerald-200 | text-success | F3: completion palette becomes success | src/components/settings/MemoryPanel.tsx:12 |
| utility | dark:text-emerald-400 | text-success | F3: completion palette becomes success | src/components/settings/PluginManager.tsx:61 |
| utility | dark:text-muted-foreground | text-fg-muted | Flux alias resolves by source role; accent means brand here | src/components/ui/tabs.tsx:67 |
| utility | dark:text-red-200 | text-danger | F3: feedback palette becomes danger; brand requires explicit identity context | src/components/settings/MemoryPanel.tsx:152, src/components/settings/MemoryPanel.tsx:159, src/components/settings/MemoryPanel.tsx:20 (all in JSON) |
| utility | dark:text-red-400 | text-danger | F3: feedback palette becomes danger; brand requires explicit identity context | src/components/settings/PluginManager.tsx:64 |
| utility | dark:text-zinc-200 | text-fg | F3: nearest neutral ladder role; choose by foreground/surface context | src/components/settings/MemoryPanel.tsx:16 |
| utility | decoration-border-subtle | decoration-border-subtle | exact semantic role | src/components/settings/ProviderManager.tsx:139, src/components/settings/ProviderManager.tsx:256 |
| utility | divide-border-subtle | divide-border-subtle | exact semantic role | src/components/chat/envelopes/ReportCard.tsx:118, src/components/chat/envelopes/primitives/DiffCard.tsx:30 |
| utility | divide-border/50 | divide-border/50 | exact semantic role | src/components/messaging/InboxContent.tsx:235, src/components/messaging/InboxContent.tsx:261, src/components/settings/ToolDashboard.tsx:724 |
| utility | divide-divider | divide-divider | exact semantic role | src/components/settings/DurableAgentAdminPanel.tsx:997 |
| utility | divide-x | divide-x | inherited directional border scale / structural ring utility | src/components/chat/envelopes/ReportCard.tsx:118, src/components/chat/envelopes/primitives/DiffCard.tsx:30 |
| utility | divide-y | divide-y | inherited directional border scale / structural ring utility | src/components/chat/envelopes/ReportCard.tsx:118, src/components/messaging/InboxContent.tsx:235, src/components/messaging/InboxContent.tsx:261 (all in JSON) |
| utility | even:bg-surface/30 | bg-surface/30 | exact semantic role | src/components/chat/MessageContent.tsx:163 |
| utility | file:bg-transparent | bg-transparent | structural paint keyword; preserve | src/components/ui/input.tsx:11 |
| utility | file:border-0 | border-0 | inherited border/stroke scale or structure | src/components/ui/input.tsx:11 |
| utility | file:font-medium | font-medium | sans/mono font token or inherited weight | src/components/ui/input.tsx:11 |
| utility | file:h-7 | h-7 | named Tailwind spacing/size or structural utility; preserve | src/components/ui/input.tsx:11 |
| utility | file:text-foreground | text-fg | Flux alias resolves by source role; accent means brand here | src/components/ui/input.tsx:11 |
| utility | file:text-sm | text-sm | named inherited/contract type or structural text utility | src/components/ui/input.tsx:11 |
| utility | fill-current | fill-current | structural paint keyword; preserve | src/components/chat/ComposerPlusMenu.tsx:208, src/components/ui/context-menu.tsx:177, src/components/ui/dropdown-menu.tsx:138 |
| utility | fill-primary | fill-primary | exact semantic role | src/components/settings/PanelManager.tsx:140 |
| utility | first:pt-0 | pt-0 | named Tailwind spacing/size or structural utility; preserve | src/components/drawers/ArtifactsContent.tsx:348 |
| utility | focus-visible:border-ring | border-ring | exact semantic role | src/components/ui/badge.tsx:8, src/components/ui/input.tsx:12, src/components/ui/select.tsx:40 (all in JSON) |
| utility | focus-visible:outline-1 | outline-1 | inherited border/stroke scale or structure | src/components/ui/tabs.tsx:67 |
| utility | focus-visible:outline-none | outline-none | inherited border/stroke scale or structure | src/components/ui/button.tsx:7 |
| utility | focus-visible:outline-ring | outline-ring | exact semantic role | src/components/ui/tabs.tsx:67 |
| utility | focus-visible:ring-1 | ring-1 | inherited border/stroke scale or structure | src/components/ui/button.tsx:7 |
| utility | focus-visible:ring-[3px] | ring-0.75 | Tailwind spacing scale; preserve sign/modifiers; rem follows user scaling | src/components/ui/badge.tsx:8, src/components/ui/input.tsx:12, src/components/ui/select.tsx:40 (all in JSON) |
| utility | focus-visible:ring-destructive/20 | ring-danger/20 | Flux alias resolves by source role; accent means brand here | src/components/ui/badge.tsx:16 |
| utility | focus-visible:ring-ring | ring-ring | exact semantic role | src/components/ui/button.tsx:7 |
| utility | focus-visible:ring-ring/50 | ring-ring/50 | exact semantic role | src/components/ui/badge.tsx:8, src/components/ui/input.tsx:12, src/components/ui/select.tsx:40 (all in JSON) |
| utility | focus:bg-destructive/10 | bg-danger/10 | Flux alias resolves by source role; accent means brand here | src/components/ui/context-menu.tsx:127, src/components/ui/dropdown-menu.tsx:77 |
| utility | focus:bg-destructive/20 | bg-danger/20 | Flux alias resolves by source role; accent means brand here | src/components/ui/context-menu.tsx:127, src/components/ui/dropdown-menu.tsx:77 |
| utility | focus:bg-selection | bg-selection | exact semantic role | src/components/ui/context-menu.tsx:127, src/components/ui/context-menu.tsx:145, src/components/ui/context-menu.tsx:170 (all in JSON) |
| utility | focus:border-border-subtle | border-border-subtle | exact semantic role | src/components/messaging/TaskThreadPanel.tsx:143 |
| utility | focus:border-primary | border-primary | exact semantic role | src/components/chat/LeftRail.tsx:360, src/components/chat/envelopes/ApprovalCard.tsx:263, src/components/chat/envelopes/ProposalCard.tsx:14 (all in JSON) |
| utility | focus:border-primary/50 | border-primary/50 | exact semantic role | src/components/memory/MemoryDetail.tsx:46, src/components/memory/MemoryDetail.tsx:48 |
| utility | focus:border-ring | border-ring | exact semantic role | src/components/sidebar/StartSurfaceDialog.tsx:888 |
| utility | focus:outline-hidden | outline-hidden | inherited border/stroke scale or structure | src/components/ui/dialog.tsx:71, src/components/ui/sheet.tsx:76 |
| utility | focus:outline-none | outline-none | inherited border/stroke scale or structure | src/components/chat/SetupWizard.tsx:100, src/components/chat/SetupWizard.tsx:116, src/components/chat/SetupWizard.tsx:136 (all in JSON) |
| utility | focus:ring-1 | ring-1 | inherited border/stroke scale or structure | src/components/chat/LeftRail.tsx:360, src/components/chat/SetupWizard.tsx:100, src/components/chat/SetupWizard.tsx:116 (all in JSON) |
| utility | focus:ring-2 | ring-2 | inherited border/stroke scale or structure | src/components/ui/dialog.tsx:71, src/components/ui/sheet.tsx:76 |
| utility | focus:ring-border-subtle | ring-border-subtle | exact semantic role | src/components/messaging/TaskThreadPanel.tsx:143, src/components/settings/CatalogBrowser.tsx:189, src/components/settings/CatalogSourceManager.tsx:224 (all in JSON) |
| utility | focus:ring-offset-0 | ring-offset-0 | inherited border/stroke scale or structure | src/components/settings/PluginConfigPanel.tsx:38 |
| utility | focus:ring-offset-2 | ring-offset-2 | inherited border/stroke scale or structure | src/components/ui/sheet.tsx:76 |
| utility | focus:ring-offset-bg-elevated | ring-offset-bg-elevated | exact semantic role | src/components/settings/AgentProfileManager.tsx:259 |
| utility | focus:ring-primary | ring-primary | exact semantic role | src/components/chat/LeftRail.tsx:360, src/components/chat/SetupWizard.tsx:100, src/components/chat/SetupWizard.tsx:116 (all in JSON) |
| utility | focus:ring-primary/50 | ring-primary/50 | exact semantic role | src/components/ui/icon-picker.tsx:162 |
| utility | focus:ring-ring | ring-ring | exact semantic role | src/components/ui/dialog.tsx:71, src/components/ui/sheet.tsx:76 |
| utility | focus:text-danger | text-danger | exact semantic role | src/components/settings/PluginManager.tsx:553, src/components/sidebar/LeftSidebar.tsx:726 |
| utility | focus:text-destructive | text-danger | Flux alias resolves by source role; accent means brand here | src/components/ui/context-menu.tsx:127, src/components/ui/dropdown-menu.tsx:77 |
| utility | focus:text-selection-fg | text-selection-fg | exact semantic role | src/components/ui/context-menu.tsx:127, src/components/ui/context-menu.tsx:145, src/components/ui/context-menu.tsx:170 (all in JSON) |
| utility | font-bold | font-bold | sans/mono font token or inherited weight | src/components/chat/ChatHeader.tsx:310, src/components/chat/MessageContent.tsx:176, src/components/settings/ProviderManager.tsx:31 |
| utility | font-medium | font-medium | sans/mono font token or inherited weight | src/components/RightRailV2.tsx:356, src/components/SearchModal.tsx:200, src/components/SearchModal.tsx:232 (all in JSON) |
| utility | font-mono | font-mono | sans/mono font token or inherited weight | src/components/CommandPalette.tsx:155, src/components/RightRailV2.tsx:445, src/components/SearchModal.tsx:201 (all in JSON) |
| utility | font-normal | font-normal | sans/mono font token or inherited weight | src/components/chat/AgentRoster.tsx:51, src/components/chat/ChatTranscript.tsx:396, src/components/chat/composer/CheckboxList.tsx:46 (all in JSON) |
| utility | font-sans | font-sans | sans/mono font token or inherited weight | src/components/SearchModal.tsx:203, src/components/SearchModal.tsx:204, src/components/chat/envelopes/DocumentViewerCard.tsx:60 (all in JSON) |
| utility | font-semibold | font-semibold | sans/mono font token or inherited weight | src/components/AppGate.tsx:37, src/components/RightRail.tsx:190, src/components/RightRailV2.tsx:322 (all in JSON) |
| utility | gap-0 | gap-0 | named Tailwind spacing/size or structural utility; preserve | src/components/settings/agents/editors/EditableStringList.tsx:212 |
| utility | gap-0.5 | gap-0.5 | named Tailwind spacing/size or structural utility; preserve | src/components/RightRail.tsx:192, src/components/RightRailV2.tsx:323, src/components/chat/AdapterBadge.tsx:26 (all in JSON) |
| utility | gap-1 | gap-1 | named Tailwind spacing/size or structural utility; preserve | src/components/NavRail.tsx:129, src/components/NavRail.tsx:66, src/components/SearchModal.tsx:130 (all in JSON) |
| utility | gap-1.5 | gap-1.5 | named Tailwind spacing/size or structural utility; preserve | src/components/RightRailV2.tsx:354, src/components/SearchModal.tsx:164, src/components/SearchModal.tsx:197 (all in JSON) |
| utility | gap-2 | gap-2 | named Tailwind spacing/size or structural utility; preserve | src/components/RightRail.tsx:56, src/components/RightRailV2.tsx:109, src/components/chat/AgentPicker.tsx:69 (all in JSON) |
| utility | gap-2.5 | gap-2.5 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/ApprovalCard.tsx:101, src/components/chat/ChatHeader.tsx:308, src/components/chat/ChatMain.tsx:230 (all in JSON) |
| utility | gap-3 | gap-3 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/AgentPicker.tsx:106, src/components/chat/AgentPicker.tsx:87, src/components/chat/AgentRoster.tsx:74 (all in JSON) |
| utility | gap-4 | gap-4 | named Tailwind spacing/size or structural utility; preserve | src/components/plugins/debug/TurnSnapshotPanel.tsx:117, src/components/settings/DurableAgentAdminPanel.tsx:141, src/components/settings/DurableAgentAdminPanel.tsx:689 (all in JSON) |
| utility | gap-6 | gap-6 | named Tailwind spacing/size or structural utility; preserve | src/components/settings/appearance/AppearancePanel.tsx:299, src/components/ui/card.tsx:10 |
| utility | gap-[10px] | gap-2.5 | Tailwind spacing scale; preserve sign/modifiers; rem follows user scaling | src/components/chat/ChatHeader.tsx:364, src/components/chat/ChatHeader.tsx:366, src/components/widgets/Widget.tsx:81 |
| utility | gap-[2px] | gap-0.5 | Tailwind spacing scale; preserve sign/modifiers; rem follows user scaling | src/components/chat/ChatHeader.tsx:315, src/components/settings/primitives.tsx:240 |
| utility | gap-[3px] | gap-0.75 | Tailwind spacing scale; preserve sign/modifiers; rem follows user scaling | src/components/chat/LayoutMenu.tsx:214, src/components/chat/LayoutMenu.tsx:217, src/components/chat/LayoutMenu.tsx:223 (all in JSON) |
| utility | gap-x-2 | gap-x-2 | named Tailwind spacing/size or structural utility; preserve | src/components/settings/inspector/InspectorPanel.tsx:390 |
| utility | gap-x-4 | gap-x-4 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/envelopes/ApprovalCard.tsx:197, src/components/drawers/ChatWorkingDrawer.tsx:461, src/components/widgets/ContextInspectorModal.tsx:308 |
| utility | gap-x-6 | gap-x-6 | named Tailwind spacing/size or structural utility; preserve | src/components/ui/alert-dialog.tsx:78 |
| utility | gap-y-1 | gap-y-1 | named Tailwind spacing/size or structural utility; preserve | src/components/drawers/ChatWorkingDrawer.tsx:461, src/components/settings/inspector/InspectorPanel.tsx:390, src/components/widgets/ContextInspectorModal.tsx:308 |
| utility | gap-y-1.5 | gap-y-1.5 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/envelopes/ApprovalCard.tsx:197 |
| utility | group-hover:text-fg | text-fg | exact semantic role | src/components/plugins/bookmarks/BookmarksWidget.tsx:69, src/components/settings/AgentProfileManager.tsx:330, src/components/settings/PluginManager.tsx:398 (all in JSON) |
| utility | group-hover:text-fg-muted | text-fg-muted | exact semantic role | src/components/settings/ToolDashboard.tsx:757 |
| utility | group-hover:text-fg-secondary | text-fg-secondary | exact semantic role | src/components/settings/ProviderManager.tsx:139, src/components/settings/ProviderManager.tsx:256 |
| utility | group-hover:text-primary | text-primary | exact semantic role | src/components/chat/AgentPicker.tsx:125 |
| utility | group-hover:text-primary-hover | text-primary-hover | exact semantic role | src/components/chat/ChatMain.tsx:306 |
| utility | group-hover:text-success | text-success | exact semantic role | src/components/settings/ToolDashboard.tsx:755 |
| utility | h-0 | h-0 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/ChatComposer.tsx:699 |
| utility | h-0.5 | h-0.5 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/envelopes/ReportCard.tsx:76, src/components/workflows/WorkflowRunCard.tsx:144 |
| utility | h-1 | h-1 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/IterationLimitWarning.tsx:48, src/components/chat/ThinkingIndicator.tsx:57, src/components/chat/envelopes/primitives/ListCard.tsx:285 (all in JSON) |
| utility | h-1.5 | h-1.5 | named Tailwind spacing/size or structural utility; preserve | src/components/agents/StatusDot.tsx:7, src/components/chat/ChatComposer.tsx:588, src/components/chat/ChatDrawerTabStrip.tsx:125 (all in JSON) |
| utility | h-10 | h-10 | named Tailwind spacing/size or structural utility; preserve | src/components/NavRail.tsx:113, src/components/NavRail.tsx:134, src/components/NavRail.tsx:57 (all in JSON) |
| utility | h-12 | h-12 | named Tailwind spacing/size or structural utility; preserve | src/components/settings/PluginDetailView.tsx:161, src/components/settings/ProviderManager.tsx:78, src/components/settings/ToolDashboard.tsx:683 (all in JSON) |
| utility | h-16 | h-16 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/ChatTranscript.tsx:258, src/components/memory/MemoryBrowse.tsx:126 |
| utility | h-2 | h-2 | named Tailwind spacing/size or structural utility; preserve | src/components/agents/StatusDot.tsx:8, src/components/settings/appearance/ThemePreview.tsx:47, src/components/settings/appearance/ThemePreview.tsx:51 (all in JSON) |
| utility | h-2.5 | h-2.5 | named Tailwind spacing/size or structural utility; preserve | src/components/SearchModal.tsx:198, src/components/chat/AdapterBadge.tsx:29, src/components/chat/AgentPicker.tsx:91 (all in JSON) |
| utility | h-20 | h-20 | named Tailwind spacing/size or structural utility; preserve | src/components/workflows/WorkflowTab.tsx:64 |
| utility | h-3 | h-3 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/AdapterBadge.tsx:40, src/components/chat/ApprovalCard.tsx:118, src/components/chat/ArtifactChip.tsx:27 (all in JSON) |
| utility | h-3.5 | h-3.5 | named Tailwind spacing/size or structural utility; preserve | src/components/RightRail.tsx:204, src/components/RightRailV2.tsx:335, src/components/RightRailV2.tsx:360 (all in JSON) |
| utility | h-32 | h-32 | named Tailwind spacing/size or structural utility; preserve | src/components/RightRail.tsx:272, src/components/RightRailV2.tsx:432, src/components/settings/SettingsPage.tsx:240 (all in JSON) |
| utility | h-4 | h-4 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/AgentPicker.tsx:112, src/components/chat/AgentPicker.tsx:125, src/components/chat/AgentPicker.tsx:63 (all in JSON) |
| utility | h-4.5 | h-4.5 | named Tailwind spacing/size or structural utility; preserve | src/components/settings/CatalogSourceManager.tsx:172 |
| utility | h-48 | h-48 | named Tailwind spacing/size or structural utility; preserve | src/components/settings/inspector/InspectorPanel.tsx:296, src/components/settings/inspector/InspectorPanel.tsx:613, src/components/settings/observability/DurationChart.tsx:78 (all in JSON) |
| utility | h-5 | h-5 | named Tailwind spacing/size or structural utility; preserve | src/components/NavRail.tsx:123, src/components/NavRail.tsx:150, src/components/NavRail.tsx:98 (all in JSON) |
| utility | h-56 | h-56 | named Tailwind spacing/size or structural utility; preserve | src/components/ui/icon-picker.tsx:166 |
| utility | h-6 | h-6 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/ApprovalCard.tsx:140, src/components/chat/ApprovalCard.tsx:149, src/components/chat/ApprovalCard.tsx:159 (all in JSON) |
| utility | h-64 | h-64 | named Tailwind spacing/size or structural utility; preserve | src/components/settings/SettingsPage.tsx:202 |
| utility | h-7 | h-7 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/Banner.tsx:87, src/components/chat/ChatDrawerTabStrip.tsx:155, src/components/chat/ChatDrawerTabStrip.tsx:94 (all in JSON) |
| utility | h-8 | h-8 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/AgentPicker.tsx:108, src/components/chat/AgentPicker.tsx:88, src/components/chat/ApprovalCard.tsx:102 (all in JSON) |
| utility | h-9 | h-9 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/ChatTranscript.tsx:513, src/components/settings/AgentProfileManager.tsx:329, src/components/settings/CatalogBrowser.tsx:385 (all in JSON) |
| utility | h-[1.15rem] | h-4.6 | Tailwind spacing scale; preserve sign/modifiers; rem follows user scaling | src/components/ui/switch.tsx:18 |
| utility | h-[104px] | h-26 | Tailwind spacing scale; preserve sign/modifiers; rem follows user scaling | src/components/chat/ChatMain.tsx:204 |
| utility | h-[10px] | h-2.5 | Tailwind spacing scale; preserve sign/modifiers; rem follows user scaling | src/components/chat/LayoutMenu.tsx:139 |
| utility | h-[11px] | h-2.75 | Tailwind spacing scale; preserve sign/modifiers; rem follows user scaling | src/components/chat/envelopes/primitives/TimelineCard.tsx:63, src/components/widgets/ContextBudgetWidget.tsx:89 |
| utility | h-[18px] | h-4.5 | Tailwind spacing scale; preserve sign/modifiers; rem follows user scaling | src/components/chat/Banner.tsx:87, src/components/chat/LayoutMenu.tsx:52, src/components/chat/ToolCallBanner.tsx:48 |
| utility | h-[22px] | h-5.5 | Tailwind spacing scale; preserve sign/modifiers; rem follows user scaling | src/components/chat/LayoutMenu.tsx:530, src/components/chat/composer/Drawer.tsx:82, src/components/settings/primitives.tsx:278 |
| utility | h-[26px] | h-6.5 | Tailwind spacing scale; preserve sign/modifiers; rem follows user scaling | src/components/widgets/ToolsWidget.tsx:60 |
| utility | h-[2px] | h-0.5 | Tailwind spacing scale; preserve sign/modifiers; rem follows user scaling | src/components/chat/Banner.tsx:81, src/components/chat/ChatComposer.tsx:582 |
| utility | h-[3px] | h-0.75 | Tailwind spacing scale; preserve sign/modifiers; rem follows user scaling | src/components/chat/LayoutMenu.tsx:221, src/components/chat/LayoutMenu.tsx:222, src/components/chat/composer/Drawer.tsx:58 |
| utility | h-[480px] | h-120 | Tailwind spacing scale; preserve sign/modifiers; rem follows user scaling | src/components/chat/composer/Drawer.tsx:55, src/components/settings/inspector/InspectorPanel.tsx:343 |
| utility | h-[4px] | h-1 | Tailwind spacing scale; preserve sign/modifiers; rem follows user scaling | src/components/chat/LayoutMenu.tsx:134, src/components/chat/LayoutMenu.tsx:219, src/components/widgets/ContextInspectorModal.tsx:219 (all in JSON) |
| utility | h-[52px] | h-13 | Tailwind spacing scale; preserve sign/modifiers; rem follows user scaling | src/components/RightRail.tsx:189, src/components/RightRailV2.tsx:321, src/components/chat/ChatHeader.tsx:303 (all in JSON) |
| utility | h-[560px] | h-140 | Tailwind spacing scale; preserve sign/modifiers; rem follows user scaling | src/components/settings/inspector/InspectorPanel.tsx:576 |
| utility | h-[5px] | h-1.25 | Tailwind spacing scale; preserve sign/modifiers; rem follows user scaling | src/components/chat/LayoutMenu.tsx:224, src/components/chat/LayoutMenu.tsx:225, src/components/chat/LayoutMenu.tsx:428 (all in JSON) |
| utility | h-[80%] | w-full / max-w-3xl / viewport-bounded slot | F5: proportional/bounded layout; keep data geometry separate from design scale | src/components/chat/LayoutMenu.tsx:182 |
| utility | h-[8px] | h-2 | Tailwind spacing scale; preserve sign/modifiers; rem follows user scaling | src/components/chat/LayoutMenu.tsx:218 |
| utility | h-[calc(100%-1px)] | w-full / max-w-3xl / viewport-bounded slot | F5: proportional/bounded layout; keep data geometry separate from design scale | src/components/ui/tabs.tsx:67 |
| utility | h-[var(--radix-select-trigger-height)] | controlled layout slot / named scale | F5: dynamic expression is host geometry, never component design constant | src/components/ui/select.tsx:79 |
| utility | h-auto | h-auto | named Tailwind spacing/size or structural utility; preserve | src/components/ui/sheet.tsx:67, src/components/ui/sheet.tsx:69 |
| utility | h-full | h-full | named Tailwind spacing/size or structural utility; preserve | src/components/ComponentGalleryPage.tsx:3, src/components/NavRail.tsx:52, src/components/RightRail.tsx:183 (all in JSON) |
| utility | h-px | h-px | named Tailwind spacing/size or structural utility; preserve | src/components/chat/ChatHeader.tsx:415, src/components/chat/ChatHeader.tsx:513, src/components/chat/CompactionDivider.tsx:11 (all in JSON) |
| utility | h-screen | h-screen | named Tailwind spacing/size or structural utility; preserve | src/components/AppGate.tsx:29, src/components/AppGate.tsx:35, src/components/AppShell.tsx:140 |
| utility | hover:bg-amber-600/10 | bg-warning/10 | F3: caution palette becomes warning; identity hue needs F2 | src/components/settings/PluginDetailView.tsx:479 |
| utility | hover:bg-amber-600/20 | bg-warning/20 | F3: caution palette becomes warning; identity hue needs F2 | src/components/settings/PluginManager.tsx:427 |
| utility | hover:bg-bg-elevated | bg-bg-elevated | exact semantic role | src/components/settings/ToolDashboard.tsx:732, src/components/settings/inspector/InspectorPanel.tsx:585 |
| utility | hover:bg-bg-elevated/50 | bg-bg-elevated/50 | exact semantic role | src/components/settings/inspector/InspectorPanel.tsx:223 |
| utility | hover:bg-bg-elevated/60 | bg-bg-elevated/60 | exact semantic role | src/components/chat/ChatDrawerTabStrip.tsx:111, src/components/drawers/ChatWorkingDrawer.tsx:361 |
| utility | hover:bg-brand-hover | bg-brand-hover | exact semantic role | src/components/NavRail.tsx:57, src/components/chat/ComposerToolbar.tsx:199, src/components/settings/CatalogBrowser.tsx:425 (all in JSON) |
| utility | hover:bg-danger-hover | bg-danger-hover | exact semantic role | src/components/settings/appearance/ThemePreview.tsx:36, src/components/ui/button.tsx:12 |
| utility | hover:bg-danger-muted/80 | bg-danger-muted/80 | exact semantic role | src/components/memory/MemoryDetail.tsx:162 |
| utility | hover:bg-danger/10 | bg-danger/10 | exact semantic role | src/components/chat/envelopes/ApprovalCard.tsx:312, src/components/settings/CatalogSourceManager.tsx:184 |
| utility | hover:bg-danger/20 | bg-danger/20 | exact semantic role | src/components/settings/observability/ProcessHealthPanel.tsx:61, src/components/settings/observability/WorkerStatusPanel.tsx:105 |
| utility | hover:bg-destructive/90 | bg-danger/90 | Flux alias resolves by source role; accent means brand here | src/components/ui/badge.tsx:16 |
| utility | hover:bg-fg-secondary | bg-fg-secondary | exact semantic role | src/components/chat/Banner.tsx:108, src/components/chat/ComposerPlusMenu.tsx:163, src/components/chat/ComposerPlusMenu.tsx:176 (all in JSON) |
| utility | hover:bg-info/80 | bg-info/80 | exact semantic role | src/components/messaging/TaskThreadPanel.tsx:148 |
| utility | hover:bg-primary-active | bg-primary-active | exact semantic role | src/components/settings/PluginConfigPanel.tsx:246 |
| utility | hover:bg-primary-hover | bg-primary-hover | exact semantic role | src/components/chat/ChatComposer.tsx:673, src/components/chat/LeftRail.tsx:105, src/components/chat/SetupWizard.tsx:121 (all in JSON) |
| utility | hover:bg-primary/10 | bg-primary/10 | exact semantic role | src/components/chat/ApprovalCard.tsx:159 |
| utility | hover:bg-primary/80 | bg-primary/80 | exact semantic role | src/components/work/PlanStepItem.tsx:95, src/components/work/WorkTab.tsx:411 |
| utility | hover:bg-primary/90 | bg-primary/90 | exact semantic role | src/components/ui/badge.tsx:12 |
| utility | hover:bg-secondary/90 | bg-surface/90 | Flux alias resolves by source role; accent means brand here | src/components/ui/badge.tsx:14 |
| utility | hover:bg-selection | bg-selection | exact semantic role | src/components/ui/badge.tsx:18, src/components/ui/badge.tsx:19 |
| utility | hover:bg-success-muted | bg-success-muted | exact semantic role | src/components/settings/ShortcutsPanel.tsx:91 |
| utility | hover:bg-surface | bg-surface | exact semantic role | src/components/NavRail.tsx:116, src/components/NavRail.tsx:80, src/components/RightRail.tsx:201 (all in JSON) |
| utility | hover:bg-surface-hover | bg-surface-hover | exact semantic role | src/components/chat/ArtifactChip.tsx:25, src/components/chat/Banner.tsx:109, src/components/chat/ChatComposer.tsx:624 (all in JSON) |
| utility | hover:bg-surface/20 | bg-surface/20 | exact semantic role | src/components/plugins/debug/SlotInspectorPanel.tsx:108, src/components/plugins/debug/TurnSnapshotPanel.tsx:75, src/components/settings/observability/ProcessHealthPanel.tsx:17 (all in JSON) |
| utility | hover:bg-surface/30 | bg-surface/30 | exact semantic role | src/components/plugins/debug/DebugPanel.tsx:24, src/components/settings/appearance/TokenEditor.tsx:35, src/components/work/PlanCard.tsx:33 |
| utility | hover:bg-surface/40 | bg-surface/40 | exact semantic role | src/components/drawers/ChatPrimaryDrawer.tsx:221, src/components/drawers/ChatPrimaryDrawer.tsx:249, src/components/settings/PluginDetailView.tsx:289 (all in JSON) |
| utility | hover:bg-surface/50 | bg-surface/50 | exact semantic role | src/components/RightRailV2.tsx:357, src/components/chat/AgentPicker.tsx:106, src/components/chat/UserProfileMenu.tsx:117 (all in JSON) |
| utility | hover:bg-surface/60 | bg-surface/60 | exact semantic role | src/components/chat/extensions/FileMentionMenu.tsx:143, src/components/chat/extensions/FileMentionMenu.tsx:169, src/components/chat/extensions/SlashCommandMenu.tsx:143 (all in JSON) |
| utility | hover:bg-surface/70 | bg-surface/70 | exact semantic role | src/components/memory/MemoryCard.tsx:50, src/components/workflows/WorkflowRunCard.tsx:119 |
| utility | hover:bg-surface/80 | bg-surface/80 | exact semantic role | src/components/chat/ChatMessage.tsx:487 |
| utility | hover:border-border | border-border | exact semantic role | src/components/chat/ChatMain.tsx:228, src/components/chat/ChatMain.tsx:304, src/components/chat/LayoutMenu.tsx:127 (all in JSON) |
| utility | hover:border-border-subtle | border-border-subtle | exact semantic role | src/components/chat/ArtifactChip.tsx:25, src/components/drawers/ArtifactsContent.tsx:108 |
| utility | hover:border-brand-hover | border-brand-hover | exact semantic role | src/components/chat/ComposerToolbar.tsx:199 |
| utility | hover:border-fg/50 | border-fg/50 | exact semantic role | src/components/settings/appearance/TailwindSwatchGrid.tsx:22 |
| utility | hover:border-primary | border-primary | exact semantic role | src/components/chat/envelopes/primitives/ListCard.tsx:139, src/components/chat/envelopes/primitives/ListCard.tsx:336 |
| utility | hover:border-primary/60 | border-primary/60 | exact semantic role | src/components/work/PlanStepItem.tsx:59 |
| utility | hover:border-primary/80 | border-primary/80 | exact semantic role | src/components/work/TodoItem.tsx:106 |
| utility | hover:ring-2 | ring-2 | inherited border/stroke scale or structure | src/components/settings/ProfilePanel.tsx:64 |
| utility | hover:ring-primary/40 | ring-primary/40 | exact semantic role | src/components/settings/ProfilePanel.tsx:64 |
| utility | hover:shadow-md | shadow-md | named inherited/contract scale | src/components/settings/ProjectManager.tsx:85, src/components/settings/ToolDashboard.tsx:645 |
| utility | hover:shadow-sm | shadow-sm | named inherited/contract scale | src/components/settings/PreferencesPanel.tsx:105, src/components/settings/SkillsBrowser.tsx:340 |
| utility | hover:text-bg | text-bg | exact semantic role | src/components/chat/ComposerPlusMenu.tsx:163, src/components/chat/ComposerPlusMenu.tsx:176, src/components/chat/ComposerPlusMenu.tsx:189 (all in JSON) |
| utility | hover:text-composer-fg | text-fg | F1: scoped theme on composer; nearest role, retain dark composer only if confirmed | src/components/chat/UserProfileMenu.tsx:53 |
| utility | hover:text-danger | text-danger | exact semantic role | src/components/chat/envelopes/ApprovalCard.tsx:312, src/components/drawers/ChatPrimaryDrawer.tsx:267, src/components/drawers/ChatPrimaryDrawer.tsx:536 (all in JSON) |
| utility | hover:text-fg | text-fg | exact semantic role | src/components/NavRail.tsx:116, src/components/NavRail.tsx:135, src/components/NavRail.tsx:80 (all in JSON) |
| utility | hover:text-fg-muted | text-fg-muted | exact semantic role | src/components/RightRail.tsx:62, src/components/RightRailV2.tsx:115, src/components/chat/ChatMessage.tsx:326 (all in JSON) |
| utility | hover:text-fg-secondary | text-fg-secondary | exact semantic role | src/components/RightRail.tsx:201, src/components/RightRailV2.tsx:332, src/components/SearchModal.tsx:233 (all in JSON) |
| utility | hover:text-foreground | text-fg | Flux alias resolves by source role; accent means brand here | src/components/ui/tabs.tsx:67 |
| utility | hover:text-primary | text-primary | exact semantic role | src/components/chat/AgentRoster.tsx:120, src/components/drawers/ChatPrimaryDrawer.tsx:850, src/components/settings/agents/AgentDetailView.tsx:549 (all in JSON) |
| utility | hover:text-primary-hover | text-primary-hover | exact semantic role | src/components/chat/ApprovalCard.tsx:159, src/components/chat/MessageContent.tsx:129, src/components/chat/envelopes/ArtifactMiniCard.tsx:94 (all in JSON) |
| utility | hover:text-primary/80 | text-primary/80 | exact semantic role | src/components/chat/ShellMessage.tsx:64, src/components/chat/ShellMessage.tsx:73 |
| utility | hover:text-selection-fg | text-selection-fg | exact semantic role | src/components/ui/badge.tsx:18, src/components/ui/badge.tsx:19 |
| utility | hover:text-success | text-success | exact semantic role | src/components/settings/agents/editors/SystemPromptEditor.tsx:48 |
| utility | hover:text-warning | text-warning | exact semantic role | src/components/chat/ContentActions.tsx:50, src/components/chat/ShellInfoDrawer.tsx:31 |
| utility | inset-0 | inset-0 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/AgentPicker.tsx:53, src/components/chat/AgentPicker.tsx:54, src/components/chat/LayoutMenu.tsx:174 (all in JSON) |
| utility | inset-1.5 | inset-1.5 | named Tailwind spacing/size or structural utility; preserve | src/components/drawers/ChatWorkingDrawer.tsx:410 |
| utility | inset-x-0 | inset-x-0 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/Banner.tsx:81, src/components/chat/ChatComposer.tsx:582, src/components/chat/composer/Drawer.tsx:58 (all in JSON) |
| utility | inset-x-[1px] | inset-x-0.25 | Tailwind spacing scale; preserve sign/modifiers; rem follows user scaling | src/components/chat/LayoutMenu.tsx:134 |
| utility | inset-y-0 | inset-y-0 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/LeftRail.tsx:206, src/components/ui/sheet.tsx:63, src/components/ui/sheet.tsx:65 |
| utility | last:border-0 | border-0 | inherited border/stroke scale or structure | src/components/chat/envelopes/primitives/TableCard.tsx:221 |
| utility | last:border-b-0 | border-b-0 | inherited directional border scale / structural ring utility | src/components/chat/ToolCallItem.tsx:103, src/components/settings/agents/AgentCapabilitiesPanel.tsx:962, src/components/settings/agents/editors/CapabilityChecklist.tsx:68 (all in JSON) |
| utility | last:gap-2 | gap-2 | named Tailwind spacing/size or structural utility; preserve | src/components/ui/select.tsx:112 |
| utility | last:pb-0 | pb-0 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/envelopes/primitives/TimelineCard.tsx:56 |
| utility | leading-[1.35] | leading-normal | F4: readable line-height role; explicit density tradeoff | src/components/chat/LeftRail.tsx:250, src/components/chat/LeftRail.tsx:360 |
| utility | leading-[1.4] | leading-normal | F4: readable line-height role; explicit density tradeoff | src/components/chat/envelopes/primitives/StatusPill.tsx:56, src/components/settings/agents/SkillDetailView.tsx:377, src/components/settings/agents/SkillDetailView.tsx:381 |
| utility | leading-[1.5] | leading-normal | F4: readable line-height role; explicit density tradeoff | src/components/chat/composer/CardRadio.tsx:64 |
| utility | leading-none | leading-none | named inherited/contract scale | src/components/NavRail.tsx:57, src/components/SearchModal.tsx:201, src/components/agents/TagPills.tsx:50 (all in JSON) |
| utility | leading-relaxed | leading-relaxed | named inherited/contract scale | src/components/chat/AdapterBadge.tsx:26, src/components/chat/ApprovalCard.tsx:127, src/components/chat/ChatComposer.tsx:318 (all in JSON) |
| utility | leading-snug | leading-snug | named inherited/contract scale | src/components/SearchModal.tsx:200, src/components/chat/ApprovalCard.tsx:111, src/components/chat/envelopes/ErrorCard.tsx:128 (all in JSON) |
| utility | leading-tight | leading-tight | named inherited/contract scale | src/components/chat/LayoutMenu.tsx:229, src/components/chat/LayoutMenu.tsx:462, src/components/settings/agents/editors/ConstraintsEditor.tsx:104 (all in JSON) |
| utility | left-0 | left-0 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/ChatHeader.tsx:330, src/components/chat/LeftRail.tsx:206, src/components/drawers/ChatWorkingDrawer.tsx:316 (all in JSON) |
| utility | left-0.5 | left-0.5 | named Tailwind spacing/size or structural utility; preserve | src/components/settings/CatalogSourceManager.tsx:177, src/components/settings/primitives.tsx:144 |
| utility | left-1/2 | left-1/2 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/ChatHeader.tsx:292, src/components/chat/LayoutMenu.tsx:333 |
| utility | left-10 | left-10 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/LeftRail.tsx:217, src/components/chat/LeftRail.tsx:235 |
| utility | left-2 | left-2 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/LeftRail.tsx:217, src/components/chat/LeftRail.tsx:235, src/components/ui/context-menu.tsx:151 (all in JSON) |
| utility | left-2.5 | left-2.5 | named Tailwind spacing/size or structural utility; preserve | src/components/settings/CatalogBrowser.tsx:183, src/components/settings/ProfilePanel.tsx:213, src/components/settings/ProfilePanel.tsx:228 (all in JSON) |
| utility | left-8 | left-8 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/LeftRail.tsx:210 |
| utility | left-[18px] | left-4.5 | Tailwind spacing scale; preserve sign/modifiers; rem follows user scaling | src/components/settings/primitives.tsx:144 |
| utility | left-[50%] | w-full / max-w-3xl / viewport-bounded slot | F5: proportional/bounded layout; keep data geometry separate from design scale | src/components/ui/alert-dialog.tsx:61, src/components/ui/dialog.tsx:62 |
| utility | left-[5px] | left-1.25 | Tailwind spacing scale; preserve sign/modifiers; rem follows user scaling | src/components/chat/envelopes/primitives/TimelineCard.tsx:59 |
| utility | left-[calc(100%-1rem)] | w-full / max-w-3xl / viewport-bounded slot | F5: proportional/bounded layout; keep data geometry separate from design scale | src/components/settings/CatalogSourceManager.tsx:177 |
| utility | lg:top-0 | top-0 | named Tailwind spacing/size or structural utility; preserve | src/components/settings/appearance/AppearancePanel.tsx:307 |
| utility | m-3 | m-3 | named Tailwind spacing/size or structural utility; preserve | src/components/RightRail.tsx:272, src/components/RightRailV2.tsx:432 |
| utility | max-h-20 | max-h-20 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/ApprovalCard.tsx:127, src/components/settings/inspector/InspectorPanel.tsx:129 |
| utility | max-h-24 | max-h-24 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/ToolCallItem.tsx:185, src/components/settings/inspector/InspectorPanel.tsx:242, src/components/settings/inspector/InspectorPanel.tsx:96 |
| utility | max-h-32 | max-h-32 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/ToolCallItem.tsx:145, src/components/chat/ToolWarningBanner.tsx:57, src/components/settings/inspector/InspectorPanel.tsx:250 |
| utility | max-h-36 | max-h-36 | named Tailwind spacing/size or structural utility; preserve | src/components/settings/agents/editors/CapabilityChecklist.tsx:54 |
| utility | max-h-40 | max-h-40 | named Tailwind spacing/size or structural utility; preserve | src/components/widgets/ContextInspectorModal.tsx:237 |
| utility | max-h-48 | max-h-48 | named Tailwind spacing/size or structural utility; preserve | src/components/settings/agents/AgentDetailView.tsx:734, src/components/settings/agents/editors/SystemPromptEditor.tsx:103, src/components/widgets/ContextInspectorModal.tsx:268 (all in JSON) |
| utility | max-h-56 | max-h-56 | named Tailwind spacing/size or structural utility; preserve | src/components/settings/agents/AgentCapabilitiesPanel.tsx:958 |
| utility | max-h-64 | max-h-64 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/AgentPicker.tsx:83, src/components/chat/extensions/FileMentionMenu.tsx:124, src/components/settings/inspector/InspectorPanel.tsx:262 |
| utility | max-h-72 | max-h-72 | named Tailwind spacing/size or structural utility; preserve | src/components/settings/agents/AgentBuilderWizard.tsx:1411, src/components/settings/agents/AgentCapabilitiesPanel.tsx:390 |
| utility | max-h-80 | max-h-80 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/AgentRoster.tsx:58, src/components/chat/extensions/SlashCommandMenu.tsx:121 |
| utility | max-h-[160px] | max-h-40 | Tailwind spacing scale; preserve sign/modifiers; rem follows user scaling | src/components/chat/ChatComposer.tsx:318 |
| utility | max-h-[220px] | max-h-55 | Tailwind spacing scale; preserve sign/modifiers; rem follows user scaling | src/components/settings/appearance/TailwindSwatchGrid.tsx:9 |
| utility | max-h-[300px] | max-h-75 | Tailwind spacing scale; preserve sign/modifiers; rem follows user scaling | src/components/ui/command.tsx:91 |
| utility | max-h-[400px] | max-h-100 | Tailwind spacing scale; preserve sign/modifiers; rem follows user scaling | src/components/CommandPalette.tsx:124, src/components/SearchModal.tsx:144 |
| utility | max-h-[500px] | max-h-125 | Tailwind spacing scale; preserve sign/modifiers; rem follows user scaling | src/components/chat/envelopes/DocumentViewerCard.tsx:107 |
| utility | max-h-[60vh] | w-full / max-w-3xl / viewport-bounded slot | F5: proportional/bounded layout; keep data geometry separate from design scale | src/components/drawers/ArtifactsContent.tsx:80, src/components/drawers/ArtifactsContent.tsx:88, src/components/drawers/ChatPrimaryDrawer.tsx:962 |
| utility | max-h-[620px] | max-h-155 | Tailwind spacing scale; preserve sign/modifiers; rem follows user scaling | src/components/settings/DurableAgentAdminPanel.tsx:150 |
| utility | max-h-[80vh] | w-full / max-w-3xl / viewport-bounded slot | F5: proportional/bounded layout; keep data geometry separate from design scale | src/components/chat/ErrorDetailModal.tsx:38, src/components/memory/MemoryModal.tsx:35, src/components/settings/ToolDashboard.tsx:826 (all in JSON) |
| utility | max-h-[85vh] | w-full / max-w-3xl / viewport-bounded slot | F5: proportional/bounded layout; keep data geometry separate from design scale | src/components/settings/ToolDashboard.tsx:1062, src/components/settings/ToolDashboard.tsx:893 |
| utility | max-h-[86vh] | w-full / max-w-3xl / viewport-bounded slot | F5: proportional/bounded layout; keep data geometry separate from design scale | src/components/chat/SessionDetailsPanel.tsx:68 |
| utility | max-h-[calc(86vh-76px)] | w-full / max-w-3xl / viewport-bounded slot | F5: proportional/bounded layout; keep data geometry separate from design scale | src/components/chat/SessionDetailsPanel.tsx:77 |
| utility | max-h-[min(720px,calc(100vh-2rem))] | w-full / max-w-3xl / viewport-bounded slot | F5: proportional/bounded layout; keep data geometry separate from design scale | src/components/sidebar/StartSurfaceDialog.tsx:283 |
| utility | max-w-2xl | max-w-2xl | named Tailwind spacing/size or structural utility; preserve | src/components/chat/ChatMain.tsx:200, src/components/chat/ChatMain.tsx:218, src/components/settings/DurableAgentAdminPanel.tsx:95 |
| utility | max-w-3xl | max-w-3xl | named Tailwind spacing/size or structural utility; preserve | src/components/chat/ChatHeader.tsx:304, src/components/chat/ChatMain.tsx:77, src/components/chat/ChatMain.tsx:89 (all in JSON) |
| utility | max-w-5xl | max-w-5xl | named Tailwind spacing/size or structural utility; preserve | src/components/settings/SettingsPage.tsx:313 |
| utility | max-w-6xl | max-w-6xl | named Tailwind spacing/size or structural utility; preserve | src/components/settings/inspector/InspectorPanel.tsx:514, src/components/settings/observability/ObservabilityDashboard.tsx:37 |
| utility | max-w-[120px] | max-w-30 | Tailwind spacing scale; preserve sign/modifiers; rem follows user scaling | src/components/settings/observability/WorkerStatusPanel.tsx:80, src/components/workflows/WorkflowRunDetail.tsx:127 |
| utility | max-w-[160px] | max-w-40 | Tailwind spacing scale; preserve sign/modifiers; rem follows user scaling | src/components/drawers/ChatPrimaryDrawer.tsx:246, src/components/settings/observability/WorkerStatusPanel.tsx:95 |
| utility | max-w-[200px] | max-w-50 | Tailwind spacing scale; preserve sign/modifiers; rem follows user scaling | src/components/chat/ArtifactChip.tsx:28, src/components/settings/ProviderManager.tsx:254 |
| utility | max-w-[40%] | w-full / max-w-3xl / viewport-bounded slot | F5: proportional/bounded layout; keep data geometry separate from design scale | src/components/settings/PluginDetailView.tsx:295, src/components/settings/agents/AgentDetailView.tsx:542, src/components/settings/agents/AgentDetailView.tsx:623 |
| utility | max-w-[480px] | max-w-120 | Tailwind spacing scale; preserve sign/modifiers; rem follows user scaling | src/components/chat/ChatHeader.tsx:292 |
| utility | max-w-[80%] | w-full / max-w-3xl / viewport-bounded slot | F5: proportional/bounded layout; keep data geometry separate from design scale | src/components/chat/ChatMessage.tsx:358 |
| utility | max-w-[calc(100%-2rem)] | w-full / max-w-3xl / viewport-bounded slot | F5: proportional/bounded layout; keep data geometry separate from design scale | src/components/ui/alert-dialog.tsx:61, src/components/ui/dialog.tsx:62 |
| utility | max-w-full | max-w-full | named Tailwind spacing/size or structural utility; preserve | src/components/chat/ChatMessage.tsx:358, src/components/chat/ChatTranscript.tsx:428, src/components/chat/MessageContent.tsx:138 (all in JSON) |
| utility | max-w-lg | max-w-lg | named Tailwind spacing/size or structural utility; preserve | src/components/AppGate.tsx:36, src/components/chat/ChatMain.tsx:298, src/components/chat/ChatMain.tsx:316 (all in JSON) |
| utility | max-w-md | max-w-md | named Tailwind spacing/size or structural utility; preserve | src/components/settings/ProviderManager.tsx:77 |
| utility | max-w-none | max-w-none | named Tailwind spacing/size or structural utility; preserve | src/components/chat/envelopes/DocumentViewerCard.tsx:111 |
| utility | max-w-sm | max-w-sm | named Tailwind spacing/size or structural utility; preserve | src/components/chat/AgentPicker.tsx:55, src/components/chat/ChatTranscript.tsx:257, src/components/messaging/InboxContent.tsx:425 (all in JSON) |
| utility | max-w-xs | max-w-xs | named Tailwind spacing/size or structural utility; preserve | src/components/settings/inspector/InspectorPanel.tsx:544, src/components/ui/alert-dialog.tsx:61 |
| utility | mb-0.5 | mb-0.5 | named Tailwind spacing/size or structural utility; preserve | src/components/messaging/TaskThreadPanel.tsx:166, src/components/settings/appearance/AppearancePanel.tsx:231 |
| utility | mb-1 | mb-1 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/ChatComposer.tsx:546, src/components/chat/ChatMain.tsx:307, src/components/chat/ChatMessage.tsx:244 (all in JSON) |
| utility | mb-1.5 | mb-1.5 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/UserProfileMenu.tsx:105, src/components/chat/envelopes/primitives/ConfirmationCard.tsx:163, src/components/chat/envelopes/primitives/ConfirmationCard.tsx:244 (all in JSON) |
| utility | mb-10 | mb-10 | named Tailwind spacing/size or structural utility; preserve | src/components/AppGate.tsx:36, src/components/chat/ChatMain.tsx:316 |
| utility | mb-2 | mb-2 | named Tailwind spacing/size or structural utility; preserve | src/components/AppGate.tsx:37, src/components/NavRail.tsx:64, src/components/chat/ChatMain.tsx:230 (all in JSON) |
| utility | mb-3 | mb-3 | named Tailwind spacing/size or structural utility; preserve | src/components/NavRail.tsx:57, src/components/chat/ChatMain.tsx:306, src/components/chat/LayoutMenu.tsx:184 (all in JSON) |
| utility | mb-3.5 | mb-3.5 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/envelopes/primitives/ListCard.tsx:274 |
| utility | mb-4 | mb-4 | named Tailwind spacing/size or structural utility; preserve | src/components/settings/primitives.tsx:49 |
| utility | mb-5 | mb-5 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/ChatTranscript.tsx:258 |
| utility | mb-6 | mb-6 | named Tailwind spacing/size or structural utility; preserve | src/components/settings/primitives.tsx:9 |
| utility | mb-px | mb-px | named Tailwind spacing/size or structural utility; preserve | src/components/settings/SettingsPage.tsx:274 |
| utility | md:text-sm | text-sm | named inherited/contract type or structural text utility | src/components/ui/input.tsx:11, src/components/ui/textarea.tsx:10 |
| utility | min-h-0 | min-h-0 | named Tailwind spacing/size or structural utility; preserve | src/components/RightRail.tsx:213, src/components/RightRail.tsx:214, src/components/RightRail.tsx:250 (all in JSON) |
| utility | min-h-16 | min-h-16 | named Tailwind spacing/size or structural utility; preserve | src/components/ui/textarea.tsx:10 |
| utility | min-h-20 | min-h-20 | named Tailwind spacing/size or structural utility; preserve | src/components/settings/DurableAgentAdminPanel.tsx:1265, src/components/settings/DurableAgentAdminPanel.tsx:776, src/components/sidebar/StartSurfaceDialog.tsx:540 (all in JSON) |
| utility | min-h-3 | min-h-3 | named Tailwind spacing/size or structural utility; preserve | src/components/workflows/WorkflowStepItem.tsx:58 |
| utility | min-h-5 | min-h-5 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/SessionDetailsPanel.tsx:489 |
| utility | min-h-7 | min-h-7 | named Tailwind spacing/size or structural utility; preserve | src/components/settings/DurableAgentAdminPanel.tsx:1210 |
| utility | min-h-[100px] | min-h-25 | Tailwind spacing scale; preserve sign/modifiers; rem follows user scaling | src/components/settings/agents/SkillCreateWizard.tsx:212, src/components/settings/agents/SkillCreateWizard.tsx:226 |
| utility | min-h-[120px] | min-h-30 | Tailwind spacing scale; preserve sign/modifiers; rem follows user scaling | src/components/settings/ProfilePanel.tsx:250 |
| utility | min-h-[200px] | min-h-50 | Tailwind spacing scale; preserve sign/modifiers; rem follows user scaling | src/components/settings/agents/editors/SystemPromptEditor.tsx:77 |
| utility | min-h-[20px] | min-h-5 | Tailwind spacing scale; preserve sign/modifiers; rem follows user scaling | src/components/widgets/Widget.tsx:81 |
| utility | min-h-[240px] | min-h-60 | Tailwind spacing scale; preserve sign/modifiers; rem follows user scaling | src/components/settings/agents/PromptCreateWizard.tsx:223 |
| utility | min-h-[26px] | min-h-6.5 | Tailwind spacing scale; preserve sign/modifiers; rem follows user scaling | src/components/chat/LayoutMenu.tsx:410 |
| utility | min-h-[280px] | min-h-70 | Tailwind spacing scale; preserve sign/modifiers; rem follows user scaling | src/components/settings/agents/AgentCreateWizard.tsx:476 |
| utility | min-h-[320px] | min-h-80 | Tailwind spacing scale; preserve sign/modifiers; rem follows user scaling | src/components/settings/agents/SkillCreateWizard.tsx:137 |
| utility | min-h-[360px] | min-h-90 | Tailwind spacing scale; preserve sign/modifiers; rem follows user scaling | src/components/settings/agents/AgentCreateWizard.tsx:191, src/components/settings/agents/PromptCreateWizard.tsx:143 |
| utility | min-h-[36px] | min-h-9 | Tailwind spacing scale; preserve sign/modifiers; rem follows user scaling | src/components/ui/tag-input.tsx:117 |
| utility | min-h-[40px] | min-h-10 | Tailwind spacing scale; preserve sign/modifiers; rem follows user scaling | src/components/chat/LayoutMenu.tsx:427 |
| utility | min-h-[420px] | min-h-105 | Tailwind spacing scale; preserve sign/modifiers; rem follows user scaling | src/components/sidebar/StartSurfaceDialog.tsx:291 |
| utility | min-h-[80px] | min-h-20 | Tailwind spacing scale; preserve sign/modifiers; rem follows user scaling | src/components/chat/ChatComposer.tsx:318, src/components/settings/agents/PromptCreateWizard.tsx:236 |
| utility | min-w-0 | min-w-0 | named Tailwind spacing/size or structural utility; preserve | src/components/SearchModal.tsx:163, src/components/SearchModal.tsx:199, src/components/chat/AgentPicker.tsx:115 (all in JSON) |
| utility | min-w-5 | min-w-5 | named Tailwind spacing/size or structural utility; preserve | src/components/ui/kbd.tsx:8 |
| utility | min-w-64 | min-w-64 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/LeftRail.tsx:89 |
| utility | min-w-96 | min-w-96 | named Tailwind spacing/size or structural utility; preserve | src/components/RightRail.tsx:187, src/components/RightRailV2.tsx:318 |
| utility | min-w-[140px] | min-w-35 | Tailwind spacing scale; preserve sign/modifiers; rem follows user scaling | src/components/chat/LayoutMenu.tsx:126 |
| utility | min-w-[220px] | min-w-55 | Tailwind spacing scale; preserve sign/modifiers; rem follows user scaling | src/components/sidebar/ScopeSelector.tsx:70 |
| utility | min-w-[22px] | min-w-5.5 | Tailwind spacing scale; preserve sign/modifiers; rem follows user scaling | src/components/settings/primitives.tsx:278 |
| utility | min-w-[300px] | min-w-75 | Tailwind spacing scale; preserve sign/modifiers; rem follows user scaling | src/components/chat/ComposerPlusMenu.tsx:138 |
| utility | min-w-[320px] | min-w-80 | Tailwind spacing scale; preserve sign/modifiers; rem follows user scaling | src/components/messaging/TaskThreadPanel.tsx:95 |
| utility | min-w-[60px] | min-w-15 | Tailwind spacing scale; preserve sign/modifiers; rem follows user scaling | src/components/ui/tag-input.tsx:157 |
| utility | min-w-[8rem] | min-w-32 | Tailwind spacing scale; preserve sign/modifiers; rem follows user scaling | src/components/ui/context-menu.tsx:103, src/components/ui/context-menu.tsx:86, src/components/ui/dropdown-menu.tsx:233 (all in JSON) |
| utility | min-w-[var(--radix-select-trigger-width)] | controlled layout slot / named scale | F5: dynamic expression is host geometry, never component design constant | src/components/ui/select.tsx:79 |
| utility | ml-0.5 | ml-0.5 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/envelopes/ProposalCard.tsx:87, src/components/drawers/ChatPrimaryDrawer.tsx:267, src/components/settings/PluginConfigPanel.tsx:212 (all in JSON) |
| utility | ml-1 | ml-1 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/LeftRail.tsx:157, src/components/chat/LeftRail.tsx:268, src/components/chat/ToolCallDisplay.tsx:56 (all in JSON) |
| utility | ml-1.5 | ml-1.5 | named Tailwind spacing/size or structural utility; preserve | src/components/drawers/ChatPrimaryDrawer.tsx:910, src/components/settings/PluginManager.tsx:263 |
| utility | ml-2 | ml-2 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/AgentRoster.tsx:51, src/components/chat/ErrorDetailModal.tsx:55, src/components/chat/LeftRail.tsx:256 (all in JSON) |
| utility | ml-3 | ml-3 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/SetupWizard.tsx:234 |
| utility | ml-4 | ml-4 | named Tailwind spacing/size or structural utility; preserve | src/components/work/PlanStepItem.tsx:82 |
| utility | ml-5 | ml-5 | named Tailwind spacing/size or structural utility; preserve | src/components/messaging/InboxContent.tsx:247, src/components/messaging/InboxContent.tsx:306, src/components/messaging/InboxContent.tsx:311 (all in JSON) |
| utility | ml-7 | ml-7 | named Tailwind spacing/size or structural utility; preserve | src/components/settings/PluginConfigPanel.tsx:236 |
| utility | ml-auto | ml-auto | named Tailwind spacing/size or structural utility; preserve | src/components/CommandPalette.tsx:155, src/components/CommandPalette.tsx:297, src/components/SearchModal.tsx:140 (all in JSON) |
| utility | mr-1 | mr-1 | named Tailwind spacing/size or structural utility; preserve | src/components/settings/CatalogBrowser.tsx:229, src/components/settings/CatalogBrowser.tsx:241, src/components/settings/CatalogSourceManager.tsx:168 (all in JSON) |
| utility | mr-1.5 | mr-1.5 | named Tailwind spacing/size or structural utility; preserve | src/components/settings/DurableAgentAdminPanel.tsx:108, src/components/settings/DurableAgentAdminPanel.tsx:1082, src/components/settings/DurableAgentAdminPanel.tsx:112 (all in JSON) |
| utility | mr-2 | mr-2 | named Tailwind spacing/size or structural utility; preserve | src/components/settings/PluginConfigPanel.tsx:249, src/components/settings/PluginConfigPanel.tsx:251, src/components/settings/agents/editors/SystemPromptEditor.tsx:42 |
| utility | mr-auto | mr-auto | named Tailwind spacing/size or structural utility; preserve | src/components/settings/CatalogSourceManager.tsx:296 |
| utility | mt-0.5 | mt-0.5 | named Tailwind spacing/size or structural utility; preserve | src/components/SearchModal.tsx:172, src/components/chat/AgentPicker.tsx:123, src/components/chat/AgentRoster.tsx:92 (all in JSON) |
| utility | mt-1 | mt-1 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/AgentRoster.tsx:107, src/components/chat/AgentRoster.tsx:110, src/components/chat/Banner.tsx:97 (all in JSON) |
| utility | mt-1.5 | mt-1.5 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/ChatMessage.tsx:339, src/components/chat/ShellMessage.tsx:64, src/components/chat/ShellMessage.tsx:73 (all in JSON) |
| utility | mt-2 | mt-2 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/Banner.tsx:100, src/components/chat/ChatComposer.tsx:736, src/components/chat/ChatMessage.tsx:367 (all in JSON) |
| utility | mt-3 | mt-3 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/Banner.tsx:100, src/components/chat/ChatMain.tsx:244, src/components/chat/ChatMain.tsx:255 (all in JSON) |
| utility | mt-3.5 | mt-3.5 | named Tailwind spacing/size or structural utility; preserve | src/components/settings/SettingsPage.tsx:263 |
| utility | mt-4 | mt-4 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/MessageContent.tsx:182, src/components/settings/DurableAgentAdminPanel.tsx:1381, src/components/settings/agents/AgentBuilderWizard.tsx:1092 (all in JSON) |
| utility | mt-5 | mt-5 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/MessageContent.tsx:179 |
| utility | mt-6 | mt-6 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/MessageContent.tsx:176 |
| utility | mt-8 | mt-8 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/ChatMain.tsx:329 |
| utility | mt-[1.5px] | mt-0.375 | Tailwind spacing scale; preserve sign/modifiers; rem follows user scaling | src/components/SearchModal.tsx:207 |
| utility | mt-[3.5px] | mt-0.875 | Tailwind spacing scale; preserve sign/modifiers; rem follows user scaling | src/components/SearchModal.tsx:198 |
| utility | mt-auto | mt-auto | named Tailwind spacing/size or structural utility; preserve | src/components/NavRail.tsx:129, src/components/chat/LayoutMenu.tsx:223, src/components/ui/sheet.tsx:100 |
| utility | mt-px | mt-px | named Tailwind spacing/size or structural utility; preserve | src/components/SearchModal.tsx:201 |
| utility | mx-0.5 | mx-0.5 | named Tailwind spacing/size or structural utility; preserve | src/components/SearchModal.tsx:167, src/components/SearchModal.tsx:169, src/components/settings/agents/editors/EditableStringList.tsx:215 |
| utility | mx-1 | mx-1 | named Tailwind spacing/size or structural utility; preserve | src/components/SearchModal.tsx:203, src/components/chat/ComposerPlusMenu.tsx:154, src/components/chat/ComposerPlusMenu.tsx:196 (all in JSON) |
| utility | mx-3 | mx-3 | named Tailwind spacing/size or structural utility; preserve | src/components/workflows/WorkflowRunDetail.tsx:157 |
| utility | mx-4 | mx-4 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/envelopes/ApprovalCard.tsx:299, src/components/chat/envelopes/ElicitationPromptCard.tsx:181, src/components/chat/envelopes/primitives/TableCard.tsx:246 (all in JSON) |
| utility | mx-auto | mx-auto | named Tailwind spacing/size or structural utility; preserve | src/components/chat/ChatHeader.tsx:304, src/components/chat/ChatMain.tsx:77, src/components/chat/ChatMain.tsx:89 (all in JSON) |
| utility | my-1 | my-1 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/ChatHeader.tsx:415, src/components/chat/ChatHeader.tsx:513, src/components/ui/context-menu.tsx:212 (all in JSON) |
| utility | my-1.5 | my-1.5 | named Tailwind spacing/size or structural utility; preserve | src/components/widgets/TokenUsageWidget.tsx:75 |
| utility | my-2 | my-2 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/AgentRoster.tsx:73, src/components/chat/MessageContent.tsx:194, src/components/chat/MessageContent.tsx:197 (all in JSON) |
| utility | my-3 | my-3 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/MessageContent.tsx:138, src/components/chat/MessageContent.tsx:168, src/components/chat/MessageContent.tsx:81 |
| utility | my-4 | my-4 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/MessageContent.tsx:206 |
| utility | my-agent | my-agent | named Tailwind spacing/size or structural utility; preserve | src/components/settings/agents/AgentCreateWizard.tsx:352 |
| utility | my-prompt | my-prompt | named Tailwind spacing/size or structural utility; preserve | src/components/settings/agents/PromptCreateWizard.tsx:172 |
| utility | my-server | my-server | named Tailwind spacing/size or structural utility; preserve | src/components/settings/ToolDashboard.tsx:1092, src/components/settings/ToolDashboard.tsx:913 |
| utility | my-skill | my-skill | named Tailwind spacing/size or structural utility; preserve | src/components/settings/agents/SkillCreateWizard.tsx:166 |
| utility | outline-hidden | outline-hidden | inherited border/stroke scale or structure | src/components/ui/command.tsx:148, src/components/ui/command.tsx:74, src/components/ui/context-menu.tsx:127 (all in JSON) |
| utility | outline-none | outline-none | inherited border/stroke scale or structure | src/components/chat/AgentPicker.tsx:76, src/components/chat/ChatComposer.tsx:318, src/components/chat/ChatComposer.tsx:699 (all in JSON) |
| utility | p-0 | p-0 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/UserProfileMenu.tsx:68, src/components/chat/envelopes/DocumentViewerCard.tsx:68, src/components/chat/envelopes/DocumentViewerCard.tsx:78 (all in JSON) |
| utility | p-0.5 | p-0.5 | named Tailwind spacing/size or structural utility; preserve | src/components/RightRail.tsx:62, src/components/RightRailV2.tsx:115, src/components/chat/ChatComposer.tsx:624 (all in JSON) |
| utility | p-1 | p-1 | named Tailwind spacing/size or structural utility; preserve | src/components/RightRail.tsx:73, src/components/RightRailV2.tsx:126, src/components/chat/AgentPicker.tsx:61 (all in JSON) |
| utility | p-1.5 | p-1.5 | named Tailwind spacing/size or structural utility; preserve | src/components/RightRail.tsx:198, src/components/RightRailV2.tsx:329, src/components/chat/ComposerPlusMenu.tsx:138 (all in JSON) |
| utility | p-2 | p-2 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/AgentPicker.tsx:106, src/components/chat/AgentPicker.tsx:87, src/components/chat/envelopes/ErrorCard.tsx:95 (all in JSON) |
| utility | p-2.5 | p-2.5 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/LayoutMenu.tsx:408, src/components/settings/inspector/InspectorPanel.tsx:77 |
| utility | p-3 | p-3 | named Tailwind spacing/size or structural utility; preserve | src/components/RightRail.tsx:215, src/components/RightRailV2.tsx:373, src/components/chat/AgentPicker.tsx:83 (all in JSON) |
| utility | p-3.5 | p-3.5 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/envelopes/ReportCard.tsx:68, src/components/settings/CatalogSourceManager.tsx:104 |
| utility | p-4 | p-4 | named Tailwind spacing/size or structural utility; preserve | src/components/RightRailV2.tsx:444, src/components/chat/Banner.tsx:83, src/components/chat/ChatMain.tsx:228 (all in JSON) |
| utility | p-5 | p-5 | named Tailwind spacing/size or structural utility; preserve | src/components/settings/ProviderManager.tsx:84, src/components/settings/agents/AgentCreateWizard.tsx:319, src/components/settings/agents/AgentCreateWizard.tsx:444 (all in JSON) |
| utility | p-6 | p-6 | named Tailwind spacing/size or structural utility; preserve | src/components/drawers/ChatPrimaryDrawer.tsx:672, src/components/drawers/ChatPrimaryDrawer.tsx:682, src/components/drawers/ChatWorkingDrawer.tsx:409 (all in JSON) |
| utility | p-8 | p-8 | named Tailwind spacing/size or structural utility; preserve | src/components/settings/DurableAgentAdminPanel.tsx:326 |
| utility | p-[3px] | p-0.75 | Tailwind spacing scale; preserve sign/modifiers; rem follows user scaling | src/components/settings/primitives.tsx:240, src/components/ui/tabs.tsx:29 |
| utility | p-[5px] | p-1.25 | Tailwind spacing scale; preserve sign/modifiers; rem follows user scaling | src/components/chat/LayoutMenu.tsx:214 |
| utility | pb-1 | pb-1 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/ChatHeader.tsx:491, src/components/chat/ChatMain.tsx:89, src/components/chat/LayoutMenu.tsx:456 (all in JSON) |
| utility | pb-1.5 | pb-1.5 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/LayoutMenu.tsx:379, src/components/chat/LeftRail.tsx:149, src/components/chat/extensions/FileMentionMenu.tsx:94 |
| utility | pb-16 | pb-16 | named Tailwind spacing/size or structural utility; preserve | src/components/settings/SettingsPage.tsx:313 |
| utility | pb-2 | pb-2 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/ChatComposer.tsx:544, src/components/chat/ChatComposer.tsx:689, src/components/chat/LayoutMenu.tsx:462 (all in JSON) |
| utility | pb-2.5 | pb-2.5 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/extensions/FileMentionMenu.tsx:111 |
| utility | pb-3 | pb-3 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/ErrorDetailModal.tsx:39, src/components/chat/LeftRail.tsx:135, src/components/chat/SessionDetailsPanel.tsx:69 (all in JSON) |
| utility | pb-3.5 | pb-3.5 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/composer/Drawer.tsx:89 |
| utility | pb-4 | pb-4 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/ComposerToolbar.tsx:113, src/components/chat/envelopes/primitives/TimelineCard.tsx:56, src/components/settings/PluginDetailView.tsx:218 (all in JSON) |
| utility | pb-5 | pb-5 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/SessionDetailsPanel.tsx:77, src/components/settings/ToolDashboard.tsx:1036, src/components/settings/ToolDashboard.tsx:1126 (all in JSON) |
| utility | pb-6 | pb-6 | named Tailwind spacing/size or structural utility; preserve | src/components/ui/card.tsx:23 |
| utility | pb-px | pb-px | named Tailwind spacing/size or structural utility; preserve | src/components/settings/inspector/InspectorPanel.tsx:326 |
| utility | pl-0.5 | pl-0.5 | named Tailwind spacing/size or structural utility; preserve | src/components/workflows/WorkflowRunCard.tsx:153 |
| utility | pl-10 | pl-10 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/LeftRail.tsx:202 |
| utility | pl-16 | pl-16 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/LeftRail.tsx:202 |
| utility | pl-2 | pl-2 | named Tailwind spacing/size or structural utility; preserve | src/components/ui/select.tsx:112, src/components/work/PlanCard.tsx:48 |
| utility | pl-3 | pl-3 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/ComposerToolbar.tsx:113, src/components/settings/PreferencesPanel.tsx:123, src/components/settings/ToolDashboard.tsx:794 (all in JSON) |
| utility | pl-3.5 | pl-3.5 | named Tailwind spacing/size or structural utility; preserve | src/components/workflows/WorkflowRunCard.tsx:136 |
| utility | pl-4 | pl-4 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/MessageContent.tsx:168 |
| utility | pl-5 | pl-5 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/MessageContent.tsx:194, src/components/chat/MessageContent.tsx:197 |
| utility | pl-6 | pl-6 | named Tailwind spacing/size or structural utility; preserve | src/components/settings/ToolDashboard.tsx:1113, src/components/settings/ToolDashboard.tsx:1118, src/components/workflows/WorkflowRunDetail.tsx:126 |
| utility | pl-7 | pl-7 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/ToolCallItem.tsx:184 |
| utility | pl-8 | pl-8 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/extensions/FileMentionMenu.tsx:140, src/components/chat/extensions/FileMentionMenu.tsx:166, src/components/chat/extensions/SlashCommandMenu.tsx:140 (all in JSON) |
| utility | placeholder-fg-faint | placeholder-fg-faint | exact semantic role | src/components/chat/AgentPicker.tsx:76 |
| utility | placeholder:text-fg-faint | text-fg-faint | exact semantic role | src/components/chat/ChatComposer.tsx:318, src/components/chat/UserProfileMenu.tsx:94, src/components/chat/envelopes/ApprovalCard.tsx:263 (all in JSON) |
| utility | placeholder:text-fg-faint/50 | text-fg-faint/50 | exact semantic role | src/components/settings/agents/AgentCreateWizard.tsx:476 |
| utility | placeholder:text-fg-faint/60 | text-fg-faint/60 | exact semantic role | src/components/settings/ProfilePanel.tsx:250 |
| utility | placeholder:text-fg-muted | text-fg-muted | exact semantic role | src/components/settings/ToolDashboard.tsx:914, src/components/settings/ToolDashboard.tsx:943, src/components/settings/ToolDashboard.tsx:957 (all in JSON) |
| utility | placeholder:text-muted-foreground | text-fg-muted | Flux alias resolves by source role; accent means brand here | src/components/ui/input.tsx:11, src/components/ui/textarea.tsx:10 |
| utility | pr-1 | pr-1 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/ToolCallItem.tsx:184, src/components/settings/appearance/TailwindSwatchGrid.tsx:9 |
| utility | pr-10 | pr-10 | named Tailwind spacing/size or structural utility; preserve | src/components/memory/MemoryBrowse.tsx:62, src/components/memory/MemoryDetail.tsx:147, src/components/settings/ProviderManager.tsx:158 |
| utility | pr-14 | pr-14 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/LeftRail.tsx:201 |
| utility | pr-16 | pr-16 | named Tailwind spacing/size or structural utility; preserve | src/components/settings/ToolDashboard.tsx:794 |
| utility | pr-2 | pr-2 | named Tailwind spacing/size or structural utility; preserve | src/components/settings/inspector/InspectorPanel.tsx:577, src/components/ui/context-menu.tsx:145, src/components/ui/context-menu.tsx:170 (all in JSON) |
| utility | pr-2.5 | pr-2.5 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/ComposerToolbar.tsx:113 |
| utility | pr-3 | pr-3 | named Tailwind spacing/size or structural utility; preserve | src/components/settings/CatalogBrowser.tsx:189, src/components/settings/ProviderManager.tsx:511, src/components/settings/ToolDashboard.tsx:449 (all in JSON) |
| utility | pr-8 | pr-8 | named Tailwind spacing/size or structural utility; preserve | src/components/settings/PreferencesPanel.tsx:123, src/components/settings/ProfilePanel.tsx:217, src/components/settings/ProfilePanel.tsx:232 (all in JSON) |
| utility | pr-9 | pr-9 | named Tailwind spacing/size or structural utility; preserve | src/components/settings/PluginConfigPanel.tsx:76 |
| utility | pr-[88px] | pr-22 | Tailwind spacing scale; preserve sign/modifiers; rem follows user scaling | src/components/chat/ChatComposer.tsx:689 |
| utility | pt-0 | pt-0 | named Tailwind spacing/size or structural utility; preserve | src/components/ui/command.tsx:53 |
| utility | pt-0.5 | pt-0.5 | named Tailwind spacing/size or structural utility; preserve | src/components/widgets/ContextInspectorModal.tsx:136, src/components/widgets/ContextInspectorModal.tsx:142, src/components/work/PlanCard.tsx:58 |
| utility | pt-1 | pt-1 | named Tailwind spacing/size or structural utility; preserve | src/components/drawers/ArtifactsContent.tsx:348, src/components/plugins/debug/SlotInspectorPanel.tsx:141, src/components/settings/appearance/AppearancePanel.tsx:217 (all in JSON) |
| utility | pt-1.5 | pt-1.5 | named Tailwind spacing/size or structural utility; preserve | src/components/widgets/ObservabilityWidget.tsx:55, src/components/work/PlanCard.tsx:68 |
| utility | pt-2 | pt-2 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/ChatComposer.tsx:544, src/components/chat/ComposerToolbar.tsx:113, src/components/chat/extensions/FileMentionMenu.tsx:94 (all in JSON) |
| utility | pt-2.5 | pt-2.5 | named Tailwind spacing/size or structural utility; preserve | src/components/widgets/Widget.tsx:62 |
| utility | pt-3 | pt-3 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/LeftRail.tsx:149, src/components/chat/composer/Drawer.tsx:89, src/components/chat/envelopes/primitives/ProgressCard.tsx:52 (all in JSON) |
| utility | pt-4 | pt-4 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/ErrorDetailModal.tsx:39, src/components/chat/SessionDetailsPanel.tsx:119, src/components/settings/PluginDetailView.tsx:212 (all in JSON) |
| utility | pt-5 | pt-5 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/AgentRoster.tsx:47, src/components/chat/SessionDetailsPanel.tsx:69, src/components/modals/CreateProjectModal.tsx:39 (all in JSON) |
| utility | pt-6 | pt-6 | named Tailwind spacing/size or structural utility; preserve | src/components/ui/card.tsx:78 |
| utility | pt-7 | pt-7 | named Tailwind spacing/size or structural utility; preserve | src/components/settings/SettingsPage.tsx:313 |
| utility | pt-[10px] | pt-2.5 | Tailwind spacing scale; preserve sign/modifiers; rem follows user scaling | src/components/chat/ChatComposer.tsx:689 |
| utility | px-0.5 | px-0.5 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/ChatHeader.tsx:321, src/components/chat/LeftRail.tsx:377 |
| utility | px-1 | px-1 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/AdapterBadge.tsx:26, src/components/chat/ChatComposer.tsx:318, src/components/chat/ChatDrawerTabStrip.tsx:85 (all in JSON) |
| utility | px-1.5 | px-1.5 | named Tailwind spacing/size or structural utility; preserve | src/components/agents/TagPills.tsx:50, src/components/agents/TagPills.tsx:57, src/components/chat/AdapterBadge.tsx:37 (all in JSON) |
| utility | px-2 | px-2 | named Tailwind spacing/size or structural utility; preserve | src/components/SearchModal.tsx:232, src/components/chat/ApprovalCard.tsx:140, src/components/chat/ApprovalCard.tsx:149 (all in JSON) |
| utility | px-2.5 | px-2.5 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/ChatComposer.tsx:673, src/components/chat/ChatComposer.tsx:680, src/components/chat/ChatDrawerTabStrip.tsx:107 (all in JSON) |
| utility | px-3 | px-3 | named Tailwind spacing/size or structural utility; preserve | src/components/RightRail.tsx:56, src/components/RightRailV2.tsx:109, src/components/RightRailV2.tsx:354 (all in JSON) |
| utility | px-3.5 | px-3.5 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/ApprovalCard.tsx:101, src/components/chat/ApprovalCard.tsx:126, src/components/chat/ApprovalCard.tsx:134 (all in JSON) |
| utility | px-4 | px-4 | named Tailwind spacing/size or structural utility; preserve | src/components/RightRail.tsx:189, src/components/RightRailV2.tsx:321, src/components/chat/AgentPicker.tsx:68 (all in JSON) |
| utility | px-5 | px-5 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/AgentPicker.tsx:57, src/components/chat/AgentRoster.tsx:47, src/components/chat/AgentRoster.tsx:58 (all in JSON) |
| utility | px-6 | px-6 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/ChatTranscript.tsx:256, src/components/ui/card.tsx:23, src/components/ui/card.tsx:68 (all in JSON) |
| utility | px-7 | px-7 | named Tailwind spacing/size or structural utility; preserve | src/components/settings/SettingsPage.tsx:297, src/components/settings/SettingsPage.tsx:313 |
| utility | px-8 | px-8 | named Tailwind spacing/size or structural utility; preserve | src/components/AppGate.tsx:35, src/components/chat/ChatMain.tsx:315, src/components/ui/button.tsx:22 |
| utility | px-[14px] | px-3.5 | Tailwind spacing scale; preserve sign/modifiers; rem follows user scaling | src/components/chat/ChatComposer.tsx:689 |
| utility | px-[18px] | px-4.5 | Tailwind spacing scale; preserve sign/modifiers; rem follows user scaling | src/components/chat/ChatHeader.tsx:304, src/components/settings/SettingsPage.tsx:257 |
| utility | px-[5px] | px-1.25 | Tailwind spacing scale; preserve sign/modifiers; rem follows user scaling | src/components/chat/LayoutMenu.tsx:38 |
| utility | py-0 | py-0 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/AdapterBadge.tsx:26, src/components/plugins/debug/TurnSnapshotPanel.tsx:136, src/components/settings/inspector/InspectorPanel.tsx:121 |
| utility | py-0.5 | py-0.5 | named Tailwind spacing/size or structural utility; preserve | src/components/SearchModal.tsx:232, src/components/agents/TagPills.tsx:50, src/components/agents/TagPills.tsx:57 (all in JSON) |
| utility | py-1 | py-1 | named Tailwind spacing/size or structural utility; preserve | src/components/SearchModal.tsx:197, src/components/chat/ChatComposer.tsx:553, src/components/chat/ChatComposer.tsx:673 (all in JSON) |
| utility | py-1.5 | py-1.5 | named Tailwind spacing/size or structural utility; preserve | src/components/SearchModal.tsx:130, src/components/chat/AgentPicker.tsx:69, src/components/chat/AgentRoster.tsx:74 (all in JSON) |
| utility | py-10 | py-10 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/SetupWizard.tsx:197, src/components/settings/CatalogSourceManager.tsx:114 |
| utility | py-12 | py-12 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/SessionDetailsPanel.tsx:501, src/components/drawers/ArtifactsContent.tsx:299, src/components/memory/MemoryBrowse.tsx:130 (all in JSON) |
| utility | py-2 | py-2 | named Tailwind spacing/size or structural utility; preserve | src/components/RightRail.tsx:56, src/components/RightRailV2.tsx:109, src/components/RightRailV2.tsx:354 (all in JSON) |
| utility | py-2.5 | py-2.5 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/ApprovalCard.tsx:101, src/components/chat/Banner.tsx:83, src/components/chat/ChatMessage.tsx:339 (all in JSON) |
| utility | py-3 | py-3 | named Tailwind spacing/size or structural utility; preserve | src/components/NavRail.tsx:52, src/components/chat/ChatTranscript.tsx:307, src/components/chat/ErrorBanner.tsx:61 (all in JSON) |
| utility | py-3.5 | py-3.5 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/composer/Drawer.tsx:89, src/components/settings/SystemPromptsViewer.tsx:136 |
| utility | py-4 | py-4 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/AgentPicker.tsx:57, src/components/chat/AgentPicker.tsx:97, src/components/drawers/ChatPrimaryDrawer.tsx:772 (all in JSON) |
| utility | py-6 | py-6 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/ChatTranscript.tsx:285, src/components/chat/SetupWizard.tsx:209, src/components/settings/DurableAgentAdminPanel.tsx:1371 (all in JSON) |
| utility | py-8 | py-8 | named Tailwind spacing/size or structural utility; preserve | src/components/AppShell.tsx:177, src/components/chat/AgentRoster.tsx:60, src/components/messaging/TaskThreadPanel.tsx:119 (all in JSON) |
| utility | py-[3.5px] | py-0.875 | Tailwind spacing scale; preserve sign/modifiers; rem follows user scaling | src/components/chat/LayoutMenu.tsx:68, src/components/chat/LayoutMenu.tsx:92 |
| utility | py-[5px] | py-1.25 | Tailwind spacing scale; preserve sign/modifiers; rem follows user scaling | src/components/settings/primitives.tsx:249 |
| utility | py-[7px] | py-1.75 | Tailwind spacing scale; preserve sign/modifiers; rem follows user scaling | src/components/modals/CreateProjectModal.tsx:54, src/components/modals/CreateProjectModal.tsx:67, src/components/settings/PreferencesPanel.tsx:123 (all in JSON) |
| utility | py-px | py-px | named Tailwind spacing/size or structural utility; preserve | src/components/chat/LayoutMenu.tsx:38, src/components/chat/LeftRail.tsx:114, src/components/chat/composer/Drawer.tsx:66 (all in JSON) |
| utility | right-0 | right-0 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/ChatHeader.tsx:401, src/components/chat/ToolCallDisplay.tsx:78, src/components/chat/ToolCallItem.tsx:133 (all in JSON) |
| utility | right-1.5 | right-1.5 | named Tailwind spacing/size or structural utility; preserve | src/components/settings/ToolDashboard.tsx:800 |
| utility | right-2 | right-2 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/LeftRail.tsx:271, src/components/chat/MessageContent.tsx:56, src/components/chat/envelopes/primitives/DevBadge.tsx:47 (all in JSON) |
| utility | right-2.5 | right-2.5 | named Tailwind spacing/size or structural utility; preserve | src/components/settings/PreferencesPanel.tsx:130, src/components/settings/ProfilePanel.tsx:223, src/components/settings/ProfilePanel.tsx:238 (all in JSON) |
| utility | right-3 | right-3 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/ChatComposer.tsx:586, src/components/settings/ProviderManager.tsx:164 |
| utility | right-4 | right-4 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/ChatTranscript.tsx:513, src/components/messaging/InboxContent.tsx:421, src/components/settings/CatalogBrowser.tsx:333 (all in JSON) |
| utility | right-rail-tab | right-rail-tab | named Tailwind spacing/size or structural utility; preserve | src/components/RightRail.tsx:102, src/components/RightRailV2.tsx:147, src/components/RightRailV2.tsx:309 (all in JSON) |
| utility | ring-0 | ring-0 | inherited border/stroke scale or structure | src/components/ui/switch.tsx:26 |
| utility | ring-1 | ring-1 | inherited border/stroke scale or structure | src/components/plugins/bookmarks/BookmarksWidget.tsx:19, src/components/plugins/bookmarks/BookmarksWidget.tsx:21, src/components/settings/PanelManager.tsx:106 (all in JSON) |
| utility | ring-2 | ring-2 | inherited border/stroke scale or structure | src/components/chat/ChatTranscript.tsx:200, src/components/chat/envelopes/primitives/TimelineCard.tsx:63, src/components/settings/CatalogBrowser.tsx:376 (all in JSON) |
| utility | ring-amber-500/60 | ring-warning/60 | F3: caution palette becomes warning; identity hue needs F2 | src/components/settings/CatalogBrowser.tsx:376 |
| utility | ring-background | ring-bg | Flux alias resolves by source role; accent means brand here | src/components/ui/avatar.tsx:60, src/components/ui/avatar.tsx:76, src/components/ui/avatar.tsx:92 |
| utility | ring-bg-elevated | ring-bg-elevated | exact semantic role | src/components/chat/envelopes/primitives/TimelineCard.tsx:63 |
| utility | ring-brand | ring-brand | exact semantic role | src/components/chat/ChatMessage.tsx:76 |
| utility | ring-brand/30 | ring-brand/30 | exact semantic role | src/components/settings/PanelManager.tsx:106, src/components/settings/WidgetManager.tsx:173 |
| utility | ring-danger/25 | ring-danger/25 | exact semantic role | src/components/sidebar/LeftSidebar.tsx:559 |
| utility | ring-inset | ring-inset | inherited directional border scale / structural ring utility | src/components/settings/ShortcutsPanel.tsx:81 |
| utility | ring-offset-background | ring-offset-bg | Flux alias resolves by source role; accent means brand here | src/components/ui/sheet.tsx:76 |
| utility | ring-orange-500 | ring-warning | F3: caution palette becomes warning; identity hue needs F2 | src/components/chat/ChatMessage.tsx:74 |
| utility | ring-pink-500 | ring-info | F2/F3: nearest information role; categorical identity needs labelled marker and owner review | src/components/chat/ChatMessage.tsx:75 |
| utility | ring-primary | ring-primary | exact semantic role | src/components/chat/ChatMessage.tsx:72 |
| utility | ring-primary/20 | ring-primary/20 | exact semantic role | src/components/ui/tag-input.tsx:118 |
| utility | ring-primary/30 | ring-primary/30 | exact semantic role | src/components/settings/ShortcutsPanel.tsx:81, src/components/ui/icon-picker.tsx:179 |
| utility | ring-primary/60 | ring-primary/60 | exact semantic role | src/components/chat/ChatTranscript.tsx:201 |
| utility | ring-status-warn/50 | ring-warning/50 | Flux alias resolves by source role; accent means brand here | src/components/plugins/bookmarks/BookmarksWidget.tsx:19, src/components/plugins/bookmarks/BookmarksWidget.tsx:21 |
| utility | ring-violet-500 | ring-info | F2/F3: nearest information role; categorical identity needs labelled marker and owner review | src/components/chat/ChatMessage.tsx:73 |
| utility | rounded-2xl | rounded-2xl | named inherited/contract scale | src/components/chat/ChatMessage.tsx:358 |
| utility | rounded-[10px] | rounded-panel | exact scale | src/components/chat/ApprovalCard.tsx:99, src/components/chat/Banner.tsx:78, src/components/chat/ChatComposer.tsx:569 (all in JSON) |
| utility | rounded-[12px] | rounded-xl | exact scale | src/components/chat/LayoutMenu.tsx:182, src/components/chat/LayoutMenu.tsx:337, src/components/settings/agents/AgentBuilderWizard.tsx:1231 (all in JSON) |
| utility | rounded-[14px] | rounded-xl | F4: nearest scale (12); proposed snap, fidelity difference explicit | src/components/chat/ChatTranscript.tsx:258 |
| utility | rounded-[1px] | rounded-none | F4: nearest scale (0); proposed snap, fidelity difference explicit | src/components/chat/LayoutMenu.tsx:134 |
| utility | rounded-[2px] | rounded-xs | exact scale | src/components/SearchModal.tsx:198, src/components/chat/LayoutMenu.tsx:218, src/components/chat/LayoutMenu.tsx:219 (all in JSON) |
| utility | rounded-[3px] | rounded-xs | F4: nearest scale (2); proposed snap, fidelity difference explicit | src/components/chat/LayoutMenu.tsx:131, src/components/chat/LayoutMenu.tsx:38, src/components/chat/LayoutMenu.tsx:411 (all in JSON) |
| utility | rounded-[4px] | rounded-sm | exact scale | src/components/chat/ChatComposer.tsx:553, src/components/chat/ChatComposer.tsx:624, src/components/chat/ChatComposer.tsx:652 (all in JSON) |
| utility | rounded-[5px] | rounded-sm | F4: nearest scale (4); proposed snap, fidelity difference explicit | src/components/chat/Banner.tsx:86, src/components/chat/LayoutMenu.tsx:214, src/components/chat/LayoutMenu.tsx:410 (all in JSON) |
| utility | rounded-[6px] | rounded-control | exact scale | src/components/chat/ApprovalCard.tsx:77, src/components/chat/Banner.tsx:106, src/components/chat/ChatComposer.tsx:673 (all in JSON) |
| utility | rounded-[7px] | rounded-control | F4: nearest scale (6); proposed snap, fidelity difference explicit | src/components/chat/ChatHeader.tsx:310, src/components/chat/LayoutMenu.tsx:209, src/components/modals/CreateProjectModal.tsx:54 (all in JSON) |
| utility | rounded-[8px] | rounded-lg | exact scale | src/components/chat/ChatTranscript.tsx:390, src/components/chat/ComposerPlusMenu.tsx:138, src/components/chat/SessionDetailsPanel.tsx:458 (all in JSON) |
| utility | rounded-b-[10px] | rounded-b-panel | exact scale | src/components/chat/ChatComposer.tsx:569, src/components/chat/LayoutMenu.tsx:490, src/components/drawers/ChatPrimaryDrawer.tsx:182 |
| utility | rounded-b-none | rounded-b-none | named inherited/contract scale | src/components/chat/composer/Drawer.tsx:53 |
| utility | rounded-bl-[5px] | rounded-bl-sm | F4: nearest scale (4); proposed snap, fidelity difference explicit | src/components/chat/LeftRail.tsx:210 |
| utility | rounded-full | rounded-full | named inherited/contract scale | src/components/agents/StatusDot.tsx:15, src/components/chat/AgentPicker.tsx:108, src/components/chat/AgentPicker.tsx:88 (all in JSON) |
| utility | rounded-lg | rounded-lg | named inherited/contract scale | src/components/NavRail.tsx:113, src/components/NavRail.tsx:134, src/components/NavRail.tsx:57 (all in JSON) |
| utility | rounded-md | rounded-md | named inherited/contract scale | src/components/NavRail.tsx:147, src/components/agents/TagPills.tsx:50, src/components/agents/TagPills.tsx:57 (all in JSON) |
| utility | rounded-none | rounded-none | named inherited/contract scale | src/components/ui/tabs.tsx:29 |
| utility | rounded-sm | rounded-sm | named inherited/contract scale | src/components/chat/AgentRoster.tsx:76, src/components/chat/MessageContent.tsx:81, src/components/chat/UserProfileMenu.tsx:53 (all in JSON) |
| utility | rounded-t | rounded-t | named inherited/contract scale | src/components/settings/inspector/InspectorPanel.tsx:331 |
| utility | rounded-t-[10px] | rounded-t-panel | exact scale | src/components/chat/composer/Drawer.tsx:53, src/components/drawers/ChatWorkingDrawer.tsx:320 |
| utility | rounded-t-[6px] | rounded-t-control | exact scale | src/components/chat/ChatDrawerTabStrip.tsx:113 |
| utility | rounded-t-none | rounded-t-none | named inherited/contract scale | src/components/chat/ChatComposer.tsx:569 |
| utility | rounded-tr-sm | rounded-tr-sm | named inherited/contract scale | src/components/chat/ChatMessage.tsx:358 |
| utility | rounded-xl | rounded-xl | named inherited/contract scale | src/components/chat/AgentPicker.tsx:55, src/components/chat/extensions/FileMentionMenu.tsx:109, src/components/chat/extensions/FileMentionMenu.tsx:120 (all in JSON) |
| utility | rounded-xs | rounded-xs | named inherited/contract scale | src/components/ui/sheet.tsx:76 |
| utility | selection:bg-primary | bg-primary | exact semantic role | src/components/ui/input.tsx:11 |
| utility | selection:text-primary-foreground | text-primary-fg | Flux alias resolves by source role; accent means brand here | src/components/ui/input.tsx:11 |
| utility | shadow-2xl | shadow-2xl | named inherited/contract scale | src/components/chat/AgentPicker.tsx:55, src/components/chat/ChatHeader.tsx:330, src/components/chat/ChatHeader.tsx:401 (all in JSON) |
| utility | shadow-[0_-2px_6px_-3px_rgba(0,0,0,0.18),0_2px_0_-1px_rgba(0,0,0,0.04)] | shadow-fg-secondary | F3: literal paint becomes semantic role; theme-only fidelity value | src/components/chat/composer/Drawer.tsx:54 |
| utility | shadow-[0_12px_28px_rgba(15,17,22,0.06)] | shadow-fg-secondary | F3: literal paint becomes semantic role; theme-only fidelity value | src/components/chat/LayoutMenu.tsx:490 |
| utility | shadow-[0_16px_48px_rgba(15,17,22,0.18)] | shadow-fg-secondary | F3: literal paint becomes semantic role; theme-only fidelity value | src/components/chat/LayoutMenu.tsx:337 |
| utility | shadow-[0_16px_48px_rgba(15,17,22,0.32)] | shadow-fg-secondary | F3: literal paint becomes semantic role; theme-only fidelity value | src/components/chat/LayoutMenu.tsx:182 |
| utility | shadow-[0_1px_0_0] | shadow-fg-secondary | F3: literal paint becomes semantic role; theme-only fidelity value | src/components/settings/primitives.tsx:281 |
| utility | shadow-[0_4px_12px_-6px_rgba(0,0,0,0.22),0_-2px_0_-1px_rgba(0,0,0,0.04)] | shadow-fg-secondary | F3: literal paint becomes semantic role; theme-only fidelity value | src/components/chat/Banner.tsx:55 |
| utility | shadow-[inset_0_2px_0_0_var(--color-fg)] | shadow-fg-secondary | F3: literal paint becomes semantic role; theme-only fidelity value | src/components/chat/ChatDrawerTabStrip.tsx:113 |
| utility | shadow-[inset_3px_0_0_0_var(--color-border)] | shadow-fg-secondary | F3: literal paint becomes semantic role; theme-only fidelity value | src/components/chat/envelopes/primitives/Envelope.tsx:28 |
| utility | shadow-[inset_3px_0_0_0_var(--color-brand)] | shadow-fg-secondary | F3: literal paint becomes semantic role; theme-only fidelity value | src/components/chat/envelopes/primitives/Envelope.tsx:34 |
| utility | shadow-[inset_3px_0_0_0_var(--color-danger)] | shadow-fg-secondary | F3: literal paint becomes semantic role; theme-only fidelity value | src/components/chat/envelopes/primitives/Envelope.tsx:32 |
| utility | shadow-[inset_3px_0_0_0_var(--color-info)] | shadow-fg-secondary | F3: literal paint becomes semantic role; theme-only fidelity value | src/components/chat/ChatComposer.tsx:637, src/components/chat/envelopes/primitives/Envelope.tsx:33 |
| utility | shadow-[inset_3px_0_0_0_var(--color-primary)] | shadow-fg-secondary | F3: literal paint becomes semantic role; theme-only fidelity value | src/components/chat/ChatComposer.tsx:572, src/components/chat/envelopes/primitives/Envelope.tsx:29 |
| utility | shadow-[inset_3px_0_0_0_var(--color-success)] | shadow-fg-secondary | F3: literal paint becomes semantic role; theme-only fidelity value | src/components/chat/ChatComposer.tsx:615, src/components/chat/ChatComposer.tsx:636, src/components/chat/envelopes/primitives/Envelope.tsx:30 |
| utility | shadow-[inset_3px_0_0_0_var(--color-warning)] | shadow-fg-secondary | F3: literal paint becomes semantic role; theme-only fidelity value | src/components/chat/ChatComposer.tsx:661, src/components/chat/envelopes/primitives/Envelope.tsx:31 |
| utility | shadow-border-subtle | shadow-border-subtle | named inherited/contract scale | src/components/settings/primitives.tsx:281 |
| utility | shadow-inner | shadow-inner | named inherited/contract scale | src/components/settings/appearance/TokenEditor.tsx:42 |
| utility | shadow-lg | shadow-lg | named inherited/contract scale | src/components/chat/ChatComposer.tsx:568, src/components/chat/ChatTranscript.tsx:513, src/components/drawers/ArtifactsContent.tsx:246 (all in JSON) |
| utility | shadow-md | shadow-md | named inherited/contract scale | src/components/chat/ChatHeader.tsx:292, src/components/ui/context-menu.tsx:103, src/components/ui/dropdown-menu.tsx:45 (all in JSON) |
| utility | shadow-none | shadow-none | named inherited/contract scale | src/components/ui/tabs.tsx:67 |
| utility | shadow-sm | shadow-sm | named inherited/contract scale | src/components/chat/ChatDrawerTabStrip.tsx:110, src/components/drawers/ChatWorkingDrawer.tsx:360, src/components/plugins/debug/DebugPanel.tsx:21 (all in JSON) |
| utility | shadow-xl | shadow-xl | named inherited/contract scale | src/components/messaging/InboxContent.tsx:425, src/components/settings/CatalogBrowser.tsx:337, src/components/settings/PluginManager.tsx:599 (all in JSON) |
| utility | shadow-xs | shadow-xs | named inherited/contract scale | src/components/ui/input.tsx:11, src/components/ui/select.tsx:40, src/components/ui/switch.tsx:18 (all in JSON) |
| utility | size-1.5 | size-1.5 | named Tailwind spacing/size or structural utility; preserve | src/components/settings/ProjectManager.tsx:106 |
| utility | size-10 | size-10 | named Tailwind spacing/size or structural utility; preserve | src/components/ui/avatar.tsx:18, src/components/ui/empty.tsx:37 |
| utility | size-12 | size-12 | named Tailwind spacing/size or structural utility; preserve | src/components/settings/agents/AgentDetailView.tsx:262, src/components/settings/agents/SkillDetailView.tsx:366 |
| utility | size-14 | size-14 | named Tailwind spacing/size or structural utility; preserve | src/components/settings/ProfilePanel.tsx:64, src/components/settings/agents/AgentCreateWizard.tsx:323, src/components/settings/agents/PromptCreateWizard.tsx:149 (all in JSON) |
| utility | size-16 | size-16 | named Tailwind spacing/size or structural utility; preserve | src/components/ui/alert-dialog.tsx:139 |
| utility | size-2 | size-2 | named Tailwind spacing/size or structural utility; preserve | src/components/ui/avatar.tsx:62, src/components/ui/avatar.tsx:63, src/components/ui/context-menu.tsx:177 (all in JSON) |
| utility | size-2.5 | size-2.5 | named Tailwind spacing/size or structural utility; preserve | src/components/SearchModal.tsx:165, src/components/sidebar/LeftSidebar.tsx:669 |
| utility | size-3 | size-3 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/AgentRoster.tsx:89, src/components/chat/LeftRail.tsx:150, src/components/chat/LeftRail.tsx:239 (all in JSON) |
| utility | size-3.5 | size-3.5 | named Tailwind spacing/size or structural utility; preserve | src/components/RightRail.tsx:66, src/components/RightRail.tsx:75, src/components/RightRailV2.tsx:119 (all in JSON) |
| utility | size-4 | size-4 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/AgentRoster.tsx:80, src/components/chat/LeftRail.tsx:234, src/components/chat/UserProfileMenu.tsx:79 (all in JSON) |
| utility | size-5 | size-5 | named Tailwind spacing/size or structural utility; preserve | src/components/CommandPalette.tsx:293, src/components/chat/LeftRail.tsx:278, src/components/chat/LeftRail.tsx:293 (all in JSON) |
| utility | size-6 | size-6 | named Tailwind spacing/size or structural utility; preserve | src/components/NavRail.tsx:147, src/components/chat/LeftRail.tsx:407, src/components/chat/UserProfileMenu.tsx:53 (all in JSON) |
| utility | size-8 | size-8 | named Tailwind spacing/size or structural utility; preserve | src/components/settings/agents/AgentCreateWizard.tsx:447, src/components/ui/alert-dialog.tsx:139, src/components/ui/avatar.tsx:18 (all in JSON) |
| utility | size-9 | size-9 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/AgentRoster.tsx:76, src/components/chat/UserProfileMenu.tsx:73, src/components/settings/AgentProfileManager.tsx:273 (all in JSON) |
| utility | size-full | size-full | named Tailwind spacing/size or structural utility; preserve | src/components/chat/UserProfileMenu.tsx:57, src/components/chat/UserProfileMenu.tsx:75, src/components/settings/ProfilePanel.tsx:67 (all in JSON) |
| utility | sm:max-w-2xl | max-w-2xl | named Tailwind spacing/size or structural utility; preserve | src/components/chat/SessionDetailsPanel.tsx:68, src/components/memory/MemoryModal.tsx:35, src/components/settings/ToolDashboard.tsx:826 (all in JSON) |
| utility | sm:max-w-lg | max-w-lg | named Tailwind spacing/size or structural utility; preserve | src/components/AppShell.tsx:176, src/components/chat/ErrorDetailModal.tsx:38, src/components/settings/ToolDashboard.tsx:1062 (all in JSON) |
| utility | sm:max-w-md | max-w-md | named Tailwind spacing/size or structural utility; preserve | src/components/chat/AgentRoster.tsx:46, src/components/modals/CreateProjectModal.tsx:38, src/components/settings/ToolDashboard.tsx:1022 (all in JSON) |
| utility | sm:max-w-sm | max-w-sm | named Tailwind spacing/size or structural utility; preserve | src/components/ui/sheet.tsx:63, src/components/ui/sheet.tsx:65 |
| utility | sm:text-left | text-left | named inherited/contract type or structural text utility | src/components/ui/dialog.tsx:86 |
| utility | space-y-0 | space-y-0 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/ToolCallDisplay.tsx:61, src/components/chat/ToolCallDisplay.tsx:89, src/components/chat/ToolCallDisplay.tsx:96 (all in JSON) |
| utility | space-y-0.5 | space-y-0.5 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/envelopes/primitives/ListCard.tsx:203, src/components/chat/envelopes/primitives/ListCard.tsx:274, src/components/plugins/debug/TurnSnapshotPanel.tsx:108 (all in JSON) |
| utility | space-y-1 | space-y-1 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/AgentPicker.tsx:83, src/components/chat/AgentPicker.tsx:85, src/components/chat/MessageContent.tsx:194 (all in JSON) |
| utility | space-y-1.5 | space-y-1.5 | named Tailwind spacing/size or structural utility; preserve | src/components/RightRail.tsx:222, src/components/RightRailV2.tsx:380, src/components/chat/AgentPicker.tsx:89 (all in JSON) |
| utility | space-y-2 | space-y-2 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/ErrorBanner.tsx:64, src/components/chat/SessionDetailsPanel.tsx:288, src/components/chat/SessionDetailsPanel.tsx:298 (all in JSON) |
| utility | space-y-2.5 | space-y-2.5 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/SetupWizard.tsx:129, src/components/chat/SetupWizard.tsx:96, src/components/plugins/debug/SlotInspectorPanel.tsx:78 |
| utility | space-y-3 | space-y-3 | named Tailwind spacing/size or structural utility; preserve | src/components/RightRail.tsx:215, src/components/RightRailV2.tsx:373, src/components/chat/SessionDetailsPanel.tsx:334 (all in JSON) |
| utility | space-y-4 | space-y-4 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/ErrorDetailModal.tsx:45, src/components/chat/SessionDetailsPanel.tsx:119, src/components/memory/MemoryDetail.tsx:179 (all in JSON) |
| utility | space-y-5 | space-y-5 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/ChatTranscript.tsx:286, src/components/settings/DurableAgentAdminPanel.tsx:91, src/components/settings/PluginDetailView.tsx:153 (all in JSON) |
| utility | space-y-6 | space-y-6 | named Tailwind spacing/size or structural utility; preserve | src/components/settings/PluginConfigPanel.tsx:162 |
| utility | space-y-8 | space-y-8 | named Tailwind spacing/size or structural utility; preserve | src/components/settings/ProjectManager.tsx:35 |
| utility | switch:size-3 | size-3 | named Tailwind spacing/size or structural utility; preserve | src/components/ui/switch.tsx:26 |
| utility | switch:size-4 | size-4 | named Tailwind spacing/size or structural utility; preserve | src/components/ui/switch.tsx:26 |
| utility | tabs-list:bg-transparent | bg-transparent | structural paint keyword; preserve | src/components/ui/tabs.tsx:68 |
| utility | tabs:after:-right-1 | -right-1 | named Tailwind spacing/size or structural utility; preserve | src/components/ui/tabs.tsx:70 |
| utility | tabs:after:bottom-[-5px] | -bottom-1.25 | Tailwind spacing scale; preserve sign/modifiers; rem follows user scaling | src/components/ui/tabs.tsx:70 |
| utility | tabs:after:h-0.5 | h-0.5 | named Tailwind spacing/size or structural utility; preserve | src/components/ui/tabs.tsx:70 |
| utility | tabs:after:inset-x-0 | inset-x-0 | named Tailwind spacing/size or structural utility; preserve | src/components/ui/tabs.tsx:70 |
| utility | tabs:after:inset-y-0 | inset-y-0 | named Tailwind spacing/size or structural utility; preserve | src/components/ui/tabs.tsx:70 |
| utility | tabs:after:w-0.5 | w-0.5 | named Tailwind spacing/size or structural utility; preserve | src/components/ui/tabs.tsx:70 |
| utility | tabs:h-9 | h-9 | named Tailwind spacing/size or structural utility; preserve | src/components/ui/tabs.tsx:29 |
| utility | tabs:h-fit | h-fit | named Tailwind spacing/size or structural utility; preserve | src/components/ui/tabs.tsx:29 |
| utility | tabs:w-full | w-full | named Tailwind spacing/size or structural utility; preserve | src/components/ui/tabs.tsx:67 |
| utility | text-2xl | text-2xl | named inherited/contract type or structural text utility | src/components/AppGate.tsx:37, src/components/chat/ChatMain.tsx:317, src/components/settings/agents/AgentCreateWizard.tsx:327 |
| utility | text-[#a9b1d6] | text-fg-secondary | F3: literal paint becomes semantic role; theme-only fidelity value | src/components/chat/ShellMessage.tsx:58 |
| utility | text-[10.5px] | text-caption | F4: nearest scale (10); proposed snap, fidelity difference explicit | src/components/chat/ComposerToolbar.tsx:171 |
| utility | text-[10px] | text-caption | exact scale | src/components/SearchModal.tsx:140, src/components/agents/TagPills.tsx:50, src/components/agents/TagPills.tsx:57 (all in JSON) |
| utility | text-[11px] | text-label | exact scale | src/components/SearchModal.tsx:201, src/components/SearchModal.tsx:207, src/components/chat/ApprovalCard.tsx:111 (all in JSON) |
| utility | text-[12.5px] | text-xs | F4: nearest scale (12); proposed snap, fidelity difference explicit | src/components/chat/LeftRail.tsx:250, src/components/chat/LeftRail.tsx:360 |
| utility | text-[12px] | text-xs | exact scale | src/components/chat/ChatMessage.tsx:339, src/components/chat/ChatTranscript.tsx:414, src/components/chat/ChatTranscript.tsx:419 (all in JSON) |
| utility | text-[13px] | text-control | exact scale | src/components/SearchModal.tsx:200, src/components/chat/ChatHeader.tsx:310, src/components/chat/ChatTranscript.tsx:268 (all in JSON) |
| utility | text-[14px] | text-sm | exact scale | src/components/chat/ChatHeader.tsx:323, src/components/chat/envelopes/primitives/ConfirmationCard.tsx:163, src/components/chat/envelopes/primitives/ConfirmationCard.tsx:244 (all in JSON) |
| utility | text-[15px] | text-sm | F4: nearest scale (14); proposed snap, fidelity difference explicit | src/components/settings/DurableAgentAdminPanel.tsx:352 |
| utility | text-[18px] | text-lg | exact scale | src/components/settings/DurableAgentAdminPanel.tsx:94 |
| utility | text-[20px] | text-xl | exact scale | src/components/settings/primitives.tsx:10 |
| utility | text-[24px] | text-2xl | exact scale | src/components/chat/envelopes/ReportCard.tsx:72, src/components/chat/envelopes/primitives/MetricCard.tsx:35 |
| utility | text-[8.5px] | text-micro | F4: nearest scale (9); proposed snap, fidelity difference explicit | src/components/chat/LayoutMenu.tsx:380, src/components/chat/LayoutMenu.tsx:457, src/components/chat/LayoutMenu.tsx:506 |
| utility | text-[8px] | text-micro | F4: nearest scale (9); proposed snap, fidelity difference explicit | src/components/chat/LayoutMenu.tsx:416, src/components/chat/LayoutMenu.tsx:417, src/components/chat/LayoutMenu.tsx:420 (all in JSON) |
| utility | text-[9.5px] | text-micro | F4: nearest scale (9); proposed snap, fidelity difference explicit | src/components/chat/LayoutMenu.tsx:73, src/components/chat/LayoutMenu.tsx:97 |
| utility | text-[9px] | text-micro | exact scale | src/components/chat/LayoutMenu.tsx:412, src/components/chat/envelopes/ErrorCard.tsx:111, src/components/chat/extensions/SlashCommandMenu.tsx:152 (all in JSON) |
| utility | text-amber-400 | text-warning | F3: caution palette becomes warning; identity hue needs F2 | src/components/agents/TagPills.tsx:14, src/components/ui/tag-input.tsx:8 |
| utility | text-amber-600 | text-warning | F3: caution palette becomes warning; identity hue needs F2 | src/components/settings/PluginDetailView.tsx:478, src/components/settings/PluginManager.tsx:427 |
| utility | text-amber-600/60 | text-warning/60 | F3: caution palette becomes warning; identity hue needs F2 | src/components/settings/PluginDetailView.tsx:504 |
| utility | text-amber-600/70 | text-warning/70 | F3: caution palette becomes warning; identity hue needs F2 | src/components/settings/PluginDetailView.tsx:500 |
| utility | text-amber-600/80 | text-warning/80 | F3: caution palette becomes warning; identity hue needs F2 | src/components/settings/PluginDetailView.tsx:505 |
| utility | text-amber-600/90 | text-warning/90 | F3: caution palette becomes warning; identity hue needs F2 | src/components/settings/PluginDetailView.tsx:497 |
| utility | text-amber-700 | text-warning | F3: caution palette becomes warning; identity hue needs F2 | src/components/settings/PluginManager.tsx:63, src/components/settings/agents/AgentReflexesPanel.tsx:581 |
| utility | text-background | text-bg | Flux alias resolves by source role; accent means brand here | src/components/ui/kbd.tsx:10 |
| utility | text-balance | text-balance | named inherited/contract type or structural text utility | src/components/ui/empty.tsx:10, src/components/ui/empty.tsx:89 |
| utility | text-base | text-base | named inherited/contract type or structural text utility | src/components/chat/AgentRoster.tsx:78, src/components/chat/ChatTranscript.tsx:267, src/components/chat/MessageContent.tsx:182 (all in JSON) |
| utility | text-bg | text-bg | exact semantic role | src/components/chat/Banner.tsx:108, src/components/chat/envelopes/primitives/StatusPill.tsx:75 |
| utility | text-bg-elevated | text-bg-elevated | exact semantic role | src/components/chat/ComposerPlusMenu.tsx:163, src/components/chat/ComposerPlusMenu.tsx:176, src/components/chat/ComposerPlusMenu.tsx:189 (all in JSON) |
| utility | text-blue-400 | text-info | F2/F3: nearest information role; categorical identity needs labelled marker and owner review | src/components/agents/TagPills.tsx:12, src/components/ui/tag-input.tsx:6 |
| utility | text-blue-700 | text-info | F2/F3: nearest information role; categorical identity needs labelled marker and owner review | src/components/settings/inspector/InspectorPanel.tsx:199 |
| utility | text-blue-800 | text-info | F2/F3: nearest information role; categorical identity needs labelled marker and owner review | src/components/settings/inspector/InspectorPanel.tsx:157 |
| utility | text-brand | text-brand | exact semantic role | src/components/chat/ChatMessage.tsx:76, src/components/chat/ComposerToolbar.tsx:200, src/components/chat/composer/Drawer.tsx:22 (all in JSON) |
| utility | text-brand-fg | text-brand-fg | exact semantic role | src/components/NavRail.tsx:57, src/components/chat/ChatHeader.tsx:310, src/components/chat/ComposerToolbar.tsx:199 (all in JSON) |
| utility | text-card-foreground | text-fg | Flux alias resolves by source role; accent means brand here | src/components/ui/card.tsx:10 |
| utility | text-center | text-center | named inherited/contract type or structural text utility | src/components/AppGate.tsx:36, src/components/RightRailV2.tsx:444, src/components/chat/AgentPicker.tsx:97 (all in JSON) |
| utility | text-composer-fg-secondary | text-fg-secondary | F1: scoped theme on composer; nearest role, retain dark composer only if confirmed | src/components/chat/UserProfileMenu.tsx:53 |
| utility | text-cyan-400 | text-info | F2/F3: nearest information role; categorical identity needs labelled marker and owner review | src/components/agents/TagPills.tsx:15, src/components/settings/observability/RecentExecutionsTable.tsx:103, src/components/ui/tag-input.tsx:9 |
| utility | text-danger | text-danger | exact semantic role | src/components/chat/Banner.tsx:50, src/components/chat/ChatHeader.tsx:297, src/components/chat/ChatMain.tsx:264 (all in JSON) |
| utility | text-danger-fg | text-danger-fg | exact semantic role | src/components/settings/appearance/ThemePreview.tsx:36, src/components/ui/button.tsx:12 |
| utility | text-danger/70 | text-danger/70 | exact semantic role | src/components/widgets/WidgetRenderer.tsx:29 |
| utility | text-danger/80 | text-danger/80 | exact semantic role | src/components/workflows/WorkflowStepItem.tsx:91 |
| utility | text-destructive | text-danger | Flux alias resolves by source role; accent means brand here | src/components/ui/context-menu.tsx:127, src/components/ui/dropdown-menu.tsx:77 |
| utility | text-ellipsis | text-ellipsis | named inherited/contract type or structural text utility | src/components/widgets/Widget.tsx:84 |
| utility | text-emerald-400 | text-success | F3: completion palette becomes success | src/components/agents/TagPills.tsx:17, src/components/ui/tag-input.tsx:11 |
| utility | text-emerald-500 | text-success | F3: completion palette becomes success | src/components/settings/PluginInstallProgress.tsx:178 |
| utility | text-emerald-700 | text-success | F3: completion palette becomes success | src/components/settings/PluginManager.tsx:61, src/components/settings/agents/AgentReflexesPanel.tsx:630, src/components/settings/agents/AgentReflexesPanel.tsx:715 |
| utility | text-emerald-900 | text-success | F3: completion palette becomes success | src/components/settings/MemoryPanel.tsx:12 |
| utility | text-fg | text-fg | exact semantic role | src/components/AppGate.tsx:37, src/components/NavRail.tsx:115, src/components/NavRail.tsx:79 (all in JSON) |
| utility | text-fg-faint | text-fg-faint | exact semantic role | src/components/CommandPalette.tsx:155, src/components/CommandPalette.tsx:297, src/components/RightRail.tsx:201 (all in JSON) |
| utility | text-fg-faint/50 | text-fg-faint/50 | exact semantic role | src/components/RightRail.tsx:62, src/components/RightRailV2.tsx:115, src/components/work/TodoItem.tsx:95 |
| utility | text-fg-muted | text-fg-muted | exact semantic role | src/components/AppGate.tsx:38, src/components/AppShell.tsx:132, src/components/AppShell.tsx:177 (all in JSON) |
| utility | text-fg-muted/40 | text-fg-muted/40 | exact semantic role | src/components/workflows/WorkflowStepItem.tsx:24 |
| utility | text-fg-muted/60 | text-fg-muted/60 | exact semantic role | src/components/workflows/WorkflowStepItem.tsx:67 |
| utility | text-fg-muted/70 | text-fg-muted/70 | exact semantic role | src/components/chat/ChatTranscript.tsx:414 |
| utility | text-fg-muted/80 | text-fg-muted/80 | exact semantic role | src/components/chat/ChatMessage.tsx:347 |
| utility | text-fg-secondary | text-fg-secondary | exact semantic role | src/components/NavRail.tsx:116, src/components/NavRail.tsx:135, src/components/NavRail.tsx:80 (all in JSON) |
| utility | text-foreground | text-fg | Flux alias resolves by source role; accent means brand here | src/components/ui/badge.tsx:18, src/components/ui/context-menu.tsx:197, src/components/ui/sheet.tsx:113 (all in JSON) |
| utility | text-foreground/60 | text-fg/60 | Flux alias resolves by source role; accent means brand here | src/components/ui/tabs.tsx:67 |
| utility | text-green-600 | text-success | F3: completion palette becomes success | src/components/settings/inspector/InspectorPanel.tsx:355, src/components/settings/inspector/InspectorPanel.tsx:399, src/components/settings/inspector/InspectorPanel.tsx:415 (all in JSON) |
| utility | text-green-700 | text-success | F3: completion palette becomes success | src/components/settings/inspector/InspectorPanel.tsx:180 |
| utility | text-green-800 | text-success | F3: completion palette becomes success | src/components/settings/inspector/InspectorPanel.tsx:151 |
| utility | text-indigo-300 | text-info | F2/F3: nearest information role; categorical identity needs labelled marker and owner review | src/components/settings/ToolDashboard.tsx:738 |
| utility | text-indigo-400 | text-info | F2/F3: nearest information role; categorical identity needs labelled marker and owner review | src/components/agents/TagPills.tsx:19, src/components/settings/PluginInstallProgress.tsx:182, src/components/ui/tag-input.tsx:13 |
| utility | text-info | text-info | exact semantic role | src/components/chat/Banner.tsx:48, src/components/chat/composer/CardRadio.tsx:56, src/components/chat/composer/Drawer.tsx:19 (all in JSON) |
| utility | text-info/70 | text-info/70 | exact semantic role | src/components/workflows/WorkflowStepItem.tsx:83 |
| utility | text-info/80 | text-info/80 | exact semantic role | src/components/chat/extensions/SlashCommandMenu.tsx:46 |
| utility | text-left | text-left | named inherited/contract type or structural text utility | src/components/chat/AgentPicker.tsx:106, src/components/chat/ChatHeader.tsx:345, src/components/chat/ChatHeader.tsx:410 (all in JSON) |
| utility | text-lg | text-lg | named inherited/contract type or structural text utility | src/components/chat/MessageContent.tsx:179, src/components/settings/PluginConfigPanel.tsx:174, src/components/settings/agents/AgentCreateWizard.tsx:394 (all in JSON) |
| utility | text-mode-architect | text-fg-muted | F2: simplify to role + visible identity text; distinct hue needs reviewed theme idiom | src/components/settings/appearance/ThemePreview.tsx:101 |
| utility | text-mode-default | text-fg-secondary | F2: simplify to role + visible identity text; distinct hue needs reviewed theme idiom | src/components/chat/ChatMessage.tsx:67, src/components/chat/ChatTranscript.tsx:390, src/components/settings/appearance/ThemePreview.tsx:100 |
| utility | text-mode-planner | text-info | F2: simplify to role + visible identity text; distinct hue needs reviewed theme idiom | src/components/settings/appearance/ThemePreview.tsx:102 |
| utility | text-mode-writer | text-warning | F2: simplify to role + visible identity text; distinct hue needs reviewed theme idiom | src/components/settings/appearance/ThemePreview.tsx:103 |
| utility | text-muted-foreground | text-fg-muted | Flux alias resolves by source role; accent means brand here | src/components/ui/alert-dialog.tsx:125, src/components/ui/avatar.tsx:47, src/components/ui/avatar.tsx:92 (all in JSON) |
| utility | text-orange-400 | text-warning | F3: caution palette becomes warning; identity hue needs F2 | src/components/agents/TagPills.tsx:18, src/components/ui/tag-input.tsx:12 |
| utility | text-pink-400 | text-info | F2/F3: nearest information role; categorical identity needs labelled marker and owner review | src/components/agents/TagPills.tsx:16, src/components/chat/ChatMessage.tsx:75, src/components/ui/tag-input.tsx:10 |
| utility | text-popover-foreground | text-fg | Flux alias resolves by source role; accent means brand here | src/components/ui/context-menu.tsx:103, src/components/ui/context-menu.tsx:86, src/components/ui/dropdown-menu.tsx:233 (all in JSON) |
| utility | text-primary | text-primary | exact semantic role | src/components/RightRail.tsx:200, src/components/RightRailV2.tsx:331, src/components/chat/ApprovalCard.tsx:159 (all in JSON) |
| utility | text-primary-foreground | text-primary-fg | Flux alias resolves by source role; accent means brand here | src/components/chat/ChatComposer.tsx:673, src/components/chat/ChatTranscript.tsx:260, src/components/chat/LeftRail.tsx:103 (all in JSON) |
| utility | text-primary-foreground/90 | text-primary-fg/90 | Flux alias resolves by source role; accent means brand here | src/components/chat/LeftRail.tsx:114 |
| utility | text-primary-hover | text-primary-hover | exact semantic role | src/components/messaging/InboxContent.tsx:22, src/components/messaging/InboxContent.tsx:24 |
| utility | text-purple-400 | text-info | F2/F3: nearest information role; categorical identity needs labelled marker and owner review | src/components/agents/TagPills.tsx:13, src/components/ui/tag-input.tsx:7 |
| utility | text-red-100 | text-danger | F3: feedback palette becomes danger; brand requires explicit identity context | src/components/settings/agents/AgentBuilderWizard.tsx:642 |
| utility | text-red-400 | text-danger | F3: feedback palette becomes danger; brand requires explicit identity context | src/components/settings/PluginInstallProgress.tsx:195 |
| utility | text-red-500 | text-danger | F3: feedback palette becomes danger; brand requires explicit identity context | src/components/settings/PluginInstallProgress.tsx:180, src/components/settings/inspector/InspectorPanel.tsx:567 |
| utility | text-red-600 | text-danger | F3: feedback palette becomes danger; brand requires explicit identity context | src/components/settings/inspector/InspectorPanel.tsx:355 |
| utility | text-red-700 | text-danger | F3: feedback palette becomes danger; brand requires explicit identity context | src/components/settings/PluginManager.tsx:64 |
| utility | text-red-800 | text-danger | F3: feedback palette becomes danger; brand requires explicit identity context | src/components/settings/inspector/InspectorPanel.tsx:155 |
| utility | text-red-900 | text-danger | F3: feedback palette becomes danger; brand requires explicit identity context | src/components/settings/MemoryPanel.tsx:152, src/components/settings/MemoryPanel.tsx:159, src/components/settings/MemoryPanel.tsx:20 (all in JSON) |
| utility | text-right | text-right | named inherited/contract type or structural text utility | src/components/chat/envelopes/primitives/ListCard.tsx:146, src/components/plugins/debug/SlotInspectorPanel.tsx:100, src/components/plugins/debug/SlotInspectorPanel.tsx:101 (all in JSON) |
| utility | text-rose-700 | text-danger | F3: feedback palette becomes danger; brand requires explicit identity context | src/components/settings/agents/AgentReflexesPanel.tsx:630 |
| utility | text-secondary-foreground | text-fg | Flux alias resolves by source role; accent means brand here | src/components/ui/badge.tsx:14 |
| utility | text-selection-fg | text-selection-fg | exact semantic role | src/components/ui/context-menu.tsx:67, src/components/ui/dropdown-menu.tsx:214 |
| utility | text-sky-700 | text-info | F2/F3: nearest information role; categorical identity needs labelled marker and owner review | src/components/settings/agents/AgentReflexesPanel.tsx:637 |
| utility | text-slate-700 | text-surface | F3: nearest neutral ladder role; choose by foreground/surface context | src/components/settings/agents/AgentReflexesPanel.tsx:715 |
| utility | text-sm | text-sm | named inherited/contract type or structural text utility | src/components/AppGate.tsx:38, src/components/AppShell.tsx:132, src/components/AppShell.tsx:177 (all in JSON) |
| utility | text-sm/relaxed | text-sm/relaxed | named inherited/contract type with inherited line-height modifier | src/components/ui/empty.tsx:76 |
| utility | text-status-info | text-info | Flux alias resolves by source role; accent means brand here | src/components/settings/SystemPromptsViewer.tsx:116, src/components/settings/SystemPromptsViewer.tsx:120 |
| utility | text-status-ok | text-success | Flux alias resolves by source role; accent means brand here | src/components/chat/SetupWizard.tsx:198, src/components/settings/SystemPromptsViewer.tsx:115, src/components/settings/SystemPromptsViewer.tsx:122 (all in JSON) |
| utility | text-status-warn | text-warning | Flux alias resolves by source role; accent means brand here | src/components/settings/CatalogBrowser.tsx:394, src/components/settings/SystemPromptsViewer.tsx:123 |
| utility | text-success | text-success | exact semantic role | src/components/chat/AdapterBadge.tsx:4, src/components/chat/ApprovalCard.tsx:79, src/components/chat/Banner.tsx:51 (all in JSON) |
| utility | text-success-fg | text-success-fg | exact semantic role | src/components/chat/envelopes/primitives/ListCard.tsx:139, src/components/chat/envelopes/primitives/ListCard.tsx:331 |
| utility | text-success/80 | text-success/80 | exact semantic role | src/components/settings/ToolDashboard.tsx:1113 |
| utility | text-transparent | text-transparent | structural paint keyword; preserve | src/components/chat/envelopes/primitives/ListCard.tsx:336 |
| utility | text-violet-400 | text-info | F2/F3: nearest information role; categorical identity needs labelled marker and owner review | src/components/chat/AdapterBadge.tsx:3, src/components/chat/ChatMessage.tsx:73, src/components/chat/envelopes/ReportCard.tsx:60 (all in JSON) |
| utility | text-warning | text-warning | exact semantic role | src/components/chat/AgentRoster.tsx:89, src/components/chat/ApprovalCard.tsx:103, src/components/chat/Banner.tsx:49 (all in JSON) |
| utility | text-warning-fg | text-warning-fg | exact semantic role | src/components/settings/agents/SkillDetailView.tsx:421 |
| utility | text-white | text-fg | F3: theme-relative role; no fixed black/white component paint | src/components/chat/ChatComposer.tsx:616, src/components/chat/ChatComposer.tsx:641, src/components/chat/SetupWizard.tsx:121 (all in JSON) |
| utility | text-xl | text-xl | named inherited/contract type or structural text utility | src/components/chat/MessageContent.tsx:176, src/components/settings/AgentProfileManager.tsx:227, src/components/settings/PluginDetailView.tsx:169 (all in JSON) |
| utility | text-xs | text-xs | named inherited/contract type or structural text utility | src/components/CommandPalette.tsx:155, src/components/CommandPalette.tsx:293, src/components/CommandPalette.tsx:297 (all in JSON) |
| utility | text-yellow-600 | text-warning | F3: caution palette becomes warning; identity hue needs F2 | src/components/settings/inspector/InspectorPanel.tsx:175 |
| utility | text-yellow-800 | text-warning | F3: caution palette becomes warning; identity hue needs F2 | src/components/settings/inspector/InspectorPanel.tsx:153 |
| utility | text-zinc-700 | text-surface | F3: nearest neutral ladder role; choose by foreground/surface context | src/components/settings/MemoryPanel.tsx:16 |
| utility | top-0 | top-0 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/Banner.tsx:81, src/components/chat/ChatComposer.tsx:582, src/components/chat/LeftRail.tsx:210 (all in JSON) |
| utility | top-0.5 | top-0.5 | named Tailwind spacing/size or structural utility; preserve | src/components/settings/CatalogSourceManager.tsx:176, src/components/settings/agents/AgentCreateWizard.tsx:414, src/components/settings/primitives.tsx:143 |
| utility | top-1/2 | top-1/2 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/LayoutMenu.tsx:333, src/components/chat/LeftRail.tsx:234, src/components/chat/LeftRail.tsx:271 (all in JSON) |
| utility | top-2 | top-2 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/ChatComposer.tsx:586, src/components/chat/MessageContent.tsx:56, src/components/chat/envelopes/primitives/DevBadge.tsx:47 |
| utility | top-2.5 | top-2.5 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/LeftRail.tsx:216 |
| utility | top-3 | top-3 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/envelopes/primitives/TimelineCard.tsx:59 |
| utility | top-4 | top-4 | named Tailwind spacing/size or structural utility; preserve | src/components/ui/dialog.tsx:71, src/components/ui/sheet.tsx:76 |
| utility | top-[50%] | w-full / max-w-3xl / viewport-bounded slot | F5: proportional/bounded layout; keep data geometry separate from design scale | src/components/ui/alert-dialog.tsx:61, src/components/ui/dialog.tsx:62 |
| utility | top-[60px] | top-15 | Tailwind spacing scale; preserve sign/modifiers; rem follows user scaling | src/components/chat/ChatHeader.tsx:292 |
| utility | top-full | top-full | named Tailwind spacing/size or structural utility; preserve | src/components/chat/ChatHeader.tsx:330, src/components/chat/ChatHeader.tsx:401, src/components/settings/ProviderManager.tsx:546 (all in JSON) |
| utility | top-of-mind | top-of-mind | named Tailwind spacing/size or structural utility; preserve | src/components/settings/agents/AgentCapabilitiesPanel.tsx:535 |
| utility | tracking-[0.04em] | tracking-wider | F4: nearest scale (0.05); proposed snap, fidelity difference explicit | src/components/chat/ErrorDetailModal.tsx:48, src/components/chat/ErrorDetailModal.tsx:63, src/components/chat/ErrorDetailModal.tsx:71 (all in JSON) |
| utility | tracking-[0.05em] | tracking-wider | exact scale | src/components/chat/LayoutMenu.tsx:185, src/components/chat/LayoutMenu.tsx:342, src/components/chat/LayoutMenu.tsx:380 (all in JSON) |
| utility | tracking-[0.06em] | tracking-wider | F4: nearest scale (0.05); proposed snap, fidelity difference explicit | src/components/settings/SettingsPage.tsx:264 |
| utility | tracking-[0.08em] | tracking-widest | F4: nearest scale (0.1); proposed snap, fidelity difference explicit | src/components/settings/agents/AgentBuilderWizard.tsx:1264, src/components/settings/agents/AgentBuilderWizard.tsx:1333 |
| utility | tracking-[0.12em] | tracking-widest | F4: nearest scale (0.1); proposed snap, fidelity difference explicit | src/components/settings/DurableAgentAdminPanel.tsx:1206, src/components/settings/DurableAgentAdminPanel.tsx:1233 |
| utility | tracking-[0.14em] | tracking-label | F4: nearest scale (0.18); proposed snap, fidelity difference explicit | src/components/chat/SessionDetailsPanel.tsx:485, src/components/sidebar/LeftSidebar.tsx:446, src/components/sidebar/StartSurfaceDialog.tsx:861 |
| utility | tracking-[0.16em] | tracking-label | F4: nearest scale (0.18); proposed snap, fidelity difference explicit | src/components/chat/LeftRail.tsx:151 |
| utility | tracking-normal | tracking-normal | named inherited/contract scale | src/components/modals/CreateProjectModal.tsx:61 |
| utility | tracking-tight | tracking-tight | named inherited/contract scale | src/components/chat/envelopes/ReportCard.tsx:72, src/components/ui/empty.tsx:65 |
| utility | tracking-wide | tracking-wide | named inherited/contract scale | src/components/chat/ChatComposer.tsx:607, src/components/chat/ChatComposer.tsx:662, src/components/chat/ChatComposer.tsx:673 (all in JSON) |
| utility | tracking-wider | tracking-wider | named inherited/contract scale | src/components/chat/ComposerToolbar.tsx:171, src/components/chat/MessageContent.tsx:191, src/components/chat/UserProfileMenu.tsx:105 (all in JSON) |
| utility | tracking-widest | tracking-widest | named inherited/contract scale | src/components/ui/command.tsx:164, src/components/ui/context-menu.tsx:226, src/components/ui/dropdown-menu.tsx:187 |
| utility | w-0 | w-0 | named Tailwind spacing/size or structural utility; preserve | src/components/RightRail.tsx:184, src/components/RightRailV2.tsx:315, src/components/chat/LeftRail.tsx:86 |
| utility | w-0.5 | w-0.5 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/LeftRail.tsx:206 |
| utility | w-1 | w-1 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/ThinkingIndicator.tsx:57 |
| utility | w-1.5 | w-1.5 | named Tailwind spacing/size or structural utility; preserve | src/components/agents/StatusDot.tsx:7, src/components/chat/ChatComposer.tsx:588, src/components/chat/ChatDrawerTabStrip.tsx:125 (all in JSON) |
| utility | w-1/2 | w-1/2 | named Tailwind spacing/size or structural utility; preserve | src/components/settings/AgentProfileManager.tsx:275, src/components/settings/CatalogBrowser.tsx:271, src/components/settings/PluginManager.tsx:338 (all in JSON) |
| utility | w-1/3 | w-1/3 | named Tailwind spacing/size or structural utility; preserve | src/components/settings/AgentProfileManager.tsx:276, src/components/settings/CatalogBrowser.tsx:272, src/components/settings/CatalogSourceManager.tsx:105 (all in JSON) |
| utility | w-10 | w-10 | named Tailwind spacing/size or structural utility; preserve | src/components/NavRail.tsx:113, src/components/NavRail.tsx:134, src/components/NavRail.tsx:57 (all in JSON) |
| utility | w-12 | w-12 | named Tailwind spacing/size or structural utility; preserve | src/components/drawers/ChatWorkingDrawer.tsx:519, src/components/settings/PluginConfigPanel.tsx:186, src/components/settings/PluginDetailView.tsx:161 (all in JSON) |
| utility | w-14 | w-14 | named Tailwind spacing/size or structural utility; preserve | src/components/messaging/InboxContent.tsx:245, src/components/settings/appearance/TailwindSwatchGrid.tsx:12 |
| utility | w-16 | w-16 | named Tailwind spacing/size or structural utility; preserve | src/components/NavRail.tsx:52, src/components/chat/ChatTranscript.tsx:258, src/components/messaging/InboxContent.tsx:243 (all in JSON) |
| utility | w-2 | w-2 | named Tailwind spacing/size or structural utility; preserve | src/components/agents/StatusDot.tsx:8, src/components/settings/appearance/ThemePreview.tsx:47, src/components/settings/appearance/ThemePreview.tsx:51 (all in JSON) |
| utility | w-2.5 | w-2.5 | named Tailwind spacing/size or structural utility; preserve | src/components/SearchModal.tsx:198, src/components/chat/AdapterBadge.tsx:29, src/components/chat/ChatComposer.tsx:617 (all in JSON) |
| utility | w-2/3 | w-2/3 | named Tailwind spacing/size or structural utility; preserve | src/components/settings/CatalogSourceManager.tsx:106, src/components/widgets/WidgetRenderer.tsx:45 |
| utility | w-20 | w-20 | named Tailwind spacing/size or structural utility; preserve | src/components/drawers/ArtifactsContent.tsx:291, src/components/messaging/InboxContent.tsx:241, src/components/settings/CatalogSourceManager.tsx:289 (all in JSON) |
| utility | w-24 | w-24 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/AgentPicker.tsx:90, src/components/widgets/SessionInfoWidget.tsx:76, src/components/widgets/ToolsWidget.tsx:31 |
| utility | w-28 | w-28 | named Tailwind spacing/size or structural utility; preserve | src/components/settings/PluginConfigPanel.tsx:185, src/components/settings/PluginDetailView.tsx:57, src/components/settings/ProviderManager.tsx:397 (all in JSON) |
| utility | w-3 | w-3 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/AdapterBadge.tsx:40, src/components/chat/ApprovalCard.tsx:118, src/components/chat/ArtifactChip.tsx:27 (all in JSON) |
| utility | w-3.5 | w-3.5 | named Tailwind spacing/size or structural utility; preserve | src/components/RightRail.tsx:204, src/components/RightRailV2.tsx:335, src/components/RightRailV2.tsx:360 (all in JSON) |
| utility | w-3/4 | w-3/4 | named Tailwind spacing/size or structural utility; preserve | src/components/drawers/ArtifactsContent.tsx:68, src/components/messaging/InboxContent.tsx:250, src/components/settings/AgentProfileManager.tsx:280 (all in JSON) |
| utility | w-32 | w-32 | named Tailwind spacing/size or structural utility; preserve | src/components/drawers/ArtifactsContent.tsx:290 |
| utility | w-36 | w-36 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/AgentPicker.tsx:91 |
| utility | w-4 | w-4 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/AgentPicker.tsx:112, src/components/chat/AgentPicker.tsx:125, src/components/chat/AgentPicker.tsx:63 (all in JSON) |
| utility | w-40 | w-40 | named Tailwind spacing/size or structural utility; preserve | src/components/settings/ProviderManager.tsx:403, src/components/settings/ProviderManager.tsx:511, src/components/settings/ToolDashboard.tsx:449 (all in JSON) |
| utility | w-44 | w-44 | named Tailwind spacing/size or structural utility; preserve | src/components/settings/ProviderManager.tsx:546 |
| utility | w-48 | w-48 | named Tailwind spacing/size or structural utility; preserve | src/components/drawers/ChatPrimaryDrawer.tsx:401, src/components/settings/CatalogBrowser.tsx:189, src/components/settings/PluginConfigPanel.tsx:188 (all in JSON) |
| utility | w-5 | w-5 | named Tailwind spacing/size or structural utility; preserve | src/components/NavRail.tsx:123, src/components/NavRail.tsx:150, src/components/NavRail.tsx:98 (all in JSON) |
| utility | w-5/6 | w-5/6 | named Tailwind spacing/size or structural utility; preserve | src/components/drawers/ArtifactsContent.tsx:69 |
| utility | w-52 | w-52 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/ChatHeader.tsx:401, src/components/settings/ProfilePanel.tsx:212, src/components/settings/SettingsPage.tsx:256 |
| utility | w-56 | w-56 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/ChatHeader.tsx:330 |
| utility | w-6 | w-6 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/ChatDrawerTabStrip.tsx:155, src/components/chat/ChatDrawerTabStrip.tsx:94, src/components/chat/envelopes/ErrorCard.tsx:100 (all in JSON) |
| utility | w-60 | w-60 | named Tailwind spacing/size or structural utility; preserve | src/components/settings/primitives.tsx:197 |
| utility | w-64 | w-64 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/LeftRail.tsx:86, src/components/chat/UserProfileMenu.tsx:68 |
| utility | w-7 | w-7 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/Banner.tsx:87, src/components/chat/ChatHeader.tsx:310, src/components/chat/ChatHeader.tsx:394 (all in JSON) |
| utility | w-72 | w-72 | named Tailwind spacing/size or structural utility; preserve | src/components/ui/icon-picker.tsx:155, src/components/ui/popover.tsx:33 |
| utility | w-8 | w-8 | named Tailwind spacing/size or structural utility; preserve | src/components/NavRail.tsx:64, src/components/chat/AgentPicker.tsx:108, src/components/chat/AgentPicker.tsx:88 (all in JSON) |
| utility | w-80 | w-80 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/extensions/FileMentionMenu.tsx:109, src/components/chat/extensions/FileMentionMenu.tsx:120, src/components/chat/extensions/SlashCommandMenu.tsx:109 (all in JSON) |
| utility | w-9 | w-9 | named Tailwind spacing/size or structural utility; preserve | src/components/chat/ChatTranscript.tsx:513, src/components/settings/AgentProfileManager.tsx:329, src/components/settings/CatalogBrowser.tsx:385 (all in JSON) |
| utility | w-96 | w-96 | named Tailwind spacing/size or structural utility; preserve | src/components/RightRail.tsx:184, src/components/RightRailV2.tsx:315 |
| utility | w-[10px] | w-2.5 | Tailwind spacing scale; preserve sign/modifiers; rem follows user scaling | src/components/chat/LayoutMenu.tsx:139 |
| utility | w-[11px] | w-2.75 | Tailwind spacing scale; preserve sign/modifiers; rem follows user scaling | src/components/chat/envelopes/primitives/TimelineCard.tsx:63, src/components/widgets/ContextBudgetWidget.tsx:89 |
| utility | w-[140px] | w-35 | Tailwind spacing scale; preserve sign/modifiers; rem follows user scaling | src/components/drawers/ChatWorkingDrawer.tsx:353 |
| utility | w-[18px] | w-4.5 | Tailwind spacing scale; preserve sign/modifiers; rem follows user scaling | src/components/chat/Banner.tsx:87, src/components/chat/LayoutMenu.tsx:52, src/components/chat/ToolCallBanner.tsx:48 |
| utility | w-[22px] | w-5.5 | Tailwind spacing scale; preserve sign/modifiers; rem follows user scaling | src/components/chat/LayoutMenu.tsx:530, src/components/chat/composer/Drawer.tsx:82 |
| utility | w-[280px] | w-70 | Tailwind spacing scale; preserve sign/modifiers; rem follows user scaling | src/components/settings/appearance/ColorPickerPopover.tsx:85 |
| utility | w-[30%] | w-full / max-w-3xl / viewport-bounded slot | F5: proportional/bounded layout; keep data geometry separate from design scale | src/components/chat/envelopes/ErrorCard.tsx:95 |
| utility | w-[320px] | w-80 | Tailwind spacing scale; preserve sign/modifiers; rem follows user scaling | src/components/messaging/TaskThreadPanel.tsx:95 |
| utility | w-[80%] | w-full / max-w-3xl / viewport-bounded slot | F5: proportional/bounded layout; keep data geometry separate from design scale | src/components/chat/LayoutMenu.tsx:182 |
| utility | w-[85%] | w-full / max-w-3xl / viewport-bounded slot | F5: proportional/bounded layout; keep data geometry separate from design scale | src/components/drawers/ChatWorkingDrawer.tsx:411 |
| utility | w-[8px] | w-2 | Tailwind spacing scale; preserve sign/modifiers; rem follows user scaling | src/components/chat/LayoutMenu.tsx:218, src/components/chat/LayoutMenu.tsx:225 |
| utility | w-[90%] | w-full / max-w-3xl / viewport-bounded slot | F5: proportional/bounded layout; keep data geometry separate from design scale | src/components/drawers/ChatWorkingDrawer.tsx:303 |
| utility | w-[var(--radix-popover-trigger-width)] | controlled layout slot / named scale | F5: dynamic expression is host geometry, never component design constant | src/components/sidebar/ScopeSelector.tsx:70 |
| utility | w-fit | w-fit | named Tailwind spacing/size or structural utility; preserve | src/components/ui/badge.tsx:8, src/components/ui/kbd.tsx:8, src/components/ui/select.tsx:40 (all in JSON) |
| utility | w-full | w-full | named Tailwind spacing/size or structural utility; preserve | src/components/AppGate.tsx:36, src/components/ComponentGalleryPage.tsx:3, src/components/RightRail.tsx:272 (all in JSON) |
| utility | w-px | w-px | named Tailwind spacing/size or structural utility; preserve | src/components/chat/ComposerPlusMenu.tsx:154, src/components/chat/ComposerPlusMenu.tsx:196, src/components/chat/ComposerToolbar.tsx:140 (all in JSON) |
| utility | w-screen | w-screen | named Tailwind spacing/size or structural utility; preserve | src/components/AppGate.tsx:29, src/components/AppGate.tsx:35, src/components/AppShell.tsx:140 |
