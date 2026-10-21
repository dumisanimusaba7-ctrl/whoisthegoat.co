@AGENTS.md

## Debate photos (the owner's rule)

When the owner sends photos for a debate:

- **Both options in one photo** (e.g. Ronaldinho and Neymar side by side, Hamilton
  and Verstappen side by side) → the **vote board**. Save it as
  `src/assets/debates/<debate-slug>.jpg`, 1500×827, first option on the left (swap
  the halves if the photo has them the other way round; crop out any stats or
  captions), and set it as the debate's `artwork` with `file` pointing at it.
- **One option alone** → that option's **share card**. Save it as
  `assets/cards/<option-slug>.jpg`, 1080×1350 (4:5, the same as Messi and
  Ronaldo's), and set it as the option's `cardPhoto`.

If a debate has singles but no pair photo, the board can be built from the two
singles; if an option has no single, its card can be cropped from its half of
the pair photo. Say which fallback was used.
