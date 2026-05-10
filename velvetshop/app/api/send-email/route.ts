import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { giftCardCode, listingDetails, userEmail } = await request.json();

    await resend.emails.send({
      from: "VelvetViper <onboarding@resend.dev>",,
      to: "reptilelizard48@gmail.com",
      subject: "🎟️ Gift Card Used - New Listing Payment",
      html: `
        <h2>Gift Card Payment Received</h2>
        <p><strong>Gift Card Code:</strong> ${giftCardCode}</p>
        <p><strong>Used By:</strong> ${userEmail}</p>
        <hr/>
        <h3>Listing Details:</h3>
        <p><strong>Species:</strong> ${listingDetails.species}</p>
        <p><strong>Name:</strong> ${listingDetails.name || 'N/A'}</p>
        <p><strong>Location:</strong> ${listingDetails.location}</p>
        <p><strong>Country:</strong> ${listingDetails.country}</p>
        <p><strong>Contact:</strong> ${listingDetails.contact}</p>
        <hr/>
        <p>Go to Admin Dashboard to review and approve this listing.</p>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: "Failed to send email" }, { status: 500 });
  }
}