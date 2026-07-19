import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { first_name, email, role, utm_campaign } = body;

    // 1. Strict Validation Guardrails
    if (!first_name || !email || !role) {
      return NextResponse.json(
        { error: 'Missing mandatory lead profile vectors.' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address structure.' },
        { status: 400 }
      );
    }

    const validRoles = ['owner_operator', 'venue_manager', 'ops_manager'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid industry role assignment.' },
        { status: 400 }
      );
    }

    void utm_campaign; // captured for future use

    // Use a session-scoped ID for email link personalisation (no DB persistence)
    const targetLeadId = crypto.randomUUID();

    // 4. Fire Non-Blocking Verification Email Sequence via Brevo
    if (process.env.BREVO_API_KEY) {
      const brevoApiKey = process.env.BREVO_API_KEY;

      let emailHookText = 'Optimize your operational staff onboarding checklists.';
      if (role === 'venue_manager') {
        emailHookText = 'Protect your site licensing framework and streamline your casual rosters floor execution.';
      } else if (role === 'owner_operator') {
        emailHookText = 'Isolate your labor expenditure risks and protect your bottom line operating standards.';
      }

      // Brevo v3 Transactional Email Endpoint
      fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': brevoApiKey,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          sender: {
            name: 'Serve By Example Resources',
            email: 'info@servebyexample.co',
          },
          to: [{ email: email.toLowerCase().trim(), name: first_name.trim() }],
          subject: `${first_name}, your onboarding compliance template is ready`,
          textContent: `Hi ${first_name},\n\nThank you for downloading the Serve By Example Onboarding Framework.\n\n${emailHookText}\n\nAccess your complete editable Notion SOP toolkit here:\nhttps://servebyexample.co/api/toolkit-open?id=${targetLeadId}\n\nCheers,\n\nMitch\nServe By Example\nservebyexample.co\n\n---\nYou're receiving this because you requested the free toolkit at servebyexample.co/toolkit.\nUnsubscribe: https://servebyexample.co/api/unsubscribe?id=${targetLeadId}`,
        }),
      }).catch((err: unknown) => console.error('[toolkit-capture] Brevo delivery failed:', err));
    } else {
      console.warn('[toolkit-capture] BREVO_API_KEY not configured — email skipped.');
    }

    // 5. Clean success payload response routing back to interface layer
    return NextResponse.json({
      success: true,
      redirect: `/toolkit/success?role=${role}&lead_id=${targetLeadId}`
    });

  } catch (error) {
    console.error('Global capture API pipeline crash:', error);
    return NextResponse.json(
      { error: 'Internal pipeline transmission failure.' },
      { status: 500 }
    );
  }
}