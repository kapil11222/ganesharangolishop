CREATE TABLE public.hero_slides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text,
  subtitle text,
  eyebrow text,
  image_url text NOT NULL,
  mobile_image_url text,
  cta_label text,
  cta_link text,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.hero_slides TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hero_slides TO authenticated;
GRANT ALL ON public.hero_slides TO service_role;

ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "hero_slides_public_read" ON public.hero_slides
  FOR SELECT TO anon, authenticated
  USING (is_active = true OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "hero_slides_admin_all" ON public.hero_slides
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_hero_slides_updated_at
  BEFORE UPDATE ON public.hero_slides
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.offer_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  occasion text NOT NULL DEFAULT 'general',
  description text,
  badge_text text,
  banner_url text,
  coupon_code text,
  discount_percent numeric,
  cta_link text,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.offer_campaigns TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.offer_campaigns TO authenticated;
GRANT ALL ON public.offer_campaigns TO service_role;

ALTER TABLE public.offer_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "offer_campaigns_public_read" ON public.offer_campaigns
  FOR SELECT TO anon, authenticated
  USING (is_active = true OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "offer_campaigns_admin_all" ON public.offer_campaigns
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_offer_campaigns_updated_at
  BEFORE UPDATE ON public.offer_campaigns
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();