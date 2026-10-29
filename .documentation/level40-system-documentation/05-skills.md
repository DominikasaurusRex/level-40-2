# Skills

Source: `src/data/skill-progression.ts` (single source of truth). Original tree layout:
`.doc/skillltree.drawio`.

## Model

The player starts with **no skills** — only the Basic Attack. There are three skill families,
each a single automatic skill that grows through upgrades:

- ⚔️ **Strike** (attack) — id `strike`
- 🛡️ **Guard** (defense) — id `guard`
- ❤️ **Heal** (heal) — id `heal`

The only persisted state is `player.ownedSkillChoiceIds`. `skillsForPlayer(player)` builds the
full `Skill` objects from those ids plus current Power every time something changes (choice
accepted, Power change, weapon tier). Skills therefore rescale automatically.

When skills are rebuilt mid-fight, existing cooldowns are kept (capped at the new cooldown) and
queued effects survive. A **newly learned** skill starts ready (fires immediately).

## Skill choices

Choices at player levels **2, 3, 5, 8, 11, 16, 21, 25, 27, 30** — 10 picks from 18 nodes.

Each choice opens the full tree. A node is available when it is not owned and **all**
prerequisites (incoming arrows) are owned. No random offers.

```text
Strike ──┬── Quick Strike ── Double Strike ── Bleeding Strike
         └── Power Strike ─┐
Guard ───┬── Fortify ──────┴── Counter ── Stunning Strike
         ├── Evasion
         └── Quick Guard ──┐
Heal ────┬── Greater Heal ─┴── Recovery ── Offensive Care
         └── Quick Heal ── Regeneration ── Cleanse
```

Cross-family joins: **Counter** needs Power Strike + Fortify. **Recovery** needs Quick Guard +
Greater Heal. **Stunning Strike** needs Counter. **Offensive Care** needs Recovery.

## Nodes and formulas (P = Power)

### ⚔️ Strike — base: `3 × P` DMG, cooldown 8s

| Node | id | Requires | Effect |
| ---- | -- | -------- | ------ |
| Strike | `strike` | — | `3 × P` DMG, 8s |
| Quick Strike | `strike-quick` | Strike | cooldown 8s → 6s |
| Power Strike | `strike-power` | Strike | `3 × P` → `4 × P` |
| Double Strike | `strike-double` | Quick Strike | Total becomes `ceil(0.8 × total)`, split into two hits (ceil/floor halves). Better vs AGI |
| Bleeding Strike | `strike-bleed` | Double Strike | + Bleed `max(1, round(P / 3))` per second for 4s |
| Stunning Strike | `strike-stun` | Counter | + 1.5s Stun |

### 🛡️ Guard — base: `P + 2` DEF, cooldown 10s

| Node | id | Requires | Effect |
| ---- | -- | -------- | ------ |
| Guard | `guard` | — | `P + 2` DEF, 10s |
| Fortify | `guard-fortify` | Guard | DEF doubled: `2P + 4` |
| Evasion | `guard-evasion` | Guard | + 1 AGI charge |
| Quick Guard | `guard-quick` | Guard | cooldown 10s → 8s |
| Counter | `guard-counter` | Power Strike, Fortify | When DEF is fully consumed, return that hit's full pre-DEF damage |
| Recovery | `guard-recovery` | Quick Guard, Greater Heal | When DEF is fully consumed, heal `P + 2` |

### ❤️ Heal — base: `P + 2` HP instant, cooldown 12s

| Node | id | Requires | Effect |
| ---- | -- | -------- | ------ |
| Heal | `heal` | — | `P + 2` HP, 12s |
| Greater Heal | `heal-greater` | Heal | instant heal doubled: `2P + 4` |
| Quick Heal | `heal-quick` | Heal | cooldown 12s → 9s |
| Regeneration | `heal-regeneration` | Quick Heal | + extra `P + 3` HP over 4s (HoT, on top of the instant heal) |
| Cleanse | `heal-cleanse` | Regeneration | Heal also removes Bleed and Curse |
| Offensive Care | `heal-safeguard` | Recovery | Overheal from Heal, Regeneration, and Recovery damages the enemy |

The id `heal-safeguard` is a legacy name kept stable for saves.

## Design intent per deep node

Each deep choice is meant to win a specific matchup (checked by `capstone-value.spec.ts`):

- Double Strike → enemies with AGI.
- Bleeding Strike → durable/high-HP targets (ignores DEF).
- Stunning Strike → sustained-pressure enemies.
- Offensive Care → turns surplus sustain into damage.
- Cleanse → Bleed/Curse enemies.

A focused, synergistic build should beat random picks; every pick should be potentially useful.

## Player skill row icons

Each row shows the icon of the most advanced owned node in its family, using a fixed priority
order (`playerSkillIconOrder`). Icons live in `public/skills/`.

## Skill descriptions

Tree node descriptions are hand-written text in the data file. Live skill tooltips are
generated from effects by `utils/skill-description.ts`.
