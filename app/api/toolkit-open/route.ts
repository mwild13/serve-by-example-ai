import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  void req; // id param no longer tracked — toolkit_leads table removed
  const notionUrl = process.env.NOTION_TOOLKIT_URL ?? 'https://servebyexample.co/toolkit';
  return NextResponse.redirect(notionUrl, { status: 302 });
}
