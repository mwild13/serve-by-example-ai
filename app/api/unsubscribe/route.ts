import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  void req; // id param no longer tracked — toolkit_leads table removed

  return new NextResponse(
    `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Unsubscribed — Serve By Example</title>
  <style>
    body { margin: 0; background: #f5f2e9; font-family: sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
    .card { max-width: 420px; padding: 2.5rem; text-align: center; }
    h1 { font-size: 1.5rem; color: #172f22; margin-bottom: 0.75rem; }
    p { color: #7a9185; font-size: 0.95rem; line-height: 1.6; }
    a { color: #1f4e37; }
  </style>
</head>
<body>
  <div class="card">
    <h1>You have been unsubscribed.</h1>
    <p>You will no longer receive emails from Serve By Example.<br />
    If this was a mistake, <a href="mailto:info@servebyexample.co">contact us</a>.</p>
  </div>
</body>
</html>`,
    {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    }
  );
}
