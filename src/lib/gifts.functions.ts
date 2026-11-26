import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { giftSelectionSchema } from "@/lib/gifts";

export const getGiftExperience = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ guestId: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    const { authorizeGiftGuest } = await import("@/lib/gifts.server");
    const access = await authorizeGiftGuest(data.guestId);
    if (!access) return { ok: false as const, reason: "access" as const };
    const [guest, companions, gifts, selections] = await Promise.all([
      access.supabaseAdmin.from("guests").select("name, confirmed").eq("id", data.guestId).eq("is_companion", false).maybeSingle(),
      access.supabaseAdmin.from("guests").select("name, confirmed").eq("host_guest_id", data.guestId).order("created_at"),
      access.supabaseAdmin.from("gifts").select("id, name, description, price_cents, image_url, sort_order").eq("active", true).order("sort_order").order("price_cents"),
      access.supabaseAdmin.from("gift_selections").select("gift_id, price_cents_at_selection, payment_status, gifts(name)").eq("guest_id", data.guestId).in("payment_status", ["pending", "paid"]),
    ]);
    if (guest.error || companions.error || gifts.error || selections.error) return { ok: false as const, reason: "unavailable" as const };
    if (!guest.data) return { ok: false as const, reason: "access" as const };
    return { ok: true as const, guest: guest.data, companions: companions.data ?? [], gifts: gifts.data ?? [], selections: selections.data ?? [] };
  });

export const saveGiftSelection = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => giftSelectionSchema.parse(input))
  .handler(async ({ data }) => {
    const { authorizeGiftGuest } = await import("@/lib/gifts.server");
    const access = await authorizeGiftGuest(data.guestId);
    if (!access) return { ok: false as const };
    const { data: saved, error } = await access.supabaseAdmin.rpc("replace_gift_selections", { _guest_id: data.guestId, _token_hash: access.tokenHash, _gift_ids: data.giftIds });
    return { ok: !error && saved === true };
  });