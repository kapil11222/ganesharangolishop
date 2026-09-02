ALTER TABLE public.offer_campaigns
  ADD COLUMN IF NOT EXISTS accent_color text,
  ADD COLUMN IF NOT EXISTS sale_mode boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS priority integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS urgency_text text;

CREATE TABLE IF NOT EXISTS public.offer_reminders (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id uuid NOT NULL REFERENCES public.offer_campaigns(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (campaign_id, user_id)
);

GRANT SELECT, INSERT, DELETE ON public.offer_reminders TO authenticated;
GRANT ALL ON public.offer_reminders TO service_role;
ALTER TABLE public.offer_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own offer reminders"
  ON public.offer_reminders FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view offer reminders"
  ON public.offer_reminders FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));