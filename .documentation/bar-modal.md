# Bar Exchange Modal

The Bar modal is a small, simple currency-exchange interface. It uses the book look
(`book-modal.md`) with two top bookmarks that choose the trade direction: **Gold → XP** and
**XP → Gold**. There are no left bookmarks.

## Layout

The main row contains:

1. The input currency's field, whose label includes its icon.
2. The output currency's field, whose label includes its icon.

One field is the input and the other is the calculated result:

- The input currency (first in the selected bookmark) is editable by the player.
- The output currency is read-only and shows how much the player will receive.
- Switching bookmarks swaps the two currencies and changes the trade direction.

Between the two fields, show a small arrow pointing from the input currency to the output currency.
Display the current exchange rate directly above the arrow, for example **20%**.

Below the exchange row, show one large **Accept Trade** button.

## Behavior

- Changing the input amount immediately recalculates the output amount using the current Bar
  exchange rate.
- Switching the direction bookmark keeps the simple input-to-output presentation but swaps XP and
  Gold.
- Accept Trade removes the entered amount from the input currency and grants the displayed output
  amount.
- The button is unavailable when the amount is zero, invalid, or greater than the player's current
  amount of the input currency.

