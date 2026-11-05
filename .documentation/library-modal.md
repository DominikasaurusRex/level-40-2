# Library Monster Manual Modal

The Library monster manual uses a two-column layout similar to the Town repair modal.

## Discovery rules

- Only zones the player has reached are listed.
- Locked and unreached zones are completely hidden. Do not show question marks, silhouettes, empty
  slots, or other placeholders for them.
- Every monster the player has reached is displayed and tracked with its known stats.
- A monster skill is recorded only after the player has seen that skill activate.
- Unseen skills are omitted rather than shown as unknown entries.

## Left side: zone selection

- Show the reached zones as a selectable list.
- The game has 42 zones, so this list must be vertically scrollable.
- Selecting a zone selects its reached monster and updates the right side.
- Only currently reached zones exist in the list.

## Right side: monster details

Show the following from top to bottom:

1. The monster name as the top label.
2. A large image of the monster.
3. A two-column statistics grid.
4. A status-resistance and defensive-traits row spanning both columns.
5. The resistance-symbol legend as one row spanning both columns.
6. A two-column skill table.

### Statistics grid

The left column contains:

- **HP:** maximum HP, for example **HP: 100**.
- **ATK:** the damage of the monster's weapon (its basic attack), for example **ATK: 12**.
- **Drops:** icons for the materials the monster can drop.
  - Gold and XP are default rewards and are not listed.
  - Only material-drop icons are shown.

The right column contains the monster's response to each damage type:

- Physical icon and response symbol.
- Fire icon and response symbol.
- Ice icon and response symbol.
- Thunder icon and response symbol.

The damage-type and response symbols will later be replaced with provided image assets.


### Status resistances and defensive traits

Between the statistics grid and the resistance legend, show a single row of icons for relevant
status immunities and notable defensive behavior.

This row can communicate:

- Whether the monster is resistant or immune to **Poison**.
- Whether the monster is resistant or immune to **Stun**.
- Whether the monster makes significant use of **Shield**.
- Whether the monster makes significant use of **DEF**.
- Whether the monster makes significant use of **AGI**.

Status immunity and defensive behavior are different facts:

- Poison and Stun indicators distinguish reduced effectiveness from complete immunity.
- Shield, DEF, and AGI indicators warn that the monster uses those mechanics heavily enough to
  matter when choosing a loadout.

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
