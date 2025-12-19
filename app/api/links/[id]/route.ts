import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import {
  validateLinkData,
  sanitizeString,
  checkRateLimit,
} from "@/lib/validation";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limiting
  const rateLimit = checkRateLimit(`links-patch-${user.id}`, 50, 60000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "X-RateLimit-Remaining": "0" } },
    );
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { title, url, description, is_active } = body;

    // Build update object with only provided fields
    const updateData: Record<string, unknown> = {};

    if (title !== undefined) {
      const validationErrors = validateLinkData({ title });
      if (validationErrors.length > 0) {
        return NextResponse.json(
          { error: "Validation failed", errors: validationErrors },
          { status: 400 },
        );
      }
      updateData.title = sanitizeString(title);
    }

    if (url !== undefined) {
      const validationErrors = validateLinkData({ url });
      if (validationErrors.length > 0) {
        return NextResponse.json(
          { error: "Validation failed", errors: validationErrors },
          { status: 400 },
        );
      }
      updateData.url = url.trim();
    }

    if (description !== undefined) {
      if (description) {
        const validationErrors = validateLinkData({ description });
        if (validationErrors.length > 0) {
          return NextResponse.json(
            { error: "Validation failed", errors: validationErrors },
            { status: 400 },
          );
        }
        updateData.description = sanitizeString(description);
      } else {
        updateData.description = null;
      }
    }

    if (is_active !== undefined) {
      updateData.is_active = Boolean(is_active);
    }

    const { data: link, error } = await supabase
      .from("links")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Link not found" }, { status: 404 });
      }
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

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limiting
  const rateLimit = checkRateLimit(`links-delete-${user.id}`, 50, 60000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "X-RateLimit-Remaining": "0" } },
    );
  }

  const { id } = await params;

  const { error } = await supabase
    .from("links")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    if (error.code === "PGRST116") {
      return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(
    { success: true },
    {
      headers: {
        "X-RateLimit-Remaining": rateLimit.remaining.toString(),
      },
    },
  );
}
