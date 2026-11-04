# Town Repair Modal

The Town repair modal is opened from the Monument. It is used to inspect and purchase repairs and
upgrades for every Town place.

## Layout

The modal uses two columns.

### Left side: place selection

- Show a selectable list containing **every Town place**.
- Selecting a place updates the details on the right.
- The selected place must be visually distinct.

### Right side: selected place

Show the following from top to bottom:

1. The place name, for example **Library**.
2. The level change, for example **0 -> 1**.
3. A large image of the selected place.
   - Individual images will be provided later.
   - Until then, use **/town/library/bib-day.png** for every place.
4. A short explanation of what the repair or upgrade changes.
   - Library repair example: **Keep track of your enemies**.
   - Library upgrade example: **Track every enemy's skill**.
5. The repair or upgrade cost.
6. A large **Upgrade** button.

## Cost display

Costs are displayed in a wrapping flex grid. Entries should use as much horizontal space as they
need and flow onto another row when necessary.

Always show resources in this order, only show once that are used for the upgrade:

1. Gold
2. Wood
3. Silk
4. Metal
5. Crystal

Each cost entry contains:

- The resource icon.
- Current amount / required amount.
- The **current amount** tinted green when the player has enough.
- The **current amount** tinted red when the player does not have enough.

## Upgrade button

- The button is enabled only when the player has every required resource.
- It is greyed out and cannot be used when any required resource is missing.
- Activating it purchases the selected repair or upgrade, deducts its costs, and refreshes the
  displayed level and next upgrade.
- A place at its maximum level cannot be upgraded.

