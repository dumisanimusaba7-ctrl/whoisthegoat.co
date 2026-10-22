@AGENTS.md

## Debate photos (the owner's rule)

When the owner sends photos for a debate:

- **Both options in one photo** (e.g. Ronaldinho and Neymar side by side, Hamilton
  and Verstappen side by side) → the **vote board**. Save it as
  `src/assets/debates/<debate-slug>.jpg`, 2400×1323, first option on the left (swap
  the halves if the photo has them the other way round; crop out any stats or
  captions), and set it as the debate's `artwork` with `file` pointing at it.
- **One option alone** → that option's **share card**. Save it as
  `assets/cards/<option-slug>.jpg`, 1080×1350 (4:5, the same as Messi and
  Ronaldo's), and set it as the option's `cardPhoto`.

If a debate has singles but no pair photo, the board can be built from the two
singles; if an option has no single, its card can be cropped from its half of
the pair photo. Say which fallback was used.

## Photo quality (the owner's rule)

Never ship a photo at lower quality than it arrived:

- When a photo is smaller than its target (board half 1200×1323, card
  1080×1350), upscale it with `scripts/upscale_photo.py` (Real-ESRGAN) first,
  then crop and downscale with Lanczos. Never just stretch it. Keep some of
  the original texture (the script's `texture` argument) so faces don't look
  airbrushed; artwork with deliberate grain (the Messi vs Ronaldo poster)
  keeps most of it.
- Save JPEGs at quality 95 with 4:4:4 colour (Pillow: `quality=95,
  subsampling=0`). The vote board is served through `next/image` at
  `quality={95}`; share cards are encoded at 94 (4:5) and 88 (link previews).
- Look at the result next to the original before committing.
