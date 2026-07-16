// Delhivery HTTP client — server-only.
// Uses Production endpoints (track.delhivery.com).

const BASE = "https://track.delhivery.com";

function authHeader() {
  const token = process.env.DELHIVERY_API_TOKEN;
  if (!token) throw new Error("DELHIVERY_API_TOKEN not configured");
  return `Token ${token}`;
}

async function jsonGet<T = unknown>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { Authorization: authHeader(), Accept: "application/json" },
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Delhivery ${res.status}: ${text.slice(0, 300)}`);
  try { return JSON.parse(text) as T; } catch { return text as unknown as T; }
}

/** Pincode serviceability */
export async function checkServiceability(pincode: string) {
  const data = await jsonGet<{ delivery_codes?: Array<{ postal_code?: { pin?: number; district?: string; state_code?: string; city?: string; cod?: string; pre_paid?: string; cash?: string; pickup?: string; repl?: string; covid_zone?: string } }> }>(
    `/c/api/pin-codes/json/?filter_codes=${encodeURIComponent(pincode)}`
  );
  const entry = data.delivery_codes?.[0]?.postal_code;
  if (!entry?.pin) return { serviceable: false as const };
  return {
    serviceable: true as const,
    pincode: String(entry.pin),
    city: entry.city ?? entry.district ?? "",
    state: entry.state_code ?? "",
    cod: entry.cod === "Y",
    prepaid: entry.pre_paid === "Y",
    pickup: entry.pickup === "Y",
  };
}

/** Live shipping rate estimate */
export async function calculateRate(params: {
  fromPincode: string;
  toPincode: string;
  weightGrams: number;
  paymentType: "COD" | "Pre-paid";
  codAmount?: number;
}) {
  const q = new URLSearchParams({
    md: "E",
    ss: "Delivered",
    d_pin: params.toPincode,
    o_pin: params.fromPincode,
    cgm: String(Math.max(500, params.weightGrams || 500)),
    pt: params.paymentType,
    cod: String(params.codAmount ?? 0),
  });
  const data = await jsonGet<Array<{ total_amount?: number; gross_amount?: number; charge_DL?: number; charge_COD?: number }>>(`/api/kinko/v1/invoice/charges/.json?${q.toString()}`);
  const first = Array.isArray(data) ? data[0] : undefined;
  const total = first?.total_amount ?? first?.gross_amount;
  if (typeof total !== "number") throw new Error("Rate unavailable for this route");
  return { total: Math.round(total), breakdown: first };
}

/** Track by AWB */
export async function trackShipment(awb: string) {
  const data = await jsonGet<{ ShipmentData?: Array<{ Shipment?: {
    Status?: { Status?: string; StatusLocation?: string; StatusDateTime?: string; Instructions?: string };
    Scans?: Array<{ ScanDetail?: { Scan?: string; ScanDateTime?: string; ScannedLocation?: string; Instructions?: string; StatusDateTime?: string } }>;
    ExpectedDeliveryDate?: string;
    AWB?: string;
    Origin?: string;
    Destination?: string;
  } }> }>(`/api/v1/packages/json/?waybill=${encodeURIComponent(awb)}`);
  const s = data.ShipmentData?.[0]?.Shipment;
  if (!s) return null;
  return {
    awb: s.AWB ?? awb,
    status: s.Status?.Status ?? "In Transit",
    currentLocation: s.Status?.StatusLocation ?? "",
    remark: s.Status?.Instructions ?? "",
    expectedDelivery: s.ExpectedDeliveryDate ?? null,
    origin: s.Origin ?? "",
    destination: s.Destination ?? "",
    events: (s.Scans ?? []).map((x) => ({
      status: x.ScanDetail?.Scan ?? "",
      location: x.ScanDetail?.ScannedLocation ?? "",
      remark: x.ScanDetail?.Instructions ?? "",
      time: x.ScanDetail?.StatusDateTime ?? x.ScanDetail?.ScanDateTime ?? "",
    })),
  };
}

/** Create shipment / generate AWB */
export async function createShipment(payload: {
  order_number: string;
  customer_name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  mobile: string;
  email?: string;
  payment_mode: "Prepaid" | "COD";
  cod_amount: number;
  total_amount: number;
  weight_grams: number;
  quantity: number;
  product_name: string;
  origin_pincode: string;
  return_address?: string;
  return_pincode?: string;
}) {
  const client = process.env.DELHIVERY_CLIENT_NAME;
  if (!client) throw new Error("DELHIVERY_CLIENT_NAME not configured");

  const body = {
    shipments: [{
      name: payload.customer_name,
      add: payload.address,
      pin: payload.pincode,
      city: payload.city,
      state: payload.state,
      country: payload.country || "India",
      phone: payload.mobile,
      order: payload.order_number,
      payment_mode: payload.payment_mode,
      return_pin: payload.return_pincode || payload.origin_pincode,
      return_city: "",
      return_phone: "",
      return_add: payload.return_address || "",
      return_state: "",
      return_country: "India",
      products_desc: payload.product_name,
      hsn_code: "",
      cod_amount: payload.payment_mode === "COD" ? String(payload.cod_amount) : "0",
      order_date: new Date().toISOString().slice(0, 10),
      total_amount: String(payload.total_amount),
      seller_add: "",
      seller_name: client,
      seller_inv: "",
      quantity: String(payload.quantity),
      waybill: "",
      shipment_width: "10",
      shipment_height: "10",
      weight: String(payload.weight_grams),
      seller_gst_tin: "",
      shipping_mode: "Surface",
      address_type: "home",
    }],
    pickup_location: { name: client },
  };

  const form = new URLSearchParams();
  form.set("format", "json");
  form.set("data", JSON.stringify(body));

  const res = await fetch(`${BASE}/api/cmu/create.json`, {
    method: "POST",
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: form.toString(),
  });
  const text = await res.text();
  let json: { success?: boolean; packages?: Array<{ waybill?: string; status?: string; remarks?: string[] }>; rmk?: string } = {};
  try { json = JSON.parse(text); } catch { throw new Error(`Delhivery create ${res.status}: ${text.slice(0, 300)}`); }
  const pkg = json.packages?.[0];
  if (!pkg?.waybill) throw new Error(pkg?.remarks?.join("; ") || json.rmk || "AWB not generated");
  return { awb: pkg.waybill, raw: json };
}

/** Schedule pickup at warehouse */
export async function schedulePickup(params: { pickup_date: string; pickup_time: string; expected_count: number; pickup_location: string }) {
  const res = await fetch(`${BASE}/fm/request/new/`, {
    method: "POST",
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      pickup_time: params.pickup_time,
      pickup_date: params.pickup_date,
      pickup_location: params.pickup_location,
      expected_package_count: params.expected_count,
    }),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Delhivery pickup ${res.status}: ${text.slice(0, 300)}`);
  return JSON.parse(text) as { pickup_id?: number | string; success?: boolean };
}

export function waybillPdfUrl(awb: string) {
  return `${BASE}/api/p/packing_slip?wbns=${encodeURIComponent(awb)}&pdf=true`;
}
