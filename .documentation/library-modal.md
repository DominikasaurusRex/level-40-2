# Library Monster Manual Modal

The Library monster manual uses a two-column layout similar to the Town repair modal.

## Discovery rules

- Only zones the player has reached are listed.
- Locked and unreached zones are completely hidden. Do not show question marks, silhouettes, empty
  slots, or other placeholders for them.
- Every monster the player has reached is displayed and tracked with its known stats.
- A monster skill is recorded only after the player has seen that skill activate.
- **Defeating a monster records all of its skills as seen**, whether they activated or not. This
  keeps the rule simple.
- Unseen skills are omitted rather than shown as unknown entries.

**During development:** until runs exist and the reached stage is tracked, the Library may list
every stage that has a monster. The discovery rules above are the target behavior.

## Left side: zone selection

- Show the reached zones as a selectable list.
- The game has 42 zones, so this list must be vertically scrollable.
- Selecting a zone selects its reached monster and updates the right side.
- Only currently reached zones exist in the list.

## Right side: monster details

Show the following from top to bottom:

1. The monster name as the top label. A boss (every fifth stage) shows a boss icon next to its
   name, read from the monster's boss marker.
2. A large image of the monster.
3. A two-column statistics grid.
4. A status-resistance and defensive-traits row spanning both columns.
5. The resistance-symbol legend as one row spanning both columns.
6. A two-column skill table.

### Statistics grid

The left column contains:

- **HP:** maximum HP, for example **HP: 100**.
- **ATK:** the damage per hit of the monster's weapon (its basic attack), for example **ATK: 12**.
  A multi-hit weapon shows damage × hits, for example **ATK: 5 × 2**.
- **SPD:** how often the weapon attacks, shown as the time between attacks, for example
  **SPD: 2.0s**.
- **Drops:** icons for the materials the monster can drop.
  - Gold and XP are default rewards and are not listed.
  - Only material-drop icons are shown.
  - The drop chance is never shown; the icons only say the monster *can* drop that material.

With four rows, the left column lines up with the four damage-type rows on the right.

How a weapon's elemental component appears in ATK (for example **5 + 10 Fire**) is still open.

The right column contains the monster's response to each damage type:

- Physical icon and response symbol.
- Fire icon and response symbol.
- Ice icon and response symbol.
- Thunder icon and response symbol.

The damage-type and response symbols will later be replaced with provided image assets.


### Status resistances and defensive weaknesses

Between the statistics grid and the resistance legend, show a single row of icons for relevant
status immunities and the player defenses the monster is weak against.

This row can communicate:

- The monster's response to **Poison**, shown with the same response symbols as the damage types
  (◎ ◯ △ ⨉).
- The monster's response to **Stun**, shown the same way.
- Whether the monster is **weak to DEF**: it attacks with many small hits, so flat DEF per hit
  blocks a large share of its damage.
- Whether the monster is **weak to AGI**: it attacks with big, slow hits, so each evasion charge
  avoids a large amount of damage.

Status immunity and defensive weaknesses are different facts:

- Poison and Stun use the same four symbols as the damage responses: vulnerable, normal,
  resistant, or immune.
- DEF and AGI indicators are weaknesses. They tell the player which defensive options pay off
  when choosing active skills.

Show all indicators that apply to the selected monster. The exact icon assets and presentation
will be provided later.

### Resistance legend

Directly below the statistics grid, show this exact single-row legend:

**◎ = Weakness   △ = Resistance   ⨉ = Immunity   ◯ = Normal**

The combat system also supports absorption, but no Library symbol has been specified for it yet.
Do not invent one; resolve it when the final icons are provided.

### Skills

Below the legend, show a two-column grid:

| Skill | Description |
| --- | --- |
| Voltage | High damage Thunder attack |
| Curse | Applies Curse to you |
| Blow | Lowers attack speed |

These rows are examples of the presentation. The table contains only skills that this specific
monster has already been seen using.


We always work around the assumption of 3 skills max (exact number depends on actual implementation). if an enemy has less, the row stays empty.
