import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const inputSchema = z.object({
  orderNumber: z.string(),
  customerName: z.string(),
  email: z.string().email(),
  mobile: z.string(),
  address: z.string(),
  city: z.string(),
  state: z.string(),
  pincode: z.string(),
  paymentMethod: z.string(),
  total: z.number(),
  items: z.array(
    z.object({
      name: z.string(),
      quantity: z.number(),
      price: z.number(),
    }),
  ),
});

export const sendOrderEmailToOwner = createServerFn({ method: "POST" })
  .inputValidator((data: z.infer<typeof inputSchema>) => inputSchema.parse(data))
  .handler(async ({ data }) => {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error("[email] RESEND_API_KEY not set");
      return { ok: false, error: "email_not_configured" };
    }

    const itemsHtml = data.items
      .map(
        (i) =>
          `<tr><td style="padding:8px;border-bottom:1px solid #eee">${i.name}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${i.quantity}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:right">₹${i.price * i.quantity}</td></tr>`,
      )
      .join("");

    const html = `
      <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#fff8f0">
        <div style="background:linear-gradient(135deg,#d4a24c,#c94f3a);padding:20px;border-radius:12px;color:#fff;text-align:center">
          <h1 style="margin:0;font-size:22px">🪔 New Order Received</h1>
          <p style="margin:8px 0 0;opacity:.9">Order #${data.orderNumber}</p>
        </div>
        <div style="background:#fff;padding:20px;border-radius:12px;margin-top:16px;box-shadow:0 2px 8px rgba(0,0,0,.05)">
          <h2 style="font-size:16px;margin-top:0">Customer</h2>
          <p style="margin:4px 0"><strong>${data.customerName}</strong></p>
          <p style="margin:4px 0">📧 ${data.email}</p>
          <p style="margin:4px 0">📱 ${data.mobile}</p>
          <h2 style="font-size:16px;margin-top:20px">Shipping Address</h2>
          <p style="margin:4px 0">${data.address}<br/>${data.city}, ${data.state} - ${data.pincode}</p>
          <h2 style="font-size:16px;margin-top:20px">Items</h2>
          <table style="width:100%;border-collapse:collapse">
            <thead><tr style="background:#f6f2ea"><th style="padding:8px;text-align:left">Item</th><th style="padding:8px">Qty</th><th style="padding:8px;text-align:right">Total</th></tr></thead>
            <tbody>${itemsHtml}</tbody>
          </table>
          <div style="margin-top:20px;padding-top:16px;border-top:2px solid #d4a24c;display:flex;justify-content:space-between;font-size:18px;font-weight:bold">
            <span>Total (${data.paymentMethod.toUpperCase()})</span><span>₹${data.total}</span>
          </div>
        </div>
      </div>
    `;

    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          from: "Ganesha Rangoli <onboarding@resend.dev>",
          to: ["info.ganesharangoli@gmail.com"],
          subject: `🪔 New Order #${data.orderNumber} — ₹${data.total}`,
          html,
          reply_to: data.email,
        }),
      });
      if (!res.ok) {
        const body = await res.text();
        console.error(`[email] Resend failed ${res.status}: ${body}`);
        return { ok: false, error: `resend_${res.status}` };
      }
      return { ok: true };
    } catch (e) {
      console.error("[email] send failed", e);
      return { ok: false, error: "send_failed" };
    }
  });
