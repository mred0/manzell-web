import { NextResponse } from "next/server";
import { createEnquiry } from "@/lib/db/enquiries";

interface EnquiryPayload {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
  listingId?: string;
  listingTitle?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let payload: EnquiryPayload;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { name, email, phone, message, listingId, listingTitle } = payload;

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return NextResponse.json(
      { error: "Name, email and message are required." },
      { status: 400 }
    );
  }

  if (!EMAIL_RE.test(email.trim())) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  const stored = await createEnquiry({
    listingId: listingId?.trim() || null,
    listingRef: listingTitle?.trim() || null,
    name: name.trim(),
    email: email.trim(),
    phone: phone?.trim() || null,
    message: message.trim(),
  });

  if (!stored) {
    console.log("[enquiry received — Supabase not configured, logging only]", {
      name: name.trim(),
      email: email.trim(),
      phone: phone?.trim() || null,
      message: message.trim(),
      listingRef: listingTitle?.trim() || null,
      receivedAt: new Date().toISOString(),
    });
  }

  return NextResponse.json({ ok: true });
}
