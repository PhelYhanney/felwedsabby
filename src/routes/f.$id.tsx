import { createFileRoute, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Download, FileIcon, Lock, Clock, AlertTriangle, QrCode } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getSignedFileUrl } from "@/lib/qr-files.functions";
import { sha256 } from "@/lib/hash";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export const Route = createFileRoute("/f/$id")({
  head: () => ({
    meta: [
      { title: "Download file — Prism QR" },
      { name: "description", content: "Securely download a file shared via Prism QR." },
    ],
  }),
  component: FilePage,
});

interface FileRow {
  id: string;
  storage_path: string;
  filename: string;
  size: number;
  content_type: string | null;
  password_hash: string | null;
  expires_at: string | null;
  max_downloads: number | null;
  download_count: number;
}

function humanSize(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

function FilePage() {
  const { id } = useParams({ from: "/f/$id" });
  const [file, setFile] = useState<FileRow | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState("");
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("qr_files")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error || !data) {
        setError("File not found");
      } else {
        setFile(data as FileRow);
      }
      setLoading(false);
    })();
  }, [id]);

  const expired = file?.expires_at && new Date(file.expires_at) < new Date();
  const capped = file?.max_downloads != null && file.download_count >= file.max_downloads;

  async function handleDownload() {
    if (!file) return;
    if (file.password_hash) {
      const h = await sha256(password);
      if (h !== file.password_hash) {
        toast.error("Incorrect password");
        return;
      }
    }
    setDownloading(true);
    try {
      const { url } = await getSignedFileUrl({
        data: { storagePath: file.storage_path, filename: file.filename },
      });
      // Increment download counter (best-effort; not race-safe by design).
      await supabase
        .from("qr_files")
        .update({ download_count: file.download_count + 1 })
        .eq("id", file.id);
      // Trigger the browser download.
      const a = document.createElement("a");
      a.href = url;
      a.download = file.filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success("Download started");
    } catch (e: any) {
      toast.error(e?.message ?? "Download failed");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4">
      <div className="pointer-events-none absolute inset-0 -z-10" style={{ background: "var(--gradient-mesh)" }} />
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="w-full max-w-md space-y-5 rounded-3xl border bg-card/80 p-8 backdrop-blur-xl"
        style={{ boxShadow: "var(--shadow-elegant)" }}
      >
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg text-white" style={{ background: "var(--gradient-primary)" }}>
            <QrCode className="h-4 w-4" />
          </div>
          Prism QR · file share
        </div>

        {loading && <div className="text-center text-sm text-muted-foreground">Loading…</div>}

        {error && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            <AlertTriangle className="mb-1 inline h-4 w-4" /> {error}
          </div>
        )}

        {file && (
          <>
            <div className="flex items-center gap-3 rounded-2xl border bg-muted/30 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <FileIcon className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold">{file.filename}</div>
                <div className="text-xs text-muted-foreground">
                  {humanSize(file.size)}{file.content_type ? ` · ${file.content_type}` : ""}
                </div>
              </div>
            </div>

            <div className="space-y-1 text-xs text-muted-foreground">
              {file.expires_at && (
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3 w-3" />
                  {expired ? "Expired" : `Expires ${new Date(file.expires_at).toLocaleString()}`}
                </div>
              )}
              {file.max_downloads != null && (
                <div>Downloads: {file.download_count} / {file.max_downloads}</div>
              )}
            </div>

            {file.password_hash && !expired && !capped && (
              <div className="space-y-1.5">
                <label className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                  <Lock className="h-3 w-3" /> Password protected
                </label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                />
              </div>
            )}

            {expired || capped ? (
              <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-center text-sm text-destructive">
                {expired ? "This link has expired." : "Download limit reached."}
              </div>
            ) : (
              <Button
                className="w-full text-white"
                style={{ background: "var(--gradient-primary)" }}
                disabled={downloading}
                onClick={handleDownload}
              >
                <Download className="mr-2 h-4 w-4" />
                {downloading ? "Preparing…" : "Download file"}
              </Button>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}