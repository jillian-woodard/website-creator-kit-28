-- Capture WHY a user dismissed a piece, not just that they did. Nullable so existing rows
-- and any dismiss action that skips the reason picker stay valid.
ALTER TABLE public.rec_dismissals
  ADD COLUMN reason TEXT;

COMMENT ON COLUMN public.rec_dismissals.reason IS
  'Why the user dismissed this piece, e.g. too_expensive, not_my_style, wrong_color, dislike_brand, quality. Free-ish tag set enforced in application code, not a DB constraint, so new reasons can be added without a migration.';
