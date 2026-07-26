import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, FileIcon, Copy, Check, Loader2, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { sha256 } from "@/lib/hash";

const MAX_SIZE = 100 * 1024 * 1024; // 100 MB

type ExpiryChoice = "1h" | "24h" | "7d" | "never";

function humanSize(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

function expiryToDate(c: ExpiryChoice): string | null {
  const now = Date.now();
  switch (c) {
    case "1h": return new Date(now + 3600e3).toISOString();
    case "24h": return new Date(now + 24 * 3600e3).toISOString();
    case "7d": return new Date(now + 7 * 24 * 3600e3).toISOString();
    case "never": return null;
  }
}

export function FileUploader({
  value,
  onChange,
}: {
  value: string;
  onChange: (link: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [copied, setCopied] = useState(false);
  const [password, setPassword] = useState("");
  const [expiry, setExpiry] = useState<ExpiryChoice>("7d");
  const [maxDownloads, setMaxDownloads] = useState<string>("");

  async function upload(f: File) {
    if (f.size > MAX_SIZE) {
      toast.error("File exceeds 100 MB limit");
      return;
    }
    setFile(f);
    setUploading(true);
    setProgress(10);
    try {
      const id = crypto.randomUUID();
      const ext = f.name.includes(".") ? f.name.split(".").pop() : "";
      const storagePath = `${id}${ext ? "." + ext : ""}`;
      // Progress is coarse — Supabase JS doesn't stream upload progress.
      const upTimer = setInterval(() => setProgress((p) => Math.min(p + 8, 85)), 200);
      const { error: upErr } = await supabase.storage
        .from("qr-files")
        .upload(storagePath, f, { contentType: f.type, upsert: false });
      clearInterval(upTimer);
      if (upErr) throw upErr;
      setProgress(92);
      const password_hash = password ? await sha256(password) : null;
      const { data: row, error: dbErr } = await supabase
        .from("qr_files")
        .insert({
          storage_path: storagePath,
          filename: f.name,
          size: f.size,
          content_type: f.type || null,
          password_hash,
          expires_at: expiryToDate(expiry),
          max_downloads: maxDownloads ? Number(maxDownloads) : null,
        })
        .select("id")
        .single();
      if (dbErr) throw dbErr;
      const link = `${window.location.origin}/f/${row.id}`;
      onChange(link);
      setProgress(100);
      // Subtle success pulse via toast.
      toast.success("File ready — QR link generated");
    } catch (e: any) {
      toast.error(e?.message ?? "Upload failed");
      setFile(null);
      onChange("");
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 800);
    }
  }

  return (
    <div className="space-y-4">
      <motion.div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const f = e.dataTransfer.files?.[0];
          if (f) upload(f);
        }}
        onClick={() => inputRef.current?.click()}
        animate={{
          borderColor: dragging ? "hsl(var(--primary))" : undefined,
          boxShadow: dragging ? "0 0 0 4px oklch(0.62 0.22 295 / 0.15)" : "0 0 0 0px transparent",
        }}
        className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border/60 bg-muted/30 px-6 py-10 text-center transition-colors hover:border-primary/50 hover:bg-muted/60"
      >
        <UploadCloud className="h-10 w-10 text-muted-foreground" />
        <div className="text-sm font-medium">
          {dragging ? "Drop to upload" : "Click or drag a file to upload"}
        </div>
        <div className="text-xs text-muted-foreground">Max 100 MB · any file type</div>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) upload(f);
          }}
        />
      </motion.div>

      <AnimatePresence>
        {(uploading || progress > 0) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-3 rounded-xl border bg-card p-3">
              {uploading ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : <Check className="h-4 w-4 text-primary" />}
              <div className="flex-1">
                <div className="text-xs font-medium">{file?.name}</div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: "var(--gradient-primary)" }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.2 }}
                  />
                </div>
              </div>
              <div className="text-xs text-muted-foreground">{file ? humanSize(file.size) : ""}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Expires</Label>
          <Select value={expiry} onValueChange={(v) => setExpiry(v as ExpiryChoice)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">1 hour</SelectItem>
              <SelectItem value="24h">24 hours</SelectItem>
              <SelectItem value="7d">7 days</SelectItem>
              <SelectItem value="never">Never</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Max downloads</Label>
          <Input type="number" min={1} placeholder="Unlimited" value={maxDownloads} onChange={(e) => setMaxDownloads(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">
            <Lock className="mr-1 inline h-3 w-3" />Password
          </Label>
          <Input type="password" placeholder="Optional" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
      </div>

      {value && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 rounded-xl border bg-card p-3"
        >
          <FileIcon className="h-4 w-4 text-primary" />
          <div className="flex-1 truncate text-xs">{value}</div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              navigator.clipboard.writeText(value);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
              toast.success("Link copied");
            }}
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </motion.div>
      )}
    </div>
  );
}