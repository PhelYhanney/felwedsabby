import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Moon, Sun, QrCode } from "lucide-react";
import { QRPreview } from "@/components/qr/QRPreview";
import { ContentPanel, ContentTypeSelector } from "@/components/qr/ContentPanel";
import { CustomizationPanel } from "@/components/qr/CustomizationPanel";
import { ExportControls } from "@/components/qr/ExportControls";
import { defaultSettings, type QRSettings } from "@/components/qr/types";
import { buildQrString, defaultContent, type ContentState, type ContentType } from "@/lib/qr-content";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Prism QR — Beautiful QR codes with file sharing" },
      { name: "description", content: "Generate custom-styled QR codes for URLs, Wi-Fi, contacts, and files. Includes secure file hosting with expiry and password protection." },
      { property: "og:title", content: "Prism QR — Beautiful QR codes with file sharing" },
      { property: "og:description", content: "Design gorgeous QR codes with gradients, logos, and file-share links." },
    ],
  }),
  component: Index,
});

function Index() {
  const [type, setType] = useState<ContentType>("url");
  const [content, setContent] = useState<ContentState>(defaultContent);
  const [settings, setSettings] = useState<QRSettings>(defaultSettings);
  const [debounced, setDebounced] = useState(content);
  const [dark, setDark] = useState(false);

  // Debounce content updates (300ms) so typing feels responsive but the QR
  // library doesn't rebuild on every keystroke.
  useEffect(() => {
    const t = setTimeout(() => setDebounced(content), 250);
    return () => clearTimeout(t);
  }, [content]);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", dark);
    }
  }, [dark]);

  const data = useMemo(() => buildQrString(type, debounced), [type, debounced]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 -z-10" style={{ background: "var(--gradient-mesh)" }} />

      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-md" style={{ background: "var(--gradient-primary)" }}>
            <QrCode className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-semibold">Prism QR</div>
            <div className="text-[11px] text-muted-foreground">Beautiful codes · secure files</div>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setDark((d) => !d)} aria-label="Toggle theme">
          {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </header>

      <main className="mx-auto grid max-w-7xl gap-6 px-6 pb-16 lg:grid-cols-[1fr_400px]">
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6 rounded-3xl border bg-card/70 p-6 backdrop-blur-xl"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Craft your QR code</h1>
            <p className="text-sm text-muted-foreground">Pick a content type, style the dots, drop a logo — done.</p>
          </div>

          <ContentTypeSelector type={type} onChange={setType} />

          <Tabs defaultValue="content">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="design">Design</TabsTrigger>
              <TabsTrigger value="export">Export</TabsTrigger>
            </TabsList>
            <TabsContent value="content" className="mt-4">
              <ContentPanel type={type} content={content} setContent={setContent} />
            </TabsContent>
            <TabsContent value="design" className="mt-4">
              <CustomizationPanel settings={settings} setSettings={setSettings} />
            </TabsContent>
            <TabsContent value="export" className="mt-4">
              <ExportControls data={data} settings={settings} />
            </TabsContent>
          </Tabs>
        </motion.section>

        <motion.aside
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-col items-center gap-4 rounded-3xl border bg-card/70 p-6 backdrop-blur-xl lg:sticky lg:top-6 lg:h-fit"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <div className="w-full text-xs font-medium uppercase tracking-wider text-muted-foreground">Live preview</div>
          <QRPreview data={data} settings={settings} />
          <div className="w-full break-all rounded-xl bg-muted/50 p-3 text-[11px] text-muted-foreground">
            {data.slice(0, 140)}{data.length > 140 ? "…" : ""}
          </div>
        </motion.aside>
      </main>
    </div>
  );
}
