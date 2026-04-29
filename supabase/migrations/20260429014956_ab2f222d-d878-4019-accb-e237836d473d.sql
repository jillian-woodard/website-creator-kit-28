-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Style profiles
CREATE TABLE public.style_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vibe_description TEXT,
  selected_visual_cues TEXT[] DEFAULT '{}',
  budget_min INTEGER DEFAULT 50,
  budget_max INTEGER DEFAULT 500,
  body_input_method TEXT,
  silhouette_type TEXT,
  manual_measurements JSONB DEFAULT '{}',
  ab_choices INTEGER[] DEFAULT '{}',
  ai_style_brief TEXT,
  ai_keywords TEXT[] DEFAULT '{}',
  ai_silhouettes TEXT[] DEFAULT '{}',
  occasions TEXT[] DEFAULT '{}'::text[],
  category_budgets JSONB DEFAULT '{}'::jsonb,
  shopping_preference TEXT,
  height_inches INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT style_profiles_shopping_preference_check
    CHECK (shopping_preference IS NULL OR shopping_preference IN ('mens', 'womens', 'nonbinary', 'both'))
);
ALTER TABLE public.style_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own style profile" ON public.style_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own style profile" ON public.style_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own style profile" ON public.style_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own style profile" ON public.style_profiles FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER update_style_profiles_updated_at BEFORE UPDATE ON public.style_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Closet items
CREATE TABLE public.closet_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  color TEXT,
  season TEXT[] DEFAULT '{}',
  brand TEXT,
  image_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.closet_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own closet items" ON public.closet_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own closet items" ON public.closet_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own closet items" ON public.closet_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own closet items" ON public.closet_items FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER update_closet_items_updated_at BEFORE UPDATE ON public.closet_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Weekly plans
CREATE TABLE public.weekly_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  city TEXT NOT NULL,
  week_start DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.weekly_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own weekly plans" ON public.weekly_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own weekly plans" ON public.weekly_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own weekly plans" ON public.weekly_plans FOR DELETE USING (auth.uid() = user_id);

-- Plan days
CREATE TABLE public.plan_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES public.weekly_plans(id) ON DELETE CASCADE,
  day_date DATE NOT NULL,
  occasion TEXT,
  weather_temp_high NUMERIC,
  weather_temp_low NUMERIC,
  weather_condition TEXT,
  outfit_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.plan_days ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own plan days" ON public.plan_days
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.weekly_plans WHERE id = plan_days.plan_id AND user_id = auth.uid()));
CREATE POLICY "Users can insert their own plan days" ON public.plan_days
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.weekly_plans WHERE id = plan_days.plan_id AND user_id = auth.uid()));
CREATE POLICY "Users can update their own plan days" ON public.plan_days
  FOR UPDATE USING (EXISTS (SELECT 1 FROM public.weekly_plans WHERE id = plan_days.plan_id AND user_id = auth.uid()));
CREATE POLICY "Users can delete their own plan days" ON public.plan_days
  FOR DELETE USING (EXISTS (SELECT 1 FROM public.weekly_plans WHERE id = plan_days.plan_id AND user_id = auth.uid()));

-- For You recs
CREATE TABLE public.for_you_recs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  recs JSONB NOT NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.for_you_recs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own for_you_recs" ON public.for_you_recs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own for_you_recs" ON public.for_you_recs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own for_you_recs" ON public.for_you_recs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own for_you_recs" ON public.for_you_recs FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER trg_for_you_recs_updated_at BEFORE UPDATE ON public.for_you_recs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Saved items
CREATE TABLE public.saved_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  price NUMERIC,
  currency TEXT NOT NULL DEFAULT 'USD',
  image TEXT,
  link TEXT NOT NULL,
  retailer TEXT,
  category TEXT,
  source_query TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT saved_items_unique_user_link UNIQUE (user_id, link)
);
ALTER TABLE public.saved_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own saved items" ON public.saved_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own saved items" ON public.saved_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own saved items" ON public.saved_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own saved items" ON public.saved_items FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX idx_saved_items_user_created ON public.saved_items(user_id, created_at DESC);
CREATE TRIGGER update_saved_items_updated_at BEFORE UPDATE ON public.saved_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket and policies
INSERT INTO storage.buckets (id, name, public) VALUES ('closet-photos', 'closet-photos', true);
CREATE POLICY "Closet photos are publicly viewable" ON storage.objects FOR SELECT USING (bucket_id = 'closet-photos');
CREATE POLICY "Users can upload closet photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'closet-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update their closet photos" ON storage.objects FOR UPDATE USING (bucket_id = 'closet-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete their closet photos" ON storage.objects FOR DELETE USING (bucket_id = 'closet-photos' AND auth.uid()::text = (storage.foldername(name))[1]);