import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { QrCode, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in or create an account — Prism QR" },
      { name: "description", content: "Create a free Prism QR account to save your QR codes, shared files, and profile details." },
      { property: "og:title", content: "Sign in or create an account — Prism QR" },
      { property: "og:description", content: "Create a free Prism QR account to save your QR codes and shared files." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/", replace: true });
  }, [user, loading, navigate]);

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Welcome back");
    navigate({ to: "/", replace: true });
  }

  async function signUp(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: { display_name: displayName },
      },
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    if (!data.session) {
      setSent(true);
      toast.success("Check your email to confirm your account");
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 text-foreground">
      <div className="pointer-events-none absolute inset-0 -z-10" style={{ background: "var(--gradient-mesh)" }} />
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-3xl border bg-card/70 p-6 backdrop-blur-xl"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <Link to="/" className="mb-6 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-md" style={{ background: "var(--gradient-primary)" }}>
            <QrCode className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-semibold">Prism QR</div>
            <div className="text-[11px] text-muted-foreground">Beautiful codes · secure files</div>
          </div>
        </Link>

        {sent ? (
          <div className="space-y-3 text-center">
            <h1 className="text-xl font-bold">Confirm your email</h1>
            <p className="text-sm text-muted-foreground">
              We sent a confirmation link to <span className="font-medium text-foreground">{email}</span>. Click it to activate your account.
            </p>
            <Button variant="ghost" onClick={() => setSent(false)}>Back</Button>
          </div>
        ) : (
          <Tabs defaultValue="signup">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signup">Create account</TabsTrigger>
              <TabsTrigger value="signin">Sign in</TabsTrigger>
            </TabsList>

            <TabsContent value="signup" className="mt-5">
              <form className="space-y-4" onSubmit={signUp}>
                <div className="space-y-1.5">
                  <Label htmlFor="su-name">Display name</Label>
                  <Input id="su-name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Ada Lovelace" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="su-email">Email</Label>
                  <Input id="su-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="su-pass">Password</Label>
                  <Input id="su-pass" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" minLength={6} required />
                </div>
                <Button type="submit" className="w-full" disabled={busy}>
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create account"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signin" className="mt-5">
              <form className="space-y-4" onSubmit={signIn}>
                <div className="space-y-1.5">
                  <Label htmlFor="si-email">Email</Label>
                  <Input id="si-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="si-pass">Password</Label>
                  <Input id="si-pass" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <Button type="submit" className="w-full" disabled={busy}>
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        )}
        <p className="mt-5 text-center text-xs text-muted-foreground">
          An account is optional — you can keep using the generator without one.
        </p>
      </motion.div>
    </div>
  );
}
