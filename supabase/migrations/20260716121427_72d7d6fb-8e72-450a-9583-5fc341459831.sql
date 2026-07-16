
-- Warehouses
CREATE TABLE public.warehouses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  contact_person text,
  phone text,
  email text,
  address_line1 text NOT NULL,
  address_line2 text,
  city text NOT NULL,
  state text NOT NULL,
  pincode text NOT NULL,
  country text NOT NULL DEFAULT 'India',
  is_default boolean NOT NULL DEFAULT false,
  return_address text,
  return_pincode text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.warehouses TO authenticated;
GRANT ALL ON public.warehouses TO service_role;
ALTER TABLE public.warehouses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage warehouses" ON public.warehouses FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Shipments
CREATE TABLE public.shipments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  warehouse_id uuid REFERENCES public.warehouses(id),
  courier text NOT NULL DEFAULT 'delhivery',
  awb text UNIQUE,
  status text NOT NULL DEFAULT 'pending',
  current_location text,
  expected_delivery date,
  label_url text,
  pickup_id text,
  weight_grams integer,
  length_cm numeric,
  width_cm numeric,
  height_cm numeric,
  payment_mode text NOT NULL DEFAULT 'prepaid',
  cod_amount numeric DEFAULT 0,
  raw_payload jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.shipments TO authenticated;
GRANT ALL ON public.shipments TO service_role;
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage shipments" ON public.shipments FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Users read own shipments" ON public.shipments FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = shipments.order_id AND o.user_id = auth.uid()));

-- Shipment events
CREATE TABLE public.shipment_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id uuid NOT NULL REFERENCES public.shipments(id) ON DELETE CASCADE,
  status text NOT NULL,
  location text,
  remark text,
  event_time timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.shipment_events TO authenticated;
GRANT ALL ON public.shipment_events TO service_role;
ALTER TABLE public.shipment_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage events" ON public.shipment_events FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Users read own events" ON public.shipment_events FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.shipments s JOIN public.orders o ON o.id = s.order_id WHERE s.id = shipment_events.shipment_id AND o.user_id = auth.uid()));

-- Pickup requests
CREATE TABLE public.pickup_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  warehouse_id uuid REFERENCES public.warehouses(id),
  pickup_date date NOT NULL,
  pickup_time text,
  pickup_id text,
  expected_package_count integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'requested',
  raw_payload jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.pickup_requests TO authenticated;
GRANT ALL ON public.pickup_requests TO service_role;
ALTER TABLE public.pickup_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage pickups" ON public.pickup_requests FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- NDR records
CREATE TABLE public.ndr_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id uuid NOT NULL REFERENCES public.shipments(id) ON DELETE CASCADE,
  attempt_no integer NOT NULL DEFAULT 1,
  reason text,
  action text,
  notes text,
  resolved boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.ndr_records TO authenticated;
GRANT ALL ON public.ndr_records TO service_role;
ALTER TABLE public.ndr_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage ndr" ON public.ndr_records FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- COD remittance
CREATE TABLE public.cod_remittance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  awb text NOT NULL,
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  amount numeric NOT NULL,
  collected_at timestamptz,
  remitted_at timestamptz,
  utr text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.cod_remittance TO authenticated;
GRANT ALL ON public.cod_remittance TO service_role;
ALTER TABLE public.cod_remittance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage remittance" ON public.cod_remittance FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Extend products
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS weight_grams integer DEFAULT 300,
  ADD COLUMN IF NOT EXISTS length_cm numeric DEFAULT 20,
  ADD COLUMN IF NOT EXISTS width_cm numeric DEFAULT 20,
  ADD COLUMN IF NOT EXISTS height_cm numeric DEFAULT 3;

-- Extend orders
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS awb text,
  ADD COLUMN IF NOT EXISTS shipping_status text,
  ADD COLUMN IF NOT EXISTS expected_delivery_at date,
  ADD COLUMN IF NOT EXISTS shipping_cost_actual numeric,
  ADD COLUMN IF NOT EXISTS warehouse_id uuid REFERENCES public.warehouses(id);

-- Triggers for updated_at
CREATE TRIGGER trg_warehouses_updated BEFORE UPDATE ON public.warehouses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_shipments_updated BEFORE UPDATE ON public.shipments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_pickups_updated BEFORE UPDATE ON public.pickup_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_ndr_updated BEFORE UPDATE ON public.ndr_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_remit_updated BEFORE UPDATE ON public.cod_remittance FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed default warehouse
INSERT INTO public.warehouses (name, contact_person, phone, address_line1, city, state, pincode, is_default)
VALUES ('Ganesha Rangoli HQ', 'Kapil', '9999999999', 'Address line 1', 'Mumbai', 'Maharashtra', '400001', true);
