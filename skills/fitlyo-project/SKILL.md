---
name: fitlyo-project
description: Work on the FITLYO pickleball prototype, its cross-role flows, product rules, or project documents. Load the project handoff first and preserve the current prototype scope.
---

# FITLYO Project Skill

Use this skill for feature work, bug fixes, reviews, and documentation in the FITLYO repository.

## Start with the project memory

Read `FITLYO_CODEX_HANDOFF.md` from the root of the FITLYO repository before changing behavior. It records the product context, current business decisions, known documentation conflicts, user-specific requirements, and working-tree caution.

Then inspect the relevant routes, page, store, types, and current Git diff. Treat the live code and newest explicit user instruction as more reliable than stale spec text. The README contains unresolved merge markers and an obsolete fitness/wellness description; do not use that section as current product direction.

## Product invariants

- FITLYO is a Vietnamese pickleball marketplace prototype for Player, Coach, Field Manager, and Admin.
- The latest recorded policy is 100% payment. Coach requests require Coach approval first, then Player has 15 minutes to pay; Coach has up to 12 hours to respond.
- The latest recorded court schedule is 10 fixed 90-minute slots from 06:00 to 21:00. Verify actual helpers/store before changing schedule behavior.
- New Coach accounts must not inherit sample links, courses, students, transactions, or revenue.
- Coach-initiated venue link requests and FM-initiated Coach invitations are separate two-way workflows. Each side must see the correct pending/approved/rejected state.
- Player, Coach, and FM dates/booking states should agree for the same booking. Check both ends of any cross-role change.
- `localStorage` and browser `storage` events are prototype-level persistence/sync, not backend or multi-device guarantees.
- Payments, VietQR, QR check-in, refund, escrow, and reports may be mock behavior. Describe them honestly.

## Work style for this repository

- Work in Vietnamese unless the user asks otherwise. Follow the exact requested scope and deliver a complete, concrete result.
- For workflow changes, trace the initiating role through receiving roles and final state. Include relevant exception paths such as rejection, expiry, cancellation, and refund.
- Ask before deciding unclear business rules, especially rules affecting money, slot availability, cancellation, and state ownership. Do not invent missing policy.
- Preserve the dirty working tree. Never reset, clean, or overwrite unrelated changes. Do not commit or push unless the user explicitly asks.
- Do not claim tests/builds were run unless they were. Do not add or run tests unless asked.
- When specs conflict, prefer the latest explicit user decision, then current code, then `FITLYO_PROTOTYPE_UPDATE_2026-10-22.md`, and only then older specs/analysis. Flag unresolved contradictions in the handoff or response.
