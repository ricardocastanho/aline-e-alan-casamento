import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { rsvpSchema, sanitizeName, maxNameLength } from "@/lib/rsvp";

export const saveRsvp = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => rsvpSchema.parse(input))
  .handler(async ({ data }) => {
    const { getGiftTokenHash } = await import("@/lib/gifts.server");
    const tokenHash = await getGiftTokenHash(true);
    if (!tokenHash) return { ok: false as const, reason: "unavailable" as const };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: guestId, error } = await supabaseAdmin.rpc("save_rsvp_with_gift_access", {
      _guest_name: data.guestName,
      _guest_confirmed: data.guestConfirmed,
      _companions: data.companions,
      _token_hash: tokenHash,
    });
    if (error) {
      console.error("save_rsvp failed", error.message);
      return { ok: false as const, reason: "unavailable" as const };
    }
    if (!guestId) return { ok: false as const, reason: "access" as const };
    return { ok: true as const, guestId };
  });

export const getRsvp = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ guestName: z.string().transform(sanitizeName).pipe(z.string().min(1).max(maxNameLength)) }).parse(input),
  )
  .handler(async ({ data }) => {
    const { getGiftTokenHash } = await import("@/lib/gifts.server");
    const tokenHash = await getGiftTokenHash();
    if (!tokenHash) return { ok: false as const, rows: [] };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: normalizedName } = await supabaseAdmin.rpc("normalize_guest_name", { _name: data.guestName });
    if (!normalizedName) return { ok: false as const, rows: [] };
    const { data: host } = await supabaseAdmin.from("guests").select("id").eq("normalized_name", normalizedName).eq("is_companion", false).maybeSingle();
    if (!host) return { ok: false as const, rows: [] };
    const { data: access } = await supabaseAdmin.from("guest_gift_access").select("guest_id").eq("guest_id", host.id).eq("token_hash", tokenHash).maybeSingle();
    if (!access) return { ok: false as const, rows: [] };
    const { data: rows, error } = await supabaseAdmin.rpc("get_rsvp", { _guest_name: data.guestName });
    if (error) return { ok: false as const, rows: [] };
    return { ok: true as const, rows: rows ?? [] };
  });
