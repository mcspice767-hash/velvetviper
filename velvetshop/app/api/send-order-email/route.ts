import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { order } = await req.json();

    const itemRows = order.items
      .map(
        (item: any) =>
          `<tr>
            <td style="padding:10px 0;border-bottom:1px solid #1a1a1a;color:#aaa;font-size:0.85rem;">${item.species} — ${item.name || "Unnamed"}</td>
            <td style="padding:10px 0;border-bottom:1px solid #1a1a1a;color:#aaa;font-size:0.85rem;text-align:right;">×${item.quantity}</td>
            <td style="padding:10px 0;border-bottom:1px solid #1a1a1a;color:#c8ff00;font-size:0.85rem;font-weight:700;text-align:right;">$${(item.price * item.quantity).toFixed(2)}</td>
          </tr>`
      )
      .join("");

    const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#080808;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#080808;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:540px;background:#0f0f0f;border:1px solid #1c1c1c;border-radius:24px;overflow:hidden;">

        <!-- Header -->
        <tr>
          <td style="padding:36px;text-align:center;border-bottom:1px solid #1c1c1c;">
            <div style="font-size:2.5rem;margin-bottom:10px;">🐍</div>
            <h1 style="margin:0;font-size:1.4rem;font-weight:800;color:#e8e0d0;letter-spacing:-0.02em;">VELVETVIPER</h1>
          </td>
        </tr>

        <!-- Success -->
        <tr>
          <td style="padding:36px;text-align:center;border-bottom:1px solid #1c1c1c;">
            <div style="width:60px;height:60px;border-radius:50%;background:rgba(200,255,0,0.1);border:2px solid rgba(200,255,0,0.3);margin:0 auto 16px;display:flex;align-items:center;justify-content:center;font-size:1.5rem;">✓</div>
            <h2 style="margin:0 0 8px;font-size:1.5rem;font-weight:700;color:#e8e0d0;">Order Confirmed!</h2>
            <p style="margin:0;font-size:0.88rem;color:#555;">Order <span style="color:#c8ff00;font-weight:700;">#${order.id.slice(0, 8).toUpperCase()}</span></p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px;">
            <p style="margin:0 0 24px;font-size:0.9rem;color:#666;line-height:1.7;">Hi <strong style="color:#e8e0d0;">${order.customer_name}</strong>, thank you for your order! Please complete your payment via <strong style="color:#c8ff00;">${order.payment_method}</strong> on WhatsApp to confirm your purchase.</p>

            <!-- Items -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
              <tr><td colspan="3" style="padding-bottom:10px;font-size:0.75rem;font-weight:600;color:#555;text-transform:uppercase;letter-spacing:0.08em;">Your Reptiles</td></tr>
              ${itemRows}
              <tr>
                <td colspan="2" style="padding-top:16px;font-size:1rem;font-weight:700;color:#e8e0d0;">Total</td>
                <td style="padding-top:16px;font-size:1.2rem;font-weight:800;color:#c8ff00;text-align:right;">$${order.total.toFixed(2)}</td>
              </tr>
            </table>

            <!-- Delivery -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#080808;border:1px solid #1a1a1a;border-radius:14px;padding:16px;margin-bottom:24px;">
              <tr><td style="padding-bottom:12px;font-size:0.75rem;font-weight:600;color:#555;text-transform:uppercase;letter-spacing:0.08em;">Delivery Details</td></tr>
              <tr><td style="font-size:0.82rem;color:#666;padding:3px 0;">📍 ${order.shipping_address}</td></tr>
              <tr><td style="font-size:0.82rem;color:#666;padding:3px 0;">📞 ${order.customer_phone}</td></tr>
              ${order.delivery_notes ? `<tr><td style="font-size:0.82rem;color:#666;padding:3px 0;">📝 ${order.delivery_notes}</td></tr>` : ""}
            </table>

            <p style="margin:0;font-size:0.8rem;color:#444;line-height:1.7;">Questions? Contact us on WhatsApp or email <a href="mailto:support@velvetviper.com" style="color:#c8ff00;">support@velvetviper.com</a></p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:20px 36px;border-top:1px solid #1c1c1c;text-align:center;">
            <p style="margin:0;font-size:0.72rem;color:#2a2a2a;">© 2026 VelvetViper · All rights reserved</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

    // Send via Resend (https://resend.com - free tier: 100 emails/day)
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey && order.customer_email) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: "VelvetViper <orders@velvetviper.com>",
          to: [order.customer_email],
          subject: `Order Confirmed — #${order.id.slice(0, 8).toUpperCase()}`,
          html,
        }),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Email error:", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}