-- Impressions: every product shown in a For You generation
CREATE TABLE public.rec_impressions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  generation_id UUID NOT NULL,
  category TEXT NOT NULL,
  product_link TEXT NOT NULL,
  product_title TEXT,
  retailer TEXT,
  price NUMERIC,
  shown_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.rec_impressions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own impressions"
  ON public.rec_impressions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own impressions"
  ON public.rec_impressions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own impressions"
  ON public.rec_impressions FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_rec_impressions_user_gen ON public.rec_impressions(user_id, generation_id);
CREATE INDEX idx_rec_impressions_user_link ON public.rec_impressions(user_id, product_link);

-- Dismissals: products the user said "not for me" to
CREATE TABLE public.rec_dismissals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_link TEXT NOT NULL,
  product_title TEXT,
  category TEXT,
  retailer TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_link)
);

ALTER TABLE public.rec_dismissals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own dismissals"
  ON public.rec_dismissals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own dismissals"
  ON public.rec_dismissals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own dismissals"
  ON public.rec_dismissals FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_rec_dismissals_user ON public.rec_dismissals(user_id);