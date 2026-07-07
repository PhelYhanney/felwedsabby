import { useState } from "react";
import { Download, Copy, Check } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import type { QRSettings } from "./types";
import { buildOptions } from "./QRPreview";

export function ExportControls({ data, settings }: { data: string; settings: QRSettings }) {
  const [size, setSize] = useState(1024);
  const [copied, setCopied] = useState(false);

  async function makeInstance(ext: "png" | "svg" | "jpeg") {
    const mod = await import("qr-code-styling");
    const QRCodeStyling = mod.default;
    const opts = buildOptions(data, settings, size);
    if (ext === "svg") opts.type = "svg";
    return new QRCodeStyling(opts);
  }

  async function download(ext: "png" | "svg" | "jpeg") {
    const qr = await makeInstance(ext);
    await qr.download({ name: `qr-code-${Date.now()}`, extension: ext });
    // Success pulse
    toast.success(`Downloaded ${ext.toUpperCase()}`);
  }

  async function copyPng() {
    try {
      const qr = await makeInstance("png");
      const raw = await qr.getRawData("png");
      if (!raw) throw new Error("no data");
      const blob = raw instanceof Blob ? raw : new Blob([raw as unknown as ArrayBuffer], { type: "image/png" });
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
      toast.success("QR image copied");
    } catch {
      toast.error("Clipboard copy not supported");
    }
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Export resolution: {size}px</Label>
        <Slider min={256} max={2048} step={64} value={[size]} onValueChange={([v]) => setSize(v)} />
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {(["png", "svg", "jpeg"] as const).map((ext) => (
          <motion.div key={ext} whileTap={{ scale: 0.97 }}>
            <Button variant="outline" className="w-full" onClick={() => download(ext)}>
              <Download className="mr-1.5 h-4 w-4" />
              {ext.toUpperCase()}
            </Button>
          </motion.div>
        ))}
        <motion.div whileTap={{ scale: 0.97 }}>
          <Button variant="outline" className="w-full" onClick={copyPng}>
            {copied ? <Check className="mr-1.5 h-4 w-4" /> : <Copy className="mr-1.5 h-4 w-4" />}
            Copy
          </Button>
        </motion.div>
      </div>
    </div>
  );
}