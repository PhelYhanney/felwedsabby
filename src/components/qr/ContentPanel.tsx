import { motion, AnimatePresence } from "framer-motion";
import type { ContentState, ContentType } from "@/lib/qr-content";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { FileUploader } from "./FileUploader";

const TYPES: { id: ContentType; label: string; icon: string }[] = [
  { id: "url", label: "URL", icon: "🔗" },
  { id: "text", label: "Text", icon: "📝" },
  { id: "wifi", label: "Wi-Fi", icon: "📶" },
  { id: "vcard", label: "Contact", icon: "👤" },
  { id: "email", label: "Email", icon: "✉️" },
  { id: "phone", label: "Phone", icon: "📞" },
  { id: "sms", label: "SMS", icon: "💬" },
  { id: "geo", label: "Location", icon: "📍" },
  { id: "file", label: "File", icon: "📎" },
];

export function ContentTypeSelector({
  type,
  onChange,
}: {
  type: ContentType;
  onChange: (t: ContentType) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-9">
      {TYPES.map((t) => {
        const active = t.id === type;
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={`group relative flex flex-col items-center gap-1 rounded-xl border p-2 text-xs font-medium transition-all ${
              active
                ? "border-primary bg-primary/10 text-primary shadow-sm"
                : "border-border/60 bg-card/50 text-muted-foreground hover:border-primary/40 hover:text-foreground"
            }`}
          >
            <span className="text-lg">{t.icon}</span>
            <span>{t.label}</span>
            {active && (
              <motion.div
                layoutId="type-pill"
                className="absolute inset-0 -z-10 rounded-xl border border-primary/40"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

export function ContentPanel({
  type,
  content,
  setContent,
}: {
  type: ContentType;
  content: ContentState;
  setContent: (c: ContentState) => void;
}) {
  const upd = <K extends keyof ContentState>(k: K, v: ContentState[K]) =>
    setContent({ ...content, [k]: v });

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={type}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2 }}
        className="space-y-4"
      >
        {type === "url" && (
          <Field label="URL">
            <Input value={content.url} onChange={(e) => upd("url", e.target.value)} placeholder="https://example.com" />
          </Field>
        )}
        {type === "text" && (
          <Field label="Text">
            <Textarea rows={5} value={content.text} onChange={(e) => upd("text", e.target.value)} />
          </Field>
        )}
        {type === "wifi" && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Network name (SSID)">
              <Input value={content.wifi.ssid} onChange={(e) => upd("wifi", { ...content.wifi, ssid: e.target.value })} />
            </Field>
            <Field label="Password">
              <Input type="password" value={content.wifi.password} onChange={(e) => upd("wifi", { ...content.wifi, password: e.target.value })} />
            </Field>
            <Field label="Encryption">
              <Select value={content.wifi.encryption} onValueChange={(v) => upd("wifi", { ...content.wifi, encryption: v as any })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="WPA">WPA / WPA2</SelectItem>
                  <SelectItem value="WEP">WEP</SelectItem>
                  <SelectItem value="nopass">No password</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Hidden network">
              <div className="flex h-10 items-center">
                <Switch checked={content.wifi.hidden} onCheckedChange={(v) => upd("wifi", { ...content.wifi, hidden: v })} />
              </div>
            </Field>
          </div>
        )}
        {type === "vcard" && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="First name"><Input value={content.vcard.firstName} onChange={(e) => upd("vcard", { ...content.vcard, firstName: e.target.value })} /></Field>
            <Field label="Last name"><Input value={content.vcard.lastName} onChange={(e) => upd("vcard", { ...content.vcard, lastName: e.target.value })} /></Field>
            <Field label="Organization"><Input value={content.vcard.org} onChange={(e) => upd("vcard", { ...content.vcard, org: e.target.value })} /></Field>
            <Field label="Phone"><Input value={content.vcard.phone} onChange={(e) => upd("vcard", { ...content.vcard, phone: e.target.value })} /></Field>
            <Field label="Email"><Input value={content.vcard.email} onChange={(e) => upd("vcard", { ...content.vcard, email: e.target.value })} /></Field>
            <Field label="Website"><Input value={content.vcard.url} onChange={(e) => upd("vcard", { ...content.vcard, url: e.target.value })} /></Field>
          </div>
        )}
        {type === "email" && (
          <div className="space-y-4">
            <Field label="To"><Input type="email" value={content.email.to} onChange={(e) => upd("email", { ...content.email, to: e.target.value })} /></Field>
            <Field label="Subject"><Input value={content.email.subject} onChange={(e) => upd("email", { ...content.email, subject: e.target.value })} /></Field>
            <Field label="Body"><Textarea rows={3} value={content.email.body} onChange={(e) => upd("email", { ...content.email, body: e.target.value })} /></Field>
          </div>
        )}
        {type === "phone" && (
          <Field label="Phone number"><Input value={content.phone} onChange={(e) => upd("phone", e.target.value)} placeholder="+1 555 000 0000" /></Field>
        )}
        {type === "sms" && (
          <div className="space-y-4">
            <Field label="Number"><Input value={content.sms.number} onChange={(e) => upd("sms", { ...content.sms, number: e.target.value })} /></Field>
            <Field label="Message"><Textarea rows={3} value={content.sms.message} onChange={(e) => upd("sms", { ...content.sms, message: e.target.value })} /></Field>
          </div>
        )}
        {type === "geo" && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Latitude"><Input value={content.geo.lat} onChange={(e) => upd("geo", { ...content.geo, lat: e.target.value })} /></Field>
            <Field label="Longitude"><Input value={content.geo.lng} onChange={(e) => upd("geo", { ...content.geo, lng: e.target.value })} /></Field>
          </div>
        )}
        {type === "file" && (
          <FileUploader value={content.file} onChange={(v) => upd("file", v)} />
        )}
      </motion.div>
    </AnimatePresence>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}