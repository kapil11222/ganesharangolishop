import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const PIN = /^[0-9]{6}$/;

/** Public: check serviceability + estimated rate */
export const checkPincode = createServerFn({ method: "POST" })
  .inputValidator((input: { pincode: string; weightGrams?: number; codAmount?: number }) =>
    z.object({
      pincode: z.string().regex(PIN),
      weightGrams: z.number().int().min(50).max(50000).optional(),
      codAmount: z.number().min(0).max(500000).optional(),
    }).parse(input)
  )
  .handler(async ({ data }) => {
    const { checkServiceability, calculateRate } = await import("./delhivery-client.server");
    const origin = process.env.DELHIVERY_WAREHOUSE_PINCODE || "411001";
    const svc = await checkServiceability(data.pincode);
    if (!svc.serviceable) return { serviceable: false as const };
    const weight = data.weightGrams ?? 500;
    let prepaidRate: number | null = null;
    let codRate: number | null = null;
    try {
      const r = await calculateRate({ fromPincode: origin, toPincode: data.pincode, weightGrams: weight, paymentType: "Pre-paid" });
      prepaidRate = r.total;
    } catch { /* ignore */ }
    if (svc.cod && (data.codAmount ?? 0) > 0) {
      try {
        const r = await calculateRate({ fromPincode: origin, toPincode: data.pincode, weightGrams: weight, paymentType: "COD", codAmount: data.codAmount });
        codRate = r.total;
      } catch { /* ignore */ }
    }
    return {
      serviceable: true as const,
      city: svc.city,
      state: svc.state,
      cod: svc.cod,
      prepaid: svc.prepaid,
      prepaidRate,
      codRate,
      etaDays: 5,
    };
  });

/** Public: live tracking by AWB or order number */
export const trackByAwb = createServerFn({ method: "POST" })
  .inputValidator((input: { awb: string }) => z.object({ awb: z.string().min(6).max(40) }).parse(input))
  .handler(async ({ data }) => {
    const { trackShipment } = await import("./delhivery-client.server");
    return await trackShipment(data.awb);
  });

/** Admin: create AWB for an order */
export const createOrderShipment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { orderId: string; weightGrams?: number }) =>
    z.object({ orderId: z.string().uuid(), weightGrams: z.number().int().min(50).max(50000).optional() }).parse(input)
  )
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) throw new Error("Forbidden");

    const { data: order, error } = await context.supabase
      .from("orders")
      .select("*")
      .eq("id", data.orderId)
      .maybeSingle();
    if (error) throw error;
    if (!order) throw new Error("Order not found");
    if (order.awb) return { awb: order.awb, alreadyExists: true };

    const originPin = process.env.DELHIVERY_WAREHOUSE_PINCODE || "411001";
    const { createShipment } = await import("./delhivery-client.server");
    const isCOD = String(order.payment_method).toLowerCase() === "cod";
    const result = await createShipment({
      order_number: order.order_number,
      customer_name: order.customer_name,
      address: `${order.address}${order.landmark ? ", " + order.landmark : ""}`,
      city: order.city,
      state: order.state,
      pincode: order.pincode,
      country: order.country || "India",
      mobile: order.mobile,
      email: order.email,
      payment_mode: isCOD ? "COD" : "Prepaid",
      cod_amount: isCOD ? Number(order.total) : 0,
      total_amount: Number(order.total),
      weight_grams: data.weightGrams ?? 500,
      quantity: 1,
      product_name: "Rangoli",
      origin_pincode: originPin,
    });

    await context.supabase.from("shipments").insert({
      order_id: order.id,
      courier: "delhivery",
      awb: result.awb,
      status: "created",
      payment_mode: isCOD ? "cod" : "prepaid",
      cod_amount: isCOD ? Number(order.total) : 0,
      weight_grams: data.weightGrams ?? 500,
      raw_payload: result.raw,
    });
    await context.supabase.from("orders").update({ awb: result.awb, shipping_status: "manifested", status: "confirmed" }).eq("id", order.id);

    return { awb: result.awb, alreadyExists: false };
  });

/** Admin: schedule pickup */
export const requestPickup = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { pickupDate: string; pickupTime: string; expectedCount: number; pickupLocation?: string }) =>
    z.object({
      pickupDate: z.string().min(4),
      pickupTime: z.string().min(4),
      expectedCount: z.number().int().min(1).max(500),
      pickupLocation: z.string().optional(),
    }).parse(input)
  )
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) throw new Error("Forbidden");
    const location = data.pickupLocation || process.env.DELHIVERY_CLIENT_NAME || "";
    const { schedulePickup } = await import("./delhivery-client.server");
    const res = await schedulePickup({
      pickup_date: data.pickupDate,
      pickup_time: data.pickupTime,
      pickup_location: location,
      expected_count: data.expectedCount,
    });
    await context.supabase.from("pickup_requests").insert({
      pickup_date: data.pickupDate,
      pickup_time: data.pickupTime,
      pickup_id: res.pickup_id ? String(res.pickup_id) : null,
      expected_package_count: data.expectedCount,
      status: res.success ? "scheduled" : "requested",
      raw_payload: JSON.parse(JSON.stringify(res)),
    });
    return { pickupId: res.pickup_id ?? null, success: !!res.success };
  });

/** Admin: get waybill PDF URL */
export const getWaybillUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { awb: string }) => z.object({ awb: z.string().min(6) }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) throw new Error("Forbidden");
    const { waybillPdfUrl } = await import("./delhivery-client.server");
    return { url: waybillPdfUrl(data.awb) };
  });
