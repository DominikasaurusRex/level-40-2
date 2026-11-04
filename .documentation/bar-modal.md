# Bar Exchange Modal

The Bar modal is a small, simple currency-exchange interface.

## Layout

The main row contains:

1. An **XP** field whose label includes the XP icon.
2. A direction-switch button in the middle.
3. A **Gold** field whose label includes the Gold icon.

One field is the input and the other is the calculated result:

- The currency currently placed first is editable by the player.
- The currency placed second is read-only and shows how much the player will receive.
- The middle switch button swaps their positions and changes the trade direction.

Between the two fields, show a small arrow pointing from the input currency to the output currency.
Display the current exchange rate directly above the arrow, for example **20%**.

Below the exchange row, show one large **Accept Trade** button.

## Behavior

- Changing the input amount immediately recalculates the output amount using the current Bar
  exchange rate.
- Switching direction preserves the simple input-to-output presentation but swaps XP and Gold.
- Accept Trade removes the entered amount from the input currency and grants the displayed output
  amount.
- The button is unavailable when the amount is zero, invalid, or greater than the player's current
  amount of the input currency.

