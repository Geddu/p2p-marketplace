import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: "Email and code are required" },
        { status: 400 }
      );
    }

    // Get the current user's session
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the inviter's profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("user_id", session.user.id)
      .single();

    // Here you would integrate with your email service (e.g., Resend, SendGrid, etc.)
    // For example with Resend:
    /*
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: "P2P Marketplace <noreply@your-domain.com>",
      to: email,
      subject: "You've been invited to P2P Marketplace!",
      html: `
        <h1>You've been invited to P2P Marketplace!</h1>
        <p>${profile?.full_name || 'Someone'} has invited you to join P2P Marketplace.</p>
        <p>Your invite code is: <strong>${code}</strong></p>
        <p>Click <a href="${process.env.NEXT_PUBLIC_APP_URL}/auth">here</a> to sign up.</p>
      `,
    });
    */

    // For now, we'll just log the email content
    console.log(`Would send email to ${email} with code ${code}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending invite email:", error);
    return NextResponse.json(
      { error: "Failed to send invite email" },
      { status: 500 }
    );
  }
}
