-- Email connections: stores OAuth tokens for a connected email account (Gmail).
-- This table holds sensitive refresh/access tokens, so RLS is enabled with NO policies
-- for anon/authenticated roles -- only the service role (used inside edge functions)
-- can read or write it. The safe `email_connection_status` view below exposes
-- non-sensitive columns to the owning user for UI purposes.
CREATE TABLE public.email_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL DEFAULT 'google',
  email_address TEXT,
  refresh_token TEXT NOT NULL,
  access_token TEXT,
  token_expires_at TIMESTAMPTZ,
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.email_connections ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER update_email_connections_updated_at BEFORE UPDATE ON public.email_connections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE VIEW public.email_connection_status AS
  SELECT id, user_id, provider, email_address, last_synced_at, created_at
  FROM public.email_connections
  WHERE user_id = auth.uid();
GRANT SELECT ON public.email_connection_status TO authenticated;

-- Detected purchases: pending review queue of clothing items found in a user's
-- connected email. Rows are inserted only by the scan-email-purchases edge
-- function (service role) -- there's intentionally no INSERT policy for
-- authenticated users. Users CAN view/update/delete their own rows directly,
-- which the review UI uses to mark an item dismissed or to record that it
-- was added to the closet.
CREATE TABLE public.detected_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email_connection_id UUID REFERENCES public.email_connections(id) ON DELETE CASCADE,
  gmail_message_id TEXT NOT NULL,
  merchant TEXT,
  item_name TEXT,
  brand TEXT,
  category TEXT,
  color TEXT,
  price NUMERIC,
  currency TEXT DEFAULT 'USD',
  image_url TEXT,
  purchase_date DATE,
  raw_subject TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'added', 'dismissed')),
  closet_item_id UUID REFERENCES public.closet_items(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT detected_purchases_unique_message UNIQUE (user_id, gmail_message_id)
);
ALTER TABLE public.detected_purchases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own detected purchases" ON public.detected_purchases
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own detected purchases" ON public.detected_purchases
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own detected purchases" ON public.detected_purchases
  FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX idx_detected_purchases_user_status ON public.detected_purchases(user_id, status);
CREATE TRIGGER update_detected_purchases_updated_at BEFORE UPDATE ON public.detected_purchases
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
