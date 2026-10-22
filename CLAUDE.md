@AGENTS.md

## Debate photos (the owner's rule)

When the owner sends photos for a debate:

- **Both options in one photo** (e.g. Ronaldinho and Neymar side by side, Hamilton
  and Verstappen side by side) → the **vote board**. Each side becomes its own
  1200×1323 photo, `src/assets/debates/<debate-slug>-1.jpg` (first option) and
  `-2.jpg`, cropped so the face (or logo) is centred and about a third of the
  way down; swap the sides if the photo has them the other way round, and crop
  out stats, captions and logos that would repeat the names. Also save both
  side by side as `<debate-slug>.jpg` (2400×1323) for link previews. Set the
  debate's `artwork` to `{ sides, focus, file }`, where `focus` is each side's
  CSS object-position that keeps the face whole on a phone. Logos on white get
  lifted onto a dark background. Check every board at phone width (about
  390px): most visitors are on phones, and no face or logo may be cut off.
- **One option alone** → that option's **share card** and its link preview.
  Save it as `assets/cards/<option-slug>.jpg`, 1080×1350 (4:5, the same as
  Messi and Ronaldo's), with the face or logo centred about a third of the way
  down (the card's text sits in the lower part), and set it as the option's
  `cardPhoto`.

If a debate has singles but no pair photo, the board can be built from the two
singles; if an option has no single, its card can be cropped from its half of
the pair photo. Say which fallback was used.

## New debates

Add the debate to `DEBATES` (its position sets the order the "settle the next
debate" bar follows) and to the lists in
`supabase/migrations/20261022120000_all_debates.sql`, which only adds what's
missing, then tell the owner to run that script in Supabase.

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
