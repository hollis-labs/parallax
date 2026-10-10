# Bounded inspection chrome — CW-20261010-0035

The new `InspectionDialog` is imported from the public design-components root
and consumed from a local tarball pinned in frontend/package.json and lockfile.
Its workspace version is 0.4.0, but it is **unpublished candidate bytes**, not the
registry 0.4.0 release. The hash-named archive in third_party and lock integrity
identify the actual package. No publication, tag or deployment is part of this
change. The source owner is design-kit/packages/design-components.

A separate layout preserves the existing fixed-height DetailDialog API while
adding controlled open/onOpenChange, title/meta/navigation/footer/body slots,
popup ref, purpose-specific initial/final focus and forwarded popup keyboard and
composition events. Token sizing bounds the popup to the dynamic viewport with
one body scroll region. The host supplies navigation markup and body labeling.

Torque TaskInspection (dashboard idiom) retains its exact data joins, routes,
admission, record order, wrap policy, controls, actions and return eligibility.
The extraction replaces chrome only. Existing navigation logic remains app-owned
until the exact reviewed CW-20261010-0036 candidate is integrated separately.
The old chrome geometry CSS is removed; body metadata/log wrapping and small
footer/status typography remain app-owned. Tests address stable shared slot
attributes instead of obsolete chrome classes.

The second genuine consumer is existing Messaging attachment/draft inspection
(chat idiom). It uses the same public chrome with arbitrary JSON content and
purpose-specific readable-title initial focus. Existing native editing, controlled
candidate custody, queued outcome release, source retirement and focus-return
eligibility remain in MessagingExample. Neither app+story rendering of Torque
alone nor duplicate dashboard screens establish the second consumer.

Authored proof lives in the task's retained .scratch/extraction-proof, separate
from immutable0007/0008/0009/0011 evidence. The design-kit package also carries an
arbitrary-content demo and portable Chromium proof script. Required surfaces are
long/short/empty/edit, native scrolling, containment/return, forwarded keys and
synthetic composition, and nested child-overlay Escape at1440x900,390x844,
1440x420,390x420. A fresh consumer installs the exact archive and checks public
JS/types, production CSS registration and browser behavior. Changed-source
Torque app+portable integrated journeys and Messaging app+portable proofs use
this exact candidate. Final gate logs and reviewed source/head/tree/pack receipts
are recorded in Torque and the durable Tesseract handoff.

Headless composition events prove forwarding only. Native OS IME and physical
touchscreen are untested. Generic ops-list, universal autofocus, business actions,
consumer routing/admission and registry rollout are outside this chrome API.
