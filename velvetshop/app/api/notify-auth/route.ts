import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { type, email, timestamp } = await request.json();

    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: "VelvetViper <onboarding@resend.dev>",
      to: "reptilelizard48@gmail.com",
      subject: type === "signup"
        ? "🐍 New User Signed Up - VelvetViper"
        : "👤 User Logged In - VelvetViper",
      html: `
        <h2>${type === "signup" ? "New User Registration" : "User Login"}</h2>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Time:</strong> ${timestamp}</p>
        <p>Login to Admin Dashboard to manage listings.</p>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: true }); // Don't block signup if email fails
  }
}