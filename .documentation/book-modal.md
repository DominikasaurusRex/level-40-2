# Book Modal

The shared look of the Town modals. A modal is drawn as an open **paper book**. It can have two sets
of **bookmarks** (tabs) for navigation:

- **Top bookmarks** along the top edge of the book choose the broad group.
- **Left bookmarks** along the left edge choose an entry within the selected top bookmark.

Not every modal uses both sets, and a modal may use none. On load, the first bookmark of each set
is selected (the leftmost top bookmark and the topmost left bookmark). The content area to the right of the left
bookmarks keeps the layout described in each modal's own spec.

## Bookmarks per modal

| Modal | Top bookmarks | Left bookmarks | Spec |
| --- | --- | --- | --- |
| Library | Areas, plus a separate Superboss bookmark for stages 41 and 42 | Stages of the selected area | `library-modal.md` |
| Quest Board | Areas | Stages of the selected area | `quest-board-modal.md` |
| Bar | Gold → XP and XP → Gold (the trade direction) | None | `bar-modal.md` |
| Smithy | Weapon families | Individual weapons of the selected family | Not written yet |
| Inn (Town repair) | Town places | Upgrade levels of the selected place | `town-repair-modal.md` |

Grouping stages by area keeps the left bookmarks short (about five per area), so the long scrolling
lists of the earlier layouts are no longer needed.

The Barracks skill board does **not** use the book look.

## Inn level bookmarks

- **Target:** only the next level's bookmark is active; earlier levels are shown greyed out.
- **For now:** every level's bookmark is shown and clickable.

## Smithy weapon bookmarks

A weapon the player cannot build yet is still shown in some form. When a weapon becomes buildable is
not discussed yet.
