import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, venueName, venueType, message, website } = body;

    // Honeypot — bots fill this invisible field
    if (website) {
      return Response.json({ ok: true });
    }

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return Response.json(
        { error: "Name, email and message are required." },
        { status: 400 },
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return Response.json({ error: "Invalid email address." }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from("contact_requests").insert({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      venue_name: venueName?.trim() || null,
      venue_type: venueType || null,
      message: message.trim(),
    });

    if (error) throw error;

    return Response.json({ ok: true });
  } catch (err) {
    console.error("Contact API error:", err);
    return Response.json(
      {
        error:
          "Could not save your message. Please email us directly at info@serve-by-example.com.",
      },
      { status: 500 },
    );
  }
}
