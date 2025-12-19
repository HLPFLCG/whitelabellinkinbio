import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import {
  validateLinkData,
  sanitizeString,
  checkRateLimit,
} from "@/lib/validation";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limiting
  const rateLimit = checkRateLimit(`links-get-${user.id}`, 100, 60000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "X-RateLimit-Remaining": "0" } },
    );
  }

  const { data: links, error } = await supabase
    .from("links")
    .select("*")
    .eq("user_id", user.id)
    .order("position", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(links, {
    headers: {
      "X-RateLimit-Remaining": rateLimit.remaining.toString(),
    },
  });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limiting
  const rateLimit = checkRateLimit(`links-post-${user.id}`, 50, 60000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "X-RateLimit-Remaining": "0" } },
    );
  }

  try {
    const body = await request.json();
    const { title, url, description } = body;

    // Validate input
    const validationErrors = validateLinkData({ title, url, description });
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: "Validation failed", errors: validationErrors },
        { status: 400 },
      );
    }

    // Sanitize inputs
    const sanitizedTitle = sanitizeString(title);
    const sanitizedDescription = description
      ? sanitizeString(description)
      : null;

    // Get current max position
    const { data: maxLink } = await supabase
      .from("links")
      .select("position")
      .eq("user_id", user.id)
      .order("position", { ascending: false })
      .limit(1)
      .single();

    const position = (maxLink?.position || 0) + 1;

    const { data: link, error } = await supabase
      .from("links")
      .insert({
        user_id: user.id,
        title: sanitizedTitle,
        url: url.trim(),
        description: sanitizedDescription,
        position,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(link, {
      headers: {
        "X-RateLimit-Remaining": rateLimit.remaining.toString(),
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }
}
