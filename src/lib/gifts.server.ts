import { getCookie, setCookie, setResponseHeader } from "@tanstack/react-start/server";

const cookieName = "wedding-gift-access";

export async function getGiftTokenHash(create = false) {
  setResponseHeader("Cache-Control", "private, no-store");
  let token = getCookie(cookieName);
  if (!token && create) {
    token = crypto.randomUUID() + crypto.randomUUID();
    setCookie(cookieName, token, { httpOnly: true, secure: true, sameSite: "none", partitioned: true, path: "/", maxAge: 60 * 60 * 24 * 365 });
  }
  if (!token) return null;
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function authorizeGiftGuest(guestId: string) {
  const tokenHash = await getGiftTokenHash();
  if (!tokenHash) return null;
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin.from("guest_gift_access").select("guest_id").eq("guest_id", guestId).eq("token_hash", tokenHash).maybeSingle();
  if (error || !data) return null;
  return { supabaseAdmin, tokenHash };
}