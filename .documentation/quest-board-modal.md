# Quest Board Modal

The Quest Board uses the book look (`book-modal.md`), like the Library: top bookmarks for areas,
left bookmarks for the stages of the selected area.

Quest tracking begins only after the Quest Board has been repaired. Progress from before that repair
does not count retroactively.

**During development:** until runs exist and the reached stage is tracked, the Quest Board may list
every stage from 1–25 that has a monster. Only reached levels is the target behavior.

## Bookmarks: area and level selection

- **Top bookmarks:** the reached areas that have quests (stages 1–25, so at most five areas).
- **Left bookmarks:** the reached levels of the selected area.
- Only levels 1–25 have quests. Levels 26–42 and their areas never get a bookmark.
- Unreached areas and levels are completely hidden. Do not show question marks, silhouettes, empty
  slots, or other placeholders.
- Selecting a level displays that level's monster quests on the right side.

## Right side: monster quests

Show the following from top to bottom:

1. A title using the monster's name, for example **Slime Quests**.
2. A large image of the monster.
3. Four quest buttons for that monster.

## Quest buttons

Each monster has exactly four quests. Display each quest as a large, simple button with a brown,
paper-like appearance.

An unclaimed quest button shows:

1. The quest description.
2. Its current progress below the description.

Examples:

- **Kill within one second**
  - **0 / 1**
- **Kill 10 times**
  - **8 / 10**

Progress should update as the player advances the quest.

## Quest states

### In progress

- Show the description and current progress.
- The button uses its normal brown paper appearance.
- Clicking it does nothing.

### Ready to claim

- Show the completed description and progress.
- Give the button a subtle glow so it is clearly ready to claim.
- Clicking the button claims the reward.

### Claimed

After claiming:

- Remove the quest description and progress from the button.
- Replace them with the reward that was received.
- The claimed button is no longer interactive.

Rewards can include Gold, a new skill, or another explicitly assigned permanent or resource reward.
The button should show the reward's icon when one exists, together with a short reward label.

