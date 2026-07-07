import { createServerFn } from "@tanstack/react-start";

// Returns a short-lived signed URL for a private storage object.
// Public route, safe: the caller must already know the file id/path,
// and the download page enforces password / expiry / count limits.
export const getSignedFileUrl = createServerFn({ method: "POST" })
  .inputValidator((data: { storagePath: string; filename: string }) => data)
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: signed, error } = await supabaseAdmin.storage
      .from("qr-files")
      .createSignedUrl(data.storagePath, 60 * 5, { download: data.filename });
    if (error || !signed) throw new Error(error?.message ?? "Failed to sign URL");
    return { url: signed.signedUrl };
  });