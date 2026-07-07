import { motion } from "framer-motion";
import { useRef } from "react";
import { Palette, Sparkles, Image as ImageIcon, X } from "lucide-react";
import type { DotStyle, EyeDotStyle, EyeStyle, QRSettings } from "./types";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const DOT_STYLES: DotStyle[] = ["square", "rounded", "dots", "extra-rounded", "classy", "classy-rounded"];
const EYE_STYLES: EyeStyle[] = ["square", "extra-rounded", "dot"];
const EYE_DOT_STYLES: EyeDotStyle[] = ["square", "dot"];

export function CustomizationPanel({
  settings,
  setSettings,
}: {
  settings: QRSettings;
  setSettings: (s: QRSettings) => void;
}) {
  const upd = <K extends keyof QRSettings>(k: K, v: QRSettings[K]) =>
    setSettings({ ...settings, [k]: v });
  const logoRef = useRef<HTMLInputElement>(null);

  const onLogoFile = (f: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      upd("logo", reader.result as string);
      if (settings.ecl !== "H") upd("ecl", "H"); // auto-suggest H when logo added
    };
    reader.readAsDataURL(f);
  };

  return (
    <div className="space-y-6">
      <Section title="Colors" icon={<Palette className="h-4 w-4" />}>
        <div className="grid gap-3 sm:grid-cols-2">
          <ColorField label="Foreground" value={settings.fgColor} onChange={(v) => upd("fgColor", v)} />
          {settings.fgGradient && (
            <ColorField label="Gradient stop" value={settings.fgColor2} onChange={(v) => upd("fgColor2", v)} />
          )}
          <ColorField label="Background" value={settings.bgColor} onChange={(v) => upd("bgColor", v)} />
          <ColorField label="Eye color" value={settings.eyeColor || settings.fgColor} onChange={(v) => upd("eyeColor", v)} />
        </div>
        <div className="flex items-center justify-between rounded-xl border p-3">
          <div>
            <div className="text-sm font-medium">Gradient dots</div>
            <div className="text-xs text-muted-foreground">Blend two colors across the QR body</div>
          </div>
          <Switch checked={settings.fgGradient} onCheckedChange={(v) => upd("fgGradient", v)} />
        </div>
        {settings.fgGradient && (
          <Select value={settings.gradientType} onValueChange={(v) => upd("gradientType", v as any)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="linear">Linear</SelectItem>
              <SelectItem value="radial">Radial</SelectItem>
            </SelectContent>
          </Select>
        )}
      </Section>

      <Section title="Style" icon={<Sparkles className="h-4 w-4" />}>
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Dot pattern</Label>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {DOT_STYLES.map((d) => (
              <motion.button
                key={d}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => upd("dotStyle", d)}
                className={`rounded-lg border p-2 text-[10px] capitalize transition-colors ${
                  settings.dotStyle === d ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/40"
                }`}
              >
                <DotSwatch style={d} />
                <div className="mt-1">{d.replace("-", " ")}</div>
              </motion.button>
            ))}
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Eye frame</Label>
            <Select value={settings.eyeStyle} onValueChange={(v) => upd("eyeStyle", v as EyeStyle)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{EYE_STYLES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s.replace("-", " ")}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Eye center</Label>
            <Select value={settings.eyeDotStyle} onValueChange={(v) => upd("eyeDotStyle", v as EyeDotStyle)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{EYE_DOT_STYLES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
      </Section>

      <Section title="Logo" icon={<ImageIcon className="h-4 w-4" />}>
        {settings.logo ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-3 rounded-xl border bg-card p-3"
          >
            <img src={settings.logo} alt="logo" className="h-12 w-12 rounded-lg object-contain" />
            <div className="flex-1 text-xs text-muted-foreground">Logo embedded — using error correction H</div>
            <Button size="icon" variant="ghost" onClick={() => upd("logo", null)}>
              <X className="h-4 w-4" />
            </Button>
          </motion.div>
        ) : (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const f = e.dataTransfer.files?.[0];
              if (f) onLogoFile(f);
            }}
            onClick={() => logoRef.current?.click()}
            className="cursor-pointer rounded-xl border-2 border-dashed border-border/60 bg-muted/30 p-4 text-center text-xs text-muted-foreground hover:border-primary/50 hover:bg-muted/60"
          >
            Drop a PNG / SVG / JPG logo here
            <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && onLogoFile(e.target.files[0])} />
          </div>
        )}
        {settings.logo && (
          <>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Logo size: {Math.round(settings.logoSize * 100)}%</Label>
              <Slider min={10} max={50} step={1} value={[settings.logoSize * 100]} onValueChange={([v]) => upd("logoSize", v / 100)} />
            </div>
            <div className="flex items-center justify-between rounded-xl border p-3">
              <div className="text-sm">White background behind logo</div>
              <Switch checked={settings.logoBg} onCheckedChange={(v) => upd("logoBg", v)} />
            </div>
          </>
        )}
      </Section>

      <Section title="Advanced">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Error correction</Label>
            <Select value={settings.ecl} onValueChange={(v) => upd("ecl", v as any)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="L">L — 7%</SelectItem>
                <SelectItem value="M">M — 15%</SelectItem>
                <SelectItem value="Q">Q — 25%</SelectItem>
                <SelectItem value="H">H — 30% (recommended with logo)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Margin: {settings.margin}px</Label>
            <Slider min={0} max={32} step={1} value={[settings.margin]} onValueChange={([v]) => upd("margin", v)} />
          </div>
        </div>
      </Section>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-semibold">
        {icon}
        {title}
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="flex items-center gap-2 rounded-lg border bg-card px-2 py-1">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-7 w-7 cursor-pointer rounded border-0 bg-transparent p-0"
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-7 border-0 bg-transparent p-0 text-xs shadow-none focus-visible:ring-0"
        />
      </div>
    </div>
  );
}

function DotSwatch({ style }: { style: DotStyle }) {
  // Miniature preview of the dot pattern using CSS grid.
  const pattern = [
    [1, 1, 1, 0, 1],
    [1, 0, 1, 1, 0],
    [1, 1, 0, 1, 1],
    [0, 1, 1, 0, 1],
    [1, 0, 1, 1, 1],
  ];
  const rad =
    style === "dots" ? "9999px" :
    style === "rounded" ? "3px" :
    style === "extra-rounded" ? "5px" :
    style === "classy" || style === "classy-rounded" ? "0 6px 0 6px" : "0";
  return (
    <div className="mx-auto grid grid-cols-5 gap-[2px]" style={{ width: 30, height: 30 }}>
      {pattern.flat().map((v, i) => (
        <div key={i} style={{ background: v ? "currentColor" : "transparent", borderRadius: rad, width: 4, height: 4 }} />
      ))}
    </div>
  );
}